import type { Sequelize } from "sequelize";
import { ct_accion as _ct_accion } from "./ct_accion";
import type { ct_accionAttributes, ct_accionCreationAttributes } from "./ct_accion";
import { ct_area as _ct_area } from "./ct_area";
import type { ct_areaAttributes, ct_areaCreationAttributes } from "./ct_area";
import { ct_capitulo as _ct_capitulo } from "./ct_capitulo";
import type { ct_capituloAttributes, ct_capituloCreationAttributes } from "./ct_capitulo";
import { ct_clasificacion_prioridad as _ct_clasificacion_prioridad } from "./ct_clasificacion_prioridad";
import type { ct_clasificacion_prioridadAttributes, ct_clasificacion_prioridadCreationAttributes } from "./ct_clasificacion_prioridad";
import { ct_codigos_postales as _ct_codigos_postales } from "./ct_codigos_postales";
import type { ct_codigos_postalesAttributes, ct_codigos_postalesCreationAttributes } from "./ct_codigos_postales";
import { ct_conocimiento_escalafon as _ct_conocimiento_escalafon } from "./ct_conocimiento_escalafon";
import type { ct_conocimiento_escalafonAttributes, ct_conocimiento_escalafonCreationAttributes } from "./ct_conocimiento_escalafon";
import { ct_constancia_curso as _ct_constancia_curso } from "./ct_constancia_curso";
import type { ct_constancia_cursoAttributes, ct_constancia_cursoCreationAttributes } from "./ct_constancia_curso";
import { ct_consumible_departamento as _ct_consumible_departamento } from "./ct_consumible_departamento";
import type { ct_consumible_departamentoAttributes, ct_consumible_departamentoCreationAttributes } from "./ct_consumible_departamento";
import { ct_consumible_direccion as _ct_consumible_direccion } from "./ct_consumible_direccion";
import type { ct_consumible_direccionAttributes, ct_consumible_direccionCreationAttributes } from "./ct_consumible_direccion";
import { ct_consumible_factura as _ct_consumible_factura } from "./ct_consumible_factura";
import type { ct_consumible_facturaAttributes, ct_consumible_facturaCreationAttributes } from "./ct_consumible_factura";
import { ct_consumibles_proveedor as _ct_consumibles_proveedor } from "./ct_consumibles_proveedor";
import type { ct_consumibles_proveedorAttributes, ct_consumibles_proveedorCreationAttributes } from "./ct_consumibles_proveedor";
import { ct_correspondencia_estado as _ct_correspondencia_estado } from "./ct_correspondencia_estado";
import type { ct_correspondencia_estadoAttributes, ct_correspondencia_estadoCreationAttributes } from "./ct_correspondencia_estado";
import { ct_departamento_sistema as _ct_departamento_sistema } from "./ct_departamento_sistema";
import type { ct_departamento_sistemaAttributes, ct_departamento_sistemaCreationAttributes } from "./ct_departamento_sistema";
import { ct_direccion_sistema as _ct_direccion_sistema } from "./ct_direccion_sistema";
import type { ct_direccion_sistemaAttributes, ct_direccion_sistemaCreationAttributes } from "./ct_direccion_sistema";
import { ct_dispositivo as _ct_dispositivo } from "./ct_dispositivo";
import type { ct_dispositivoAttributes, ct_dispositivoCreationAttributes } from "./ct_dispositivo";
import { ct_documentos_aneec as _ct_documentos_aneec } from "./ct_documentos_aneec";
import type { ct_documentos_aneecAttributes, ct_documentos_aneecCreationAttributes } from "./ct_documentos_aneec";
import { ct_financiamiento as _ct_financiamiento } from "./ct_financiamiento";
import type { ct_financiamientoAttributes, ct_financiamientoCreationAttributes } from "./ct_financiamiento";
import { ct_forma_entrega as _ct_forma_entrega } from "./ct_forma_entrega";
import type { ct_forma_entregaAttributes, ct_forma_entregaCreationAttributes } from "./ct_forma_entrega";
import { ct_grado_academico as _ct_grado_academico } from "./ct_grado_academico";
import type { ct_grado_academicoAttributes, ct_grado_academicoCreationAttributes } from "./ct_grado_academico";
import { ct_modulo as _ct_modulo } from "./ct_modulo";
import type { ct_moduloAttributes, ct_moduloCreationAttributes } from "./ct_modulo";
import { ct_municipio as _ct_municipio } from "./ct_municipio";
import type { ct_municipioAttributes, ct_municipioCreationAttributes } from "./ct_municipio";
import { ct_partida as _ct_partida } from "./ct_partida";
import type { ct_partidaAttributes, ct_partidaCreationAttributes } from "./ct_partida";
import { ct_producto_consumible as _ct_producto_consumible } from "./ct_producto_consumible";
import type { ct_producto_consumibleAttributes, ct_producto_consumibleCreationAttributes } from "./ct_producto_consumible";
import { ct_puesto as _ct_puesto } from "./ct_puesto";
import type { ct_puestoAttributes, ct_puestoCreationAttributes } from "./ct_puesto";
import { ct_sindicato as _ct_sindicato } from "./ct_sindicato";
import type { ct_sindicatoAttributes, ct_sindicatoCreationAttributes } from "./ct_sindicato";
import { ct_tabla as _ct_tabla } from "./ct_tabla";
import type { ct_tablaAttributes, ct_tablaCreationAttributes } from "./ct_tabla";
import { ct_unidad_medida as _ct_unidad_medida } from "./ct_unidad_medida";
import type { ct_unidad_medidaAttributes, ct_unidad_medidaCreationAttributes } from "./ct_unidad_medida";
import { ct_usuario as _ct_usuario } from "./ct_usuario";
import type { ct_usuarioAttributes, ct_usuarioCreationAttributes } from "./ct_usuario";
import { dt_aspirante_aneec as _dt_aspirante_aneec } from "./dt_aspirante_aneec";
import type { dt_aspirante_aneecAttributes, dt_aspirante_aneecCreationAttributes } from "./dt_aspirante_aneec";
import { dt_bitacora as _dt_bitacora } from "./dt_bitacora";
import type { dt_bitacoraAttributes, dt_bitacoraCreationAttributes } from "./dt_bitacora";
import { dt_constancia_curso_persona as _dt_constancia_curso_persona } from "./dt_constancia_curso_persona";
import type { dt_constancia_curso_personaAttributes, dt_constancia_curso_personaCreationAttributes } from "./dt_constancia_curso_persona";
import { dt_consumible_entrega as _dt_consumible_entrega } from "./dt_consumible_entrega";
import type { dt_consumible_entregaAttributes, dt_consumible_entregaCreationAttributes } from "./dt_consumible_entrega";
import { dt_consumible_inventario as _dt_consumible_inventario } from "./dt_consumible_inventario";
import type { dt_consumible_inventarioAttributes, dt_consumible_inventarioCreationAttributes } from "./dt_consumible_inventario";
import { dt_correspondencia as _dt_correspondencia } from "./dt_correspondencia";
import type { dt_correspondenciaAttributes, dt_correspondenciaCreationAttributes } from "./dt_correspondencia";
import { dt_diagnostico_aneec as _dt_diagnostico_aneec } from "./dt_diagnostico_aneec";
import type { dt_diagnostico_aneecAttributes, dt_diagnostico_aneecCreationAttributes } from "./dt_diagnostico_aneec";
import { dt_dictamen_escalafon as _dt_dictamen_escalafon } from "./dt_dictamen_escalafon";
import type { dt_dictamen_escalafonAttributes, dt_dictamen_escalafonCreationAttributes } from "./dt_dictamen_escalafon";
import { dt_funcion as _dt_funcion } from "./dt_funcion";
import type { dt_funcionAttributes, dt_funcionCreationAttributes } from "./dt_funcion";
import { dt_informes_aneec as _dt_informes_aneec } from "./dt_informes_aneec";
import type { dt_informes_aneecAttributes, dt_informes_aneecCreationAttributes } from "./dt_informes_aneec";
import { dt_planeaciones_aneec as _dt_planeaciones_aneec } from "./dt_planeaciones_aneec";
import type { dt_planeaciones_aneecAttributes, dt_planeaciones_aneecCreationAttributes } from "./dt_planeaciones_aneec";
import { dt_proyecto_anual as _dt_proyecto_anual } from "./dt_proyecto_anual";
import type { dt_proyecto_anualAttributes, dt_proyecto_anualCreationAttributes } from "./dt_proyecto_anual";
import { dt_techo_presupuesto as _dt_techo_presupuesto } from "./dt_techo_presupuesto";
import type { dt_techo_presupuestoAttributes, dt_techo_presupuestoCreationAttributes } from "./dt_techo_presupuesto";
import { rl_analista_unidad as _rl_analista_unidad } from "./rl_analista_unidad";
import type { rl_analista_unidadAttributes, rl_analista_unidadCreationAttributes } from "./rl_analista_unidad";
import { rl_area_financiero as _rl_area_financiero } from "./rl_area_financiero";
import type { rl_area_financieroAttributes, rl_area_financieroCreationAttributes } from "./rl_area_financiero";
import { rl_correspondencia_usuario_estado as _rl_correspondencia_usuario_estado } from "./rl_correspondencia_usuario_estado";
import type { rl_correspondencia_usuario_estadoAttributes, rl_correspondencia_usuario_estadoCreationAttributes } from "./rl_correspondencia_usuario_estado";
import { rl_entrega_formato as _rl_entrega_formato } from "./rl_entrega_formato";
import type { rl_entrega_formatoAttributes, rl_entrega_formatoCreationAttributes } from "./rl_entrega_formato";
import { rl_justificacion as _rl_justificacion } from "./rl_justificacion";
import type { rl_justificacionAttributes, rl_justificacionCreationAttributes } from "./rl_justificacion";
import { rl_modulo_area as _rl_modulo_area } from "./rl_modulo_area";
import type { rl_modulo_areaAttributes, rl_modulo_areaCreationAttributes } from "./rl_modulo_area";
import { rl_partida_area as _rl_partida_area } from "./rl_partida_area";
import type { rl_partida_areaAttributes, rl_partida_areaCreationAttributes } from "./rl_partida_area";
import { rl_producto_area as _rl_producto_area } from "./rl_producto_area";
import type { rl_producto_areaAttributes, rl_producto_areaCreationAttributes } from "./rl_producto_area";
import { rl_producto_requisicion as _rl_producto_requisicion } from "./rl_producto_requisicion";
import type { rl_producto_requisicionAttributes, rl_producto_requisicionCreationAttributes } from "./rl_producto_requisicion";
import { rl_puesto_funcion as _rl_puesto_funcion } from "./rl_puesto_funcion";
import type { rl_puesto_funcionAttributes, rl_puesto_funcionCreationAttributes } from "./rl_puesto_funcion";
import { rl_usuario_funcion as _rl_usuario_funcion } from "./rl_usuario_funcion";
import type { rl_usuario_funcionAttributes, rl_usuario_funcionCreationAttributes } from "./rl_usuario_funcion";
import { rl_usuario_puesto as _rl_usuario_puesto } from "./rl_usuario_puesto";
import type { rl_usuario_puestoAttributes, rl_usuario_puestoCreationAttributes } from "./rl_usuario_puesto";

export {
  _ct_accion as ct_accion,
  _ct_area as ct_area,
  _ct_capitulo as ct_capitulo,
  _ct_clasificacion_prioridad as ct_clasificacion_prioridad,
  _ct_codigos_postales as ct_codigos_postales,
  _ct_conocimiento_escalafon as ct_conocimiento_escalafon,
  _ct_constancia_curso as ct_constancia_curso,
  _ct_consumible_departamento as ct_consumible_departamento,
  _ct_consumible_direccion as ct_consumible_direccion,
  _ct_consumible_factura as ct_consumible_factura,
  _ct_consumibles_proveedor as ct_consumibles_proveedor,
  _ct_correspondencia_estado as ct_correspondencia_estado,
  _ct_departamento_sistema as ct_departamento_sistema,
  _ct_direccion_sistema as ct_direccion_sistema,
  _ct_dispositivo as ct_dispositivo,
  _ct_documentos_aneec as ct_documentos_aneec,
  _ct_financiamiento as ct_financiamiento,
  _ct_forma_entrega as ct_forma_entrega,
  _ct_grado_academico as ct_grado_academico,
  _ct_modulo as ct_modulo,
  _ct_municipio as ct_municipio,
  _ct_partida as ct_partida,
  _ct_producto_consumible as ct_producto_consumible,
  _ct_puesto as ct_puesto,
  _ct_sindicato as ct_sindicato,
  _ct_tabla as ct_tabla,
  _ct_unidad_medida as ct_unidad_medida,
  _ct_usuario as ct_usuario,
  _dt_aspirante_aneec as dt_aspirante_aneec,
  _dt_bitacora as dt_bitacora,
  _dt_constancia_curso_persona as dt_constancia_curso_persona,
  _dt_consumible_entrega as dt_consumible_entrega,
  _dt_consumible_inventario as dt_consumible_inventario,
  _dt_correspondencia as dt_correspondencia,
  _dt_diagnostico_aneec as dt_diagnostico_aneec,
  _dt_dictamen_escalafon as dt_dictamen_escalafon,
  _dt_funcion as dt_funcion,
  _dt_informes_aneec as dt_informes_aneec,
  _dt_planeaciones_aneec as dt_planeaciones_aneec,
  _dt_proyecto_anual as dt_proyecto_anual,
  _dt_techo_presupuesto as dt_techo_presupuesto,
  _rl_analista_unidad as rl_analista_unidad,
  _rl_area_financiero as rl_area_financiero,
  _rl_correspondencia_usuario_estado as rl_correspondencia_usuario_estado,
  _rl_entrega_formato as rl_entrega_formato,
  _rl_justificacion as rl_justificacion,
  _rl_modulo_area as rl_modulo_area,
  _rl_partida_area as rl_partida_area,
  _rl_producto_area as rl_producto_area,
  _rl_producto_requisicion as rl_producto_requisicion,
  _rl_puesto_funcion as rl_puesto_funcion,
  _rl_usuario_funcion as rl_usuario_funcion,
  _rl_usuario_puesto as rl_usuario_puesto,
};

export type {
  ct_accionAttributes,
  ct_accionCreationAttributes,
  ct_areaAttributes,
  ct_areaCreationAttributes,
  ct_capituloAttributes,
  ct_capituloCreationAttributes,
  ct_clasificacion_prioridadAttributes,
  ct_clasificacion_prioridadCreationAttributes,
  ct_codigos_postalesAttributes,
  ct_codigos_postalesCreationAttributes,
  ct_conocimiento_escalafonAttributes,
  ct_conocimiento_escalafonCreationAttributes,
  ct_constancia_cursoAttributes,
  ct_constancia_cursoCreationAttributes,
  ct_consumible_departamentoAttributes,
  ct_consumible_departamentoCreationAttributes,
  ct_consumible_direccionAttributes,
  ct_consumible_direccionCreationAttributes,
  ct_consumible_facturaAttributes,
  ct_consumible_facturaCreationAttributes,
  ct_consumibles_proveedorAttributes,
  ct_consumibles_proveedorCreationAttributes,
  ct_correspondencia_estadoAttributes,
  ct_correspondencia_estadoCreationAttributes,
  ct_departamento_sistemaAttributes,
  ct_departamento_sistemaCreationAttributes,
  ct_direccion_sistemaAttributes,
  ct_direccion_sistemaCreationAttributes,
  ct_dispositivoAttributes,
  ct_dispositivoCreationAttributes,
  ct_documentos_aneecAttributes,
  ct_documentos_aneecCreationAttributes,
  ct_financiamientoAttributes,
  ct_financiamientoCreationAttributes,
  ct_forma_entregaAttributes,
  ct_forma_entregaCreationAttributes,
  ct_grado_academicoAttributes,
  ct_grado_academicoCreationAttributes,
  ct_moduloAttributes,
  ct_moduloCreationAttributes,
  ct_municipioAttributes,
  ct_municipioCreationAttributes,
  ct_partidaAttributes,
  ct_partidaCreationAttributes,
  ct_producto_consumibleAttributes,
  ct_producto_consumibleCreationAttributes,
  ct_puestoAttributes,
  ct_puestoCreationAttributes,
  ct_sindicatoAttributes,
  ct_sindicatoCreationAttributes,
  ct_tablaAttributes,
  ct_tablaCreationAttributes,
  ct_unidad_medidaAttributes,
  ct_unidad_medidaCreationAttributes,
  ct_usuarioAttributes,
  ct_usuarioCreationAttributes,
  dt_aspirante_aneecAttributes,
  dt_aspirante_aneecCreationAttributes,
  dt_bitacoraAttributes,
  dt_bitacoraCreationAttributes,
  dt_constancia_curso_personaAttributes,
  dt_constancia_curso_personaCreationAttributes,
  dt_consumible_entregaAttributes,
  dt_consumible_entregaCreationAttributes,
  dt_consumible_inventarioAttributes,
  dt_consumible_inventarioCreationAttributes,
  dt_correspondenciaAttributes,
  dt_correspondenciaCreationAttributes,
  dt_diagnostico_aneecAttributes,
  dt_diagnostico_aneecCreationAttributes,
  dt_dictamen_escalafonAttributes,
  dt_dictamen_escalafonCreationAttributes,
  dt_funcionAttributes,
  dt_funcionCreationAttributes,
  dt_informes_aneecAttributes,
  dt_informes_aneecCreationAttributes,
  dt_planeaciones_aneecAttributes,
  dt_planeaciones_aneecCreationAttributes,
  dt_proyecto_anualAttributes,
  dt_proyecto_anualCreationAttributes,
  dt_techo_presupuestoAttributes,
  dt_techo_presupuestoCreationAttributes,
  rl_analista_unidadAttributes,
  rl_analista_unidadCreationAttributes,
  rl_area_financieroAttributes,
  rl_area_financieroCreationAttributes,
  rl_correspondencia_usuario_estadoAttributes,
  rl_correspondencia_usuario_estadoCreationAttributes,
  rl_entrega_formatoAttributes,
  rl_entrega_formatoCreationAttributes,
  rl_justificacionAttributes,
  rl_justificacionCreationAttributes,
  rl_modulo_areaAttributes,
  rl_modulo_areaCreationAttributes,
  rl_partida_areaAttributes,
  rl_partida_areaCreationAttributes,
  rl_producto_areaAttributes,
  rl_producto_areaCreationAttributes,
  rl_producto_requisicionAttributes,
  rl_producto_requisicionCreationAttributes,
  rl_puesto_funcionAttributes,
  rl_puesto_funcionCreationAttributes,
  rl_usuario_funcionAttributes,
  rl_usuario_funcionCreationAttributes,
  rl_usuario_puestoAttributes,
  rl_usuario_puestoCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const ct_accion = _ct_accion.initModel(sequelize);
  const ct_area = _ct_area.initModel(sequelize);
  const ct_capitulo = _ct_capitulo.initModel(sequelize);
  const ct_clasificacion_prioridad = _ct_clasificacion_prioridad.initModel(sequelize);
  const ct_codigos_postales = _ct_codigos_postales.initModel(sequelize);
  const ct_conocimiento_escalafon = _ct_conocimiento_escalafon.initModel(sequelize);
  const ct_constancia_curso = _ct_constancia_curso.initModel(sequelize);
  const ct_consumible_departamento = _ct_consumible_departamento.initModel(sequelize);
  const ct_consumible_direccion = _ct_consumible_direccion.initModel(sequelize);
  const ct_consumible_factura = _ct_consumible_factura.initModel(sequelize);
  const ct_consumibles_proveedor = _ct_consumibles_proveedor.initModel(sequelize);
  const ct_correspondencia_estado = _ct_correspondencia_estado.initModel(sequelize);
  const ct_departamento_sistema = _ct_departamento_sistema.initModel(sequelize);
  const ct_direccion_sistema = _ct_direccion_sistema.initModel(sequelize);
  const ct_dispositivo = _ct_dispositivo.initModel(sequelize);
  const ct_documentos_aneec = _ct_documentos_aneec.initModel(sequelize);
  const ct_financiamiento = _ct_financiamiento.initModel(sequelize);
  const ct_forma_entrega = _ct_forma_entrega.initModel(sequelize);
  const ct_grado_academico = _ct_grado_academico.initModel(sequelize);
  const ct_modulo = _ct_modulo.initModel(sequelize);
  const ct_municipio = _ct_municipio.initModel(sequelize);
  const ct_partida = _ct_partida.initModel(sequelize);
  const ct_producto_consumible = _ct_producto_consumible.initModel(sequelize);
  const ct_puesto = _ct_puesto.initModel(sequelize);
  const ct_sindicato = _ct_sindicato.initModel(sequelize);
  const ct_tabla = _ct_tabla.initModel(sequelize);
  const ct_unidad_medida = _ct_unidad_medida.initModel(sequelize);
  const ct_usuario = _ct_usuario.initModel(sequelize);
  const dt_aspirante_aneec = _dt_aspirante_aneec.initModel(sequelize);
  const dt_bitacora = _dt_bitacora.initModel(sequelize);
  const dt_constancia_curso_persona = _dt_constancia_curso_persona.initModel(sequelize);
  const dt_consumible_entrega = _dt_consumible_entrega.initModel(sequelize);
  const dt_consumible_inventario = _dt_consumible_inventario.initModel(sequelize);
  const dt_correspondencia = _dt_correspondencia.initModel(sequelize);
  const dt_diagnostico_aneec = _dt_diagnostico_aneec.initModel(sequelize);
  const dt_dictamen_escalafon = _dt_dictamen_escalafon.initModel(sequelize);
  const dt_funcion = _dt_funcion.initModel(sequelize);
  const dt_informes_aneec = _dt_informes_aneec.initModel(sequelize);
  const dt_planeaciones_aneec = _dt_planeaciones_aneec.initModel(sequelize);
  const dt_proyecto_anual = _dt_proyecto_anual.initModel(sequelize);
  const dt_techo_presupuesto = _dt_techo_presupuesto.initModel(sequelize);
  const rl_analista_unidad = _rl_analista_unidad.initModel(sequelize);
  const rl_area_financiero = _rl_area_financiero.initModel(sequelize);
  const rl_correspondencia_usuario_estado = _rl_correspondencia_usuario_estado.initModel(sequelize);
  const rl_entrega_formato = _rl_entrega_formato.initModel(sequelize);
  const rl_justificacion = _rl_justificacion.initModel(sequelize);
  const rl_modulo_area = _rl_modulo_area.initModel(sequelize);
  const rl_partida_area = _rl_partida_area.initModel(sequelize);
  const rl_producto_area = _rl_producto_area.initModel(sequelize);
  const rl_producto_requisicion = _rl_producto_requisicion.initModel(sequelize);
  const rl_puesto_funcion = _rl_puesto_funcion.initModel(sequelize);
  const rl_usuario_funcion = _rl_usuario_funcion.initModel(sequelize);
  const rl_usuario_puesto = _rl_usuario_puesto.initModel(sequelize);

  dt_bitacora.belongsTo(ct_accion, { as: "ct_accion", foreignKey: "ct_accion_id"});
  ct_accion.hasMany(dt_bitacora, { as: "dt_bitacoras", foreignKey: "ct_accion_id"});
  ct_area.belongsTo(ct_area, { as: "ct_area", foreignKey: "ct_area_id"});
  ct_area.hasMany(ct_area, { as: "ct_area_ct_areas", foreignKey: "ct_area_id"});
  ct_partida.belongsTo(ct_capitulo, { as: "ct_capitulo", foreignKey: "ct_capitulo_id"});
  ct_capitulo.hasMany(ct_partida, { as: "ct_partidas", foreignKey: "ct_capitulo_id"});
  dt_techo_presupuesto.belongsTo(ct_capitulo, { as: "ct_capitulo", foreignKey: "ct_capitulo_id"});
  ct_capitulo.hasMany(dt_techo_presupuesto, { as: "dt_techo_presupuestos", foreignKey: "ct_capitulo_id"});
  dt_correspondencia.belongsTo(ct_clasificacion_prioridad, { as: "ct_clasificacion_prioridad", foreignKey: "ct_clasificacion_prioridad_id"});
  ct_clasificacion_prioridad.hasMany(dt_correspondencia, { as: "dt_correspondencia", foreignKey: "ct_clasificacion_prioridad_id"});
  ct_consumible_departamento.belongsTo(ct_consumible_direccion, { as: "ct_direccion", foreignKey: "ct_direccion_id"});
  ct_consumible_direccion.hasMany(ct_consumible_departamento, { as: "ct_consumible_departamentos", foreignKey: "ct_direccion_id"});
  dt_consumible_inventario.belongsTo(ct_consumible_factura, { as: "ct_factura", foreignKey: "ct_factura_id"});
  ct_consumible_factura.hasMany(dt_consumible_inventario, { as: "dt_consumible_inventarios", foreignKey: "ct_factura_id"});
  ct_consumible_factura.belongsTo(ct_consumibles_proveedor, { as: "ct_provedor", foreignKey: "ct_provedor_id"});
  ct_consumibles_proveedor.hasMany(ct_consumible_factura, { as: "ct_consumible_facturas", foreignKey: "ct_provedor_id"});
  rl_correspondencia_usuario_estado.belongsTo(ct_correspondencia_estado, { as: "ct_correspondencia_estado_ct_correspondencia_estado", foreignKey: "ct_correspondencia_estado"});
  ct_correspondencia_estado.hasMany(rl_correspondencia_usuario_estado, { as: "rl_correspondencia_usuario_estados", foreignKey: "ct_correspondencia_estado"});
  ct_area.belongsTo(ct_departamento_sistema, { as: "ct_departamento", foreignKey: "ct_departamento_id"});
  ct_departamento_sistema.hasMany(ct_area, { as: "ct_areas", foreignKey: "ct_departamento_id"});
  ct_departamento_sistema.belongsTo(ct_direccion_sistema, { as: "ct_direccion", foreignKey: "ct_direccion_id"});
  ct_direccion_sistema.hasMany(ct_departamento_sistema, { as: "ct_departamento_sistemas", foreignKey: "ct_direccion_id"});
  dt_bitacora.belongsTo(ct_dispositivo, { as: "ct_dispositivo", foreignKey: "ct_dispositivo_id"});
  ct_dispositivo.hasMany(dt_bitacora, { as: "dt_bitacoras", foreignKey: "ct_dispositivo_id"});
  dt_planeaciones_aneec.belongsTo(ct_documentos_aneec, { as: "id_tipo_documento_ct_documentos_aneec", foreignKey: "id_tipo_documento"});
  ct_documentos_aneec.hasMany(dt_planeaciones_aneec, { as: "dt_planeaciones_aneecs", foreignKey: "id_tipo_documento"});
  dt_techo_presupuesto.belongsTo(ct_financiamiento, { as: "ct_financiamiento", foreignKey: "ct_financiamiento_id"});
  ct_financiamiento.hasMany(dt_techo_presupuesto, { as: "dt_techo_presupuestos", foreignKey: "ct_financiamiento_id"});
  dt_correspondencia.belongsTo(ct_forma_entrega, { as: "ct_forma_entrega", foreignKey: "ct_forma_entrega_id"});
  ct_forma_entrega.hasMany(dt_correspondencia, { as: "dt_correspondencia", foreignKey: "ct_forma_entrega_id"});
  dt_dictamen_escalafon.belongsTo(ct_grado_academico, { as: "ct_grado_academico", foreignKey: "ct_grado_academico_id"});
  ct_grado_academico.hasMany(dt_dictamen_escalafon, { as: "dt_dictamen_escalafons", foreignKey: "ct_grado_academico_id"});
  dt_funcion.belongsTo(ct_modulo, { as: "ct_modulo", foreignKey: "ct_modulo_id"});
  ct_modulo.hasMany(dt_funcion, { as: "dt_funcions", foreignKey: "ct_modulo_id"});
  rl_modulo_area.belongsTo(ct_modulo, { as: "ct_modulo", foreignKey: "ct_modulo_id"});
  ct_modulo.hasMany(rl_modulo_area, { as: "rl_modulo_areas", foreignKey: "ct_modulo_id"});
  dt_aspirante_aneec.belongsTo(ct_municipio, { as: "ct_municipio", foreignKey: "ct_municipio_id"});
  ct_municipio.hasMany(dt_aspirante_aneec, { as: "dt_aspirante_aneecs", foreignKey: "ct_municipio_id"});
  dt_diagnostico_aneec.belongsTo(ct_municipio, { as: "ct_municipio", foreignKey: "ct_municipio_id"});
  ct_municipio.hasMany(dt_diagnostico_aneec, { as: "dt_diagnostico_aneecs", foreignKey: "ct_municipio_id"});
  ct_producto_consumible.belongsTo(ct_partida, { as: "ct_partida", foreignKey: "ct_partida_id"});
  ct_partida.hasMany(ct_producto_consumible, { as: "ct_producto_consumibles", foreignKey: "ct_partida_id"});
  dt_consumible_inventario.belongsTo(ct_partida, { as: "ct_partida", foreignKey: "ct_partida_id"});
  ct_partida.hasMany(dt_consumible_inventario, { as: "dt_consumible_inventarios", foreignKey: "ct_partida_id"});
  rl_justificacion.belongsTo(ct_partida, { as: "ct_partida", foreignKey: "ct_partida_id"});
  ct_partida.hasMany(rl_justificacion, { as: "rl_justificacions", foreignKey: "ct_partida_id"});
  rl_partida_area.belongsTo(ct_partida, { as: "id_partida_ct_partida", foreignKey: "id_partida"});
  ct_partida.hasMany(rl_partida_area, { as: "rl_partida_areas", foreignKey: "id_partida"});
  rl_producto_area.belongsTo(ct_producto_consumible, { as: "id_producto_ct_producto_consumible", foreignKey: "id_producto"});
  ct_producto_consumible.hasMany(rl_producto_area, { as: "rl_producto_areas", foreignKey: "id_producto"});
  rl_producto_requisicion.belongsTo(ct_producto_consumible, { as: "ct_producto", foreignKey: "ct_productos_id"});
  ct_producto_consumible.hasMany(rl_producto_requisicion, { as: "rl_producto_requisicions", foreignKey: "ct_productos_id"});
  ct_puesto.belongsTo(ct_puesto, { as: "ct_puesto_superior", foreignKey: "ct_puesto_superior_id"});
  ct_puesto.hasMany(ct_puesto, { as: "ct_puestos", foreignKey: "ct_puesto_superior_id"});
  rl_puesto_funcion.belongsTo(ct_puesto, { as: "ct_puesto", foreignKey: "ct_puesto_id"});
  ct_puesto.hasMany(rl_puesto_funcion, { as: "rl_puesto_funcions", foreignKey: "ct_puesto_id"});
  rl_usuario_puesto.belongsTo(ct_puesto, { as: "ct_puesto", foreignKey: "ct_puesto_id"});
  ct_puesto.hasMany(rl_usuario_puesto, { as: "rl_usuario_puestos", foreignKey: "ct_puesto_id"});
  rl_usuario_puesto.belongsTo(ct_sindicato, { as: "ct_sindicato", foreignKey: "ct_sindicato_id"});
  ct_sindicato.hasMany(rl_usuario_puesto, { as: "rl_usuario_puestos", foreignKey: "ct_sindicato_id"});
  dt_bitacora.belongsTo(ct_tabla, { as: "ct_tabla", foreignKey: "ct_tabla_id"});
  ct_tabla.hasMany(dt_bitacora, { as: "dt_bitacoras", foreignKey: "ct_tabla_id"});
  ct_producto_consumible.belongsTo(ct_unidad_medida, { as: "ct_unidad", foreignKey: "ct_unidad_id"});
  ct_unidad_medida.hasMany(ct_producto_consumible, { as: "ct_producto_consumibles", foreignKey: "ct_unidad_id"});
  dt_consumible_entrega.belongsTo(ct_unidad_medida, { as: "ct_unidad", foreignKey: "ct_unidad_id"});
  ct_unidad_medida.hasMany(dt_consumible_entrega, { as: "dt_consumible_entregas", foreignKey: "ct_unidad_id"});
  dt_consumible_inventario.belongsTo(ct_unidad_medida, { as: "ct_unidad", foreignKey: "ct_unidad_id"});
  ct_unidad_medida.hasMany(dt_consumible_inventario, { as: "dt_consumible_inventarios", foreignKey: "ct_unidad_id"});
  ct_area.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(ct_area, { as: "ct_areas", foreignKey: "ct_usuario_in"});
  ct_area.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(ct_area, { as: "ct_usuario_at_ct_areas", foreignKey: "ct_usuario_at"});
  ct_departamento_sistema.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(ct_departamento_sistema, { as: "ct_departamento_sistemas", foreignKey: "ct_usuario_in"});
  ct_departamento_sistema.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(ct_departamento_sistema, { as: "ct_usuario_at_ct_departamento_sistemas", foreignKey: "ct_usuario_at"});
  ct_direccion_sistema.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(ct_direccion_sistema, { as: "ct_direccion_sistemas", foreignKey: "ct_usuario_in"});
  ct_direccion_sistema.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(ct_direccion_sistema, { as: "ct_usuario_at_ct_direccion_sistemas", foreignKey: "ct_usuario_at"});
  ct_modulo.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(ct_modulo, { as: "ct_modulos", foreignKey: "ct_usuario_in"});
  ct_modulo.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(ct_modulo, { as: "ct_usuario_at_ct_modulos", foreignKey: "ct_usuario_at"});
  ct_producto_consumible.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(ct_producto_consumible, { as: "ct_producto_consumibles", foreignKey: "ct_usuario_in"});
  ct_producto_consumible.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(ct_producto_consumible, { as: "ct_usuario_at_ct_producto_consumibles", foreignKey: "ct_usuario_at"});
  ct_puesto.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(ct_puesto, { as: "ct_puestos", foreignKey: "ct_usuario_in"});
  ct_puesto.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(ct_puesto, { as: "ct_usuario_at_ct_puestos", foreignKey: "ct_usuario_at"});
  ct_sindicato.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(ct_sindicato, { as: "ct_sindicatos", foreignKey: "ct_usuario_in"});
  ct_sindicato.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(ct_sindicato, { as: "ct_usuario_at_ct_sindicatos", foreignKey: "ct_usuario_at"});
  ct_usuario.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(ct_usuario, { as: "ct_usuarios", foreignKey: "ct_usuario_in"});
  ct_usuario.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(ct_usuario, { as: "ct_usuario_at_ct_usuarios", foreignKey: "ct_usuario_at"});
  dt_aspirante_aneec.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(dt_aspirante_aneec, { as: "dt_aspirante_aneecs", foreignKey: "ct_usuario_in"});
  dt_aspirante_aneec.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(dt_aspirante_aneec, { as: "ct_usuario_at_dt_aspirante_aneecs", foreignKey: "ct_usuario_at"});
  dt_bitacora.belongsTo(ct_usuario, { as: "ct_usuario", foreignKey: "ct_usuario_id"});
  ct_usuario.hasMany(dt_bitacora, { as: "dt_bitacoras", foreignKey: "ct_usuario_id"});
  dt_consumible_entrega.belongsTo(ct_usuario, { as: "ct_usuario", foreignKey: "ct_usuario_id"});
  ct_usuario.hasMany(dt_consumible_entrega, { as: "dt_consumible_entregas", foreignKey: "ct_usuario_id"});
  dt_correspondencia.belongsTo(ct_usuario, { as: "ct_usuarios_in_ct_usuario", foreignKey: "ct_usuarios_in"});
  ct_usuario.hasMany(dt_correspondencia, { as: "dt_correspondencia", foreignKey: "ct_usuarios_in"});
  dt_diagnostico_aneec.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(dt_diagnostico_aneec, { as: "dt_diagnostico_aneecs", foreignKey: "ct_usuario_in"});
  dt_diagnostico_aneec.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(dt_diagnostico_aneec, { as: "ct_usuario_at_dt_diagnostico_aneecs", foreignKey: "ct_usuario_at"});
  dt_dictamen_escalafon.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(dt_dictamen_escalafon, { as: "dt_dictamen_escalafons", foreignKey: "ct_usuario_in"});
  dt_dictamen_escalafon.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(dt_dictamen_escalafon, { as: "ct_usuario_at_dt_dictamen_escalafons", foreignKey: "ct_usuario_at"});
  dt_funcion.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(dt_funcion, { as: "dt_funcions", foreignKey: "ct_usuario_in"});
  dt_funcion.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(dt_funcion, { as: "ct_usuario_at_dt_funcions", foreignKey: "ct_usuario_at"});
  dt_informes_aneec.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(dt_informes_aneec, { as: "dt_informes_aneecs", foreignKey: "ct_usuario_in"});
  dt_informes_aneec.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(dt_informes_aneec, { as: "ct_usuario_at_dt_informes_aneecs", foreignKey: "ct_usuario_at"});
  dt_planeaciones_aneec.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(dt_planeaciones_aneec, { as: "dt_planeaciones_aneecs", foreignKey: "ct_usuario_in"});
  dt_planeaciones_aneec.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(dt_planeaciones_aneec, { as: "ct_usuario_at_dt_planeaciones_aneecs", foreignKey: "ct_usuario_at"});
  dt_techo_presupuesto.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(dt_techo_presupuesto, { as: "dt_techo_presupuestos", foreignKey: "ct_usuario_in"});
  dt_techo_presupuesto.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(dt_techo_presupuesto, { as: "ct_usuario_at_dt_techo_presupuestos", foreignKey: "ct_usuario_at"});
  rl_analista_unidad.belongsTo(ct_usuario, { as: "ct_usuario", foreignKey: "ct_usuario_id"});
  ct_usuario.hasMany(rl_analista_unidad, { as: "rl_analista_unidads", foreignKey: "ct_usuario_id"});
  rl_analista_unidad.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(rl_analista_unidad, { as: "ct_usuario_in_rl_analista_unidads", foreignKey: "ct_usuario_in"});
  rl_area_financiero.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(rl_area_financiero, { as: "rl_area_financieros", foreignKey: "ct_usuario_in"});
  rl_area_financiero.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(rl_area_financiero, { as: "ct_usuario_at_rl_area_financieros", foreignKey: "ct_usuario_at"});
  rl_correspondencia_usuario_estado.belongsTo(ct_usuario, { as: "ct_usuarios_in_ct_usuario", foreignKey: "ct_usuarios_in"});
  ct_usuario.hasMany(rl_correspondencia_usuario_estado, { as: "rl_correspondencia_usuario_estados", foreignKey: "ct_usuarios_in"});
  rl_entrega_formato.belongsTo(ct_usuario, { as: "ct_usuario", foreignKey: "ct_usuario_id"});
  ct_usuario.hasMany(rl_entrega_formato, { as: "rl_entrega_formatos", foreignKey: "ct_usuario_id"});
  rl_justificacion.belongsTo(ct_usuario, { as: "ct_usuario", foreignKey: "ct_usuario_id"});
  ct_usuario.hasMany(rl_justificacion, { as: "rl_justificacions", foreignKey: "ct_usuario_id"});
  rl_producto_requisicion.belongsTo(ct_usuario, { as: "ct_usuarios_in_ct_usuario", foreignKey: "ct_usuarios_in"});
  ct_usuario.hasMany(rl_producto_requisicion, { as: "rl_producto_requisicions", foreignKey: "ct_usuarios_in"});
  rl_usuario_funcion.belongsTo(ct_usuario, { as: "ct_usuario", foreignKey: "ct_usuario_id"});
  ct_usuario.hasMany(rl_usuario_funcion, { as: "rl_usuario_funcions", foreignKey: "ct_usuario_id"});
  rl_usuario_puesto.belongsTo(ct_usuario, { as: "ct_usuario", foreignKey: "ct_usuario_id"});
  ct_usuario.hasMany(rl_usuario_puesto, { as: "rl_usuario_puestos", foreignKey: "ct_usuario_id"});
  rl_usuario_puesto.belongsTo(ct_usuario, { as: "ct_usuario_in_ct_usuario", foreignKey: "ct_usuario_in"});
  ct_usuario.hasMany(rl_usuario_puesto, { as: "ct_usuario_in_rl_usuario_puestos", foreignKey: "ct_usuario_in"});
  rl_usuario_puesto.belongsTo(ct_usuario, { as: "ct_usuario_at_ct_usuario", foreignKey: "ct_usuario_at"});
  ct_usuario.hasMany(rl_usuario_puesto, { as: "ct_usuario_at_rl_usuario_puestos", foreignKey: "ct_usuario_at"});
  dt_diagnostico_aneec.belongsTo(dt_aspirante_aneec, { as: "dt_aspirante", foreignKey: "dt_aspirante_id"});
  dt_aspirante_aneec.hasMany(dt_diagnostico_aneec, { as: "dt_diagnostico_aneecs", foreignKey: "dt_aspirante_id"});
  dt_informes_aneec.belongsTo(dt_aspirante_aneec, { as: "dt_aspirante", foreignKey: "dt_aspirante_id"});
  dt_aspirante_aneec.hasMany(dt_informes_aneec, { as: "dt_informes_aneecs", foreignKey: "dt_aspirante_id"});
  dt_planeaciones_aneec.belongsTo(dt_aspirante_aneec, { as: "dt_aspirante", foreignKey: "dt_aspirante_id"});
  dt_aspirante_aneec.hasMany(dt_planeaciones_aneec, { as: "dt_planeaciones_aneecs", foreignKey: "dt_aspirante_id"});
  dt_consumible_entrega.belongsTo(dt_consumible_inventario, { as: "dt_inventario", foreignKey: "dt_inventario_id"});
  dt_consumible_inventario.hasMany(dt_consumible_entrega, { as: "dt_consumible_entregas", foreignKey: "dt_inventario_id"});
  rl_correspondencia_usuario_estado.belongsTo(dt_correspondencia, { as: "dt_correspondencium", foreignKey: "dt_correspondencia_id"});
  dt_correspondencia.hasMany(rl_correspondencia_usuario_estado, { as: "rl_correspondencia_usuario_estados", foreignKey: "dt_correspondencia_id"});
  dt_informes_aneec.belongsTo(dt_diagnostico_aneec, { as: "dt_diagnostico", foreignKey: "dt_diagnostico_id"});
  dt_diagnostico_aneec.hasMany(dt_informes_aneec, { as: "dt_informes_aneecs", foreignKey: "dt_diagnostico_id"});
  dt_planeaciones_aneec.belongsTo(dt_diagnostico_aneec, { as: "dt_diagnostico", foreignKey: "dt_diagnostico_id"});
  dt_diagnostico_aneec.hasMany(dt_planeaciones_aneec, { as: "dt_planeaciones_aneecs", foreignKey: "dt_diagnostico_id"});
  rl_puesto_funcion.belongsTo(dt_funcion, { as: "dt_funcion", foreignKey: "dt_funcion_id"});
  dt_funcion.hasMany(rl_puesto_funcion, { as: "rl_puesto_funcions", foreignKey: "dt_funcion_id"});
  rl_usuario_funcion.belongsTo(dt_funcion, { as: "dt_funcion", foreignKey: "dt_funcion_id"});
  dt_funcion.hasMany(rl_usuario_funcion, { as: "rl_usuario_funcions", foreignKey: "dt_funcion_id"});
  dt_proyecto_anual.belongsTo(dt_techo_presupuesto, { as: "dt_techo", foreignKey: "dt_techo_id"});
  dt_techo_presupuesto.hasMany(dt_proyecto_anual, { as: "dt_proyecto_anuals", foreignKey: "dt_techo_id"});
  rl_justificacion.belongsTo(dt_techo_presupuesto, { as: "dt_techo", foreignKey: "dt_techo_id"});
  dt_techo_presupuesto.hasMany(rl_justificacion, { as: "rl_justificacions", foreignKey: "dt_techo_id"});
  rl_producto_requisicion.belongsTo(dt_techo_presupuesto, { as: "dt_techo", foreignKey: "dt_techo_id"});
  dt_techo_presupuesto.hasMany(rl_producto_requisicion, { as: "rl_producto_requisicions", foreignKey: "dt_techo_id"});
  dt_techo_presupuesto.belongsTo(rl_area_financiero, { as: "ct_area", foreignKey: "ct_area_id"});
  rl_area_financiero.hasMany(dt_techo_presupuesto, { as: "dt_techo_presupuestos", foreignKey: "ct_area_id"});
  rl_analista_unidad.belongsTo(rl_area_financiero, { as: "rl_area_financiero_rl_area_financiero", foreignKey: "rl_area_financiero"});
  rl_area_financiero.hasMany(rl_analista_unidad, { as: "rl_analista_unidads", foreignKey: "rl_area_financiero"});
  rl_justificacion.belongsTo(rl_area_financiero, { as: "ct_area", foreignKey: "ct_area_id"});
  rl_area_financiero.hasMany(rl_justificacion, { as: "rl_justificacions", foreignKey: "ct_area_id"});
  rl_partida_area.belongsTo(rl_area_financiero, { as: "id_area_infra_rl_area_financiero", foreignKey: "id_area_infra"});
  rl_area_financiero.hasMany(rl_partida_area, { as: "rl_partida_areas", foreignKey: "id_area_infra"});
  rl_producto_area.belongsTo(rl_area_financiero, { as: "id_area_infra_rl_area_financiero", foreignKey: "id_area_infra"});
  rl_area_financiero.hasMany(rl_producto_area, { as: "rl_producto_areas", foreignKey: "id_area_infra"});
  rl_producto_requisicion.belongsTo(rl_area_financiero, { as: "ct_area", foreignKey: "ct_area_id"});
  rl_area_financiero.hasMany(rl_producto_requisicion, { as: "rl_producto_requisicions", foreignKey: "ct_area_id"});
  dt_consumible_entrega.belongsTo(rl_entrega_formato, { as: "folio_formato_rl_entrega_formato", foreignKey: "folio_formato"});
  rl_entrega_formato.hasMany(dt_consumible_entrega, { as: "dt_consumible_entregas", foreignKey: "folio_formato"});
  rl_correspondencia_usuario_estado.belongsTo(rl_usuario_puesto, { as: "rl_usuario_puesto", foreignKey: "rl_usuario_puesto_id"});
  rl_usuario_puesto.hasMany(rl_correspondencia_usuario_estado, { as: "rl_correspondencia_usuario_estados", foreignKey: "rl_usuario_puesto_id"});

  return {
    ct_accion: ct_accion,
    ct_area: ct_area,
    ct_capitulo: ct_capitulo,
    ct_clasificacion_prioridad: ct_clasificacion_prioridad,
    ct_codigos_postales: ct_codigos_postales,
    ct_conocimiento_escalafon: ct_conocimiento_escalafon,
    ct_constancia_curso: ct_constancia_curso,
    ct_consumible_departamento: ct_consumible_departamento,
    ct_consumible_direccion: ct_consumible_direccion,
    ct_consumible_factura: ct_consumible_factura,
    ct_consumibles_proveedor: ct_consumibles_proveedor,
    ct_correspondencia_estado: ct_correspondencia_estado,
    ct_departamento_sistema: ct_departamento_sistema,
    ct_direccion_sistema: ct_direccion_sistema,
    ct_dispositivo: ct_dispositivo,
    ct_documentos_aneec: ct_documentos_aneec,
    ct_financiamiento: ct_financiamiento,
    ct_forma_entrega: ct_forma_entrega,
    ct_grado_academico: ct_grado_academico,
    ct_modulo: ct_modulo,
    ct_municipio: ct_municipio,
    ct_partida: ct_partida,
    ct_producto_consumible: ct_producto_consumible,
    ct_puesto: ct_puesto,
    ct_sindicato: ct_sindicato,
    ct_tabla: ct_tabla,
    ct_unidad_medida: ct_unidad_medida,
    ct_usuario: ct_usuario,
    dt_aspirante_aneec: dt_aspirante_aneec,
    dt_bitacora: dt_bitacora,
    dt_constancia_curso_persona: dt_constancia_curso_persona,
    dt_consumible_entrega: dt_consumible_entrega,
    dt_consumible_inventario: dt_consumible_inventario,
    dt_correspondencia: dt_correspondencia,
    dt_diagnostico_aneec: dt_diagnostico_aneec,
    dt_dictamen_escalafon: dt_dictamen_escalafon,
    dt_funcion: dt_funcion,
    dt_informes_aneec: dt_informes_aneec,
    dt_planeaciones_aneec: dt_planeaciones_aneec,
    dt_proyecto_anual: dt_proyecto_anual,
    dt_techo_presupuesto: dt_techo_presupuesto,
    rl_analista_unidad: rl_analista_unidad,
    rl_area_financiero: rl_area_financiero,
    rl_correspondencia_usuario_estado: rl_correspondencia_usuario_estado,
    rl_entrega_formato: rl_entrega_formato,
    rl_justificacion: rl_justificacion,
    rl_modulo_area: rl_modulo_area,
    rl_partida_area: rl_partida_area,
    rl_producto_area: rl_producto_area,
    rl_producto_requisicion: rl_producto_requisicion,
    rl_puesto_funcion: rl_puesto_funcion,
    rl_usuario_funcion: rl_usuario_funcion,
    rl_usuario_puesto: rl_usuario_puesto,
  };
}
