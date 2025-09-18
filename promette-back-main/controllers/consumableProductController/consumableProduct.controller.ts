import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



// Controlador para obtener todos los productos
export const getAllConsumableProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todos los productos de la base de datos
    const products = await promette.ct_producto_consumible.findAll({
      where: { estado: 1 },
      include: [
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
        },
        {
          model: promette.ct_partida,
          as: "ct_partida",
        },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron productos",
      });
    }

    return res.status(200).json({
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los productos",
    });
  }
};

// Controlador para obtener un producto por ID
export const getConsumableProductById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_producto } = req.params;

  try {
    // Buscar un producto por su ID
    const product = await promette.ct_producto_consumible.findByPk(
      id_producto,
      {
        include: [
          {
            model: promette.ct_unidad_medida,
            as: "ct_unidad",
          },
          {
            model: promette.ct_partida,
            as: "ct_partida",
          },
        ],
      }
    );

    if (!product) {
      return res.status(404).json({
        msg: "Producto no encontrado",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el producto",
    });
  }
};

// Controlador para crear un nuevo producto
export const createConsumableProduct = async (req: Request, res: Response) => {
  const {
    nombre_producto,
    precio = 0,
    ct_unidad_id,
    estado = 1,
    ct_usuario_in,
    ct_usuario_at,
    ct_partida_id,
  } = req.body;

  try {
    // Verificar si la unidad de medida existe
    const measurementUnit = await promette.ct_unidad_medida.findByPk(
      ct_unidad_id
    );

    if (!measurementUnit) {
      return res.status(400).json({
        msg: "La unidad de medida especificada no existe",
      });
    }

    // Verificar si la partida existe
    const item = await promette.ct_partida.findByPk(ct_partida_id);

    if (!item) {
      return res.status(400).json({
        msg: "La partida especificada no existe",
      });
    }

    // Crear un nuevo producto
    const newProduct = await promette.ct_producto_consumible.create({
      nombre_producto,
      precio,
      ct_unidad_id,
      estado,
      ct_usuario_in,
      ct_usuario_at,
      ct_partida_id,
    });

    return res.status(201).json({
      msg: "Producto creado correctamente",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al crear el producto",
    });
  }
};

// Controlador para actualizar un producto
export const updateConsumableProduct = async (req: Request, res: Response) => {
  const { id_producto } = req.params;
  const {
    nombre_producto,
    precio,
    ct_unidad_id,
    estado,
    ct_usuario_in,
    ct_usuario_at,
    ct_partida_id,
  } = req.body;

  try {
    // Verificar si el producto existe
    const product = await promette.ct_producto_consumible.findByPk(id_producto);

    if (!product) {
      return res.status(404).json({
        msg: "Producto no encontrado",
      });
    }
    // Verificar si la unidad de medida existe
    const measurementUnit = await promette.ct_unidad_medida.findByPk(
      ct_unidad_id
    );

    if (!measurementUnit) {
      return res.status(400).json({
        msg: "La unidad de medida especificada no existe",
      });
    }

    // Verificar si la partida existe
    const item = await promette.ct_partida.findByPk(ct_partida_id);

    if (!item) {
      return res.status(400).json({
        msg: "La partida especificada no existe",
      });
    }

    // Actualizar el producto
    await promette.ct_producto_consumible.update(
      {
        nombre_producto,
        precio,
        ct_unidad_id,
        estado,
        ct_usuario_in,
        ct_usuario_at,
        ct_partida_id,
      },
      {
        where: { id_producto },
      }
    );

    // Obtener el producto actualizado
    const updatedProduct = await promette.ct_producto_consumible.findByPk(
      id_producto,
      {
        include: [
          {
            model: promette.ct_unidad_medida,
            as: "ct_unidad",
          },
          {
            model: promette.ct_partida,
            as: "ct_partida",
          },
        ],
      }
    );

    return res.status(200).json({
      msg: "Producto actualizado correctamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al actualizar el producto",
    });
  }
};

// Controlador para eliminar un producto (actualiza el estado a 0)
export const deleteConsumableProduct = async (req: Request, res: Response) => {
  const { id_producto } = req.params;

  try {
    // Cambia el estado a 0 directamente
    const [updatedRows] = await promette.ct_producto_consumible.update(
      { estado: 0 },
      { where: { id_producto } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    return res.json({ msg: "Producto eliminado correctamente (estado = 0)" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al eliminar el producto" });
  }
};

// Controlador para obtener productos por ID de partida
export const getProductsByItem = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { itemId } = req.params;

    console.log(`Getting products for partida ID: ${itemId}`);

    if (!itemId) {
      return res.status(400).json({
        success: false,
        msg: "Partida ID is required",
      });
    }

    // First, verify if the partida exists
    const partida = await promette.ct_partida.findByPk(itemId);
    if (!partida) {
      return res.status(404).json({
        success: false,
        msg: `Partida with ID ${itemId} not found`,
        products: [],
      });
    }

    // Get active products for this partida
    const products = await promette.ct_producto_consumible.findAll({
      where: {
        ct_partida_id: itemId,
        estado: 1,
      },
      include: [
        {
          model: promette.ct_partida,
          as: "ct_partida",
          attributes: ["id_partida", "clave_partida", "nombre_partida"],
        },
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
          attributes: ["id_unidad", "nombre_unidad"],
        },
      ],
    });

    console.log(`Found ${products.length} products for partida ${itemId}`);

    // Return the products and partida info
    return res.status(200).json({
      success: true,
      msg:
        products.length > 0
          ? `${products.length} products found for partida ${itemId}`
          : `No products found for partida ${itemId}`,
      products: products,
      partida: {
        id: partida.id_partida,
        clave: partida.clave_partida,
        nombre: partida.nombre_partida,
      },
    });
  } catch (error) {
    console.error(`Error getting products for partida: ${error}`);
    return res.status(500).json({
      success: false,
      msg: "Error getting products",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getProductsByItemId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const itemId = Number(req.params.id_partida || req.params.itemId);

    console.log(`Getting products for partida ID: ${itemId}`);

    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        msg: "ID de partida es requerido",
      });
    }

    // Buscar la partida por ID
    const partida = await promette.ct_partida.findByPk(itemId);
    if (!partida) {
      return res.status(404).json({
        success: false,
        msg: `Partida con ID ${itemId} no encontrada`,
        products: [],
      });
    }

    // Buscar productos activos para esa partida
    // Asegúrate que el campo ct_partida_id en la tabla ct_producto_consumible
    // coincide exactamente con el id_partida recibido y que los productos tienen estado = 1
    const products = await promette.ct_producto_consumible.findAll({
      where: {
        ct_partida_id: itemId,
        estado: 1,
      },
      include: [
        {
          model: promette.ct_partida,
          as: "ct_partida",
          attributes: ["id_partida", "clave_partida", "nombre_partida"],
        },
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
          attributes: ["id_unidad", "nombre_unidad"],
        },
      ],
    });

    console.log(`Found ${products.length} products for partida ${itemId}`);

    // Debug extra: muestra los productos encontrados y sus campos clave
    if (products.length === 0) {
      console.log("No se encontraron productos. Verifica en la base de datos:");
      // Opcional: puedes hacer un findAll sin estado para ver si hay productos inactivos
      const allProducts = await promette.ct_producto_consumible.findAll({
        where: { ct_partida_id: itemId },
      });
      console.log("Productos totales para esa partida:", allProducts.length);
      if (allProducts.length > 0) {
        console.log("Ejemplo de producto:", allProducts[0]);
      }
    }

    return res.status(200).json({
      success: true,
      msg:
        products.length > 0
          ? `${products.length} productos encontrados para partida ${itemId}`
          : `No se encontraron productos para partida ${itemId}`,
      products: products,
    });
  } catch (error) {
    console.error(`Error getting products for partida: ${error}`);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener productos",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
export const getProductsRestrictedByItemId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const areaId = Number(req.params.id_area);
    const itemId = Number(req.params.id_partida || req.params.itemId);

    console.log(`Getting products for partida ID: ${itemId}`);

    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        msg: "ID de partida es requerido",
      });
    }

    // Buscar la partida por ID
    const partida = await promette.ct_partida.findByPk(itemId);
    if (!partida) {
      return res.status(404).json({
        success: false,
        msg: `Partida con ID ${itemId} no encontrada`,
        products: [],
      });
    }

    // Buscar productos activos para esa partida
    // Asegúrate que el campo ct_partida_id en la tabla ct_producto_consumible
    // coincide exactamente con el id_partida recibido y que los productos tienen estado = 1
    let products = await promette.ct_producto_consumible.findAll({
      where: {
        ct_partida_id: itemId,
        estado: 1,
      },
      include: [
        {
          model: promette.ct_partida,
          as: "ct_partida",
          attributes: ["id_partida", "clave_partida", "nombre_partida"],
        },
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
          attributes: ["id_unidad", "nombre_unidad"],
        },
      ],
    });

    console.log(`Found ${products.length} products for partida ${itemId}`);

    // Debug extra: muestra los productos encontrados y sus campos clave
    if (products.length === 0) {
      console.log("No se encontraron productos. Verifica en la base de datos:");
      // Opcional: puedes hacer un findAll sin estado para ver si hay productos inactivos
      const allProducts = await promette.ct_producto_consumible.findAll({
        where: { ct_partida_id: itemId },
      });
      console.log("Productos totales para esa partida:", allProducts.length);
      if (allProducts.length > 0) {
        console.log("Ejemplo de producto:", allProducts[0]);
      }
    }
    //Quitar los productos que no se deben usar
    const productosNo = await promette.rl_producto_area.findAll({
      attributes: ['id_producto'],
      where: { id_area_infra:  areaId  },
    });
    const evitar = productosNo.map((x: { id_producto: any; }) => x.id_producto);
    products = products.filter((i: { id_producto: any; }) => !evitar.includes(i.id_producto));


    return res.status(200).json({
      success: true,
      msg:
        products.length > 0
          ? `${products.length} productos encontrados para partida ${itemId}`
          : `No se encontraron productos para partida ${itemId}`,
      products: products,
    });
  } catch (error) {
    console.error(`Error getting products for partida: ${error}`);
    return res.status(500).json({
      success: false,
      msg: "Error al obtener productos",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

// Endpoint para obtener los primeros 10 productos con su unidad de medida
export const getFirst10ConsumableProductsWithUnit = async (req: Request, res: Response): Promise<Response> => {
  try {
    const products = await promette.ct_producto_consumible.findAll({
      limit: 10,
      include: [
        {
          model: promette.ct_unidad_medida,
          as: 'ct_unidad',
          attributes: ['nombre_unidad'],
          required: false // LEFT JOIN
        }
      ]
    });
    // Formatea la respuesta para incluir nombre_unidad como 'unidad_medida'
    const result = products.map((prod: any) => ({
      ...prod.toJSON(),
      unidad_medida: prod.ct_unidad ? prod.ct_unidad.nombre_unidad : null
    }));
    return res.status(200).json({ products: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error al obtener los productos con unidad de medida' });
  }
};
