import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";
import axios from "axios";





export class ProductoAreaController {
  static async obtenerTodasLasRestricciones(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { page = 1, limit = 10, id_area_fin, id_producto } = req.query;

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const whereClause: any = {};
      if (id_area_fin)
        whereClause.id_area_infra = parseInt(id_area_fin as string);
      if (id_producto)
        whereClause.ct_productos_id = parseInt(id_producto as string);

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const { count, rows } = await promette.rl_producto_area.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: promette.ct_producto_consumible,
            as: "id_producto_ct_producto_consumible",
            attributes: [
              "id_producto",
              "nombre_producto",
              "descripcion",
              "marca",
              "modelo",
              "precio",
            ],
          },
          {
            model: promette.rl_area_financiero,
            as: "id_area_infra_rl_area_financiero",
            attributes: [
              "id_area_fin",
              "id_financiero",
              "id_area_infra",
              "nombre_area",
            ],
          },
        ],
        limit: parseInt(limit as string),
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        msg: "Restricciones producto-área obtenidas exitosamente",
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(count / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      console.error("Error al obtener restricciones producto-área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener productos restringidos para una unidad administrativa específica
   */
  static async obtenerProductosRestringidosPorArea(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin } = req.params;

      if (!id_area_fin) {
        return res.status(400).json({
          success: false,
          msg: "El ID del área administrativa es requerido",
        });
      }

      // Buscar productos restringidos para el área
      const productosRestringidos = await promette.rl_producto_area.findAll({
        where: { id_area_infra: parseInt(id_area_fin) },
        include: [
          {
            model: promette.ct_producto_consumible,
            as: "id_producto_ct_producto_consumible",
            attributes: [
              "id_producto",
              "nombre_producto",
              "precio", 
              "ct_unidad_id", 
            ],
            include: [
              {
                model: promette.ct_unidad_medida,
                as: "ct_unidad", // Asegúrate que este alias coincida con tu modelo
                attributes: ["id_unidad", "nombre_unidad", "clave_unidad"],
              },
            ],
          },
        ],
        order: [["id_producto", "ASC"]],
      });

      // Formatear respuesta para incluir precio y unidad de medida
      const productos = productosRestringidos.map((item: { toJSON: () => any; }) => {
        const producto = item.toJSON();
        return {
          id_producto_area: producto.id_producto_area,
          id_producto: producto.id_producto,
          id_area_infra: producto.id_area_infra,
          producto: {
            id_producto:
              producto.id_producto_ct_producto_consumible?.id_producto,
            nombre_producto:
              producto.id_producto_ct_producto_consumible?.nombre_producto,
            precio: parseFloat(
              producto.id_producto_ct_producto_consumible?.precio?.toString() ||
                "0"
            ),
            unidad_medida: producto.id_producto_ct_producto_consumible
              ?.ct_unidad
              ? {
                  id_unidad:
                    producto.id_producto_ct_producto_consumible.ct_unidad
                      .id_unidad,
                  nombre_unidad:
                    producto.id_producto_ct_producto_consumible.ct_unidad
                      .nombre_unidad,
                  clave_unidad:
                    producto.id_producto_ct_producto_consumible.ct_unidad
                      .clave_unidad,
                }
              : null,
          },
          createdAt: producto.createdAt,
          updatedAt: producto.updatedAt,
        };
      });

      return res.status(200).json({
        success: true,
        msg: "Productos restringidos obtenidos exitosamente",
        productos: productos,
        total: productos.length,
      });
    } catch (error: any) {
      console.error("Error al obtener productos restringidos por área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener áreas que tienen restricciones para un producto específico
   */
  static async obtenerAreasPorProductoRestringido(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_producto } = req.params;

      if (!id_producto) {
        return res.status(400).json({
          success: false,
          msg: "El ID del producto es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const areasConRestriccion = await promette.rl_producto_area.findAll({
        where: {
          id_producto: parseInt(id_producto),
        },
        include: [
          {
            model: promette.rl_area_financiero,
            as: "id_area_infra_rl_area_financiero",
            attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
          },
          {
            model: promette.ct_producto_consumible,
            as: "id_producto_ct_producto_consumible",
            attributes: ["id_producto", "nombre_producto", "marca", "modelo"],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        msg: "Áreas con restricción para el producto obtenidas exitosamente",
        areas: areasConRestriccion,
        total: areasConRestriccion.length,
      });
    } catch (error: any) {
      console.error("Error al obtener áreas por producto restringido:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener una restricción producto-área por ID
   */
  static async obtenerRestriccionPorId(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin } = req.params;

      if (!id_area_fin) {
        return res.status(400).json({
          success: false,
          msg: "El ID del área administrativa es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      // Buscar productos restringidos para el área
      const productosRestringidos = await promette.rl_producto_area.findAll({
        where: { id_area_infra: parseInt(id_area_fin) },
        include: [
          {
            model: promette.ct_producto_consumible,
            as: "id_producto_ct_producto_consumible",
            attributes: ["id_producto", "nombre_producto"],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        msg: "Productos restringidos obtenidos exitosamente",
        productos: productosRestringidos,
        total: productosRestringidos.length,
      });
    } catch (error: any) {
      console.error("Error al obtener productos restringidos por área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Crear una nueva restricción producto-área
   */
  static async crearRestriccion(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin, id_producto, ct_usuario_in } = req.body;

      if (!id_area_fin || !id_producto || !ct_usuario_in) {
        return res.status(400).json({
          success: false,
          msg: "Los campos id_area_infra, id_producto y ct_usuario_in son requeridos",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      // Verificar que no exista ya la restricción
      const restriccionExistente = await promette.rl_producto_area.findOne({
        where: {
          id_area_infra: parseInt(id_area_fin),
          id_producto: parseInt(id_producto),
        },
      });

      if (restriccionExistente) {
        return res.status(409).json({
          success: false,
          msg: "El producto ya está restringido para esta unidad administrativa",
        });
      }

      // Verificar que exista el área y el producto
      const area = await promette.rl_area_financiero.findOne({
        where: { id_area_fin: parseInt(id_area_fin) },
      });
      const producto = await promette.ct_producto_consumible.findByPk(
        parseInt(id_producto)
      );

      if (!area) {
        return res.status(404).json({
          success: false,
          msg: "El área administrativa no existe",
        });
      }

      if (!producto) {
        return res.status(404).json({
          success: false,
          msg: "El producto no existe",
        });
      }

      // Crear la nueva restricción
      const nuevaRestriccion = await promette.rl_producto_area.create({
        id_area_infra: parseInt(id_area_fin),
        id_producto: parseInt(id_producto),
        ct_usuario_in: parseInt(ct_usuario_in),
      });

      return res.status(201).json({
        success: true,
        msg: "Producto restringido exitosamente para la unidad administrativa",
        restriccion: nuevaRestriccion,
      });
    } catch (error: any) {
      console.error("Error al crear restricción producto-área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Actualizar una restricción producto-área existente
   */
  static async actualizarRestriccion(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_producto_area } = req.params;
      const { id_area_fin, id_producto, ct_usuario_at } = req.body;

      if (!id_producto_area) {
        return res.status(400).json({
          success: false,
          msg: "El ID de la restricción producto-área es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const restriccion = await promette.rl_producto_area.findByPk(
        id_producto_area
      );

      if (!restriccion) {
        return res.status(404).json({
          success: false,
          msg: "La restricción producto-área no existe",
        });
      }

      // Verificar si ya existe otra restricción con los mismos datos (evitar duplicados)
      if (id_area_fin && id_producto) {
        const restriccionDuplicada = await promette.rl_producto_area.findOne({
          where: {
            id_area_infra: parseInt(id_area_fin),
            id_producto: parseInt(id_producto),
            id_producto_area: { [Op.ne]: parseInt(id_producto_area) },
          },
        });

        if (restriccionDuplicada) {
          return res.status(409).json({
            success: false,
            msg: "Ya existe una restricción con estos datos",
          });
        }
      }

      // Actualizar la restricción
      const datosActualizacion: any = {};
      if (id_area_fin) datosActualizacion.id_area_infra = parseInt(id_area_fin);
      if (id_producto) datosActualizacion.id_producto = parseInt(id_producto);
      if (ct_usuario_at)
        datosActualizacion.ct_usuario_at = parseInt(ct_usuario_at);

      await restriccion.update(datosActualizacion);

      // Obtener la restricción actualizada con sus asociaciones
      const restriccionActualizada = await promette.rl_producto_area.findByPk(
        id_producto_area,
        {
          include: [
            {
              model: promette.ct_producto_consumible,
              as: "id_producto_ct_producto_consumible",
              attributes: ["id_producto", "nombre_producto"],
            },
            {
              model: promette.rl_area_financiero,
              as: "id_area_infra_rl_area_financiero",
              attributes: [
                "id_area_fin",
                "id_financiero",
                "id_area_infra",
                "nombre_area",
              ],
            },
          ],
        }
      );

      return res.status(200).json({
        success: true,
        msg: "Restricción producto-área actualizada exitosamente",
        restriccion: restriccionActualizada,
      });
    } catch (error: any) {
      console.error("Error al actualizar restricción producto-área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Restringir múltiples productos para una unidad administrativa
   */
  static async restringirMultiplesProductos(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin, productos, ct_usuario_in } = req.body;

      if (
        !id_area_fin ||
        !productos ||
        !Array.isArray(productos) ||
        !ct_usuario_in
      ) {
        return res.status(400).json({
          success: false,
          msg: "Los campos id_area_fin, productos (array) y ct_usuario_in son requeridos",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      // Verificar que existe el área
      const area = await promette.rl_area_financiero.findOne({
        where: { id_area_infra: parseInt(id_area_fin) },
      });
      if (!area) {
        return res.status(404).json({
          success: false,
          msg: "El área administrativa no existe",
        });
      }

      const restriccionesCreadas = [];
      const errores = [];

      for (const id_producto of productos) {
        try {
          // Verificar que no exista ya la restricción
          const restriccionExistente = await promette.rl_producto_area.findOne({
            where: {
              id_area_infra: parseInt(id_area_fin),
              id_producto: parseInt(id_producto),
            },
          });

          if (!restriccionExistente) {
            const nuevaRestriccion = await promette.rl_producto_area.create({
              id_area_infra: parseInt(id_area_fin),
              id_producto: parseInt(id_producto),
              ct_usuario_in: parseInt(ct_usuario_in),
            });
            restriccionesCreadas.push(nuevaRestriccion);
          } else {
            errores.push(`Producto ${id_producto} ya estaba restringido`);
          }
        } catch (error: any) {
          errores.push(`Error con producto ${id_producto}: ${error.message}`);
        }
      }

      return res.status(200).json({
        success: true,
        msg: "Proceso de restricción completado",
        data: {
          restringidos: restriccionesCreadas,
          errores: errores,
        },
        total_restringidos: restriccionesCreadas.length,
        total_errores: errores.length,
      });
    } catch (error: any) {
      console.error("Error al restringir múltiples productos:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Verificar si un producto está restringido para una unidad administrativa
   */
  static async verificarRestriccionProducto(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin, id_producto } = req.params;

      if (!id_area_fin || !id_producto) {
        return res.status(400).json({
          success: false,
          msg: "Los parámetros id_area_fin e id_producto son requeridos",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const restriccion = await promette.rl_producto_area.findOne({
        where: {
          id_area_infra: parseInt(id_area_fin),
          id_producto: parseInt(id_producto),
        },
        include: [
          {
            model: promette.ct_producto_consumible,
            as: "id_producto_ct_producto_consumible",
            attributes: ["nombre_producto", "marca", "modelo"],
          },
          {
            model: promette.rl_area_financiero,
            as: "id_area_fin_rl_area_financiero",
            include: [
              {
                model: promette.rl_area_financiero,
                as: "id_area_fin_rl_area_financiero",
                attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
              },
            ],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        msg: "Verificación de restricción completada",
        data: {
          esta_restringido: !!restriccion,
          puede_acceder: !restriccion, // Lógica inversa: si no hay restricción, puede acceder
          restriccion: restriccion,
        },
      });
    } catch (error: any) {
      console.error("Error al verificar restricción de producto:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener productos disponibles (no restringidos) para una unidad administrativa
   */
  static async obtenerProductosDisponiblesPorArea(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin } = req.params;
      const { id_partida } = req.query; // Opcional: filtrar por partida

      if (!id_area_fin) {
        return res.status(400).json({
          success: false,
          msg: "El ID del área administrativa es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      // Obtener IDs de productos restringidos para esta área
      const productosRestringidos = await promette.rl_producto_area.findAll({
        where: { id_area_infra: parseInt(id_area_fin) },
        attributes: ["id_producto"],
      });

      const idsRestringidos = productosRestringidos.map(
        (p: { id_producto: any }) => p.id_producto
      );

      // Construir where clause para productos disponibles
      const whereClause: any = {};
      if (idsRestringidos.length > 0) {
        whereClause.id_producto = { [Op.notIn]: idsRestringidos };
      }
      if (id_partida) {
        whereClause.ct_partida_id = parseInt(id_partida as string);
      }

      // Obtener productos disponibles (no restringidos)
      const productosDisponibles =
        await promette.ct_producto_consumible.findAll({
          where: whereClause,
          attributes: ["id_producto", "nombre_producto"],
          include: [
            {
              model: promette.ct_partida,
              as: "ct_partida",
              attributes: ["clave_partida", "nombre_partida"],
            },
          ],
          order: [["nombre_producto", "ASC"]],
        });

      return res.status(200).json({
        success: true,
        msg: "Productos disponibles obtenidos exitosamente",
        productos: productosDisponibles,
        total: productosDisponibles.length,
        restringidos_count: idsRestringidos.length,
      });
    } catch (error: any) {
      console.error("Error al obtener productos disponibles:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Cambiar estado de una restricción producto-área (eliminar)
   */
  static async cambiarEstadoRestriccion(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_producto_area } = req.params;
      const { ct_usuario_at } = req.body;

      if (!id_producto_area) {
        return res.status(400).json({
          success: false,
          msg: "El ID de la restricción producto-área es requerido",
        });
      }

      if (!ct_usuario_at) {
        return res.status(400).json({
          success: false,
          msg: "El campo ct_usuario_at es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      const restriccion = await promette.rl_producto_area.findByPk(
        id_producto_area
      );

      if (!restriccion) {
        return res.status(404).json({
          success: false,
          msg: "La restricción producto-área no existe",
        });
      }

      // Actualizar quien realizó la eliminación y eliminar físicamente
      await restriccion.update({ ct_usuario_at: parseInt(ct_usuario_at) });
      await restriccion.destroy();

      return res.status(200).json({
        success: true,
        msg: "Restricción producto-área eliminada exitosamente",
      });
    } catch (error: any) {
      console.error("Error al cambiar estado de restricción:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  /**
   * Obtener resumen de restricciones por área administrativa
   */
  static async obtenerResumenRestricciones(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin } = req.params;

      if (!id_area_fin) {
        return res.status(400).json({
          success: false,
          msg: "El ID del área administrativa es requerido",
        });
      }

      if (!promette) {
        return res.status(500).json({
          success: false,
          msg: "Error de conexión a la base de datos",
        });
      }

      // Contar productos restringidos
      const productosRestringidos = await promette.rl_producto_area.count({
        where: { id_area_infra: parseInt(id_area_fin) },
      });

      // Contar total de productos
      const totalProductos = await promette.ct_producto_consumible.count();

      // Obtener partidas permitidas para esta área
      const partidasPermitidas = await promette.rl_partida_area.findAll({
        where: { id_area_infra: parseInt(id_area_fin) },
        include: [
          {
            model: promette.ct_partida,
            as: "id_partida_ct_partida",
            attributes: ["clave_partida", "nombre_partida"],
          },
        ],
      });

      const productosDisponibles = totalProductos - productosRestringidos;
      const porcentajeDisponible =
        totalProductos > 0
          ? ((productosDisponibles / totalProductos) * 100).toFixed(2)
          : 0;

      return res.status(200).json({
        success: true,
        msg: "Resumen de restricciones obtenido exitosamente",
        data: {
          area_id: parseInt(id_area_fin),
          total_productos: totalProductos,
          productos_restringidos: productosRestringidos,
          productos_disponibles: productosDisponibles,
          porcentaje_disponible: parseFloat(porcentajeDisponible as string),
          partidas_permitidas: partidasPermitidas.length,
          detalle_partidas: partidasPermitidas,
        },
      });
    } catch (error: any) {
      console.error("Error al obtener resumen de restricciones:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  static async obtenerProductosPorArea(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { id_area_fin } = req.params;

      // Validar que el parámetro sea un número válido
      if (!id_area_fin || isNaN(Number(id_area_fin))) {
        return res.status(400).json({
          success: false,
          msg: "El parámetro id_area_fin debe ser un número válido",
        });
      }

      const areaFinId = parseInt(id_area_fin);

      // Verificar que el área financiera existe
      const areaFinanciera = await promette.rl_area_financiero.findByPk(
        areaFinId
      );

      if (!areaFinanciera) {
        return res.status(404).json({
          success: false,
          msg: `No se encontró el área financiera con ID ${areaFinId}`,
        });
      }

      // Obtener el JWT del header si existe
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      // Obtener el nombre del área desde la API de infraestructura
      let nombre_area = "Área no encontrada";
      try {
        const config = {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        };
        const response = await axios.get(
          `${process.env.INFRAESTRUCTURA_API}/area`,
          config
        );
        if (response.data && Array.isArray(response.data)) {
          const area = response.data.find(
            (a: any) => a.id_area === areaFinanciera.id_area_infra
          );
          if (area) nombre_area = area.nombre;
        }
      } catch (error) {
        console.error(
          "Error al obtener nombre de área de infraestructura:",
          error
        );
      }

      // 1. Obtener las partidas permitidas para esta área
      const partidasPermitidas = await promette.rl_partida_area.findAll({
        where: { id_area_infra: areaFinId },
        raw: true,
      });

      if (partidasPermitidas.length === 0) {
        return res.status(200).json({
          success: true,
          msg: "No hay partidas configuradas para esta área",
          data: {
            id_area_infra: areaFinId,
            nombre_area,
            partidas: [],
          },
        });
      }

      // 2. Obtener los IDs de las partidas permitidas
      const idsPartidasPermitidas: number[] = partidasPermitidas.map(
        (p: any) => p.id_partida
      );

      // 3. Obtener los productos restringidos para esta área (blacklist)
      const productosRestringidos = await promette.rl_producto_area.findAll({
        where: { id_area_infra: areaFinId },
        attributes: ["id_producto"],
        raw: true,
      });

      const idsProductosRestringidos: number[] = productosRestringidos.map(
        (p: { id_producto: number }) => p.id_producto
      );

      // 4. Obtener los datos de las partidas
      const partidas = await promette.ct_partida.findAll({
        where: { id_partida: idsPartidasPermitidas },
        attributes: ["id_partida", "clave_partida", "nombre_partida"],
        raw: true,
      });

      // 5. Construir el resultado agrupado por partidas
      const resultado: {
        id_area_infra: number;
        nombre_area: string;
        partidas: Array<{
          id_partida: number;
          clave_partida: string;
          nombre_partida: string;
          total_productos_disponibles: number;
          productos: any[];
        }>;
      } = {
        id_area_infra: areaFinId,
        nombre_area,
        partidas: [],
      };

      // 6. Procesar cada partida permitida
      for (const partida of partidas) {
        const whereCondition: any = {
          ct_partida_id: partida.id_partida,
          estado: 1, // Solo productos activos
        };

        // Excluir productos restringidos si existen
        if (idsProductosRestringidos.length > 0) {
          whereCondition.id_producto = {
            [Op.notIn]: idsProductosRestringidos,
          };
        }

        const productosDisponibles =
          await promette.ct_producto_consumible.findAll({
            where: whereCondition,
            include: [
              {
                model: promette.ct_partida,
                as: "ct_partida",
                attributes: ["id_partida", "clave_partida", "nombre_partida"],
              },
              {
                model: promette.ct_unidad_medida,
                as: "ct_unidad",
                attributes: ["id_unidad", "nombre_unidad", "clave_unidad"],
              },
            ],
            order: [["nombre_producto", "ASC"]],
          });

        resultado.partidas.push({
          id_partida: partida.id_partida,
          clave_partida: partida.clave_partida,
          nombre_partida: partida.nombre_partida,
          total_productos_disponibles: productosDisponibles.length,
          productos: productosDisponibles.map((producto: any) => ({
            id_producto: producto.id_producto,
            nombre_producto: producto.nombre_producto,
            precio: parseFloat(producto.precio?.toString() || "0"),
            unidad_medida: {
              id_unidad: producto.ct_unidad?.id_unidad || null,
              clave_unidad: producto.ct_unidad?.clave_unidad || null,
              nombre_unidad: producto.ct_unidad?.nombre_unidad || null,
            },
            createdAt: producto.createdAt,
            updatedAt: producto.updatedAt,
          })),
        });
      }

      // 7. Calcular estadísticas
      const totalProductosDisponibles = resultado.partidas.reduce(
        (sum, partida) => sum + partida.total_productos_disponibles,
        0
      );

      return res.status(200).json({
        success: true,
        msg: "Productos disponibles obtenidos exitosamente",
        data: {
          ...resultado,
          estadisticas: {
            total_partidas_permitidas: resultado.partidas.length,
            total_productos_disponibles: totalProductosDisponibles,
            total_productos_restringidos: idsProductosRestringidos.length,
          },
        },
      });
    } catch (error: any) {
      console.error("Error al obtener productos por área:", error);
      return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}
