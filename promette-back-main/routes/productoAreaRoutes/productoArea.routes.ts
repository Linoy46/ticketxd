import { Router } from "express";
import { param } from "express-validator";
import { validateJwt } from "../../middlewares/validate.md";
import { validateRequest } from "../../middlewares/validateRequest.md";
import { ProductoAreaController } from "../../controllers/productoAreaController/productoArea.controller";
import {
  validateRestringirProducto,
  validateRestringirMultiplesProductos,
  validateIdAreaFin,
  validateIdProducto,
  validatePaginacion,
  validateRevocarRestriccion,
} from "../../validations/productoArea.validations";


const router = Router();

// Obtener todas las restricciones producto-área con paginación
router.get(
  "/",
  validateJwt,
  validatePaginacion,
  validateRequest,
  ProductoAreaController.obtenerTodasLasRestricciones
);

// Obtener una restricción producto-área por ID
router.get(
  "/:id_producto_area",
  validateJwt,
  validateRequest,
  ProductoAreaController.obtenerRestriccionPorId
);

// Obtener productos restringidos para una unidad administrativa
router.get(
  "/porArea/:id_area_fin",
  validateJwt,
  validateIdAreaFin,
  validateRequest,
  ProductoAreaController.obtenerProductosRestringidosPorArea
);

// Obtener áreas que tienen restricciones para un producto específico
router.get(
  "/porProducto/:id_producto",
  validateJwt,
  validateIdProducto,
  validateRequest,
  ProductoAreaController.obtenerAreasPorProductoRestringido
);

// Obtener productos disponibles (no restringidos) para una unidad administrativa
router.get(
  "/disponibles/:id_area_infra",
  validateJwt,
  validateIdAreaFin,
  validateRequest,
  ProductoAreaController.obtenerProductosDisponiblesPorArea
);

// Verificar si un producto está restringido para un área específica
router.get(
  "/verificarRestriccion/:id_area_infra/:id_producto",
  validateJwt,
  validateRequest,
  ProductoAreaController.verificarRestriccionProducto
);

// Obtener resumen de restricciones para un área administrativa
router.get(
  "/resumen/:id_area_infra",
  validateJwt,
  validateIdAreaFin,
  validateRequest,
  ProductoAreaController.obtenerResumenRestricciones
);

//Obtener productos disponibles segun la UNidad administrativa
router.get(
  "/productosPorArea/:id_area_fin",
  validateJwt,
  [
    param("id_area_fin").
    isInt({min:1}).
    withMessage("El ID del área debe ser un número entero positivo."),
  ],
  validateRequest,
  ProductoAreaController.obtenerProductosPorArea
);
// Crear una nueva restricción producto-área
router.post(
  "/",
  validateJwt,
  validateRestringirProducto,
  validateRequest,
  ProductoAreaController.crearRestriccion
);

// Restringir múltiples productos para una unidad administrativa
router.post(
  "/restringirMultiples",
  validateJwt,
  validateRestringirMultiplesProductos,
  validateRequest,
  ProductoAreaController.restringirMultiplesProductos
);

// Actualizar una restricción producto-área
router.put(
  "/:id_producto_area",
  validateJwt,
  validateRequest,
  ProductoAreaController.actualizarRestriccion
);

// Eliminar restricción producto-área
router.delete(
  "/:id_producto_area",
  validateJwt,
  validateRevocarRestriccion,
  validateRequest,
  ProductoAreaController.cambiarEstadoRestriccion
);

export default router;
