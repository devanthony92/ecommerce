# Trama — E-commerce B2C + Mayorista

Frontend de una tienda de ropa con dos propuestas: **compra individual** y **compra por volumen para mayoristas**, con precios por escala de cantidad exclusivos para mayoristas.

React 19 · Vite 8 · React Router 8 · TanStack Query · SCSS con BEM estricto · Vitest + Testing Library + axe-core.

La arquitectura, rutas, contrato de API, reglas comerciales y design system están en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Funcionalidades

- **Catálogo**: filtros en la URL (talla, color, precio, orden), búsqueda sin tildes, paginación, ofertas.
- **Precios dinámicos**: el backend calcula todo (público, promoción y, para mayoristas, escala por cantidad) y el frontend explica por qué ves cada precio. Cotización al cambiar la cantidad.
- **Carrito**: invitado o con sesión (se fusionan al ingresar), escalas para mayoristas sumando tallas y colores, incentivos de envío gratis y de la siguiente escala.
- **Checkout**: dirección, envío con total calculado por el backend, pago con Mercado Pago (Checkout Pro) o contra entrega, y confirmación.
- **Cuenta**: dashboard, perfil, contraseña, direcciones, pedidos (filtros, detalle, cancelar, repetir), favoritos y listas de compra.
- **Mayoristas**: solicitud con estados, pedido mínimo, panel con compra acumulada y beneficios, catálogo con todas las escalas, pedido rápido por referencia, productos habituales.
- **Inspiración**: búsqueda de fotos de estilo en Pexels (API de terceros), de 3 en 3 con "Mostrar más"; la última búsqueda se guarda en el navegador.
- **Accesibilidad**: navegación por teclado, foco gestionado en modales, drawers y pasos, contraste WCAG AA, auditoría axe en 20 páginas.

## Requisitos

- Node 20.19+ (probado con Node 24)

## Inicio

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Usuarios de prueba (backend simulado)

| Perfil    | Correo                 |
| --------- | ---------------------- |
| Comprador | `comprador@trama.test` |
| Mayorista | `mayorista@trama.test` |

La contraseña de ambos está en `src/services/api/mocks/db.js`. Para reiniciar los datos de la demo, borra la clave `trama.mock-db` de localStorage. En `/cuenta/solicitud-mayorista` hay un simulador para aprobar o rechazar solicitudes (solo con el backend simulado).

## Variables de entorno

| Variable              | Descripción                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`        | URL base del backend (`/api/v1`)                                                                                              |
| `VITE_USE_MOCKS`      | `true` usa el backend simulado de `src/services/api/mocks`. Debe ser `false` en producción.                                   |
| `VITE_PEXELS_API_KEY` | Clave de [Pexels](https://www.pexels.com/api/) para la página Inspiración. Sin ella, la búsqueda muestra el mensaje de error. |

## Backend simulado

Mientras no existe el backend, `src/services/api/mocks` implementa el contrato de la API como un adapter de axios (con latencia, errores y reglas comerciales). Con `VITE_USE_MOCKS=false` no entra al bundle de producción. Al tener el backend real, se borra esa carpeta y la interfaz no cambia.

## Scripts

| Script                  | Qué hace                                     |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Servidor de desarrollo (`/_ds`: componentes) |
| `npm run build`         | Build de producción                          |
| `npm run preview`       | Sirve el build                               |
| `npm run lint`          | oxlint + Stylelint (valida BEM)              |
| `npm test`              | Vitest (una pasada, incluye auditoría axe)   |
| `npm run test:watch`    | Vitest en modo watch                         |
| `npm run test:coverage` | Cobertura (reporte HTML en `coverage/`)      |
| `npm run format`        | Prettier                                     |

## Despliegue

Es una SPA: el servidor debe responder `index.html` en cualquier ruta (fallback). Compilar con `VITE_USE_MOCKS=false` y `VITE_API_URL` apuntando al backend.
