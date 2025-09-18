/src/
│── app/
│ ├── core/ # Servicios globales (Auth, API, Guards)
│ │ ├── services/ # 🔥 Servicios globales (Auth, API)
│ │ ├── guards/ # 🔥 Protección de rutas (AuthGuard)
│ ├── shared/ # 🔥 Componentes reutilizables
│ │ ├── button.component.ts
│ │ ├── table.component.ts
│ ├── features/ # 📌 Funcionalidades específicas (Usuarios, Productos, etc.)
│ │ ├── auth/ # 📌 Autenticación
│ │ │ ├── login.component.ts
│ │ │ ├── register.component.ts
│ │ │ ├── auth.routes.ts
│ │ │ ├── pipes/ # 🔥 Pipes específicos del módulo de autenticación
│ │ │ │ ├── auth-status.pipe.ts
│ │ ├── layout/ # 📌 Estructura principal (Navbar, Sidebar)
│ │ │ ├── layout.component.ts
│ │ │ ├── layout.routes.ts
│ │ ├── users/ # 📌 CRUD de usuarios
│ │ │ ├── users.component.ts
│ │ │ ├── users.routes.ts
│ │ │ ├── pipes/ # 🔥 Pipes específicos para usuarios
│ │ │ │ ├── user-role.pipe.ts
│ │ │ ├── services/ # 🔥 Servicios específicos de usuarios
│ │ │ │ ├── user.service.ts
│ │ ├── products/ # 📌 CRUD de productos
│ │ │ ├── products.component.ts
│ │ │ ├── products.routes.ts
│ │ │ ├── pipes/ # 🔥 Pipes específicos para productos
│ │ │ │ ├── product-price.pipe.ts
│ │ │ ├── services/ # 🔥 Servicios específicos de productos
│ │ │ │ ├── product.service.ts
│ ├── app.routes.ts # 🔥 Rutas principales (equivalente a "routes.tsx" en React)
│ ├── app.component.ts # 🔥 Componente raíz (equivalente a "App.tsx" en React)
│ ├── main.ts # 🔥 Entrada principal (equivalente a "index.tsx" en React)
