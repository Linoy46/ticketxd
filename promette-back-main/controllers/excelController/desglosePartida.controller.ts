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

export const generaDesgloseExcel = async (req: Request, res: Response): Promise<void> => {
  // NUEVO: aceptar los parámetros del frontend
  const { ct_area_id, ct_financiamiento_id, ct_puesto_id, esFormatoPresupuestalGeneral } = req.body;
  console.log("ct_area_id:", ct_area_id);
  console.log("ct_financiamiento_id:", ct_financiamiento_id);
  console.log("ct_puesto_id:", ct_puesto_id);
  console.log("esFormatoPresupuestalGeneral:", esFormatoPresupuestalGeneral);

  let id_areas: number[] = [];
  let todosLosFinanciamientos: boolean = false;

  // Si no se recibe ningún parámetro, obtener todas las áreas y todos los financiamientos
  if (!ct_area_id && !ct_financiamiento_id) {
    const todasAreas = await promette.rl_area_financiero.findAll();
    id_areas = todasAreas.map((a: any) => a.id_area_fin);
    todosLosFinanciamientos = true;
  } else {
    id_areas = Array.isArray(ct_area_id) ? ct_area_id : (ct_area_id ? [ct_area_id] : (Array.isArray(req.body.id_area_fin) ? req.body.id_area_fin : [req.body.id_area_fin]));
  }

  if (!id_areas || id_areas.length === 0) {
    res.status(400).json({ msg: "No se proporcionaron áreas financieras" });
    return;
  }

  let unidad = "EJEMPLO UNIDAD";
  const areaInfra = await promette.rl_area_financiero.findAll({ where: { id_area_fin: id_areas } });
  if (!areaInfra) {
    res.status(200).json({ msg: "No se encontró el área del usuario." });
    return;
  }

  // Obtener nombre de unidad (solo si es una)
  let nombreUnidad = unidad;
  if (id_areas.length === 1 && areaInfra.length > 0) {
    const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const config = {
      headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" }
    };
    const url = `${infraestructuraApiUrl}/${areaInfra[0].id_area_infra}`;
    try {
      const response = await axios.get(url, config);
      nombreUnidad = response.data.nombre;
    } catch (e) {
      nombreUnidad = unidad;
    }
  }

  try {
    // --- NUEVA LÓGICA DE AGRUPACIÓN ---
    if (!ct_financiamiento_id && !ct_area_id && !esFormatoPresupuestalGeneral) {
      // Buscar todos los techos
      const presupuesto = await promette.dt_techo_presupuesto.findAll({
        where: {},
        include: [
          { model: promette.ct_capitulo, as: "ct_capitulo", attributes: ["clave_capitulo", "nombre_capitulo"] },
          { model: promette.rl_area_financiero, as: "ct_area", attributes: ["id_area_fin", "id_financiero", "id_area_infra"] },
          { model: promette.ct_financiamiento, as: "ct_financiamiento", attributes: ["id_financiamiento", "nombre_financiamiento", "estado"] },
        ],
        order: [["ct_capitulo_id", "ASC"]]
      });
      if (presupuesto.length === 0) {
        res.status(200).json({ msg: "No hay presupuestos disponibles para el área del usuario." });
        return;
      }
      // Agrupar productos por partida y sumar cantidades/importes por partida
      const partidasTotales: Record<string, { clave_partida: string, nombre_partida: string, total_cantidad: number, total_importe: number, justificaciones: Set<string> }> = {};
      for (const reg of presupuesto) {
        const productos = await promette.rl_producto_requisicion.findAll({
          where: { dt_techo_id: reg.id_techo },
          include: [{
            model: promette.ct_producto_consumible,
            as: "ct_producto",
            attributes: ["id_producto", "ct_partida_id", "nombre_producto", "precio", "ct_unidad_id"],
            include: [{
              model: promette.ct_partida,
              as: "ct_partida",
              attributes: ["clave_partida", "nombre_partida"],
            }],
          }],
        });
        for (const prod of productos) {
          const partida = prod.ct_producto.ct_partida;
          if (!partida) continue;
          const key = `${partida.clave_partida}|${partida.nombre_partida}`;
          if (!partidasTotales[key]) {
            partidasTotales[key] = {
              clave_partida: partida.clave_partida,
              nombre_partida: partida.nombre_partida,
              total_cantidad: 0,
              total_importe: 0,
              justificaciones: new Set(),
            };
          }
          partidasTotales[key].total_cantidad += Number(prod.cantidad) || 0;
          partidasTotales[key].total_importe += (Number(prod.cantidad) || 0) * (Number(prod.ct_producto.precio) || 0);
          // Buscar justificación para este producto/partida/techo
          const just = prod.justificacion || prod.justificaciones || prod.just || prod.JUSTIFICACION || prod.Justificacion;
          if (just && typeof just === 'string' && just.trim() && just.trim().toLowerCase() !== 'no hay justificación registrada') {
            partidasTotales[key].justificaciones.add(just.trim());
          }
        }
      }
      // Generar Excel, una hoja 'Unidades' y una hoja por cada partida
      const workbook = ExcelHelper.createWorkbook();
      // Hoja Unidades (totales por partida) con formato completo
      const hojaUnidades = workbook.addWorksheet('Unidades');
      hojaUnidades.properties.showGridLines = false;
      const imagePath = path.resolve(__dirname, '../../public/USET.png');
      const imageBuffer = fs.readFileSync(imagePath);
      const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
      hojaUnidades.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 490, height: 70 } });

      hojaUnidades.getColumn('A').width = 14;
      hojaUnidades.getColumn('B').width = 25;
      ['C', 'D', 'E', 'F'].forEach(col => hojaUnidades.getColumn(col).width = 17);
      ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'].forEach(col => hojaUnidades.getColumn(col).width = 12);
      hojaUnidades.mergeCells('A1', 'R1');
      hojaUnidades.getCell('A1').value = 'GOBIERNO DEL ESTADO DE TLAXCALA';
      hojaUnidades.getCell('A1').font = { size: 11 };
      hojaUnidades.getCell('A1').alignment = { horizontal: 'center' };
      hojaUnidades.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.mergeCells('A2', 'R2');
      hojaUnidades.getCell('A2').value = 'ANTEPROYECTO DE PRESUPUESTO DE EGRESOS 2026';
      hojaUnidades.getCell('A2').font = { size: 11 };
      hojaUnidades.getCell('A2').alignment = { horizontal: 'center' };
      hojaUnidades.getCell('A2').border = { left: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.mergeCells('A3', 'R3');
      hojaUnidades.getCell('A3').value = 'DESGLOSE DE CONCEPTOS POR PARTIDA';
      hojaUnidades.getCell('A3').font = { size: 11 };
      hojaUnidades.getCell('A3').alignment = { horizontal: 'center' };
      hojaUnidades.getCell('A3').border = { left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.getCell('A6').value = 'Entidad:';
      hojaUnidades.getCell('A6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.mergeCells('B6', 'R6');
      hojaUnidades.getCell('B6').value = 'Unidad de Servicios Educativos del Estado de Tlaxcala';
      hojaUnidades.getCell('B6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.mergeCells('A9', 'A10');
      hojaUnidades.getCell('A9').value = 'Partida';
      hojaUnidades.getCell('A9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.getCell('A9').alignment = { horizontal: 'left', vertical: 'bottom' };
      hojaUnidades.mergeCells('B9', 'B10');
      hojaUnidades.getCell('B9').value = 'Fuente de Financiamiento';
      hojaUnidades.getCell('B9').alignment = { horizontal: 'left', vertical: 'bottom' };
      hojaUnidades.getCell('B9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.mergeCells('C9', 'E10');
      hojaUnidades.getCell('C9').value = 'Descripción';
      hojaUnidades.getCell('C9').alignment = { horizontal: 'left', vertical: 'bottom' };
      hojaUnidades.getCell('C9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.mergeCells('F9', 'F10');
      hojaUnidades.getCell('F9').value = 'Propuesta 2026';
      hojaUnidades.getCell('F9').alignment = { horizontal: 'left', vertical: 'bottom' };
      hojaUnidades.getCell('F9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaUnidades.mergeCells('G9', 'R9');
      hojaUnidades.getCell('G9').value = 'CALENDARIO';
      hojaUnidades.getCell('G9').alignment = { horizontal: 'center' };
      hojaUnidades.getCell('G9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      meses.forEach((mes, index) => {
        const col = String.fromCharCode('G'.charCodeAt(0) + index);
        hojaUnidades.getCell(`${col}10`).value = mes;
        hojaUnidades.getCell(`${col}10`).alignment = { horizontal: 'center' };
        hojaUnidades.getCell(`${col}10`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      let filaActual = 12;
      let sumaGeneral = new Decimal(0);
      let totalGeneralMeses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));

      // Agrupar partidas solo por partida (sin financiamiento)
      const partidasAgrupadas: Record<string, { partida: any, nombre_partida: string, sumaCantidad: Decimal, sumaMeses: Decimal[] }> = {};
      
      for (const reg of presupuesto) {
        const productos = await promette.rl_producto_requisicion.findAll({
          where: { dt_techo_id: reg.id_techo },
          include: [{
            model: promette.ct_producto_consumible,
            as: "ct_producto",
            attributes: ["id_producto", "ct_partida_id", "nombre_producto", "precio"],
          }],
        });
        
        for (const prod of productos) {
          const partida = await promette.ct_partida.findOne({ where: { id_partida: prod.ct_producto.ct_partida_id } });
          if (!partida) continue;
          
          const clave = `${partida.clave_partida}`;
          if (!partidasAgrupadas[clave]) {
            partidasAgrupadas[clave] = {
              partida,
              nombre_partida: partida.nombre_partida,
              sumaCantidad: new Decimal(0),
              sumaMeses: Array.from({ length: 12 }, () => new Decimal(0)),
            };
          }
          
          // Sumar cantidades y meses
          partidasAgrupadas[clave].sumaCantidad = partidasAgrupadas[clave].sumaCantidad.plus(prod.cantidad || 0);
          const mesIndex = (prod.mes ?? 0) - 1;
          if (mesIndex >= 0 && mesIndex < 12) {
            const totalMes = new Decimal(prod.total || 0);
            partidasAgrupadas[clave].sumaMeses[mesIndex] = partidasAgrupadas[clave].sumaMeses[mesIndex].plus(totalMes);
          }
        }
      }

      // Ordenar partidas por clave
      const partidasOrdenadas = Object.values(partidasAgrupadas).sort((a, b) => {
        const claveA = a.partida.clave_partida;
        const claveB = b.partida.clave_partida;
        if (!isNaN(Number(claveA)) && !isNaN(Number(claveB))) {
          return Number(claveA) - Number(claveB);
        }
        return claveA.localeCompare(claveB);
      });

      // Imprimir partidas agrupadas
      for (const partidaObj of partidasOrdenadas) {
        const { partida, sumaMeses, nombre_partida } = partidaObj;
        const fila = hojaUnidades.getRow(filaActual);
        hojaUnidades.getCell(`A${filaActual}`).value = `${partida.clave_partida}`;
        hojaUnidades.getCell(`B${filaActual}`).value = `TODOS LOS FINANCIAMIENTOS`;
        hojaUnidades.mergeCells(`C${filaActual}:E${filaActual}`);
        hojaUnidades.getCell(`C${filaActual}`).value = `${nombre_partida}`;
        hojaUnidades.getCell(`F${filaActual}`).numFmt = '#,##0.00';
        hojaUnidades.getCell(`F${filaActual}`).alignment = {horizontal:'right', vertical:'middle'};
        
        // Calcular la suma de los meses para la columna F
        const totalFila = sumaMeses.reduce((acc: Decimal, val: Decimal) => acc.plus(val), new Decimal(0));
        hojaUnidades.getCell(`F${filaActual}`).value = Number(totalFila.toFixed(2));
        
        // Acumular para el total general
        sumaGeneral = sumaGeneral.plus(totalFila);
        
        for (let i = 0; i < 12; i++) {
          const cell = fila.getCell(7 + i);
          cell.value = Number(sumaMeses[i].toFixed(2));
          cell.numFmt = '#,##0.00';
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          // Acumular para el total general de meses
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
      // Hoja por cada partida con productos agrupados y justificaciones
      for (const key in partidasTotales) {
        const [clave_partida, nombre_partida] = key.split('|');
        // Buscar todos los productos de esta partida
        const productosPartida: Record<string, { descripcion: string, cantidad: number, precio: number, importe: number, justificaciones: Set<string> }> = {};
        
        for (const reg of presupuesto) {
          const productos = await promette.rl_producto_requisicion.findAll({
            where: { dt_techo_id: reg.id_techo },
            include: [{
              model: promette.ct_producto_consumible,
              as: "ct_producto",
              attributes: ["id_producto", "ct_partida_id", "nombre_producto", "precio", "ct_unidad_id"],
              include: [{
                model: promette.ct_partida,
                as: "ct_partida",
                attributes: ["clave_partida", "nombre_partida"],
              }],
            }],
          });
          
          for (const prod of productos) {
            const partida = prod.ct_producto.ct_partida;
            if (!partida || partida.clave_partida !== clave_partida) continue;
            
            const prodKey = `${prod.ct_producto.id_producto}`;
            if (!productosPartida[prodKey]) {
              productosPartida[prodKey] = {
                descripcion: prod.ct_producto.nombre_producto,
                cantidad: 0,
                precio: Number(prod.ct_producto.precio) || 0,
                importe: 0,
                justificaciones: new Set(),
              };
            }
            
            productosPartida[prodKey].cantidad += Number(prod.cantidad) || 0;
            productosPartida[prodKey].importe += (Number(prod.cantidad) || 0) * (Number(prod.ct_producto.precio) || 0);
            
            // Obtener justificación desde la tabla rl_justificacion
            const justificacion = await promette.rl_justificacion.findOne({
              where: { 
                dt_techo_id: reg.id_techo,
                ct_partida_id: prod.ct_producto.ct_partida_id
              }
            });
            
            if (justificacion && justificacion.justificacion && 
                justificacion.justificacion.trim() && 
                justificacion.justificacion.trim().toLowerCase() !== 'no hay justificación registrada') {
              productosPartida[prodKey].justificaciones.add(justificacion.justificacion.trim());
            }
          }
        }
        
        // Crear hoja para la partida
        const hojaPartida = workbook.addWorksheet(`${clave_partida} ${nombre_partida}`.substring(0, 31));
        hojaPartida.properties.showGridLines = false;
        hojaPartida.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 430, height: 65 } });
        ['A', 'B', 'C', 'D', 'E'].forEach(col => hojaPartida.getColumn(col).width = 20);
        hojaPartida.mergeCells('A1:E1');
        hojaPartida.getCell('A1').value = 'GOBIERNO DEL ESTADO DE TLAXCALA';
        hojaPartida.getCell('A1').alignment = { horizontal: 'center' };
        hojaPartida.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        hojaPartida.mergeCells('A2:E2');
        hojaPartida.getCell('A2').value = 'ANTEPROYECTO DE PRESUPUESTO DE EGRESOS 2026';
        hojaPartida.getCell('A2').alignment = { horizontal: 'center' };
        hojaPartida.getCell('A2').border = { left: { style: 'thin' }, right: { style: 'thin' } };
        hojaPartida.mergeCells('A3:E3');
        hojaPartida.getCell('A3').value = `PARTIDA: ${clave_partida} - ${nombre_partida}`;
        hojaPartida.getCell('A3').alignment = { horizontal: 'center' };
        hojaPartida.getCell('A3').border = { left: { style: 'thin' }, right: { style: 'thin' } };
        hojaPartida.mergeCells('A4:E4');
        hojaPartida.getCell('A4').border = { left: { style: 'thin' }, right: { style: 'thin' } };
        hojaPartida.mergeCells('A5:E5');
        hojaPartida.getCell('A5').border = { left: { style: 'thin' }, right: { style: 'thin' } };
        hojaPartida.mergeCells('A6:E6');
        hojaPartida.getCell('A6').border = { bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        let filaP = 8;
        hojaPartida.getCell(`A${filaP}`).value = 'Descripción';
        hojaPartida.getCell(`B${filaP}`).value = 'Cantidad';
        hojaPartida.getCell(`C${filaP}`).value = 'Precio Unitario';
        hojaPartida.getCell(`D${filaP}`).value = 'Importe';
        hojaPartida.getCell(`E${filaP}`).value = 'Justificación';
        filaP++;
        let totalPartida = 0;
        for (const prodKey in productosPartida) {
          const prod = productosPartida[prodKey];
          hojaPartida.getCell(`A${filaP}`).value = prod.descripcion;
          hojaPartida.getCell(`B${filaP}`).value = prod.cantidad;
          hojaPartida.getCell(`C${filaP}`).value = prod.precio;
          hojaPartida.getCell(`D${filaP}`).value = Number(prod.importe.toFixed(2));
          hojaPartida.getCell(`E${filaP}`).value = Array.from(prod.justificaciones).join('\n') || 'Sin justificación';
          totalPartida += prod.importe;
          filaP++;
        }
        hojaPartida.mergeCells(`A${filaP}:C${filaP}`);
        hojaPartida.getCell(`A${filaP}`).value = 'Total partida';
        hojaPartida.getCell(`D${filaP}`).value = Number(totalPartida.toFixed(2));
        hojaPartida.getCell(`D${filaP}`).numFmt = '#,##0.00';
        hojaPartida.getCell(`A${filaP}`).border = hojaPartida.getCell(`D${filaP}`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        hojaPartida.getCell(`A${filaP}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        hojaPartida.getCell(`D${filaP}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
      // Guardar y enviar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Desglose_Partida_Unidades.xlsx`);
      res.setHeader('Content-Length', buffer.byteLength);
      res.send(buffer);
      return;
    }
    
    // --- LÓGICA PARA FORMATO PRESUPUESTAL GENERAL ---
    console.log('Verificando formato presupuestal general:', { esFormatoPresupuestalGeneral, ct_financiamiento_id });
    if (esFormatoPresupuestalGeneral && ct_financiamiento_id) {
      console.log('Entrando en lógica de formato presupuestal general');
      // Obtener nombre del financiamiento
      const financiamiento = await promette.ct_financiamiento.findOne({
        where: { id_financiamiento: ct_financiamiento_id }
      });

      if (!financiamiento) {
        res.status(400).json({ msg: "Financiamiento no encontrado" });
        return;
      }

      // Obtener todos los techos presupuestales para el financiamiento específico
      const presupuesto = await promette.dt_techo_presupuesto.findAll({
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

      if (presupuesto.length === 0) {
        res.status(200).json({ msg: "No hay techos presupuestales disponibles para este financiamiento." });
        return;
      }

      const workbook = ExcelHelper.createWorkbook();
      const hojaPrincipal = workbook.addWorksheet('Unidades');
      hojaPrincipal.properties.showGridLines = false;
      const imagePath = path.resolve(__dirname, '../../public/USET.png');
      const imageBuffer = fs.readFileSync(imagePath);
      const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
      hojaPrincipal.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 490, height: 70 } });

      hojaPrincipal.getColumn('A').width = 14;
      hojaPrincipal.getColumn('B').width = 25;
      ['C', 'D', 'E', 'F'].forEach(col => hojaPrincipal.getColumn(col).width = 17);
      ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'].forEach(col => hojaPrincipal.getColumn(col).width = 12);
      
      // Títulos modificados para formato presupuestal general
      hojaPrincipal.mergeCells('A1', 'R1');
      hojaPrincipal.getCell('A1').value = 'GOBIERNO DEL ESTADO DE TLAXCALA';
      hojaPrincipal.getCell('A1').font = { size: 11 };
      hojaPrincipal.getCell('A1').alignment = { horizontal: 'center' };
      hojaPrincipal.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      
      hojaPrincipal.mergeCells('A2', 'R2');
      hojaPrincipal.getCell('A2').value = 'PRESUPUESTO GENERAL POR UNIDAD';
      hojaPrincipal.getCell('A2').font = { size: 11 };
      hojaPrincipal.getCell('A2').alignment = { horizontal: 'center' };
      hojaPrincipal.getCell('A2').border = { left: { style: 'thin' }, right: { style: 'thin' } };
      
      hojaPrincipal.mergeCells('A3', 'R3');
      hojaPrincipal.getCell('A3').value = `FINANCIAMIENTO: ${financiamiento.nombre_financiamiento.toUpperCase()}`;
      hojaPrincipal.getCell('A3').font = { size: 11 };
      hojaPrincipal.getCell('A3').alignment = { horizontal: 'center' };
      hojaPrincipal.getCell('A3').border = { left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      
      hojaPrincipal.getCell('A6').value = 'Entidad:';
      hojaPrincipal.getCell('A6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaPrincipal.mergeCells('B6', 'R6');
      hojaPrincipal.getCell('B6').value = 'Unidad de Servicios Educativos del Estado de Tlaxcala';
      hojaPrincipal.getCell('B6').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      
      // Headers modificados - agregar clave financiera después de descripción
      hojaPrincipal.mergeCells('A9', 'A10');
      hojaPrincipal.getCell('A9').value = 'Partida';
      hojaPrincipal.getCell('A9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      hojaPrincipal.getCell('A9').alignment = { horizontal: 'left', vertical: 'bottom' };
      
      hojaPrincipal.mergeCells('B9', 'B10');
      hojaPrincipal.getCell('B9').value = 'Unidad Administrativa';
      hojaPrincipal.getCell('B9').alignment = { horizontal: 'left', vertical: 'bottom' };
      hojaPrincipal.getCell('B9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      
      hojaPrincipal.mergeCells('C9', 'E10');
      hojaPrincipal.getCell('C9').value = 'Descripción';
      hojaPrincipal.getCell('C9').alignment = { horizontal: 'left', vertical: 'bottom' };
      hojaPrincipal.getCell('C9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      
      hojaPrincipal.mergeCells('F9', 'F10');
      hojaPrincipal.getCell('F9').value = 'Clave Financiera';
      hojaPrincipal.getCell('F9').alignment = { horizontal: 'left', vertical: 'bottom' };
      hojaPrincipal.getCell('F9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      
      hojaPrincipal.mergeCells('G9', 'G10');
      hojaPrincipal.getCell('G9').value = 'Propuesta 2026';
      hojaPrincipal.getCell('G9').alignment = { horizontal: 'left', vertical: 'bottom' };
      hojaPrincipal.getCell('G9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      
      hojaPrincipal.mergeCells('H9', 'S9');
      hojaPrincipal.getCell('H9').value = 'CALENDARIO';
      hojaPrincipal.getCell('H9').alignment = { horizontal: 'center' };
      hojaPrincipal.getCell('H9').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      
      const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      meses.forEach((mes, index) => {
        const col = String.fromCharCode('H'.charCodeAt(0) + index);
        hojaPrincipal.getCell(`${col}10`).value = mes;
        hojaPrincipal.getCell(`${col}10`).alignment = { horizontal: 'center' };
        hojaPrincipal.getCell(`${col}10`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      let filaActual = 12;
      let sumaGeneral = new Decimal(0);
      let totalGeneralMeses: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));

      // Agrupar por partida, unidad administrativa y clave financiera
      const partidasAgrupadas: Record<string, { partida: any, unidad: string, claveFinanciera: string, sumaCantidad: Decimal, sumaMeses: Decimal[], nombre_partida: string }> = {};
      
      for (const reg of presupuesto) {
        // Obtener nombre de la unidad administrativa
        let nombreUnidad = 'Unidad no especificada';
        if (reg.ct_area.id_area_infra) {
          const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`;
          const authHeader = req.headers.authorization;
          const token = authHeader && authHeader.split(" ")[1];
          const config = {
            headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" }
          };
          const url = `${infraestructuraApiUrl}/${reg.ct_area.id_area_infra}`;
          try {
            const response = await axios.get(url, config);
            nombreUnidad = response.data.nombre;
          } catch (e) {
            nombreUnidad = 'Unidad no especificada';
          }
        }

        const productos = await promette.rl_producto_requisicion.findAll({
          where: { dt_techo_id: reg.id_techo },
          include: [{
            model: promette.ct_producto_consumible,
            as: "ct_producto",
            attributes: ["id_producto", "ct_partida_id", "nombre_producto", "precio"],
          }],
        });
        
        for (const prod of productos) {
          const partida = await promette.ct_partida.findOne({ where: { id_partida: prod.ct_producto.ct_partida_id } });
          if (!partida) continue;
          
          const clave = `${partida.clave_partida}|${nombreUnidad}`;
          if (!partidasAgrupadas[clave]) {
            partidasAgrupadas[clave] = {
              partida,
              unidad: nombreUnidad,
              claveFinanciera: reg.ct_area.id_financiero || '',
              sumaCantidad: new Decimal(0),
              sumaMeses: Array.from({ length: 12 }, () => new Decimal(0)),
              nombre_partida: partida.nombre_partida,
            };
          }
          
          // Sumar cantidades y meses
          partidasAgrupadas[clave].sumaCantidad = partidasAgrupadas[clave].sumaCantidad.plus(prod.cantidad || 0);
          const mesIndex = (prod.mes ?? 0) - 1;
          if (mesIndex >= 0 && mesIndex < 12) {
            const totalMes = new Decimal(prod.total || 0);
            partidasAgrupadas[clave].sumaMeses[mesIndex] = partidasAgrupadas[clave].sumaMeses[mesIndex].plus(totalMes);
          }
        }
      }

      // Ordenar partidas por unidad administrativa (ascendente) y luego por clave de partida
      const partidasOrdenadas = Object.values(partidasAgrupadas).sort((a, b) => {
        // Primero ordenar por unidad administrativa
        const unidadA = a.unidad.toLowerCase();
        const unidadB = b.unidad.toLowerCase();
        if (unidadA !== unidadB) {
          return unidadA.localeCompare(unidadB);
        }
        // Si las unidades son iguales, ordenar por clave de partida
        const claveA = a.partida.clave_partida;
        const claveB = b.partida.clave_partida;
        if (!isNaN(Number(claveA)) && !isNaN(Number(claveB))) {
          return Number(claveA) - Number(claveB);
        }
        return claveA.localeCompare(claveB);
      });

      // Imprimir partidas agrupadas
      for (const partidaObj of partidasOrdenadas) {
        const { partida, sumaMeses, nombre_partida, unidad, claveFinanciera } = partidaObj;
        const fila = hojaPrincipal.getRow(filaActual);
        hojaPrincipal.getCell(`A${filaActual}`).value = `${partida.clave_partida}`;
        hojaPrincipal.getCell(`B${filaActual}`).value = `${unidad}`;
        hojaPrincipal.mergeCells(`C${filaActual}:E${filaActual}`);
        hojaPrincipal.getCell(`C${filaActual}`).value = `${nombre_partida}`;
        hojaPrincipal.getCell(`F${filaActual}`).value = `${claveFinanciera}`;
        hojaPrincipal.getCell(`G${filaActual}`).numFmt = '#,##0.00';
        hojaPrincipal.getCell(`G${filaActual}`).alignment = {horizontal:'right', vertical:'middle'};
        
        // Calcular la suma de los meses para la columna G
        const totalFila = sumaMeses.reduce((acc: Decimal, val: Decimal) => acc.plus(val), new Decimal(0));
        hojaPrincipal.getCell(`G${filaActual}`).value = Number(totalFila.toFixed(2));
        
        // Acumular para el total general
        sumaGeneral = sumaGeneral.plus(totalFila);
        
        for (let i = 0; i < 12; i++) {
          const cell = fila.getCell(8 + i);
          cell.value = Number(sumaMeses[i].toFixed(2));
          cell.numFmt = '#,##0.00';
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          // Acumular para el total general de meses
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
      hojaPrincipal.mergeCells(`A${filaActual}:F${filaActual}`);
      hojaPrincipal.getCell(`A${filaActual}`).value = `Total general`;
      hojaPrincipal.getCell(`G${filaActual}`).value = Number(sumaGeneral.toFixed(2));
      hojaPrincipal.getCell(`G${filaActual}`).numFmt = '#,##0.00';
      hojaPrincipal.getCell(`G${filaActual}`).border = hojaPrincipal.getCell(`A${filaActual}`).border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      totalGeneralMeses.forEach((suma, idx) => {
        const cell = hojaPrincipal.getCell(filaActual, 8 + idx);
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
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Presupuesto_General_${financiamiento.nombre_financiamiento}.xlsx`);
      res.setHeader('Content-Length', buffer.byteLength);
      res.send(buffer);
      return;
    }
    // --- FIN LÓGICA PARA FORMATO PRESUPUESTAL GENERAL ---

    // --- FIN NUEVA LÓGICA ---

    // Filtrar por área y financiamiento si se proporciona
    const where: any = { ct_area_id: id_areas };
    if (ct_financiamiento_id) {
      where.ct_financiamiento_id = ct_financiamiento_id;
    }
    const presupuesto = await promette.dt_techo_presupuesto.findAll({
      where,
      include: [
        { model: promette.ct_capitulo, as: "ct_capitulo", attributes: ["clave_capitulo", "nombre_capitulo"] },
        { model: promette.rl_area_financiero, as: "ct_area", attributes: ["id_area_fin", "id_financiero", "id_area_infra"] },
        { model: promette.ct_financiamiento, as: "ct_financiamiento", attributes: ["id_financiamiento", "nombre_financiamiento", "estado"] },
      ],
      order: [["ct_capitulo_id", "ASC"]]
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
    hojaPrincipal.getCell('A2').value = 'ANTEPROYECTO DE PRESUPUESTO DE EGRESOS 2026';
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
      hojaPrincipal.getCell('B7').value = nombreUnidad;
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
    hojaPrincipal.getCell('F9').value = 'Propuesta 2026';
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

    // --- AGRUPAR POR PARTIDA Y SUMAR CANTIDADES ---
    // Mapa para agrupar por clave_partida y por capítulo/financiamiento
    const partidasAgrupadas: Record<string, { registro: any, partida: any, sumaCantidad: Decimal, sumaMeses: Decimal[], nombre_partida: string, capitulo: any, financiamiento: any }> = {};
    for (let i = 0; i < presupuesto.length; i++) {
      const registro = presupuesto[i];
      const capitulo = registro.ct_capitulo;
      const financiamiento = registro.ct_financiamiento;
      // Obtener productos de la partida
      const productos = await promette.rl_producto_requisicion.findAll({
        where: { dt_techo_id: registro.id_techo },
        include: [{
          model: promette.ct_producto_consumible,
          as: "ct_producto",
          attributes: ["id_producto", "ct_partida_id", "nombre_producto", "precio"],
        }],
      });
      for (const prod of productos) {
        const partida = await promette.ct_partida.findOne({ where: { id_partida: prod.ct_producto.ct_partida_id } });
        const clave = `${capitulo.clave_capitulo}|${capitulo.nombre_capitulo}|${financiamiento.nombre_financiamiento}|${partida.clave_partida}`;
        if (!partidasAgrupadas[clave]) {
          partidasAgrupadas[clave] = {
            registro,
            partida,
            sumaCantidad: new Decimal(0),
            sumaMeses: Array.from({ length: 12 }, () => new Decimal(0)),
            nombre_partida: partida.nombre_partida,
            capitulo,
            financiamiento
          };
        }
        // Sumar cantidades y meses
        partidasAgrupadas[clave].sumaCantidad = partidasAgrupadas[clave].sumaCantidad.plus(prod.cantidad || 0);
        const mesIndex = (prod.mes ?? 0) - 1;
        if (mesIndex >= 0 && mesIndex < 12) {
          const totalMes = new Decimal(prod.total || 0);
          partidasAgrupadas[clave].sumaMeses[mesIndex] = partidasAgrupadas[clave].sumaMeses[mesIndex].plus(totalMes);
        }
      }
    }
    // --- FIN AGRUPACIÓN ---

    // Agrupar por capítulo y financiamiento para imprimir en bloques
    const agrupadoPorCapitulo: Record<string, any[]> = {};
    for (const clave in partidasAgrupadas) {
      const { capitulo, financiamiento } = partidasAgrupadas[clave];
      const capKey = `${capitulo.clave_capitulo}|${capitulo.nombre_capitulo}|${financiamiento.nombre_financiamiento}`;
      if (!agrupadoPorCapitulo[capKey]) agrupadoPorCapitulo[capKey] = [];
      agrupadoPorCapitulo[capKey].push(partidasAgrupadas[clave]);
    }

    // Imprimir por bloques de capítulo y financiamiento
    for (const capKey of Object.keys(agrupadoPorCapitulo)) {
      // Ordenar las partidas de menor a mayor por clave_partida
      const partidas = agrupadoPorCapitulo[capKey].sort((a, b) => {
        const claveA = a.partida.clave_partida;
        const claveB = b.partida.clave_partida;
        // Si las claves son numéricas, comparar como números
        if (!isNaN(Number(claveA)) && !isNaN(Number(claveB))) {
          return Number(claveA) - Number(claveB);
        }
        // Si no, comparar como string
        return claveA.localeCompare(claveB);
      });
      const [claveCap, nombreCap, nombreFin] = capKey.split('|');
      hojaPrincipal.mergeCells(`A${filaActual}:R${filaActual}`);
      hojaPrincipal.getCell(`A${filaActual}`).value = `Capítulo ${claveCap} - ${nombreCap} (${nombreFin})`;
      hojaPrincipal.getCell(`A${filaActual}`).border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      filaActual++;
      let sumaCapitulo = new Decimal(0);
      let sumMesesCapitulo: Decimal[] = Array.from({ length: 12 }, () => new Decimal(0));
      
      for (const partidaObj of partidas) {
        const { partida, sumaMeses, nombre_partida, registro } = partidaObj;
        const fila = hojaPrincipal.getRow(filaActual);
        hojaPrincipal.getCell(`A${filaActual}`).value = `${partida.clave_partida}`;
        hojaPrincipal.getCell(`B${filaActual}`).value = `${registro.ct_financiamiento.nombre_financiamiento}`;
        hojaPrincipal.mergeCells(`C${filaActual}:E${filaActual}`);
        hojaPrincipal.getCell(`C${filaActual}`).value = `${nombre_partida}`;
        hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.00';
        hojaPrincipal.getCell(`F${filaActual}`).alignment = {horizontal:'right', vertical:'middle'}
        
        // Calcular la suma de los meses para la columna F
        const totalFila = sumaMeses.reduce((acc: Decimal, val: Decimal) => acc.plus(val), new Decimal(0));
        hojaPrincipal.getCell(`F${filaActual}`).value = Number(totalFila.toFixed(2));
        
        // Acumular para el total del capítulo
        sumaCapitulo = sumaCapitulo.plus(totalFila);
        
        for (let i = 0; i < 12; i++) {
          const cell = fila.getCell(7 + i);
          cell.value = Number(sumaMeses[i].toFixed(2));
          cell.numFmt = '#,##0.00';
          cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          };
          cell.alignment = { horizontal: 'right', vertical: 'middle' }
          // Acumular para el total de meses del capítulo
          sumMesesCapitulo[i] = sumMesesCapitulo[i].plus(sumaMeses[i]);
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
      // Total del capítulo
      hojaPrincipal.mergeCells(`A${filaActual}:E${filaActual}`);
      hojaPrincipal.getCell(`A${filaActual}`).value = `Total Capítulo ${claveCap} - ${nombreCap}`;
      hojaPrincipal.getCell(`F${filaActual}`).value = Number(sumaCapitulo.toFixed(2));
      hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.00';
      hojaPrincipal.getCell(`A${filaActual}`).border = hojaPrincipal.getCell(`F${filaActual}`).border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      for (let i = 0; i < 12; i++) {
        const cell = hojaPrincipal.getCell(filaActual, 7 + i);
        cell.value = Number(sumMesesCapitulo[i].toFixed(2));
        cell.numFmt = '#,##0.00';
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      }
      filaActual += 2;
      // Acumular al total general
      sumaGeneral = sumaGeneral.plus(sumaCapitulo);
      for(let i=0; i<12; i++){
        totalGeneralMeses[i] = totalGeneralMeses[i].plus(sumMesesCapitulo[i]);
      }
    }

  // Al final, el total general
  hojaPrincipal.mergeCells(`A${filaActual}:E${filaActual}`);
  hojaPrincipal.getCell(`A${filaActual}`).value = `Total general`;
  hojaPrincipal.getCell(`F${filaActual}`).value = Number(sumaGeneral.toFixed(2));
  hojaPrincipal.getCell(`F${filaActual}`).numFmt = '#,##0.00';
  hojaPrincipal.getCell(`F${filaActual}`).border = hojaPrincipal.getCell(`A${filaActual}`).border = {
    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
  };
  totalGeneralMeses.forEach((suma, idx) => {
    const cell = hojaPrincipal.getCell(filaActual, 7 + idx);
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

  if (id_areas.length === 1) {
    if (!hojaPrincipal.getCell(`A${filaActual + 3}`).isMerged) {
      hojaPrincipal.mergeCells(`A${filaActual + 3}:E${filaActual + 3}`);
    }
    hojaPrincipal.getCell(`A${filaActual + 3}`).value = 'Elaboró';
    hojaPrincipal.getCell(`A${filaActual + 3}`).alignment = { horizontal: 'center' };
    hojaPrincipal.mergeCells(`A${filaActual + 5}`, `E${filaActual + 5}`);
    hojaPrincipal.getCell(`A${filaActual + 5}`).value = req.body.nombre_usuario;
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

  // >>> ADDING NEW SHEETS
  await crearHojasPorCapituloFinanciamiento(workbook, presupuesto, promette, id_areas, nombreUnidad);
  // <<< END ADDING NEW SHEETS

  // Guardar y enviar el archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const currentDate = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Techos_Presupuestales_${currentDate}.xlsx`);
  res.setHeader('Content-Length', buffer.byteLength);
  res.send(buffer);
} catch (error) {
  console.error(error);
  const mensaje = (error as Error).message || "Error al exportar los techos presupuestales a Excel";
  res.status(500).json({ msg: mensaje });
}
}

async function crearHojasPorCapituloFinanciamiento(workbook: ExcelJS.Workbook, presupuesto: any[], promette: any, id_areas: number[], unidad: string) {
  const imagePath = path.resolve(__dirname, '../../public/USET.png');
  const imageBuffer = fs.readFileSync(imagePath);

  // Agrupar por partida (clave_partida + nombre_partida + financiamiento)
  const partidasAgrupadas: Record<string, { partida: any, nombre_partida: string, clave_partida: string, financiamiento: string, productos: any[], area: any }> = {};
  for (const reg of presupuesto) {
    // Obtener productos de la partida
    const productos = await promette.rl_producto_requisicion.findAll({
      where: { dt_techo_id: reg.id_techo },
      include: [{
        model: promette.ct_producto_consumible,
        as: "ct_producto",
        attributes: ["id_producto", "ct_partida_id", "nombre_producto", "precio", "ct_unidad_id"],
      }],
    });
    for (const prod of productos) {
      const idPartida = prod.ct_producto.ct_partida_id;
      const clavePartida = await getClavePartida(promette, idPartida);
      const nombrePartida = await getNombrePartida(promette, idPartida);
      const just = await getJustificacion(promette, idPartida, reg.ct_area_id, reg.id_techo);
      const financiamiento = reg.ct_financiamiento.nombre_financiamiento;
      // Obtener la unidad de medida correctamente desde ct_unidad_id
      let nombreUnidadMedida = '';
      const ctUnidadId = prod.ct_producto.ct_unidad_id;
      if (ctUnidadId) {
        const unidad = await promette.ct_unidad_medida.findAll({ where: { id_unidad: ctUnidadId } });
        nombreUnidadMedida = unidad[0]?.nombre_unidad || '';
      }
      const key = `${clavePartida}|${nombrePartida}|${financiamiento}`;
      // Agrupar productos por descripción y unidad de medida dentro de cada partida
      const descKey = `${prod.ct_producto.id_producto}|${prod.ct_producto.nombre_producto}|${nombreUnidadMedida}`;
      if (!partidasAgrupadas[key]) {
        partidasAgrupadas[key] = {
          partida: clavePartida,
          nombre_partida: nombrePartida,
          clave_partida: clavePartida,
          financiamiento: financiamiento,
          productos: [],
          area: reg.ct_area
        };
      }
      if (!partidasAgrupadas[key].productos) {
        partidasAgrupadas[key].productos = [];
      }
      if (!partidasAgrupadas[key].productos.find(p => p.id_producto === prod.ct_producto.id_producto && p.descripcion === prod.ct_producto.nombre_producto && p.unidad_medida === nombreUnidadMedida)) {
        partidasAgrupadas[key].productos.push({
          id_producto: prod.ct_producto.id_producto,
          descripcion: prod.ct_producto.nombre_producto,
          unidad_medida: nombreUnidadMedida,
          cantidad: Number(prod.cantidad) || 0,
          precio: prod.ct_producto.precio || 0,
          importe: 0,
          justificacion: just ? [just] : []
        });
      } else {
        // Si ya existe, solo sumar la cantidad y agregar justificación si es necesario, pero NO sobrescribir el precio
        const existingProd = partidasAgrupadas[key].productos.find(p => p.id_producto === prod.ct_producto.id_producto && p.descripcion === prod.ct_producto.nombre_producto && p.unidad_medida === nombreUnidadMedida);
        if (existingProd) {
          existingProd.cantidad += Number(prod.cantidad) || 0;
          if (just && !existingProd.justificacion.includes(just)) {
            existingProd.justificacion.push(just);
          }
        }
      }
      // Imprimir en consola la unidad de medida de cada producto
      console.log(`Producto: ${prod.ct_producto.nombre_producto} | Unidad de medida: ${nombreUnidadMedida}`);
    }
  }

  // Crear una hoja por cada partida
  for (const key of Object.keys(partidasAgrupadas).sort((a, b) => {
    // Ordenar por clave de partida (primer campo antes del primer '|')
    const claveA = a.split('|')[0];
    const claveB = b.split('|')[0];
    // Si las claves son numéricas, comparar como números
    if (!isNaN(Number(claveA)) && !isNaN(Number(claveB))) {
      return Number(claveA) - Number(claveB);
    }
    // Si no, comparar como string
    return claveA.localeCompare(claveB);
  })) {
    const partidaObj = partidasAgrupadas[key];
    const nombreHojaBase = `${partidaObj.clave_partida} ${partidaObj.nombre_partida}`.substring(0, 31);
    let nombreHoja = nombreHojaBase;
    let contador = 1;
    while (workbook.getWorksheet(nombreHoja)) {
      const sufijo = ` (${contador})`;
      nombreHoja = `${nombreHojaBase.substring(0, 31 - sufijo.length)}${sufijo}`;
      contador++;
    }
    const hoja = workbook.addWorksheet(nombreHoja);
    hoja.properties.showGridLines = false;
    const logoUSET = workbook.addImage({ buffer: imageBuffer, extension: 'png' });
    hoja.addImage(logoUSET, { tl: { col: 0, row: 0 }, ext: { width: 430, height: 65 } });
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => hoja.getColumn(col).width = 17);
    hoja.getColumn('A').width = 40; // Doble del valor típico para que quepa más texto
    hoja.getColumn('F').width = 40; // Doble para justificación
    hoja.mergeCells('A1:F1');
    hoja.getCell('A1').value = 'GOBIERNO DEL ESTADO DE TLAXCALA';
    hoja.getCell('A1').alignment = { horizontal: 'center' };
    hoja.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('A2:F2');
    hoja.getCell('A2').value = 'ANTEPROYECTO DE PRESUPUESTO DE EGRESOS 2026';
    hoja.getCell('A2').alignment = { horizontal: 'center' };
    hoja.getCell('A2').border = { left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('A3:F3');
    hoja.getCell('A3').value = `DESGLOSE DE CONCEPTO POR PARTIDA`;
    hoja.getCell('A3').alignment = { horizontal: 'center' };
    hoja.getCell('A3').border = { left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('A4:F4');
    hoja.getCell('A4').border = { left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('A5:F5');
    hoja.getCell('A5').border = { left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells('A6:F6');
    hoja.getCell('A6').border = { bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    let fila = 8;
    hoja.mergeCells(`A8:B8`);
    hoja.getCell(`A${fila}`).value = 'Dependencia o Entidad:';
    hoja.getCell(`A${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells(`C8:F8`);
    hoja.getCell(`C${fila}`).value = 'Unidad de Servicios Educativos del Estado de Tlaxcala';
    hoja.getCell(`C${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    fila++;
    hoja.mergeCells(`A9:B9`);
    hoja.getCell(`A${fila}`).value = 'Fuente de Financiamiento:';
    hoja.getCell(`A${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.mergeCells(`C9:F9`);
    hoja.getCell(`C${fila}`).value = partidaObj.financiamiento;
    hoja.getCell(`C${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    fila++;
    if (id_areas.length === 1) {
      hoja.mergeCells(`A10:B10`);
      hoja.getCell(`A${fila}`).value = 'Unidad Administrativa:';
      hoja.getCell(`A${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hoja.mergeCells(`C10:F10`);
      hoja.getCell(`C${fila}`).value = unidad;
      hoja.getCell(`C${fila}`).alignment = { horizontal: 'left' };
      hoja.getCell(`C${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      fila++;
      // Agregar fila de Partida
      hoja.mergeCells(`A${fila}:B${fila}`);
      hoja.getCell(`A${fila}`).value = 'Partida:';
      hoja.getCell(`A${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hoja.mergeCells(`C${fila}:F${fila}`);
      hoja.getCell(`C${fila}`).value = `${partidaObj.clave_partida} - ${partidaObj.nombre_partida}`;
      hoja.getCell(`C${fila}`).alignment = { horizontal: 'left' };
      hoja.getCell(`C${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      fila++;
    }
    fila++;
    hoja.getCell(`A${fila}`).value = 'Descripción';
    hoja.getCell(`A${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell(`A${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    hoja.getCell(`B${fila}`).value = 'Unidad de Medida';
    hoja.getCell(`B${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell(`B${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    hoja.getCell(`C${fila}`).value = 'Cantidad';
    hoja.getCell(`C${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell(`C${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    hoja.getCell(`D${fila}`).value = 'Precio Unitario';
    hoja.getCell(`D${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell(`D${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    hoja.getCell(`E${fila}`).value = 'Importe';
    hoja.getCell(`E${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell(`E${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    hoja.getCell(`F${fila}`).value = 'Justificación';
    hoja.getCell(`F${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell(`F${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    fila++;
    let totalPartida = new Decimal(0);
    for (const prod of partidaObj.productos) {
      hoja.getCell(`A${fila}`).value = prod.descripcion;
      hoja.getCell(`A${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hoja.getCell(`A${fila}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      hoja.getCell(`B${fila}`).value = prod.unidad_medida;
      hoja.getCell(`B${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hoja.getCell(`B${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      hoja.getCell(`C${fila}`).value = prod.cantidad;
      hoja.getCell(`C${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hoja.getCell(`C${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      hoja.getCell(`D${fila}`).value = Number(prod.precio);
      hoja.getCell(`D${fila}`).numFmt = '#,##0.000';
      hoja.getCell(`D${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hoja.getCell(`D${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      hoja.getCell(`E${fila}`).value = Number(prod.cantidad) * Number(prod.precio);
      hoja.getCell(`E${fila}`).numFmt = '#,##0.000';
      hoja.getCell(`E${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hoja.getCell(`E${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      hoja.getCell(`F${fila}`).value = Array.isArray(prod.justificacion) ? prod.justificacion.join('\n') : prod.justificacion;
      hoja.getCell(`F${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      hoja.getCell(`F${fila}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      totalPartida = totalPartida.plus(Number(prod.cantidad) * Number(prod.precio));
      fila++;
    }
    hoja.mergeCells(`A${fila}:D${fila}`);
    hoja.getCell(`A${fila}`).value = 'Total partida';
    hoja.getCell(`A${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell(`A${fila}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    hoja.mergeCells(`E${fila}:F${fila}`);
    hoja.getCell(`E${fila}`).value = Number(totalPartida.toFixed(3));
    hoja.getCell(`E${fila}`).numFmt = '#,##0.000';
    hoja.getCell(`E${fila}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    hoja.getCell(`E${fila}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  }
}

async function getJustificacion(promette: any, ct_partida_id: number, ct_area_id: number, dt_techo_id: number) {
  if (!ct_partida_id) return 'No hay justificación registrada';
  const just = await promette.rl_justificacion.findOne({
    where: { ct_partida_id, ct_area_id, dt_techo_id }
  });
  return (just?.justificacion || 'No hay justificación registrada').toUpperCase();
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
