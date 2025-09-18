import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import * as ExcelHelper from '../../helpers/excel.helper';
import { getModels } from "../../models/modelsPromette";
import Decimal from 'decimal.js';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

let promette: any;
getModels(process.env.DBNAMES || "")
  .then((models) => { promette = models; })
  .catch((error) => { console.error("Error al inicializar los modelos:", error); });

export const generaReportePresupuestal = async (req: Request, res: Response): Promise<void> => {
  const { id_area_fin, financiamiento } = req.body;
  const id_areas = Array.isArray(id_area_fin) ? id_area_fin : [id_area_fin];
  let unidad = "EJEMPLO UNIDAD";
  // Buscar el área de infraestructura de la primera área (puedes mejorar para varias áreas)
  const areaInfra = await promette.rl_area_financiero.findOne({ where: { id_area_fin: id_areas[0] } });

  if (!areaInfra) {
    res.status(200).json({ msg: "No se encontró el área del usuario." });
    return;
  }

  const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`;
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const config = {
    headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" }
  };
  const url = `${infraestructuraApiUrl}/${areaInfra.id_area_infra}`;
  const response = await axios.get(url, config);
  unidad = response.data.nombre;

  try {
    // Filtrar por financiamiento si se proporciona
    const whereFinanciamiento = financiamiento ? { ct_financiamiento_id: financiamiento } : {};
    // Obtener todos los techos presupuestales de las áreas enviadas y financiamiento
    const presupuesto = await promette.dt_techo_presupuesto.findAll({
      where: { ct_area_id: id_areas, ...whereFinanciamiento },
      include: [
        { model: promette.ct_capitulo, as: "ct_capitulo", attributes: ["clave_capitulo", "nombre_capitulo"] },
        { model: promette.rl_area_financiero, as: "ct_area", attributes: ["id_area_fin", "id_financiero", "id_area_infra"] },
        { model: promette.ct_financiamiento, as: "ct_financiamiento", attributes: ["id_financiamiento", "nombre_financiamiento", "estado"] },
      ],
      order: [["ct_capitulo_id", "ASC"]]
    });

    if (presupuesto.length === 0) {
      res.status(200).json({ msg: "No hay presupuestos disponibles para el área del usuario y financiamiento seleccionado." });
      return;
    }

    const workbook = ExcelHelper.createWorkbook();
    const hojaPrincipal = workbook.addWorksheet(`Unidad - ${presupuesto[0].ct_area.id_financiero}`);
    hojaPrincipal.properties.showGridLines = false;
    const imagePath = path.resolve(__dirname, '../../public/USET.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
    hojaPrincipal.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 490, height: 70 } });
    // Copiar formato de encabezados y columnas de desglose-partida
    hojaPrincipal.getColumn('A').width = 14;
    hojaPrincipal.getColumn('B').width = 25;
    ['C', 'D', 'E', 'F'].forEach(col => hojaPrincipal.getColumn(col).width = 17);
    ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'].forEach(col => hojaPrincipal.getColumn(col).width = 12);
    hojaPrincipal.mergeCells('A1', 'R1');
    hojaPrincipal.getCell('A1').value = 'GOBIERNO DEL ESTADO DE TLAXCALA';
    hojaPrincipal.getCell('A1').font = { size: 11 };
    hojaPrincipal.getCell('A1').alignment = { horizontal: 'center' };
    hojaPrincipal.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.mergeCells('A2', 'R2');
    hojaPrincipal.getCell('A2').value = 'REPORTE PRESUPUESTAL';
    hojaPrincipal.getCell('A2').font = { size: 11 };
    hojaPrincipal.getCell('A2').alignment = { horizontal: 'center' };
    hojaPrincipal.getCell('A2').border = { left: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.mergeCells('A3', 'R3');
    hojaPrincipal.getCell('A3').value = 'DESGLOSE DE CONCEPTOS POR PARTIDA';
    hojaPrincipal.getCell('A3').font = { size: 11 };
    hojaPrincipal.getCell('A3').alignment = { horizontal: 'center' };
    hojaPrincipal.getCell('A3').border = { left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.getCell('A6').value = 'Entidad:';
    hojaPrincipal.getCell('A6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.getCell('A7').value = 'Unidad Administrativa:';
    hojaPrincipal.getCell('A7').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.mergeCells('B6', 'R6');
    hojaPrincipal.getCell('B6').value = 'Unidad de Servicios Educativos del Estado de Tlaxcala';
    hojaPrincipal.getCell('B6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.mergeCells('B7', 'R7');
    hojaPrincipal.getCell('B7').value = unidad;
    hojaPrincipal.getCell('B7').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.mergeCells('A9', 'A10');
    hojaPrincipal.getCell('A9').value = 'Partida';
    hojaPrincipal.getCell('A9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.getCell('A9').alignment = { horizontal: 'left', vertical: 'bottom' };
    hojaPrincipal.mergeCells('B9', 'B10');
    hojaPrincipal.getCell('B9').value = 'Fuente de Financiamiento';
    hojaPrincipal.getCell('B9').alignment = { horizontal: 'left', vertical: 'bottom' };
    hojaPrincipal.getCell('B9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.mergeCells('C9', 'E10');
    hojaPrincipal.getCell('C9').value = 'Descripción';
    hojaPrincipal.getCell('C9').alignment = { horizontal: 'left', vertical: 'bottom' };
    hojaPrincipal.getCell('C9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.mergeCells('F9', 'F10');
    hojaPrincipal.getCell('F9').value = 'Propuesta 2025';
    hojaPrincipal.getCell('F9').alignment = { horizontal: 'left', vertical: 'bottom' };
    hojaPrincipal.getCell('F9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hojaPrincipal.mergeCells('G9', 'R9');
    hojaPrincipal.getCell('G9').value = 'CALENDARIO';
    hojaPrincipal.getCell('G9').alignment = { horizontal: 'center' };
    hojaPrincipal.getCell('G9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    meses.forEach((mes, index) => {
      const col = String.fromCharCode('G'.charCodeAt(0) + index);
      hojaPrincipal.getCell(`${col}10`).value = mes;
      hojaPrincipal.getCell(`${col}10`).alignment = { horizontal: 'center' };
      hojaPrincipal.getCell(`${col}10`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let filaActual = 12;
    let capituloActual = null;
    let sumaCapitulo = new Decimal(0);
    let sumaGeneral = new Decimal(0);
    let sumMeses = Array.from({ length: 12 }, () => new Decimal(0));
    let totalGeneralMeses = Array.from({ length: 12 }, () => new Decimal(0));

    for (let i = 0; i < presupuesto.length; i++) {
      const registro = presupuesto[i];
      const esUltimo = i === presupuesto.length - 1;
      // Si cambio de capítulo, escribe el total del anterior
      if (capituloActual !== null && registro.ct_capitulo_id !== capituloActual) {
        hojaPrincipal.mergeCells(`A${filaActual}:E${filaActual}`);
        hojaPrincipal.getCell(`A${filaActual}`).value = `Total Capítulo ${presupuesto[i - 1].ct_capitulo.clave_capitulo} - ${presupuesto[i - 1].ct_capitulo.nombre_capitulo}`;
        hojaPrincipal.getCell(`F${filaActual}`).value = Number(sumaCapitulo.toFixed(3));
        hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.000';
        hojaPrincipal.getCell(`A${filaActual}`).border = hojaPrincipal.getCell(`F${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        sumMeses.forEach((suma, idx) => {
          const cell = hojaPrincipal.getCell(filaActual, 7 + idx);
          cell.value = Number(suma.toFixed(3));
          cell.numFmt = '#,##0.000';
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { horizontal: 'right', vertical: 'middle' }
        });
        sumMeses = Array.from({ length: 12 }, () => new Decimal(0));
        filaActual += 2;
        sumaCapitulo = new Decimal(0);
      }
      // Si inicia nuevo capítulo
      if (registro.ct_capitulo_id !== capituloActual) {
        hojaPrincipal.mergeCells(`A${filaActual}:R${filaActual}`);
        hojaPrincipal.getCell(`A${filaActual}`).value = `Capítulo ${registro.ct_capitulo.clave_capitulo} - ${registro.ct_capitulo.nombre_capitulo}`;
        hojaPrincipal.getCell(`A${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        filaActual++;
        capituloActual = registro.ct_capitulo_id;
      }
      // Aquí deberías agregar el llenado de filas según la lógica de desglose original...
      // ...
      // Ejemplo de llenado de fila:
      hojaPrincipal.getCell(`A${filaActual}`).value = registro.ct_capitulo.clave_capitulo;
      hojaPrincipal.getCell(`B${filaActual}`).value = registro.ct_financiamiento.nombre_financiamiento;
      hojaPrincipal.getCell(`C${filaActual}`).value = registro.ct_capitulo.nombre_capitulo;
      hojaPrincipal.getCell(`F${filaActual}`).value = Number(registro.cantidad_presupuestada || 0);
      hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.000';
      // ... puedes agregar el llenado de los meses si tienes esa información
      sumaCapitulo = sumaCapitulo.plus(registro.cantidad_presupuestada || 0);
      sumaGeneral = sumaGeneral.plus(registro.cantidad_presupuestada || 0);
      filaActual++;
      // Si es el último registro, escribe el total del capítulo y el total general
      if (esUltimo) {
        hojaPrincipal.mergeCells(`A${filaActual}:E${filaActual}`);
        hojaPrincipal.getCell(`A${filaActual}`).value = `Total Capítulo ${registro.ct_capitulo.clave_capitulo} - ${registro.ct_capitulo.nombre_capitulo}`;
        hojaPrincipal.getCell(`F${filaActual}`).value = Number(sumaCapitulo.toFixed(3));
        hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.000';
        hojaPrincipal.getCell(`A${filaActual}`).border = hojaPrincipal.getCell(`F${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        filaActual += 2;
        hojaPrincipal.mergeCells(`A${filaActual}:E${filaActual}`);
        hojaPrincipal.getCell(`A${filaActual}`).value = 'TOTAL GENERAL';
        hojaPrincipal.getCell(`F${filaActual}`).value = Number(sumaGeneral.toFixed(3));
        hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.000';
        hojaPrincipal.getCell(`A${filaActual}`).border = hojaPrincipal.getCell(`F${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
      }
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const currentDate = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Reporte_Presupuestal_${currentDate}.xlsx`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.send(buffer);
  } catch (error) {
    console.error(error);
    const mensaje = (error as Error).message || "Error al exportar el reporte presupuestal a Excel";
    res.status(500).json({ msg: mensaje });
  }
}; 