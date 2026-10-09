# Trama — E-commerce B2C + Mayorista

Frontend en React + Vite. La arquitectura, rutas, contrato de API y design system están en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requisitos

- Node 20.19+ (probado con Node 24)

## Inicio

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variables de entorno

| Variable         | Descripción                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `VITE_API_URL`   | URL base del backend (`/api/v1`)                                                            |
| `VITE_USE_MOCKS` | `true` usa el backend simulado de `src/services/api/mocks`. Debe ser `false` en producción. |

## Backend simulado

Mientras no existe el backend, `src/services/api/mocks` implementa el contrato de la API como un adapter de axios. Los usuarios de prueba están en `src/services/api/mocks/db.js`. Para reiniciar los datos, borrar la clave `trama.mock-db` de localStorage.

## Scripts

| Script               | Qué hace               |
| -------------------- | ---------------------- |
| `npm run dev`        | Servidor de desarrollo |
| `npm run build`      | Build de producción    |
| `npm run preview`    | Sirve el build         |
| `npm run lint`       | oxlint                 |
| `npm test`           | Vitest (una pasada)    |
| `npm run test:watch` | Vitest en modo watch   |
| `npm run format`     | Prettier               |
