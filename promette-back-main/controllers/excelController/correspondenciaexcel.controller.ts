import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { getModels } from '../../models/modelsPromette';
import { Op } from 'sequelize';
import axios from 'axios';
import { PuestoAreaHelper } from '../../helpers/puestoarea.helper';

/**
 * Genera un archivo Excel con la información de las correspondencias
 */
export const generateExcelCorrespondencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const promette = await getModels(process.env.DBNAMES || "");

    if (!promette) {
      res.status(500).json({ message: "Error de conexión con la base de datos" });
      return;
    }

    // Obtener fechas desde query params o usar el día actual por defecto
    const { fechaInicio, fechaFin } = req.query;

    let inicio = fechaInicio ? new Date(fechaInicio as string) : new Date();
    let fin = fechaFin ? new Date(fechaFin as string) : new Date();

    if (!fechaInicio || !fechaFin) {
      // Si no se pasan fechas, usar el día actual
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);
    }


    // Crear libro de Excel (solo con la hoja que necesites, si es que aún se usa)
    const workbook = new ExcelJS.Workbook();

    // --- Declarar estiloEncabezados UNA VEZ al inicio (reutilizable) ---
    const estiloEncabezados: Partial<ExcelJS.Style> = {
      font: { bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    };

    const mensuales = await promette.dt_correspondencia.findAll({
      where: {
        createdAt: { [Op.between]: [inicio, fin] }
      },
      include: [
        {
          model: promette.ct_clasificacion_prioridad,
          as: "ct_clasificacion_prioridad",
          attributes: ["nombre_prioridad"],
        },
        {
          model: promette.ct_forma_entrega,
          as: "ct_forma_entrega",
          attributes: ["nombre_entrega"],
        },
        {
          model: promette.rl_correspondencia_usuario_estado,
          as: "rl_correspondencia_usuario_estados",
          include: [
            {
              model: promette.ct_correspondencia_estado,
              as: "ct_correspondencia_estado_ct_correspondencia_estado",
              attributes: ["nombre_estado"],
            },
            {
              model: promette.rl_usuario_puesto,
              as: "rl_usuario_puesto",
              include: [
                {
                  model: promette.ct_puesto,
                  as: "ct_puesto",
                  attributes: ["ct_area_id"],
                },
              ],
            },
          ],
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuarios_in_ct_usuario",
          attributes: ["curp"],
        },
      ],
    });

    // Obtener todos los CURPs involucrados (firmantes y remitentes)
    const curpsMensuales = mensuales
      .map((doc: any) => doc.ct_usuarios_in_ct_usuario?.curp)
      .filter((curp: string | undefined) => !!curp);

    // Obtener la información de RUPEET y áreas solo una vez
    const infoRemitentesMensual = await PuestoAreaHelper.obtenerInformacionCURPs(req.headers.authorization?.split(' ')[1] || '');

    // Construir mapas para acceso rápido
    let remitenteMapMensual = new Map();
    let areaMapMensual = new Map();
    infoRemitentesMensual.resultados.forEach((rem: any) => {
      const nombre = rem.informacion?.nombre || '';
      const apellidoPaterno = rem.informacion?.apellido_paterno || '';
      const apellidoMaterno = rem.informacion?.apellido_materno || '';
      const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
      remitenteMapMensual.set(rem.curp, nombreCompleto);
      // Mapear áreas por curp
      if (rem.puestosYAreas && rem.puestosYAreas.length > 0) {
        areaMapMensual.set(rem.curp, rem.puestosYAreas[0].area);
      }
    });

    // 1. Agrupar por día
    const correspondenciasPorDia: { [key: string]: any[] } = {};
    for (const doc of mensuales) {
      const fecha = new Date(doc.createdAt);
      const dia = fecha.toISOString().slice(0, 10); // 'YYYY-MM-DD'
      if (!correspondenciasPorDia[dia]) correspondenciasPorDia[dia] = [];
      correspondenciasPorDia[dia].push(doc);
    }

    // 2. Crear una hoja por cada día
    for (const dia in correspondenciasPorDia) {
      const worksheet = workbook.addWorksheet(dia);
      // Agregar encabezados personalizados en las primeras filas SOLO en columnas B, C y D
      worksheet.getCell('B1').value = 'FECHA:';
      worksheet.getCell('E1').value = dia; // Respuesta en columna E
      worksheet.getCell('B2').value = 'DOCUMENTOS TURNADOS:';
      worksheet.getCell('E2').value = ''; // Respuesta en columna E (puedes agregar el valor correspondiente)
      worksheet.getCell('B3').value = 'TOTAL DE DOCUMENTOS RECIBIDOS:';
      worksheet.getCell('E3').value = {
        richText: [
          { text: correspondenciasPorDia[dia].length.toString(), font: { bold: true } }
        ]
      };
      worksheet.getCell('E3').numFmt = '0'; // Formato numérico sin decimales
      worksheet.getCell('B4').value = 'COPIAS DE CONOCIMIENTO:';
      worksheet.getCell('E4').value = ''; // Respuesta en columna E (puedes agregar el valor correspondiente)
      worksheet.mergeCells('B1:D1');
      worksheet.mergeCells('B2:D2');
      worksheet.mergeCells('B3:D3');
      worksheet.mergeCells('B4:D4');
      for (let i = 1; i <= 4; i++) {
        worksheet.getRow(i).getCell('B').font = { bold: true };
        worksheet.getRow(i).getCell('B').alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getRow(i).getCell('E').font = { bold: true }; // Opcional: aplicar formato a la columna E
        worksheet.getRow(i).getCell('E').alignment = { vertical: 'middle', horizontal: 'left' }; // Opcional: alinear texto
      }

      // Encabezados de la tabla principal en la fila 5
      const fila5Mensual = worksheet.getRow(5);
      const headers = ['No.P', 'No. DE FOLIO', 'No. DE OFICIO', 'FECHA DE OFICIO', 'FECHA DE RECIBIDO', 'DEPENDENCIA O ÁREA QUE REMITE', 'NOMBRE DE QUIEN FIRMA', 'DIRIGIDO A', 'ASUNTO', 'TURNADO A', 'ESTATUS',  'OBSERVACIONES', ];
      headers.forEach((header, i) => {
        fila5Mensual.getCell(i + 1).value = header;
      });
      fila5Mensual.eachCell((cell) => {
        cell.style = estiloEncabezados;
      });

      // Agregar filas de datos solo para ese día
      for (const doc of correspondenciasPorDia[dia]) {
        const curpFirmante = doc.ct_usuarios_in_ct_usuario?.curp || '';
        let curpRemitente = '';
        let nombreRemitente = '';
        
        // Obtener el estado más reciente de la correspondencia
        const estados = doc.rl_correspondencia_usuario_estados || [];
        const estadoMasReciente = estados.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        
        const idUsuarioPuesto = estadoMasReciente?.rl_usuario_puesto_id;
        if (idUsuarioPuesto) {
          const usuarioPuesto = await promette.rl_usuario_puesto.findOne({
            where: { id_usuario_puesto: idUsuarioPuesto },
            include: [{ model: promette.ct_usuario, as: "ct_usuario", attributes: ["curp"] }],
          });
          curpRemitente = usuarioPuesto?.ct_usuario?.curp || '';
          nombreRemitente = remitenteMapMensual.get(curpRemitente) || '';
        }
        
        // Usar los mapas para obtener áreas y nombres
        const areaRemitente = areaMapMensual.get(curpRemitente) || 'Área no encontrada';
        const areaDestinatario = areaMapMensual.get(curpFirmante) || 'Área no encontrada';
        const nombreFirmante = remitenteMapMensual.get(curpFirmante?.trim().toUpperCase()) || '';
        const turnadoA = estadoMasReciente?.ct_correspondencia_estado_ct_correspondencia_estado?.nombre_estado || 'No especificado';
        const folioNumerico = doc.folio_sistema ? String(doc.folio_sistema).replace(/\D/g, '') : '';
        const fechaRecibido = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '';

        const row = worksheet.addRow([
          String(doc.id_correspondencia), // Forzar como texto para evitar interpretación como fecha
          folioNumerico,
          doc.folio_correspondencia,
          doc.fecha_correspondencia,
          fechaRecibido,
          areaDestinatario,
          remitenteMapMensual.get(curpFirmante) || 'No disponible',  // Solo nombre completo (sin CURP)
          remitenteMapMensual.get(curpRemitente) || 'No disponible', // Solo nombre completo (sin CURP)
          doc.resumen_correspondencia,
          areaRemitente,
          turnadoA,

          estadoMasReciente?.observaciones || '',

        ]);

        row.eachCell((cell: ExcelJS.Cell) => {
          cell.style = estiloEncabezados;
        });
      }

      worksheet.getColumn('D').numFmt = 'dd/mm/yyyy';
      worksheet.getColumn('E').numFmt = 'dd/mm/yyyy';
      worksheet.columns.forEach((column) => {
        column.width = column.header ? column.header.length + 5 : 15;
      });
    }

    // Enviar el archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_correspondencia.xlsx');
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error al generar el Excel:", error);
    res.status(500).json({ success: false, message: "Error al generar el reporte" });
  }
};

// Nueva función para documentos mensuales
export const generateExcelCorrespondenciaMensual = async (req: Request, res: Response): Promise<void> => {
  try {
    const promette = await getModels(process.env.DBNAMES || "");
    if (!promette) {
      res.status(500).json({ message: "Error de conexión con la base de datos" });
      return;
    }

    // Obtener el año desde query params (opcional)
    const { anio } = req.query;
    const anioFiltro = anio ? parseInt(anio as string) : new Date().getFullYear();

    // Obtener todos los documentos filtrados por año
    const todosLosDocumentos = await promette.dt_correspondencia.findAll({
      where: {
        createdAt: {
          [Op.between]: [
            new Date(anioFiltro, 0, 1), // 1 de enero del año
            new Date(anioFiltro, 11, 31, 23, 59, 59, 999) // 31 de diciembre del año
          ]
        }
      },
      include: [
        {
          model: promette.ct_clasificacion_prioridad,
          as: "ct_clasificacion_prioridad",
          attributes: ["nombre_prioridad"],
        },
        {
          model: promette.ct_forma_entrega,
          as: "ct_forma_entrega",
          attributes: ["nombre_entrega"],
        },
        {
          model: promette.rl_correspondencia_usuario_estado,
          as: "rl_correspondencia_usuario_estados",
          include: [
            {
              model: promette.ct_correspondencia_estado,
              as: "ct_correspondencia_estado_ct_correspondencia_estado",
              attributes: ["nombre_estado"],
            },
            {
              model: promette.rl_usuario_puesto,
              as: "rl_usuario_puesto",
              include: [
                {
                  model: promette.ct_puesto,
                  as: "ct_puesto",
                  attributes: ["ct_area_id"],
                },
              ],
            },
          ],
        },
        {
          model: promette.ct_usuario,
          as: "ct_usuarios_in_ct_usuario",
          attributes: ["curp"],
        },
      ],
    });

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();

    // Estilo de encabezados
    const estiloEncabezados: Partial<ExcelJS.Style> = {
      font: { bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    };

    // Agrupar documentos por mes y asignar nombres de mes
    const nombresMeses: { [key: number]: string } = {
      1: "Enero",
      2: "Febrero",
      3: "Marzo",
      4: "Abril",
      5: "Mayo",
      6: "Junio",
      7: "Julio",
      8: "Agosto",
      9: "Septiembre",
      10: "Octubre",
      11: "Noviembre",
      12: "Diciembre",
    };

    const documentosPorMes: { [key: string]: any[] } = {};
    todosLosDocumentos.forEach((doc: any) => {
      const fecha = new Date(doc.createdAt); // ← Cambiado a createdAt
      const mesNumero = fecha.getMonth() + 1;
      const claveMes = `${fecha.getFullYear()}-${mesNumero}`;
      if (!documentosPorMes[claveMes]) documentosPorMes[claveMes] = [];
      documentosPorMes[claveMes].push(doc);
    });

    // Obtener todos los CURPs de los remitentes
    const curps = todosLosDocumentos
      .map((doc: any) => doc.ct_usuarios_in_ct_usuario?.curp)
      .filter((curp: string | undefined) => !!curp);

    // Obtener información de los remitentes
    let remitenteMap = new Map();
    let areaMap = new Map();
    if (curps.length > 0) {
      const infoRemitentes = await PuestoAreaHelper.obtenerInformacionCURPs(req.headers.authorization?.split(' ')[1] || '');
      infoRemitentes.resultados.forEach((rem: any) => {
        const nombreCompleto = `${rem.informacion?.nombre || ''} ${rem.informacion?.apellido_paterno || ''} ${rem.informacion?.apellido_materno || ''}`.trim();
        remitenteMap.set(rem.curp, nombreCompleto);
        if (rem.puestosYAreas && rem.puestosYAreas.length > 0) {
          areaMap.set(rem.curp, rem.puestosYAreas[0].area);
        }
      });
    }

    // Crear una hoja por mes
    for (const claveMes in documentosPorMes) {
      const [anio, mesNumero] = claveMes.split("-").map(Number);
      const nombreMes = nombresMeses[mesNumero];
      const nombreHoja = `${nombreMes} ${anio}`; // Ejemplo: "Julio 2025"
      const worksheet = workbook.addWorksheet(nombreHoja);

      // Encabezados de la tabla
      const filaEncabezados = worksheet.getRow(1);
      const headers = ['No.P', 'No. DE FOLIO', 'No. DE OFICIO', 'FECHA DE OFICIO', 'FECHA DE RECIBIDO', 'DEPENDENCIA O ÁREA QUE REMITE', 'NOMBRE DE QUIEN FIRMA', 'DIRIGIDO A', 'ASUNTO', 'TURNADO A', 'ESTATUS', 'OBSERVACIONES'];
      headers.forEach((header, i) => {
        filaEncabezados.getCell(i + 1).value = header;
      });
      filaEncabezados.eachCell((cell: ExcelJS.Cell) => {
        cell.style = estiloEncabezados;
      });

      // Agregar filas de datos para el mes actual
      for (const doc of documentosPorMes[claveMes]) {
        const curpFirmante = doc.ct_usuarios_in_ct_usuario?.curp || '';
        let curpRemitente = '';
        
        // Obtener el estado más reciente de la correspondencia
        const estados = doc.rl_correspondencia_usuario_estados || [];
        const estadoMasReciente = estados.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        
        const idUsuarioPuesto = estadoMasReciente?.rl_usuario_puesto_id;
        if (idUsuarioPuesto) {
          const usuarioPuesto = await promette.rl_usuario_puesto.findOne({
            where: { id_usuario_puesto: idUsuarioPuesto },
            include: [{ model: promette.ct_usuario, as: "ct_usuario", attributes: ["curp"] }],
          });
          curpRemitente = usuarioPuesto?.ct_usuario?.curp || '';
        }

        const nombreRemitente = remitenteMap.get(curpRemitente) || 'No disponible';
        const nombreFirmante = remitenteMap.get(curpFirmante) || 'No disponible';
        const areaRemitente = areaMap.get(curpRemitente) || 'Área no encontrada';
        const areaDestinatario = areaMap.get(curpFirmante) || 'Área no encontrada';
        const folioNumerico = doc.folio_sistema ? String(doc.folio_sistema).replace(/\D/g, '') : '';
        const turnadoA = estadoMasReciente?.ct_correspondencia_estado_ct_correspondencia_estado?.nombre_estado || 'No especificado';
        const fechaRecibido = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '';

        const row = worksheet.addRow([
          String(doc.id_correspondencia), // Forzar como texto para evitar interpretación como fecha
          folioNumerico,
          doc.folio_correspondencia,
          doc.fecha_correspondencia,
          fechaRecibido,
          areaDestinatario,
          nombreFirmante,
          nombreRemitente,
          doc.resumen_correspondencia,
          areaRemitente,
          turnadoA,
          estadoMasReciente?.observaciones || '',
        ]);

        row.eachCell((cell: ExcelJS.Cell) => {
          cell.style = estiloEncabezados;
        });
      }

      // Formato de fecha y ajuste de columnas
      worksheet.getColumn('D').numFmt = 'dd/mm/yyyy';
      worksheet.getColumn('E').numFmt = 'dd/mm/yyyy';
      worksheet.columns.forEach((column) => {
        column.width = column.header ? column.header.length + 5 : 15;
      });
    }

    // Enviar el archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_correspondencia_mensual.xlsx');
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error al generar el Excel mensual:", error);
    res.status(500).json({ success: false, message: "Error al generar el reporte mensual" });
  }
};
