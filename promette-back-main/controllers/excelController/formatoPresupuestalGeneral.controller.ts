import ExcelJS from 'exceljs';
import { Request, Response } from 'express';
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

export const generarFormatoPresupuestalGeneralExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ct_financiamiento_id, nombre_usuario } = req.body;
    
    console.log("ct_financiamiento_id:", ct_financiamiento_id);
    console.log("nombre_usuario:", nombre_usuario);

    if (!ct_financiamiento_id) {
      res.status(400).json({ msg: "No se proporcionó el financiamiento" });
      return;
    }

    // Obtener nombre del financiamiento
    const financiamiento = await promette.ct_financiamiento.findOne({
      where: { id_financiamiento: ct_financiamiento_id }
    });

    if (!financiamiento) {
      res.status(400).json({ msg: "Financiamiento no encontrado" });
      return;
    }

    // Obtener todos los techos presupuestales para el financiamiento específico
    const techos = await promette.dt_techo_presupuesto.findAll({
      where: { ct_financiamiento_id },
      include: [
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
        },
        {
          model: promette.ct_capitulo,
          as: "ct_capitulo",
          attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
        },
        {
          model: promette.ct_financiamiento,
          as: "ct_financiamiento",
          attributes: ["id_financiamiento", "nombre_financiamiento"],
        },
      ],
      order: [["ct_capitulo_id", "ASC"]]
    });

    if (techos.length === 0) {
      res.status(200).json({ msg: "No hay techos presupuestales disponibles para este financiamiento." });
      return;
    }

    // Crear Excel
    const workbook = ExcelHelper.createWorkbook();
    const worksheet = workbook.addWorksheet('Formato Presupuestal General');
    
    worksheet.pageSetup.margins = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };

    // Agregar logo USET
    const imagePath = path.resolve(__dirname, '../../public/USET.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
    worksheet.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 490, height: 70 } });

    // Configurar columnas
    worksheet.getColumn('A').width = 14;
    worksheet.getColumn('B').width = 25;
    ['C', 'D', 'E', 'F'].forEach(col => worksheet.getColumn(col).width = 17);
    ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'].forEach(col => worksheet.getColumn(col).width = 12);

    // Títulos
    worksheet.mergeCells('A1', 'R1');
    worksheet.getCell('A1').value = 'GOBIERNO DEL ESTADO DE TLAXCALA';
    worksheet.getCell('A1').font = { size: 11 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.mergeCells('A2', 'R2');
    worksheet.getCell('A2').value = 'ANTEPROYECTO DE PRESUPUESTO DE EGRESOS 2026';
    worksheet.getCell('A2').font = { size: 11 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    worksheet.getCell('A2').border = { left: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.mergeCells('A3', 'R3');
    worksheet.getCell('A3').value = `FORMATO PRESUPUESTAL GENERAL - ${financiamiento.nombre_financiamiento.toUpperCase()}`;
    worksheet.getCell('A3').font = { size: 11 };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };
    worksheet.getCell('A3').border = { left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Información de entidad
    worksheet.getCell('A6').value = 'Entidad:';
    worksheet.getCell('A6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.mergeCells('B6', 'R6');
    worksheet.getCell('B6').value = 'Unidad de Servicios Educativos del Estado de Tlaxcala';
    worksheet.getCell('B6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Headers de la tabla
    worksheet.mergeCells('A9', 'A10');
    worksheet.getCell('A9').value = 'Capítulo';
    worksheet.getCell('A9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    worksheet.getCell('A9').alignment = { horizontal: 'left', vertical: 'bottom' };

    worksheet.mergeCells('B9', 'E10');
    worksheet.getCell('B9').value = 'Descripción';
    worksheet.getCell('B9').alignment = { horizontal: 'left', vertical: 'bottom' };
    worksheet.getCell('B9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.mergeCells('F9', 'F10');
    worksheet.getCell('F9').value = 'Propuesta 2026';
    worksheet.getCell('F9').alignment = { horizontal: 'left', vertical: 'bottom' };
    worksheet.getCell('F9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    worksheet.mergeCells('G9', 'R9');
    worksheet.getCell('G9').value = 'CALENDARIO';
    worksheet.getCell('G9').alignment = { horizontal: 'center' };
    worksheet.getCell('G9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Headers de meses
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    meses.forEach((mes, index) => {
      const col = String.fromCharCode('G'.charCodeAt(0) + index);
      worksheet.getCell(`${col}10`).value = mes;
      worksheet.getCell(`${col}10`).alignment = { horizontal: 'center' };
      worksheet.getCell(`${col}10`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Agrupar techos por capítulo
    const techosPorCapitulo: Record<string, any[]> = {};
    techos.forEach((techo: any) => {
      const capituloKey = `${techo.ct_capitulo.clave_capitulo}-${techo.ct_capitulo.nombre_capitulo}`;
      if (!techosPorCapitulo[capituloKey]) {
        techosPorCapitulo[capituloKey] = [];
      }
      techosPorCapitulo[capituloKey].push(techo);
    });

    let filaActual = 12;
    let sumaGeneral = new Decimal(0);
    let totalGeneralMeses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));

    // Imprimir datos por capítulo
    for (const [capituloKey, techosCapitulo] of Object.entries(techosPorCapitulo)) {
      const [claveCapitulo, nombreCapitulo] = capituloKey.split('-');
      
      // Fila del capítulo
      worksheet.mergeCells(`A${filaActual}:R${filaActual}`);
      worksheet.getCell(`A${filaActual}`).value = `Capítulo ${claveCapitulo} - ${nombreCapitulo}`;
      worksheet.getCell(`A${filaActual}`).font = { bold: true };
      worksheet.getCell(`A${filaActual}`).border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      filaActual++;

      let sumaCapitulo = new Decimal(0);
      let totalCapituloMeses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));

      // Imprimir techos del capítulo
      for (const techo of techosCapitulo) {
        const fila = worksheet.getRow(filaActual);
        worksheet.getCell(`A${filaActual}`).value = techo.ct_capitulo.clave_capitulo;
        worksheet.getCell(`B${filaActual}`).value = techo.ct_capitulo.nombre_capitulo;
        worksheet.mergeCells(`B${filaActual}:E${filaActual}`);
        worksheet.getCell(`F${filaActual}`).numFmt = '#,##0.00';
        worksheet.getCell(`F${filaActual}`).alignment = { horizontal: 'right', vertical: 'middle' };
        worksheet.getCell(`F${filaActual}`).value = Number(techo.cantidad_presupuestada);

        // Distribuir por meses (asumiendo distribución uniforme)
        const cantidadPorMes = new Decimal(techo.cantidad_presupuestada).dividedBy(12);
        for (let i = 0; i < 12; i++) {
          const cell = fila.getCell(7 + i);
          cell.value = Number(cantidadPorMes.toFixed(2));
          cell.numFmt = '#,##0.00';
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          totalCapituloMeses[i] = totalCapituloMeses[i].plus(cantidadPorMes);
        }

        fila.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', wrapText: true };
        });

        sumaCapitulo = sumaCapitulo.plus(techo.cantidad_presupuestada);
        filaActual++;
      }

      // Total del capítulo
      worksheet.mergeCells(`A${filaActual}:E${filaActual}`);
      worksheet.getCell(`A${filaActual}`).value = `Total Capítulo ${claveCapitulo}`;
      worksheet.getCell(`A${filaActual}`).font = { bold: true };
      worksheet.getCell(`F${filaActual}`).value = Number(sumaCapitulo.toFixed(2));
      worksheet.getCell(`F${filaActual}`).numFmt = '#,##0.00';
      worksheet.getCell(`A${filaActual}`).border = worksheet.getCell(`F${filaActual}`).border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };

      for (let i = 0; i < 12; i++) {
        const cell = worksheet.getCell(filaActual, 7 + i);
        cell.value = Number(totalCapituloMeses[i].toFixed(2));
        cell.numFmt = '#,##0.00';
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      }

      filaActual += 2;
      sumaGeneral = sumaGeneral.plus(sumaCapitulo);
      for (let i = 0; i < 12; i++) {
        totalGeneralMeses[i] = totalGeneralMeses[i].plus(totalCapituloMeses[i]);
      }
    }

    // Total general
    worksheet.mergeCells(`A${filaActual}:E${filaActual}`);
    worksheet.getCell(`A${filaActual}`).value = 'Total General';
    worksheet.getCell(`A${filaActual}`).font = { bold: true };
    worksheet.getCell(`F${filaActual}`).value = Number(sumaGeneral.toFixed(2));
    worksheet.getCell(`F${filaActual}`).numFmt = '#,##0.00';
    worksheet.getCell(`F${filaActual}`).border = worksheet.getCell(`A${filaActual}`).border = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };

    totalGeneralMeses.forEach((suma, idx) => {
      const cell = worksheet.getCell(filaActual, 7 + idx);
      cell.value = Number(suma.toFixed(2));
      cell.numFmt = '#,##0.00';
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    });

    // Guardar y enviar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const currentDate = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Formato_Presupuestal_General_${financiamiento.nombre_financiamiento}_${currentDate}.xlsx`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.send(buffer);

  } catch (error) {
    console.error('Error en generarFormatoPresupuestalGeneralExcel:', error);
    res.status(500).json({
      msg: "Error al exportar el formato presupuestal general a Excel",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}; 