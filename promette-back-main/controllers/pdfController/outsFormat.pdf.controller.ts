import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";



/**
 * Función para dibujar la tabla de materiales de manera estricta para asegurar el alineamiento
 * @param doc - Documento PDF
 * @param material - Datos de la tabla
 * @param mesLabel - Etiqueta del mes para la columna
 */
function dibujarTabla(
  doc: PDFKit.PDFDocument,
  material: string[][],
  mesLabel: string
) {
  // Definiciones exactas - usar valores precisos del archivo EntregaMateriales.js
  const startX = 70; // Mantenemos esta coordenada X inicial exacta
  const startY = 222; // Mantenemos esta coordenada Y inicial exacta
  const pageHeight = 650; // Altura máxima de la página antes de nueva página
  const rowHeight = 18; // Altura de cada fila

  // Estos anchos deben coincidir EXACTAMENTE con los dibujados en encabezado
  // Total: 434 unidades de ancho
  const colWidths = [57, 55, 57, 265];

  // Dibujar la tabla
  let y = startY;

  // Encabezado de la tabla
  // PARTIDA - primera columna
  doc
    .lineWidth(0.5)
    .rect(70, 200, 57, 22)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("PARTIDA", 70, 208, { width: 57, align: "center" });

  // UM.M - segunda columna
  doc
    .lineWidth(0.5)
    .rect(127, 200, 55, 22)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("UM.M", 127, 208, { width: 55, align: "center" });

  // CANTIDAD - tercera columna (parte superior)
  doc
    .lineWidth(0.5)
    .rect(182, 200, 57, 11)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("CANTIDAD", 182, 202, { width: 57, align: "center" });

  // MES - tercera columna (parte inferior)
  doc
    .lineWidth(0.5)
    .rect(182, 211, 57, 11)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text(mesLabel?.toUpperCase().substring(0, 10) || "MES", 182, 214, {
      width: 57,
      align: "center",
    });

  // DESCRIPCIÓN - cuarta columna
  doc
    .lineWidth(0.5)
    .rect(239, 200, 265, 22)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("DESCRIPCIÓN", 239, 208, { width: 265, align: "center" });

  // Procesar filas de datos
  material.forEach((row, rowIndex) => {
    if (y + rowHeight > pageHeight) {
      doc.addPage();

      // Agregar el encabezado en la nueva página
      y = startY;
      encabezado(doc, { area: "", fecha: "", material: "" }, mesLabel);
      piePagina(doc, "");
    }

    // Dibujar cada fila con coordenadas IDÉNTICAS a las del encabezado
    // PARTIDA - primera columna
    doc.rect(70, y, 57, rowHeight).stroke();
    doc
      .fontSize(6)
      .font("Helvetica")
      .text(row[0], 70, y + 7, {
        width: 57,
        align: "center",
      });

    // UM.M - segunda columna
    doc.rect(127, y, 55, rowHeight).stroke();
    doc
      .fontSize(6)
      .font("Helvetica")
      .text(row[1], 127, y + 7, {
        width: 55,
        align: "center",
      });

    // CANTIDAD - tercera columna
    doc.rect(182, y, 57, rowHeight).stroke();
    doc
      .fontSize(6)
      .font("Helvetica")
      .text(row[2], 182, y + 7, {
        width: 57,
        align: "center",
      });

    // DESCRIPCIÓN - cuarta columna
    doc.rect(239, y, 265, rowHeight).stroke();
    doc
      .fontSize(6)
      .font("Helvetica")
      .text(row[3], 242, y + 7, {
        width: 260, // Ajustado para dejar margen interno
        align: "left",
      });

    // Avanzar a la siguiente fila
    y += rowHeight;
  });
}

/**
 * Función para dibujar el encabezado de tabla con alineación estricta
 * @param doc - Documento PDF
 */
function dibujarEncabezadoTabla(doc: PDFKit.PDFDocument, mesLabel: string) {
  const leftMargin = 70;
  const topMargin = 200;
  const rowHeight = 22;
  const halfRowHeight = 11;

  // Estos son exactamente los mismos anchos que se usan en dibujarTabla
  const colWidths = [57, 55, 57, 265];

  // 1. PARTIDA
  doc
    .lineWidth(0.5)
    .rect(leftMargin, topMargin, colWidths[0], rowHeight)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("PARTIDA", leftMargin, topMargin + 8, {
      width: colWidths[0],
      align: "center",
    });

  // 2. UM.M
  const col2X = leftMargin + colWidths[0];
  doc
    .lineWidth(0.5)
    .rect(col2X, topMargin, colWidths[1], rowHeight)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("UM.M", col2X, topMargin + 8, {
      width: colWidths[1],
      align: "center",
    });

  // 3. CANTIDAD (dividido en dos secciones)
  const col3X = col2X + colWidths[1];
  // 3a. Sección superior: "CANTIDAD"
  doc
    .lineWidth(0.5)
    .rect(col3X, topMargin, colWidths[2], halfRowHeight)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("CANTIDAD", col3X, topMargin + 2, {
      width: colWidths[2],
      align: "center",
    });

  // 3b. Sección inferior: Mes
  doc
    .lineWidth(0.5)
    .rect(col3X, topMargin + halfRowHeight, colWidths[2], halfRowHeight)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text(
      mesLabel?.toUpperCase().substring(0, 10) || "MES",
      col3X,
      topMargin + halfRowHeight + 2,
      { width: colWidths[2], align: "center" }
    );

  // 4. DESCRIPCIÓN
  const col4X = col3X + colWidths[2];
  doc
    .lineWidth(0.5)
    .rect(col4X, topMargin, colWidths[3], rowHeight)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("DESCRIPCIÓN", col4X, topMargin + 8, {
      width: colWidths[3],
      align: "center",
    });
}

/**
 * Función para dibujar el encabezado completo del documento PDF
 * @param doc - Documento PDF
 * @param area - Datos del área
 * @param mes_cantidad - Etiqueta de mes para el encabezado
 */
function encabezado(
  doc: PDFKit.PDFDocument,
  area: any,
  mes_cantidad?: string | null
) {
  // Coordenadas y medidas principales
  const pageWidth = 595.28; // Ancho de página A4 en puntos
  const leftMargin = 70;
  const rightMargin = 70;

  // Logo SEPE - posicionado a la izquierda
  const logoX = leftMargin;
  const logoY = 70;
  const logoWidth = 120;
  const logoHeight = 30;

  try {
    // Lista de posibles ubicaciones para la imagen SEPE.png
    const possiblePaths = [
      path.join(process.cwd(), "public", "SEPE.png"),
      path.join(process.cwd(), "assets", "SEPE.png"),
      path.join(process.cwd(), "SEPE.png"),
      path.join(__dirname, "..", "..", "public", "SEPE.png"),
      path.join(__dirname, "..", "..", "assets", "SEPE.png"),
      "SEPE.png",
    ];

    let imageCargada = false;
    for (const imagePath of possiblePaths) {
      if (fs.existsSync(imagePath)) {
        try {
          doc.image(imagePath, logoX, logoY, {
            width: logoWidth,
            height: logoHeight,
          });
          imageCargada = true;
          break;
        } catch (err) {
          // Continuar con la siguiente ruta
        }
      }
    }

    if (!imageCargada) {
      doc.rect(logoX, logoY, logoWidth, logoHeight).stroke();
      doc
        .fontSize(8)
        .text("SEPE", logoX, logoY + 15, { width: logoWidth, align: "center" });
    }
  } catch (error) {
    doc.rect(logoX, logoY, logoWidth, logoHeight).stroke();
    doc
      .fontSize(8)
      .text("SEPE", logoX, logoY + 15, { width: logoWidth, align: "center" });
  }

  // Textos del encabezado alineados a la derecha
  // Calcular posición para alineación a la derecha
  const rightTextX = logoX + logoWidth + 30; // Espacio después del logo
  const rightTextWidth = pageWidth - rightMargin - rightTextX; // Ancho disponible para el texto

  // GOBIERNO DEL ESTADO DE TLAXCALA - alineado a la derecha
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("GOBIERNO DEL ESTADO DE TLAXCALA", rightTextX, logoY, {
      width: rightTextWidth,
      align: "right",
    });

  // SECRETARÍA DE EDUCACIÓN PÚBLICA - alineado a la derecha
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("SECRETARÍA DE EDUCACIÓN PÚBLICA", rightTextX, logoY + 15, {
      width: rightTextWidth,
      align: "right",
    });

  // DIRECCIÓN GENERAL - alineado a la derecha
  doc
    .font("Helvetica")
    .fontSize(8)
    .text("DIRECCIÓN GENERAL", rightTextX, logoY + 30, {
      width: rightTextWidth,
      align: "right",
    });

  // DEPARTAMENTO ADMINISTRATIVO - alineado a la derecha
  doc
    .font("Helvetica")
    .fontSize(8)
    .text("DEPARTAMENTO ADMINISTRATIVO", rightTextX, logoY + 42, {
      width: rightTextWidth,
      align: "right",
    });

  // ENTREGA DE MATERIALES Y SERVICIOS - centrado en toda la página
  const contentWidth = pageWidth - leftMargin - rightMargin;
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("ENTREGA DE MATERIALES Y SERVICIOS", leftMargin, logoY + 60, {
      width: contentWidth,
      align: "center",
    });

  // Área solicitante y fecha (fila 1)
  doc.font("Helvetica").fontSize(8).text("ÁREA SOLICITANTE:", 70, 150);

  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(`${area.area || ""}`, 150, 151, { width: 200, align: "center" });
  doc.moveTo(150, 160).lineTo(350, 160).stroke();

  doc.font("Helvetica").fontSize(8).text("FECHA:", 375, 150);

  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(`${area.fecha || ""}`, 407, 151, { width: 98, align: "center" });
  doc.moveTo(407, 160).lineTo(505, 160).stroke();
  doc.moveDown(2);

  doc.font("Helvetica").fontSize(8).text("MATERIAL DE:", 70, 180);

  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(`${area.material || ""}`, 128, 181, { width: 262, align: "center" });
  doc.moveTo(128, 190).lineTo(390, 190).stroke();
  doc.moveDown();

  // Dibujar encabezado de la tabla
  doc
    .lineWidth(0.5)
    .rect(70, 200, 57, 22)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("PARTIDA", 70, 208, { width: 57, align: "center" });

  doc
    .lineWidth(0.5)
    .rect(127, 200, 55, 22)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("UM.M", 127, 208, { width: 55, align: "center" });

  doc
    .lineWidth(0.5)
    .rect(182, 200, 57, 11)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("CANTIDAD", 182, 202, { width: 57, align: "center" });

  doc
    .lineWidth(0.5)
    .rect(182, 211, 57, 11)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text(mes_cantidad?.toUpperCase().substring(0, 10) || "MES", 182, 214, {
      width: 57,
      align: "center",
    });

  doc
    .lineWidth(0.5)
    .rect(239, 200, 265, 22)
    .fillAndStroke("#d9d9d9", "black")
    .font("Helvetica-Bold")
    .fillColor("black")
    .fontSize(8)
    .text("DESCRIPCIÓN", 239, 208, { width: 265, align: "center" });
}

/**
 * Genera un PDF de entrega de materiales basado en un formato específico
 * y lo envía directamente al navegador sin almacenamiento local
 */
export const generateEntregaMaterialesPDF = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { folio_formato } = req.params;

    if (!folio_formato) {
      res.status(400).json({
        success: false,
        msg: "El folio del formato es requerido",
      });
      return;
    }

    // Buscar el formato de entrega
    const formato = await promette.rl_entrega_formato.findOne({
      where: { folio_formato },
      include: [
        {
          model: promette.ct_usuario,
          as: "ct_usuario",
          required: false,
        },
      ],
    });

    if (!formato) {
      res.status(404).json({
        success: false,
        msg: "Formato de entrega no encontrado",
      });
      return;
    }

    // Buscar las entregas asociadas al formato
    const entregas = await promette.dt_consumible_entrega.findAll({
      where: { folio_formato },
      include: [
        {
          model: promette.dt_consumible_inventario,
          as: "dt_inventario",
          include: [
            {
              model: promette.ct_partida,
              as: "ct_partida",
            },
          ],
        },
        {
          model: promette.ct_unidad_medida,
          as: "ct_unidad",
        },
        // ct_area se consulta desde API externa - solo guardamos el ID
      ],
    });

    if (!entregas || entregas.length === 0) {
      res.status(404).json({
        success: false,
        msg: "No se encontraron entregas asociadas al formato",
      });
      return;
    }

    // Obtener el ID del área de la primera entrega
    const area_id = entregas[0].ct_area_id;
    if (!area_id) {
      res.status(500).json({
        success: false,
        msg: "Error: entrega sin área asignada",
      });
      return;
    }

    // Obtener información detallada de la partida para mostrar en el PDF
    let partidaInfo = "";
    if (entregas[0].dt_inventario && entregas[0].dt_inventario.ct_partida) {
      const partida = entregas[0].dt_inventario.ct_partida;
      partidaInfo = `${partida.clave || partida.clave_partida || ""} ${
        partida.nombre || partida.nombre_partida || ""
      }`.trim();
    }

    // Preparar información para el PDF
    const area = {
      area: `Área ID: ${area_id}`, // El frontend deberá resolver el nombre del área
      fecha: new Date().toLocaleDateString("es-MX"),
      material: partidaInfo || "MATERIALES, ÚTILES Y EQUIPOS MENORES",
    };

    // Preparar los datos de materiales para la tabla
    const material = entregas.map((entrega: any, index: number) => {
      // Obtener unidad de medida
      const unidadMedida =
        entrega.unidad_medida?.clave_unidad ||
        entrega.unidad_medida?.nombre_unidad ||
        "PZA";

      // Obtener descripción
      const descripcion =
        entrega.dt_inventario?.descripcion ||
        entrega.dt_inventario?.description ||
        "Sin descripción";

      return [
        (index + 1).toString(), // Número consecutivo
        unidadMedida, // Unidad de medida
        entrega.cantidad.toString(), // Cantidad
        descripcion, // Descripción
      ];
    });

    const recibio = formato.persona_recibe || "SIN ESPECIFICAR";

    // Configurar headers para la respuesta PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=entrega_materiales_${folio_formato.replace(
        /[^a-z0-9]/gi,
        "_"
      )}.pdf`
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Crear el documento PDF sin márgenes para poder posicionar todo exactamente
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      info: {
        Title: `Formato de Entrega ${folio_formato}`,
        Author: "SEPE",
        Subject: "Entrega de Materiales",
      },
    });

    // Pipe el documento directamente a la respuesta
    doc.pipe(res);

    encabezado(doc, area, formato.mes_cantidad);
    piePagina(doc, recibio);
    dibujarTabla(doc, material, formato.mes_cantidad || "MES");

    // Finalizar el documento
    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({
      success: false,
      msg: "Error al generar el PDF",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Función para dibujar el pie de página
 */
function piePagina(doc: PDFKit.PDFDocument, recibio: string) {
  const leftMargin = 60; // Reducido para coincidir con el encabezado
  const y = 655;
  const colWidth = 60;
  const colSpace = 110;

  // Vo. Bo.
  doc
    .fontSize(7)
    .text("Vo. Bo.", leftMargin, y, { width: colWidth, align: "center" });

  // AUTORIZÓ
  doc.text("AUTORIZÓ", leftMargin + colSpace, y, {
    width: colWidth,
    align: "center",
  });

  // ENTREGÓ
  doc.text("ENTREGÓ", leftMargin + colSpace * 2, y, {
    width: colWidth,
    align: "center",
  });

  // RECIBIÓ
  doc.text("RECIBIÓ", leftMargin + colSpace * 3, y, {
    width: 100,
    align: "center",
  });

  const nameY = y + 30;

  // Nombres
  doc
    .fontSize(6)
    .fillColor("black")
    .text("LIC. JAVIER MONTALVO BAUTISTA", leftMargin, nameY, {
      width: colWidth,
      align: "center",
    });

  doc.text("LIC. AUGUSTO MACIAS SÁNCHEZ", leftMargin + colSpace, nameY, {
    width: colWidth,
    align: "center",
  });

  doc.text(
    "ING. FRANCISCO J. GRACIA HERNÁNDEZ",
    leftMargin + colSpace * 2,
    nameY,
    {
      width: colWidth,
      align: "center",
    }
  );

  const lineY = y + 60;

  // Líneas para firma
  doc
    .moveTo(leftMargin, lineY)
    .lineTo(leftMargin + colWidth, lineY)
    .stroke();
  doc
    .moveTo(leftMargin + colSpace, lineY)
    .lineTo(leftMargin + colSpace + colWidth, lineY)
    .stroke();
  doc
    .moveTo(leftMargin + colSpace * 2, lineY)
    .lineTo(leftMargin + colSpace * 2 + colWidth, lineY)
    .stroke();
  doc
    .moveTo(leftMargin + colSpace * 3, lineY)
    .lineTo(leftMargin + colSpace * 3 + 100, lineY)
    .stroke();

  const titleY = lineY + 5;

  // Cargos
  doc
    .fontSize(6)
    .font("Helvetica")
    .fillColor("black")
    .text("ENCARGADO DE RECURSOS MATERIALES Y SERVICIOS", leftMargin, titleY, {
      width: colWidth,
      align: "center",
    });

  doc.text(
    "JEFE DEL DEPARTAMENTO ADMINISTRATIVO",
    leftMargin + colSpace,
    titleY,
    {
      width: colWidth,
      align: "center",
    }
  );

  doc.text("ANALISTA DE ALMACÉN SEPE", leftMargin + colSpace * 2, titleY, {
    width: colWidth,
    align: "center",
  });

  doc.font("Helvetica-Bold").text(recibio, leftMargin + colSpace * 3, titleY, {
    width: 100,
    align: "center",
  });
}
