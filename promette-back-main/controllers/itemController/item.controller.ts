import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// GET - Obtener todas las partidas (SOLO las que tienen productos asociados activos, SIN incluir los productos en el array)
export const getAllItems = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Traer todas las partidas activas, sin importar si tienen productos
    const items = await promette.ct_partida.findAll({
      where: { estado: 1 },
      include: [
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
      ],
      order: [["clave_partida", "ASC"]],
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al obtener las partidas" });
  }
};

// GET - Obtener una partida por ID
export const getItemById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_partida } = req.params;

  try {
    // Buscar la partida por ID
    const item = await promette.ct_partida.findByPk(id_partida, {
      include: [
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto_consumibles",
          // Elimina el filtro where para que traiga la partida aunque no tenga productos activos
          required: false,
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ msg: "Partida no encontrada" });
    }

    return res.status(200).json({ item });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al obtener la partida" });
  }
};

// GET - Obtener partidas por ID de capítulo
export const getItemsByChapter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_capitulo } = req.params;

  try {
    const items = await promette.ct_partida.findAll({
      where: {
        ct_capitulo_id: id_capitulo,
        estado: 1,
      },
      include: [
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
      ],
      order: [["clave_partida", "ASC"]],
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Error al obtener las partidas del capítulo" });
  }
};

// POST - Crear una nueva partida
export const createItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    ct_capitulo_id,
    clave_partida,
    nombre_partida,
    estado = 1,
  } = req.body;

  try {
    const newItem = await promette.ct_partida.create({
      ct_capitulo_id,
      clave_partida,
      nombre_partida,
      estado,
    });

    return res.status(201).json({
      msg: "Partida creada correctamente",
      item: newItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al crear la partida" });
  }
};

// PUT - Actualizar una partida existente
export const updateItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_partida } = req.params;
  const { ct_capitulo_id, clave_partida, nombre_partida, estado } = req.body;

  try {
    const item = await promette.ct_partida.findByPk(id_partida);

    if (!item) {
      return res.status(404).json({ msg: "Partida no encontrada" });
    }

    await promette.ct_partida.update(
      { ct_capitulo_id, clave_partida, nombre_partida, estado },
      { where: { id_partida } }
    );

    const updatedItem = await promette.ct_partida.findByPk(id_partida, {
      include: [
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
      ],
    });

    return res.status(200).json({
      msg: "Partida actualizada correctamente",
      item: updatedItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al actualizar la partida" });
  }
};

// DELETE - Eliminar una partida (cambiar estado a 0)
export const deleteItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_partida } = req.params;

  try {
    const item = await promette.ct_partida.findByPk(id_partida);

    if (!item) {
      return res.status(404).json({ msg: "Partida no encontrada" });
    }

    await promette.ct_partida.update({ estado: 0 }, { where: { id_partida } });

    return res.status(200).json({ msg: "Partida eliminada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al eliminar la partida" });
  }
};

// GET - Obtener solo partidas que tienen productos activos asociados (NO incluir los productos en el array)
export const getItemsWithProductsRestricted = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_area } = req.params;
  try {
    // Solo partidas con productos activos asociados, pero NO incluir los productos en el resultado
    const itemsWithProducts = await promette.ct_partida.findAll({
      where: { estado: 1 },
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto_consumibles", // <-- debe coincidir con el modelo
          where: { estado: 1 },
          required: true,
          attributes: [], // No incluir los productos en el resultado
        },
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
      ],
      order: [["clave_partida", "ASC"]],
    });

    // Limpiar el array para no mostrar la propiedad ct_producto_consumibles
    let items = itemsWithProducts.map((item: any) => {
      const { ct_producto_consumibles, ...rest } = item.toJSON();
      return rest;
    });

    //Quitar las partidas que no aplican
    const partidasNo = await promette.rl_partida_area.findAll({
      attributes: ['id_partida'],
      where: { id_area_infra: { [Op.ne]: id_area } },
    });
    //Asegurar las que estan asignadas directamente
    const partidasSi = await promette.rl_partida_area.findAll({
      attributes: ['id_partida'],
      where: { id_area_infra: { [Op.eq]: id_area } },
    });
    const evitar = partidasNo.map((x: { id_partida: any; }) => x.id_partida);
    const asegurar = partidasSi.map((x: { id_partida: any; }) => x.id_partida);
    items = items.filter((i: { id_partida: any; }) => !evitar.includes(i.id_partida) || asegurar.includes(i.id_partida));

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener partidas con productos",
    });
  }
};

// GET - Obtener solo partidas que tienen productos activos asociados (NO incluir los productos en el array)
export const getItemsWithProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Solo partidas con productos activos asociados, pero NO incluir los productos en el resultado
    const itemsWithProducts = await promette.ct_partida.findAll({
      where: { estado: 1 },
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto_consumibles", // <-- debe coincidir con el modelo
          where: { estado: 1 },
          required: true,
          attributes: [], // No incluir los productos en el resultado
        },
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
      ],
      order: [["clave_partida", "ASC"]],
    });

    // Limpiar el array para no mostrar la propiedad ct_producto_consumibles
    const items = itemsWithProducts.map((item: any) => {
      const { ct_producto_consumibles, ...rest } = item.toJSON();
      return rest;
    });

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener partidas con productos",
    });
  }
};

// GET - Obtener productos asociados a una partida específica por su ID
export const getProductsByPartidaId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_partida } = req.params;

  try {
    // Verificar que la partida exista
    const partida = await promette.ct_partida.findByPk(id_partida, {
      attributes: ["id_partida", "clave_partida", "nombre_partida"],
    });

    if (!partida) {
      return res.status(404).json({
        success: false,
        msg: "Partida no encontrada",
        products: [],
      });
    }

    // Buscar productos activos asociados a esa partida
    const productos = await promette.ct_producto_consumible.findAll({
      where: { ct_partida_id: id_partida, estado: 1 },
      include: [
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
          attributes: ["id_unidad", "nombre_unidad"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      msg:
        productos.length > 0
          ? `${productos.length} productos encontrados para la partida`
          : "No se encontraron productos para la partida",
      products: productos,
      partida: partida,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener productos por partida",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
