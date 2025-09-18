import { Request, Response } from "express";
import { promette, sequelize } from '../../models/database.models';
import axios from "axios";
import jwt from "jsonwebtoken";
import { generateBudgetCeilingExcel } from '../excelController/budgetCeilingExcel.controller';

// ✅ INTERFAZ: Definir el tipo para los techos presupuestales
interface TechoPresupuestal {
  id_techo: number;
  ct_area_id: number;
  ct_capitulo_id: number;
  ct_financiamiento_id: number;
  cantidad_presupuestada: number;
  ct_usuario_in: number;
  ct_usuario_at: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ INTERFAZ: Definir el tipo para las relaciones financieras
interface RelacionFinanciera {
  id_area_fin: number;
  id_financiero: number;
  id_area_infra: number;
}



// Función para verificar el token
const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
};

// Utilidad para obtener el catálogo de áreas desde la API de infraestructura
async function getInfraAreas(): Promise<Record<number, string>> {
  try {
    const url = `${process.env.INFRAESTRUCTURA_API}/area`;
    
    if (!process.env.INFRAESTRUCTURA_API) {
      console.error("Error: INFRAESTRUCTURA_API environment variable is not set");
      return {};
    }
    
    console.log(`Fetching areas from: ${url}`);
    const response = await axios.get(url);
    
    // Suponiendo que la respuesta es un array de objetos con id_area y nombre
    const areas: Record<number, string> = {};
    if (Array.isArray(response.data)) {
      response.data.forEach((area: any) => {
        if (area.id_area && area.nombre) {
          areas[area.id_area] = area.nombre;
        }
      });
    } else if (Array.isArray(response.data.areas)) {
      response.data.areas.forEach((area: any) => {
        if (area.id_area && area.nombre) {
          areas[area.id_area] = area.nombre;
        }
      });
    }
    
    console.log(`Successfully fetched ${Object.keys(areas).length} areas`);
    return areas;
  } catch (err: any) {
    console.error("Error al obtener áreas de infraestructura:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    return {};
  }
}

// GET - Obtener todos los techos presupuestales
export const getAllBudgetCeilings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Obtener el ID del usuario del token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    let userId = null;
    
    if (token) {
      try {
        const decoded: any = verifyToken(token);
        userId = decoded.id;
      } catch (err) {
        console.error("Error al decodificar el token:", err);
      }
    }

    if (!userId) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    // Obtener el puesto actual del usuario
    const usuarioPuesto = await promette.rl_usuario_puesto.findOne({
      where: { 
        ct_usuario_id: userId,
        estado: 1,
        periodo_final: null // Puesto actual
      },
      include: [
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["id_puesto", "nombre_puesto", "ct_area_id"]
        }
      ]
    });

    if (!usuarioPuesto) {
      return res.status(404).json({ msg: "Usuario sin puesto asignado" });
    }

    const puestoId = usuarioPuesto.ct_puesto.id_puesto;
    const areaId = usuarioPuesto.ct_puesto.ct_area_id;

    console.log(`Usuario ${userId} - Puesto: ${puestoId}, Área: ${areaId}`);

    // Lógica de filtrado según el puesto
    let whereClause: any = {};
    let areasFiltradas: number[] = [];
    let filtroAplicado = "Sin filtro";

    console.log('🔍 Iniciando búsqueda de techos presupuestales...');
    console.log('👤 Información del usuario:', {
      userId,
      puestoId,
      areaId
    });

    // ✅ VERIFICACIÓN: Consultar todos los techos sin filtros
    const techosSinFiltro = await promette.dt_techo_presupuesto.findAll({
      raw: true,
      logging: console.log
    });
    console.log('📊 VERIFICACIÓN - Todos los techos en la base de datos:', techosSinFiltro);
    console.log('📊 Total de techos sin filtro:', techosSinFiltro.length);

    // ✅ VERIFICACIÓN: Consultar todas las áreas financieras
    const areasFinancieras = await promette.rl_area_financiero.findAll({
      raw: true,
      logging: console.log
    });
    console.log('📊 VERIFICACIÓN - Todas las áreas financieras:', areasFinancieras);
    console.log('📊 Total de áreas financieras:', areasFinancieras.length);

    // ✅ VERIFICACIÓN: Consultar la relación específica del usuario
    const areaFinancieraUsuario = await promette.rl_area_financiero.findOne({
      where: { id_area_infra: areaId },
      raw: true,
      logging: console.log
    });
    console.log('📊 VERIFICACIÓN - Área financiera del usuario:', areaFinancieraUsuario);

    if (puestoId === 1806) {
      // Usuario con puesto 1806: puede ver todo (sin filtros)
      console.log(`🔓 Puesto 1806 - Acceso completo a todos los techos`);
      // No se aplica filtro, whereClause permanece vacío para mostrar todo

    } else if (puestoId === 258) {
      // Analista (puesto 258): mostrar solo las unidades asignadas en rl_analista_unidad
      console.log('🔍 Buscando áreas asignadas al analista...');
      const areasAnalista = await promette.rl_analista_unidad.findAll({
        where: { 
          ct_usuario_id: userId,
          estado: 1 
        },
        attributes: ['rl_area_financiero']
      });

      console.log('📊 Áreas encontradas para el analista:', areasAnalista);

      areasFiltradas = areasAnalista.map((area: any) => area.rl_area_financiero);
      
      if (areasFiltradas.length === 0) {
        console.log('⚠️ Analista sin áreas asignadas');
        return res.status(200).json({ 
          ceilings: [],
          msg: "No tienes unidades asignadas como analista"
        });
      }

      whereClause.ct_area_id = areasFiltradas;
      console.log(`✅ Analista - Áreas asignadas: ${areasFiltradas.join(', ')}`);
      console.log('🔍 WhereClause para analista:', whereClause);
      filtroAplicado = `Analista - Áreas: ${areasFiltradas.join(', ')}`;

    } else {
      // 🔍 Usuario regular con posible múltiples áreas
      console.log(`🔍 Usuario regular - Analizando múltiples áreas del usuario...`);

      // Obtener todas las áreas asignadas desde los puestos activos
      const puestosUsuario = await promette.rl_usuario_puesto.findAll({
        where: {
          ct_usuario_id: userId,
          estado: 1,
          periodo_final: null
        },
        include: [
          {
            model: promette.ct_puesto,
            as: "ct_puesto",
            attributes: ["ct_area_id"]
          }
        ]
      });

      const areaIdsInfra = puestosUsuario
        .map((p: any) => p.ct_puesto?.ct_area_id)
        .filter((id: any) => typeof id === 'number');

      if (areaIdsInfra.length === 0) {
        console.warn("⚠️ Usuario sin áreas válidas en sus puestos");
        return res.status(200).json({
          ceilings: [],
          msg: "No tienes áreas válidas asignadas",
          filtro_aplicado: {
            puesto_id: puestoId,
            areas_filtradas: [],
            total_registros: 0,
            motivo: "Sin áreas válidas en ct_puesto"
          }
        });
      }

      console.log("🔍 Áreas infraestructura del usuario:", areaIdsInfra);

      // Buscar todas las relaciones financieras (id_area_fin)
      const relacionesFinancieras = await promette.rl_area_financiero.findAll({
        where: {
          id_area_infra: areaIdsInfra
        },
        raw: true
      });

      const areasFiltradas = relacionesFinancieras.map((r: RelacionFinanciera) => r.id_area_fin);

      if (areasFiltradas.length === 0) {
        console.warn("⚠️ No se encontraron áreas financieras asociadas al usuario");
        return res.status(200).json({
          ceilings: [],
          msg: "Tus áreas no están configuradas en el sistema financiero",
          filtro_aplicado: {
            puesto_id: puestoId,
            areas_filtradas: [],
            total_registros: 0,
            motivo: "Ninguna de las áreas tiene relación en rl_area_financiero",
            area_buscada: areaIdsInfra
          }
        });
      }

      whereClause.ct_area_id = areasFiltradas;
      filtroAplicado = `Usuario regular - Áreas financieras: [${areasFiltradas.join(', ')}] (infra: ${areaIdsInfra.join(', ')})`;

      console.log(`✅ WhereClause aplicado para usuario regular con múltiples áreas:`, whereClause);

      // Buscar techos presupuestales vinculados
      const techosVinculados = await promette.dt_techo_presupuesto.findAll({
        where: {
          ct_area_id: areasFiltradas
        },
        raw: true
      });

      // Mostrar en formato tabla
      if (techosVinculados.length > 0) {
        console.log(`✅ Techos presupuestales encontrados para el usuario regular (áreas_fin = [${areasFiltradas.join(', ')}]):`);
        console.table(
          techosVinculados.map((t: TechoPresupuestal) => ({
            id_techo: t.id_techo,
            ct_area_id: t.ct_area_id,
            ct_capitulo_id: t.ct_capitulo_id,
            ct_financiamiento_id: t.ct_financiamiento_id,
            cantidad_presupuestada: t.cantidad_presupuestada,
            ct_usuario_in: t.ct_usuario_in,
            ct_usuario_at: t.ct_usuario_at,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          }))
        );
      } else {
        console.warn(`⚠️ No se encontraron techos presupuestales para las áreas_fin [${areasFiltradas.join(', ')}]`);
      }
    }

    // Realizar la consulta final con los filtros aplicados
    console.log('🔍 Ejecutando consulta final con whereClause:', whereClause);
    const ceilings = await promette.dt_techo_presupuesto.findAll({
      where: whereClause,
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
      order: [["createdAt", "DESC"]],
      logging: console.log // Agregar logging de la consulta SQL
    });

    console.log('📊 Resultado de la consulta final:', {
      total_techos: ceilings.length,
      filtro_aplicado: filtroAplicado,
      whereClause
    });

    return res.status(200).json({
      ceilings,
      msg: "Techos presupuestales obtenidos correctamente",
      filtro_aplicado: {
        puesto_id: puestoId,
        areas_filtradas: areasFiltradas,
        total_registros: ceilings.length,
        motivo: filtroAplicado
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Error al obtener los techos presupuestales" });
  }
};

// GET - Obtener un techo presupuestal por ID
export const getBudgetCeilingById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_techo } = req.params;

  try {
    console.log(`🔍 Obteniendo techo presupuestal ID: ${id_techo}`);

    // ✅ MEJORAR: Incluir todas las relaciones necesarias
    const ceiling = await promette.dt_techo_presupuesto.findByPk(id_techo, {
      include: [
        {
          model: promette.rl_area_financiero,
          as: "ct_area", // ✅ ALIAS CORRECTO
          attributes: ["id_area_fin", "id_financiero", "id_area_infra"], // Incluir solo los atributos necesarios
        },
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
        {
          model: promette.ct_financiamiento,
          as: "ct_financiamiento",
          attributes: ["id_financiamiento", "nombre_financiamiento"],
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuario_in_ct_usuario",
          attributes: ["id_usuario", "nombre_usuario"],
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuario_at_ct_usuario",
          attributes: ["id_usuario", "nombre_usuario"],
        },
      ],
    });

    // Resto de tu código con las referencias actualizadas
    if (!ceiling) {
      console.warn(`❌ Techo presupuestal no encontrado: ID ${id_techo}`);
      return res.status(404).json({
        success: false,
        msg: "Techo presupuestal no encontrado",
      });
    }

    console.log(`✅ Techo presupuestal encontrado: ${ceiling.id_techo}`);

    // ✅ AÑADIR: Obtener el nombre correcto del área desde la API de infraestructura
    let nombreArea = "Área no disponible";

    if (ceiling.ct_area?.id_area_infra) {
      // ✅ Actualizado a ct_area
      try {
        const infraResponse = await axios.get(
          `${process.env.INFRAESTRUCTURA_API}/area/${ceiling.ct_area.id_area_infra}`
        );

        if (infraResponse.data && infraResponse.data.nombre) {
          nombreArea = infraResponse.data.nombre;
          console.log(
            `✅ Nombre de área obtenido de infraestructura: ${nombreArea}`
          );
        }
      } catch (infraError: unknown) {
        const errorMessage =
          infraError instanceof Error
            ? infraError.message
            : "Error desconocido";
        console.warn(
          "⚠️ No se pudo obtener el nombre del área desde infraestructura:",
          errorMessage
        );
        // Ya no hay fallback a ct_area.nombre_area porque eliminamos esa relación
        nombreArea = "Área no disponible";
      }
    }

    // Construir respuesta
    const response = {
      success: true,
      msg: "Techo presupuestal obtenido correctamente",
      ceiling: {
        // Información básica del techo
        id_techo: ceiling.id_techo,
        ct_area_id: ceiling.ct_area_id,
        ct_capitulo_id: ceiling.ct_capitulo_id,
        ct_financiamiento_id: ceiling.ct_financiamiento_id,
        cantidad_presupuestada: parseFloat(
          ceiling.cantidad_presupuestada?.toString() || "0"
        ),
        ct_usuario_in: ceiling.ct_usuario_in,
        ct_usuario_at: ceiling.ct_usuario_at,
        createdAt: ceiling.createdAt,
        updatedAt: ceiling.updatedAt,

        // Información del capítulo con clave
        ct_capitulo: ceiling.ct_capitulo,

        // Información del financiamiento
        ct_financiamiento: ceiling.ct_financiamiento,

        // Información del área (con nombre correcto)
        rl_area_financiero: {
          ...ceiling.ct_area?.toJSON(),
          nombre_area: nombreArea, // Nombre correcto de API
        },

        // Información de usuarios
        ct_usuario_in_ct_usuario: ceiling.ct_usuario_in_ct_usuario,
        ct_usuario_at_ct_usuario: ceiling.ct_usuario_at_ct_usuario,
      },
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    console.error(`💥 Error al obtener techo presupuestal ${id_techo}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({
      success: false,
      msg: "Error interno del servidor al obtener el techo presupuestal",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
    });
  }
};

// POST - Crear un nuevo techo presupuestal
export const createBudgetCeiling = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    ct_area_id,
    ct_capitulo_id,
    ct_financiamiento_id,
    cantidad_presupuestada,
    ct_usuario_in,
  } = req.body;

  try {
    const newCeiling = await promette.dt_techo_presupuesto.create({
      ct_area_id,
      ct_capitulo_id,
      ct_financiamiento_id,
      cantidad_presupuestada,
      ct_usuario_in,
    });

    return res.status(201).json({
      msg: "Techo presupuestal creado correctamente",
      ceiling: newCeiling,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Error al crear el techo presupuestal" });
  }
};

// PUT - Actualizar un techo presupuestal
export const updateBudgetCeiling = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_techo } = req.params;
  const {
    ct_area_id,
    ct_capitulo_id,
    ct_financiamiento_id,
    cantidad_presupuestada,
    ct_usuario_at,
  } = req.body;

  // Iniciar transacción para asegurar consistencia
  const t = await sequelize.transaction();

  try {
    const ceiling = await promette.dt_techo_presupuesto.findByPk(id_techo, {
      transaction: t
    });

    if (!ceiling) {
      await t.rollback();
      return res.status(404).json({ msg: "Techo presupuestal no encontrado" });
    }

    // Guardar el monto anterior para calcular la diferencia
    const montoAnterior = ceiling.cantidad_presupuestada;
    const montoNuevo = cantidad_presupuestada;
    const diferencia = montoNuevo - montoAnterior;

    // Actualizar el techo presupuestal
    await promette.dt_techo_presupuesto.update(
      {
        ct_area_id,
        ct_capitulo_id,
        ct_financiamiento_id,
        cantidad_presupuestada,
        ct_usuario_at,
      },
      { where: { id_techo }, transaction: t }
    );

    // Buscar proyectos anuales asociados a este techo
    const proyectosAnuales = await promette.dt_proyecto_anual.findAll({
      where: { 
        dt_techo_id: id_techo,
        estado: 1 
      },
      transaction: t
    });

    // Actualizar cada proyecto anual asociado
    for (const proyecto of proyectosAnuales) {
      const montoAsignadoActual = parseFloat(proyecto.monto_asignado);
      const montoUtilizado = parseFloat(proyecto.monto_utilizado);
      
      // Recalcular el monto asignado y disponible
      const nuevoMontoAsignado = montoAsignadoActual + diferencia;
      const nuevoMontoDisponible = nuevoMontoAsignado - montoUtilizado;

      await promette.dt_proyecto_anual.update(
        {
          monto_asignado: nuevoMontoAsignado,
          monto_disponible: nuevoMontoDisponible,
        },
        { 
          where: { id_proyecto_anual: proyecto.id_proyecto_anual },
          transaction: t 
        }
      );

      console.log(`✅ Proyecto anual ${proyecto.id_proyecto_anual} actualizado:`);
      console.log(`   - Monto asignado anterior: ${montoAsignadoActual}`);
      console.log(`   - Monto asignado nuevo: ${nuevoMontoAsignado}`);
      console.log(`   - Monto disponible nuevo: ${nuevoMontoDisponible}`);
    }

    // Confirmar la transacción
    await t.commit();

    const updatedCeiling = await promette.dt_techo_presupuesto.findByPk(
      id_techo
    );

    console.log(`✅ Techo presupuestal ${id_techo} actualizado exitosamente`);
    console.log(`   - Proyectos anuales actualizados: ${proyectosAnuales.length}`);
    console.log(`   - Diferencia en monto: ${diferencia}`);

    return res.status(200).json({
      msg: "Techo presupuestal actualizado correctamente",
      ceiling: updatedCeiling,
      proyectosActualizados: proyectosAnuales.length,
      diferencia: diferencia
    });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar techo presupuestal:', error);
    return res
      .status(500)
      .json({ msg: "Error al actualizar el techo presupuestal" });
  }
};

// DELETE - Eliminar un techo presupuestal
export const deleteBudgetCeiling = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_techo } = req.params;

  try {
    const ceiling = await promette.dt_techo_presupuesto.findByPk(id_techo);

    if (!ceiling) {
      return res.status(404).json({ msg: "Techo presupuestal no encontrado" });
    }

    await promette.dt_techo_presupuesto.destroy({ where: { id_techo } });

    return res
      .status(200)
      .json({ msg: "Techo presupuestal eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Error al eliminar el techo presupuestal" });
  }
};

// GET - Obtener el total de presupuesto por área y capitulo (VERSIÓN CORREGIDA)
export const getTotalBudgetByArea = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que los modelos estén inicializados
    if (!promette) {
      console.error("Error: Modelos de Promette no están inicializados");
      return res.status(500).json({ 
        msg: "Error: Modelos de base de datos no inicializados",
        error: "Los modelos de Promette no están disponibles"
      });
    }

    // Obtener el ID del usuario del token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    let userId = null;
    
    if (token) {
      try {
        const decoded: any = verifyToken(token);
        userId = decoded.id;
      } catch (err) {
        console.error("Error al decodificar el token:", err);
      }
    }

    if (!userId) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    // Obtener el puesto actual del usuario
    const usuarioPuesto = await promette.rl_usuario_puesto.findOne({
      where: { 
        ct_usuario_id: userId,
        estado: 1,
        periodo_final: null // Puesto actual
      },
      include: [
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["id_puesto", "nombre_puesto", "ct_area_id"]
        }
      ]
    });

    if (!usuarioPuesto) {
      return res.status(404).json({ msg: "Usuario sin puesto asignado" });
    }

    const puestoId = usuarioPuesto.ct_puesto.id_puesto;
    const areaId = usuarioPuesto.ct_puesto.ct_area_id;

    console.log(`Usuario ${userId} - Puesto: ${puestoId}, Área: ${areaId}`);

    // ✅ LÓGICA DE FILTRADO CORREGIDA
    let whereClause: any = {};
    let areasFiltradas: number[] = [];
    let filtroAplicado = "Sin filtro";

    if (puestoId === 1806) {
      // ✅ CORRECCIÓN: Puesto 1806 muestra TODO (sin filtros)
      console.log("🔓 Puesto 1806 - Mostrando todos los techos (sin filtros)");
      filtroAplicado = "Puesto 1806 - Sin filtros";
      
    } else if (puestoId === 258) {
      // Analista (puesto 258): mostrar solo las unidades asignadas en rl_analista_unidad
      const areasAnalista = await promette.rl_analista_unidad.findAll({
        where: { 
          ct_usuario_id: userId,
          estado: 1 
        },
        attributes: ['rl_area_financiero']
      });

      areasFiltradas = areasAnalista.map((area: any) => area.rl_area_financiero);
      
      if (areasFiltradas.length === 0) {
        console.log("⚠️ Analista sin áreas asignadas - Mostrando todos los techos");
        filtroAplicado = "Analista sin áreas - Sin filtros";
      } else {
        whereClause.ct_area_id = areasFiltradas;
        console.log(`👤 Analista - Áreas asignadas: ${areasFiltradas.join(', ')}`);
        filtroAplicado = `Analista - Áreas: ${areasFiltradas.join(', ')}`;
      }

    } else {
      // 🔍 Usuario regular con posible múltiples áreas
      console.log(`🔍 Usuario regular - Analizando múltiples áreas del usuario...`);

      // Obtener todas las áreas asignadas desde los puestos activos
      const puestosUsuario = await promette.rl_usuario_puesto.findAll({
        where: {
          ct_usuario_id: userId,
          estado: 1,
          periodo_final: null
        },
        include: [
          {
            model: promette.ct_puesto,
            as: "ct_puesto",
            attributes: ["ct_area_id"]
          }
        ]
      });

      const areaIdsInfra = puestosUsuario
        .map((p: any) => p.ct_puesto?.ct_area_id)
        .filter((id: any) => typeof id === 'number');

      if (areaIdsInfra.length === 0) {
        console.warn("⚠️ Usuario sin áreas válidas en sus puestos");
        return res.status(200).json({
          ceilings: [],
          msg: "No tienes áreas válidas asignadas",
          filtro_aplicado: {
            puesto_id: puestoId,
            areas_filtradas: [],
            total_registros: 0,
            motivo: "Sin áreas válidas en ct_puesto"
          }
        });
      }

      console.log("🔍 Áreas infraestructura del usuario:", areaIdsInfra);

      // Buscar todas las relaciones financieras (id_area_fin)
      const relacionesFinancieras = await promette.rl_area_financiero.findAll({
        where: {
          id_area_infra: areaIdsInfra
        },
        raw: true
      });

      const areasFiltradas = relacionesFinancieras.map((r: any) => r.id_area_fin);

      if (areasFiltradas.length === 0) {
        console.warn("⚠️ No se encontraron áreas financieras asociadas al usuario");
        return res.status(200).json({
          ceilings: [],
          msg: "Tus áreas no están configuradas en el sistema financiero",
          filtro_aplicado: {
            puesto_id: puestoId,
            areas_filtradas: [],
            total_registros: 0,
            motivo: "Ninguna de las áreas tiene relación en rl_area_financiero",
            area_buscada: areaIdsInfra
          }
        });
      }

      whereClause.ct_area_id = areasFiltradas;
      filtroAplicado = `Usuario regular - Áreas financieras: [${areasFiltradas.join(', ')}] (infra: ${areaIdsInfra.join(', ')})`;

      console.log(`✅ WhereClause aplicado para usuario regular con múltiples áreas:`, whereClause);

      // Buscar techos presupuestales vinculados
      const techosVinculados = await promette.dt_techo_presupuesto.findAll({
        where: {
          ct_area_id: areasFiltradas
        },
        raw: true
      });

      // Mostrar en formato tabla
      if (techosVinculados.length > 0) {
        console.log(`✅ Techos presupuestales encontrados para el usuario regular (áreas_fin = [${areasFiltradas.join(', ')}]):`);
        console.table(
          techosVinculados.map((t: TechoPresupuestal) => ({
            id_techo: t.id_techo,
            ct_area_id: t.ct_area_id,
            ct_capitulo_id: t.ct_capitulo_id,
            ct_financiamiento_id: t.ct_financiamiento_id,
            cantidad_presupuestada: t.cantidad_presupuestada,
            ct_usuario_in: t.ct_usuario_in,
            ct_usuario_at: t.ct_usuario_at,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          }))
        );
      } else {
        console.warn(`⚠️ No se encontraron techos presupuestales para las áreas_fin [${areasFiltradas.join(', ')}]`);
      }
    }

    console.log(`🔍 Aplicando filtro: ${filtroAplicado}`);

    const [ceilings, areaMap] = await Promise.all([
      promette.dt_techo_presupuesto.findAll({
        where: whereClause,
        include: [
          {
            model: promette.rl_area_financiero,
            as: "ct_area",
            attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
          },
          {
            model: promette.ct_capitulo,
            as: "ct_capitulo",
            attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
          },
          {
            model: promette.ct_financiamiento,
            as: "ct_financiamiento",
            attributes: ["id_financiamiento", "nombre_financiamiento"],
          },
        ],
      }),
      getInfraAreas(),
    ]);

    console.log(`✅ Techos encontrados: ${ceilings.length}`);

    // Define interfaces for the data structure
    interface Financiamiento {
      id_financiamiento: number | string;
      nombre_financiamiento: string;
      cantidad: number;
    }

    interface Capitulo {
      id_capitulo: number | string;
      nombre_capitulo: string;
      financiamientos: Record<string | number, Financiamiento>;
      total_capitulo: number;
    }

    interface Area {
      id_area: number | string;
      nombre_area: string;
      capitulos: Record<string | number, Capitulo>;
      total_area: number;
    }

    const areasSummary: Record<string | number, Area> = {};

    ceilings.forEach((ceiling: any) => {
      const areaId = ceiling.ct_area_id;
      const areaInfraId =
        ceiling.ct_area && ceiling.ct_area.id_area_infra
          ? ceiling.ct_area.id_area_infra
          : areaId;
      const areaName = areaMap[areaInfraId] || "Área Desconocida";
      const capituloId = ceiling.ct_capitulo_id;
      const capituloName =
        ceiling.ct_capitulo?.nombre_capitulo || "Capítulo Desconocido";
      const financiamientoName =
        ceiling.ct_financiamiento?.nombre_financiamiento ||
        "Financiamiento Desconocido";
      const cantidad = parseFloat(ceiling.cantidad_presupuestada);

      if (!areasSummary[areaId]) {
        areasSummary[areaId] = {
          id_area: areaId,
          nombre_area: areaName,
          capitulos: {},
          total_area: 0,
        };
      }

      if (!areasSummary[areaId].capitulos[capituloId]) {
        areasSummary[areaId].capitulos[capituloId] = {
          id_capitulo: capituloId,
          nombre_capitulo: capituloName,
          financiamientos: {},
          total_capitulo: 0,
        };
      }

      areasSummary[areaId].capitulos[capituloId].financiamientos[
        ceiling.ct_financiamiento_id
      ] = {
        id_financiamiento: ceiling.ct_financiamiento_id,
        nombre_financiamiento: financiamientoName,
        cantidad: cantidad,
      };

      areasSummary[areaId].capitulos[capituloId].total_capitulo += cantidad;
      areasSummary[areaId].total_area += cantidad;
    });

    const result = Object.values(areasSummary).map((area) => {
      return {
        ...area,
        capitulos: Object.values(area.capitulos).map((capitulo) => {
          return {
            ...capitulo,
            financiamientos: Object.values(capitulo.financiamientos),
          };
        }),
      };
    });

    console.log(`✅ Áreas procesadas: ${result.length}`);
    console.log(`✅ Total general: ${result.reduce((sum, area) => sum + area.total_area, 0)}`);
    console.log(`📊 Filtro aplicado: ${filtroAplicado}`);

    return res.status(200).json({
      totals: result,
      grandTotal: result.reduce((sum, area) => sum + area.total_area, 0),
      filtroAplicado: filtroAplicado
    });
  } catch (error: any) {
    console.error("Error in getTotalBudgetByArea:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check if it's a database connection error
    if (error.name === 'SequelizeConnectionError') {
      return res.status(500).json({ 
        msg: "Error de conexión con la base de datos",
        error: error.message 
      });
    }
    
    // Check if it's a model initialization error
    if (!promette) {
      return res.status(500).json({ 
        msg: "Error: Modelos de base de datos no inicializados",
        error: "Los modelos de Promette no están disponibles"
      });
    }
    
    return res.status(500).json({ 
      msg: "Error interno del servidor",
      error: error.message 
    });
  }
};

// GET - Obtener el total de presupuesto por área específica
export const getTotalBudgetByAreaId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_area } = req.params;

  try {
    const [ceilings, areaMap] = await Promise.all([
      promette.dt_techo_presupuesto.findAll({
        where: { ct_area_id: id_area },
        include: [
          {
            model: promette.rl_area_financiero,
            as: "ct_area",
            attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
          },
          {
            model: promette.ct_capitulo,
            as: "ct_capitulo",
            attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
          },
          {
            model: promette.ct_financiamiento,
            as: "ct_financiamiento",
            attributes: ["id_financiamiento", "nombre_financiamiento"],
          },
        ],
      }),
      getInfraAreas(),
    ]);

    if (ceilings.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron techos presupuestales para esta área",
      });
    }

    // Define interfaces for the data structure
    interface Financiamiento {
      id_financiamiento: number | string;
      nombre_financiamiento: string;
      cantidad: number;
    }

    interface Capitulo {
      id_capitulo: number | string;
      nombre_capitulo: string;
      financiamientos: Record<string | number, Financiamiento>;
      total_capitulo: number;
    }
    const areaInfraId =
      ceilings[0].ct_area &&
      ceilings[0].ct_area.id_area_infra
        ? ceilings[0].ct_area.id_area_infra
        : parseInt(id_area);
    const areaName = areaMap[areaInfraId] || "Área Desconocida";

    const areaSummary: {
      id_area: number;
      nombre_area: string;
      capitulos: Record<string | number, Capitulo>;
      total_area: number;
    } = {
      id_area: parseInt(id_area),
      nombre_area: areaName,
      capitulos: {},
      total_area: 0,
    };

    ceilings.forEach((ceiling: any) => {
      const capituloId = ceiling.ct_capitulo_id;
      const capituloName =
        ceiling.ct_capitulo?.nombre_capitulo || "Capítulo Desconocido";
      const financiamientoName =
        ceiling.ct_financiamiento?.nombre_financiamiento ||
        "Financiamiento Desconocido";
      const cantidad = parseFloat(ceiling.cantidad_presupuestada);

      if (!areaSummary.capitulos[capituloId]) {
        areaSummary.capitulos[capituloId] = {
          id_capitulo: capituloId,
          nombre_capitulo: capituloName,
          financiamientos: {},
          total_capitulo: 0,
        };
      }

      areaSummary.capitulos[capituloId].financiamientos[
        ceiling.ct_financiamiento_id
      ] = {
        id_financiamiento: ceiling.ct_financiamiento_id,
        nombre_financiamiento: financiamientoName,
        cantidad: cantidad,
      };

      areaSummary.capitulos[capituloId].total_capitulo += cantidad;
      areaSummary.total_area += cantidad;
    });

    const formattedAreaSummary = {
      ...areaSummary,
      capitulos: Object.values(areaSummary.capitulos).map((capitulo) => {
        return {
          ...capitulo,
          financiamientos: Object.values(capitulo.financiamientos),
        };
      }),
    };

    return res.status(200).json({
      areaSummary: formattedAreaSummary,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Error al calcular el total de presupuesto para el área" });
  }
};

// Obtener todas las áreas de infraestructura (solo las que tienen relación en rl_area_financiero)
export const getAllInfraAreas = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const url = `${process.env.INFRAESTRUCTURA_API}/area`;
    const response = await axios.get(url);


    const areaFinancieros = await promette.rl_area_financiero.findAll({
      attributes: ["id_area_infra", "id_financiero", "id_area_fin"],
    });
    const validAreaIds = new Set(
      areaFinancieros.map((af: any) => af.id_area_infra)
    );

    // Mapear solo las áreas de infraestructura que tienen relación en rl_area_financiero
    let areas: any[] = [];
    if (Array.isArray(response.data)) {
      areas = response.data
        .filter((area: any) => validAreaIds.has(area.id_area))
        .map((area: any) => {
          const areaFin = areaFinancieros.find(
            (af: any) => af.id_area_infra === area.id_area
          );
          return {
            ...area,
            id_financiero: areaFin ? areaFin.id_financiero : null,
            id_area_fin: areaFin ? areaFin.id_area_fin : null, // <-- agrega id_area_fin
          };
        });
    } else if (Array.isArray(response.data.areas)) {
      areas = response.data.areas
        .filter((area: any) => validAreaIds.has(area.id_area))
        .map((area: any) => {
          const areaFin = areaFinancieros.find(
            (af: any) => af.id_area_infra === area.id_area
          );
          return {
            ...area,
            id_financiero: areaFin ? areaFin.id_financiero : null,
            id_area_fin: areaFin ? areaFin.id_area_fin : null, // <-- agrega id_area_fin
          };
        });
    }

    return res.status(200).json({ administrativeUnits: areas });
  } catch (err) {
    console.error("Error al obtener áreas de infraestructura:", err);
    return res.status(500).json({
      msg: "Error al obtener las áreas de infraestructura",
      administrativeUnits: [],
    });
  }
};

/**
 * Controller function to create multiple product requisitions by month
 * for a specific budget ceiling
 */
export const createBatchRequisitions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      dt_techo_id, // ID of budget ceiling
      ct_area_id, // Area ID
      ct_usuarios_in, // User ID making the request
      productos, // Array of product requisitions
    } = req.body;

    // Validate required fields
    if (
      !dt_techo_id ||
      !ct_area_id ||
      !ct_usuarios_in ||
      !productos ||
      !Array.isArray(productos)
    ) {
      return res.status(400).json({
        success: false,
        msg: "Datos incompletos o inválidos para crear las requisiciones",
      });
    }

    // Validate budget ceiling exists
    const techo = await promette.dt_techo_presupuesto.findByPk(dt_techo_id);
    if (!techo) {
      return res.status(404).json({
        success: false,
        msg: `No existe el techo presupuestal con ID ${dt_techo_id}`,
      });
    }

    // Validate area exists
    const area = await promette.ct_area.findByPk(ct_area_id);
    if (!area) {
      return res.status(404).json({
        success: false,
        msg: `No existe el área con ID ${ct_area_id}`,
      });
    }

    // Validate each product and prepare batch creation
    const requisicionesValidas = [];
    const errores = [];

    for (const producto of productos) {
      const { ct_productos_id, meses, cantidad_total } = producto;

      // Check product exists
      const productoExiste = await promette.ct_producto_consumible.findByPk(
        ct_productos_id
      );
      if (!productoExiste) {
        errores.push(`El producto con ID ${ct_productos_id} no existe`);
        continue;
      }

      // Process monthly allocations if provided
      if (meses && Array.isArray(meses)) {
        // Create individual requisition for each month
        for (const mesData of meses) {
          const { mes, cantidad } = mesData;
          if (!cantidad || cantidad <= 0) {
            continue;
          }

          requisicionesValidas.push({
            ct_area_id,
            dt_techo_id,
            ct_productos_id,
            cantidad,
            mes: mes.toString(),
            ct_usuarios_in,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else if (cantidad_total && cantidad_total > 0) {
        requisicionesValidas.push({
          ct_area_id,
          dt_techo_id,
          ct_productos_id,
          cantidad: cantidad_total,
          mes: "0",
          ct_usuarios_in,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        errores.push(
          `El producto con ID ${ct_productos_id} no tiene cantidades asignadas`
        );
      }
    }

    if (requisicionesValidas.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No se pudieron crear requisiciones con los datos proporcionados",
        errores:
          errores.length > 0
            ? errores
            : ["No hay cantidades válidas para procesar"],
      });
    }

    const requisicionesCreadas =
      await promette.rl_producto_requisicion.bulkCreate(requisicionesValidas);
    const totalRequisitions = requisicionesCreadas.length;
    let totalAmount = 0;

    for (const req of requisicionesValidas) {
      const producto = await promette.ct_producto_consumible.findByPk(
        req.ct_productos_id
      );
      if (producto && producto.precio) {
        totalAmount += producto.precio * req.cantidad;
      }
    }

    try {
      const proyectoAnual = await promette.dt_proyecto_anual.findOne({
        where: { dt_techo_id, estado: 1 },
      });

      if (proyectoAnual) {
        const montoUtilizadoActual = parseFloat(
          proyectoAnual.monto_utilizado.toString() || "0"
        );
        const montoAsignado = parseFloat(
          proyectoAnual.monto_asignado.toString() || "0"
        );

        const nuevoMontoUtilizado = montoUtilizadoActual + totalAmount;
        const nuevoMontoDisponible = montoAsignado - nuevoMontoUtilizado;

        await proyectoAnual.update({
          monto_utilizado: nuevoMontoUtilizado,
          monto_disponible: nuevoMontoDisponible,
        });
      }
    } catch (projectError) {
      console.error("Error actualizando proyecto anual:", projectError);
      // Continue execution even if project update fails
    }

    return res.status(201).json({
      success: true,
      msg: "Requisiciones creadas correctamente",
      total_requisiciones: totalRequisitions,
      total_costo: totalAmount,
      requisiciones: requisicionesCreadas,
      errores: errores.length > 0 ? errores : undefined,
    });
  } catch (error) {
    console.error("Error al crear requisiciones en lote:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al procesar las requisiciones",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Controller function to create monthly requisitions for a single product
 */
export const createMonthlyRequisitions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      ct_area_id,
      ct_usuario_id,
      ct_producto_id,
      requisicionesMensuales,
    } = req.body;

    // Validate required fields
    if (
      !ct_area_id ||
      !ct_usuario_id ||
      !ct_producto_id ||
      !requisicionesMensuales ||
      !Array.isArray(requisicionesMensuales)
    ) {
      return res.status(400).json({
        success: false,
        msg: "Datos incompletos o inválidos para crear las requisiciones mensuales",
      });
    }

    // Validate product exists
    const producto = await promette.ct_producto_consumible.findByPk(
      ct_producto_id
    );
    if (!producto) {
      return res.status(404).json({
        success: false,
        msg: `No existe el producto con ID ${ct_producto_id}`,
      });
    }

    // Prepare batch creation
    const requisicionesValidas = [];

    // Process each monthly requisition
    for (const req of requisicionesMensuales) {
      const { mes, cantidad } = req;

      // Skip months with zero quantity
      if (!cantidad || cantidad <= 0) {
        continue;
      }

      requisicionesValidas.push({
        ct_area_id,
        dt_techo_id: null, // Will be set by frontend if known
        ct_productos_id: ct_producto_id,
        cantidad,
        mes: mes.toString(),
        ct_usuarios_in: ct_usuario_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    if (requisicionesValidas.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No se pudieron crear requisiciones con los datos proporcionados",
        error: "No hay cantidades válidas para procesar",
      });
    }
    const requisicionesCreadas =
      await promette.rl_producto_requisicion.bulkCreate(requisicionesValidas);
    const totalRequisitions = requisicionesCreadas.length;
    const totalCantidad = requisicionesValidas.reduce(
      (sum, req) => sum + parseFloat(req.cantidad.toString()),
      0
    );
    const totalCosto = producto.precio ? producto.precio * totalCantidad : 0;

    return res.status(201).json({
      success: true,
      msg: "Requisiciones mensuales creadas correctamente",
      total_requisiciones: totalRequisitions,
      total_cantidad: totalCantidad,
      total_costo: totalCosto,
      requisiciones: requisicionesCreadas,
    });
  } catch (error) {
    console.error("Error al crear requisiciones mensuales:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al procesar las requisiciones mensuales",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Controller function to create bulk monthly requisitions for multiple products
 */
export const createBulkMonthlyRequisitions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { gruposRequisiciones } = req.body;
    if (
      !gruposRequisiciones ||
      !Array.isArray(gruposRequisiciones) ||
      gruposRequisiciones.length === 0
    ) {
      return res.status(400).json({
        success: false,
        msg: "Datos inválidos. Se espera un array de grupos de requisiciones",
      });
    }
    const requisicionesValidas = [];
    const errores = [];
    let totalRequisiciones = 0;
    let totalCosto = 0;
    for (const grupo of gruposRequisiciones) {
      const {
        ct_area_id,
        ct_usuario_id,
        ct_producto_id,
        requisicionesMensuales,
      } = grupo;

      // Validate required fields
      if (
        !ct_area_id ||
        !ct_usuario_id ||
        !ct_producto_id ||
        !requisicionesMensuales ||
        !Array.isArray(requisicionesMensuales)
      ) {
        errores.push(
          `Grupo para producto ID ${ct_producto_id} tiene datos incompletos`
        );
        continue;
      }

      // Validate product exists
      const producto = await promette.ct_producto_consumible.findByPk(
        ct_producto_id
      );
      if (!producto) {
        errores.push(`No existe el producto con ID ${ct_producto_id}`);
        continue;
      }

      // Process monthly requisitions for this group
      let productoTieneCantidades = false;

      for (const req of requisicionesMensuales) {
        const { mes, cantidad } = req;

        // Skip months with zero quantity
        if (!cantidad || cantidad <= 0) {
          continue;
        }

        productoTieneCantidades = true;
        requisicionesValidas.push({
          ct_area_id,
          dt_techo_id: grupo.dt_techo_id || null, // Use techo ID if provided
          ct_productos_id: ct_producto_id,
          cantidad,
          mes: mes.toString(),
          ct_usuarios_in: ct_usuario_id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Calculate cost for this requisition
        if (producto.precio) {
          totalCosto += producto.precio * cantidad;
        }
      }

      if (!productoTieneCantidades) {
        errores.push(
          `El producto con ID ${ct_producto_id} no tiene cantidades válidas`
        );
      }
    }

    // If no valid requisitions were created, return error
    if (requisicionesValidas.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No se pudieron crear requisiciones con los datos proporcionados",
        errores,
      });
    }

    // Bulk create all valid requisitions
    const requisicionesCreadas =
      await promette.rl_producto_requisicion.bulkCreate(requisicionesValidas);
    totalRequisiciones = requisicionesCreadas.length;

    return res.status(201).json({
      success: true,
      msg: "Requisiciones mensuales creadas correctamente",
      total_requisiciones: totalRequisiciones,
      total_costo: totalCosto,
      errores: errores.length > 0 ? errores : undefined,
    });
  } catch (error) {
    console.error("Error al crear requisiciones mensuales en bulk:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al procesar las requisiciones mensuales en bulk",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// GET - Endpoint de diagnóstico temporal para techos
export const getDiagnosticTotals = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Verificar que los modelos estén inicializados
    if (!promette) {
      console.error("Error: Modelos de Promette no están inicializados");
      return res.status(500).json({ 
        msg: "Error: Modelos de base de datos no inicializados",
        error: "Los modelos de Promette no están disponibles"
      });
    }

    // Obtener el ID del usuario del token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    let userId = null;
    
    if (token) {
      try {
        const decoded: any = verifyToken(token);
        userId = decoded.id;
      } catch (err) {
        console.error("Error al decodificar el token:", err);
      }
    }

    if (!userId) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    // Obtener el puesto actual del usuario
    const usuarioPuesto = await promette.rl_usuario_puesto.findOne({
      where: { 
        ct_usuario_id: userId,
        estado: 1,
        periodo_final: null // Puesto actual
      },
      include: [
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["id_puesto", "nombre_puesto", "ct_area_id"]
        }
      ]
    });

    // Información de diagnóstico
    const diagnosticInfo: {
      userId: number | null;
      usuarioPuesto: {
        puestoId: number;
        nombrePuesto: string;
        areaId: number | null;
      } | null;
      totalTechos: number;
      techosSinFiltro: Array<{
        id_techo: number;
        ct_area_id: number;
        cantidad_presupuestada: number;
        capitulo: string | undefined;
        financiamiento: string | undefined;
      }>;
      areasAnalista: number[];
      areaFinanciera: {
        id_area_fin: number;
        id_area_infra: number;
        id_financiero: number;
      } | null;
      areasFiltradas: (number | string)[];
    } = {
      userId,
      usuarioPuesto: usuarioPuesto ? {
        puestoId: usuarioPuesto.ct_puesto.id_puesto,
        nombrePuesto: usuarioPuesto.ct_puesto.nombre_puesto,
        areaId: usuarioPuesto.ct_puesto.ct_area_id
      } : null,
      totalTechos: 0,
      techosSinFiltro: [],
      areasAnalista: [],
      areaFinanciera: null,
      areasFiltradas: []
    };

    // Contar total de techos sin filtro
    const totalTechos = await promette.dt_techo_presupuesto.count();
    diagnosticInfo.totalTechos = totalTechos;

    // Obtener algunos techos de ejemplo sin filtro
    const techosEjemplo = await promette.dt_techo_presupuesto.findAll({
      limit: 5,
      include: [
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
        },
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
        {
          model: promette.ct_financiamiento,
          as: "ct_financiamiento",
          attributes: ["id_financiamiento", "nombre_financiamiento"],
        },
      ],
    });

    diagnosticInfo.techosSinFiltro = techosEjemplo.map((techo: any) => ({
      id_techo: techo.id_techo,
      ct_area_id: techo.ct_area_id,
      cantidad_presupuestada: techo.cantidad_presupuestada,
      capitulo: techo.ct_capitulo?.nombre_capitulo,
      financiamiento: techo.ct_financiamiento?.nombre_financiamiento
    }));

    if (usuarioPuesto) {
      const puestoId = usuarioPuesto.ct_puesto.id_puesto;
      const areaId = usuarioPuesto.ct_puesto.ct_area_id;

      if (puestoId === 1806) {
        // ✅ CORRECCIÓN: Puesto 1806 muestra TODO
        diagnosticInfo.areasFiltradas = ["TODOS LOS TECHOS"];
        console.log("🔓 Puesto 1806 - Acceso completo a todos los techos");

      } else if (puestoId === 258) {
        // Verificar áreas asignadas al analista
        const areasAnalista = await promette.rl_analista_unidad.findAll({
          where: { 
            ct_usuario_id: userId,
            estado: 1 
          },
          attributes: ['rl_area_financiero']
        });

        diagnosticInfo.areasAnalista = areasAnalista.map((area: any) => area.rl_area_financiero);
        diagnosticInfo.areasFiltradas = areasAnalista.map((area: any) => area.rl_area_financiero);

      } else {
        // Verificar área financiera del usuario
        if (areaId) {
          const areaFinanciera = await promette.rl_area_financiero.findOne({
            where: { id_area_infra: areaId }
          });

          if (areaFinanciera) {
            diagnosticInfo.areaFinanciera = {
              id_area_fin: areaFinanciera.id_area_fin,
              id_area_infra: areaFinanciera.id_area_infra,
              id_financiero: areaFinanciera.id_financiero
            };
            diagnosticInfo.areasFiltradas = [areaFinanciera.id_area_fin];
          }
        }
      }
    }

    return res.status(200).json({
      diagnostic: diagnosticInfo,
      msg: "Información de diagnóstico obtenida"
    });

  } catch (error: any) {
    console.error("Error in getDiagnosticTotals:", error);
    return res.status(500).json({ 
      msg: "Error en diagnóstico",
      error: error.message 
    });
  }
};

// GET - Exportar techos presupuestales a Excel
export const exportBudgetCeilingsToExcel = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Redirigir a la función del controlador de Excel
  await generateBudgetCeilingExcel(req, res);
};
