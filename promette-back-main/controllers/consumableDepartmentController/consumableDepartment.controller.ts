import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";
import { ConsumableDepartmentSchema } from "../../validations/consumableDelivery.validations";
import { ZodError } from "zod";



// Controlador para obtener todos los departamentos de consumibles
export const getAllConsumableDepartments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Obtener todos los departamentos de la base de datos
    const departments = await promette.ct_consumible_departamento.findAll({
      include: [
        {
          model: promette.ct_consumible_direccion,
          as: "ct_direccion",
        },
      ],
    });

    if (departments.length === 0) {
      return res.status(404).json({
        msg: "No se encontraron departamentos",
      });
    }

    return res.status(200).json({
      departments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener los departamentos",
    });
  }
};

// Controlador para obtener un departamento por ID
export const getConsumableDepartmentById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id_departamento } = req.params;

  try {
    // Buscar un departamento por su ID
    const department = await promette.ct_consumible_departamento.findByPk(
      id_departamento,
      {
        include: [
          {
            model: promette.ct_consumible_direccion,
            as: "ct_direccion",
          },
        ],
      }
    );

    if (!department) {
      return res.status(404).json({
        msg: "Departamento no encontrado",
      });
    }

    return res.status(200).json({
      department,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al obtener el departamento",
    });
  }
};

// Controlador para crear un nuevo departamento
export const createConsumableDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    // Validar la entrada con Zod (opcional si ya usas middleware)
    const validatedData = ConsumableDepartmentSchema.parse(req.body);

    const { nombre_departamento, ct_puesto_id, ct_direccion_id } =
      validatedData;

    // Verificar si ya existe un departamento con el mismo nombre en la misma dirección
    const existingDepartment =
      await promette.ct_consumible_departamento.findOne({
        where: { nombre_departamento, ct_direccion_id },
      });

    if (existingDepartment) {
      return res.status(400).json({
        msg: "Ya existe un departamento con ese nombre en la misma dirección",
      });
    }

    // Verificar si la dirección existe
    const direction = await promette.ct_consumible_direccion.findByPk(
      ct_direccion_id
    );

    if (!direction) {
      return res.status(400).json({
        msg: "La dirección especificada no existe",
      });
    }

    // Crear un nuevo departamento
    const newDepartment = await promette.ct_consumible_departamento.create({
      nombre_departamento,
      ct_puesto_id,
      ct_direccion_id,
    });

    return res.status(201).json({
      msg: "Departamento creado correctamente",
      department: newDepartment,
    });
  } catch (error: unknown) {
    console.error("Error en createConsumableDepartment:", error);

    // Manejar errores de validación de Zod
    if (error instanceof ZodError) {
      return res.status(400).json({
        msg: "Datos de entrada inválidos",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      msg: "Error al crear el departamento",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para actualizar un departamento
export const updateConsumableDepartment = async (
  req: Request,
  res: Response
) => {
  const { id_departamento } = req.params;

  try {
    // Validar la entrada con Zod (opcional si ya usas middleware)
    const validatedData = ConsumableDepartmentSchema.parse(req.body);

    const { nombre_departamento, ct_puesto_id, ct_direccion_id } =
      validatedData;

    // Verificar si el departamento existe
    const department = await promette.ct_consumible_departamento.findByPk(
      id_departamento
    );

    if (!department) {
      return res.status(404).json({
        msg: "Departamento no encontrado",
      });
    }

    // Verificar si ya existe otro departamento con el mismo nombre en la misma dirección
    const existingDepartment =
      await promette.ct_consumible_departamento.findOne({
        where: {
          nombre_departamento,
          ct_direccion_id,
          id_departamento: { [Op.ne]: id_departamento },
        },
      });

    if (existingDepartment) {
      return res.status(400).json({
        msg: "Ya existe otro departamento con ese nombre en la misma dirección",
      });
    }

    // Verificar si la dirección existe
    const direction = await promette.ct_consumible_direccion.findByPk(
      ct_direccion_id
    );

    if (!direction) {
      return res.status(400).json({
        msg: "La dirección especificada no existe",
      });
    }

    // Actualizar el departamento
    await promette.ct_consumible_departamento.update(
      {
        nombre_departamento,
        ct_puesto_id,
        ct_direccion_id,
      },
      {
        where: { id_departamento },
      }
    );

    // Obtener el departamento actualizado
    const updatedDepartment =
      await promette.ct_consumible_departamento.findByPk(id_departamento, {
        include: [
          {
            model: promette.ct_consumible_direccion,
            as: "ct_direccion",
          },
        ],
      });

    return res.status(200).json({
      msg: "Departamento actualizado correctamente",
      department: updatedDepartment,
    });
  } catch (error: unknown) {
    console.error("Error en updateConsumableDepartment:", error);

    // Manejar errores de validación de Zod
    if (error instanceof ZodError) {
      return res.status(400).json({
        msg: "Datos de entrada inválidos",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      msg: "Error al actualizar el departamento",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Controlador para eliminar un departamento
export const deleteConsumableDepartment = async (
  req: Request,
  res: Response
) => {
  const { id_departamento } = req.params;

  try {
    // Verificar si el departamento existe
    const department = await promette.ct_consumible_departamento.findByPk(
      id_departamento
    );

    if (!department) {
      return res.status(404).json({
        msg: "Departamento no encontrado",
      });
    }

    // Eliminar el departamento
    await promette.ct_consumible_departamento.destroy({
      where: { id_departamento },
    });

    return res.status(200).json({
      msg: "Departamento eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al eliminar el departamento",
    });
  }
};
