import { Request, Response } from "express";
import { promette, sequelize } from '../../models/database.models';
import { Op } from "sequelize";



//Esta función retorna todos mis puestos
export const getAllPositions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Consultar los puestos con paginación usando Sequelize
    const positions = await promette.ct_puesto.findAndCountAll({
      where: { estado: 1, id_puesto: { [Op.ne]: 0 } },
    });

    // Verificar si se encontraron puestos
    if (positions.count === 0) {
      res.status(404).json({ msg: "No se encontraron puestos" });
      return;
    }

    // Responder con los datos paginados
    res.status(200).json({
      msg: "success",
      positions: positions.rows, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const getPositionById = async (req: Request, res: Response) => {
  const { id_puesto } = req.params;

  if (isNaN(Number(id_puesto))) {
    return res.status(400).json({ msg: "ID inválido" });
  }

  try {
    const position = await promette.ct_puesto.findByPk(id_puesto,{
      // include: [
      //   {
      //     model: promette.ct_area,
      //     as: "ct_area", // Asegúrate de que el alias coincida con la relación definida en el modelo
      //     attributes: ["nombre_area"],
      //   },
      // ],
    });

    if (position) {
      res.status(200).json({
        msg: "success",
        position,
      });
    }
    if (!position.estado) {
      res.status(400).json({
        msg: "Puesto no vigente",
      });
    }
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion",
    });
  }
};

export const getPositionByDescription = async (req: Request, res: Response) => {
  const { description } = req.params;

  try {
    const positions = await promette.ct_puesto.findAndCountAll({
      where: {
        estado: 1,
        id_puesto: { [Op.ne]: 0 },
        [Op.and]: [
          // Perform case-insensitive search using LIKE and LOWER()
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("nombre_puesto")),
            "LIKE",
            `%${description.toLowerCase()}%`
          ),
        ],
      },
      limit: 10, // Limit results to 10
    });

    res.status(200).json({
      positions: positions.rows,
    });
  } catch (error) {
    console.log(error);
    res.status(422).json({
      msg: "Error en la petición",
    });
  }
};

export const registerPosition = async (req: Request, res: Response) => {
  const {
    nombre_puesto,
    descripcion,
    ct_area_id,
    ct_puesto_superior_id,
    ct_usuario_in,
  } = req.body;

  try {
    const [newPosition, created] = await promette.ct_puesto.findOrCreate({
      where: { nombre_puesto },
      defaults: {
        nombre_puesto,
        descripcion,
        ct_area_id,
        ct_puesto_superior_id,
        ct_usuario_in,
      },
    });

    if (!created) {
      res.status(400).json({
        msg: "El puesto ya existe",
      });
    }
    res.status(201).json({
      msg: "El puesto se ha creado correctamente",
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion ",
    });
  }
};
export const updatePosition = async (req: Request, res: Response) => {
  const {
    id_puesto,
    nombre_puesto,
    descripcion,
    ct_area_id,
    ct_puesto_superior_id,
    ct_usuario_in,
    estado,
  } = req.body;

  try {
    const existUpdateValues = await promette.ct_puesto.findOne({
      where: { nombre_puesto, id_puesto: { [Op.ne]: id_puesto } },
    });

    if (existUpdateValues) {
      res.status(400).json({
        msg: "El nombre del puesto ya existe",
      });
    }

    //Actualizar
    const currentPosition = await promette.ct_puesto.update(
      {
        nombre_puesto,
        descripcion,
        ct_area_id,
        ct_puesto_superior_id,
        ct_usuario_in,
        estado,
      },
      {
        where: {
          id_puesto,
        },
      }
    );

    if (!currentPosition) {
      res.status(400).json({
        msg: "Error en la actualización",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentPosition,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la actualización",
    });
  }
};

export const deletePosition = async (req: Request, res: Response) => {
  const {
    id_puesto,
    ct_usuario_at,
  } = req.body;

  try {
    //Actualizar
    const currentPosition = await promette.ct_puesto.update(
      {
        estado: 0,
        ct_usuario_at,
      },
      {
        where: {
          id_puesto,
        },
      }
    );

    if (!currentPosition) {
      res.status(400).json({
        msg: "Error en la eliminación",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentPosition,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la eliminación",
    });
  }
};