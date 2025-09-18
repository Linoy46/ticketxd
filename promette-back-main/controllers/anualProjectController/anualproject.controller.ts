import { Request, Response } from "express";
import { promette, sequelize } from '../../models/database.models';
import { Op, Transaction } from "sequelize";
import jwt from "jsonwebtoken";



const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[DEBUG] ${new Date().toISOString()} - ${message}`,
        ...args
      );
    }
  },
};

/**
 * Helpers para respuestas estandarizadas
 */
const responseHelpers = {
  success: (
    res: Response,
    data: any,
    message: string = "Operación exitosa"
  ) => {
    return res.status(200).json({
      success: true,
      msg: message,
      ...data,
    });
  },
  badRequest: (res: Response, message: string = "Solicitud inválida") => {
    return res.status(400).json({
      success: false,
      msg: message,
    });
  },
  notFound: (res: Response, message: string = "Recurso no encontrado") => {
    return res.status(404).json({
      success: false,
      msg: message,
    });
  },
  serverError: (res: Response, error: any) => {
    logger.error("Error en servidor:", error);
    return res.status(500).json({
      success: false,
      msg: "Error interno del servidor",
      error: error.message || "Error desconocido",
    });
  },
};

const includeOptions = {
  getTechoInclude: () => {
    console.log("getTechoInclude called, promette models:", {
      dt_techo_presupuesto: !!promette?.dt_techo_presupuesto,
      rl_area_financiero: !!promette?.rl_area_financiero,
      ct_area: !!promette?.ct_area,
      ct_capitulo: !!promette?.ct_capitulo,
      ct_financiamiento: !!promette?.ct_financiamiento,
    });

    return {
      model: promette.dt_techo_presupuesto,
      as: "dt_techo",
      include: [
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          attributes: [
            "id_area_fin",
            "id_financiero",
            "id_area_infra",
            "createdAt",
            "updatedAt",
          ],
        },
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "nombre_capitulo", "clave_capitulo"],
        },
        {
          model: promette.ct_financiamiento,
          as: "ct_financiamiento",
          attributes: ["id_financiamiento", "nombre_financiamiento"],
        },
      ],
    };
  },
};

/**
 * Obtiene todos los proyectos anuales
 */
export const getAllProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    logger.info("Obteniendo todos los proyectos anuales");

    // Obtener el ID del usuario del token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    let userId = null;
    
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        userId = decoded.id;
      } catch (err) {
        console.error("Error al decodificar el token:", err);
      }
    }

    if (!userId) {
      return res.status(401).json({ success: false, msg: "Usuario no autenticado" });
    }

    logger.info(`🔍 Usuario autenticado: ${userId}`);

    // ✅ MODIFICACIÓN: Obtener TODOS los puestos activos del usuario
    const puestosUsuario = await promette.rl_usuario_puesto.findAll({
      where: { 
        ct_usuario_id: userId,
        estado: 1
        // Removido periodo_final: null para obtener todos los puestos activos
      },
      include: [
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["id_puesto", "nombre_puesto", "ct_area_id"]
        }
      ]
    });

    logger.info(`📋 Puestos encontrados para usuario ${userId}: ${puestosUsuario.length}`);

    if (puestosUsuario.length === 0) {
      return res.status(404).json({ success: false, msg: "Usuario sin puestos asignados" });
    }

    // Extraer todos los IDs de puestos y áreas
    const puestosIds = puestosUsuario.map((p: any) => p.ct_puesto.id_puesto);
    const areasIds = puestosUsuario
      .map((p: any) => p.ct_puesto.ct_area_id)
      .filter((id: any) => typeof id === 'number');

    logger.info(`Usuario ${userId} - Puestos: ${puestosIds.join(', ')}, Áreas: ${areasIds.join(', ')}`);

    // Lógica de filtrado según los puestos
    let whereClause: any = {};
    let areasFiltradas: number[] = [];

    // Verificar si el usuario tiene el puesto 1806 (jefe financiero)
    const isFinancialHead = puestosIds.includes(1806);
    
    if (isFinancialHead) {
      // ✅ CORRECCIÓN: Puesto 1806 muestra TODO (sin filtros) - igual que en techos presupuestales
      logger.info("🔓 Puesto 1806 - Mostrando todos los proyectos (sin filtros)");
      // No aplicar filtros, whereClause se mantiene vacío para mostrar todo
      
    } else if (puestosIds.includes(258)) {
      // Analista (puesto 258): mostrar solo las unidades asignadas en rl_analista_unidad
      logger.info("👤 Usuario es analista (puesto 258) - Buscando áreas asignadas");
      
      const areasAnalista = await promette.rl_analista_unidad.findAll({
        where: { 
          ct_usuario_id: userId,
          estado: 1 
        },
        attributes: ['rl_area_financiero']
      });

      areasFiltradas = areasAnalista.map((area: any) => area.rl_area_financiero);
      
      logger.info(`👤 Analista - Áreas encontradas en rl_analista_unidad: ${areasFiltradas.join(', ')}`);
      
      if (areasFiltradas.length === 0) {
        logger.info("⚠️ Analista sin áreas asignadas - Mostrando todos los proyectos");
        // No aplicar filtros, mostrar todo
      } else {
        // Filtrar proyectos por áreas asignadas al analista
        whereClause = {
          '$dt_techo.ct_area_id$': areasFiltradas
        };
        logger.info(`👤 Analista - Filtro aplicado: ${JSON.stringify(whereClause)}`);
      }
    } else {
      // ✅ MODIFICACIÓN: Otros usuarios - mostrar todas las áreas de todos sus puestos
      logger.info("👤 Usuario regular - Procesando múltiples áreas");
      
      if (areasIds.length > 0) {
        // Buscar todas las relaciones financieras para todas las áreas del usuario
        logger.info(`🔍 Buscando relaciones financieras para áreas: ${areasIds.join(', ')}`);
        
        const areasFinancieras = await promette.rl_area_financiero.findAll({
          where: { id_area_infra: areasIds }
        });

        logger.info(`📊 Relaciones financieras encontradas: ${areasFinancieras.length}`);

        if (areasFinancieras.length > 0) {
          areasFiltradas = areasFinancieras.map((area: any) => area.id_area_fin);
          whereClause = {
            '$dt_techo.ct_area_id$': areasFiltradas
          };
          logger.info(`Usuario regular - Áreas financieras: ${areasFiltradas.join(', ')}`);
          logger.info(`Usuario regular - Filtro aplicado: ${JSON.stringify(whereClause)}`);
        } else {
          logger.warn("⚠️ No se encontraron relaciones financieras para las áreas del usuario");
          return res.status(200).json({ 
            success: true,
            projects: [],
            msg: "Tus áreas no están configuradas en el sistema financiero"
          });
        }
      } else {
        logger.warn("⚠️ Usuario sin áreas válidas en sus puestos");
        return res.status(200).json({ 
          success: true,
          projects: [],
          msg: "No tienes áreas asignadas"
        });
      }
    }

    // ✅ DEBUGGING: Verificar proyectos sin filtro primero
    logger.info("🔍 Verificando proyectos sin filtro...");
    const proyectosSinFiltro = await promette.dt_proyecto_anual.findAll({
      include: [includeOptions.getTechoInclude()],
      order: [["año", "DESC"]],
    });
    logger.info(`📊 Total de proyectos sin filtro: ${proyectosSinFiltro.length}`);

    // ✅ DEBUGGING: Verificar proyectos con filtro
    logger.info(`🔍 Buscando proyectos con filtro: ${JSON.stringify(whereClause)}`);
    const projects = await promette.dt_proyecto_anual.findAll({
      where: whereClause,
      include: [includeOptions.getTechoInclude()],
      order: [["año", "DESC"]],
    });

    logger.info(`📊 Proyectos encontrados con filtro: ${projects.length}`);

    // ✅ DEBUGGING: Mostrar información de los proyectos encontrados
    if (projects.length > 0) {
      logger.info("📋 Primeros 3 proyectos encontrados:");
      projects.slice(0, 3).forEach((project: any, index: number) => {
        logger.info(`  ${index + 1}. ID: ${project.id_proyecto_anual}, Año: ${project.año}, Techo: ${project.dt_techo_id}, Área: ${project.dt_techo?.ct_area_id}`);
      });
    }

    return responseHelpers.success(res, { 
      projects,
      filtro_aplicado: {
        puestos_ids: puestosIds,
        areas_filtradas: areasFiltradas,
        total_registros: projects.length,
        total_sin_filtro: proyectosSinFiltro.length
      }
    });
  } catch (error: any) {
    logger.error("❌ Error en getAllProjects:", error);
    return responseHelpers.serverError(res, error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id_proyecto_anual } = req.params;

    if (!id_proyecto_anual) {
      return responseHelpers.badRequest(res, "ID de proyecto anual requerido");
    }
    logger.info(`Buscando proyecto anual con ID: ${id_proyecto_anual}`);

    const project = await promette.dt_proyecto_anual.findByPk(
      id_proyecto_anual,
      {
        include: includeOptions.getTechoInclude(),
      }
    );

    if (!project) {
      return responseHelpers.notFound(res, "Proyecto anual no encontrado");
    }

    return responseHelpers.success(res, { project });
  } catch (error: any) {
    return responseHelpers.serverError(res, error);
  }
};

export const getProjectsByYear = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { year } = req.params;

    if (!year) {
      return responseHelpers.badRequest(res, "Año requerido");
    }

    logger.info(`Buscando proyectos anuales para el año: ${year}`);
    const projects = await promette.dt_proyecto_anual.findAll({
      where: { año: year },
      include: includeOptions.getTechoInclude(),
    });

    return responseHelpers.success(res, { projects });
  } catch (error: any) {
    return responseHelpers.serverError(res, error);
  }
};

/**
 * Método unificado para buscar proyectos por techo presupuestal
 * Permite buscar un solo proyecto o varios, según el parámetro single
 */
export const getProjectsByTechoId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { techo_id } = req.params;
    const singleParam = req.query.single ? String(req.query.single) : "false";

    if (!techo_id) {
      return responseHelpers.badRequest(
        res,
        "ID de techo presupuestal requerido"
      );
    }

    logger.info(
      `Buscando ${
        singleParam === "true" || singleParam === "1"
          ? "un proyecto"
          : "proyectos"
      } con techo ID: ${techo_id}`
    );

    // ✅ PRIMERO: Verificar que el techo presupuestal exista y obtener su información
    const techo = await promette.dt_techo_presupuesto.findByPk(techo_id, {
      include: [
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
        },
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "nombre_capitulo", "clave_capitulo"],
        },
        {
          model: promette.ct_financiamiento,
          as: "ct_financiamiento",
          attributes: ["id_financiamiento", "nombre_financiamiento"],
        },
      ],
    });

    if (!techo) {
      return responseHelpers.notFound(
        res,
        `Techo presupuestal ${techo_id} no encontrado`
      );
    }

    // ✅ VERIFICAR que el techo tenga área financiera válida
    if (!techo.ct_area_id || !techo.ct_area) {
      return responseHelpers.badRequest(
        res,
        `El techo presupuestal ${techo_id} no tiene área financiera configurada correctamente`
      );
    }

    logger.info(
      `Techo encontrado con área financiera ID: ${techo.ct_area.id_area_fin}`
    );

    // ✅ SEGUNDO: Buscar proyectos asociados a este techo
    const whereClause = {
      dt_techo_id: techo_id,
      estado: 1,
    };

    if (singleParam === "true" || singleParam === "1") {
      const project = await promette.dt_proyecto_anual.findOne({
        where: whereClause,
        include: [
          {
            model: promette.dt_techo_presupuesto,
            as: "dt_techo",
            include: [
              {
                model: promette.rl_area_financiero,
                as: "ct_area",
                attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
              },
              {
                model: promette.ct_capitulo,
                as: "ct_capitulo",
                attributes: [
                  "id_capitulo",
                  "nombre_capitulo",
                  "clave_capitulo",
                ],
              },
              {
                model: promette.ct_financiamiento,
                as: "ct_financiamiento",
                attributes: ["id_financiamiento", "nombre_financiamiento"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // ✅ RESPUESTA MEJORADA: Incluir información del techo aunque no haya proyecto
      return responseHelpers.success(res, {
        project: project || null,
        techo: {
          id_techo: techo.id_techo,
          ct_area_id: techo.ct_area_id,
          ct_area: techo.ct_area,
          ct_capitulo: techo.ct_capitulo,
          ct_financiamiento: techo.ct_financiamiento,
          cantidad_presupuestada: techo.cantidad_presupuestada,
        },
        // ✅ AGREGAR: Información del área para el frontend
        area_financiera: {
          id_area_fin: techo.ct_area.id_area_fin,
          nombre: `Área Financiera ${techo.ct_area.id_area_fin}`,
        },
        has_project: !!project,
        msg: project
          ? "Proyecto encontrado"
          : "Techo encontrado sin proyecto anual (se puede crear)",
      });
    }

    // Buscar todos los proyectos
    const projects = await promette.dt_proyecto_anual.findAll({
      where: whereClause,
      include: includeOptions.getTechoInclude(),
      order: [
        ["año", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    // ✅ RESPUESTA MEJORADA: Siempre incluir información del techo
    return responseHelpers.success(res, {
      projects,
      techo: {
        id_techo: techo.id_techo,
        ct_area_id: techo.ct_area_id,
        ct_area: techo.ct_area,
        ct_capitulo: techo.ct_capitulo,
        ct_financiamiento: techo.ct_financiamiento,
        cantidad_presupuestada: techo.cantidad_presupuestada,
      },
      area_financiera: {
        id_area_fin: techo.ct_area.id_area_fin,
        nombre: `Área Financiera ${techo.ct_area.id_area_fin}`,
      },
      total: projects.length,
      msg: `Se encontraron ${projects.length} proyectos para el techo ${techo_id}`,
    });
  } catch (error: any) {
    logger.error(
      `Error al obtener proyectos por techo ${req.params.techo_id}:`,
      error
    );
    return responseHelpers.serverError(res, error);
  }
};

/**
 * Registra un nuevo proyecto anual con transacción
 */
export const registerProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Iniciar transacción
  const t = await sequelize.transaction();

  try {
    const { año, dt_techo_id, monto_asignado, descripcion = null } = req.body;

    // Validaciones básicas
    if (!año || !dt_techo_id || monto_asignado === undefined) {
      await t.rollback();
      return responseHelpers.badRequest(
        res,
        "Datos incompletos para registrar proyecto anual"
      );
    }

    // Verificar si ya existe un proyecto para este techo y año
    const existingProject = await promette.dt_proyecto_anual.findOne({
      where: {
        dt_techo_id,
        año,
        estado: 1,
      },
      transaction: t,
    });

    if (existingProject) {
      await t.rollback();
      return responseHelpers.badRequest(
        res,
        "Ya existe un proyecto anual para este techo presupuestal en este año"
      );
    }

    // Verificar que el techo presupuestal exista
    const techo = await promette.dt_techo_presupuesto.findByPk(dt_techo_id, {
      transaction: t,
    });

    if (!techo) {
      await t.rollback();
      return responseHelpers.badRequest(
        res,
        "El techo presupuestal especificado no existe"
      );
    }

    // Usar BigDecimal para cálculos monetarios consistentes
    const montoAsignado = parseFloat(monto_asignado);
    const montoUtilizado = 0;
    const montoDisponible = montoAsignado;

    // Crear el proyecto
    const newProject = await promette.dt_proyecto_anual.create(
      {
        año,
        dt_techo_id,
        monto_asignado: montoAsignado,
        monto_utilizado: montoUtilizado,
        monto_disponible: montoDisponible,
        descripcion,
        estado: 1,
      },
      { transaction: t }
    );

    await t.commit();

    logger.info(
      `Proyecto anual registrado: ID ${newProject.id_proyecto_anual}`
    );

    return responseHelpers.success(res, {
      project: newProject,
      msg: "Proyecto anual registrado correctamente",
    });
  } catch (error: any) {
    await t.rollback();
    return responseHelpers.serverError(res, error);
  }
};

export const updateProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const t = await sequelize.transaction();

  try {
    const { id_proyecto_anual } = req.params;
    const {
      año,
      dt_techo_id,
      monto_asignado,
      monto_utilizado,
      monto_disponible,
      descripcion,
      estado,
    } = req.body;

    if (!id_proyecto_anual) {
      await t.rollback();
      return responseHelpers.badRequest(res, "ID de proyecto anual requerido");
    }

    const project = await promette.dt_proyecto_anual.findByPk(
      id_proyecto_anual,
      { transaction: t }
    );

    if (!project) {
      await t.rollback();
      return responseHelpers.notFound(res, "Proyecto anual no encontrado");
    }

    // Datos a actualizar
    const updateData: any = {};

    if (año !== undefined) updateData.año = año;
    if (dt_techo_id !== undefined) updateData.dt_techo_id = dt_techo_id;
    if (monto_asignado !== undefined)
      updateData.monto_asignado = parseFloat(monto_asignado);
    if (monto_utilizado !== undefined)
      updateData.monto_utilizado = parseFloat(monto_utilizado);
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (estado !== undefined) updateData.estado = estado;

    // Si se actualiza monto_asignado o monto_utilizado, recalcular monto_disponible
    if (monto_asignado !== undefined || monto_utilizado !== undefined) {
      const newMontoAsignado =
        monto_asignado !== undefined
          ? parseFloat(monto_asignado)
          : parseFloat(project.monto_asignado);

      const newMontoUtilizado =
        monto_utilizado !== undefined
          ? parseFloat(monto_utilizado)
          : parseFloat(project.monto_utilizado);

      updateData.monto_disponible = parseFloat(
        (newMontoAsignado - newMontoUtilizado).toFixed(3)
      );
    } else if (monto_disponible !== undefined) {
      updateData.monto_disponible = parseFloat(monto_disponible);
    }

    await project.update(updateData, { transaction: t });
    await t.commit();

    logger.info(`Proyecto anual ${id_proyecto_anual} actualizado`);
    const updatedProject = await promette.dt_proyecto_anual.findByPk(
      id_proyecto_anual,
      {
        include: includeOptions.getTechoInclude(),
      }
    );

    return responseHelpers.success(res, {
      project: updatedProject,
      msg: "Proyecto anual actualizado correctamente",
    });
  } catch (error: any) {
    await t.rollback();
    return responseHelpers.serverError(res, error);
  }
};

export const updateProjectAmount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Iniciar transacción
  const t = await sequelize.transaction();

  try {
    const { id_proyecto_anual, monto_utilizado } = req.body;

    if (!id_proyecto_anual || monto_utilizado === undefined) {
      await t.rollback();
      return responseHelpers.badRequest(
        res,
        "ID de proyecto y monto utilizado requeridos"
      );
    }

    // Verificar que el proyecto exista
    const project = await promette.dt_proyecto_anual.findByPk(
      id_proyecto_anual,
      { transaction: t }
    );

    if (!project) {
      await t.rollback();
      return responseHelpers.notFound(res, "Proyecto anual no encontrado");
    }

    // Usar valores numéricos precisos para los cálculos
    const montoAsignado = parseFloat(project.monto_asignado);
    const montoUtilizado = parseFloat(monto_utilizado);

    // Recalcular monto disponible
    const montoDisponible = parseFloat(
      (montoAsignado - montoUtilizado).toFixed(3)
    );

    // Actualizar el proyecto
    await project.update(
      {
        monto_utilizado: montoUtilizado,
        monto_disponible: montoDisponible,
      },
      { transaction: t }
    );

    // Confirmar la transacción
    await t.commit();

    logger.info(
      `Monto actualizado para proyecto ${id_proyecto_anual}: utilizado=${montoUtilizado}, disponible=${montoDisponible}`
    );

    return responseHelpers.success(res, {
      project: {
        id_proyecto_anual,
        monto_asignado: montoAsignado,
        monto_utilizado: montoUtilizado,
        monto_disponible: montoDisponible,
      },
      msg: "Monto actualizado correctamente",
    });
  } catch (error: any) {
    await t.rollback();
    return responseHelpers.serverError(res, error);
  }
};

export const createHistoricalRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Iniciar transacción
  const t = await sequelize.transaction();

  try {
    const { dt_techo_id, monto_utilizado, ct_usuario_id, descripcion } =
      req.body;

    if (!dt_techo_id || !monto_utilizado) {
      await t.rollback();
      return responseHelpers.badRequest(
        res,
        "ID de techo presupuestal y monto utilizado requeridos"
      );
    }

    // Buscar el proyecto anual activo para este techo
    const project = await promette.dt_proyecto_anual.findOne({
      where: {
        dt_techo_id,
        estado: 1,
      },
      transaction: t,
    });

    if (!project) {
      // Si no hay proyecto, crear uno nuevo con el año actual
      const techo = await promette.dt_techo_presupuesto.findByPk(dt_techo_id, {
        transaction: t,
      });

      if (!techo) {
        await t.rollback();
        return responseHelpers.badRequest(
          res,
          "El techo presupuestal especificado no existe"
        );
      }

      const currentYear = new Date().getFullYear();
      const montoUtilizado = parseFloat(monto_utilizado);

      const newProject = await promette.dt_proyecto_anual.create(
        {
          año: currentYear,
          dt_techo_id,
          monto_asignado: parseFloat(techo.cantidad_presupuestada),
          monto_utilizado: montoUtilizado,
          monto_disponible: parseFloat(
            (techo.cantidad_presupuestada - montoUtilizado).toFixed(3)
          ),
          descripcion,
          estado: 1,
        },
        { transaction: t }
      );

      // Confirmar la transacción
      await t.commit();

      logger.info(
        `Nuevo proyecto anual creado con registro histórico: ID=${newProject.id_proyecto_anual}`
      );

      return responseHelpers.success(res, {
        project: newProject,
        msg: "Proyecto anual creado con registro histórico",
      });
    }

    // Si el proyecto existe, actualizar montos
    const montoAsignado = parseFloat(project.monto_asignado);
    const montoUtilizadoAnterior = parseFloat(project.monto_utilizado);
    const nuevoMontoUtilizado = parseFloat(monto_utilizado);

    // Incrementar el monto utilizado y recalcular disponible
    const montoUtilizadoTotal = parseFloat(
      (montoUtilizadoAnterior + nuevoMontoUtilizado).toFixed(3)
    );
    const montoDisponible = parseFloat(
      (montoAsignado - montoUtilizadoTotal).toFixed(3)
    );

    // Actualizar el proyecto
    await project.update(
      {
        monto_utilizado: montoUtilizadoTotal,
        monto_disponible: montoDisponible,
        ...(descripcion && !project.descripcion ? { descripcion } : {}),
      },
      { transaction: t }
    );

    // Confirmar la transacción
    await t.commit();

    logger.info(
      `Registro histórico creado para proyecto ${project.id_proyecto_anual}: +${nuevoMontoUtilizado}`
    );

    return responseHelpers.success(res, {
      project,
      msg: "Registro histórico creado correctamente",
    });
  } catch (error: any) {
    await t.rollback();
    return responseHelpers.serverError(res, error);
  }
};

/**
 * Obtiene el historial de un proyecto anual
 */
export const getProjectHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id_proyecto_anual } = req.params;

    if (!id_proyecto_anual) {
      return responseHelpers.badRequest(res, "ID de proyecto anual requerido");
    }
    // Obtener el proyecto anual con sus relaciones
    const project = await promette.dt_proyecto_anual.findByPk(
      id_proyecto_anual,
      {
        include: includeOptions.getTechoInclude(),
      }
    );

    if (!project) {
      return responseHelpers.notFound(res, "Proyecto anual no encontrado");
    }
    // Obtener el historial de requisiciones
    const requisitions = await promette.rl_producto_requisicion.findAll({
      where: { dt_techo_id: project.dt_techo_id },
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          include: [{ model: promette.ct_partida, as: "ct_partida" }],
        },
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          include: [
            {
              model: promette.ct_area,
              as: "ct_area",
            },
          ],
        },
        { model: promette.ct_usuario, as: "ct_usuarios_in_ct_usuario" },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Calcular totales con precisión
    const totales = requisitions.reduce(
      (acc: any, req: any) => {
        const cantidad = parseFloat(req.cantidad || 0);
        const precio = parseFloat(req.ct_producto?.precio || 0);
        const montoRequisicion = parseFloat((cantidad * precio).toFixed(3));

        acc.totalCantidad += cantidad;
        acc.totalMonto += montoRequisicion;

        return acc;
      },
      { totalCantidad: 0, totalMonto: 0 }
    );

    return responseHelpers.success(res, {
      project,
      requisitions,
      totals: {
        totalCantidad: parseFloat(totales.totalCantidad.toFixed(3)),
        totalMonto: parseFloat(totales.totalMonto.toFixed(3)),
      },
    });
  } catch (error: any) {
    return responseHelpers.serverError(res, error);
  }
};

/**
 * Obtiene las requisiciones asociadas a un proyecto anual
 */
export const fetchRequisitionsByProjectId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id_proyecto_anual } = req.params;

    if (!id_proyecto_anual) {
      return responseHelpers.badRequest(res, "ID de proyecto anual requerido");
    }

    logger.info(`Buscando proyecto anual con ID: ${id_proyecto_anual}`);

  
    const proyecto = await promette.dt_proyecto_anual.findByPk(
      id_proyecto_anual,
      {
        include: includeOptions.getTechoInclude(),
      }
    );

    if (!proyecto) {
      return responseHelpers.notFound(res, "Proyecto anual no encontrado");
    }
    logger.info(
      `Proyecto encontrado. Buscando requisiciones con techo ID: ${proyecto.dt_techo_id}`
    );
    // Obtener el área financiera del proyecto para filtrar requisiciones correctamente
    const areaFinanciera = proyecto.dt_techo?.ct_area;
    let whereClause: any = { dt_techo_id: proyecto.dt_techo_id };

    // Si tenemos información del área financiera, filtrar también por área
    // ct_area_id en requisiciones debe coincidir con id_area_fin de rl_area_financiero
    if (areaFinanciera && areaFinanciera.id_area_fin) {
      whereClause.ct_area_id = areaFinanciera.id_area_fin;
      logger.info(
        `Filtrando también por área financiera ID: ${areaFinanciera.id_area_fin}`
      );
    } // Con el ID de techo presupuestal y área, buscamos las requisiciones asociadas
    logger.info(
      `Buscando requisiciones con whereClause:`,
      JSON.stringify(whereClause)
    );

    // Primero, hagamos una consulta más amplia para diagnosticar
    const allRequisitionsForTecho =
      await promette.rl_producto_requisicion.findAll({
        where: { dt_techo_id: proyecto.dt_techo_id },
        attributes: [
          "id_producto_requisicion",
          "dt_techo_id",
          "ct_area_id",
          "mes",
          "cantidad",
        ],
      });

    logger.info(
      `Total requisiciones para techo ID ${proyecto.dt_techo_id}: ${allRequisitionsForTecho.length}`
    );
    if (allRequisitionsForTecho.length > 0) {
      logger.info(
        `Áreas encontradas en requisiciones:`,
        allRequisitionsForTecho.map((r: any) => r.ct_area_id)
      );
    }

    const requisitions = await promette.rl_producto_requisicion.findAll({
      where: whereClause,
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          include: [
            {
              model: promette.ct_partida,
              as: "ct_partida",
              attributes: ["id_partida", "nombre_partida", "clave_partida"],
            },
          ],
        },
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuarios_in_ct_usuario",
          attributes: ["id_usuario", "nombre_usuario", "email"],
        },
      ],
      order: [
        ["mes", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    logger.info(
      `Se encontraron ${requisitions.length} requisiciones para el proyecto anual`
    );

    // Realizar cálculos con precisión decimal (3 decimales)
    let totalCantidadSolicitada = 0;
    let totalMontoSolicitado = 0;

    // Procesamiento y cálculos por mes
    const requisitionsByMonth: { [key: string]: any } = {};
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    // Procesar cada requisición calculando totales
    requisitions.forEach((req: any) => {
      const cantidadSolicitada = Number(req.cantidad) || 0;
      const precioUnitario = Number(req.ct_producto?.precio) || 0;
      const montoSolicitado = parseFloat(
        (cantidadSolicitada * precioUnitario).toFixed(3)
      );

      // Actualizar totales
      totalCantidadSolicitada += cantidadSolicitada;
      totalMontoSolicitado += montoSolicitado;

      // Agrupar por mes
      const mesIndex = req.mes ? Number(req.mes) - 1 : -1;
      const mesNombre =
        mesIndex >= 0 && mesIndex < 12 ? monthNames[mesIndex] : "Sin mes";

      if (!requisitionsByMonth[mesNombre]) {
        requisitionsByMonth[mesNombre] = {
          solicitado: 0,
          count: 0,
          montoSolicitado: 0,
        };
      }

      requisitionsByMonth[mesNombre].solicitado += cantidadSolicitada;
      requisitionsByMonth[mesNombre].montoSolicitado += montoSolicitado;
      requisitionsByMonth[mesNombre].count++;
    });

    // Formatear números con 3 decimales
    for (const month in requisitionsByMonth) {
      requisitionsByMonth[month].solicitado = parseFloat(
        requisitionsByMonth[month].solicitado.toFixed(3)
      );
      requisitionsByMonth[month].montoSolicitado = parseFloat(
        requisitionsByMonth[month].montoSolicitado.toFixed(3)
      );
    }

    // Obtener métricas con precisión de 3 decimales
    const requisitionMetrics = {
      total_requisiciones: requisitions.length,
      total_pendientes: requisitions.filter((r: any) => !r.ct_usuario_at)
        .length,
      total_solicitado: parseFloat(totalCantidadSolicitada.toFixed(3)),
      total_monto_solicitado: parseFloat(totalMontoSolicitado.toFixed(3)),
    };

    logger.info("Métricas calculadas:", requisitionMetrics);

    return responseHelpers.success(res, {
      project: proyecto,
      requisitions,
      metrics: requisitionMetrics,
      totals: {
        totalSolicitado: parseFloat(totalCantidadSolicitada.toFixed(3)),
        totalMontoSolicitado: parseFloat(totalMontoSolicitado.toFixed(3)),
        requisitionsByMonth,
      },
    });
  } catch (error: any) {
    return responseHelpers.serverError(res, error);
  }
};

/**
 * Verifica y asegura que existe un proyecto anual para un techo presupuestal
 * Si no existe, lo crea. Si existe, lo devuelve.
 */
export const ensureAnualProjectExists = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { dt_techo_id } = req.params;

    if (!dt_techo_id || isNaN(Number(dt_techo_id))) {
      return res.status(400).json({
        success: false,
        msg: "ID de techo presupuestal inválido",
      });
    }

    const techoId = Number(dt_techo_id);

    // Verificar si existe el techo presupuestal
    const techo = await promette.dt_techo_presupuesto.findByPk(techoId, {
      include: [
        {
          model: promette.ct_financiamiento,
          as: "ct_financiamiento",
          attributes: ["id_financiamiento", "nombre_financiamiento"],
        },
      ],
    });

    if (!techo) {
      return res.status(404).json({
        success: false,
        msg: `Techo presupuestal con ID ${techoId} no encontrado`,
      });
    }

    // Buscar proyecto anual existente
    const currentYear = new Date().getFullYear();
    let proyectoAnual = await promette.dt_proyecto_anual.findOne({
      where: {
        dt_techo_id: techoId,
        año: currentYear,
        estado: 1,
      },
    });

    if (!proyectoAnual) {
      // No existe, crearlo
      const montoAsignado = parseFloat(
        techo.cantidad_presupuestada?.toString() || "0"
      );

      try {
        proyectoAnual = await promette.dt_proyecto_anual.create({
          año: currentYear,
          dt_techo_id: techoId,
          monto_asignado: montoAsignado,
          monto_utilizado: 0, // Inicia en cero
          monto_disponible: montoAsignado, // Disponible = asignado inicialmente
          descripcion: "Proyecto anual creado automáticamente",
          estado: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return res.status(201).json({
          success: true,
          msg: "Proyecto anual creado exitosamente",
          project: proyectoAnual,
          is_new: true,
        });
      } catch (createError) {
        console.error("Error al crear proyecto anual:", createError);
        return res.status(500).json({
          success: false,
          msg: "Error al crear proyecto anual",
          error:
            createError instanceof Error
              ? createError.message
              : "Error desconocido",
        });
      }
    }

    // Ya existe, devolverlo
    return res.status(200).json({
      success: true,
      msg: "Proyecto anual encontrado",
      project: proyectoAnual,
      is_new: false,
    });
  } catch (error) {
    console.error("Error al verificar/crear proyecto anual:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
