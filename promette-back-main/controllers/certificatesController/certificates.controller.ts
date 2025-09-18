import { Request, Response } from "express";
import { promette } from '../../models/database.models';



export const getAllCertificates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { area } = req.params;
    // Consultar las constancias con paginación usando Sequelize
    const certificates = await promette.ct_constancia_curso.findAndCountAll({
      where: { area }, // Filtrar solo las constancias activas (estado: 1)
    });

    // Verificar si se encontraron constancias
    if (certificates.count === 0) {
      res.status(404).json({ msg: "No se encontraron constancias" });
      return;
    }

    // Responder con los datos paginados
    res.status(200).json({
      certificates: certificates.rows, // Registros de la página solicitada
    });
  } catch (error) {
    console.error("Error al obtener constancias:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const saveCertificatesDesign = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id_constanciaCurso, constancia_design } = req.body;

    const certificates = await promette.ct_constancia_curso.update(
      {
        constancia_design,
      },
      {
        where: { id_constanciaCurso },
      }
    );

    console.log(id_constanciaCurso, constancia_design);

    // Responder con los datos paginados
    res.status(200).json({
      msg: "Diseño de constancia actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al obtener constancias:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};

export const getCertificatesDesign = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id_constanciaCurso } = req.params;

    const design = await promette.ct_constancia_curso.findByPk(id_constanciaCurso);

    // Responder con los datos paginados
    res.status(200).json({
      design,
    });
  } catch (error) {
    console.error("Error al obtener constancias:", error);
    res.status(500).json({ msg: "Ocurrió un error en el servidor" });
  }
};
