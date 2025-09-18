import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { getModels } from '../models/modelsPromette';
import { Op, literal } from 'sequelize';
import type { rl_usuario_puesto } from '../models/modelsPromette/rl_usuario_puesto';

export async function obtenerAreasFinUsuario(req: Request, areaSeleccionada?: number) {
  const promette = await getModels(process.env.DBNAMES || "");
  if (!promette) throw new Error('Modelos de Promette no inicializados');
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  let userId = null;
  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      userId = decoded.id;
    } catch (err) {
      return [];
    }
  }
  if (!userId) return [];

  // Buscar todos los puestos activos
  const puestosUsuario: rl_usuario_puesto[] = await promette.rl_usuario_puesto.findAll({
    where: { 
      ct_usuario_id: userId, 
      estado: 1, 
      [Op.and]: [literal('periodo_final IS NULL')]
    },
    include: [{ model: promette.ct_puesto, as: "ct_puesto", attributes: ["id_puesto", "ct_area_id"] }]
  });
  const puestosIds = puestosUsuario
    .map((p: any) => p.ct_puesto?.id_puesto)
    .filter((id: any) => typeof id === 'number');
  const areaIdsInfra = puestosUsuario
    .map((p: any) => p.ct_puesto?.ct_area_id)
    .filter((id: any) => typeof id === 'number');
  if (areaIdsInfra.length === 0) return [];

  // Si es financiero (1806): puede ver todo o filtrar por área seleccionada
  if (puestosIds.includes(1806)) {
    if (areaSeleccionada) {
      // Si selecciona un área específica, solo esa
      return [areaSeleccionada];
    } else {
      const todasAreas = await promette.rl_area_financiero.findAll({ attributes: ['id_area_fin'], raw: true });
      return todasAreas.map((a: any) => a.id_area_fin);
    }
  }

  // Si es analista (258): solo sus áreas asignadas, o una específica si la selecciona
  if (puestosIds.includes(258)) {
    const areasAnalista = await promette.rl_analista_unidad.findAll({
      where: { ct_usuario_id: userId, estado: 1 },
      attributes: ['rl_area_financiero'],
      raw: true
    });
    const areasAsignadas = areasAnalista.map((a: any) => a.rl_area_financiero);
    if (areaSeleccionada && areasAsignadas.includes(areaSeleccionada)) {
      return [areaSeleccionada];
    }
    return areasAsignadas;
  }

  // Usuario regular: solo sus áreas (todas sus áreas financieras)
  const relacionesFinancieras = await promette.rl_area_financiero.findAll({
    where: { id_area_infra: areaIdsInfra },
    raw: true
  });
  const areasUsuario = relacionesFinancieras.map((r: any) => r.id_area_fin);
  if (areaSeleccionada && areasUsuario.includes(areaSeleccionada)) {
    return [areaSeleccionada];
  }
  return areasUsuario;
} 