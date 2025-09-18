import ExcelJS from 'exceljs';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { getModels } from '../../models/modelsPromette';
import { Op } from 'sequelize';
import axios from 'axios';
import { sequelize } from '../../config/database';

// Obtener modelos
let promette: any;
getModels(process.env.DBNAMES || "")
  .then((models) => {
    promette = models;
  })
  .catch((error) => {
    console.error("Error al inicializar los modelos:", error);
  });

/**
 * Obtiene el nombre del área desde la API de infraestructura
 */
async function getAreaNameFromInfraAPI(areaId: number): Promise<string> {
  try {
    const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API as string}/area/${areaId}`;
    const response = await axios.get(infraestructuraApiUrl);
    return response.data.nombre || `Área ${areaId}`;
  } catch (error) {
    console.error(`Error al obtener nombre del área ${areaId}:`, error);
    return `Área ${areaId}`;
  }
}

/**
 * Genera un archivo Excel de costeo por artículo con datos reales
 */
export const generateCosteoArticuloExcel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('Iniciando generación de Excel de costeo por artículo...');

    // Obtener el ID del usuario del token JWT
    const userId = (req as any).user?.id_usuario;
    if (!userId) {
      res.status(401).json({
        msg: "Usuario no autenticado"
      });
      return;
    }

    // Obtener parámetros del body
    const { unidadAdministrativa } = req.body;

    // Obtener el puesto actual del usuario para determinar su área
    const usuarioPuesto = await promette.rl_usuario_puesto.findOne({
      where: { 
        ct_usuario_id: userId,
        estado: 1,
        periodo_final: null // Puesto actual
      },
      include: [
        {
          model: promette.ct_puesto,
          as: "ct_puesto",
          attributes: ["id_puesto", "nombre_puesto", "ct_area_id"]
        }
      ]
    });

    if (!usuarioPuesto) {
      res.status(404).json({
        msg: "No se encontró información del puesto del usuario"
      });
      return;
    }

    // Obtener el área del usuario
    const areaId = usuarioPuesto.ct_puesto.ct_area_id;
    const areaName = await getAreaNameFromInfraAPI(areaId);

    // Construir la condición where para filtrar por unidad administrativa si se especifica
    let whereCondition: any = {
      ct_area_id: {
        [Op.in]: sequelize.literal(`(
          SELECT id_area_fin 
          FROM rl_area_financiero 
          WHERE id_area_infra = ${areaId}
        )`)
      }
    };

    // Si se especifica una unidad administrativa, filtrar por ella
    if (unidadAdministrativa) {
      whereCondition = {
        ct_area_id: {
          [Op.in]: sequelize.literal(`(
            SELECT id_area_fin 
            FROM rl_area_financiero 
            WHERE id_area_infra = ${areaId} AND id_financiero = ${unidadAdministrativa}
          )`)
        }
      };
    }

    // Obtener todas las requisiciones de productos del área del usuario
    const requisiciones = await promette.rl_producto_requisicion.findAll({
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          include: [
            {
              model: promette.ct_partida,
              as: "ct_partida",
              attributes: ["id_partida", "clave_partida", "nombre_partida"]
            },
            {
              model: promette.ct_unidad_medida,
              as: "ct_unidad",
              attributes: ["id_unidad", "nombre_unidad", "abreviatura"]
            }
          ]
        },
        {
          model: promette.rl_area_financiero,
          as: "ct_area",
          attributes: ["id_area_fin", "id_financiero", "id_area_infra"]
        },
        {
          model: promette.dt_techo_presupuesto,
          as: "dt_techo",
          include: [
            {
              model: promette.ct_financiamiento,
              as: "ct_financiamiento",
              attributes: ["id_financiamiento", "nombre_financiamiento"]
            }
          ]
        }
      ],
      where: whereCondition,
      order: [
        ['ct_area_id', 'ASC'],
        [{ model: promette.ct_producto_consumible, as: 'ct_producto' }, 'nombre_producto', 'ASC']
      ]
    });

    console.log(`Se encontraron ${requisiciones.length} requisiciones para el área ${areaName}${unidadAdministrativa ? ` y unidad administrativa ${unidadAdministrativa}` : ''}`);

    // Agrupar datos por producto y unidad administrativa
    const productosAgrupados: { [key: string]: any } = {};

    requisiciones.forEach((req: any) => {
      const productoId = req.ct_productos_id;
      const unidadAdminId = req.ct_area.id_financiero;
      const key = `${productoId}_${unidadAdminId}`;

      if (!productosAgrupados[key]) {
        productosAgrupados[key] = {
          nombreProducto: req.ct_producto.nombre_producto,
          unidadAdministrativa: req.ct_area.id_financiero,
          unidadMedida: req.ct_producto.ct_unidad?.abreviatura || req.ct_producto.ct_unidad?.nombre_unidad || 'N/A',
          precioUnitario: parseFloat(req.ct_producto.precio) || 0,
          partida: req.ct_producto.ct_partida.clave_partida,
          nombrePartida: req.ct_producto.ct_partida.nombre_partida,
          cantidadesPorMes: Array(12).fill(0),
          totalUnidades: 0,
          totalGeneral: 0
        };
      }

      // Agregar cantidad al mes correspondiente
      const mes = parseInt(req.mes) - 1; // Convertir a índice 0-11
      if (mes >= 0 && mes < 12) {
        const cantidad = parseFloat(req.cantidad) || 0;
        productosAgrupados[key].cantidadesPorMes[mes] += cantidad;
        productosAgrupados[key].totalUnidades += cantidad;
        productosAgrupados[key].totalGeneral += parseFloat(req.total) || 0;
      }
    });

    // Convertir a array y ordenar por partida, unidad administrativa y nombre de producto
    const productosFinales = Object.values(productosAgrupados).sort((a: any, b: any) => {
      // Primero por partida
      const partidaComparison = a.partida.localeCompare(b.partida);
      if (partidaComparison !== 0) return partidaComparison;
      
      // Luego por unidad administrativa
      if (a.unidadAdministrativa !== b.unidadAdministrativa) {
        return a.unidadAdministrativa - b.unidadAdministrativa;
      }
      
      // Finalmente por nombre de producto
      return a.nombreProducto.localeCompare(b.nombreProducto);
    });

    // Crear un nuevo workbook
    const newWorkbook = new ExcelJS.Workbook();
    const newSheet = newWorkbook.addWorksheet('Costeo por Artículo');

    // Agregar encabezado del documento
    newSheet.getCell('A1').value = 'COSTEO POR ARTÍCULO';
    newSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFA11A5C' } };
    newSheet.getCell('A1').alignment = { horizontal: 'center' };
    newSheet.mergeCells('A1:O1');

    // Agregar información de la entidad
    newSheet.getCell('A3').value = 'Entidad:';
    newSheet.getCell('A3').font = { bold: true };
    newSheet.getCell('B3').value = 'Unidad de Servicios Educativos del Estado de Tlaxcala';
    newSheet.mergeCells('B3:O3');

    // Agregar área del usuario
    newSheet.getCell('A4').value = 'Área:';
    newSheet.getCell('A4').font = { bold: true };
    newSheet.getCell('B4').value = areaName;
    newSheet.mergeCells('B4:O4');

    // Agregar unidad administrativa si se especificó
    if (unidadAdministrativa) {
      newSheet.getCell('A5').value = 'Unidad Administrativa:';
      newSheet.getCell('A5').font = { bold: true };
      newSheet.getCell('B5').value = unidadAdministrativa;
      newSheet.mergeCells('B5:O5');
      
      // Agregar fecha en la siguiente fila
      const today = new Date();
      const formattedDate = `Fecha: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      newSheet.getCell('A6').value = formattedDate;
      newSheet.getCell('A6').font = { italic: true };
    } else {
      // Agregar fecha
      const today = new Date();
      const formattedDate = `Fecha: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      newSheet.getCell('A5').value = formattedDate;
      newSheet.getCell('A5').font = { italic: true };
    }

    // Agregar espacio
    newSheet.addRow([]);

    // Definir encabezados de la tabla
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const headers = [
      'Nombre del Producto',
      'Unidad Administrativa',
      'Unidad de Medida',
      'Precio Unitario',
      'Partida',
      ...meses,
      'Total Unidades',
      'Total General'
    ];
    
    const headerRow = newSheet.addRow(headers);

    // Estilo del encabezado
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFA11A5C' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar datos reales
    productosFinales.forEach((item: any) => {
      const rowData = [
        item.nombreProducto,
        item.unidadAdministrativa,
        item.unidadMedida,
        item.precioUnitario,
        item.partida,
        ...item.cantidadesPorMes,
        item.totalUnidades,
        item.totalGeneral
      ];
      
      const row = newSheet.addRow(rowData);
      
      // Aplicar formato a las columnas numéricas
      row.getCell(4).numFmt = '"$"#,##0.00'; // Precio Unitario
      
      // Formato para cantidades por mes
      for (let i = 5; i <= 16; i++) {
        row.getCell(i).numFmt = '#,##0.000';
        row.getCell(i).alignment = { horizontal: 'right' };
      }
      
      // Formato para totales
      row.getCell(17).numFmt = '#,##0.000'; // Total Unidades
      row.getCell(18).numFmt = '"$"#,##0.00'; // Total General
      
      // Aplicar bordes a todas las celdas
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });
    });

    // Calcular totales generales
    const totalUnidades = productosFinales.reduce((sum: number, item: any) => sum + item.totalUnidades, 0);
    const totalGeneral = productosFinales.reduce((sum: number, item: any) => sum + item.totalGeneral, 0);

    // Agregar fila de totales
    const totalRow = newSheet.addRow([
      'TOTAL', '', '', '', '', 
      ...Array(12).fill(''), 
      totalUnidades, 
      totalGeneral
    ]);
    totalRow.font = { bold: true };
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber === 17) {
        cell.numFmt = '#,##0.000';
      } else if (colNumber === 18) {
        cell.numFmt = '"$"#,##0.00';
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: colNumber >= 17 ? 'right' : 'center' };
    });

    // Ajustar anchos de columna
    newSheet.getColumn('A').width = 35; // Nombre del Producto
    newSheet.getColumn('B').width = 15; // Unidad Administrativa
    newSheet.getColumn('C').width = 15; // Unidad de Medida
    newSheet.getColumn('D').width = 15; // Precio Unitario
    newSheet.getColumn('E').width = 12; // Partida
    
    // Columnas de meses
    for (let i = 6; i <= 17; i++) {
      newSheet.getColumn(i).width = 12;
    }
    
    newSheet.getColumn('R').width = 15; // Total General

    // Agregar pie de página
    const lastRow = newSheet.rowCount + 2;
    newSheet.getCell(`A${lastRow}`).value = 'Documento generado automáticamente por el sistema PROMETTE';
    newSheet.getCell(`A${lastRow}`).font = { italic: true, size: 9, color: { argb: '00666666' } };
    newSheet.getCell(`A${lastRow}`).alignment = { horizontal: 'center' };
    newSheet.mergeCells(`A${lastRow}:R${lastRow}`);

    // Generar el buffer del Excel
    const buffer = await newWorkbook.xlsx.writeBuffer();

    console.log('Buffer generado, tamaño:', buffer.byteLength, 'bytes');

    // Configurar respuesta
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = unidadAdministrativa 
      ? `Costeo_Por_Articulo_${areaName.replace(/\s+/g, '_')}_UA${unidadAdministrativa}_${currentDate}.xlsx`
      : `Costeo_Por_Articulo_${areaName.replace(/\s+/g, '_')}_${currentDate}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.send(buffer);

    console.log('Excel de costeo por artículo enviado correctamente');

  } catch (error) {
    console.error('Error en generateCosteoArticuloExcel:', error);
    res.status(500).json({
      msg: "Error al generar el archivo Excel de costeo por artículo",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}; 