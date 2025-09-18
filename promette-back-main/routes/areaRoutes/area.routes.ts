import { Router } from "express";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import {
  deleteArea,
  getAllAreas,
  getAreaById,
  registerArea,
  updateArea,
  getAllAreasFinancieras,
} from "../../controllers/areaController/area.controller";
import {
  validateIdArea,
  validateNewArea,
  validateUpdateArea,
} from "../../validations/area.validations";
import { Request, Response } from "express";
//import { Area } from "../../models/area.model";
import { initModels } from "../../models/modelsPromette/init-models";
import { sequelize } from "../../config/database";

const router = Router();

const promette: any = initModels(sequelize);

router.get("/", validateJwt, getAllAreas);

router.post(
  "/register",
  validateJwt,
  validateNewArea,
  validateRequest,
  registerArea
);

router.get(
  "/getById/:id_area",
  validateJwt,
  validateIdArea,
  validateRequest,
  getAreaById
);

router.put(
  "/update",
  validateJwt,
  validateUpdateArea,
  validateRequest,
  updateArea
);

router.put(
  "/delete",
  validateJwt,
  validateRequest,
  deleteArea
);

// Ruta para obtener unidades administrativas según el tipo de usuario
router.get('/unidades-administrativas', validateJwt, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id_usuario;
    
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
          attributes: ["id_puesto", "ct_area_id"]
        }
      ]
    });

    let unidadesUnicas: any[] = [];

    if (usuarioPuesto) {
      const puestoId = usuarioPuesto.ct_puesto.id_puesto;
      const userAreaId = usuarioPuesto.ct_puesto.ct_area_id;

      if (puestoId === 1806) {
        // Usuario 1806: ver todas las unidades
        console.log("🔓 Usuario 1806 - Mostrando todas las unidades administrativas");
        const areas = await promette.Area.findAll({
          attributes: ['id_financiero', 'nombre'],
          group: ['id_financiero', 'nombre'],
          order: [['id_financiero', 'ASC']]
        });
/*
        unidadesUnicas = areas.map(area=> ({
          id_financiero: area.id_financiero,
          nombre: area.nombre || `Unidad ${area.id_financiero}`
        }));
        */

      } else if (puestoId === 258) {
        // Analista: ver solo las unidades asignadas en rl_analista_unidad
        console.log("👤 Analista - Buscando unidades asignadas");
        const areasAnalista = await promette.rl_analista_unidad.findAll({
          where: { 
            ct_usuario_id: userId,
            estado: 1 
          },
          include: [
            {
              model: promette.rl_area_financiero,
              as: "rl_area_financiero_rl_area_financiero",
              required: true,
              include: [
                {
                  model: promette.Area,
                  as: "ct_area",
                  attributes: ['id_financiero', 'nombre']
                }
              ]
            }
          ]
        });

        unidadesUnicas = areasAnalista.map((analystArea: any) => {
          const area = analystArea.rl_area_financiero_rl_area_financiero.ct_area;
          return {
            id_financiero: area.id_financiero,
            nombre: area.nombre || `Unidad ${area.id_financiero}`
          };
        });

        console.log(`👤 Analista - Unidades asignadas: ${unidadesUnicas.length}`);

      } else {
        // Usuario normal: ver solo su área
        console.log("👤 Usuario normal - Mostrando solo su área");
        if (userAreaId) {
          const area = await promette.Area.findOne({
            where: { id_area: userAreaId },
            attributes: ['id_financiero', 'nombre']
          });

          if (area) {
            unidadesUnicas = [{
              id_financiero: area.id_financiero,
              nombre: area.nombre || `Unidad ${area.id_financiero}`
            }];
            console.log(`👤 Usuario normal - Área: ${area.id_financiero}`);
          }
        }
      }
    }

    res.json(unidadesUnicas);
  } catch (error) {
    console.error('Error al obtener unidades administrativas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener todas las áreas financieras
router.get('/financieras', validateJwt, getAllAreasFinancieras);

// Nueva ruta para obtener áreas de un analista
router.get('/analista/:id_usuario', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id_usuario;
    const areas = await promette.rl_analista_unidad.findAll({
      where: {
        ct_usuario_id: userId,
        estado: 1
      },
      include: [
        {
          model: promette.rl_area_financiero,
          as: "rl_area_financiero_rl_area_financiero",
          required: true,
          include: [
            {
              model: promette.Area,
              as: "ct_area",
              attributes: ['id_financiero', 'nombre']
            }
          ]
        }
      ]
    });

    const formattedAreas = areas.map((area: any) => ({
      id_financiero: area.rl_area_financiero_rl_area_financiero.ct_area.id_financiero,
      nombre: area.rl_area_financiero_rl_area_financiero.ct_area.nombre || `Unidad ${area.rl_area_financiero_rl_area_financiero.ct_area.id_financiero}`
    }));

    res.json(formattedAreas);
  } catch (error) {
    console.error('Error al obtener áreas de un analista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
