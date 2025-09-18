import { Request, Response } from "express";
import { sequelize } from "../../config/database";
import { Op } from "sequelize";
import path from 'path';
import axios from "axios";
import { promette } from '../../models/database.models';
const PDFDocument = require("pdfkit"); //pdfkit para generar PDF
const fondoPath1 = path.resolve(__dirname, '../../public/dictamenEscalafon1.jpg'); //obetener la ruta del fondo de la hoja
const fondoPath2 = path.resolve(__dirname, '../../public/dictamenEscalafon2.jpg'); //obetener la ruta del fondo de la hoja
const fs = require('fs');


export const generarDictamenEscalafon = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("generando dictamen")
    const { id_dictamen_escalafon,curp} = req.body;
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

    const doc = new PDFDocument({margins: {top: 0,bottom: 0,left: 0,right: 0,}, size: "A4"});
    //fondo hoja 1
    doc.image(fondoPath1, 0, 0, {
      width: 595.28,
    height: 841.89
    });

    
    //consultar a rupet para el pdf
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    console.log("DICTAMEN: ",id_dictamen_escalafon)
    console.log("curp: ",curp)
    const rupeetApiUrl = `${process.env.RUPEET_API}/escalafon/ver/`;
   // console.log(`RUTAAA: ${rupeetApiUrl}${id_dictamen_escalafon}`);
    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
    
    const PDF = await axios.get(`${rupeetApiUrl}${id_dictamen_escalafon}`, config);
    console.log("PDF",PDF.data)
    doc.fontSize(10).text(PDF.data.dictamen.folio_dictamen, 410, 140, {
      width: 90,
      align: "center"
    });
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();
    const anio = fecha.getFullYear().toString().slice(2,4);

    doc.fontSize(10).text(dia, 503, 150, {
      width: 26,
      align: "center"
    });
    doc.fontSize(10).text(mes, 529, 150, {
      width: 22,
      align: "center"
    });
    doc.fontSize(10).text(anio, 551, 150, {
      width: 25,
      align: "center"
    });

    const personal = await axios.post(`${process.env.RUPEET_API}/users/details`, { curp }, config);
    console.log("personal: ",personal.data)
    const nombre = await axios.get(`${process.env.RUPEET_API}/users/name/${personal.data.usuario.id_usuario} ` , config);
    doc.fontSize(10).text("NIVEL EDUCATIVO", 135, 135, {
      width: 240,
      align: "left"
    });
    doc.fontSize(10).text(personal.data.usuario.curp.slice(8,10), 255, 211, {
      width: 30,
      align: "center"
    });
    doc.fontSize(10).text(personal.data.usuario.curp.slice(6,8), 285, 211, {
      width: 30,
      align: "center"
    });
    doc.fontSize(10).text(personal.data.usuario.curp.slice(4,6), 315, 211, {
      width: 30,
      align: "center"
    });
    doc.fontSize(10).text(personal.data.usuario.curp, 380, 211, {
      width: 200,
      align: "center"
    });
    doc.fontSize(10).text(nombre.data.apellido_paterno, 130, 171, {
      width: 140,
      align: "center"
    });
    doc.fontSize(10).text(nombre.data.apellido_materno, 270, 171, {
      width: 140,
      align: "center"
    });
    doc.fontSize(10).text(nombre.data.nombre, 410, 171, {
      width: 170,
      align: "center"
    });

    doc.fontSize(10).text("RFC", 47, 211, {
      width: 163,
      align: "center"
    });
    doc.fontSize(10).text("X", 105, 250, {
      width: 25,
      align: "center"
    });
    doc.fontSize(10).text("X", 225, 250, {
      width: 15,
      align: "center"
    });
    doc.fontSize(10).text("X", 315, 250, {
      width: 15,
      align: "center"
    });
    //SEXO
    doc.fontSize(10).text("X", 458, 250, {
      width: 15,
      align: "center"
    });
    doc.fontSize(10).text("X", 533, 250, {
      width: 15,
      align: "center"
    });

    doc.fontSize(10).text("LUGAR NACIMIENTO", 397, 272, {
      width: 200,
      align: "left"
    });

    //DOMICILIO
    doc.fontSize(10).text("CALLE", 170, 300, {
      width: 190,
      align: "center"
    });
    doc.fontSize(10).text("NO INT", 360, 300, {
      width: 100,
      align: "center"
    });
    doc.fontSize(10).text("NO EXT", 470, 300, {
      width: 100,
      align: "center"
    });

    doc.fontSize(10).text("COLONIA", 45, 335, {
      width: 175,
      align: "center"
    });
    doc.fontSize(10).text("LOCALIDAD", 360, 335, {
      width: 220,
      align: "center"
    });
    doc.fontSize(10).text("MUNICIPIO", 45, 368, {
      width: 240,
      align: "center"
    });
    doc.fontSize(10).text("ENTIDAD", 345, 368, {
      width: 230,
      align: "center"
    });

    //CLAVE
    doc.fontSize(10).text("CLAVE", 45, 432, {
      width: 235,
      align: "center"
    });
    doc.fontSize(10).text("NOM", 300, 432, {
      width: 75,
      align: "center"
    });
    doc.fontSize(10).text("ESPECIALIDAD", 392, 432, {
      width: 183,
      align: "center"
    });
    doc.fontSize(10).text("NOMBRE CCT", 45, 485, {
      width: 175,
      align: "center"
    });
    doc.fontSize(10).text("DOMICILIO CCT", 253, 485, {
      width: 327,
      align: "center"
    });

    //DOCUMENTACION ACADEMICA
    let inicio = 555;
    for(var i = 0 ; i<2;i++){
    doc.fontSize(10).text("TIPO"+i, 33, inicio, {
        width: 135,
        align: "left"
      });
      doc.fontSize(10).text("FOLIO", 168, inicio, {
        width: 90,
        align: "left"
      });
      doc.fontSize(10).text("INSTITUCION", 258, inicio, {
        width: 125,
        align: "left"
      });
      doc.fontSize(10).text("CARRERA", 383, inicio, {
        width: 152,
        align: "left"
      });
      doc.fontSize(10).text("100", 535, inicio, {
        width: 50,
        align: "left"
      });
      inicio+=15;
    }

    let inicioCursos = 630;
    for(let i = 0 ; i<9;i++){
    doc.fontSize(10).text("CURSO"+i, 33, inicioCursos, {
        width: 252,
        align: "left"
      });
      doc.fontSize(10).text("IMPARTIDO", 290, inicioCursos, {
        width: 190,
        align: "left"
      });
      doc.fontSize(10).text("20", 480, inicioCursos, {
        width: 25,
        align: "center"
      });
      doc.fontSize(10).text("30", 505, inicioCursos, {
        width: 25,
        align: "center"
      });
      doc.fontSize(10).text("40", 530, inicioCursos, {
        width: 22,
        align: "center"
      });
      doc.fontSize(10).text("50", 550, inicioCursos, {
        width: 30,
        align: "center"
      });
      inicioCursos+=15;
    }
    doc.fontSize(10).text("000", 550, inicioCursos-3, {
      width: 30,
      align: "center"
    });

    doc.addPage();
    //fondo hoja 2
    doc.image(fondoPath2, 0, 0, {
      width: 595.28,
    height: 841.89
    });
    let inicioCreditos = 105;
    for(let i = 0 ; i<5;i++){
    doc.fontSize(10).text("AÑO", 50, inicioCreditos, {
      width: 30,
      align: "left"
    });
    doc.fontSize(10).text("50", 120, inicioCreditos, {
      width: 30,
      align: "center"
    });
    doc.fontSize(10).text("60", 160, inicioCreditos, {
      width: 40,
      align: "center"
    });
    doc.fontSize(10).text("70", 195, inicioCreditos, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("80", 230, inicioCreditos, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("90", 265, inicioCreditos, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("95", 300, inicioCreditos, {
      width: 40,
      align: "center"
    });
    doc.fontSize(10).text("000", 340, inicioCreditos, {
      width: 60,
      align: "center"
    });
    doc.fontSize(10).text("XX", 415, inicioCreditos, {
      width: 50,
      align: "center"
    });
    doc.fontSize(10).text("YY", 465, inicioCreditos, {
      width: 70,
      align: "center"
    });
    doc.fontSize(10).text("ZZ", 535, inicioCreditos, {
      width: 40,
      align: "center"
    });
    inicioCreditos+=15
  }
  doc.fontSize(10).text("000", 535, inicioCreditos-3, {
      width: 40,
      align: "center"
    });

//ANTIGUEDAD
    doc.fontSize(10).text("DD", 70, 263, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("MM", 105, 263, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("AA", 140, 263, {
      width: 35,
      align: "center"
    });
    //inicio
    doc.fontSize(10).text("QQ", 195, 263, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("EE", 230, 263, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("RR", 265, 263, {
      width: 35,
      align: "center"
    });
    //fin
    doc.fontSize(10).text("QQ", 325, 263, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("EE", 360, 263, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("RR", 395, 263, {
      width: 35,
      align: "center"
    });
    //valor
    doc.fontSize(10).text("QQ", 445, 263, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("EE", 480, 263, {
      width: 35,
      align: "center"
    });
    doc.fontSize(10).text("RR", 515, 263, {
      width: 35,
      align: "center"
    });


    let inicioAntecedentes = 355;
    for(let i = 0 ; i<2;i++){
    doc.fontSize(10).text("QQ", 50, inicioAntecedentes, {
      width: 70,
      align: "center"
    });
    doc.fontSize(10).text("EE", 120, inicioAntecedentes, {
      width: 55,
      align: "center"
    });
    doc.fontSize(10).text("RR", 175, inicioAntecedentes, {
      width: 125,
      align: "center"
    });
    doc.fontSize(10).text("TT", 300, inicioAntecedentes, {
      width: 43,
      align: "center"
    });
    doc.fontSize(10).text("RR", 343, inicioAntecedentes, {
      width: 37,
      align: "center"
    });
    doc.fontSize(10).text("QQ", 380, inicioAntecedentes, {
      width: 33,
      align: "center"
    });
    doc.fontSize(10).text("YY", 413, inicioAntecedentes, {
      width: 87,
      align: "center"
    });
    doc.fontSize(10).text("UU", 500, inicioAntecedentes, {
      width: 73,
      align: "center"
    });
    inicioAntecedentes+=20;
  }
    doc.fontSize(10).text("NOMBRE", 343, 423, {
      width: 232,
      align: "left"
    });
    doc.fontSize(10).text("LUGAR", 385, 470, {
      width: 232,
      align: "left"
    });

    // Pipe el documento directamente a la respuesta
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({
      success: false,
      msg: "Error al generar el PDF: " + error,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
