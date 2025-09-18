import ExcelJS from 'exceljs';
import { Request, Response } from 'express';
import * as ExcelHelper from '../../helpers/excel.helper';
import { getModels } from "../../models/modelsPromette";
import * as fs from 'fs';
import * as path from 'path';
import { Op } from 'sequelize';
import Decimal from 'decimal.js';

let promette: any;
getModels(process.env.DBNAMES || "")
  .then((models) => {
    promette = models;
  })
  .catch((error) => {
    console.error("Error al inicializar los modelos:", error);
  });

export const generaJustificacionExcel = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { ct_area_id, ct_puesto_id, ct_financiamiento_id } = req.body;
  if (!ct_area_id || !ct_puesto_id || !ct_financiamiento_id) {
    res.status(200).json({ msg: "Parámetros inválidos" });
    return;
  }

  // Determinar las áreas a filtrar según el puesto y selección
  let id_areas: number[] = [];
  if (ct_area_id && (!Array.isArray(ct_area_id) || ct_area_id.length === 1)) {
    // Si el select de área está presente y es un solo valor, solo esa área
    id_areas = Array.isArray(ct_area_id) ? [ct_area_id[0]] : [ct_area_id];
  } else if (ct_puesto_id === 1806) {
    // Financiero: todas las áreas
    const todasAreas = await promette.rl_area_financiero.findAll({ attributes: ['id_area_fin'], raw: true });
    id_areas = todasAreas.map((a: any) => a.id_area_fin);
  } else if (ct_puesto_id === 258) {
    // Analista: solo áreas de rl_analista_unidad
    const userId = req.body.userId || undefined;
    const areasAnalista = await promette.rl_analista_unidad.findAll({
      where: { ct_usuario_id: userId, estado: 1 },
      attributes: ['rl_area_financiero'],
      raw: true
    });
    id_areas = areasAnalista.map((a: any) => a.rl_area_financiero);
  } else {
    // Otro puesto: solo el área de su puesto
    id_areas = Array.isArray(ct_area_id) ? ct_area_id : [ct_area_id];
  }

  console.log("Generando desglose de partida Excel con el área:", ct_area_id);

  try {
    const whereConditions: any = {
      ct_area_id: id_areas,
    };
    if (ct_financiamiento_id) {
      whereConditions['$dt_techo.ct_financiamiento_id$'] = ct_financiamiento_id;
    }

    const justificaciones = await promette.rl_justificacion.findAll({
      attributes: ["id_justificacion", "ct_partida_id", "ct_area_id", "dt_techo_id", "justificacion"],
      include: [
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          attributes: ["id_area_fin", "id_financiero"],
        },
        {
          model: promette.dt_techo_presupuesto,
          as: "dt_techo",
          attributes: ["cantidad_presupuestada", "ct_financiamiento_id"],
          include: [
            {
              model: promette.ct_financiamiento,
              as: "ct_financiamiento",
              attributes: ["id_financiamiento", "nombre_financiamiento"],
            }
          ]
        },
        {
          model: promette.ct_partida,
          as: "ct_partida",
          attributes: ["id_partida", "clave_partida", "nombre_partida", "estado"],
        },
      ],
      where: whereConditions,
      order: [[{ model: promette.rl_area_financiero, as: "ct_area" }, "id_financiero", "ASC"]],
    });
    console.log(`Justificaciones encontradas: ${justificaciones.length}`);
    if (justificaciones.length === 0) {
      res.status(200).json({ msg: "No hay justificaciones para los filtros seleccionados" });
      return;
    }

    const justificacionesAgrupadas: { [key: string]: any[] } = {};
    justificaciones.forEach((just: any) => {
      const clavePartida = just.ct_partida.clave_partida;
      const financiamiento = just.dt_techo.ct_financiamiento.nombre_financiamiento;
      const clave = `${clavePartida} - ${financiamiento}`;
      if (!justificacionesAgrupadas[clave]) {
        justificacionesAgrupadas[clave] = [];
      }
      justificacionesAgrupadas[clave].push(just);
    });

    const workbook = new ExcelJS.Workbook();

    for (const clave in justificacionesAgrupadas) {
      const justificacionesDeLaHoja = justificacionesAgrupadas[clave];
      const primeraJustificacion = justificacionesDeLaHoja[0];
      const partidaId = primeraJustificacion.ct_partida.id_partida;
      const techoIds = justificacionesDeLaHoja.map(j => j.dt_techo_id);
      
      const productos = await promette.rl_producto_requisicion.findAll({
          where: { dt_techo_id: { [Op.in]: techoIds } },
          include: [{
              model: promette.ct_producto_consumible,
              as: 'ct_producto',
              where: { ct_partida_id: partidaId },
              attributes: []
          }],
          raw: true
      });

      let montoTotal = productos.reduce((sum: Decimal, prod: any) => sum.plus(new Decimal(prod.total || 0)), new Decimal(0));
      
      let sheetName = clave.replace(/[\*:\/\\?\']/g, '_').substring(0, 31);
      
      let sheet = workbook.addWorksheet(sheetName);
      sheet.properties.showGridLines = false;
      const imagePath = path.resolve(__dirname, '../../public/USET.png');
      const imageBuffer = fs.readFileSync(imagePath);
      const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
      sheet.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 330, height: 50 } });

      sheet.mergeCells('A1:F1');
      sheet.getCell('A1').value = 'GOBIERNO DEL ESTADO DE TLAXCALA';
      sheet.getCell('A1').alignment = { horizontal: 'center' };
      sheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      sheet.mergeCells('A2:F2');
      sheet.getCell('A2').value = 'UNIDAD DE SERVICIOS EDUCATIVOS DE TLAXCALA';
      sheet.getCell('A2').alignment = { horizontal: 'center' };
      sheet.getCell('A2').border = { left: { style: 'thin' }, right: { style: 'thin' } }
      sheet.mergeCells('A3:F3');
      sheet.getCell('A3').value = `JUSTIFICACIÓN DE PARTIDAS`;
      sheet.getCell('A3').alignment = { horizontal: 'center' };
      sheet.getCell('A3').border = { bottom: { style: 'thin' },left: { style: 'thin' }, right: { style: 'thin' }}

      let fila = 5;
      
      const headers = ['Partida', 'Descripción', 'Unidad', 'Justificación', 'Monto', 'Financiamiento'];
      sheet.getRow(fila).values = headers;
      sheet.getRow(fila).font = { bold: true };
      fila++;

      const justificacionConcatenada = justificacionesDeLaHoja.map(j => j.justificacion).filter(Boolean).join('\n');
      
      const dataRow = [
        primeraJustificacion.ct_partida.clave_partida,
        primeraJustificacion.ct_partida.nombre_partida,
        primeraJustificacion.ct_area.id_financiero,
        justificacionConcatenada,
        Number(montoTotal.toFixed(2)),
        primeraJustificacion.dt_techo.ct_financiamiento.nombre_financiamiento
      ];
      sheet.addRow(dataRow);
      sheet.getCell(`E${fila}`).numFmt = '"$"#,##0.00';
      sheet.getRow(fila).alignment = { vertical: 'top', wrapText: true };
      
      sheet.getColumn('A').width = 15; // Partida
      sheet.getColumn('B').width = 40; // Descripción
      sheet.getColumn('C').width = 20; // Unidad
      sheet.getColumn('D').width = 50; // Justificación
      sheet.getColumn('E').width = 18; // Monto
      sheet.getColumn('F').width = 35; // Financiamiento
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const currentDate = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Disposition', `attachment; filename=Justificaciones_${currentDate}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error(error);
    const mensaje = (error as Error).message || "Error al exportar el anteproyecto a Excel";
    res.status(500).json({
      msg: mensaje,
    });
  }
};