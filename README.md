# Trama — E-commerce B2C + Mayorista

Frontend de una tienda de ropa con dos propuestas: **compra individual** y **compra por volumen para mayoristas**, con precios por escala de cantidad exclusivos para mayoristas.

React 19 · Vite 8 · React Router 8 · TanStack Query · SCSS con BEM estricto · Vitest + Testing Library + axe-core.

Tienda desplegada: https://devama.duckdns.org · API: https://api-devama.duckdns.org

Backend: [ecommerce-backend](https://github.com/devanthony92/ecommerce-backend) (FastAPI + PostgreSQL).

La arquitectura, rutas, contrato de API, reglas comerciales y design system están en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Funcionalidades

- **Catálogo**: filtros en la URL (talla, color, precio, orden), búsqueda sin tildes, paginación, ofertas.
- **Precios dinámicos**: el backend calcula todo (público, promoción y, para mayoristas, escala por cantidad) y el frontend explica por qué ves cada precio. Cotización al cambiar la cantidad.
- **Carrito**: invitado o con sesión (se fusionan al ingresar), escalas para mayoristas sumando tallas y colores, incentivos de envío gratis y de la siguiente escala.
- **Checkout**: dirección, envío con total calculado por el backend, pago con Mercado Pago (Checkout Pro) o contra entrega, y confirmación.
- **Cuenta**: dashboard, perfil, contraseña, direcciones, pedidos (filtros, detalle, cancelar, repetir), favoritos y listas de compra.
- **Mayoristas**: solicitud con estados, pedido mínimo, panel con compra acumulada y beneficios, catálogo con todas las escalas, pedido rápido por referencia, productos habituales.
- **Inspiración**: búsqueda de fotos de estilo en Unsplash (API de terceros), de 3 en 3 con "Mostrar más"; la última búsqueda se guarda en el navegador. Con sesión, las fotos se guardan en el backend y se ven en la página protegida "Inspiraciones guardadas".
- **Autorización**: registro e inicio de sesión en modales con validación en cada tecla, JWT en `localStorage`, usuario global en `CurrentUserContext` y rutas protegidas que vuelven al inicio y abren el inicio de sesión.
- **Accesibilidad**: navegación por teclado, foco gestionado en modales, drawers y pasos, contraste WCAG AA, auditoría axe en 20 páginas.

## Requisitos

- Node 20.19+ (probado con Node 24)

## Inicio

1. Levanta el backend ([ecommerce-backend](https://github.com/devanthony92/ecommerce-backend)): queda en `http://localhost:3000`.
2. Frontend:

   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

Sin backend, pon `VITE_USE_MOCKS=true` en `.env.local`: la app usa el backend simulado del navegador.

## Usuarios de prueba

| Perfil    | Con la API real (`python -m app seed --demo`) | Con el backend simulado |
| --------- | --------------------------------------------- | ----------------------- |
| Comprador | `comprador@demo.trama.co`                     | `comprador@trama.test`  |
| Mayorista | `mayorista@demo.trama.co`                     | `mayorista@trama.test`  |

La contraseña es `Trama1234` (cuentas de prueba, sin datos reales). Con el backend simulado, para reiniciar los datos borra la clave `trama.mock-db` de localStorage. En `/cuenta/solicitud-mayorista` hay un simulador para aprobar o rechazar solicitudes (fuera de producción).

## Variables de entorno

| Variable                   | Descripción                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`             | URL base del backend (`http://localhost:3000` en desarrollo)                                                                             |
| `VITE_USE_MOCKS`           | `true` usa el backend simulado de `src/services/api/mocks` (sin backend). `false`: API real. Debe ser `false` en producción.             |
| `VITE_UNSPLASH_ACCESS_KEY` | Access Key de [Unsplash](https://unsplash.com/developers) para la página Inspiración. Sin ella, la búsqueda muestra el mensaje de error. |

## Backend simulado

`src/services/api/mocks` implementa el mismo contrato que la API real como un adapter de axios (con latencia, errores y reglas comerciales). Lo usan los tests (Vitest corre sin backend) y sirve para probar la interfaz sin levantar la API. Con `VITE_USE_MOCKS=false` no entra al bundle de producción.

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

## Verificación y entrega

| Requisito                 | Evidencia                                                                                                                                                                                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pull request              | [devanthony92/ecommerce#3](https://github.com/devanthony92/ecommerce/pull/3) (`stage-react-api` → `main`)                                                                                                                                                                                     |
| Front-End desplegado      | https://devama.duckdns.org (Inspiración: `/inspiracion`)                                                                                                                                                                                                                                      |
| Búsqueda real en Unsplash | Verificada en el sitio desplegado con la clave real: la búsqueda "denim" devuelve fotos, muestra 3 y "Mostrar más" agrega 3 por clic                                                                                                                                                          |
| Build, pruebas y linters  | `npm run lint` sin avisos · `npm test`: 122 pruebas pasan · `npm run build`: sin errores (JS inicial 248 kB, 77 kB gzip; cada página es un chunk aparte)                                                                                                                                      |
| Responsive desde 320 px   | Medido en el navegador a 320 px en 10 rutas (inicio, catálogo, categoría, producto, ofertas, inspiración, mayoristas, carrito, búsqueda y 404): sin desplazamiento horizontal (`scrollWidth` = 320). Esa revisión encontró y corrigió dos desbordes (buscador del header y ficha de producto) |
| Imágenes optimizadas      | `favicon.svg`: 167 B. Fotos de Unsplash recortadas 2:3 y recomprimidas en su CDN (AVIF/WebP): ~175 kB a 480 px frente a 2,3 MB la original; `srcSet` 480/800 px y carga diferida                                                                                                              |

La clave de Unsplash es la variable `VITE_UNSPLASH_ACCESS_KEY`: va en `.env.local` (fuera del repositorio) y en el build de despliegue. Como toda variable `VITE_`, queda en el JavaScript del navegador; Unsplash lo permite en apps web y limita el uso por clave.

### Decisiones frente a la rúbrica

- **Vite en lugar de Create React App.** CRA está descontinuado; Vite entrega la misma estructura (`src/`, JSX, rutas) con un build más rápido.
- **Fuente Inter con `@fontsource-variable/inter`.** El paquete trae su `@font-face` y los archivos `woff2`, que Vite empaqueta con la aplicación: no hay CDN ni dependencia externa en tiempo de ejecución y la tipografía tiene alternativas de sistema.
- **Solicitudes fuera de `App`.** Las peticiones viven en módulos de `utils/` y en hooks por funcionalidad, no dentro del componente `App`, siguiendo la recomendación de separarlas.
- **`fetch` para la API de terceros, Axios solo para nuestro back-end.** `src/utils/UnsplashApi.js` usa `fetch` nativo, como pide la consigna. Axios se reserva para el cliente del back-end propio (`src/services/api`), donde aporta interceptores (JWT, errores uniformes) y el adaptador del backend simulado que usan las pruebas. Una regla del linter impide importarlo fuera de esa carpeta.

## Despliegue

Es una SPA: el servidor debe responder `index.html` en cualquier ruta (fallback). Compilar con `VITE_USE_MOCKS=false` y `VITE_API_URL` apuntando al backend.
