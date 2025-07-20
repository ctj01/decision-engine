# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Loan Frontend

Frontend de React + TypeScript para el sistema Decision Engine de préstamos.

## 🚀 Características

- **Autenticación completa** - Login/Register con OIDC
- **Dashboard intuitivo** - Resumen financiero y acciones rápidas
- **Solicitud de préstamos** - Formulario completo con validaciones
- **Evaluación IA integrada** - Decisiones automáticas en tiempo real
- **Historial de préstamos** - Gestión completa de préstamos y solicitudes
- **Diseño responsivo** - Tailwind CSS con diseño moderno

## 🛠️ Tecnologías

- **React 19** + TypeScript
- **React Router 7** para navegación
- **React Hook Form** para formularios
- **Tailwind CSS** para estilos
- **Axios** para APIs
- **OIDC Client** para autenticación
- **Vite** como bundler

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🔧 Configuración

Variables de entorno en `.env`:

```env
VITE_LOAN_SERVICE_URL=http://localhost:5001
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_IDENTITY_SERVER_URL=http://localhost:5000
```

## 📁 Estructura

```
src/
├── components/          # Componentes reutilizables
│   └── Navbar.tsx
├── context/            # Contextos de React
│   └── AuthContext.tsx
├── features/           # Características por módulo
│   ├── auth/          # Autenticación
│   ├── dashboard/     # Dashboard principal
│   └── loans/         # Gestión de préstamos
├── services/          # Servicios de API
│   └── loanService.ts
├── types/             # Tipos TypeScript
│   └── loan.ts
└── App.tsx           # Componente principal
```

## 🎯 Páginas Principales

### 1. Dashboard (`/dashboard`)
- Resumen financiero con métricas
- Acciones rápidas
- Préstamos y solicitudes recientes

### 2. Solicitud de Préstamo (`/loan-application`)
- Formulario completo con validaciones
- Cálculo automático de pagos
- Evaluación de IA en tiempo real
- Resultados inmediatos

### 3. Historial (`/loan-history`)
- Préstamos activos
- Solicitudes pendientes
- Estados y detalles completos

## 🔗 Integración con Backend

### Loan Service
- `GET /loans` - Obtener préstamos
- `GET /loan-requests` - Obtener solicitudes
- `POST /loan-requests` - Crear solicitud

### AI Service
- `POST /predict` - Evaluación crediticia

### Identity Server
- OAuth2/OIDC para autenticación
- JWT tokens para autorización

## 🎨 Diseño

- **Paleta de colores**: Azul principal, verde para éxito, rojo para alertas
- **Tipografía**: Sistema de fuentes nativo
- **Iconos**: Emojis para simplicidad
- **Componentes**: Cards, botones, formularios con estados

## 🚀 Próximas Características

- [ ] Calculadora de préstamos
- [ ] Gráficos y análisis financiero
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] PWA support
- [ ] Chat de soporte

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
