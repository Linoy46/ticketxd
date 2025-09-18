import { body, param, ValidationChain } from "express-validator";

export const validateIdMunicipio: ValidationChain[] = [
  param("id_municipio")
    .isInt()
    .withMessage("El id_municipio es invalido")
    .notEmpty()
    .withMessage("El id_municipio es obligatorio"),
];

export const validateNewMunicipality: ValidationChain[] = [
  body("municipio")
    .isString()
    .withMessage("El nombre del municipio es invalido")
    .trim()
    .isLength({ max: 300 })
    .withMessage("El nombre del municipio no debe exceder 300 caracteres")
    .notEmpty()
    .withMessage("El nombre del municipio es obligatorio"),
];

export const validateUpdateMunicipality: ValidationChain[] = [
  ...validateIdMunicipio,
  ...validateNewMunicipality,
];
