import { Op } from "sequelize";
import axios from "axios";
import { getModels } from "../models/modelsPromette";

export class PuestoAreaHelper {
  private static cache = new Map<string, any>();
  private static promette: any;

  static async inicializarModelos() {
    if (!this.promette) {
      this.promette = await getModels(process.env.DBNAMES || "");
    }
  }

  static async obtenerInformacionCURPs(token: string) {
    try {
      await this.inicializarModelos();

      const usuariosPuesto = await this.promette.rl_usuario_puesto.findAll({
        where: { estado: 1 },
        include: [
          {
            model: this.promette.ct_usuario,
            as: "ct_usuario",
            attributes: ["id_usuario", "curp"],
            where: { curp: { [Op.not]: null } },
          },
          {
            model: this.promette.ct_puesto,
            as: "ct_puesto",
            attributes: ["id_puesto", "nombre_puesto", "ct_area_id"],
          },
        ],
      });

      if (usuariosPuesto.length === 0) {
        throw new Error("No se encontraron usuarios activos con CURP");
      }

      const curpsUnicos = new Map<string, Array<{
        id_usuario_puesto: number;
        puesto: string;
        area_id: number;
      }>>();

      usuariosPuesto.forEach((up: any) => {
        if (up.ct_usuario?.curp && up.ct_puesto) {
          const curp = up.ct_usuario.curp;
          const datos = {
            id_usuario_puesto: up.id_usuario_puesto,
            puesto: up.ct_puesto.nombre_puesto,
            area_id: up.ct_puesto.ct_area_id,
          };

          if (curpsUnicos.has(curp)) {
            curpsUnicos.get(curp)?.push(datos);
          } else {
            curpsUnicos.set(curp, [datos]);
          }
        }
      });

      const rupeetApiUrl = `${process.env.RUPEET_API}/users/details`;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`;
      const infraestructuraResponse = await axios.get(infraestructuraApiUrl, config);
      const areasExternas = infraestructuraResponse.data;
      const areaMap = new Map(areasExternas.map((area: any) => [area.id_area, area.nombre]));

      const resultados = await Promise.all(
        Array.from(curpsUnicos.entries()).map(async ([curp, puestosYAreas]) => {
          if (this.cache.has(curp)) {
            return this.cache.get(curp);
          }

          try {
            const response = await axios.post(rupeetApiUrl, { curp }, config);
            const informacion = response.data?.usuario?.informacion_rupeet?.datos_personales || null;
            const resultado = {
              curp,
              informacion,
              puestosYAreas: puestosYAreas.map((item: any) => ({
                id_usuario_puesto: item.id_usuario_puesto,
                puesto: item.puesto,
                area: areaMap.get(item.area_id) || 'Área no encontrada',
              })),
              success: true,
            };

            this.cache.set(curp, resultado);
            return resultado;
          } catch (error) {
            console.error(`Error al consultar RUPEET para CURP ${curp}:`, error);
            return {
              curp,
              informacion: null,
              puestosYAreas: puestosYAreas.map((item: any) => ({
                id_usuario_puesto: item.id_usuario_puesto,
                puesto: item.puesto,
                area: areaMap.get(item.area_id) || 'Área no encontrada',
              })),
              success: false,
            };
          }
        })
      );

      const todasExitosas = resultados.every(resultado => resultado.success);

      return {
        msg: "Información de RUPEET, puestos, áreas e id_usuario_puesto obtenida correctamente",
        todasExitosas,
        resultados,
      };
    } catch (error) {
      console.error("Error al obtener información de CURPs:", error);
      throw new Error("Error al procesar la solicitud");
    }
  }

  static async obtenerNombrePorUsuarioPuesto(rl_usuario_puesto_id: number, token: string) {
    try {
      await this.inicializarModelos();

      const usuarioPuesto = await this.promette.rl_usuario_puesto.findOne({
        where: { id_usuario_puesto: rl_usuario_puesto_id },
        include: [
          {
            model: this.promette.ct_usuario,
            as: "ct_usuario",
            attributes: ["id_usuario", "curp"],
          },
          {
            model: this.promette.ct_puesto,
            as: "ct_puesto",
            attributes: ["id_puesto", "nombre_puesto", "ct_area_id"],
          },
        ],
      });

      if (!usuarioPuesto) {
        return {
          success: false,
          nombre: "Usuario puesto no encontrado",
          area: "N/A",
          puesto: "N/A",
          error: "Usuario puesto no encontrado"
        };
      }

      const curp = usuarioPuesto.ct_usuario?.curp;
      if (!curp) {
        return {
          success: false,
          nombre: "CURP no disponible",
          area: "N/A",
          puesto: "N/A",
          error: "El usuario no tiene CURP registrado"
        };
      }

      const resultado = await this.obtenerInformacionPorCurp(curp, token);
      
      if (resultado.success && resultado.informacion) {
        const info = resultado.informacion;
        const nombreCompleto = `${info.nombre} ${info.apellido_paterno} ${info.apellido_materno}`;
        
        const areaId = usuarioPuesto.ct_puesto?.ct_area_id;
        let area: string = "Área no encontrada";
        
        if (areaId) {
          try {
            const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`;
            const infraestructuraResponse = await axios.get(infraestructuraApiUrl);
            const areasExternas = infraestructuraResponse.data;
            const areaEncontrada = areasExternas.find((area: any) => area.id_area === areaId);
            area = areaEncontrada?.nombre || "Área no encontrada";
          } catch (error) {
            console.error('Error al obtener área:', error);
            area = "Error al obtener área";
          }
        }
        
        return {
          success: true,
          nombre: nombreCompleto,
          curp: curp,
          area: area,
          puesto: usuarioPuesto.ct_puesto?.nombre_puesto || "Puesto no encontrado",
          informacion: resultado.informacion
        };
      } else {
        return {
          success: false,
          nombre: "No registrado en RUPEET",
          curp: curp,
          area: "N/A",
          puesto: "N/A",
          error: "No se pudo obtener información de RUPEET"
        };
      }

    } catch (error) {
      console.error('Error en obtenerNombrePorUsuarioPuesto:', error);
      return {
        success: false,
        nombre: "Error al obtener información",
        area: "N/A",
        puesto: "N/A",
        error: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }

  static async obtenerInformacionPorCurp(curp: string, token: string) {
    try {
      if (this.cache.has(curp)) {
        return this.cache.get(curp);
      }

      const rupeetApiUrl = `${process.env.RUPEET_API}/users/details`;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(rupeetApiUrl, { curp }, config);
      const informacion = response.data?.usuario?.informacion_rupeet?.datos_personales || null;
      
      const resultado = {
        success: true,
        informacion,
        curp
      };

      this.cache.set(curp, resultado);
      
      return resultado;
    } catch (error) {
      console.error(`Error al consultar RUPEET para CURP ${curp}:`, error);
      return {
        success: false,
        informacion: null,
        curp,
        error: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }

  static async obtenerNombrePorCurp(curp: string, token: string) {
    try {
      await this.inicializarModelos();

      // Buscar el usuario por CURP en rl_usuario_puesto
      const usuarioPuesto = await this.promette.rl_usuario_puesto.findOne({
        where: { estado: 1 },
        include: [
          {
            model: this.promette.ct_usuario,
            as: "ct_usuario",
            where: { curp: curp },
            attributes: ["id_usuario", "curp"],
          },
          {
            model: this.promette.ct_puesto,
            as: "ct_puesto",
            attributes: ["id_puesto", "nombre_puesto", "ct_area_id"],
          },
        ],
      });

      if (!usuarioPuesto) {
        return {
          success: false,
          nombre: "Usuario no encontrado",
          area: "N/A",
          puesto: "N/A",
          error: "Usuario no encontrado con ese CURP"
        };
      }

      // Obtener información de RUPEET
      const resultado = await this.obtenerInformacionPorCurp(curp, token);
      
      if (resultado.success && resultado.informacion) {
        const info = resultado.informacion;
        const nombreCompleto = `${info.nombre} ${info.apellido_paterno} ${info.apellido_materno}`;
        
        // Obtener área
        const areaId = usuarioPuesto.ct_puesto?.ct_area_id;
        let area: string = "Área no encontrada";
        
        if (areaId) {
          try {
            const infraestructuraApiUrl = `${process.env.INFRAESTRUCTURA_API}/area`;
            const config = {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            };
            const infraestructuraResponse = await axios.get(infraestructuraApiUrl, config);
            const areasExternas = infraestructuraResponse.data;
            const areaEncontrada = areasExternas.find((area: any) => area.id_area === areaId);
            area = areaEncontrada?.nombre || "Área no encontrada";
          } catch (error) {
            console.error('Error al obtener área:', error);
            area = "Error al obtener área";
          }
        }
        
        return {
          success: true,
          nombre: nombreCompleto,
          curp: curp,
          area: area,
          puesto: usuarioPuesto.ct_puesto?.nombre_puesto || "Puesto no encontrado",
          informacion: resultado.informacion
        };
      } else {
        return {
          success: false,
          nombre: "No registrado en RUPEET",
          curp: curp,
          area: "N/A",
          puesto: "N/A",
          error: "No se pudo obtener información de RUPEET"
        };
      }

    } catch (error) {
      console.error('Error en obtenerNombrePorCurp:', error);
      return {
        success: false,
        nombre: "Error al obtener información",
        area: "N/A",
        puesto: "N/A",
        error: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }
}