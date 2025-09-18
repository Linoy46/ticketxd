import { rl_usuario_puesto } from './../../models/modelsPromette/rl_usuario_puesto';
import { ct_puesto } from './../../models/modelsPromette/ct_puesto';
import { rl_area_financiero } from './../../models/modelsPromette/rl_area_financiero';
import { ct_producto_consumible } from './../../models/modelsPromette/ct_producto_consumible';
import { rl_producto_requisicion } from './../../models/modelsPromette/rl_producto_requisicion';
import { ct_financiamiento } from './../../models/modelsPromette/ct_financiamiento';
import { dt_proyecto_anual } from './../../models/modelsPromette/dt_proyecto_anual';
import { dt_techo_presupuesto } from './../../models/modelsPromette/dt_techo_presupuesto';
import { Request, Response } from "express";
import { ct_area, ct_usuario, initModels } from '../../models/modelsPromette/init-models';
import { sequelize } from "../../config/database";
import { Op } from "sequelize";
import path from 'path';
import axios from "axios";
import { promette } from '../../models/database.models';
const PDFDocument = require("pdfkit"); //pdfkit para generar PDF
const fondoPath = path.resolve(__dirname, '../../public/USET.png'); //obetener la ruta del fondo de la hoja

interface MaterialVertical  {
  unidad: string;
  solicitada: string;
  autorizada: string;
  claveArea: string;
  partida: string;
  descripcion: string;
  importe: string;
  financiamiento: string
}

interface MaterialHorizontal  {
  programa: string;
  detalle: string;
  claveArea: string;
  partida: string;
  medida: string;
  solicitada: string;
  autorizada: string;
  importe: string;
  financiamiento:string
}


export const generateRequisionCompraPDF = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ct_area_id, id_usuario } = req.body;
    const areaInfra = await promette.rl_area_financiero.findOne({
      where: { id_area_fin: ct_area_id }
    });
    const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      };
    // Extraer el token JWT del encabezado de autorización de la solicitud entrante
    const url = `${infraestructuraApiUrl}/${areaInfra.id_area_infra}`;
    const response = await axios.get(url, config);
    let area = response.data.nombre;
    const usuario = await promette.ct_usuario.findOne({
      where: { id_usuario: id_usuario },
      attributes: ["curp", "nombre_usuario"]
    });
    let curp = usuario.curp;

    // Configurar headers para la respuesta PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=requisicion_compra.pdf`
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    function agruparPorPartidaYFinanciamiento<T extends { partida: string, financiamiento: string }>(material: T[]): Record<string, T[]> {
      const grupos: Record<string, T[]> = {};
      material.forEach((row) => {
        // Clave combinada de partida y financiamiento
        const key = `${row.partida}-${row.financiamiento}`;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(row);
      });
      return grupos;
    }

    function encabezadoVertical(doc:PDFKit.PDFDocument,pageCount:number,financiamiento:string){
      doc.image(fondoPath, 30, 30,{ width: 250, height: 50 });
      doc.font('Helvetica-Bold').fontSize(8).text('UNIDAD DE SERVICIOS EDUCATIVOS DEL ESTADO DE TLAXCALA',320,60,{width: 300,align: 'left' });
      doc.font('Helvetica-Bold').fontSize(8).text('DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS',345,doc.y,{width: 300,align: 'left'});
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(11).text(`REQUISICIÓN DE COMPRA`,0,105,{ align: 'center' });
      doc.font('Helvetica').fontSize(8).text('FUENTE DE FINANCIAMIENTO:', 105,125).text(financiamiento, 230,125,{ width: 145,align: 'left' }); 
      doc.moveTo(228, 135).lineTo(370, 135).stroke();
      doc.text(`EJERCICIO:`,178,145).text(`2025`, 230,145,{ width: 145,align: 'left' });
      doc.moveTo(228, 155).lineTo(370, 155).stroke();
      doc.text('ÁREA SOLICIANTE:',149,165).text(`${area}`, 230,158,{ width: 145,align: 'left' });
      doc.moveTo(228, 175).lineTo(370, 175).stroke();
      doc.lineWidth(0.5).rect(425, 120, 114, 60).fillAndStroke('white', 'black');
      doc.fillColor('black').text('HOJA',400,130,{ width: 145,align: 'left' }).font('Helvetica-Bold').text(`${pageCount}`, 425,130,{ width: 114,align: 'center' });
      const fechaActual = new Date();
      const dia = String(fechaActual.getDate()).padStart(2, '0');
      const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
      const anio = fechaActual.getFullYear();
      const fechaFormateada = `${dia}/${mes}/${anio}`;
      doc.font('Helvetica').fillColor('black').text('FECHA',395,165,{ width: 145,align: 'left' }).text(fechaFormateada, 425,165,{ width: 114,align: 'center' });
    };

    function encabezadoHorizontal(doc:PDFKit.PDFDocument,pageCount:number,financiamiento:string){
      doc.image(fondoPath, 30, 30,{ width: 330, height: 60 });
      doc.font('Helvetica-Bold').fontSize(12).text('UNIDAD DE SERVICIOS EDUCATIVOS DEL ESTADO DE TLAXCALA',402,45,{width: 400,align: 'left' });
      doc.font('Helvetica-Bold').fontSize(12).text('DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS',460,doc.y,{width: 300,align: 'left'});
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(10).text(`REQUISICIÓN DE SERVICIO`,0,105,{ align: 'center' });
      doc.font('Helvetica').fontSize(8).text('FUENTE DE FINANCIAMIENTO:', 105,125).text(financiamiento, 230,125,{ width: 252,align: 'left' });
      doc.moveTo(228, 135).lineTo(480, 135).stroke();
      doc.text(`EJERCICIO:`,178,145).text(`2025`, 230,145,{ width: 252,align: 'left' });
      doc.moveTo(228, 155).lineTo(480, 155).stroke();
      doc.text('ÁREA SOLICIANTE:',149,165).text(`${area}`, 230,165,{ width: 252,align: 'left' });
      doc.moveTo(228, 175).lineTo(480, 175).stroke();
      doc.lineWidth(0.5).rect(565, 120, 114, 60).fillAndStroke('white', 'black');
      doc.fillColor('black').text('HOJA',540,130,{ width: 145,align: 'left' }).font('Helvetica-Bold').text(`${pageCount}`, 565,130,{ width: 114,align: 'center' });
      const fechaActual = new Date();
      const dia = String(fechaActual.getDate()).padStart(2, '0');
      const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
      const anio = fechaActual.getFullYear();
      const fechaFormateada = `${dia}/${mes}/${anio}`;
      doc.font('Helvetica').fillColor('black').text('FECHA',535,165,{ width: 145,align: 'left' }).text(fechaFormateada, 565,165,{ width: 114,align: 'center' });
    };

    function encabezadoTablaVerical(doc:PDFKit.PDFDocument){
      doc.lineWidth(0.5).rect(56, 200, 57, 30).fillAndStroke('white', 'black').font('Helvetica').fillColor('black').fontSize(6).text('UNIDAD', 56,207,{ width: 57,align: 'center' }).text('DE MEDIDA', 56,217,{ width: 57,align: 'center' });
      doc.lineWidth(0.5).rect(113, 200, 85, 30).fillAndStroke('white', 'black').fillColor('black').fontSize(6).text('CANTIDAD', 113,205,{ width: 85,align: 'center' }); 
      doc.lineWidth(0.5).rect(113, 215, 42, 15).fillAndStroke('white', 'black').lineWidth(0.5).rect(155, 215, 43, 15).fillAndStroke('white', 'black').fillColor('black').text('SOLICITADA', 113,220,{ width: 42,align: 'center' }).text('AUTORIZADA', 155,220,{ width: 43,align: 'center' }); 
      doc.lineWidth(0.5).rect(198, 200, 57, 30).fillAndStroke('white', 'black').fillColor('black').text('UNIDAD', 198,207,{ width: 57,align: 'center' }).text('ADMINISTRATIVA', 198,217,{ width: 57,align: 'center' }); 
      doc.lineWidth(0.5).rect(255, 200, 57, 30).fillAndStroke('white', 'black').fillColor('black').text('PARTIDA', 255,213,{ width: 57,align: 'center' }); 
      doc.lineWidth(0.5).rect(312, 200, 170, 30).fillAndStroke('white', 'black').fillColor('black').text('DESCRIPCIÓN', 312,213,{ width: 170,align: 'center'}); 
      doc.lineWidth(0.5).rect(482, 200, 56, 30).fillAndStroke('white', 'black').fillColor('black').text('IMPORTE', 482,213,{ width: 56,align: 'center'}); 
    }

    function encabezadoTablaHorizontal(doc:PDFKit.PDFDocument){
      doc.lineWidth(0.5).rect(56, 200, 85, 30).fillAndStroke('white', 'black').font('Helvetica').fillColor('black').fontSize(6).text('NÚMERO PROG.', 56,207,{ width: 85,align: 'center' });
      doc.lineWidth(0.5).rect(141, 200, 200, 30).fillAndStroke('white', 'black').fillColor('black').fontSize(6).text('DETALLE DEL SERVICIO', 141,205,{ width: 200,align: 'center' }); 
      doc.lineWidth(0.5).rect(341, 200, 85, 30).fillAndStroke('white', 'black').fillColor('black').text('UNIDAD ', 341,205,{ width: 85,align: 'center' }).text('ADMINISTRATIVA', 341,215,{ width: 85,align: 'center' }); 
      doc.lineWidth(0.5).rect(426, 200, 85, 30).fillAndStroke('white', 'black').fillColor('black').text('PARTIDA', 426,207,{ width: 85,align: 'center' }); 
      doc.lineWidth(0.5).rect(511, 200, 85, 30).fillAndStroke('white', 'black').fillColor('black').text('UNIDAD DE', 511,205,{ width: 85,align: 'center' }).text('MEDIDA', 511,215,{ width: 85,align: 'center' }); 
      doc.lineWidth(0.5).rect(596, 200, 113, 15).fillAndStroke('white', 'black').fillColor('black').text('CANTIDAD', 596,205,{ width: 113,align: 'center'}); 
      doc.lineWidth(0.5).rect(596, 215, 56, 15).fillAndStroke('white', 'black').fillColor('black').text('SOLICITADA', 596,220,{ width: 56,align: 'center'}); 
      doc.lineWidth(0.5).rect(652, 215, 57, 15).fillAndStroke('white', 'black').fillColor('black').text('AUTORIZADA', 652,220,{ width: 57,align: 'center'}); 
      doc.lineWidth(0.5).rect(709, 200, 85, 30).fillAndStroke('white', 'black').fillColor('black').text('IMPORTE', 709,205,{ width: 85,align: 'center'}); 
    }

    function piePaginaVertical(doc:PDFKit.PDFDocument,ejeY:number){
      doc.lineWidth(0.5).rect(56, ejeY, 241, 85).fillAndStroke('white', 'black').font('Helvetica').fillColor('black').fontSize(6).text('JUSTIFICACIÓN DE REQUERIMIENTOS USO ESPECÍFICO',56,ejeY+10,{ width: 241,align: 'center' }).text('OTRAS OBSERVACIONES',56,ejeY+18,{ width: 241,align: 'center' }).text('RECURSO UTILIZADO PARA LA ADQUISICIÓN DE CONSUMIBLES PARA LA OPERACIÓN DEL DEPARTAMENTO DE TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN',56,ejeY+40,{ width: 241,align: 'center' });
      doc.lineWidth(0.5).rect(297, ejeY, 241, 112).fillAndStroke('white', 'black').font('Helvetica').fillColor('black').fontSize(6).text('SOLICITA',297,ejeY+10,{ width: 241,align: 'center' });
      doc.moveTo(343, ejeY+77 ).lineTo(499, ejeY + 77).stroke();
      doc.font('Helvetica-Bold').text(nombreJefeArea.toUpperCase(),297,ejeY+85,{width:241,align:'center'}).font('Helvetica').text(`JEFE DEL ${area.toUpperCase()}`,297,ejeY+95,{align:'center', width:241}); 
      doc.lineWidth(0.5).rect(56,ejeY+85,241,113).fillAndStroke('white','black');
      doc.fillColor('black').text('AUTORIZA',56,ejeY+95,{width:241, align:'center'});
      doc.moveTo(97, ejeY+170 ).lineTo(255, ejeY + 170).stroke();
      doc.font('Helvetica-Bold').fillColor('black').text('MTRA. ANET POPOCATL SANDOVAL',56,ejeY+175,{width:241, align:'center'}).font('Helvetica').text('DIRECTOR DE ADMINISTRACION Y FINANZAS',56,ejeY+183,{width:241, align:'center'});
      doc.lineWidth(0.5).rect(297,ejeY+112,241,127).fillAndStroke('white','black');
      doc.fillColor('black').text('Vo. Bo.',297,ejeY+122,{width:241, align:'center'});
      doc.moveTo(325, ejeY+205).lineTo(523, ejeY + 205).stroke();
      doc.font('Helvetica-Bold').fillColor('black').text(nombreVoBo.toUpperCase(),297,ejeY+210,{width:241, align:'center'}).font('Helvetica').text('JEFE DEL DEPARTAMENTO DE ADQUISISCIONES',297,ejeY+218,{width:241, align:'center'});
      doc.lineWidth(0.5).rect(56,ejeY+198,241,41).fillAndStroke('white','black');
      doc.fillColor('black').text('LAPSO EN QUE SE CONSUMIRÁ:',56,ejeY+208,{width:241, align:'center'});
      doc.text(`ELABORÓ: ${nombreElaboro.toUpperCase()}`,56,ejeY+250,{width:241, align:'left'});
    }

    function piePaginaHorizontal(doc:PDFKit.PDFDocument,ejeY:number){
      doc.font('Helvetica-Bold').text('JUSTIFICACIÓN Y OBSERVACIONES:',56,ejeY,{width:738,align:'left'}); 
      doc.lineWidth(0.5).rect(56, ejeY+10, 738, 57).fillAndStroke('white', 'black');
      doc.lineWidth(0.5).rect(56, ejeY+77, 246, 83).fillAndStroke('white', 'black');
      doc.font('Helvetica-Bold').fillColor('black').text('SOLICITA',56,ejeY+82,{width:246,align:'center'}); 
      doc.moveTo(70, ejeY+133 ).lineTo(288, ejeY + 133).stroke();
      doc.lineWidth(0.5).rect(302, ejeY+77, 246, 83).fillAndStroke('white', 'black');
      doc.font('Helvetica-Bold').fillColor('black').text(nombreJefeArea.toUpperCase(),56,ejeY+140,{width:246,align:'center'}); 
      doc.font('Helvetica').fillColor('black').text(`JEFE DEL ${area.toUpperCase()}`,56,ejeY+147,{width:246,align:'center'}); 
      doc.font('Helvetica-Bold').fillColor('black').text('AUTORIZA',302,ejeY+82,{width:246,align:'center'}); 
      doc.moveTo(316, ejeY+133 ).lineTo(534, ejeY + 133).stroke();
      doc.font('Helvetica-Bold').fillColor('black').text('MTRA. ANET POPOCATL SANDOVAL',302,ejeY+140,{width:246,align:'center'}); 
      doc.font('Helvetica').fillColor('black').text('DIRECTOR DE ADMINISTRACION Y FINANZAS ',302,ejeY+147,{width:246,align:'center'}); 
      doc.lineWidth(0.5).rect(548, ejeY+77, 246, 83).fillAndStroke('white', 'black');
      doc.font('Helvetica-Bold').fillColor('black').text('Vo. Bo.',548,ejeY+82,{width:246,align:'center'}); 
      doc.moveTo(562, ejeY+133 ).lineTo(780, ejeY + 133).stroke();
      doc.font('Helvetica-Bold').fillColor('black').text(nombreVoBo.toUpperCase(),548,ejeY+140,{width:246,align:'center'}); 
      doc.font('Helvetica').fillColor('black').text('JEFE DEL DEPARTAMENTO DE ADQUISISCIONES',548,ejeY+147,{width:246,align:'center'}); 
      doc.font('Helvetica').fillColor('black').text(`ELABORÓ: ${nombreElaboro.toUpperCase()}`,56,ejeY+175,{width:246,align:'left'}); 
    }

      //INICIA CONSULTAS DE DATOS
      //obten los productos segun el techo presupuesto segun el mes actual y el area
      const mesActual = (new Date().getMonth() + 1).toString();//obtenemos el mes +1 porque inicia en 0
      const productos = await promette.rl_producto_requisicion.findAll({
        where: {ct_area_id: ct_area_id, mes: mesActual},
        include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto", 
          include: [{
            model: promette.ct_unidad_medida,
            as: "ct_unidad", 
          },
          {
            model: promette.ct_partida,
            as: "ct_partida", 
          },
        ],
        },
        {
          model: promette.dt_techo_presupuesto,
          as: "dt_techo", 
          include: [
            {
              model: promette.ct_financiamiento,
              as: "ct_financiamiento",
              attributes: ["nombre_financiamiento"]
            },
          ]
        },
      ]
      });
      const idProyecto = await promette.dt_proyecto_anual.findOne({
        where: { dt_techo_id : productos[0].dt_techo.id_techo},
      });

      if (!productos || productos.length === 0) {
        console.log("No se encontraron productos para el proyecto especificado.");
        res.status(200).json({
          msg: "No se encontraron productos.",
        });
        return;
      }
      //verificar el jefe por area
    const puesto = await promette.ct_puesto.findOne({
      where: { ct_area_id: ct_area_id, nombre_puesto: {
        [Op.like]: '%JEFE(A)%'
        }
      },
    });

    const jefeArea = await promette.rl_usuario_puesto.findOne({
      where: {ct_puesto_id: puesto.id_puesto},
      include: [
        {
          model:promette.ct_usuario,
          as: "ct_usuario",
        }
      ]
    });

    const jefeAdquisiciones = await promette.rl_usuario_puesto.findOne({
      where: {ct_puesto_id: 1807},
      include: [
        {
          model:promette.ct_usuario,
          as: "ct_usuario",
        }
      ]
    });
    
    //estraer datos del jefe
    //JEFE
    const curpJefe = jefeArea?.ct_usuario?.curp;
    let nombreJefeArea = jefeArea?.ct_usuario?.nombre_usuario || "Desconocido";
    if (curpJefe && token) {
      const nombreDesdeRupeet = await obtenerNombreRupeet(curpJefe, token);
      if (nombreDesdeRupeet) {
        nombreJefeArea = nombreDesdeRupeet;
      }
    }

    //ELABORÓ
    let nombreElaboro = curp || "Desconocido";
    if (curp && token) {
      const nombreDesdeRupeet = await obtenerNombreRupeet(curp, token);
      if (nombreDesdeRupeet) {
        nombreElaboro = nombreDesdeRupeet;
      }
    }

    //VoBo
    //JEFA DEL DEPARTAMENTO DE ADQUISISCIONES
    let curpVoBo = jefeAdquisiciones.ct_usuario.curp || "Desconocido";
    let nombreVoBo = jefeAdquisiciones?.ct_usuario?.nombre_usuario || "Desconocido";
    if (curpVoBo && token) {
      const nombreDesdeRupeet = await obtenerNombreRupeet(curpVoBo, token);
      if (nombreDesdeRupeet) {
        nombreVoBo = nombreDesdeRupeet;
      }
    }
    //OBTENER LA CLAVE DE AREA
    const areaFin = await promette.rl_area_financiero.findOne({
      where: { id_area_fin: ct_area_id },
      atributes: ["id_financiero"]
    });

    const verticales: MaterialVertical[] = [];
    const horizontales: MaterialHorizontal[] = [];

    productos.forEach((producto: any) => {
      const partida = Number(producto.dataValues.ct_producto.ct_partida.clave_partida);
      if (partida < 30000) {
        verticales.push({
          unidad: producto.dataValues.ct_producto.ct_unidad.nombre_unidad,
          solicitada: producto.dataValues.cantidad,
          autorizada: "",
          claveArea: areaFin.id_financiero.toString(),
          partida: producto.dataValues.ct_producto.ct_partida.clave_partida,
          descripcion: producto.dataValues.ct_producto.nombre_producto,
          importe: producto.dataValues.total,
          financiamiento: producto.dataValues.dt_techo.ct_financiamiento.nombre_financiamiento 
        });
      } else {
        horizontales.push({
          programa: idProyecto.id_proyecto_anual.toString(),
          detalle: producto.dataValues.ct_producto.nombre_producto,
          claveArea: areaFin.id_financiero.toString(),
          partida: producto.dataValues.ct_producto.ct_partida.clave_partida,
          medida: producto.dataValues.ct_producto.ct_unidad.nombre_unidad,
          solicitada: producto.dataValues.cantidad,
          autorizada: "",
          importe: producto.dataValues.total,
          financiamiento: producto.dataValues.dt_techo.ct_financiamiento.nombre_financiamiento 
        });
        
      }
    });

    // Ordenar verticales por partida (asegurando que partida es string numérica)
    verticales.sort((a: MaterialVertical, b: MaterialVertical) => {
      return parseInt(a.partida) - parseInt(b.partida);
    });

    // Ordenar horizontales por partida
    horizontales.sort((a: MaterialHorizontal, b: MaterialHorizontal) => {
      return parseInt(a.partida) - parseInt(b.partida);
    });

    //agrupar por partida segun sea el caso
    const groupedVertical = agruparPorPartidaYFinanciamiento(verticales);
    const groupedHorizontal = agruparPorPartidaYFinanciamiento(horizontales);

    const doc = new PDFDocument({ autoFirstPage: false , margins: {top: 0,bottom: 0,left: 0,right: 0,}});

    //Contador de paginas
    let pageCount = 0;
        doc.on('pageAdded', () => {
        pageCount++;
    });
    //const grouped = agruparPorPartida(material);
    //TABLA
    const startX = 56;
    const startY = 230; 
    //DEIFNIR ALTURA PARA TABLA VERTICAL
    const pageHeight = 760; // Altura máxima de la página antes de agregar un pie de página y nueva página
    const rowHeight = 25; // Define el grosor de las filas
    const colWidths = [57,42,43,57,57,170,56]; // Define el espacio de las celdas

    //DEFINIR ALTURA PARA TABLA HORIZONTAL
    const pageHeightH = 500; // Altura máxima de la página antes de agregar un pie de página y nueva página
    const rowHeightH = 30; // Define el grosor de las filas
    const colWidthsH = [85,200,85,85,85,56,57,85]; // Define el espacio de las celdas
    // Dibuja partidas verticales
    Object.entries(groupedVertical).forEach(([key, rows], index) => {
      const [partida, financiamiento] = key.split('-');
      doc.addPage(); // portrait
      encabezadoVertical(doc, pageCount,financiamiento);
      encabezadoTablaVerical(doc);

      let y = startY;
      rows.forEach(row => {
        if (y + rowHeight > pageHeight) {
          doc.addPage();
          encabezadoVertical(doc, pageCount,financiamiento);
          encabezadoTablaVerical(doc);
          y = startY;
        }

        let x = startX;
        const columnas = [
          row.unidad,
          row.solicitada,
          row.autorizada,
          row.claveArea,
          row.partida,
          row.descripcion,
          row.importe
        ];

        columnas.forEach((text, colIndex) => {
          doc.rect(x, y, colWidths[colIndex], rowHeight).stroke();
          doc.fontSize(6).font('Helvetica').text(text, x, y + 7, { width: colWidths[colIndex], align: 'center' });
          x += colWidths[colIndex];
        });

        y += rowHeight;
      });

      if (pageHeight - y < 250) {
        doc.addPage();
        encabezadoVertical(doc, pageCount,financiamiento);
        y = 195;
      }

      piePaginaVertical(doc, y);
    });

    // Dibuja partidas horizontales
    Object.entries(groupedHorizontal).forEach(([key, rows], index) => {
      const [partida, financiamiento] = key.split('-');
      doc.addPage({ size: 'A4', layout: 'landscape' });
      encabezadoHorizontal(doc, pageCount, financiamiento);
      encabezadoTablaHorizontal(doc);

      let y = startY;
      rows.forEach(row => {
        if (y + rowHeightH > pageHeightH) {
          doc.addPage({ size: 'A4', layout: 'landscape' });
          encabezadoHorizontal(doc, pageCount,financiamiento);
          encabezadoTablaHorizontal(doc);
          y = startY;
        }

        let x = startX;
        const columnas = [
          row.programa,
          row.detalle,
          row.claveArea,
          row.partida,
          row.medida,
          row.solicitada,
          row.autorizada,
          row.importe
        ];

        columnas.forEach((text, colIndex) => {
          doc.rect(x, y, colWidthsH[colIndex], rowHeightH).stroke();
          doc.fontSize(6).font('Helvetica').text(text, x, y + 7, { width: colWidthsH[colIndex], align: 'center' });
          x += colWidthsH[colIndex];
        });

        y += rowHeightH;
      });

      if (pageHeightH - y < 180) {
        doc.addPage({ size: 'A4', layout: 'landscape' });
        encabezadoHorizontal(doc, pageCount,financiamiento);
        y = 190;
      }

      piePaginaHorizontal(doc, y + 10);
    });

    // Pipe el documento directamente a la respuesta
    doc.pipe(res);
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

async function obtenerNombreRupeet(curp: string, token: string): Promise<string | null> {
  try {
    const rupeetApiUrl = `${process.env.RUPEET_API}/users/details`;
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(rupeetApiUrl, { curp }, config);
    const datos = response.data?.usuario?.informacion_rupeet?.datos_personales;

    if (datos) {
      const nombre = datos.nombre || "";
      const apellidoPaterno = datos.apellido_paterno || "";
      const apellidoMaterno = datos.apellido_materno || "";
      const fullName = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();
      return fullName || null;
    }
    return null;
  } catch (error) {
    console.error(
      `Error al consultar RUPEET para CURP ${curp}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

