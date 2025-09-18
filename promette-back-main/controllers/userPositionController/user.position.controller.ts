import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";
import axios from "axios";


// Controlador para obtener todos los usuarios
export const getAllPositionByUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_usuario } = req.params;
  try {
    // Obtener todos los usuarios de la base de datos
    const userPosition = await promette.rl_usuario_puesto.findAll({
      attributes: [
        "id_usuario_puesto",
        "ct_usuario_id",
        "ct_puesto_id",
        "periodo_inicio",
        "periodo_final",
        "plaza",
        "ct_sindicato_id",
        "estado",
        "ct_usuario_in",
        "ct_usuario_at",
      ],
      include: [
        {
          model: promette.ct_puesto,
          attributes: ["nombre_puesto","ct_area_id"],
          as: "ct_puesto", // Usa el alias definido
        },
        {
          model: promette.ct_sindicato,
          as: "ct_sindicato",
          attributes: ["nombre_sindicato"],
        },
      ],
      where: {
        estado: 1, // Solo registros activos
        ct_usuario_id: id_usuario,
      },
    });

    if (userPosition.length === 0) {
      return res.status(200).json({
        msg: "Sin puestos asignados",
      });
    }

    if (!userPosition) {
      return res.status(404).json({
        msg: "No se encontraron las relaciones",
      });
    }

    return res.status(200).json({
      userPosition,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener las relaciones",
    });
  }
};

// Controlador para obtener un usuario por ID
export const getUserPositionById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_usuario_puesto } = req.params;

  try {
    // Buscar un usuario por su ID
    const userPosition = await promette.rl_usuario_puesto.findByPk(
      id_usuario_puesto,
      {
        include: [
          {
            model: promette.ct_puesto,
            as: "ct_puesto", // Asegúrate de que el alias coincida con la relación definida en el modelo
            attributes: ["nombre_puesto"],
          },
          {
            model: promette.ct_sindicato,
            as: "ct_sindicato", // Asegúrate de que el alias coincida con la relación definida en el modelo
            attributes: ["nombre_sindicato"],
          },
        ],
      }
    );

    if (!userPosition) {
      return res.status(404).json({
        msg: "Relación no encontrada",
      });
    }

    return res.status(200).json({
      userPosition,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el usuario",
    });
  }
};

export const registerUserPosition = async (req: Request, res: Response) => {
  const {
    ct_usuario_id,
    ct_puesto_id,
    periodo_inicio,
    periodo_final,
    plaza,
    ct_sindicato_id,
    ct_usuario_in,
    ct_usuario_at,
  } = req.body;

  try {
    const newUserPosition = await promette.rl_usuario_puesto.create({
      //where: { ct_puesto_id, ct_usuario_id },
      //defaults: {
      ct_usuario_id,
      ct_puesto_id,
      periodo_inicio,
      periodo_final,
      plaza,
      ct_sindicato_id,
      ct_usuario_in,
      ct_usuario_at,
      //},
    });
    res.status(201).json({
      msg: "La relación se ha creado correctamente",
      newUserPosition,
    });
  } catch (error) {
    console.log(error);
    res.status(422).json({
      msg: "Error en la peticion ",
    });
  }
};
export const updateUserPosition = async (req: Request, res: Response) => {
  const {
    id_usuario_puesto,
    ct_usuario_id,
    ct_puesto_id,
    periodo_inicio,
    periodo_final,
    plaza,
    ct_sindicato_id,
    ct_usuario_at,
  } = req.body;

  try {
    //Actualizar
    const currentUserPosition = await promette.rl_usuario_puesto.update(
      {
        ct_usuario_id,
        ct_puesto_id,
        periodo_inicio,
        periodo_final,
        plaza,
        ct_sindicato_id,
        ct_usuario_at,
      },
      {
        where: {
          id_usuario_puesto,
        },
      }
    );

    if (!currentUserPosition) {
      res.status(400).json({
        msg: "Error en la actualización",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentUserPosition,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la actualización",
    });
  }
};

export const deleteUserPosition = async (req: Request, res: Response) => {
  const { id_usuario_puesto, ct_usuario_at } = req.body;

  try {
    //Actualizar
    const currentUserPosition = await promette.rl_usuario_puesto.update(
      {
        estado: 0,
        ct_usuario_at,
      },
      {
        where: {
          id_usuario_puesto,
        },
      }
    );

    if (!currentUserPosition) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentUserPosition,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};

// Controlador para obtener usuarios por puesto
export const getUsersByPosition = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ct_puesto_id } = req.params;

  try {
    // Buscar asignaciones de usuario-puesto por ID de puesto
    const userPositions = await promette.rl_usuario_puesto.findAll({
      where: {
        ct_puesto_id,
        estado: 1,
      },
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
          attributes: ["id_usuario", "nombre_usuario", "email"],
        },
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["nombre_puesto"],
        },
      ],
      order: [["createdAt", "DESC"]], // Ordenar por fecha de creación descendente
    });

    if (userPositions.length === 0) {
      return res.status(404).json({
        msg: `No se encontraron usuarios para el puesto ID ${ct_puesto_id}`,
      });
    }

    //
    const users = userPositions.map(
      (position: {
        id_usuario_puesto: any;
        ct_usuario: { id_usuario: any; nombre_usuario: any; email: any };
        ct_puesto: { nombre_puesto: any };
        periodo_inicio: any;
        periodo_final: any;
      }) => ({
        id_usuario_puesto: position.id_usuario_puesto,
        id_usuario: position.ct_usuario.id_usuario,
        nombre_usuario: position.ct_usuario.nombre_usuario,
        email: position.ct_usuario.email,
        puesto: position.ct_puesto.nombre_puesto,
        periodo_inicio: position.periodo_inicio,
        periodo_final: position.periodo_final,
      })
    );

    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Error al obtener usuarios por puesto:", error);
    return res.status(500).json({
      msg: "Error al obtener los usuarios por puesto",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Controlador para obtener usuarios por puestos específicos (ids: 31, 35, 208, 282)
export const obtenerUsuariosPorPuestosEspecificos = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const puestosIds = [31, 35, 208, 282, 258]; // añadir o quitar id puesto de ct_puesto
    // Buscar asignaciones de usuario-puesto por IDs de puesto
    const userPositions = await promette.rl_usuario_puesto.findAll({
      where: {
        ct_puesto_id: {
          [Op.in]: puestosIds,
        },
        estado: 1,
      },
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
          attributes: ["id_usuario", "nombre_usuario", "email", "curp"],
        },
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["id_puesto", "nombre_puesto"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (userPositions.length === 0) {
      return res.status(404).json({
        msg: `No se encontraron usuarios para los puestos específicos`,
      });
    }

    // Extraer el token JWT del encabezado de autorización de la solicitud entrante
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    // Mejorar el procesamiento de usuarios con datos de RUPEET
    // Recopilamos todos los CURPs únicos para hacer menos llamadas
    const userCurps = [
      ...new Set(
        userPositions
          .map((position: any) => position.ct_usuario?.curp) // Corregido: Añadido operador opcional para evitar error
          .filter(Boolean)
      ),
    ];

    // Objeto para almacenar información de RUPEET por CURP
    const rupeetDataByCurp: Record<string, string | null> = {};

    // Obtenemos datos de RUPEET para todos los CURPs en paralelo
    if (userCurps.length > 0) {
      try {
        const rupeetApiUrl = `${process.env.RUPEET_API}/users/details`;
        const config = {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        };

        // Realizamos las consultas en paralelo para mejor rendimiento
        const rupeetPromises = userCurps.map(async (curp) => {
          try {
            console.log(`Consultando RUPEET para CURP: ${curp}`);
            const response = await axios.post(rupeetApiUrl, { curp }, config);

            // Verificar que la respuesta tenga la estructura esperada
            if (response.data?.usuario?.informacion_rupeet?.datos_personales) {
              const datos =
                response.data.usuario.informacion_rupeet.datos_personales;
              // Construir nombre completo con verificación de existencia
              const nombre = datos.nombre || "";
              const apellidoPaterno = datos.apellido_paterno || "";
              const apellidoMaterno = datos.apellido_materno || "";
              const fullName =
                `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
              return { curp, fullName: fullName || null };
            }
            return { curp, fullName: null };
          } catch (error) {
            console.error(
              `Error al obtener datos de RUPEET para CURP ${curp}:`,
              error instanceof Error ? error.message : String(error)
            );
            return { curp, fullName: null };
          }
        });

        const rupeetResults = await Promise.all(rupeetPromises);

        // Almacenar resultados por CURP para acceso rápido
        rupeetResults.forEach((result) => {
          // Asegurarse de que result.curp sea un string válido antes de usarlo como índice
          if (result && typeof result.curp === "string") {
            rupeetDataByCurp[result.curp] = result.fullName;
          }
        });
      } catch (error) {
        console.error(
          "Error en procesamiento masivo de RUPEET:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // Agrupar usuarios por ID para concatenar puestos
    const userMap = new Map();
    for (const position of userPositions) {
      if (!position || !position.ct_usuario) {
        console.warn("Posición sin usuario asignado, omitiendo registro");
        continue;
      }

      const userId = position.ct_usuario.id_usuario;
      const userCurp = position.ct_usuario.curp;

      // Obtener nombre de usuario de diferentes fuentes en orden de prioridad
      let userName = position.ct_usuario.nombre_usuario || "";

      // Verificar que userCurp sea un string válido antes de usarlo como índice
      if (
        userCurp &&
        typeof userCurp === "string" &&
        rupeetDataByCurp[userCurp]
      ) {
        userName = rupeetDataByCurp[userCurp] || userName;
      }
      // Si no tenemos datos de RUPEET pero tenemos el CURP, intentar una consulta individual
      else if (
        userCurp &&
        typeof userCurp === "string" &&
        !rupeetDataByCurp[userCurp]
      ) {
        try {
          const rupeetApiUrl = `${process.env.RUPEET_API}/users/details`;
          const config = {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          };

          const rupeetResponse = await axios.post(
            rupeetApiUrl,
            { curp: userCurp },
            config
          );

          if (
            rupeetResponse.data?.usuario?.informacion_rupeet?.datos_personales
          ) {
            const rupeetData =
              rupeetResponse.data.usuario.informacion_rupeet.datos_personales;

            // Crear nombre completo con los datos de RUPEET
            const fullName = `${rupeetData.nombre || ""} ${
              rupeetData.apellido_paterno || ""
            } ${rupeetData.apellido_materno || ""}`.trim();

            if (fullName && fullName.trim() !== "") {
              userName = fullName;
              console.log(`Nombre actualizado desde RUPEET: ${userName}`);
            }
          }
        } catch (error) {
          console.error(
            `Error al obtener información RUPEET para CURP ${userCurp}:`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }

      // Si después de todo, aún no tenemos nombre, usar mensaje por defecto
      if (!userName || userName.trim() === "") {
        userName = "No se ha registrado en RUPEET";
      }

      // Verificar que el puesto exista antes de acceder a sus propiedades
      const puestoNombre =
        position.ct_puesto?.nombre_puesto || "Sin puesto asignado";

      // Si el usuario ya existe en el mapa, concatenar el puesto
      if (userMap.has(userId)) {
        const existingUser = userMap.get(userId);
        existingUser.puesto += `, ${puestoNombre}`;
        userMap.set(userId, existingUser);
      } else {
        // Crear un nuevo registro para el usuario con validación de propiedades
        userMap.set(userId, {
          id_usuario_puesto: position.id_usuario_puesto,
          id_usuario: userId,
          nombre_usuario: userName,
          email: position.ct_usuario.email || "",
          id_puesto: position.ct_puesto?.id_puesto || null,
          puesto: puestoNombre,
          periodo_inicio: position.periodo_inicio,
          periodo_final: position.periodo_final,
        });
      }
    }

    // Convertir el mapa a un array para la respuesta
    const users = Array.from(userMap.values());

    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(
      "Error al obtener usuarios por puestos específicos:",
      error instanceof Error ? error.message : String(error)
    );
    return res.status(500).json({
      msg: "Error al obtener los usuarios por puestos específicos",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
const getInfrastructureAreas = async () => {
  try {
    const response = await axios.get(`${process.env.INFRAESTRUCTURA_API}/area`);

    if (response.data && Array.isArray(response.data)) {
      const areasMap = new Map();
      response.data.forEach((area: any) => {
        areasMap.set(area.id_area, area.nombre);
      });
      return areasMap;
    }
    return new Map();
  } catch (error) {
    console.error("Error al obtener áreas de infraestructura:", error);
    return new Map();
  }
};

export const obtenerAreaFinancieroPorPuesto = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_puesto } = req.params;

  try {
    console.log(
      `🔍 Iniciando búsqueda de área financiera para puesto ID: ${id_puesto}`
    );

    // PASO 1: Buscar el puesto por ID con información completa según ct_puesto.ts
    const puesto = await promette.ct_puesto.findByPk(id_puesto, {
      attributes: [
        "id_puesto",
        "nombre_puesto",
        "ct_area_id",
        "ct_puesto_superior_id",
        "estado",
        "descripcion",
        "ct_usuario_in",
        "ct_usuario_at",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: promette.ct_area,
          as: "ct_area",
          attributes: ["id_area", "nombre_area", "indice"],
          include: [
            {
              model: promette.ct_departamento_sistema,
              as: "ct_departamento",
              attributes: ["id_departamento", "nombre_departamento"],
              required: false,
              include: [
                {
                  model: promette.ct_direccion_sistema,
                  as: "ct_direccion",
                  attributes: ["id_direccion", "nombre_direccion"],
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuario_in_ct_usuario",
          attributes: ["id_usuario", "nombre_usuario", "email"],
          required: false,
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuario_at_ct_usuario",
          attributes: ["id_usuario", "nombre_usuario", "email"],
          required: false,
        },
      ],
    });

    if (!puesto) {
      console.log(`Puesto con ID ${id_puesto} no encontrado`);
      return res.status(404).json({
        success: false,
        msg: `Puesto con ID ${id_puesto} no encontrado`,
        error_type: "PUESTO_NOT_FOUND",
      });
    }

    console.log(`Puesto encontrado:`, {
      id_puesto: puesto.id_puesto,
      nombre_puesto: puesto.nombre_puesto,
      ct_area_id: puesto.ct_area_id,
    });

    // PASO 2: Buscar la vinculación en rl_area_financiero según rl_area_financiero.ts
    const vinculacionAreaFinanciera = await promette.rl_area_financiero.findOne(
      {
        where: {
          id_area_infra: puesto.ct_area_id, // ✅ VINCULACIÓN: ct_puesto.ct_area_id -> rl_area_financiero.id_area_infra
        },
        attributes: [
          "id_area_fin",
          "id_financiero",
          "id_area_infra",
          "ct_usuario_in",
          "ct_usuario_at",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: promette.ct_usuario,
            as: "ct_usuario_in_ct_usuario",
            attributes: ["id_usuario", "nombre_usuario", "email"],
            required: false,
          },
          {
            model: promette.ct_usuario,
            as: "ct_usuario_at_ct_usuario",
            attributes: ["id_usuario", "nombre_usuario", "email"],
            required: false,
          },
        ],
      }
    );

    // PASO 3: Obtener el mapa de áreas de la API externa
    const areasMap = await getInfrastructureAreas();

    let areaFinancieraInfo = null;
    let nombreAreaExterna = "Sin vinculación con área financiera";
    let tieneVinculacion = false;

    if (vinculacionAreaFinanciera) {
      tieneVinculacion = true;

      // PASO 4: Obtener el nombre del área desde la API externa
      nombreAreaExterna =
        areasMap.get(vinculacionAreaFinanciera.id_area_infra) ||
        "Área no encontrada en API externa";

      console.log(`Vinculación encontrada:`, {
        id_area_fin: vinculacionAreaFinanciera.id_area_fin,
        id_area_infra: vinculacionAreaFinanciera.id_area_infra,
        nombre_desde_api: nombreAreaExterna,
      });

      // PASO 5: Estructurar información del área financiera según atributos de rl_area_financiero.ts
      areaFinancieraInfo = {
        id_area_fin: vinculacionAreaFinanciera.id_area_fin,
        id_financiero: vinculacionAreaFinanciera.id_financiero,
        id_area_infra: vinculacionAreaFinanciera.id_area_infra,
        nombre: nombreAreaExterna,
        usuario_creacion: vinculacionAreaFinanciera.ct_usuario_in_ct_usuario,
        usuario_actualizacion:
          vinculacionAreaFinanciera.ct_usuario_at_ct_usuario,
        created_at: vinculacionAreaFinanciera.createdAt,
        updated_at: vinculacionAreaFinanciera.updatedAt,
      };
    } else {
      console.log(
        `No se encontró vinculación de área financiera para ct_area_id: ${puesto.ct_area_id}`
      );
      nombreAreaExterna =
        areasMap.get(puesto.ct_area_id) || "Área no encontrada en API externa";
    }

    //  Estructurar la respuesta final según atributos de ambos modelos
    const respuesta = {
      success: true,
      data: {
        // Información del puesto según ct_puesto.ts
        puesto: {
          id_puesto: puesto.id_puesto,
          nombre_puesto: puesto.nombre_puesto,
          descripcion: puesto.descripcion,
          ct_area_id: puesto.ct_area_id,
          ct_puesto_superior_id: puesto.ct_puesto_superior_id,
          estado: puesto.estado,
          ct_usuario_in: puesto.ct_usuario_in,
          ct_usuario_at: puesto.ct_usuario_at,
          created_at: puesto.createdAt,
          updated_at: puesto.updatedAt,

          // Información del área local
          area_local: puesto.ct_area
            ? {
                id_area: puesto.ct_area.id_area,
                nombre_area: puesto.ct_area.nombre_area,
                indice: puesto.ct_area.indice,
                departamento: puesto.ct_area.ct_departamento || null,
              }
            : null,

          // 👤 Usuarios relacionados con el puesto
          usuario_creacion: puesto.ct_usuario_in_ct_usuario || null,
          usuario_actualizacion: puesto.ct_usuario_at_ct_usuario || null,
        },

        //  Información de la vinculación según ejemplo solicitado
        vinculacion: {
          id_vinculacion: puesto.ct_area_id, // ID que hace la vinculación
          existe_vinculacion: tieneVinculacion,

          // Área financiera según rl_area_financiero.ts
          area_financiera: areaFinancieraInfo,
        },

        // Información adicional
        nombre_area_externa: nombreAreaExterna,

        // Metadatos
        metadata: {
          tiene_vinculacion_financiera: tieneVinculacion,
          ct_area_id_usado_para_vinculacion: puesto.ct_area_id,
          timestamp: new Date().toISOString(),
          api_externa_consultada: areasMap.size > 0,
        },
      },
    };

    console.log(
      `Respuesta estructurada exitosamente para puesto ${id_puesto}`
    );

    return res.status(200).json(respuesta);
  } catch (error) {
    console.error(
      `Error al obtener área financiera para puesto ${id_puesto}:`,
      error
    );

    return res.status(500).json({
      success: false,
      msg: "Error interno del servidor al obtener información del área financiera por puesto",
      error: error instanceof Error ? error.message : "Error desconocido",
      error_type: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const obtenerPuestosConAreasFinancieras = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log(
      `🔍 Obteniendo todos los puestos activos con sus áreas financieras`
    );

    // PASO 1: Obtener todos los puestos activos según ct_puesto.ts
    const puestos = await promette.ct_puesto.findAll({
      attributes: [
        "id_puesto",
        "nombre_puesto",
        "descripcion",
        "ct_area_id",
        "estado",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: promette.ct_area,
          as: "ct_area",
          attributes: ["id_area", "nombre_area", "indice"],
          required: false,
        },
      ],
      where: {
        estado: 1, // Solo puestos activos
      },
      order: [["nombre_puesto", "ASC"]],
    });

    if (puestos.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No se encontraron puestos activos",
        data: [],
      });
    }

    // PASO 2: Obtener el mapa de áreas externas
    const areasMap = await getInfrastructureAreas();

    // PASO 3: Obtener todas las vinculaciones según rl_area_financiero.ts
    const todasLasVinculaciones = await promette.rl_area_financiero.findAll({
      attributes: [
        "id_area_fin",
        "id_financiero",
        "id_area_infra",
        "createdAt",
      ],
    });

    // Crear mapa para acceso rápido por id_area_infra
    const vinculacionesMap = new Map();
    todasLasVinculaciones.forEach((vinculacion: any) => {
      vinculacionesMap.set(vinculacion.id_area_infra, vinculacion);
    });

    // PASO 4: Procesar cada puesto (corrigiendo tipos implícitos)
    const puestosConAreasFinancieras = puestos.map((puesto: any) => {
      const vinculacion = vinculacionesMap.get(puesto.ct_area_id);
      const nombreAreaExterna =
        areasMap.get(puesto.ct_area_id) || "Área no encontrada";
      const tieneVinculacion = !!vinculacion;

      return {
        // Datos según ct_puesto.ts
        id_puesto: puesto.id_puesto,
        nombre_puesto: puesto.nombre_puesto,
        descripcion: puesto.descripcion,
        ct_area_id: puesto.ct_area_id,
        estado: puesto.estado,
        created_at: puesto.createdAt,
        updated_at: puesto.updatedAt,

        // Área local
        area_local: puesto.ct_area
          ? {
              id_area: puesto.ct_area.id_area,
              nombre_area: puesto.ct_area.nombre_area,
              indice: puesto.ct_area.indice,
            }
          : null,

        // Vinculación según estructura solicitada
        vinculacion: {
          id_vinculacion: puesto.ct_area_id,
          existe_vinculacion: tieneVinculacion,
          area_financiera: tieneVinculacion
            ? {
                // datos según rl_area_financiero.ts
                id_area_fin: vinculacion.id_area_fin,
                id_financiero: vinculacion.id_financiero,
                id_area_infra: vinculacion.id_area_infra,
                nombre: nombreAreaExterna,
                created_at: vinculacion.createdAt,
              }
            : null,
        },

        nombre_area_externa: nombreAreaExterna,
        tiene_vinculacion_financiera: tieneVinculacion,
      };
    });

    console.log(`Procesados ${puestosConAreasFinancieras.length} puestos`);

    return res.status(200).json({
      success: true,
      total: puestosConAreasFinancieras.length,
      data: puestosConAreasFinancieras,
      metadata: {
        total_con_vinculacion: puestosConAreasFinancieras.filter(
          (p: any) => p.tiene_vinculacion_financiera
        ).length,
        total_sin_vinculacion: puestosConAreasFinancieras.filter(
          (p: any) => !p.tiene_vinculacion_financiera
        ).length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`❌ Error al obtener puestos con áreas financieras:`, error);
    return res.status(500).json({
      success: false,
      msg: "Error interno del servidor al obtener puestos con áreas financieras",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
const verificarVinculacionAreaPorId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ct_area_id } = req.params;

  try {
    console.log(`🔍 Verificando vinculación para ct_area_id: ${ct_area_id}`);

    // ✅ Buscar vinculación según rl_area_financiero.ts
    const vinculacion = await promette.rl_area_financiero.findOne({
      where: { id_area_infra: parseInt(ct_area_id) },
      attributes: [
        "id_area_fin",
        "id_financiero",
        "id_area_infra",
        "ct_usuario_in",
        "ct_usuario_at",
        "createdAt",
        "updatedAt",
      ],
    });

    // Obtener nombre del área
    const areasMap = await getInfrastructureAreas();
    const nombreArea =
      areasMap.get(parseInt(ct_area_id)) || "Área no encontrada";

    return res.status(200).json({
      success: true,
      data: {
        ct_area_id: parseInt(ct_area_id),
        tiene_vinculacion: !!vinculacion,
        vinculacion: vinculacion
          ? {
              // Datos completos según rl_area_financiero.ts
              id_area_fin: vinculacion.id_area_fin,
              id_financiero: vinculacion.id_financiero,
              id_area_infra: vinculacion.id_area_infra,
              ct_usuario_in: vinculacion.ct_usuario_in,
              ct_usuario_at: vinculacion.ct_usuario_at,
              created_at: vinculacion.createdAt,
              updated_at: vinculacion.updatedAt,
            }
          : null,
        nombre_area_externa: nombreArea,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`❌ Error al verificar vinculación:`, error);
    return res.status(500).json({
      success: false,
      msg: "Error al verificar vinculación de área",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
