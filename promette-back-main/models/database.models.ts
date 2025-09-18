import { initModels } from './modelsPromette/init-models';
import { sequelize } from '../config/database';

// Inicializar los modelos una sola vez
export const promette:any = initModels(sequelize); 

// Exportar también sequelize por si se necesita
export { sequelize }; 