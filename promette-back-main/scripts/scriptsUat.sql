--Cambio a rl_partida_area: foreing key rl_partida_area --> index id_area_fin 11/06/25
ALTER TABLE `rl_partida_area`
	ADD CONSTRAINT `FK_rl_partida_area_rl_area_financiero` FOREIGN KEY (`id_area_infra`) REFERENCES `rl_area_financiero` (`id_area_fin`) ON UPDATE RESTRICT ON DELETE NO ACTION;

--Cambio a rl_producto_area: foreing key rl_producto_area --> index id_area_fin 11/06/25
--
ALTER TABLE `rl_producto_area`
	ADD CONSTRAINT `FK_rl_producto_area_ct_producto_consumible` FOREIGN KEY (`id_producto`) REFERENCES `ct_producto_consumible` (`id_producto`) ON UPDATE RESTRICT ON DELETE NO ACTION,
	ADD CONSTRAINT `FK_rl_producto_area_rl_area_financiero` FOREIGN KEY (`id_area_infra`) REFERENCES `rl_area_financiero` (`id_area_fin`) ON UPDATE RESTRICT ON DELETE NO ACTION;
	SHOW CREATE TABLE `promette_dev`.`rl_justificacion`;
SELECT CONSTRAINT_NAME, CHECK_CLAUSE FROM `information_schema`.`CHECK_CONSTRAINTS` WHERE CONSTRAINT_SCHEMA='promette_dev' AND TABLE_NAME='rl_justificacion';
SELECT * FROM `information_schema`.`COLUMNS` WHERE TABLE_SCHEMA='promette_dev' AND TABLE_NAME='rl_area_financiero' ORDER BY ORDINAL_POSITION;
ALTER TABLE `rl_justificacion`
	DROP FOREIGN KEY `fk_justificacion_area`;
/* Info: Records: 0  Duplicates: 0  Warnings: 0 */
ALTER TABLE `rl_justificacion`
	ADD CONSTRAINT `FK_rl_justificacion_rl_area_financiero` FOREIGN KEY (`ct_area_id`) REFERENCES `rl_area_financiero` (`id_area_fin`) ON UPDATE CASCADE ON DELETE RESTRICT;