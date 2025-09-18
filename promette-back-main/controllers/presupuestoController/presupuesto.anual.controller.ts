import { Request, Response } from "express";
import { promette, sequelize } from '../../models/database.models';
import { Op } from "sequelize";
import jwt from "jsonwebtoken";



// Crear un nuevo presupuesto anual
export const createPresupuestoAnual = async (req: Request, res: Response) => {
  console.log("========== INICIO CREACIÓN DE PRESUPUESTO ANUAL ==========");
  const requestId = `budget-${Date.now()}`;
  console.log(`[${requestId}] Datos recibidos:`, JSON.stringify(req.body, null, 2));

  try {
    const {
      año,
      ct_fuente_financiamiento_id,
      ct_area_id,
      monto_asignado,
      descripcion,
      estado = 1,
    } = req.body;

    // Validaciones básicas
    if (!año) {
      return res.status(400).json({ success: false, msg: "El año es obligatorio" });
    }
    if (!ct_fuente_financiamiento_id) {
      return res.status(400).json({ success: false, msg: "La fuente de financiamiento es obligatoria" });
    }
    if (!ct_area_id) {
      return res.status(400).json({ success: false, msg: "El área es obligatoria" });
    }
    if (!monto_asignado || monto_asignado <= 0) {
      return res.status(400).json({ success: false, msg: "El monto asignado debe ser mayor a cero" });
    }

    // Verificar si ya existe un presupuesto para esta combinación
    const presupuestoExistente = await promette.ct_presupuesto_anual.findOne({
      where: {
        año,
        ct_fuente_financiamiento_id,
        ct_area_id
      }
    });

    if (presupuestoExistente) {
      return res.status(400).json({
        success: false,
        msg: "Ya existe un presupuesto anual para esta combinación de año, fuente y área",
        presupuesto: presupuestoExistente
      });
    }

    // Crear el presupuesto anual
    const presupuesto = await promette.ct_presupuesto_anual.create({
      año,
      ct_fuente_financiamiento_id,
      ct_area_id,
      monto_asignado,
      monto_ejercido: 0,
      descripcion,
      estado
    });

    console.log(`[${requestId}] ✅ Presupuesto anual creado exitosamente con ID: ${presupuesto.id_presupuesto_anual}`);

    return res.status(201).json({
      success: true,
      msg: "Presupuesto anual creado correctamente",
      presupuesto
    });
  } catch (error) {
    console.error(`[${requestId}] ERROR:`, error);
    return res.status(500).json({
      success: false,
      msg: "Error al crear el presupuesto anual",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    console.log("========== FIN CREACIÓN DE PRESUPUESTO ANUAL ==========");
  }
};

// Obtener el resumen del presupuesto anual con montos ejercidos
export const getResumenPresupuestoAnual = async (req: Request, res: Response) => {
  const { año, area_id } = req.params;
  
  try {
    const añoNum = Number(año);
    const areaId = area_id ? Number(area_id) : undefined;
    
    if (isNaN(añoNum)) {
      return res.status(400).json({
        success: false,
        msg: "El año debe ser un número válido"
      });
    }

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
      return res.status(404).json({ success: false, msg: "Usuario sin puesto asignado" });
    }

    const puestoId = usuarioPuesto.ct_puesto.id_puesto;
    const userAreaId = usuarioPuesto.ct_puesto.ct_area_id;

    console.log(`Usuario ${userId} - Puesto: ${puestoId}, Área: ${userAreaId}`);

    // Lógica de filtrado según el puesto
    let areasFiltradas: number[] = [];

    if (puestoId === 1806) {
      // ✅ CORRECCIÓN: Puesto 1806 muestra TODO (sin filtros) - igual que en techos presupuestales
      console.log("🔓 Puesto 1806 - Mostrando todos los presupuestos (sin filtros)");
      
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
        console.log("⚠️ Analista sin áreas asignadas - Mostrando todos los presupuestos");
      } else {
        console.log(`👤 Analista - Áreas asignadas: ${areasFiltradas.join(', ')}`);
      }

    } else {
      // Otros usuarios: mostrar solo las áreas donde su ct_area esté en rl_area_financiamiento
      if (userAreaId) {
        const areaFinanciera = await promette.rl_area_financiero.findOne({
          where: { id_area_infra: userAreaId }
        });

        if (areaFinanciera) {
          areasFiltradas = [areaFinanciera.id_area_fin];
          console.log(`👤 Usuario regular - Área financiera: ${areaFinanciera.id_area_fin}`);
        } else {
          console.log("⚠️ Usuario sin área financiera configurada - Mostrando todos los presupuestos");
        }
      } else {
        console.log("⚠️ Usuario sin área asignada - Mostrando todos los presupuestos");
      }
    }

    // Construir condiciones de búsqueda
    const whereCondition: any = { año: añoNum };
    
    // Aplicar filtros solo si hay áreas filtradas (excepto para puesto 1806 que ve todo)
    if (areasFiltradas.length > 0) {
      // Si se especifica un área específica en la URL, verificar que esté en las áreas filtradas
      if (areaId && !isNaN(areaId)) {
        if (areasFiltradas.includes(areaId)) {
          whereCondition.ct_area_id = areaId;
        } else {
          return res.status(403).json({
            success: false,
            msg: "No tienes permisos para ver esta área"
          });
        }
      } else {
        // Si no se especifica área, filtrar por las áreas permitidas
        whereCondition.ct_area_id = areasFiltradas;
      }
    } else if (puestoId !== 1806) {
      // Si no hay áreas filtradas y no es puesto 1806, no mostrar nada
      return res.status(200).json({
        success: true,
        count: 0,
        presupuestos: [],
        msg: "No tienes áreas asignadas para ver presupuestos"
      });
    }
    // Para puesto 1806, no se aplica filtro de áreas (ve todo)

    // Obtener presupuestos anuales
    const presupuestos = await promette.ct_presupuesto_anual.findAll({
      where: whereCondition,
      include: [
        {
          model: promette.ct_area,
          as: "ct_area",
        },
        {
          model: promette.ct_fuente_financiamiento,
          as: "ct_fuente_financiamiento",
        }
      ]
    });

    if (presupuestos.length === 0) {
      return res.status(404).json({
        success: false,
        msg: `No se encontraron presupuestos para el año ${año}${areaId ? ` y área ${areaId}` : ''}`
      });
    }

    // Para cada presupuesto, obtener su ejercicio por mes
    const resumenPresupuestos = await Promise.all(presupuestos.map(async (presupuesto: any) => {
      // Obtener todas las requisiciones asociadas a este presupuesto
      const requisiciones = await promette.rl_requisicion.findAll({
        where: {
          año: añoNum,
          ct_area_id: presupuesto.ct_area_id,
          ct_presupuesto_anual_id: presupuesto.id_presupuesto_anual
        },
        attributes: [
          'mes',
          [sequelize.fn('SUM', sequelize.col('cantidad_aprobada')), 'total_aprobado'],
          [sequelize.fn('COUNT', sequelize.col('id_requisicion')), 'num_requisiciones']
        ],
        include: [
          {
            model: promette.ct_producto_consumible,
            as: "ct_producto",
            attributes: ['precio_unitario']
          }
        ],
        group: ['mes'],
        order: [['mes', 'ASC']]
      });

      // Crear arreglo de meses con sus totales
      const mesesEjercicio = Array(12).fill(null).map((_, index) => {
        const mes = index + 1;
        const requisicionMes = requisiciones.find((req: any) => req.mes === mes);
        
        return {
          mes,
          total_aprobado: requisicionMes ? parseFloat(requisicionMes.dataValues.total_aprobado || 0) : 0,
          num_requisiciones: requisicionMes ? parseInt(requisicionMes.dataValues.num_requisiciones || 0) : 0
        };
      });

      // Calcular total ejercido sumando todas las requisiciones
      const totalEjercido = mesesEjercicio.reduce((sum, mes) => sum + mes.total_aprobado, 0);

      return {
        id_presupuesto_anual: presupuesto.id_presupuesto_anual,
        año: presupuesto.año,
        area: presupuesto.ct_area ? presupuesto.ct_area.nombre_area : 'Área Desconocida',
        fuente: presupuesto.ct_fuente_financiamiento ? presupuesto.ct_fuente_financiamiento.nombre_fuente : 'Fuente Desconocida',
        monto_asignado: parseFloat(presupuesto.monto_asignado),
        monto_ejercido: totalEjercido,
        porcentaje_ejercido: (totalEjercido / parseFloat(presupuesto.monto_asignado) * 100).toFixed(2),
        disponible: parseFloat(presupuesto.monto_asignado) - totalEjercido,
        desglose_mensual: mesesEjercicio,
        estado: presupuesto.estado,
        descripcion: presupuesto.descripcion || ''
      };
    }));

    return res.status(200).json({
      success: true,
      count: resumenPresupuestos.length,
      presupuestos: resumenPresupuestos,
      filtro_aplicado: {
        puesto_id: puestoId,
        areas_filtradas: areasFiltradas,
        total_registros: resumenPresupuestos.length
      }
    });
  } catch (error) {
    console.error("Error al obtener resumen de presupuesto anual:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener el resumen del presupuesto anual",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar el monto asignado del presupuesto anual
export const updatePresupuestoAnual = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { monto_asignado, descripcion, estado } = req.body;

  try {
    const presupuesto = await promette.ct_presupuesto_anual.findByPk(id);

    if (!presupuesto) {
      return res.status(404).json({
        success: false,
        msg: "Presupuesto anual no encontrado"
      });
    }

    // Validar que el nuevo monto no sea menor que el ya ejercido
    if (monto_asignado && monto_asignado < parseFloat(presupuesto.monto_ejercido)) {
      return res.status(400).json({
        success: false,
        msg: "El nuevo monto asignado no puede ser menor que el monto ya ejercido"
      });
    }

    // Actualizar campos
    const updateData: any = {};
    if (monto_asignado !== undefined) updateData.monto_asignado = monto_asignado;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (estado !== undefined) updateData.estado = estado;

    await promette.ct_presupuesto_anual.update(updateData, {
      where: { id_presupuesto_anual: id }
    });

    // Obtener presupuesto actualizado
    const presupuestoActualizado = await promette.ct_presupuesto_anual.findByPk(id, {
      include: [
        {
          model: promette.ct_area,
          as: "ct_area"
        },
        {
          model: promette.ct_fuente_financiamiento,
          as: "ct_fuente_financiamiento"
        }
      ]
    });

    return res.status(200).json({
      success: true,
      msg: "Presupuesto anual actualizado correctamente",
      presupuesto: presupuestoActualizado
    });
  } catch (error) {
    console.error("Error al actualizar presupuesto anual:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al actualizar el presupuesto anual",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar un presupuesto anual (solo si no tiene requisiciones asociadas)
export const deletePresupuestoAnual = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Verificar si existe
    const presupuesto = await promette.ct_presupuesto_anual.findByPk(id);
    
    if (!presupuesto) {
      return res.status(404).json({
        success: false,
        msg: "Presupuesto anual no encontrado"
      });
    }

    // Verificar si tiene requisiciones asociadas
    const requisicionesAsociadas = await promette.rl_requisicion.count({
      where: { ct_presupuesto_anual_id: id }
    });

    if (requisicionesAsociadas > 0) {
      return res.status(400).json({
        success: false,
        msg: `No se puede eliminar el presupuesto porque tiene ${requisicionesAsociadas} requisiciones asociadas`
      });
    }

    // Eliminar el presupuesto
    await promette.ct_presupuesto_anual.destroy({
      where: { id_presupuesto_anual: id }
    });

    return res.status(200).json({
      success: true,
      msg: "Presupuesto anual eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar presupuesto anual:", error);
    return res.status(500).json({
      success: false,
      msg: "Error al eliminar el presupuesto anual",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
