// Importaciones necesarias
import { Request, Response } from 'express';
import * as ExcelHelper from '../../helpers/excel.helper';
import { promette } from '../../models/database.models';
import axios from 'axios';

interface AggregatedCeilingData {
  claveUnidadAdministrativa: string;
  areaName: string;
  financiamientoMAC: number;
  financiamientoFONE: number;
  financiamientoESTATAL: number;
}

interface AggregatedCeilingDataByChapter {
  claveUnidadAdministrativa: string;
  areaName: string;
  capituloName: string;
  financiamientoMAC: number;
  financiamientoFONE: number;
  financiamientoESTATAL: number;
}

interface AggregatedCeilingDataByChapterOnly {
  claveUnidadAdministrativa: string;
  areaName: string;
  capituloName: string;
  totalPresupuestado: number;
}


async function getAreaNameFromInfraAPI(areaId: number): Promise<string> {
  try {
    const url = `${process.env.INFRAESTRUCTURA_API}/area`;
    if (!process.env.INFRAESTRUCTURA_API) {
      console.error("Error: INFRAESTRUCTURA_API environment variable is not set");
      return `Área ${areaId}`;
    }

    const response = await axios.get(url);
    const data = response.data;

    const areas = Array.isArray(data) ? data : data.areas;
    const area = areas?.find((a: any) => a.id_area === areaId);
    return area?.nombre || `Área ${areaId}`;
  } catch (err: any) {
    console.error(`Error al obtener área ${areaId} de infraestructura:`, err.message);
    return `Área ${areaId}`;
  }
}

export const generateBudgetCeilingExcel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('Iniciando exportación de techos presupuestales a Excel...');

    const ceilings = await promette.dt_techo_presupuesto.findAll({
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
      order: [['id_techo', 'ASC']]
    });

    if (ceilings.length === 0) {
      res.status(404).json({
        msg: "No se encontraron techos presupuestales para exportar",
      });
      return;
    }

    const uniqueAreaIds = [...new Set(ceilings.map((ceiling: any) =>
      ceiling.ct_area?.id_area_infra
    ))].filter((id): id is number => typeof id === 'number');

    const areaNamesMap: Record<number, string> = {};
    for (const areaId of uniqueAreaIds) {
      const areaName = await getAreaNameFromInfraAPI(areaId);
      areaNamesMap[areaId] = areaName;
    }

    // Agrupar y consolidar datos
    const aggregationMap: Record<string, AggregatedCeilingData> = {};

    ceilings.forEach((ceiling: any) => {
      const plain = ceiling.get({ plain: true });
      const clave = plain.ct_area?.id_financiero?.toString() || 'N/A';
      const areaInfraId = plain.ct_area?.id_area_infra;
      const areaName = areaInfraId ? areaNamesMap[areaInfraId] || `Área ${areaInfraId}` : 'No asignada';
      const key = `${clave}-${areaName}`;

      const financiamiento = plain.ct_financiamiento?.nombre_financiamiento?.toUpperCase() || '';
      const cantidad = Number(plain.cantidad_presupuestada) || 0;

      if (!aggregationMap[key]) {
        aggregationMap[key] = {
          claveUnidadAdministrativa: clave,
          areaName,
          financiamientoMAC: 0,
          financiamientoFONE: 0,
          financiamientoESTATAL: 0,
        };
      }

      if (financiamiento.includes('MAC')) {
        aggregationMap[key].financiamientoMAC += cantidad;
      } else if (financiamiento.includes('FONE')) {
        aggregationMap[key].financiamientoFONE += cantidad;
      } else {
        aggregationMap[key].financiamientoESTATAL += cantidad;
      }
    });

    const data: AggregatedCeilingData[] = Object.values(aggregationMap);

    // Crear Excel
    const workbook = ExcelHelper.createWorkbook();
    
    // Primera hoja: Por financiamiento
    const worksheet = workbook.addWorksheet('Por Financiamiento');
    worksheet.pageSetup.margins = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };

    worksheet.getCell('A1').value = 'Reporte de Techos Presupuestales - Por Financiamiento';
    worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FFA11A5C' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.mergeCells('A1:E1');

    const today = new Date();
    worksheet.getCell('E2').value = `Fecha: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    worksheet.getCell('E2').alignment = { horizontal: 'right' };

    worksheet.addRow([]);

    const headers = ['Clave Unidad Administrativa', 'Área', 'MAC', 'FONE', 'Recursos Estatales'];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA11A5C' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    data.forEach(item => {
      worksheet.addRow([
        item.claveUnidadAdministrativa,
        item.areaName,
        item.financiamientoMAC,
        item.financiamientoFONE,
        item.financiamientoESTATAL,
      ]);
    });

    worksheet.getColumn(1).alignment = { horizontal: 'center' };
    worksheet.getColumn(2).alignment = { horizontal: 'left', wrapText: true };
    [3, 4, 5].forEach(colIndex => {
      worksheet.getColumn(colIndex).alignment = { horizontal: 'right' };
      worksheet.getColumn(colIndex).numFmt = '"$"#,##0.00';
    });

    // Formato de zebra para primera hoja
    const startDataRow = 5;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= startDataRow && rowNumber % 2 === 0) {
        row.eachCell({ includeEmpty: true }, cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEDEDED' }
          };
        });
      }
    });

    worksheet.columns.forEach(column => {
      if (column && column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = Math.min(maxLength + 2, 30);
      }
    });

    // Segunda hoja: Por capítulo
    const worksheetByChapter = workbook.addWorksheet('Por Capítulo');
    worksheetByChapter.pageSetup.margins = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };

    worksheetByChapter.getCell('A1').value = 'Reporte de Techos Presupuestales - Por Capítulo';
    worksheetByChapter.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FFA11A5C' } };
    worksheetByChapter.getCell('A1').alignment = { horizontal: 'center' };
    worksheetByChapter.mergeCells('A1:F1');

    worksheetByChapter.getCell('F2').value = `Fecha: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    worksheetByChapter.getCell('F2').alignment = { horizontal: 'right' };

    worksheetByChapter.addRow([]);

    const headersByChapter = ['Clave Unidad Administrativa', 'Área', 'Capítulo', 'MAC', 'FONE', 'Recursos Estatales'];
    const headerRowByChapter = worksheetByChapter.addRow(headersByChapter);
    headerRowByChapter.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA11A5C' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Agrupar datos por capítulo
    const aggregationMapByChapter: Record<string, AggregatedCeilingDataByChapter> = {};

    ceilings.forEach((ceiling: any) => {
      const plain = ceiling.get({ plain: true });
      const clave = plain.ct_area?.id_financiero?.toString() || 'N/A';
      const areaInfraId = plain.ct_area?.id_area_infra;
      const areaName = areaInfraId ? areaNamesMap[areaInfraId] || `Área ${areaInfraId}` : 'No asignada';
      const capituloName = plain.ct_capitulo?.nombre_capitulo || 'Sin capítulo';
      const key = `${clave}-${areaName}-${capituloName}`;

      const financiamiento = plain.ct_financiamiento?.nombre_financiamiento?.toUpperCase() || '';
      const cantidad = Number(plain.cantidad_presupuestada) || 0;

      if (!aggregationMapByChapter[key]) {
        aggregationMapByChapter[key] = {
          claveUnidadAdministrativa: clave,
          areaName,
          capituloName,
          financiamientoMAC: 0,
          financiamientoFONE: 0,
          financiamientoESTATAL: 0,
        };
      }

      if (financiamiento.includes('MAC')) {
        aggregationMapByChapter[key].financiamientoMAC += cantidad;
      } else if (financiamiento.includes('FONE')) {
        aggregationMapByChapter[key].financiamientoFONE += cantidad;
      } else {
        aggregationMapByChapter[key].financiamientoESTATAL += cantidad;
      }
    });

    const dataByChapter: AggregatedCeilingDataByChapter[] = Object.values(aggregationMapByChapter);

    dataByChapter.forEach(item => {
      worksheetByChapter.addRow([
        item.claveUnidadAdministrativa,
        item.areaName,
        item.capituloName,
        item.financiamientoMAC,
        item.financiamientoFONE,
        item.financiamientoESTATAL,
      ]);
    });

    worksheetByChapter.getColumn(1).alignment = { horizontal: 'center' };
    worksheetByChapter.getColumn(2).alignment = { horizontal: 'left', wrapText: true };
    worksheetByChapter.getColumn(3).alignment = { horizontal: 'left', wrapText: true };
    [4, 5, 6].forEach(colIndex => {
      worksheetByChapter.getColumn(colIndex).alignment = { horizontal: 'right' };
      worksheetByChapter.getColumn(colIndex).numFmt = '"$"#,##0.00';
    });

    // Formato de zebra para segunda hoja
    worksheetByChapter.eachRow((row, rowNumber) => {
      if (rowNumber >= 5 && rowNumber % 2 === 0) {
        row.eachCell({ includeEmpty: true }, cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEDEDED' }
          };
        });
      }
    });

    worksheetByChapter.columns.forEach(column => {
      if (column && column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = Math.min(maxLength + 2, 30);
      }
    });

    const lastRow = worksheet.rowCount + 1;
    worksheet.getCell(`A${lastRow}`).value = 'Documento generado automáticamente por el sistema PROMETTE';
    worksheet.getCell(`A${lastRow}`).font = { italic: true, size: 9, color: { argb: '00666666' } };
    worksheet.getCell(`A${lastRow}`).alignment = { horizontal: 'center' };
    worksheet.mergeCells(`A${lastRow}:E${lastRow}`);

    const lastRowByChapter = worksheetByChapter.rowCount + 1;
    worksheetByChapter.getCell(`A${lastRowByChapter}`).value = 'Documento generado automáticamente por el sistema PROMETTE';
    worksheetByChapter.getCell(`A${lastRowByChapter}`).font = { italic: true, size: 9, color: { argb: '00666666' } };
    worksheetByChapter.getCell(`A${lastRowByChapter}`).alignment = { horizontal: 'center' };
    worksheetByChapter.mergeCells(`A${lastRowByChapter}:F${lastRowByChapter}`);

    // Tercera hoja: Solo por capítulo (sin financiamientos)
    const worksheetByChapterOnly = workbook.addWorksheet('Solo por Capítulo');
    worksheetByChapterOnly.pageSetup.margins = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };

    worksheetByChapterOnly.getCell('A1').value = 'Reporte de Techos Presupuestales - Solo por Capítulo';
    worksheetByChapterOnly.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FFA11A5C' } };
    worksheetByChapterOnly.getCell('A1').alignment = { horizontal: 'center' };
    worksheetByChapterOnly.mergeCells('A1:D1');

    worksheetByChapterOnly.getCell('D2').value = `Fecha: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    worksheetByChapterOnly.getCell('D2').alignment = { horizontal: 'right' };

    worksheetByChapterOnly.addRow([]);

    const headersByChapterOnly = ['Clave Unidad Administrativa', 'Área', 'Capítulo', 'Total Presupuestado'];
    const headerRowByChapterOnly = worksheetByChapterOnly.addRow(headersByChapterOnly);
    headerRowByChapterOnly.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA11A5C' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Agrupar datos solo por capítulo (sumando todos los financiamientos)
    const aggregationMapByChapterOnly: Record<string, AggregatedCeilingDataByChapterOnly> = {};

    ceilings.forEach((ceiling: any) => {
      const plain = ceiling.get({ plain: true });
      const clave = plain.ct_area?.id_financiero?.toString() || 'N/A';
      const areaInfraId = plain.ct_area?.id_area_infra;
      const areaName = areaInfraId ? areaNamesMap[areaInfraId] || `Área ${areaInfraId}` : 'No asignada';
      const capituloName = plain.ct_capitulo?.nombre_capitulo || 'Sin capítulo';
      const key = `${clave}-${areaName}-${capituloName}`;

      const cantidad = Number(plain.cantidad_presupuestada) || 0;

      if (!aggregationMapByChapterOnly[key]) {
        aggregationMapByChapterOnly[key] = {
          claveUnidadAdministrativa: clave,
          areaName,
          capituloName,
          totalPresupuestado: 0,
        };
      }

      // Sumar todos los financiamientos para este capítulo
      aggregationMapByChapterOnly[key].totalPresupuestado += cantidad;
    });

    const dataByChapterOnly: AggregatedCeilingDataByChapterOnly[] = Object.values(aggregationMapByChapterOnly);

    dataByChapterOnly.forEach(item => {
      worksheetByChapterOnly.addRow([
        item.claveUnidadAdministrativa,
        item.areaName,
        item.capituloName,
        item.totalPresupuestado,
      ]);
    });

    worksheetByChapterOnly.getColumn(1).alignment = { horizontal: 'center' };
    worksheetByChapterOnly.getColumn(2).alignment = { horizontal: 'left', wrapText: true };
    worksheetByChapterOnly.getColumn(3).alignment = { horizontal: 'left', wrapText: true };
    worksheetByChapterOnly.getColumn(4).alignment = { horizontal: 'right' };
    worksheetByChapterOnly.getColumn(4).numFmt = '"$"#,##0.00';

    // Formato de zebra para tercera hoja
    worksheetByChapterOnly.eachRow((row, rowNumber) => {
      if (rowNumber >= 5 && rowNumber % 2 === 0) {
        row.eachCell({ includeEmpty: true }, cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEDEDED' }
          };
        });
      }
    });

    worksheetByChapterOnly.columns.forEach(column => {
      if (column && column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = Math.min(maxLength + 2, 30);
      }
    });

    const lastRowByChapterOnly = worksheetByChapterOnly.rowCount + 1;
    worksheetByChapterOnly.getCell(`A${lastRowByChapterOnly}`).value = 'Documento generado automáticamente por el sistema PROMETTE';
    worksheetByChapterOnly.getCell(`A${lastRowByChapterOnly}`).font = { italic: true, size: 9, color: { argb: '00666666' } };
    worksheetByChapterOnly.getCell(`A${lastRowByChapterOnly}`).alignment = { horizontal: 'center' };
    worksheetByChapterOnly.mergeCells(`A${lastRowByChapterOnly}:D${lastRowByChapterOnly}`);

    const buffer = await workbook.xlsx.writeBuffer();
    const currentDate = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Techos_Presupuestales_${currentDate}.xlsx`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.send(buffer);
    console.log('Excel enviado correctamente');
  } catch (error) {
    console.error('Error en generateBudgetCeilingExcel:', error);
    res.status(500).json({
      msg: "Error al exportar los techos presupuestales a Excel",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};



// ------- Codigo comentado para referencia ------
// import { Request, Response } from 'express';
// import * as ExcelHelper from '../../helpers/excel.helper';
// import { initModels } from '../../models/modelsPromette/init-models';
// import { sequelize } from "../../config/database";
// import axios from 'axios';

// // Interface para los datos que irán al Excel (misma estructura que la tabla)
// interface ExcelCeilingData {
//   claveUnidadAdministrativa: string; // Campo indice de ct_area
//   areaName: string;
//   capituloId: number;
//   capituloName: string;
//   financiamientoName: string;
//   presupuestado: number;
// }

// // Obtener modelos
// 

// /**
//  * Función para obtener el nombre del área desde la API de infraestructura
//  */
// async function getAreaNameFromInfraAPI(areaId: number): Promise<string> {
//   try {
//     const url = `${process.env.INFRAESTRUCTURA_API}/area`;
    
//     if (!process.env.INFRAESTRUCTURA_API) {
//       console.error("Error: INFRAESTRUCTURA_API environment variable is not set");
//       return `Área ${areaId}`;
//     }
    
//     console.log(`Consultando área ${areaId} desde: ${url}`);
//     const response = await axios.get(url);
    
//     // Buscar el área específica por ID
//     if (Array.isArray(response.data)) {
//       const area = response.data.find((a: any) => a.id_area === areaId);
//       if (area && area.nombre) {
//         return area.nombre;
//       }
//     } else if (Array.isArray(response.data.areas)) {
//       const area = response.data.areas.find((a: any) => a.id_area === areaId);
//       if (area && area.nombre) {
//         return area.nombre;
//       }
//     }
    
//     console.log(`Área ${areaId} no encontrada en la API de infraestructura`);
//     return `Área ${areaId}`;
//   } catch (err: any) {
//     console.error(`Error al obtener área ${areaId} de infraestructura:`, err.message);
//     return `Área ${areaId}`;
//   }
// }

// /**
//  * Genera un archivo Excel de techos presupuestales con la misma información de la tabla
//  */
// export const generateBudgetCeilingExcel = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     console.log('Iniciando exportación de techos presupuestales a Excel...');

//     // Obtener todos los techos presupuestales con todas las relaciones necesarias
//     const ceilings = await promette.dt_techo_presupuesto.findAll({
//       include: [
//         {
//           model: promette.rl_area_financiero,
//           as: "ct_area",
//           attributes: ["id_area_fin", "id_financiero", "id_area_infra"],
//         },
//         {
//           model: promette.ct_capitulo,
//           as: "ct_capitulo",
//           attributes: ["id_capitulo", "clave_capitulo", "nombre_capitulo"],
//         },
//         {
//           model: promette.ct_financiamiento,
//           as: "ct_financiamiento",
//           attributes: ["id_financiamiento", "nombre_financiamiento"],
//         },
//       ],
//       order: [['id_techo', 'ASC']]
//     });

//     //console.log(ceilings)

//     console.log(`Se encontraron ${ceilings.length} techos presupuestales`);

//     if (ceilings.length === 0) {
//       res.status(404).json({
//         msg: "No se encontraron techos presupuestales para exportar",
//       });
//       return;
//     }

//     // Obtener nombres de áreas únicas para optimizar las consultas
//     const uniqueAreaIds = [...new Set(ceilings.map((ceiling: any) => 
//       ceiling.ct_area?.id_area_infra
//     ))].filter((id): id is number => typeof id === 'number');

//     console.log('Consultando nombres de áreas desde API de infraestructura...');
    
//     // Crear un mapa de nombres de áreas
//     const areaNamesMap: Record<number, string> = {};
    
//     // Consultar cada área única
//     for (const areaId of uniqueAreaIds) {
//       const areaName = await getAreaNameFromInfraAPI(areaId);
//       areaNamesMap[areaId] = areaName;
//     }

//     // Preparar los datos para el Excel (misma estructura que la tabla)
//     const data: ExcelCeilingData[] = ceilings.map((ceiling: any) => {
//       const plainCeiling = ceiling.get({ plain: true });
      
//       // Obtener la clave de unidad administrativa (usando id_financiero de rl_area_financiero)
//       const claveUnidadAdministrativa = plainCeiling.ct_area?.id_financiero?.toString() || 'N/A';
      
//       // Obtener el nombre del área desde la API de infraestructura usando id_area_infra
//       const areaInfraId = plainCeiling.ct_area?.id_area_infra;
//       const areaName = areaInfraId ? areaNamesMap[areaInfraId] || `Área ${areaInfraId}` : 'No asignada';

//       return {
//         claveUnidadAdministrativa: claveUnidadAdministrativa,
//         areaName: areaName,
//         //capituloId: plainCeiling.ct_capitulo?.id_capitulo || 0,
//         //capituloName: plainCeiling.ct_capitulo?.nombre_capitulo || 'No asignado',
//         financiamientoName: plainCeiling.ct_financiamiento?.nombre_financiamiento || 'No asignado',
//         presupuestado: Number(plainCeiling.cantidad_presupuestada) || 0,
//       };
//     });

//     console.log('Datos preparados para Excel:', data.length, 'registros');


//     console.log("DATOS PARA EL EXCEL",data)

//     // Crear el workbook y worksheet
//     const workbook = ExcelHelper.createWorkbook();
//     const worksheet = workbook.addWorksheet('Techos Presupuestales');
    
//     // Configurar estilo general de la página
//     worksheet.pageSetup.margins = {
//       left: 0.7,
//       right: 0.7,
//       top: 0.75,
//       bottom: 0.75,
//       header: 0.3,
//       footer: 0.3
//     };
    
//     // Agregar el título en la parte superior
//     worksheet.getCell('A1').value = 'Reporte de Techos Presupuestales';
//     worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FFA11A5C' } }; 
//     worksheet.getCell('A1').alignment = { horizontal: 'center' };
//     worksheet.mergeCells('A1:E1');

//     // Agregar fecha a la derecha
//     const today = new Date();
//     const formattedDate = `Fecha: ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
//     worksheet.getCell('E2').value = formattedDate;
//     worksheet.getCell('E2').alignment = { horizontal: 'right' };
    
//     // Dejar una fila en blanco
//     worksheet.addRow([]);
    
//     // Definir encabezados (incluyendo ID Capítulo)
//     //const headers = ['Clave Unidad Administrativa', 'Área', 'ID Capítulo', 'Capítulo', 'Financiamiento', 'Presupuesto'];
//     const headers = ['Clave Unidad Administrativa', 'Área', 'MAC', 'FONE', 'Recursos Estatales'];
//     const headerRow = worksheet.addRow(headers);
    
//     // Estilo del encabezado - Color #a11a5c
//     headerRow.eachCell((cell) => {
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FFA11A5C' } // FG = A11A5C con FF para opacidad completa
//       };
//       cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Texto blanco
//       cell.alignment = { vertical: 'middle', horizontal: 'center' };
//     });

//     // Añadir datos
//     data.forEach(item => {
//       const row = worksheet.addRow([
//         item.claveUnidadAdministrativa,
//         item.areaName,
//         //item.capituloId,
//         //item.capituloName,
//        // item.financiamientoName,
//         //item.presupuestado
//       ]);
//     });

//     // Aplicar formato específico a las columnas
    
//     // Columna Clave Unidad Administrativa: alineada al centro
//     worksheet.getColumn(1).alignment = { horizontal: 'center' };
    
//     // Columna Área: alineada a la izquierda con ajuste de texto
//     worksheet.getColumn(2).alignment = { horizontal: 'left', wrapText: true };
    
//     // Columna ID Capítulo: alineada al centro
//     worksheet.getColumn(3).alignment = { horizontal: 'center' };
    
//     // Columnas de texto: alineadas a la izquierda
//     [4, 5].forEach(colIndex => {
//       worksheet.getColumn(colIndex).alignment = { horizontal: 'left' };
//     });
    
//     // Columna Presupuesto: formato de moneda y alineada a la derecha
//     worksheet.getColumn(5).numFmt = '"$"#,##0.00';
//     worksheet.getColumn(5).alignment = { horizontal: 'right' };
    
//     // Aplicar formato de moneda específicamente a cada celda de la columna presupuesto
//     data.forEach((item, index) => {
//       const rowNumber = index + 6; // +6 porque empezamos en la fila 6 (después del título, fecha, encabezados y fila en blanco)
//       const presupuestoCell = worksheet.getCell(`E${rowNumber}`);
//       presupuestoCell.numFmt = '"$"#,##0.00';
//       presupuestoCell.alignment = { horizontal: 'right' };
//     });

//     // Aplicar formato zebra a las filas de datos
//     const startDataRow = 5; // La fila donde empiezan los datos (después del título, fecha y encabezados)
//     worksheet.eachRow((row, rowNumber) => {
//       if (rowNumber >= startDataRow && rowNumber % 2 === 0) {
//         row.eachCell({ includeEmpty: true }, cell => {
//           cell.fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: 'FFEDEDED' }
//           };
//         });
//       }
//     });

//     // Auto-ajustar anchos de columna
//     worksheet.columns.forEach(column => {
//       if (column && column.eachCell) {
//         let maxLength = 0;
//         column.eachCell({ includeEmpty: false }, cell => {
//           const columnLength = cell.value ? cell.value.toString().length : 10;
//           if (columnLength > maxLength) {
//             maxLength = columnLength;
//           }
//         });
//         column.width = Math.min(maxLength + 2, 30);
//       }
//     });

//     // Agregar el footer
//     const lastRow = worksheet.rowCount + 1;
//     worksheet.getCell(`A${lastRow}`).value = 'Documento generado automáticamente por el sistema PROMETTE';
//     worksheet.getCell(`A${lastRow}`).font = { italic: true, size: 9, color: { argb: '00666666' } };
//     worksheet.getCell(`A${lastRow}`).alignment = { horizontal: 'center' };
//     worksheet.mergeCells(`A${lastRow}:E${lastRow}`);

//     console.log('Generando buffer del Excel...');

//     // Generar el buffer del Excel
//     const buffer = await workbook.xlsx.writeBuffer();

//     console.log('Buffer generado, tamaño:', buffer.byteLength, 'bytes');

//     // Configurar respuesta
//     const currentDate = new Date().toISOString().split('T')[0];
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=Techos_Presupuestales_${currentDate}.xlsx`);
//     res.setHeader('Content-Length', buffer.byteLength);
//     res.send(buffer);

//     console.log('Excel enviado correctamente');

//   } catch (error) {
//     console.error('Error en generateBudgetCeilingExcel:', error);
//     res.status(500).json({
//       msg: "Error al exportar los techos presupuestales a Excel",
//       error: error instanceof Error ? error.message : 'Error desconocido'
//     });
//   }
// };
