/**
 * @file budgets.interface.ts
 * @description Define las interfaces para la gestión de fuentes de financiamiento y presupuestos
 * 
 * Para integración backend:
 * - Estas interfaces deben coincidir con los modelos del backend
 * - Considerar añadir interfaces adicionales para solicitudes y respuestas de API
 */

/**
 * Representa una fuente de financiamiento
 * @interface FundingSource
 * @property {number} id - Identificador único de la fuente de financiamiento
 * @property {string} description - Descripción de la fuente de financiamiento
 * @property {string} type - Tipo de fuente (Federal, Estatal, Municipal, etc.)
 * @property {number} amount - Monto asignado a la fuente de financiamiento
 * @property {string} status - Estado de la fuente (active, inactive, pending)
 */
export interface FundingSource {
  id: number
  description: string
  type: string
  amount: number
  status: "active" | "inactive" | "pending" | string
}

/**
 * Representa un presupuesto completo
 * @interface Budget
 * @property {number} id - Identificador único del presupuesto
 * @property {string} name - Nombre del presupuesto
 * @property {string} fiscalYear - Año fiscal al que pertenece
 * @property {number} totalAmount - Monto total del presupuesto
 * @property {number} assignedAmount - Monto ya asignado del presupuesto
 * @property {number} remainingAmount - Monto restante por asignar
 * @property {string} status - Estado del presupuesto
 * @property {FundingSource[]} fundingSources - Fuentes de financiamiento asociadas
 */
export interface Budget {
  id: number
  name: string
  fiscalYear: string
  totalAmount: number
  assignedAmount: number
  remainingAmount: number
  status: "active" | "inactive" | "pending" | string
  fundingSources?: FundingSource[]
}

/**
 * @interface FundingSourceApiResponse
 * Formato esperado para respuestas de la API al listar fuentes de financiamiento
 * Considerar implementar para integración backend
 */
// export interface FundingSourceApiResponse {
//   data: FundingSource[]
//   total: number
//   page: number
//   limit: number
// }

/**
 * @interface FundingSourceCreateRequest
 * Formato esperado para solicitudes de creación de fuentes
 * Considerar implementar para integración backend
 */
// export interface FundingSourceCreateRequest {
//   description: string
//   type: string
//   amount: number
//   status: string
// }
