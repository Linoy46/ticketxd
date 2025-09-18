import { Request, Response } from "express";
import { promette, sequelize } from '../../models/database.models';
import { Op, Sequelize, Transaction } from "sequelize";
import axios from "axios";
import Decimal from "decimal.js";

// Interfaces
interface Requisicion {
  id_producto_requisicion: number;
  ct_area_id: number;
  dt_techo_id: number;
  ct_productos_id: number;
  cantidad: number;
  mes: string;
  total: number;
  ct_usuarios_in: number;
  ct_usuarios_at: number | null;
  createdAt: Date;
  updatedAt: Date;
  ct_producto?: {
    id_producto: number;
    nombre_producto: string;
    precio: number;
  };
  ct_area?: {
    id_area_fin: number;
    id_financiero: number;
    id_area_infra: number;
  };
}



// Utilidad para obtener el catálogo de áreas desde la API de infraestructura
async function getInfraAreas(): Promise<Record<number, string>> {
  try {
    const url = `${process.env.INFRAESTRUCTURA_API}/area`;
    const response = await axios.get(url);
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
    return areas;
  } catch (err) {
    console.error("Error al obtener áreas de infraestructura:", err);
    return {};
  }
}

export const createUnifiedRequisition = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let transaction: Transaction | null = null;

  try {


    // Verificar que sequelize existe en promette
    if (!sequelize) {
      console.error(
        "Error: sequelize no está disponible en el objeto promette"
      );
      return res.status(500).json({
        success: false,
        msg: "Error de configuración en la base de datos: Sequelize no está inicializado",
      });
    }

    // Extraer datos del cuerpo de la solicitud
    const {
      dt_techo_id,
      ct_area_id,
      ct_usuario_id,
      justificacion,
      descripcion,
      productos,
    } = req.body;

    // Validaciones básicas
    if (
      !dt_techo_id ||
      !ct_area_id ||
      !ct_usuario_id ||
      !productos ||
      !Array.isArray(productos) ||
      productos.length === 0
    ) {
      return res.status(400).json({
        success: false,
        msg: "Datos incompletos para crear requisiciones",
      });
    }

    // Iniciar transacción
    try {
      transaction = await sequelize.transaction();
      console.log("Transacción iniciada correctamente");
    } catch (error: any) {
      console.error("Error al iniciar transacción:", error);
      return res.status(500).json({
        success: false,
        msg:
          "Error al iniciar transacción en la base de datos: " +
          (error.message || "Error desconocido"),
      });
    }

    // Validar techo presupuestal
    const techo = await promette.dt_techo_presupuesto.findByPk(dt_techo_id, {
      transaction,
    });
    if (!techo) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({
        success: false,
        msg: `Techo presupuestal con ID ${dt_techo_id} no encontrado`,
      });
    }

    // Validar área financiera
    const area = await promette.rl_area_financiero.findByPk(ct_area_id, {
      transaction,
    });
    if (!area) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({
        success: false,
        msg: `Área financiera con ID ${ct_area_id} no encontrada`,
      });
    }

    // Variables para procesar requisiciones
    const requisicionesCreadas = [];
    const partidasSet = new Set();
    let costoTotalRequisiciones = 0;

    // Procesar cada producto
    for (const producto of productos) {
      const { ct_productos_id, meses } = producto;

      if (
        !ct_productos_id ||
        !meses ||
        !Array.isArray(meses) ||
        meses.length === 0
      ) {
        continue;
      }

      // Validar producto
      const productoInfo = await promette.ct_producto_consumible.findByPk(
        ct_productos_id,
        { transaction }
      );
      if (!productoInfo) continue;

      // Guardar la partida para justificaciones
      if (productoInfo.ct_partida_id) {
        partidasSet.add(productoInfo.ct_partida_id);
      }

      // Calcular precio del producto
      const precioProducto = new Decimal(productoInfo.precio || 0);
      let cantidadTotalProducto = new Decimal(0);

      // Crear requisiciones para cada mes
      for (const mes of meses) {
        if (!mes.mes || Number(mes.cantidad) <= 0) continue;

        const cantidad = new Decimal(mes.cantidad);
        cantidadTotalProducto = cantidadTotalProducto.plus(cantidad);

        // Calcular el total para la requisición
        const total = cantidad
          .times(precioProducto)
          .toDecimalPlaces(3)
          .toNumber();

        try {
          // Crear la requisición con el campo total
          const requisicion = await promette.rl_producto_requisicion.create(
            {
              ct_area_id: Number(ct_area_id),
              dt_techo_id: Number(dt_techo_id),
              ct_productos_id: Number(ct_productos_id),
              cantidad: parseFloat(cantidad.toFixed(3)),
              mes: String(mes.mes),
              total,
              ct_usuarios_in: Number(ct_usuario_id),
              ct_usuarios_at: 0,
            },
            { transaction }
          );

          requisicionesCreadas.push(requisicion);
        } catch (error: any) {
          console.error("Error al crear requisición:", error);
          if (transaction) await transaction.rollback();
          return res.status(500).json({
            success: false,
            msg:
              "Error al crear requisición: " +
              (error.message || "Error desconocido"),
          });
        }
      }

      // Sumar al costo total con precisión decimal
      const costoParcial = precioProducto.times(cantidadTotalProducto);
      costoTotalRequisiciones = new Decimal(costoTotalRequisiciones)
        .plus(costoParcial)
        .toDecimalPlaces(3)
        .toNumber();
    }

    // Si no se crearon requisiciones, rollback
    if (requisicionesCreadas.length === 0) {
      if (transaction) await transaction.rollback();
      return res.status(400).json({
        success: false,
        msg: "No se pudieron crear requisiciones con los datos proporcionados",
      });
    }

    // Crear o actualizar justificaciones para cada partida
    const justificacionesCreadas = [];
    if (justificacion && partidasSet.size > 0) {
      for (const partidaId of partidasSet) {
        try {
          // Buscar justificación existente
          const existingJustificacion = await promette.rl_justificacion.findOne(
            {
              where: {
                ct_partida_id: partidaId,
                ct_area_id,
              },
              transaction,
            }
          );

          let justificacionGuardada;
          if (existingJustificacion) {
            // Actualizar justificación existente
            await existingJustificacion.update(
              {
                justificacion,
                ct_usuario_id: ct_usuario_id,
              },
              { transaction }
            );
            justificacionGuardada = existingJustificacion;
          } else {
            // Crear nueva justificación
            justificacionGuardada = await promette.rl_justificacion.create(
              {
                ct_partida_id: partidaId,
                ct_area_id,
                justificacion,
                ct_usuario_id,
              },
              { transaction }
            );
          }

          justificacionesCreadas.push(justificacionGuardada);
        } catch (error) {
          // Continuar con el resto de justificaciones
          console.error("Error al guardar justificación:", error);
        }
      }
    }

    // Actualizar o crear proyecto anual
    let proyectoAnual = null;

    try {
      const currentYear = new Date().getFullYear();

      // Buscar proyecto anual existente para este techo
      const existingProject = await promette.dt_proyecto_anual.findOne({
        where: {
          dt_techo_id,
          año: currentYear,
          estado: 1,
        },
        transaction,
      });

      if (existingProject) {
        // Recalcular el monto utilizado basado en todas las requisiciones existentes
        let montoUtilizadoTotal = 0;

        // Obtener todas las requisiciones existentes para este techo
        const requisicionesExistentes =
          await promette.rl_producto_requisicion.findAll({
            where: { dt_techo_id },
            include: [
              {
                model: promette.ct_producto_consumible,
                as: "ct_producto",
              },
            ],
            transaction,
          });

        // Calcular el monto utilizado basado en todas las requisiciones
        if (requisicionesExistentes.length > 0) {
          for (const req of requisicionesExistentes) {
            const cantidadReq = Number(req.cantidad) || 0;
            let precioProductoReq = 0;

            if (req.ct_producto && req.ct_producto.precio) {
              precioProductoReq = Number(req.ct_producto.precio);
            }

            montoUtilizadoTotal += Number(
              (cantidadReq * precioProductoReq).toFixed(3)
            );
          }
        } else {
          // Si no hay requisiciones, usar el costo total calculado en este proceso
          montoUtilizadoTotal = costoTotalRequisiciones;
        }

        // Calcular el nuevo monto disponible
        const montoAsignado = Number(existingProject.monto_asignado) || 0;
        const nuevoMontoDisponible = parseFloat(
          (montoAsignado - montoUtilizadoTotal).toFixed(3)
        );

        // Actualizar el proyecto anual con los montos recalculados
        await existingProject.update(
          {
            monto_utilizado: montoUtilizadoTotal,
            monto_disponible: nuevoMontoDisponible,
            descripcion: descripcion || existingProject.descripcion,
          },
          { transaction }
        );

        proyectoAnual = existingProject;
      } else {
        // Si no existe, crear nuevo proyecto anual
        const montoAsignado = parseFloat(techo.cantidad_presupuestada) || 0;

        proyectoAnual = await promette.dt_proyecto_anual.create(
          {
            año: currentYear,
            dt_techo_id,
            monto_asignado: montoAsignado,
            monto_utilizado: costoTotalRequisiciones,
            monto_disponible: parseFloat(
              (montoAsignado - costoTotalRequisiciones).toFixed(3)
            ),
            descripcion:
              descripcion || "Proyecto anual generado automáticamente",
            estado: 1,
          },
          { transaction }
        );
      }
    } catch (error: any) {
      console.error("Error al actualizar/crear proyecto anual:", error);
      // No hacemos rollback para no perder las requisiciones
    }

    // Confirmar transacción
    if (transaction) {
      try {
        await transaction.commit();
        console.log("Transacción confirmada exitosamente");
      } catch (error: any) {
        console.error("Error al confirmar transacción:", error);
        try {
          if (transaction) await transaction.rollback();
        } catch (rollbackError) {
          console.error("Error adicional durante rollback:", rollbackError);
        }
        return res.status(500).json({
          success: false,
          msg:
            "Error al confirmar los cambios en la base de datos: " +
            (error.message || "Error desconocido"),
        });
      }
    }

    // Respuesta exitosa
    return res.status(201).json({
      success: true,
      msg: `Se crearon ${requisicionesCreadas.length} requisiciones exitosamente`,
      requisiciones: requisicionesCreadas.length,
      justificaciones:
        justificacionesCreadas.length > 0
          ? justificacionesCreadas.length
          : null,
      proyecto_anual: proyectoAnual
        ? {
            id: proyectoAnual.id_proyecto_anual,
            monto_asignado: proyectoAnual.monto_asignado,
            monto_utilizado: proyectoAnual.monto_utilizado,
            monto_disponible: proyectoAnual.monto_disponible,
          }
        : null,
      costoTotal: costoTotalRequisiciones,
    });
  } catch (error: any) {
    console.error("Error general en createUnifiedRequisition:", error);

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Error durante rollback:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      msg:
        "Error al procesar la solicitud: " +
        (error.message || "Error desconocido"),
      error: error.message || "Error interno del servidor",
    });
  }
};

export const recalcularMontoUtilizado = async (
  techoId: number,
  transaction?: Transaction | null
): Promise<number> => {


  try {
    // Definir includes básicos para obtener los productos con su precio
    const includesBasicos = [
      {
        model: promette.ct_producto_consumible,
        as: "ct_producto",
      },
    ];

    // Obtener todas las requisiciones para este techo
    const requisicionesExistentes =
      await promette.rl_producto_requisicion.findAll({
        where: { dt_techo_id: techoId },
        include: includesBasicos,
        transaction,
      });

    // Calcular el monto utilizado basado en todas las requisiciones encontradas
    let montoUtilizadoTotal = 0;
    for (const req of requisicionesExistentes) {
      const cantidadReq = Number(req.cantidad) || 0;
      const precioProductoReq = Number(req.ct_producto?.precio) || 0;
      const montoReq = cantidadReq * precioProductoReq;
      montoUtilizadoTotal += Number(montoReq.toFixed(3));
    }

    return montoUtilizadoTotal;
  } catch (error) {
    console.error("Error al recalcular monto utilizado:", error);
    throw error;
  }
};

/**
 * Endpoint para actualizar/recalcular el monto utilizado de un proyecto anual
 */
export const updateProyectoAnualMonto = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let transaction: Transaction | null = null;

  try {


    // Verificar que sequelize existe en promette
    if (!sequelize) {
      console.error(
        "Error: sequelize no está disponible en el objeto promette"
      );
      return res.status(500).json({
        success: false,
        msg: "Error de configuración en la base de datos: Sequelize no está inicializado",
      });
    }

    // Obtener el ID del techo presupuestal
    const { dt_techo_id } = req.params;
    if (!dt_techo_id) {
      return res.status(400).json({
        success: false,
        msg: "Se requiere el ID del techo presupuestal",
      });
    }

    // Iniciar transacción
    try {
      transaction = await sequelize.transaction();
    } catch (error: any) {
      console.error("Error al iniciar transacción:", error);
      return res.status(500).json({
        success: false,
        msg:
          "Error al iniciar transacción en la base de datos: " +
          (error.message || "Error desconocido"),
      });
    }

    // Buscar el proyecto anual
    const proyectoAnual = await promette.dt_proyecto_anual.findOne({
      where: {
        dt_techo_id: Number(dt_techo_id),
        estado: 1,
      },
      transaction,
    });

    if (!proyectoAnual) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({
        success: false,
        msg: `No se encontró proyecto anual para el techo presupuestal con ID ${dt_techo_id}`,
      });
    }

    // Recalcular monto utilizado
    const montoUtilizadoTotal = await recalcularMontoUtilizado(
      Number(dt_techo_id),
      transaction
    );

    // Actualizar proyecto anual
    const montoAsignado = Number(proyectoAnual.monto_asignado) || 0;
    const nuevoMontoDisponible = parseFloat(
      (montoAsignado - montoUtilizadoTotal).toFixed(3)
    );

    await proyectoAnual.update(
      {
        monto_utilizado: montoUtilizadoTotal,
        monto_disponible: nuevoMontoDisponible,
      },
      { transaction }
    );

    // Confirmar transacción
    if (transaction) {
      await transaction.commit();
    }

    return res.status(200).json({
      success: true,
      msg: "Proyecto anual actualizado correctamente",
      proyecto_anual: {
        id: proyectoAnual.id_proyecto_anual,
        monto_asignado: montoAsignado,
        monto_utilizado: montoUtilizadoTotal,
        monto_disponible: nuevoMontoDisponible,
      },
    });
  } catch (error: any) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Error durante rollback:", rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      msg:
        "Error al actualizar proyecto anual: " +
        (error.message || "Error desconocido"),
    });
  }
};

/**
 * Definición de includes básicos para consultas de requisiciones
 */
const getBaseRequisitionIncludes = () => {
  return [
    {
      model: promette.ct_producto_consumible,
      as: "ct_producto",
    },
    {
      model: promette.rl_area_financiero,
      as: "ct_area",
    },
    {
      model: promette.dt_techo_presupuesto,
      as: "dt_techo",
      include: [
        {
          model: promette.ct_financiamiento,
          as: "ct_financiamiento",
        },
      ],
    },
  ];
};

/**
 * Definición de includes detallados para consultas de requisiciones
 */
const getDetailedRequisitionIncludes = () => {
  return [
    {
      model: promette.ct_producto_consumible,
      as: "ct_producto",
      include: [
        {
          model: promette.ct_partida,
          as: "ct_partida",
        },
      ],
    },
    {
      model: promette.rl_area_financiero,
      as: "ct_area",
    },
    {
      model: promette.ct_usuario,
      as: "ct_usuarios_in_ct_usuario",
    },
    {
      model: promette.ct_usuario,
      as: "ct_usuarios_at_ct_usuario",
    },
    {
      model: promette.dt_techo_presupuesto,
      as: "dt_techo",
      include: [
        {
          model: promette.ct_financiamiento,
          as: "ct_financiamiento",
        },
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
        },
      ],
    },
  ];
};

/**
 * Endpoint para obtener una requisición por ID
 */
export const getRequisitionById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {


    const { id_producto_requisicion } = req.params;
    const [requisicion, areaMap] = await Promise.all([
      promette.rl_producto_requisicion.findByPk(id_producto_requisicion, {
        include: getDetailedRequisitionIncludes(),
      }),
      getInfraAreas(),
    ]);

    if (!requisicion) {
      return res.status(404).json({
        success: false,
        msg: `Requisición con ID ${id_producto_requisicion} no encontrada`,
      });
    }

    let areaInfraId =
      requisicion.ct_area && requisicion.ct_area.id_area_infra
        ? requisicion.ct_area.id_area_infra
        : requisicion.ct_area_id;

    return res.status(200).json({
      success: true,
      requisition: {
        ...requisicion.toJSON(),
        nombre_area: areaMap[areaInfraId] || "Área Desconocida",
        total: requisicion.total,
      },
    });
  } catch (error: any) {
    console.error("Error al obtener requisición:", error);
    return res.status(500).json({
      success: false,
      msg:
        "Error al obtener requisición: " +
        (error.message || "Error desconocido"),
    });
  }
};

/**
 * Endpoint para crear una requisición individual
 */
export const createRequisition = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let transaction: Transaction | null = null;

  try {


    const {
      ct_area_id,
      dt_techo_id,
      ct_productos_id,
      cantidad,
      mes,
      ct_usuarios_in,
      ct_usuarios_at,
    } = req.body;

    // Validaciones
    if (
      !ct_area_id ||
      !dt_techo_id ||
      !ct_productos_id ||
      !cantidad ||
      !mes ||
      !ct_usuarios_in
    ) {
      return res.status(400).json({
        success: false,
        msg: "Datos incompletos para crear la requisición",
      });
    }

    // Validar área (ahora en rl_area_financiero)
    const area = await promette.rl_area_financiero.findByPk(ct_area_id);
    if (!area) {
      return res.status(404).json({
        success: false,
        msg: `Área financiera con ID ${ct_area_id} no encontrada`,
      });
    }

    // Validar producto y calcular total
    const producto = await promette.ct_producto_consumible.findByPk(
      ct_productos_id
    );
    if (!producto) {
      return res.status(404).json({
        success: false,
        msg: `Producto con ID ${ct_productos_id} no encontrado`,
      });
    }
    const precio = new Decimal(producto.precio || 0);
    const cantidadDecimal = new Decimal(cantidad);
    const total = cantidadDecimal.times(precio).toDecimalPlaces(3).toNumber();

    // Iniciar transacción
    transaction = await sequelize.transaction();

    // Crear la requisición con el campo total
    const requisicion = await promette.rl_producto_requisicion.create(
      {
        ct_area_id,
        dt_techo_id,
        ct_productos_id,
        cantidad: parseFloat(cantidad.toFixed(3)),
        mes,
        total, // Nuevo campo total
        ct_usuarios_in,
        ct_usuarios_at: ct_usuarios_at || null,
      },
      { transaction }
    );

    // Confirmar transacción
    if (transaction) await transaction.commit();

    // Obtener nombre de área para la respuesta
    const areaMap = await getInfraAreas();
    let areaInfraId = null;
    // Buscar el área financiero para obtener id_area_infra
    const areaFin = await promette.rl_area_financiero.findByPk(ct_area_id);
    if (areaFin && areaFin.id_area_infra) {
      areaInfraId = areaFin.id_area_infra;
    } else {
      areaInfraId = ct_area_id;
    }

    return res.status(201).json({
      success: true,
      msg: "Requisición creada exitosamente",
      requisition: {
        ...requisicion.toJSON(),
        nombre_area: areaMap[areaInfraId] || "Área Desconocida",
      },
    });
  } catch (error: any) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Error durante rollback:", rollbackError);
      }
    }

    console.error("Error al crear requisición:", error);
    return res.status(500).json({
      success: false,
      msg:
        "Error al crear requisición: " + (error.message || "Error desconocido"),
    });
  }
};

/**
 * Actualiza el proyecto anual después de crear una requisición
 * Acepta null o undefined en el parámetro transaction
 */
const updateProyectoAnualAfterRequisition = async (
  techoId: number,
  costoTotal: number,
  transaction?: Transaction | null
): Promise<void> => {
  try {
    // Buscar proyecto anual existente
    const proyectoAnual = await promette.dt_proyecto_anual.findOne({
      where: { dt_techo_id: techoId, estado: 1 },
      transaction,
    });

    if (proyectoAnual) {
      // Actualizar proyecto existente
      const montoUtilizado = Number(proyectoAnual.monto_utilizado) || 0;
      const montoAsignado = Number(proyectoAnual.monto_asignado) || 0;
      const nuevoMontoUtilizado = montoUtilizado + costoTotal;
      const nuevoMontoDisponible = montoAsignado - nuevoMontoUtilizado;

      await proyectoAnual.update(
        {
          monto_utilizado: Number(nuevoMontoUtilizado.toFixed(3)),
          monto_disponible: Number(nuevoMontoDisponible.toFixed(3)),
        },
        { transaction }
      );
    } else {
      // Obtener información del techo
      const techo = await promette.dt_techo_presupuesto.findByPk(techoId, {
        transaction,
      });
      if (!techo)
        throw new Error(`Techo presupuestal con ID ${techoId} no encontrado`);

      // Crear nuevo proyecto anual
      const montoAsignado = Number(techo.cantidad_presupuestada) || 0;

      await promette.dt_proyecto_anual.create(
        {
          año: new Date().getFullYear(),
          dt_techo_id: techoId,
          monto_asignado: montoAsignado,
          monto_utilizado: costoTotal,
          monto_disponible: Number((montoAsignado - costoTotal).toFixed(3)),
          descripcion: "Proyecto anual generado automáticamente",
          estado: 1,
        },
        { transaction }
      );
    }
  } catch (error) {
    console.error("Error al actualizar/crear proyecto anual:", error);
    throw error;
  }
};

/**
 * Endpoint para actualizar una requisición
 */
export const updateRequisition = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let transaction: Transaction | null = null;

  try {


    const { id_producto_requisicion } = req.params;
    const {
      ct_area_id,
      dt_techo_id,
      ct_productos_id,
      cantidad,
      mes,
      ct_usuarios_in,
      ct_usuarios_at,
    } = req.body;

    // Iniciar transacción
    transaction = await sequelize.transaction();

    // Buscar la requisición existente
    const requisicion = await promette.rl_producto_requisicion.findByPk(
      id_producto_requisicion,
      { transaction }
    );

    if (!requisicion) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({
        success: false,
        msg: `Requisición con ID ${id_producto_requisicion} no encontrada`,
      });
    }

    // Obtener los datos actuales para calcular la diferencia
    const cantidadAnterior = new Decimal(requisicion.cantidad || 0);
    const productoIdAnterior = requisicion.ct_productos_id;
    const techoIdAnterior = requisicion.dt_techo_id;

    // Si cambia el producto o la cantidad, recalcula el total
    let nuevoTotal = requisicion.total;
    let productoNuevo = null;
    let cantidadNueva =
      cantidad !== undefined ? new Decimal(cantidad) : cantidadAnterior;

    if (
      ct_productos_id !== undefined &&
      ct_productos_id !== productoIdAnterior
    ) {
      productoNuevo = await promette.ct_producto_consumible.findByPk(
        ct_productos_id,
        { transaction }
      );
    } else {
      productoNuevo = await promette.ct_producto_consumible.findByPk(
        productoIdAnterior,
        { transaction }
      );
    }
    if (productoNuevo) {
      const precioNuevo = new Decimal(productoNuevo.precio || 0);
      nuevoTotal = cantidadNueva
        .times(precioNuevo)
        .toDecimalPlaces(3)
        .toNumber();
    }

    // Actualizar la requisición
    await requisicion.update(
      {
        ct_area_id:
          ct_area_id !== undefined ? ct_area_id : requisicion.ct_area_id,
        dt_techo_id:
          dt_techo_id !== undefined ? dt_techo_id : requisicion.dt_techo_id,
        ct_productos_id:
          ct_productos_id !== undefined
            ? ct_productos_id
            : requisicion.ct_productos_id,
        cantidad:
          cantidad !== undefined
            ? cantidadNueva.toNumber()
            : requisicion.cantidad,
        mes: mes !== undefined ? mes : requisicion.mes,
        total: nuevoTotal,
        ct_usuarios_in:
          ct_usuarios_in !== undefined
            ? ct_usuarios_in
            : requisicion.ct_usuarios_in,
        ct_usuarios_at:
          ct_usuarios_at !== undefined
            ? ct_usuarios_at
            : requisicion.ct_usuarios_at,
      },
      { transaction }
    );

    // Actualizar proyecto anual si cambia la cantidad o el producto
    if (cantidad !== undefined || ct_productos_id !== undefined) {
      // Producto anterior
      let productoAnterior;
      if (productoIdAnterior) {
        productoAnterior = await promette.ct_producto_consumible.findByPk(
          productoIdAnterior,
          { transaction }
        );
      }

      // Producto nuevo (si cambió)
      let productoNuevo;
      if (ct_productos_id && ct_productos_id !== productoIdAnterior) {
        productoNuevo = await promette.ct_producto_consumible.findByPk(
          ct_productos_id,
          { transaction }
        );
      } else {
        productoNuevo = productoAnterior;
      }

      // Calcular ajuste en proyecto anual
      if (productoAnterior && techoIdAnterior === requisicion.dt_techo_id) {
        // Recalcular automáticamente el monto utilizado para el techo
        await recalcularMontoUtilizado(requisicion.dt_techo_id, transaction);
      }

      // Si cambió el techo, recalcular ambos techos
      if (dt_techo_id && dt_techo_id !== techoIdAnterior) {
        await recalcularMontoUtilizado(techoIdAnterior, transaction);
        await recalcularMontoUtilizado(dt_techo_id, transaction);
      }
    }

    // Confirmar transacción
    if (transaction) await transaction.commit();

    return res.status(200).json({
      success: true,
      msg: "Requisición actualizada exitosamente",
      requisition: requisicion,
    });
  } catch (error: any) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Error durante rollback:", rollbackError);
      }
    }

    console.error("Error al actualizar requisición:", error);
    return res.status(500).json({
      success: false,
      msg:
        "Error al actualizar requisición: " +
        (error.message || "Error desconocido"),
    });
  }
};

/**
 * Endpoint para eliminar una requisición
 */
export const deleteRequisition = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let transaction: Transaction | null = null;

  try {


    const { id_producto_requisicion } = req.params;

    // Iniciar transacción
    transaction = await sequelize.transaction();

    // Buscar la requisición
    const requisicion = await promette.rl_producto_requisicion.findByPk(
      id_producto_requisicion,
      {
        include: [
          {
            model: promette.ct_producto_consumible,
            as: "ct_producto",
          },
        ],
        transaction,
      }
    );

    if (!requisicion) {
      if (transaction) await transaction.rollback();
      return res.status(404).json({
        success: false,
        msg: `Requisición con ID ${id_producto_requisicion} no encontrada`,
      });
    }

    // Guardar información para actualizar proyecto anual
    const techoId = requisicion.dt_techo_id;

    // Eliminar la requisición
    await requisicion.destroy({ transaction });

    // Actualizar proyecto anual
    if (techoId) {
      const proyectoAnual = await promette.dt_proyecto_anual.findOne({
        where: {
          dt_techo_id: Number(techoId),
          estado: 1,
        },
        transaction,
      });
      
      const montoUtilizadoTotal = await recalcularMontoUtilizado(
        Number(techoId),
        transaction
      );

      // Actualizar montos del proyecto anual
      const montoAsignado = Number(proyectoAnual.monto_asignado) || 0;
      const nuevoMontoDisponible = parseFloat(
        (montoAsignado - montoUtilizadoTotal).toFixed(3)
      );

      await proyectoAnual.update(
        {
          monto_utilizado: montoUtilizadoTotal,
          monto_disponible: nuevoMontoDisponible,
        },
        { transaction }
      );      
    }

    // Confirmar transacción
    if (transaction) await transaction.commit();

    return res.status(200).json({
      success: true,
      msg: "Requisición eliminada exitosamente",
    });
  } catch (error: any) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Error durante rollback:", rollbackError);
      }
    }

    console.error("Error al eliminar requisición:", error);
    return res.status(500).json({
      success: false,
      msg:
        "Error al eliminar requisición: " +
        (error.message || "Error desconocido"),
    });
  }
};

export const getRequisitions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const requisitions = await promette.rl_producto_requisicion.findAll({
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          attributes: ['id_producto', 'nombre_producto', 'precio']
        },
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          attributes: ['id_area_fin', 'id_financiero', 'id_area_infra']
        }
      ],
      attributes: [
        'id_producto_requisicion',
        'ct_area_id',
        'dt_techo_id',
        'ct_productos_id',
        'cantidad',
        'mes',
        'total',
        'ct_usuarios_in',
        'ct_usuarios_at',
        'createdAt',
        'updatedAt'
      ]
    });

    // Calcular el total general
    const totalGeneral = requisitions.reduce((sum: number, req: Requisicion) => {
      return sum + (parseFloat(req.total?.toString() || '0'));
    }, 0);

    return res.status(200).json({
      success: true,
      requisitions,
      total_general: totalGeneral
    });
  } catch (error) {
    console.error("Error al obtener requisiciones:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener requisiciones: " + (error instanceof Error ? error.message : "Error desconocido")
    });
  }
};
