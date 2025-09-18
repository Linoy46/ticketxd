import { Decimal } from "decimal.js";

// Configurar precisión global para todos los cálculos con Decimal
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Convierte un valor a Decimal de forma segura
 * @param value Valor a convertir (puede ser string, number, Decimal, etc)
 * @param defaultValue Valor por defecto si no se puede convertir
 */
export function toDecimal(
  value: any,
  defaultValue: number | string = 0
): Decimal {
  try {
    if (value === null || value === undefined) {
      return new Decimal(defaultValue);
    }
    return new Decimal(value);
  } catch (error) {
    console.warn(`Error al convertir valor a Decimal: ${value}`, error);
    return new Decimal(defaultValue);
  }
}
export const DecimalOps = {
  add: (a: any, b: any): Decimal => toDecimal(a).plus(toDecimal(b)),
  subtract: (a: any, b: any): Decimal => toDecimal(a).minus(toDecimal(b)),
  multiply: (a: any, b: any): Decimal => toDecimal(a).times(toDecimal(b)),
  divide: (a: any, b: any, defaultOnZero: any = 0): Decimal => {
    const divisor = toDecimal(b);
    return divisor.isZero()
      ? toDecimal(defaultOnZero)
      : toDecimal(a).dividedBy(divisor);
  },
  round: (value: any, decimalPlaces: number = 2): Decimal => {
    return toDecimal(value).toDecimalPlaces(decimalPlaces);
  },
  isGreaterThan: (a: any, b: any): boolean =>
    toDecimal(a).greaterThan(toDecimal(b)),
  isLessThan: (a: any, b: any): boolean => toDecimal(a).lessThan(toDecimal(b)),
  isEqual: (a: any, b: any): boolean => toDecimal(a).equals(toDecimal(b)),
};

/**
 * Convertir un Decimal a número nativo con una precisión específica
 */
export function decimalToNumber(
  value: Decimal | any,
  decimals: number = 3
): number {
  return toDecimal(value).toDecimalPlaces(decimals).toNumber();
}

/**
 * Convertir un Decimal a string con formato específico
 */
export function decimalToString(
  value: Decimal | any,
  decimals: number = 3
): string {
  return toDecimal(value).toFixed(decimals);
}
