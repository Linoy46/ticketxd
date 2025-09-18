export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface newUser {
  nombre_usuario: string;
  contrasena: string;
  telefono: string;
  email: string;
  email_institucional?: string;
  curp: string;
}
