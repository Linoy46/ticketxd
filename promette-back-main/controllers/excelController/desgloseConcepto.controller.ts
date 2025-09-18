import ExcelJS from 'exceljs';
import { Request, Response } from 'express';
import * as ExcelHelper from '../../helpers/excel.helper';
import { getModels } from "../../models/modelsPromette";
import Decimal from 'decimal.js';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { obtenerAreasFinUsuario } from '../../helpers/areasUsuario.helper';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

let promette: any;
getModels(process.env.DBNAMES || "")
  .then((models) => { promette = models; })
  .catch((error) => { console.error("Error al inicializar los modelos:", error); });

export const generaDesgloseExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_areas: idAreasBody, id_area_fin_seleccionada: areaSeleccionada } = req.body;

    // 1. Get User ID and Roles
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
      res.status(401).json({ msg: "No se proporcionó token" });
      return;
    }

    let userId: number;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      userId = decoded.id;
    } catch (err) {
      res.status(401).json({ msg: "Token inválido" });
      return;
    }

    const puestosUsuario = await promette.rl_usuario_puesto.findAll({
      where: { ct_usuario_id: userId, estado: 1, periodo_final: null },
      include: [{ model: promette.ct_puesto, as: "ct_puesto", attributes: ["id_puesto", "ct_area_id"] }]
    });
    if (!puestosUsuario || puestosUsuario.length === 0) {
      res.status(403).json({ msg: "El usuario no tiene un puesto asignado." });
      return;
    }

    const puestosIds = puestosUsuario.map((p: any) => p.ct_puesto.id_puesto);
    const esAdmin = puestosIds.includes(1);
    const esFinanciero = puestosIds.includes(1806);
    const esAnalista = puestosIds.includes(258);

    // 2. Determine areas allowed for the user
    let areasPermitidas: number[];
    if (esAdmin || esFinanciero) {
      const todasAreas = await promette.rl_area_financiero.findAll({ attributes: ['id_area_fin'], raw: true });
      areasPermitidas = todasAreas.map((a: any) => a.id_area_fin);
    } else if (esAnalista) {
      const areasAnalista = await promette.rl_analista_unidad.findAll({
        where: { ct_usuario_id: userId, estado: 1 },
        attributes: ['rl_area_financiero'],
        raw: true
      });
      areasPermitidas = areasAnalista.map((a: any) => a.rl_area_financiero);
    } else {
      const areaIdsInfra = puestosUsuario.map((p: any) => p.ct_puesto.ct_area_id).filter(Boolean);
      if (areaIdsInfra.length === 0) {
          res.status(403).json({ msg: "No tienes áreas de infraestructura asignadas." });
          return;
      }
      const relacionesFinancieras = await promette.rl_area_financiero.findAll({
        where: { id_area_infra: { [Op.in]: areaIdsInfra } },
        raw: true
      });
      areasPermitidas = relacionesFinancieras.map((r: any) => r.id_area_fin);
    }

    if (areasPermitidas.length === 0) {
        res.status(403).json({ msg: "No tienes áreas financieras asignadas para este reporte." });
        return;
    }

    // 3. Determine which areas to use for the filter
    let id_areas_a_filtrar: number[] = [];
    const requestedAreas = Array.isArray(idAreasBody) ? idAreasBody : (areaSeleccionada ? [areaSeleccionada] : []);
    
    if (requestedAreas.length > 0) {
      // Permite imprimir todas las áreas seleccionadas en el select
      id_areas_a_filtrar = requestedAreas;
    } else {
      id_areas_a_filtrar = areasPermitidas;
    }

    if (id_areas_a_filtrar.length === 0) {
        res.status(200).json({ msg: "No hay áreas válidas para generar el reporte." });
        return;
    }
    
    // 4. Continue with report generation
    const id_areas = id_areas_a_filtrar;
    let unidad = "EJEMPLO UNIDAD";
    const areaInfra = await promette.rl_area_financiero.findOne({ where: { id_area_fin: id_areas[0] } });

    if (!areaInfra) {
      res.status(200).json({ msg: "No se encontró el área del usuario." });
      return;
    }

    const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`;
    const config = {
      headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" }
    };
    const url = `${infraestructuraApiUrl}/${areaInfra.id_area_infra}`;
    const response = await axios.get(url, config);
    unidad = response.data.nombre;

    const presupuesto = await promette.dt_techo_presupuesto.findAll({
      where: { ct_area_id: id_areas },
      include: [
        { model: promette.ct_capitulo, as: "ct_capitulo", attributes: ["clave_capitulo", "nombre_capitulo"] },
        { model: promette.rl_area_financiero, as: "ct_area", attributes: ["id_area_fin", "id_financiero", "id_area_infra"] },
        { model: promette.ct_financiamiento, as: "ct_financiamiento", attributes: ["id_financiamiento", "nombre_financiamiento", "estado"] },
      ],
      order: [['ct_capitulo_id', 'ASC']]
    });

    if (presupuesto.length === 0) {
      res.status(200).json({ msg: "No hay presupuestos disponibles para el área del usuario." });
      return;
    }

    const workbook = ExcelHelper.createWorkbook();
    let tituloHoja= ""
    if(id_areas.length===1){
      tituloHoja = `Unidad - ${presupuesto[0].ct_area.id_financiero}`
    }else{
      tituloHoja = `Unidades`
  }
    const hojaPrincipal = workbook.addWorksheet(tituloHoja);
    hojaPrincipal.properties.showGridLines = false;
    const imagePath = path.resolve(__dirname, '../../public/USET.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
    hojaPrincipal.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 490, height: 70 } });

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
    hojaPrincipal.getCell('A2').value = 'ANTEPROYECTO DE PRESUPUESTO DE EGRESOS 2025';
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
    if (id_areas.length === 1) {
      hojaPrincipal.getCell('A7').value = 'Unidad Administrativa:';
      hojaPrincipal.getCell('A7').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    }
    hojaPrincipal.mergeCells('B6', 'R6');
    hojaPrincipal.getCell('B6').value = 'Unidad de Servicios Educativos del Estado de Tlaxcala';
    hojaPrincipal.getCell('B6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    if (id_areas.length === 1) {
      hojaPrincipal.mergeCells('B7', 'R7');
      hojaPrincipal.getCell('B7').value = unidad;
      hojaPrincipal.getCell('B7').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    }
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
    let sumMeses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));
    let totalGeneralMeses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));

    for (let i = 0; i < presupuesto.length; i++) {
      const registro = presupuesto[i];
      const esUltimo = i === presupuesto.length - 1;

      // Si cambio de capítulo, escribe el total del anterior
      if (capituloActual !== null && registro.ct_capitulo_id !== capituloActual) {
        // Suma capítulo
        if (!hojaPrincipal.getCell(`A${filaActual}`).isMerged) {
          hojaPrincipal.mergeCells(`A${filaActual}:E${filaActual}`);
        }
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
        sumaCapitulo = new Decimal(0); // Reinicia para siguiente capítulo
      }

      // Si inicia nuevo capítulo
      if (registro.ct_capitulo_id !== capituloActual) {
        if (!hojaPrincipal.getCell(`A${filaActual}`).isMerged) {
          hojaPrincipal.mergeCells(`A${filaActual}:R${filaActual}`);
        }
        hojaPrincipal.getCell(`A${filaActual}`).value = `Capítulo ${registro.ct_capitulo.clave_capitulo} - ${registro.ct_capitulo.nombre_capitulo}`;
        hojaPrincipal.getCell(`A${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        filaActual++;
        capituloActual = registro.ct_capitulo_id;
      }

      // Productos agrupados
      const productos = await promette.rl_producto_requisicion.findAll({
        where: { dt_techo_id: registro.id_techo },
        include: [{
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          attributes: ["ct_partida_id", "nombre_producto", "precio"],
        }],
      });
      // Agrupa productos iguales
      const productosAgrupados: Record<string, any[]> = {};
      for (const prod of productos) {
        const key = `${prod.ct_producto.nombre_producto}_${prod.ct_producto.precio}`;
        if (!productosAgrupados[key]) productosAgrupados[key] = [];
        productosAgrupados[key].push(prod);
      }

  // Recorre cada agrupación (producto)
    for (const listaProductos of Object.values(productosAgrupados)) {
      const producto = listaProductos[0];
      const partida = await promette.ct_partida.findOne({ 
      where: { id_partida: producto.ct_producto.ct_partida_id },
    });

    const fila = hojaPrincipal.getRow(filaActual);
    hojaPrincipal.getCell(`A${filaActual}`).value = `${partida.clave_partida}`;
    hojaPrincipal.getCell(`B${filaActual}`).value = `${registro.ct_financiamiento.nombre_financiamiento}`;
    if (!hojaPrincipal.getCell(`C${filaActual}`).isMerged) {
      hojaPrincipal.mergeCells(`C${filaActual}:E${filaActual}`);
    }
    hojaPrincipal.getCell(`C${filaActual}`).value = `${partida.nombre_partida}`;
    hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.000';
    hojaPrincipal.getCell(`F${filaActual}`).alignment = {horizontal:'right', vertical:'middle'}

    //SUMA POR MESES Y PROPUESTA 
    let sumaFila = new Decimal(0); // Total de la fila (suma de meses)
    const meses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));
    for (const p of listaProductos) {
      const mesIndex = (p.mes ?? 0) - 1;
      if (mesIndex >= 0 && mesIndex < 12) {
        const totalMes = new Decimal(p.total || 0);
        meses[mesIndex] = meses[mesIndex].plus(totalMes);
        sumMeses[mesIndex] = sumMeses[mesIndex].plus(totalMes);
        totalGeneralMeses[mesIndex] = totalGeneralMeses[mesIndex].plus(totalMes);
        sumaFila = sumaFila.plus(totalMes);
      }
    }
    hojaPrincipal.getCell(`F${filaActual}`).value = Number(sumaFila.toFixed(3));
    sumaCapitulo = sumaCapitulo.plus(sumaFila);
    sumaGeneral = sumaGeneral.plus(sumaFila);

    for (let i = 0; i < 12; i++) {
      const cell = fila.getCell(7 + i);
      cell.value = Number(meses[i].toFixed(3));
      cell.numFmt = '#,##0.000';
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'right', vertical: 'middle' }
    }
    fila.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });

    filaActual++;
  }

  // Si es el último registro, total del último capítulo
  if (esUltimo) {
    if (!hojaPrincipal.getCell(`A${filaActual}`).isMerged) {
      hojaPrincipal.mergeCells(`A${filaActual}:E${filaActual}`);
    }
    hojaPrincipal.getCell(`A${filaActual}`).value = `Total Capítulo ${registro.ct_capitulo.clave_capitulo} - ${registro.ct_capitulo.nombre_capitulo}`;
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
    filaActual += 2;
  }

    // --- AGRUPAR POR PARTIDA Y FINANCIAMIENTO Y SUMAR CANTIDADES Y MESES ---
    const partidasAgrupadas: Record<string, { partida: any, sumaFila: Decimal, sumaMeses: Decimal[], nombre_partida: string, financiamiento: string }> = {};
    for (let i = 0; i < presupuesto.length; i++) {
      const registro = presupuesto[i];
      const productos = await promette.rl_producto_requisicion.findAll({
        where: { dt_techo_id: registro.id_techo },
        include: [{
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          attributes: ["ct_partida_id", "nombre_producto", "precio"],
        }],
      });
      for (const prod of productos) {
        const partida = await promette.ct_partida.findOne({ where: { id_partida: prod.ct_producto.ct_partida_id } });
        const financiamiento = registro.ct_financiamiento.nombre_financiamiento;
        const clave = `${partida.clave_partida}|${partida.nombre_partida}|${financiamiento}`;
        if (!partidasAgrupadas[clave]) {
          partidasAgrupadas[clave] = {
            partida,
            sumaFila: new Decimal(0),
            sumaMeses: Array.from({ length: 12 }, () => new Decimal(0)),
            nombre_partida: partida.nombre_partida,
            financiamiento
          };
        }
        const mesIndex = (prod.mes ?? 0) - 1;
        if (mesIndex >= 0 && mesIndex < 12) {
          const totalMes = new Decimal(prod.total || 0);
          partidasAgrupadas[clave].sumaMeses[mesIndex] = partidasAgrupadas[clave].sumaMeses[mesIndex].plus(totalMes);
          partidasAgrupadas[clave].sumaFila = partidasAgrupadas[clave].sumaFila.plus(totalMes);
        }
      }
    }

    // --- IMPRIMIR AGRUPADO POR PARTIDA Y FINANCIAMIENTO ORDENADO ---
    filaActual = 12;
    sumaGeneral = new Decimal(0);
    totalGeneralMeses = Array.from({ length: 12 }, () => new Decimal(0));
    // Ordenar claves por clave_partida (numérica o alfabética según corresponda)
    const clavesOrdenadas = Object.keys(partidasAgrupadas).sort((a, b) => {
      const claveA = partidasAgrupadas[a].partida.clave_partida;
      const claveB = partidasAgrupadas[b].partida.clave_partida;
      // Si son números, comparar como números, si no, como string
      const numA = Number(claveA);
      const numB = Number(claveB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return claveA.localeCompare(claveB);
    });
    for (const clave of clavesOrdenadas) {
      const { partida, sumaFila, sumaMeses, nombre_partida, financiamiento } = partidasAgrupadas[clave];
      const fila = hojaPrincipal.getRow(filaActual);
      hojaPrincipal.getCell(`A${filaActual}`).value = `${partida.clave_partida}`;
      hojaPrincipal.getCell(`B${filaActual}`).value = financiamiento;
      if (!hojaPrincipal.getCell(`C${filaActual}`).isMerged) {
        hojaPrincipal.mergeCells(`C${filaActual}:E${filaActual}`);
      }
      hojaPrincipal.getCell(`C${filaActual}`).value = `${nombre_partida}`;
      hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.000';
      hojaPrincipal.getCell(`F${filaActual}`).alignment = {horizontal:'right', vertical:'middle'}
      hojaPrincipal.getCell(`F${filaActual}`).value = Number(sumaFila.toFixed(3));
      sumaGeneral = sumaGeneral.plus(sumaFila);
      for (let i = 0; i < 12; i++) {
        const cell = fila.getCell(7 + i);
        cell.value = Number(sumaMeses[i].toFixed(3));
        cell.numFmt = '#,##0.000';
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
        totalGeneralMeses[i] = totalGeneralMeses[i].plus(sumaMeses[i]);
      }
      fila.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
      filaActual++;
    }
    // Total general
    if (!hojaPrincipal.getCell(`A${filaActual}`).isMerged) {
      hojaPrincipal.mergeCells(`A${filaActual}:E${filaActual}`);
    }
    hojaPrincipal.getCell(`A${filaActual}`).value = `Total general`;
    hojaPrincipal.getCell(`F${filaActual}`).value = Number(sumaGeneral.toFixed(3));
    hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.000';
    hojaPrincipal.getCell(`F${filaActual}`).border = hojaPrincipal.getCell(`A${filaActual}`).border = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    totalGeneralMeses.forEach((suma, idx) => {
      const cell = hojaPrincipal.getCell(filaActual, 7 + idx);
      cell.value = Number(suma.toFixed(3));
      cell.numFmt = '#,##0.000';
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    });

    if (id_areas.length === 1) {
      if (!hojaPrincipal.getCell(`A${filaActual + 3}`).isMerged) {
        hojaPrincipal.mergeCells(`A${filaActual + 3}:E${filaActual + 3}`);
      }
      hojaPrincipal.getCell(`A${filaActual + 3}`).value = 'Elaboró';
      hojaPrincipal.getCell(`A${filaActual + 3}`).alignment = { horizontal: 'center' };
      hojaPrincipal.mergeCells(`A${filaActual + 5}`, `E${filaActual + 5}`);
      hojaPrincipal.getCell(`A${filaActual + 5}`).value = 'IRAIS HERNANDEZ NAVA';
      hojaPrincipal.getCell(`A${filaActual + 5}`).alignment = { horizontal: 'center' };
      hojaPrincipal.mergeCells(`A${filaActual + 6}`, `E${filaActual + 6}`);
      hojaPrincipal.getCell(`A${filaActual + 6}`).value = 'ENLACE';
      hojaPrincipal.getCell(`A${filaActual + 6}`).alignment = { horizontal: 'center' };

      if (!hojaPrincipal.getCell(`F${filaActual + 3}`).isMerged) {
        hojaPrincipal.mergeCells(`F${filaActual + 3}:K${filaActual + 3}`);
      }
      hojaPrincipal.getCell(`F${filaActual + 3}`).value = 'Revisó';
      hojaPrincipal.getCell(`F${filaActual + 3}`).alignment = { horizontal: 'center' }
      hojaPrincipal.mergeCells(`F${filaActual + 5}`, `K${filaActual + 5}`);
      hojaPrincipal.getCell(`F${filaActual + 5}`).value = 'MONICA ORTIZ GONZALEZ';
      hojaPrincipal.getCell(`F${filaActual + 5}`).alignment = { horizontal: 'center' };
      hojaPrincipal.mergeCells(`F${filaActual + 6}`, `K${filaActual + 6}`);
      hojaPrincipal.getCell(`F${filaActual + 6}`).value = 'SECRETARIA AUXILIAR';
      hojaPrincipal.getCell(`F${filaActual + 6}`).alignment = { horizontal: 'center' };

      if (!hojaPrincipal.getCell(`L${filaActual + 3}`).isMerged) {
        hojaPrincipal.mergeCells(`L${filaActual + 3}:R${filaActual + 3}`);
      }
      hojaPrincipal.getCell(`L${filaActual + 3}`).value = 'Autorizó';
      hojaPrincipal.getCell(`L${filaActual + 3}`).alignment = { horizontal: 'center' };
      hojaPrincipal.mergeCells(`L${filaActual + 5}`, `R${filaActual + 5}`);
      hojaPrincipal.getCell(`L${filaActual + 5}`).value = 'LIC. RENÉ SUÁREZ SUÁREZ';
      hojaPrincipal.getCell(`L${filaActual + 5}`).alignment = { horizontal: 'center' };
      hojaPrincipal.mergeCells(`L${filaActual + 6}`, `R${filaActual + 6}`);
      hojaPrincipal.getCell(`L${filaActual + 6}`).value = 'DIRECTOR DE ADMINISTRACION Y FINANZAS';
      hojaPrincipal.getCell(`L${filaActual + 6}`).alignment = { horizontal: 'center' };
    }
    await crearHojasPorPartida(workbook, presupuesto, promette, id_areas, unidad);
    const buffer = await workbook.xlsx.writeBuffer();
    const currentDate = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Techos_Presupuestales_${currentDate}.xlsx`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.send(buffer);
  }
 } catch (error) {
    console.error(error);
    const mensaje = (error as Error).message || "Error al exportar los techos presupuestales a Excel";
    res.status(500).json({ msg: mensaje });
  }
};

async function crearHojasPorPartida(workbook: ExcelJS.Workbook, presupuesto: any[], promette: any, id_areas: number[], unidad: string) {
  const imagePath = path.resolve(__dirname, '../../public/USET.png');
  const imageBuffer = fs.readFileSync(imagePath);

  // 1. Obtener todas las combinaciones únicas de partida y financiamiento presentes en el presupuesto
  const combinacionesSet = new Set<string>();
  for (const registro of presupuesto) {
    const productos = await promette.rl_producto_requisicion.findAll({
      where: { dt_techo_id: registro.id_techo },
      include: [{
        model: promette.ct_producto_consumible,
        as: "ct_producto",
        attributes: ["ct_partida_id"]
      }]
    });
    for (const prod of productos) {
      const partidaId = prod.ct_producto.ct_partida_id;
      const financiamientoId = registro.ct_financiamiento.id_financiamiento;
      combinacionesSet.add(`${partidaId}|${financiamientoId}`);
    }
  }
  const combinacionesUnicas = Array.from(combinacionesSet);

  // 2. Para cada combinación, generar una hoja igual a la principal pero solo con los registros de esa partida y financiamiento
  for (const combinacion of combinacionesUnicas) {
    const [idPartida, idFinanciamiento] = combinacion.split('|').map(Number);
    // Filtrar presupuesto y productos solo de esa partida y financiamiento
    let presupuestoFiltrado: any[] = [];
    for (const registro of presupuesto) {
      if (registro.ct_financiamiento.id_financiamiento !== idFinanciamiento) continue;
      const productos = await promette.rl_producto_requisicion.findAll({
        where: { dt_techo_id: registro.id_techo },
        include: [{
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          attributes: ["ct_partida_id"]
        }]
      });
      if (productos.some((prod: any) => prod.ct_producto.ct_partida_id === idPartida)) {
        presupuestoFiltrado.push(registro);
      }
    }
    if (presupuestoFiltrado.length === 0) continue;

    // Obtener nombre de la partida y financiamiento
    const partidaObj = await promette.ct_partida.findOne({ where: { id_partida: idPartida } });
    const financiamientoObj = await promette.ct_financiamiento.findOne({ where: { id_financiamiento: idFinanciamiento } });
    const nombreHoja = `${partidaObj?.clave_partida || idPartida} - ${financiamientoObj?.nombre_financiamiento || idFinanciamiento}`.substring(0, 31);
    const hoja = workbook.addWorksheet(nombreHoja);
    hoja.properties.showGridLines = false;
    const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
    hoja.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 490, height: 70 } });
    hoja.getColumn('A').width = 14;
    hoja.getColumn('B').width = 25;
    ['C', 'D', 'E', 'F'].forEach(col => hoja.getColumn(col).width = 17);
    ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'].forEach(col => hoja.getColumn(col).width = 12);
    hoja.mergeCells('A1', 'R1');
    hoja.getCell('A1').value = 'GOBIERNO DEL ESTADO DE TLAXCALA';
    hoja.getCell('A1').font = { size: 11 };
    hoja.getCell('A1').alignment = { horizontal: 'center' };
    hoja.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('A2', 'R2');
    hoja.getCell('A2').value = 'ANTEPROYECTO DE PRESUPUESTO DE EGRESOS 2025';
    hoja.getCell('A2').font = { size: 11 };
    hoja.getCell('A2').alignment = { horizontal: 'center' };
    hoja.getCell('A2').border = { left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('A3', 'R3');
    hoja.getCell('A3').value = 'DESGLOSE DE CONCEPTOS POR PARTIDA';
    hoja.getCell('A3').font = { size: 11 };
    hoja.getCell('A3').alignment = { horizontal: 'center' };
    hoja.getCell('A3').border = { left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell('A6').value = 'Entidad:';
    hoja.getCell('A6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    if (id_areas.length === 1) {
      hoja.getCell('A7').value = 'Unidad Administrativa:';
      hoja.getCell('A7').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    }
    hoja.mergeCells('B6', 'R6');
    hoja.getCell('B6').value = 'Unidad de Servicios Educativos del Estado de Tlaxcala';
    hoja.getCell('B6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    if (id_areas.length === 1) {
      hoja.mergeCells('B7', 'R7');
      hoja.getCell('B7').value = unidad;
      hoja.getCell('B7').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    }
    hoja.mergeCells('A9', 'A10');
    hoja.getCell('A9').value = 'Partida';
    hoja.getCell('A9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell('A9').alignment = { horizontal: 'left', vertical: 'bottom' };
    hoja.mergeCells('B9', 'B10');
    hoja.getCell('B9').value = 'Fuente de Financiamiento';
    hoja.getCell('B9').alignment = { horizontal: 'left', vertical: 'bottom' };
    hoja.getCell('B9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('C9', 'E10');
    hoja.getCell('C9').value = 'Descripción';
    hoja.getCell('C9').alignment = { horizontal: 'left', vertical: 'bottom' };
    hoja.getCell('C9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('F9', 'F10');
    hoja.getCell('F9').value = 'Propuesta 2025';
    hoja.getCell('F9').alignment = { horizontal: 'left', vertical: 'bottom' };
    hoja.getCell('F9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('G9', 'R9');
    hoja.getCell('G9').value = 'CALENDARIO';
    hoja.getCell('G9').alignment = { horizontal: 'center' };
    hoja.getCell('G9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    meses.forEach((mes, index) => {
      const col = String.fromCharCode('G'.charCodeAt(0) + index);
      hoja.getCell(`${col}10`).value = mes;
      hoja.getCell(`${col}10`).alignment = { horizontal: 'center' };
      hoja.getCell(`${col}10`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let filaActual = 12;
    let capituloActual = null;
    let sumaCapitulo = new Decimal(0);
    let sumaGeneral = new Decimal(0);
    let sumMeses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));
    let totalGeneralMeses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));

    for (let i = 0; i < presupuestoFiltrado.length; i++) {
      const registro = presupuestoFiltrado[i];
      const esUltimo = i === presupuestoFiltrado.length - 1;

      // Si cambio de capítulo, escribe el total del anterior
      if (capituloActual !== null && registro.ct_capitulo_id !== capituloActual) {
        if (!hoja.getCell(`A${filaActual}`).isMerged) {
          hoja.mergeCells(`A${filaActual}:E${filaActual}`);
        }
        hoja.getCell(`A${filaActual}`).value = `Total Capítulo ${presupuestoFiltrado[i - 1].ct_capitulo.clave_capitulo} - ${presupuestoFiltrado[i - 1].ct_capitulo.nombre_capitulo}`;
        hoja.getCell(`F${filaActual}`).value = Number(sumaCapitulo.toFixed(3));
        hoja.getCell(`F${filaActual}`).numFmt = '#,##0.000';
        hoja.getCell(`A${filaActual}`).border = hoja.getCell(`F${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        sumMeses.forEach((suma, idx) => {
          const cell = hoja.getCell(filaActual, 7 + idx);
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

      if (registro.ct_capitulo_id !== capituloActual) {
        if (!hoja.getCell(`A${filaActual}`).isMerged) {
          hoja.mergeCells(`A${filaActual}:R${filaActual}`);
        }
        hoja.getCell(`A${filaActual}`).value = `Capítulo ${registro.ct_capitulo.clave_capitulo} - ${registro.ct_capitulo.nombre_capitulo}`;
        hoja.getCell(`A${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        filaActual++;
        capituloActual = registro.ct_capitulo_id;
      }

      // Productos agrupados solo de la partida actual
      const productos = await promette.rl_producto_requisicion.findAll({
        where: { dt_techo_id: registro.id_techo },
        include: [{
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          attributes: ["ct_partida_id", "nombre_producto", "precio"],
        }],
      });
      // Agrupa productos iguales pero solo de la partida actual
      const productosAgrupados: Record<string, any[]> = {};
      for (const prod of productos) {
        if (prod.ct_producto.ct_partida_id !== idPartida) continue;
        const key = `${prod.ct_producto.nombre_producto}_${prod.ct_producto.precio}`;
        if (!productosAgrupados[key]) productosAgrupados[key] = [];
        productosAgrupados[key].push(prod);
      }

      for (const listaProductos of Object.values(productosAgrupados)) {
        const producto = listaProductos[0];
        const partida = await promette.ct_partida.findOne({ 
          where: { id_partida: producto.ct_producto.ct_partida_id },
        });

        const fila = hoja.getRow(filaActual);
        hoja.getCell(`A${filaActual}`).value = `${partida.clave_partida}`;
        hoja.getCell(`B${filaActual}`).value = financiamientoObj?.nombre_financiamiento || '';
        if (!hoja.getCell(`C${filaActual}`).isMerged) {
          hoja.mergeCells(`C${filaActual}:E${filaActual}`);
        }
        hoja.getCell(`C${filaActual}`).value = `${partida.nombre_partida}`;
        hoja.getCell(`F${filaActual}`).numFmt = '#,##0.000';
        hoja.getCell(`F${filaActual}`).alignment = {horizontal:'right', vertical:'middle'}

        let sumaFila = new Decimal(0);
        const meses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));
        for (const p of listaProductos) {
          const mesIndex = (p.mes ?? 0) - 1;
          if (mesIndex >= 0 && mesIndex < 12) {
            const totalMes = new Decimal(p.total || 0);
            meses[mesIndex] = meses[mesIndex].plus(totalMes);
            sumMeses[mesIndex] = sumMeses[mesIndex].plus(totalMes);
            totalGeneralMeses[mesIndex] = totalGeneralMeses[mesIndex].plus(totalMes);
            sumaFila = sumaFila.plus(totalMes);
          }
        }
        hoja.getCell(`F${filaActual}`).value = Number(sumaFila.toFixed(3));
        sumaCapitulo = sumaCapitulo.plus(sumaFila);
        sumaGeneral = sumaGeneral.plus(sumaFila);

        for (let i = 0; i < 12; i++) {
          const cell = fila.getCell(7 + i);
          cell.value = Number(meses[i].toFixed(3));
          cell.numFmt = '#,##0.000';
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { horizontal: 'right', vertical: 'middle' }
        }
        fila.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
        filaActual++;
      }

      if (esUltimo) {
        if (!hoja.getCell(`A${filaActual}`).isMerged) {
          hoja.mergeCells(`A${filaActual}:E${filaActual}`);
        }
        hoja.getCell(`A${filaActual}`).value = `Total Capítulo ${registro.ct_capitulo.clave_capitulo} - ${registro.ct_capitulo.nombre_capitulo}`;
        hoja.getCell(`F${filaActual}`).value = Number(sumaCapitulo.toFixed(3));
        hoja.getCell(`F${filaActual}`).numFmt = '#,##0.000';
        hoja.getCell(`A${filaActual}`).border = hoja.getCell(`F${filaActual}`).border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        sumMeses.forEach((suma, idx) => {
          const cell = hoja.getCell(filaActual, 7 + idx);
          cell.value = Number(suma.toFixed(3));
          cell.numFmt = '#,##0.000';
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { horizontal: 'right', vertical: 'middle' }
        });
        filaActual += 2;
      }
    }

    if (!hoja.getCell(`A${filaActual}`).isMerged) {
      hoja.mergeCells(`A${filaActual}:E${filaActual}`);
    }
    hoja.getCell(`A${filaActual}`).value = `Total general`;
    hoja.getCell(`F${filaActual}`).value = Number(sumaGeneral.toFixed(3));
    hoja.getCell(`F${filaActual}`).numFmt = '#,##0.000';
    hoja.getCell(`F${filaActual}`).border = hoja.getCell(`A${filaActual}`).border = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    totalGeneralMeses.forEach((suma, idx) => {
      const cell = hoja.getCell(filaActual, 7 + idx);
      cell.value = Number(suma.toFixed(3));
      cell.numFmt = '#,##0.000';
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    });
  }
}

async function getJustificacion(promette: any, ct_partida_id: number, ct_area_id: number, dt_techo_id: number) {
  if (!ct_partida_id) return 'No hay justificación registrada';
  const just = await promette.rl_justificacion.findOne({
    where: { ct_partida_id, ct_area_id, dt_techo_id }
  });
  return just?.justificacion || 'No hay justificación registrada';
}

async function getClavePartida(promette: any, id_partida: number) {
  if (!id_partida) return '';
  const partida = await promette.ct_partida.findOne({ where: { id_partida } });
  return partida?.clave_partida || '';
}

async function getNombrePartida(promette: any, id_partida: number) {
  if (!id_partida) return '';
  const partida = await promette.ct_partida.findOne({ where: { id_partida } });
  return partida?.nombre_partida || '';
}

export default {
  generaDesgloseExcel
};
