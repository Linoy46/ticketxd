import { Request, Response } from "express";
import { promette } from '../../models/database.models';



// GET - Obtener todos los capítulos activos
export const getAllChapters = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const chapters = await promette.ct_capitulo.findAll({
      where: { estado: 1 },
      order: [['clave_capitulo', 'ASC']]
    });

    return res.status(200).json({ chapters });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al obtener los capítulos" });
  }
};

// GET - Obtener un capítulo por ID
export const getChapterById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_capitulo } = req.params;

  try {
    const chapter = await promette.ct_capitulo.findByPk(id_capitulo);

    if (!chapter) {
      return res.status(404).json({ msg: "Capítulo no encontrado" });
    }

    return res.status(200).json({ chapter });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al obtener el capítulo" });
  }
};

// POST - Crear un nuevo capítulo
export const createChapter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { clave_capitulo, nombre_capitulo, estado = 1 } = req.body;

  try {
    const newChapter = await promette.ct_capitulo.create({
      clave_capitulo,
      nombre_capitulo,
      estado
    });

    return res.status(201).json({
      msg: "Capítulo creado correctamente",
      chapter: newChapter
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al crear el capítulo" });
  }
};

// PUT - Actualizar un capítulo existente
export const updateChapter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_capitulo } = req.params;
  const { clave_capitulo, nombre_capitulo, estado } = req.body;

  try {
    const chapter = await promette.ct_capitulo.findByPk(id_capitulo);
    
    if (!chapter) {
      return res.status(404).json({ msg: "Capítulo no encontrado" });
    }

    await promette.ct_capitulo.update(
      { clave_capitulo, nombre_capitulo, estado },
      { where: { id_capitulo } }
    );

    const updatedChapter = await promette.ct_capitulo.findByPk(id_capitulo);

    return res.status(200).json({
      msg: "Capítulo actualizado correctamente",
      chapter: updatedChapter
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al actualizar el capítulo" });
  }
};

// DELETE - Eliminar un capítulo lógicamente (cambiar estado a 0)
export const deleteChapter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_capitulo } = req.params;

  try {
    const chapter = await promette.ct_capitulo.findByPk(id_capitulo);
    
    if (!chapter) {
      return res.status(404).json({ msg: "Capítulo no encontrado" });
    }

    await promette.ct_capitulo.update(
      { estado: 0 },
      { where: { id_capitulo } }
    );

    return res.status(200).json({ msg: "Capítulo eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al eliminar el capítulo" });
  }
};