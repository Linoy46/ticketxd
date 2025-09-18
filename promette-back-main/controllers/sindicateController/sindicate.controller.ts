import { Request, Response } from "express";
import { promette } from '../../models/database.models';



//Esta función retorna todos mis puestos
export const getAllSindicate = async (req: Request, res: Response) => {
  const sindicates = await promette.ct_sindicato.findAll();
  if (sindicates.length === 0) {
    return res.status(404).json({
      msg: "No se encontraron sindicatos",
    });
  }
  res.status(200).json({
    msg: "success",
    sindicates,
  });
};

export const getSindicateByid = async (req: Request, res: Response) => {
  try {
    const sindicate = await promette.ct_sindicato.findByPk(
      req.body.id_sindicato
    );
    if (sindicate) {
      res.status(200).json({
        msg: "success",
        sindicate,
      });
    }
    if (!sindicate.estado) {
      res.status(400).json({
        msg: "Sindicato no vigennte",
      });
    }
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion",
    });
  }
};

export const registerSindicate = async (req: Request, res: Response) => {
  const { ct_usuario_in, ct_usuario_at } = req.body;

  try {
    const created = await promette.ct_sindicato.Create({
      ct_usuario_in,
      ct_usuario_at,
    });

    if (!created) {
      res.status(400).json({
        msg: "El sindicato ya existe",
      });
    }
    res.status(201).json({
      msg: "El sindicato se ha creado correctamente",
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion ",
    });
  }
};
export const updateSindicate = async (req: Request, res: Response) => {
  const { id_sindicato, estado, ct_usuario_in, ct_usuario_at } = req.body;

  try {
    //Actualizar
    const currentSindicate = await promette.ct_sindicato.update(
      {
        estado,
        ct_usuario_in,
        ct_usuario_at,
      },
      {
        where: {
          id_sindicato,
        },
      }
    );

    if (!currentSindicate) {
      res.status(400).json({
        msg: "Error en la actualización",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentSindicate,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la actualización",
    });
  }
};
