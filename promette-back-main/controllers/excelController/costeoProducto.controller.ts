import { Request, Response } from "express";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import Decimal from "decimal.js";
import { getModels } from "../../models/modelsPromette";
import axios from "axios";

export const generarCosteoGeneralExcel = async (
  req: Request,
  res: Response
) => {
  try {
    const promette = await getModels(process.env.DBNAMES || "");
    if (!promette) {
      return res.status(500).json({ msg: "No se pudieron cargar los modelos" });
    }
    const { id_area_fin, id_financiamiento, id_usuario } = req.body;
    let id_areas: number[] = [];
    let todosLosFinanciamientos: boolean = false;

    // Si no se recibe ningún parámetro, obtener todas las áreas y todos los financiamientos
    if (!id_area_fin && !id_financiamiento) {
      const todasAreas = await promette.rl_area_financiero.findAll();
      id_areas = todasAreas.map((a: any) => a.id_area_fin);
      todosLosFinanciamientos = true;
    } else {
      id_areas = Array.isArray(id_area_fin) ? id_area_fin : [id_area_fin];
    }

    // --- NUEVA LÓGICA DE AGRUPACIÓN ---
    if (!id_financiamiento && !id_area_fin) {
      // Techos de esa área
      let techos: any[] = [];
      techos = await promette.dt_techo_presupuesto.findAll({
        where: {},
      });
      if(techos.length === 0) {
        res.status(200).json({
          msg: "No hay techos disponibles para esta área.",
        });
        return;
      }
      const techoIds = techos.map((t: any) => t.id_techo);
      // Requisiciones
      const requisiciones = await promette.rl_producto_requisicion.findAll({
        where: { dt_techo_id: techoIds },
        include: [
          {
            model: promette.ct_producto_consumible,
            as: "ct_producto",
            include: [
              {
                model: promette.ct_partida,
                as: "ct_partida",
                include: [
                  {
                    model: promette.ct_capitulo,
                    as: "ct_capitulo",
                  },
                ],
              },
              {
                model: promette.ct_unidad_medida,
                as: "ct_unidad",
              },
            ],
          },
        ],
        order: [
          [
            { model: promette.ct_producto_consumible, as: "ct_producto" },
            { model: promette.ct_partida, as: "ct_partida" },
            { model: promette.ct_capitulo, as: "ct_capitulo" },
            "clave_capitulo",
            "ASC",
          ],
          [
            { model: promette.ct_producto_consumible, as: "ct_producto" },
            { model: promette.ct_partida, as: "ct_partida" },
            "clave_partida",
            "ASC",
          ],
          [
            { model: promette.ct_producto_consumible, as: "ct_producto" },
            "nombre_producto",
            "ASC",
          ],
        ],
      });
      if(requisiciones.length === 0) {
        res.status(200).json({
          msg: "No hay requisiciones disponibles para esta área.",
        });
        return;
      }
      const mesesMap = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ];
      // Agrupar por capítulo y producto
      const productosPorCapitulo: Record<string, any[]> = {};
      for (const req of requisiciones) {
        const prod = req.ct_producto;
        const capitulo = prod?.ct_partida?.ct_capitulo;
        if (!capitulo) continue;
        const capKey = `${capitulo.clave_capitulo} - ${capitulo.nombre_capitulo}`;
        if (!productosPorCapitulo[capKey]) productosPorCapitulo[capKey] = [];
        let producto = productosPorCapitulo[capKey].find(
          (p: any) => p.id_producto === prod.id_producto && p.Unidad_de_medida === (prod.ct_unidad?.nombre_unidad || "")
        );
        if (!producto) {
          producto = {
            id_producto: prod.id_producto,
            nombre_del_producto: prod.nombre_producto,
            Unidad_de_medida: prod.ct_unidad?.nombre_unidad || "",
            Precio_unitario: new Decimal(prod.precio || 0),
            Partida: prod.ct_partida?.clave_partida || "",
            nombre_partida: prod.ct_partida?.nombre_partida || "",
            Cantidad_Anual: new Decimal(0),
            Importe_Anual: new Decimal(0),
            cantidadesPorMes: Array(12).fill(new Decimal(0)),
          };
          productosPorCapitulo[capKey].push(producto);
        }
        // Sumar cantidades por mes
        const mesIdx = parseInt(req.mes, 10) - 1;
        const cantidad = new Decimal(req.cantidad || 0);
        if (mesIdx >= 0 && mesIdx < 12) {
          producto.cantidadesPorMes[mesIdx] = producto.cantidadesPorMes[mesIdx].plus(cantidad);
        }
        producto.Cantidad_Anual = producto.Cantidad_Anual.plus(cantidad);
      }
      // Calcular importe anual
      for (const capKey in productosPorCapitulo) {
        for (const prod of productosPorCapitulo[capKey]) {
          prod.Importe_Anual = prod.Cantidad_Anual.mul(prod.Precio_unitario);
        }
      }
      // Generar Excel, una hoja por capítulo
      const workbook = new ExcelJS.Workbook();
      const pathImagen = path.resolve(__dirname, "../../public/USET.png");
      const bufferImagen = fs.existsSync(pathImagen)
        ? fs.readFileSync(pathImagen)
        : undefined;
      if (bufferImagen) {
        const idImagen = workbook.addImage({ buffer: bufferImagen, extension: "png" });
      }
      const anoActual = new Date().getFullYear();
      for (const capKey in productosPorCapitulo) {
        const worksheet = workbook.addWorksheet(capKey.substring(0, 31));
        if (bufferImagen) {
          worksheet.addImage(workbook.addImage({ buffer: bufferImagen, extension: 'png' }), { tl: { col: 0, row: 0 }, ext: { width: 490, height: 70 } });
        }
        worksheet.mergeCells("A2:Z2");
        worksheet.getCell("A2").value = "Unidad de Servicios Educativos del Estado de Tlaxcala";
        worksheet.getCell("A2").font = { bold: true };
        worksheet.getCell("A2").alignment = { horizontal: "center" };
        worksheet.mergeCells("A3:Z3");
        worksheet.getCell("A3").value = "Dirección de Administracion y Finanzas";
        worksheet.getCell("A3").font = { bold: true };
        worksheet.getCell("A3").alignment = { horizontal: "center" };
        worksheet.addRow([]);
        worksheet.mergeCells("A5:Z5");
        worksheet.getCell("A5").value = `Elaboracion de Anteproyecto de Presupuesto ${anoActual}`;
        worksheet.getCell("A5").font = { bold: true };
        worksheet.getCell("A5").alignment = { horizontal: "center" };
        worksheet.mergeCells("A6:Z6");
        worksheet.getCell("A6").value = "Formato de Costeo por Articulo";
        worksheet.getCell("A6").font = { bold: true };
        worksheet.getCell("A6").alignment = { horizontal: "center" };
        worksheet.addRow([]);
        // Encabezados
        worksheet.getCell("A8").value = "Nombre del Producto";
        worksheet.getCell("B8").value = "Unidad de Medida";
        worksheet.getCell("C8").value = "Precio Unitario";
        worksheet.getCell("D8").value = "Partida";
        worksheet.getCell("E8").value = "Nombre Partida";
        let col = 6;
        mesesMap.forEach((mes, idx) => {
          worksheet.getCell(8, col + idx).value = mes;
        });
        worksheet.getCell("Q8").value = "Cantidad Anual";
        worksheet.getCell("R8").value = "Importe Anual";
        // Cambiar ancho de columna A
        worksheet.getColumn('A').width = 40;
        // Llenar datos
        let fila = 9;
        for (const prod of productosPorCapitulo[capKey]) {
          worksheet.getCell(`A${fila}`).value = prod.nombre_del_producto;
          worksheet.getCell(`B${fila}`).value = prod.Unidad_de_medida;
          worksheet.getCell(`C${fila}`).value = Number(prod.Precio_unitario);
          worksheet.getCell(`D${fila}`).value = prod.Partida;
          worksheet.getCell(`E${fila}`).value = prod.nombre_partida;
          for (let i = 0; i < 12; i++) {
            worksheet.getCell(fila, 6 + i).value = Number(prod.cantidadesPorMes[i]);
          }
          worksheet.getCell(`Q${fila}`).value = Number(prod.Cantidad_Anual);
          worksheet.getCell(`R${fila}`).value = Number(prod.Importe_Anual);
          fila++;
        }
      }
      const nombreArchivo = `FORMATO_COSTEO_GENERAL_${anoActual}.xlsx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${nombreArchivo}`
      );
      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    interface CapituloFinanciamiento {
      capitulo: string;
      partidas: Record<string, any[]>;
      total_capitulo?: any;
    }

    type ResultadoCosteo = Record<string, Record<string, CapituloFinanciamiento>>;

    const resultado: ResultadoCosteo = {};

    // Mapea todos los financiamientos
    const financiamientosDB = await promette.ct_financiamiento.findAll();
    const financiamientoMap = new Map<number, string>();
    for (const f of financiamientosDB) {
      financiamientoMap.set(f.id_financiamiento, f.nombre_financiamiento);
    }

    // Si se requieren todos los financiamientos, procesar todos
    let financiamientosAProcesar: number[] = [];
    if (todosLosFinanciamientos) {
      financiamientosAProcesar = financiamientosDB.map(f => f.id_financiamiento);
    } else if (id_financiamiento) {
      financiamientosAProcesar = [id_financiamiento];
    }

    // Áreas financieras y mapa
    const areasFinancieras = await promette.rl_area_financiero.findAll({
      where: { id_area_fin: id_areas }
    });
    if(areasFinancieras.length === 0) {
      //console.log("No se encontró área financiera con id:", id_area_fin);
      res.status(200).json({
        msg: "No se encontró área del usuario.",
      });
      return;
    }
    const areaFinancieroMap = new Map<number, number>();
    for (const area of areasFinancieras) {
      areaFinancieroMap.set(area.id_area_infra, area.id_financiero);
    }

    // Capítulos
    const capitulosDB = await promette.ct_capitulo.findAll();
    const capitulos: any = {};
    for (const cap of capitulosDB) {
      capitulos[cap.clave_capitulo] = {
        capitulo: `${cap.clave_capitulo} ${cap.nombre_capitulo}`,
        partidas: {},
      };
    }

    // Techos de esa área
    let techos: any[] = [];
    if (todosLosFinanciamientos) {
      techos = await promette.dt_techo_presupuesto.findAll({
        where: { ct_area_id: id_areas }
      });
    } else {
      techos = await promette.dt_techo_presupuesto.findAll({
        where: { ct_area_id: id_areas, ct_financiamiento_id: id_financiamiento }
      });
    }

    if(techos.length === 0) {
     // console.log("No hay techos disponibles para esta área y/o financiamiento:", id_area_fin);
      res.status(200).json({
        msg: "No hay techos disponibles para esta área y/o financiamiento.",
      });
      return;
    }
    const techoIds = techos.map((t: any) => t.id_techo);

    // Requisiciones con include de financiamiento
    const requisiciones = await promette.rl_producto_requisicion.findAll({
      where: { dt_techo_id: techoIds },
      include: [
        {
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          include: [
            {
              model: promette.ct_partida,
              as: "ct_partida",
              include: [
                {
                  model: promette.ct_capitulo,
                  as: "ct_capitulo",
                },
              ],
            },
            {
              model: promette.ct_unidad_medida,
              as: "ct_unidad",
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
            },
            {
              model: promette.rl_area_financiero,
              as: "ct_area",
              attributes: ["id_financiero"],
            }
          ]
        },
      ],
      order: [
        [
          { model: promette.ct_producto_consumible, as: "ct_producto" },
          { model: promette.ct_partida, as: "ct_partida" },
          { model: promette.ct_capitulo, as: "ct_capitulo" },
          "clave_capitulo",
          "ASC",
        ],
        [
          { model: promette.ct_producto_consumible, as: "ct_producto" },
          { model: promette.ct_partida, as: "ct_partida" },
          "clave_partida",
          "ASC",
        ],
        [
          { model: promette.ct_producto_consumible, as: "ct_producto" },
          "nombre_producto",
          "ASC",
        ],
        [
          { model: promette.dt_techo_presupuesto, as: "dt_techo" },
          "ct_area_id",
          "DESC",
        ],
      ],
    });

    if(requisiciones.length === 0) {
      //console.log("No hay requisiciones disponibles para esta área:", id_area_fin);
      res.status(200).json({
        msg: "No hay requisiciones disponibles para esta área.",
      });
      return;
    }

    const mesesMap = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    // Estructura agrupada por capítulo y financiamiento
    //const resultado: any = {};

    for (const req of requisiciones) {
      const prod = req.ct_producto;
      const partida = prod?.ct_partida;
      const capitulo = partida?.ct_capitulo;
      const techo = req.dt_techo;
      if (!capitulo || !partida || !techo) continue;

      const claveCapitulo = capitulo.clave_capitulo;
      const nombreCapitulo = capitulo.nombre_capitulo;

      // Saca financiamiento del include (si no, fallback al mapa por id)
      const financiamientoObj = techo.ct_financiamiento;
      const financiamientoId = financiamientoObj?.id_financiamiento || techo.ct_financiamiento_id;
      const nombreFinanciamiento =
        financiamientoObj?.nombre_financiamiento || financiamientoMap.get(financiamientoId) || "SIN FUENTE";

      // Inicializa estructura si no existe
      if (!resultado[claveCapitulo]) resultado[claveCapitulo] = {};
      if (!resultado[claveCapitulo][nombreFinanciamiento]) {
        resultado[claveCapitulo][nombreFinanciamiento] = {
          capitulo: `${claveCapitulo} - ${nombreCapitulo}`,
          partidas: {},
        };
      }

      // Prepara partida y producto como en tu código original
      const clavePartida = partida.clave_partida;
      const nombrePartida = partida.nombre_partida;
      const areaId = (techo as any)?.ct_area?.id_financiero;

      if (!resultado[claveCapitulo][nombreFinanciamiento].partidas[clavePartida]) {
        resultado[claveCapitulo][nombreFinanciamiento].partidas[clavePartida] = [];
      }

      let producto = resultado[claveCapitulo][nombreFinanciamiento].partidas[clavePartida].find(
        (p: any) =>
          p.id_producto === prod.id_producto &&
          p.nombre_del_producto === prod.nombre_producto &&
          p.unidad_administrativa === areaId
      );

      if (!producto) {
        producto = {
          id_producto: prod.id_producto,
          nombre_del_producto: prod.nombre_producto,
          unidad_administrativa: areaId,
          Unidad_de_medida: prod.ct_unidad?.nombre_unidad || "",
          Precio_unitario: new Decimal(prod.precio || 0),
          Partida: clavePartida,
          nombre_partida: nombrePartida,
          Cantidad_Anual: new Decimal(0),
          Importe_Anual: new Decimal(0),
        };
        mesesMap.forEach((mes) => {
          producto[`${mes}_importe`] = new Decimal(0);
          producto[`${mes}_unidades`] = new Decimal(0);
        });
        resultado[claveCapitulo][nombreFinanciamiento].partidas[clavePartida].push(
          producto
        );
      }

      // Suma importe y unidades al mes correspondiente
      const mesIdx = parseInt(req.mes, 10) - 1;
      if (mesIdx >= 0 && mesIdx < 12) {
        const mes = mesesMap[mesIdx];
        const cantidad = new Decimal(req.cantidad || 0);
        const precioUnitario = new Decimal(prod.precio || 0);
        const importe = cantidad.mul(precioUnitario);
        producto[`${mes}_unidades`] =
          producto[`${mes}_unidades`].plus(cantidad);
        producto[`${mes}_importe`] = producto[`${mes}_importe`].plus(importe);
        producto.Cantidad_Anual = producto.Cantidad_Anual.plus(cantidad);
        producto.Importe_Anual = producto.Importe_Anual.plus(importe);
      }
    }

    // Suma de totales por partida y capítulo (idéntico a tu código)
    for (const capObj of Object.values(resultado)) {
     for (const cap of Object.values(capObj)) {
        const totalCapitulo: any = {
          Total_capitulo: cap.capitulo,
          Cantidad_Anual: new Decimal(0),
          Importe_Anual: new Decimal(0),
        };
        mesesMap.forEach((mes) => {
          totalCapitulo[`Total_${mes}_importe`] = new Decimal(0);
          totalCapitulo[`Total_${mes}_unidades`] = new Decimal(0);
        });

        for (const [clavePartida, productos] of Object.entries(
          (cap as any).partidas
        )) {
          const productosArray = productos as any[];
          const totales: any = {
            Total_partida: `${clavePartida} ${
              productosArray[0]?.nombre_partida || ""
            }`,
            Cantidad_Anual: new Decimal(0),
            Importe_Anual: new Decimal(0),
          };
          mesesMap.forEach((mes) => {
            totales[`Total_${mes}_importe`] = new Decimal(0);
            totales[`Total_${mes}_unidades`] = new Decimal(0);
          });

          for (const prod of productosArray) {
            mesesMap.forEach((mes) => {
              prod[`${mes}_importe`] = new Decimal(prod[`${mes}_importe`]);
              prod[`${mes}_unidades`] = new Decimal(prod[`${mes}_unidades`]);
              totales[`Total_${mes}_importe`] = totales[
                `Total_${mes}_importe`
              ].plus(prod[`${mes}_importe`]);
              totales[`Total_${mes}_unidades`] = totales[
                `Total_${mes}_unidades`
              ].plus(prod[`${mes}_unidades`]);
            });
            prod.Cantidad_Anual = new Decimal(prod.Cantidad_Anual);
            prod.Importe_Anual = new Decimal(prod.Importe_Anual);
            totales.Cantidad_Anual = totales.Cantidad_Anual.plus(
              prod.Cantidad_Anual
            );
            totales.Importe_Anual = totales.Importe_Anual.plus(
              prod.Importe_Anual
            );
          }
          mesesMap.forEach((mes) => {
            totales[`Total_${mes}_importe`] = Number(
              totales[`Total_${mes}_importe`]
            );
            totales[`Total_${mes}_unidades`] = Number(
              totales[`Total_${mes}_unidades`]
            );
          });
          totales.Cantidad_Anual = Number(totales.Cantidad_Anual);
          totales.Importe_Anual = Number(totales.Importe_Anual);
          productosArray.forEach((prod: any) => {
            mesesMap.forEach((mes) => {
              prod[`${mes}_importe`] = Number(prod[`${mes}_importe`]);
              prod[`${mes}_unidades`] = Number(prod[`${mes}_unidades`]);
            });
            prod.Cantidad_Anual = Number(prod.Cantidad_Anual);
            prod.Importe_Anual = Number(prod.Importe_Anual);
            prod.Precio_unitario = Number(prod.Precio_unitario);
          });
          productosArray.push(totales);

          // Suma al total de capítulo
          totalCapitulo.Cantidad_Anual = totalCapitulo.Cantidad_Anual.plus(
            totales.Cantidad_Anual
          );
          totalCapitulo.Importe_Anual = totalCapitulo.Importe_Anual.plus(
            totales.Importe_Anual
          );
          mesesMap.forEach((mes) => {
            totalCapitulo[`Total_${mes}_importe`] = totalCapitulo[
              `Total_${mes}_importe`
            ].plus(totales[`Total_${mes}_importe`]);
            totalCapitulo[`Total_${mes}_unidades`] = totalCapitulo[
              `Total_${mes}_unidades`
            ].plus(totales[`Total_${mes}_unidades`]);
          });
        }
        // Convertir a number para el Excel
        mesesMap.forEach((mes) => {
          totalCapitulo[`Total_${mes}_importe`] = Number(
            totalCapitulo[`Total_${mes}_importe`]
          );
          totalCapitulo[`Total_${mes}_unidades`] = Number(
            totalCapitulo[`Total_${mes}_unidades`]
          );
        });
        totalCapitulo.Cantidad_Anual = Number(totalCapitulo.Cantidad_Anual);
        totalCapitulo.Importe_Anual = Number(totalCapitulo.Importe_Anual);

        (cap as any).total_capitulo = totalCapitulo;
      }
    }

    // Excel export (idéntico, solo cambia doble ciclo)
    const workbook = new ExcelJS.Workbook();
    const pathImagen = path.resolve(__dirname, "../../public/USET.png");
    const bufferImagen = fs.existsSync(pathImagen)
      ? fs.readFileSync(pathImagen)
      : undefined;
    const idImagen = bufferImagen
      ? workbook.addImage({ buffer: bufferImagen, extension: "png" })
      : undefined;
    const anoActual = new Date().getFullYear();

    // Doble ciclo: capítulo y financiamiento
    for (const claveCapitulo in resultado) {
      for (const nombreFinanciamiento in resultado[claveCapitulo]) {
        const capituloObj = resultado[claveCapitulo][nombreFinanciamiento];

        // Verifica si hay al menos una partida con productos
        const tieneRegistros = Object.values(capituloObj.partidas).some(
          (productos: any) => Array.isArray(productos) && productos.length > 0
        );
        if (!tieneRegistros) continue;

        // Make worksheet name unique by appending financiamiento
        let nombreHoja = `${capituloObj.capitulo} - ${nombreFinanciamiento}`;
        if (nombreHoja.length > 31) {
          // Excel worksheet names have a 31 character limit
          nombreHoja = nombreHoja.substring(0, 31);
        }

        // Check if worksheet name already exists, and make it unique if needed
        let uniqueName = nombreHoja;
        let counter = 1;
        while (workbook.getWorksheet(uniqueName)) {
          // Leave space for counter suffix
          const baseName = nombreHoja.substring(0, 28);
          uniqueName = `${baseName}_${counter}`;
          counter++;
        }

        const worksheet = workbook.addWorksheet(uniqueName);
        const imagePath = path.resolve(__dirname, '../../public/USET.png');
        const imageBuffer = fs.readFileSync(imagePath);
        const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
        worksheet.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 490, height: 70 } });
        worksheet.mergeCells("A2:AE2");
        worksheet.getCell("A2").value =
          "Unidad de Servicios Educativos del Estado de Tlaxcala";
        worksheet.getCell("A2").font = { bold: true };
        worksheet.getCell("A2").alignment = { horizontal: "center" };
        worksheet.mergeCells("A3:AE3");
        worksheet.getCell("A3").value = "Dirección de Administracion y Finanzas";
        worksheet.getCell("A3").font = { bold: true };
        worksheet.getCell("A3").alignment = { horizontal: "center" };
        worksheet.addRow([]);
        worksheet.mergeCells("A5:AE5");
        worksheet.getCell(
          "A5"
        ).value = `Elaboracion de Anteproyecto de Presupuesto ${anoActual}`;
        worksheet.getCell("A5").font = { bold: true };
        worksheet.getCell("A5").alignment = { horizontal: "center" };
        worksheet.mergeCells("A6:AE6");
        worksheet.getCell("A6").value = "Formato de Costeo por Articulo";
        worksheet.getCell("A6").font = { bold: true };
        worksheet.getCell("A6").alignment = { horizontal: "center" };
        worksheet.mergeCells("A7:AE7");
        worksheet.getCell("A7").value = capituloObj.capitulo;
        worksheet.getCell("A7").font = { bold: true };
        worksheet.getCell("A7").alignment = { horizontal: "center" };
        worksheet.addRow([]);
        worksheet.getCell("A9").value = "Fuente de Financiamiento:";
        worksheet.getCell("A9").font = { bold: true };
        worksheet.getCell("B9").value = nombreFinanciamiento;
        worksheet.getCell("B9").font = { bold: true };

        // Headers
        worksheet.mergeCells("A10:A11");
        worksheet.getColumn("A").width = 45;
        worksheet.getCell("A11").value = "Nombre del Producto";
        worksheet.getCell("A11").alignment = {
          vertical: "middle",
          wrapText: true,
        };
        worksheet.mergeCells("B10:B11");
        worksheet.getColumn("B").width = 20;
        worksheet.getCell("B11").value = "Unidad Administrativa";
        worksheet.getCell("B11").alignment = {
          vertical: "middle",
          wrapText: true,
        };
        worksheet.mergeCells("C10:C11");
        worksheet.getColumn("C").width = 20;
        worksheet.getCell("C11").value = "Unidad de Medida";
        worksheet.getCell("C11").alignment = {
          vertical: "middle",
          wrapText: true,
        };
        worksheet.mergeCells("D10:D11");
        worksheet.getColumn("D").width = 16;
        worksheet.getCell("D11").value = "Precio Unitario";
        worksheet.getCell("D11").alignment = {
          vertical: "middle",
          wrapText: true,
        };
        worksheet.mergeCells("E10:E11");
        worksheet.getColumn("E").width = 11;
        worksheet.getCell("E11").value = "Partida";
        worksheet.getCell("E11").alignment = {
          vertical: "middle",
          wrapText: true,
        };

        const meses = mesesMap;
        const startCol = 6;
        meses.forEach((mes, idx) => {
          const colIdx = startCol + idx * 2;
          worksheet.mergeCells(10, colIdx, 10, colIdx + 1);
          worksheet.getCell(10, colIdx).value = mes;
          worksheet.getCell(10, colIdx).alignment = {
            horizontal: "center",
            vertical: "middle",
          };
          worksheet.getCell(10, colIdx).font = {};
          worksheet.getCell(11, colIdx).value = "Unidades";
          worksheet.getCell(11, colIdx + 1).value = "Importe";
          worksheet.getCell(11, colIdx).alignment = {
            horizontal: "center",
            vertical: "middle",
          };
          worksheet.getCell(11, colIdx + 1).alignment = {
            horizontal: "center",
            vertical: "middle",
          };
          worksheet.getColumn(colIdx).width = 13;
          worksheet.getColumn(colIdx + 1).width = 13;
        });
        worksheet.mergeCells("AD10:AD11");
        worksheet.getColumn("AD").width = 14;
        worksheet.getCell("AD11").value = "Cantidad Anual";
        worksheet.getCell("AD11").alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        worksheet.mergeCells("AE10:AE11");
        worksheet.getColumn("AE").width = 14;
        worksheet.getCell("AE11").value = "Importe Anual";
        worksheet.getCell("AE11").alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        worksheet.autoFilter = { from: "A11", to: "AE11" };
        worksheet.views = [
          {
            state: "frozen",
            xSplit: 5,
            ySplit: 11,
          },
        ];

        // Llenar datos de productos y totales (igual a tu código)
        let fila = 12;
        for (const clavePartida in capituloObj.partidas) {
          const productos = capituloObj.partidas[clavePartida];
          for (const prod of productos) {
            const unidad = prod.Unidad_de_medida?.toLowerCase() || "";
            const esDecimal =
              unidad.includes("litro") ||
              unidad.includes("kilo") ||
              unidad.includes("metro") ||
              unidad.includes("gramo") ||
              unidad.includes("lt") ||
              unidad.includes("kg") ||
              unidad.includes("m3") ||
              unidad.includes("m2") ||
              unidad.includes("ml") ||
              unidad.includes("l") ||
              unidad.includes("g");

            const formatoCantidad = esDecimal ? "#,##0.00" : "#,##0";

            if (prod.Total_partida) {
              worksheet.getCell(
                `A${fila}`
              ).value = `Total de la partida ${prod.Total_partida}`;
              worksheet.getCell(`A${fila}`).font = { bold: true };
              worksheet.getCell(`B${fila}`).value = "";
              worksheet.getCell(`C${fila}`).value = "";
              worksheet.getCell(`D${fila}`).value = "";
              worksheet.getCell(`E${fila}`).value = "";
              let col = startCol;
              meses.forEach((mes) => {
                worksheet.getCell(fila, col).value =
                  prod[`Total_${mes}_unidades`] || 0;
                worksheet.getCell(fila, col).numFmt = formatoCantidad;
                worksheet.getCell(fila, col + 1).value =
                  prod[`Total_${mes}_importe`] || 0;
                worksheet.getCell(fila, col + 1).numFmt = "#,##0.00";
                worksheet.getCell(fila, col).font = { bold: true };
                worksheet.getCell(fila, col + 1).font = { bold: true };
                col += 2;
              });
              worksheet.getCell(`AD${fila}`).value = prod.Cantidad_Anual;
              worksheet.getCell(`AD${fila}`).numFmt = formatoCantidad;
              worksheet.getCell(`AD${fila}`).font = { bold: true };
              worksheet.getCell(`AE${fila}`).value = prod.Importe_Anual;
              worksheet.getCell(`AE${fila}`).numFmt = "#,##0.00";
              worksheet.getCell(`AE${fila}`).font = { bold: true };
            } else {
              worksheet.getCell(`A${fila}`).value = prod.nombre_del_producto;
              worksheet.getCell(`B${fila}`).value = prod.unidad_administrativa;
              worksheet.getCell(`C${fila}`).value = prod.Unidad_de_medida;
              worksheet.getCell(`D${fila}`).value = prod.Precio_unitario;
              worksheet.getCell(`E${fila}`).value = prod.Partida;
              let col = startCol;
              meses.forEach((mes) => {
                worksheet.getCell(fila, col).value = prod[`${mes}_unidades`] || 0;
                worksheet.getCell(fila, col).numFmt = formatoCantidad;
                worksheet.getCell(fila, col + 1).value =
                  prod[`${mes}_importe`] || 0;
                worksheet.getCell(fila, col + 1).numFmt = "#,##0.00";
                col += 2;
              });
              worksheet.getCell(`AD${fila}`).value = prod.Cantidad_Anual;
              worksheet.getCell(`AD${fila}`).numFmt = formatoCantidad;
              worksheet.getCell(`AE${fila}`).value = prod.Importe_Anual;
              worksheet.getCell(`AE${fila}`).numFmt = "#,##0.00";
            }
            fila++;
          }
        }
        const totalCap = capituloObj.total_capitulo;
        worksheet.getCell(
          `A${fila}`
        ).value = `Total del Capítulo ${totalCap.Total_capitulo}`;
        worksheet.getCell(`A${fila}`).font = { bold: true };
        worksheet.getCell(`B${fila}`).value = "";
        worksheet.getCell(`C${fila}`).value = "";
        worksheet.getCell(`D${fila}`).value = "";
        worksheet.getCell(`E${fila}`).value = "";
        let col = startCol;
        meses.forEach((mes) => {
          worksheet.getCell(fila, col).value =
            totalCap[`Total_${mes}_unidades`] || 0;
          worksheet.getCell(fila, col).numFmt = "#,##0.00";
          worksheet.getCell(fila, col + 1).value =
            totalCap[`Total_${mes}_importe`] || 0;
          worksheet.getCell(fila, col + 1).numFmt = "#,##0.00";
          worksheet.getCell(fila, col).font = { bold: true };
          worksheet.getCell(fila, col + 1).font = { bold: true };
          col += 2;
        });
        worksheet.getCell(`AD${fila}`).value = totalCap.Cantidad_Anual;
        worksheet.getCell(`AD${fila}`).numFmt = "#,##0.00";
        worksheet.getCell(`AD${fila}`).font = { bold: true };
        worksheet.getCell(`AE${fila}`).value = totalCap.Importe_Anual;
        worksheet.getCell(`AE${fila}`).numFmt = "#,##0.00";
        worksheet.getCell(`AE${fila}`).font = { bold: true };

         // Pie de tabla
        if(id_areas.length===1){
          //recibes solo un area
          console.log("SOLO UN AREA")
          const authHeader = req.headers.authorization;
          const token = authHeader && authHeader.split(" ")[1];
          // REVISÓ
          const reviso = await promette.rl_analista_unidad.findOne({
            where:{rl_area_financiero:id_area_fin},
            include: [
              {
                model:promette.ct_usuario,
                as: "ct_usuario",
              }
            ]
          })
            const curpReviso= reviso?.ct_usuario?.curp;
            let nombreReviso= reviso?.ct_usuario?.nombre_usuario || "Desconocido";
            if (curpReviso && token) {
              const nombreDesdeRupeet = await obtenerNombreRupeet(curpReviso, token);
              if (nombreDesdeRupeet) {
                nombreReviso = nombreDesdeRupeet;
              }
            }        
            // ELABORÓ
          const elaboro = await promette.ct_usuario.findOne({
            where:{id_usuario:id_usuario},
          })
            const curpElaboro= elaboro?.curp;
            let nombreElaboro= elaboro?.nombre_usuario || "Desconocido";
            if (curpElaboro && token) {
              const nombreDesdeRupeet = await obtenerNombreRupeet(curpElaboro, token);
              if (nombreDesdeRupeet) {
                nombreElaboro = nombreDesdeRupeet;
              }
            }   
          const filaPie = fila + 2;
          worksheet.mergeCells(`B${filaPie}:F${filaPie}`);
          worksheet.getCell(`B${filaPie}`).value = "Elaboró";
          worksheet.getCell(`B${filaPie}`).alignment = { horizontal: "center" };
          worksheet.mergeCells(`L${filaPie}:P${filaPie}`);
          worksheet.getCell(`L${filaPie}`).value = "Revisó";
          worksheet.getCell(`L${filaPie}`).alignment = { horizontal: "center" };
          // Espacio de fila
          worksheet.mergeCells(`B${filaPie + 2}:F${filaPie + 2}`);
          worksheet.getCell(`B${filaPie + 2}`).value = nombreElaboro;
          worksheet.getCell(`B${filaPie + 2}`).alignment = { horizontal: "center" };
          worksheet.mergeCells(`L${filaPie + 2}:P${filaPie + 2}`);
          worksheet.getCell(`L${filaPie + 2}`).value = nombreReviso;
          worksheet.getCell(`L${filaPie + 2}`).alignment = { horizontal: "center" };
          worksheet.mergeCells(`B${filaPie + 3}:F${filaPie + 3}`);
          worksheet.getCell(`B${filaPie + 3}`).value = "ENLACE";
          worksheet.getCell(`B${filaPie + 3}`).alignment = { horizontal: "center" };
          worksheet.mergeCells(`L${filaPie + 3}:P${filaPie + 3}`);
          worksheet.getCell(`L${filaPie + 3}`).value = "Secretaria Auxiliar";
          worksheet.getCell(`L${filaPie + 3}`).alignment = { horizontal: "center" };

        }else{
          //recibes el array de areas y no muestras pie
          console.log("MAS DE UN AREA")
        }
      }
    }
    
    const nombreArchivo = `FORMATO_COSTEO_GENERAL_${anoActual}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${nombreArchivo}`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    const mensaje = (error as Error).message || "Error al exportar el costeo por producto a Excel";
    res.status(500).json({
      msg: mensaje,
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