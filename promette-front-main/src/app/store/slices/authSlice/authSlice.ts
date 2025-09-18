import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Definir la estructura del estado de autenticación
interface AuthState {

  user: {
    id: number;
    id_usuario: number;
    name: string;
    nombre_usuario: string;
    email: string;
    status: boolean;
    estado: number;
    createdAt: string;
    updatedAt: string;
    rl_usuario_puestos?: Array<{
      ct_puesto_id: number;
      ct_puesto?: {
        ct_area_id: number;
      };
    }>;
  } | null;
  isAuthenticated: boolean;
  permissions: [];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  permissions: []
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginReducer: (state, action: PayloadAction<{
      permissions: AuthState['permissions']; user: AuthState['user']
}>) => {
      state.user = action.payload.user;
      state.permissions = action.payload.permissions || [],
      state.isAuthenticated = true;
    },
    logoutReducer: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.permissions = []
    },
  },
});

export const { loginReducer, logoutReducer } = authSlice.actions;
export default authSlice.reducer;
