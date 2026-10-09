# Arquitectura frontend — E-commerce B2C + Mayorista

Documento base del proyecto. Define estructura, rutas, contratos de API, permisos, precios y design system **antes** de escribir código. Cualquier cambio de arquitectura se refleja primero aquí.

---

## 1. Requisitos analizados

| Área               | Requisito clave                                              | Consecuencia técnica                                                       |
| ------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Usuarios           | Visitante, Comprador, Mayorista (aprobado); Admin futuro     | Rol + permisos vienen del backend; rutas por perfil                        |
| Precios            | Cadena base → cliente → nivel → cantidad → promoción → final | **El backend calcula**. El front solo muestra un `PriceView`               |
| Escalas            | Tiers por cantidad visibles en card, detalle y carrito       | Componentes `PricingTiers` / `PricingTier` alimentados por `tiers[]`       |
| Compra inteligente | "Agrega 1 más…", "faltan $X para envío gratis"               | Backend envía números (`incentives[]`); el front arma el texto             |
| Mayorista          | Niveles, progreso, pedidos rápidos, recompra, listas         | Feature `wholesale` + `lists` + `orders`                                   |
| Solicitud          | Flujo con estados PENDING → APPROVED/REJECTED/SUSPENDED      | UI distinta por estado                                                     |
| Visitante          | Navega y arma carrito sin login; login para pagar            | Carrito invitado en `localStorage` + cotización vía API + merge al loguear |
| UI base            | Modal y Drawer reutilizables, accesibles                     | `components/modal`, `components/drawer` sin lógica de negocio              |
| Calidad            | BEM estricto, mobile-first, WCAG, lazy routes, estados de UI | Convenciones en §5, §11, §12                                               |
| Backend            | Se construye después                                         | Contrato en §7 + mocks intercambiables (§13)                               |

---

## 2. Entidades y dominios

```text
User ──┬── role, permissions[]
       ├── Address[]
       ├── WholesaleRequest (0..1 activa)
       └── WholesaleProfile (si aprobado) ── Level

Category ── Product ── Variant[] (talla, color, stock, sku)
                └── PriceView (calculado por backend según usuario + cantidad)
                        └── Tier[]

Cart ── CartItem[] (variant + quantity + PriceView de línea)
     └── Summary + Incentive[]

Order ── OrderItem[] ── status
List  ── ListItem[] (variant + cantidad habitual)
Favorite (product)
Promotion
```

| Dominio (feature) | Responsabilidad                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `auth`            | Login, registro, sesión, guards                                                                                             |
| `users`           | Perfil, direcciones                                                                                                         |
| `catalog`         | Productos, categorías, búsqueda, filtros (agrupa `products` + `categories` de la spec: comparten página, filtros y queries) |
| `pricing`         | Presentación de precios, tiers, ahorro, progreso de cantidad                                                                |
| `cart`            | Carrito invitado/autenticado, drawer, incentivos                                                                            |
| `checkout`        | Dirección, envío, pago, confirmación                                                                                        |
| `orders`          | Historial, detalle, cancelar, recompra                                                                                      |
| `favorites`       | Favoritos                                                                                                                   |
| `lists`           | Listas de compra (comprador y mayorista)                                                                                    |
| `wholesale`       | Solicitud, perfil/nivel, dashboard, pedido rápido, frecuentes                                                               |
| `promotions`      | Promociones activas, banners, ofertas por volumen                                                                           |
| `home`            | Composición de la home (solo orquesta componentes de otros features)                                                        |

> Cambio respecto a la spec: `products` + `categories` se fusionan en `catalog`, y se agregan `lists` y `home`. Motivo: evitar dependencias circulares entre features casi idénticos y separar listas (usadas también por compradores) del dominio mayorista.

---

## 3. Estructura de carpetas

```text
ecommerce/
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── providers/
│   │   │   ├── AppProviders.jsx        # compone todos los providers
│   │   │   ├── QueryProvider.jsx
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── CartProvider.jsx
│   │   │   └── UiProvider.jsx          # drawers/modales globales (carrito, menú móvil)
│   │   ├── layout/                     # shell: compone varios features
│   │   │   ├── MainLayout, SiteHeader, HeaderSearch, CategoryNav
│   │   │   ├── MobileMenu, SiteFooter
│   │   │   └── AccountLayout, WholesaleLayout
│   │   ├── dev/                        # /_ds, solo en desarrollo
│   │   └── routes/
│   │       ├── AppRoutes.jsx
│   │       ├── RequireAuth.jsx
│   │       ├── RequirePermission.jsx
│   │       └── ComingSoonPage.jsx      # marcador de rutas de fases futuras
│   │
│   ├── components/                     # genéricos, sin lógica de negocio
│   │   ├── ui/                         # Button, Input, Price, ProgressBar, QuantityStepper...
│   │   ├── layout/                     # PageHeader, SectionNav (genéricos)
│   │   ├── modal/
│   │   ├── drawer/
│   │   └── feedback/                   # LoadingState, EmptyState, ErrorState, Skeleton, Toast
│   │
│   ├── features/
│   │   └── <feature>/
│   │       ├── api/                    # funciones HTTP del dominio (xxxApi.js) + queryKeys.js
│   │       ├── hooks/                  # useProducts, useCart... (TanStack Query)
│   │       ├── components/
│   │       ├── pages/
│   │       └── utils/                  # solo si hace falta
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.js            # instancia axios
│   │   │   ├── interceptors.js         # token, errores normalizados, 401
│   │   │   └── mocks/                  # backend falso (se borra al tener backend)
│   │   └── storage/
│   │       └── storage.js              # wrapper seguro de localStorage
│   │
│   ├── hooks/                          # genéricos: useFocusTrap, useScrollLock, useMediaQuery...
│   ├── utils/                          # formatMoney, formatDate, cn...
│   ├── constants/                      # permissions.js, statuses.js
│   ├── styles/
│   │   ├── abstracts/                  # _tokens.scss, _mixins.scss, _functions.scss
│   │   ├── base/                       # _reset.scss, _typography.scss
│   │   └── main.scss
│   └── main.jsx
│
├── .env.example
├── .oxlintrc.json
├── vite.config.js
└── package.json
```

Decisiones de la estructura:

- **API por feature** (`features/catalog/api/productsApi.js`), no todo en `services/api/`. `services/api` solo tiene la infraestructura (cliente, interceptores, mocks). Así un feature es autocontenido.
- **`schemas/` y `types/` no se crean** hasta necesitarlos (JS, validación de formularios simple primero).
- **Sin `app/store/`**: TanStack Query cubre estado servidor y Context cubre el resto.
- **Sin `ThemeProvider`** hasta que exista tema oscuro; los tokens ya son CSS custom properties, así que agregarlo después es barato.
- Regla de imports: `features/A` **no** importa internals de `features/B`. Si algo se comparte, se expone desde `features/B/index.js` o se sube a `components/`.

---

## 4. Rutas

Todas las páginas con `React.lazy` + `Suspense` (fallback: `PageSkeleton`). Paths en español (cliente final colombiano), definidos en `constants/paths.js` (los usan features y app, por eso no viven en `app/`).

### Públicas (`MainLayout`)

| Path                      | Página                                                |
| ------------------------- | ----------------------------------------------------- |
| `/`                       | HomePage                                              |
| `/catalogo`               | CatalogPage (filtros en query string)                 |
| `/catalogo/:categorySlug` | CatalogPage                                           |
| `/producto/:slug`         | ProductPage                                           |
| `/ofertas`                | PromotionsPage                                        |
| `/buscar?q=`              | SearchPage                                            |
| `/carrito`                | CartPage                                              |
| `/mayoristas`             | WholesaleLandingPage (CTA "Convertirme en mayorista") |
| `/ingresar`               | LoginPage                                             |
| `/registro`               | RegisterPage                                          |

### Comprador — `RequireAuth` (`AccountLayout`)

| Path                              | Página                                                     |
| --------------------------------- | ---------------------------------------------------------- |
| `/checkout`                       | CheckoutPage (`MainLayout` simplificado)                   |
| `/checkout/confirmacion/:orderId` | OrderConfirmationPage                                      |
| `/cuenta`                         | BuyerDashboardPage                                         |
| `/cuenta/pedidos`                 | OrdersPage                                                 |
| `/cuenta/pedidos/:orderId`        | OrderDetailPage                                            |
| `/cuenta/favoritos`               | FavoritesPage                                              |
| `/cuenta/listas`                  | ListsPage                                                  |
| `/cuenta/listas/:listId`          | ListDetailPage                                             |
| `/cuenta/direcciones`             | AddressesPage                                              |
| `/cuenta/perfil`                  | ProfilePage                                                |
| `/cuenta/solicitud-mayorista`     | WholesaleRequestPage (formulario o estado de la solicitud) |

### Mayorista — `RequirePermission("wholesale.access")` (`WholesaleLayout`)

| Path                       | Página                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| `/mayorista`               | WholesaleDashboardPage                                                  |
| `/mayorista/catalogo`      | WholesaleCatalogPage (reusa `CatalogPage` con vista de tiers expandida) |
| `/mayorista/pedido-rapido` | QuickOrderPage                                                          |
| `/mayorista/frecuentes`    | FrequentProductsPage                                                    |
| `/mayorista/beneficios`    | BenefitsPage                                                            |

### Admin (futuro) — `RequirePermission("admin.access")`

`/admin/*` → reservado. No se implementa; solo el punto de montaje en `AppRoutes`.

### Comportamiento de guards

- `RequireAuth`: sin sesión → `/ingresar?next=<ruta>`.
- `RequirePermission`: sin permiso → página 403 con CTA contextual (p. ej. comprador sin mayorista → "Solicitar cuenta mayorista").
- `*` → NotFoundPage.

---

## 5. Componentes globales

### `components/ui`

| Componente        | Bloque BEM         | Notas                                                                                                |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `Button`          | `button`           | variantes `--primary --secondary --ghost --danger`, tamaños `--sm --md --lg`, `--loading`, `--block` |
| `IconButton`      | `icon-button`      | `aria-label` obligatorio                                                                             |
| `TextField`       | `text-field`       | label, hint, error, `aria-describedby`                                                               |
| `Select`          | `select-field`     | nativo estilizado                                                                                    |
| `Checkbox`        | `checkbox`         |                                                                                                      |
| `QuantityStepper` | `quantity-stepper` | `[-] n [+]`, min/max, accesible por teclado                                                          |
| `Price`           | `price`            | muestra un monto formateado; `--strike`, `--highlight`                                               |
| `Badge`           | `badge`            | `--success --warning --wholesale --level-<code>`                                                     |
| `ProgressBar`     | `progress-bar`     | `role="progressbar"`, `aria-valuenow/min/max`                                                        |
| `ResponsiveImage` | `responsive-image` | `loading="lazy"`, `srcset`, aspect-ratio fijo                                                        |
| `Spinner`         | `spinner`          |                                                                                                      |
| `Tabs`            | `tabs`             | cuando aparezca un caso real                                                                         |

### Layout

- `components/layout` (genéricos): `PageHeader`, `SectionNav` (pestañas en móvil; `orientation="auto"` pasa a sidebar desde lg).
- `app/layout` (shell, compone features): `MainLayout` (skip link, foco y scroll al navegar, error boundary por ruta), `SiteHeader`, `HeaderSearch`, `CategoryNav`, `MobileMenu` (Drawer izquierdo), `SiteFooter`, `AccountLayout` (sidebar en desktop / pestañas en móvil), `WholesaleLayout` (banda cobre + pestañas).
- `CartDrawer` vive en `features/cart` y lo monta `MainLayout`.
- Las rutas de fases futuras ya existen y muestran `ComingSoonPage`, así la navegación completa funciona desde ahora.

### `components/modal`

```text
Modal.jsx         # portal, backdrop, ESC, click-outside configurable, scroll lock, focus trap, retorno de foco
ModalHeader.jsx   # título con id → aria-labelledby, botón cerrar
ModalBody.jsx
ModalFooter.jsx
modal.scss
```

API: `open`, `onClose`, `title`, `size` (`sm|md|lg|fullscreen`), `footer`, `closeOnBackdrop` (default `true`), `initialFocusRef`. Renderiza `role="dialog"` + `aria-modal="true"`.

### `components/drawer`

Misma base que Modal (comparte `useFocusTrap`, `useScrollLock`, `useEscapeKey`). API: `open`, `onClose`, `position` (`left|right|bottom`), `size`, `title`, `footer`.

### `components/feedback`

`LoadingState`, `EmptyState` (icono, título, texto, acción), `ErrorState` (mensaje + botón **Reintentar** que llama `refetch`), `Skeleton` (+ `ProductCardSkeleton`, `PageSkeleton`), `Toast` / `useToast`.

Helper `QueryBoundary`: recibe `{ isLoading, isError, error, refetch, isEmpty }` y renderiza el estado correcto. Así ninguna vista remota olvida loading/empty/error.

---

## 6. Componentes por feature

| Feature      | Componentes                                                                                                                                                                                       | Hooks                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`       | `LoginForm`, `RegisterForm`, `LoginModal`, `Can`                                                                                                                                                  | `useAuth`, `usePermission`, `useLogin`, `useRegister`                                                                                   |
| `users`      | `ProfileForm`, `AddressList`, `AddressForm`, `AddressFormModal`                                                                                                                                   | `useMe`, `useAddresses`, `useUpdateProfile`                                                                                             |
| `catalog`    | `ProductCard`, `ProductGrid`, `ProductGallery`, `VariantSelector`, `CatalogFilters`, `FiltersDrawer`, `SortSelect`, `Pagination`, `CategoryList`, `ProductDetailsModal`                           | `useProducts(filters)`, `useProduct(slug)`, `useCategories`, `useCatalogFilters` (sync con URL)                                         |
| `pricing`    | `PriceDisplay` (público vs. tu precio + motivo), `PricingTiers`, `PricingTier`, `SavingsIndicator`, `QuantityTierProgress`, `AppliedRulesList`                                                    | `usePriceQuote(variantId, qty)`                                                                                                         |
| `cart`       | `CartDrawer`, `CartItem`, `CartSummary`, `CartIncentives`, `FreeShippingProgress`, `AddToCartButton`, `AddToCartModal`                                                                            | `useCart` (fachada invitado/autenticado), `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem`                                      |
| `checkout`   | `CheckoutSteps`, `AddressStep`, `ShippingStep`, `PaymentStep`, `OrderReview`                                                                                                                      | `useCheckout`, `useCreateOrder`                                                                                                         |
| `orders`     | `OrderList`, `OrderCard`, `OrderStatusBadge`, `OrderDetail`, `CancelOrderModal`, `ReorderButton`                                                                                                  | `useOrders`, `useOrder`, `useCancelOrder`, `useReorder`                                                                                 |
| `favorites`  | `FavoriteButton`, `FavoritesGrid`                                                                                                                                                                 | `useFavorites`, `useToggleFavorite`                                                                                                     |
| `lists`      | `PurchaseList`, `PurchaseListItem`, `ListCard`, `CreateListModal`, `AddToListModal`                                                                                                               | `useLists`, `useList`, `useListMutations`, `useAddListToCart`                                                                           |
| `wholesale`  | `WholesaleLevelCard`, `WholesaleProgress`, `WholesaleBenefits`, `WholesaleRequestForm`, `WholesaleRequestStatus`, `WholesaleRequestModal`, `QuickOrder`, `FrequentProducts`, `WholesaleDashboard` | `useWholesaleProfile`, `useWholesaleLevels`, `useWholesaleRequest`, `useSubmitWholesaleRequest`, `useFrequentProducts`, `useQuickOrder` |
| `promotions` | `PromotionBanner`, `VolumeOffers`                                                                                                                                                                 | `usePromotions`                                                                                                                         |
| `home`       | `HomeHero` (dos CTAs: individual / mayorista), `FeaturedProducts`, `BestSellers`, `BenefitsStrip`, `WholesaleCta`                                                                                 | — (usa hooks de otros features)                                                                                                         |

`PurchaseProgress` de la spec queda cubierto por `QuantityTierProgress` + `FreeShippingProgress`, ambos sobre `ProgressBar`.

---

## 7. Contrato de API

Este es el contrato que deberá cumplir el backend propio. Los mocks lo implementan igual.

### Convenciones

- Base: `VITE_API_URL` (p. ej. `http://localhost:3000/api/v1`).
- JSON, `camelCase`.
- **Dinero: enteros en COP** (sin decimales). `35000` = $35.000. El front formatea con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })`.
- Precios **con IVA incluido** (a confirmar, §13).
- Fechas ISO 8601 UTC.
- Auth: `Authorization: Bearer <token>`.
- Paginación: `?page=1&pageSize=24` → `{ items, page, pageSize, total, totalPages }`.
- Error:

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Texto legible", "details": { "field": "msg" } }
}
```

Códigos HTTP: 400 validación, 401 sin sesión, 403 sin permiso, 404, 409 conflicto (stock), 422 regla de negocio, 500.

### Tipo compartido: `PriceView`

Lo devuelve el backend ya calculado **para el usuario que hace la request** y una cantidad dada (default 1).

```json
{
  "currency": "COP",
  "audience": "WHOLESALE",
  "quantity": 5,
  "listPrice": 35000,
  "unitPrice": 29500,
  "compareAtPrice": null,
  "lineTotal": 147500,
  "savings": { "unit": 5500, "total": 27500, "percent": 16 },
  "appliedRules": [
    { "type": "WHOLESALE_LEVEL", "label": "Nivel ORO", "percent": 12 },
    { "type": "QUANTITY_TIER", "label": "Desde 1 unidad", "minQty": 1 },
    { "type": "PROMOTION", "label": "Temporada", "promotionId": "p1" }
  ],
  "tiers": [
    {
      "minQty": 1,
      "label": "Unidad",
      "unitPrice": 35000,
      "savingsPercent": 0,
      "isCurrent": true,
      "isBest": false
    },
    {
      "minQty": 6,
      "label": "Media docena",
      "unitPrice": 31000,
      "savingsPercent": 11,
      "isCurrent": false,
      "isBest": false
    },
    {
      "minQty": 12,
      "label": "Docena",
      "unitPrice": 27000,
      "savingsPercent": 23,
      "isCurrent": false,
      "isBest": false
    },
    {
      "minQty": 24,
      "label": "24 unidades",
      "unitPrice": 24000,
      "savingsPercent": 31,
      "isCurrent": false,
      "isBest": true
    }
  ],
  "nextTier": { "minQty": 6, "label": "Media docena", "unitPrice": 31000, "unitsToReach": 1 }
}
```

- `audience`: `PUBLIC | BUYER | WHOLESALE`.
- `appliedRules` explica **por qué** el usuario ve ese precio (requisito de la spec).
- `tiers` vacío → el producto no tiene escalas.

### Auth / usuarios

| Método       | Endpoint                  | Body / respuesta                                                                                    |
| ------------ | ------------------------- | --------------------------------------------------------------------------------------------------- |
| POST         | `/auth/register`          | `{ name, email, password }` → `{ token, user }`                                                     |
| POST         | `/auth/login`             | `{ email, password }` → `{ token, user }`                                                           |
| POST         | `/auth/logout`            | —                                                                                                   |
| POST         | `/auth/password/forgot`   | `{ email }` → `{ message }` (misma respuesta exista o no la cuenta)                                 |
| POST         | `/auth/password/reset`    | `{ token, password }` → `{ message }`                                                               |
| GET          | `/users/me`               | `User`                                                                                              |
| PATCH        | `/users/me`               | `{ name, phone }` → `User`                                                                          |
| POST         | `/users/me/password`      | `{ currentPassword, newPassword }` → `{ message }`; error de la actual en `details.currentPassword` |
| GET/POST     | `/users/me/addresses`     | `Address[]` / `Address`                                                                             |
| PATCH/DELETE | `/users/me/addresses/:id` |                                                                                                     |

```json
// User
{
  "id": "u1",
  "name": "Carlos Pérez",
  "email": "carlos@mail.com",
  "phone": "3001234567",
  "role": "WHOLESALE",
  "permissions": ["cart.manage", "checkout.create", "orders.view", "favorites.manage", "lists.manage", "wholesale.access", "wholesale.quick-order"],
  "wholesale": { "requestStatus": "APPROVED", "levelCode": "GOLD" }
}

// Address
{ "id": "a1", "label": "Tienda", "recipient": "Carlos Pérez", "phone": "300...", "department": "Antioquia", "city": "Medellín", "line1": "Cra 1 # 2-3", "line2": null, "notes": null, "isDefault": true }
```

Reglas de auth (fase 8):

- Login: el mismo error para correo inexistente o contraseña incorrecta. Contraseña: 8+ caracteres con letras y números. Registro exige `acceptTerms`.
- Un 401 en `/auth/*` es "credenciales inválidas"; un 401 en cualquier otra ruta con sesión cierra la sesión y avisa "Tu sesión expiró".
- Errores por campo en `error.details` (p. ej. `EMAIL_TAKEN` → `details.email`); el frontend los muestra junto al campo y enfoca el primero.
- `devResetToken` solo existe en el mock (no hay correo en la demo). El backend real nunca lo devuelve.
- Acciones que requieren cuenta usan `useRequireAuth()`: sin sesión abre el modal de login y, al ingresar, ejecuta la acción pendiente.

### Catálogo

| Método | Endpoint                | Notas                                                                                   |
| ------ | ----------------------- | --------------------------------------------------------------------------------------- |
| GET    | `/categories`           | `Category[]` (árbol simple: `parentId`)                                                 |
| GET    | `/products`             | `?q&category&size&color&minPrice&maxPrice&sort&page&pageSize&tag` → paginado + `facets` |
| GET    | `/products/:slug`       | `ProductDetail`                                                                         |
| GET    | `/products/lookup?sku=` | para pedido rápido                                                                      |

`sort`: `relevance | price_asc | price_desc | newest | bestsellers`. `tag`: `featured | bestseller | volume-offer`.

```json
// Respuesta de /products
{
  "items": [ /* ProductSummary */ ],
  "page": 1, "pageSize": 24, "total": 120, "totalPages": 5,
  "facets": {
    "sizes": [{ "value": "M", "count": 40 }],
    "colors": [{ "value": "Negro", "hex": "#111111", "count": 25 }],
    "priceRange": { "min": 18000, "max": 220000 }
  }
}

// ProductSummary
{
  "id": "p1", "slug": "camiseta-basica", "name": "Camiseta básica",
  "category": { "id": "c1", "slug": "camisetas", "name": "Camisetas" },
  "image": { "url": "...", "alt": "Camiseta básica negra", "width": 800, "height": 1000 },
  "colors": [{ "name": "Negro", "hex": "#1a1a1a" }],
  "tags": ["featured"],
  "inStock": true,
  "pricing": { /* PriceView con quantity = 1 */ }
}

// ProductDetail = ProductSummary +
{
  "description": "...",
  "images": [ { "url": "...", "alt": "...", "width": 800, "height": 1000, "color": "Negro" } ],
  "options": [
    { "name": "size",  "label": "Talla", "values": ["S", "M", "L", "XL"] },
    { "name": "color", "label": "Color", "values": ["Negro", "Blanco"] }
  ],
  "variants": [
    { "id": "v1", "sku": "CAM-BAS-NEG-M", "attributes": { "size": "M", "color": "Negro" }, "stock": 120, "available": true }
  ]
}
```

### Precios

| Método | Endpoint         | Notas                                                                                                                                            |
| ------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/pricing/quote` | `{ items: [{ variantId, quantity }] }` → `{ items: [{ variantId, pricing: PriceView }] }`. Se usa al cambiar cantidad en el detalle de producto. |

### Carrito

Autenticado: carrito en servidor. Invitado: items en `localStorage`, precios vía `/cart/quote`. Al iniciar sesión: `/cart/merge`.

| Método | Endpoint              | Notas                                                                   |
| ------ | --------------------- | ----------------------------------------------------------------------- |
| GET    | `/cart`               | `Cart`                                                                  |
| POST   | `/cart/items`         | `{ variantId, quantity }` → `Cart`                                      |
| POST   | `/cart/items/bulk`    | `{ items: [{ variantId, quantity }] }` → `Cart` (pedido rápido, listas) |
| PATCH  | `/cart/items/:itemId` | `{ quantity?, variantId? }` → `Cart`                                    |
| DELETE | `/cart/items/:itemId` | → `Cart`                                                                |
| POST   | `/cart/merge`         | `{ items: [{ variantId, quantity }] }` → `Cart`                         |
| POST   | `/cart/quote`         | `{ items }` → `Cart` sin persistir (invitado)                           |

```json
// Cart
{
  "id": "cart1",
  "items": [
    {
      "id": "ci1",
      "productId": "p1",
      "productSlug": "camiseta-basica",
      "name": "Camiseta básica",
      "image": { "url": "...", "alt": "..." },
      "variant": {
        "id": "v1",
        "sku": "CAM-BAS-NEG-M",
        "attributes": { "size": "M", "color": "Negro" },
        "stock": 120
      },
      "available": true,
      "quantity": 5,
      "productQuantity": 5,
      "pricing": {/* PriceView: lineTotal y savings de la línea; escala según productQuantity */},
      "variantOptions": [
        { "id": "v2", "attributes": { "size": "L", "color": "Negro" }, "available": true }
      ]
    }
  ],
  "summary": {
    "itemsCount": 5,
    "subtotal": 175000,
    "discountTotal": 20000,
    "shipping": 12000,
    "total": 167000,
    "savingsTotal": 20000
  },
  "incentives": [
    {
      "type": "QUANTITY_TIER",
      "productId": "p1",
      "productName": "Camiseta básica",
      "current": 5,
      "target": 6,
      "remaining": 1,
      "targetLabel": "Media docena",
      "targetUnitPrice": 31200,
      "progressPercent": 83
    },
    {
      "type": "FREE_SHIPPING",
      "achieved": false,
      "current": 175000,
      "target": 200000,
      "remaining": 25000,
      "progressPercent": 87
    }
  ],
  "warnings": [{ "code": "STOCK_REDUCED", "cartItemId": "ci1", "message": "..." }]
}
```

Reglas del carrito (backend):

- **La escala por cantidad se calcula por producto**, sumando todas sus variantes en el carrito (3 negras M + 3 blancas L = media docena). `productQuantity` indica esas unidades.
- `subtotal` es a precio público; `discountTotal` = subtotal − total de líneas.
- Variantes agotadas: `available: false`, aviso en `warnings` y fuera de los totales. Si se pide más que el stock, se ajusta y se avisa (`STOCK_REDUCED`).
- Cambiar la variante a una que ya está en el carrito une las dos líneas.

El backend manda **números**, no frases. El texto ("Agrega 1 unidad más y obtén precio de media docena") lo arma el componente. Así el copy se puede cambiar sin tocar el backend.

### Checkout y pedidos

| Método | Endpoint                                | Notas                                                                                                  |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | `/checkout/shipping-options?addressId=` | `[{ id, label, description, price, estimatedDays, total }]` — `total` lo calcula el backend por opción |
| POST   | `/orders`                               | `{ addressId, shippingOptionId, paymentMethod, notes }` → `{ order, payment: { redirectUrl? } }`       |
| GET    | `/orders`                               | paginado de `OrderSummary`                                                                             |
| GET    | `/orders/:id`                           | `Order`                                                                                                |
| POST   | `/orders/:id/cancel`                    | `{ reason }` → `Order`                                                                                 |
| POST   | `/orders/:id/reorder`                   | → `Cart` (+ `warnings` si algo no hay stock)                                                           |

```json
// Order
{
  "id": "o1",
  "number": "PED-000123",
  "createdAt": "2026-10-09T15:00:00Z",
  "status": "PROCESSING",
  "items": [
    {
      "productId": "p1",
      "name": "...",
      "variant": { "attributes": {} },
      "quantity": 6,
      "unitPrice": 31000,
      "lineTotal": 186000
    }
  ],
  "summary": { "subtotal": 210000, "discountTotal": 24000, "shipping": 0, "total": 186000 },
  "address": {/* Address */},
  "shipping": {
    "id": "standard",
    "label": "Envío estándar",
    "estimatedDays": "3 a 5 días hábiles"
  },
  "payment": { "method": "PSE", "label": "PSE" },
  "notes": null,
  "canCancel": true,
  "canReorder": true
}
```

`status`: `PENDING_PAYMENT | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED`. `canCancel` / `canReorder` los decide el backend.

Checkout (fase 7):

- `paymentMethod`: `CARD | PSE | CASH_ON_DELIVERY`. **Mientras no haya pasarela, el pago es simulado**: el frontend nunca pide ni envía datos de tarjeta o bancarios. Con pasarela real, `payment.redirectUrl` llevará al pago y la confirmación llegará por webhook al backend.
- El total con envío se muestra desde `shipping-options[].total`; el frontend no suma el envío.
- Al crear el pedido el backend vacía el carrito; el frontend invalida la caché del carrito.

### Favoritos y listas

| Método               | Endpoint                                       |
| -------------------- | ---------------------------------------------- |
| GET                  | `/favorites` → `ProductSummary[]`              |
| PUT / DELETE         | `/favorites/:productId`                        |
| GET / POST           | `/lists` → `ListSummary[]` / `{ name }`        |
| GET / PATCH / DELETE | `/lists/:id`                                   |
| POST                 | `/lists/:id/items` → `{ variantId, quantity }` |
| PATCH / DELETE       | `/lists/:id/items/:itemId`                     |
| POST                 | `/lists/:id/add-to-cart` → `Cart`              |

```json
// List
{
  "id": "l1",
  "name": "Pedido mensual",
  "updatedAt": "...",
  "items": [
    {
      "id": "li1",
      "productId": "p1",
      "name": "Camiseta negra",
      "image": {},
      "variant": { "id": "v1", "attributes": {} },
      "quantity": 12,
      "available": true,
      "pricing": {/* PriceView con quantity = 12 */}
    }
  ]
}
```

### Mayorista

| Método | Endpoint                       | Notas                                                                  |
| ------ | ------------------------------ | ---------------------------------------------------------------------- |
| GET    | `/wholesale/levels`            | niveles configurables                                                  |
| GET    | `/wholesale/profile`           | solo `wholesale.access`                                                |
| GET    | `/wholesale/requests/me`       | solicitud actual o `null`                                              |
| POST   | `/wholesale/requests`          | formulario comercial                                                   |
| GET    | `/wholesale/frequent-products` | `[{ product: ProductSummary, variant, usualQuantity, lastOrderedAt }]` |

```json
// Level
{ "code": "GOLD", "name": "ORO", "minPurchase": 2000000, "maxPurchase": 4999999, "discountPercent": 12, "benefits": [ { "code": "FREE_SHIPPING", "label": "Envío gratis" } ] }

// WholesaleProfile
{
  "currentLevel": { "code": "GOLD", "name": "ORO", "discountPercent": 12 },
  "accumulatedPurchase": 8450000,
  "period": { "from": "2026-01-01", "to": "2026-12-31" },
  "nextLevel": { "code": "PLATINUM", "name": "PLATINO", "minPurchase": 10000000, "discountPercent": 15 },
  "amountToNextLevel": 1550000,
  "progressPercent": 84,
  "totalSavings": 1240000,
  "benefits": [ { "code": "FREE_SHIPPING", "label": "Envío gratis", "description": "..." } ]
}

// WholesaleRequest
{
  "id": "wr1",
  "status": "UNDER_REVIEW",
  "submittedAt": "...", "reviewedAt": null, "rejectionReason": null,
  "data": {
    "tradeName": "", "legalName": "", "nit": "", "phone": "", "city": "", "address": "",
    "businessType": "PHYSICAL_STORE", "socialLinks": [], "estimatedMonthlyVolume": "1M_5M", "categoriesOfInterest": ["c1"]
  }
}
```

`nextLevel: null` → nivel máximo alcanzado.

Pedidos y recompra (fase 12):

- `GET /orders?group=active|delivered|cancelled&page=`: filtros del historial.
- `POST /orders/:id/cancel { reason }`: solo en `PENDING_PAYMENT | PAID | PROCESSING` (si no, 422 `ORDER_NOT_CANCELLABLE`). La orden guarda `cancelledAt` y `cancelReason`.
- `POST /orders/:id/reorder` → `Cart`: agrega lo disponible; lo agotado viene en `warnings` con `code: REORDER_UNAVAILABLE`.
- `GET /products/lookup?q=` (2+ caracteres): variantes por nombre o SKU para el pedido rápido `[{ variantId, sku, productName, attributes, available, stock, image, pricing }]`.
- `GET /wholesale/frequent-products`: `[{ variant, product, usualQuantity, timesOrdered, lastOrderedAt, pricing }]`; `usualQuantity` = promedio de unidades por pedido.

Panel mayorista (fase 11):

- `accumulatedPurchase` = compras del año (pedidos no cancelados). El nivel es el más alto cuyo `minPurchase` se alcanzó y **no baja durante el año**. `progressPercent` mide el avance entre el tope del nivel actual y el del siguiente.
- `POST /orders` de un mayorista responde además `levelUp: { from, to, discountPercent } | null`. Si subió, el frontend llama `refreshSession()` (cambian sus precios) y la confirmación lo anuncia.
- `GET /wholesale/profile` responde 403 si el usuario no es mayorista.

Solicitud mayorista (fase 10):

- Puede solicitar quien nunca lo hizo o fue rechazado (`requestStatus` `null` o `REJECTED`); el backend responde 409 en otro caso. Suspendido debe contactar a la tienda.
- Al enviar, `requestStatus` pasa a `PENDING` y el usuario pierde `wholesale.request`. Al aprobarse cambian `role`, `permissions` y `levelCode`: el frontend llama `refreshSession()` (vuelve a pedir `/users/me` y descarta precios y carrito cacheados).
- Campos: `tradeName`, `legalName`, `nit` (6–10 dígitos, `-dv` opcional), `phone`, `city`, `address`, `businessType` (`PHYSICAL_STORE | ONLINE_STORE | CATALOG | DISTRIBUTOR | OTHER`), `socialLinks?`, `estimatedMonthlyVolume` (`UNDER_1M | 1M_5M | 5M_10M | OVER_10M`), `categoriesOfInterest[]`.
- **Solo en el mock**: `POST /_dev/wholesale-review { status }` simula la decisión del administrador para la demo (panel "Simulador de revisión", visible solo con `VITE_USE_MOCKS=true`). En producción la decisión llega desde el panel administrativo.

### Promociones

| Método | Endpoint                                                                                   |
| ------ | ------------------------------------------------------------------------------------------ |
| GET    | `/promotions/active` → `[{ id, title, description, image, type, startsAt, endsAt, link }]` |

---

## 8. Modelo de permisos

El backend devuelve `permissions[]` en `/users/me`. **El front nunca deriva permisos del rol**: solo consulta la lista. El rol se usa solo para elegir el layout o dashboard.

| Permiso                 | Visitante |         Comprador          |   Mayorista    |
| ----------------------- | :-------: | :------------------------: | :------------: |
| `cart.manage`           | ✔ (local) |             ✔              |       ✔        |
| `checkout.create`       |           |             ✔              |       ✔        |
| `orders.view`           |           |             ✔              |       ✔        |
| `favorites.manage`      |           |             ✔              |       ✔        |
| `lists.manage`          |           |             ✔              |       ✔        |
| `wholesale.request`     |           | ✔ (sin solicitud aprobada) |                |
| `wholesale.access`      |           |                            |       ✔        |
| `wholesale.quick-order` |           |                            |       ✔        |
| `admin.access`          |           |                            | (admin futuro) |

Constantes en `src/constants/permissions.js`. Uso:

```jsx
<Can permission="wholesale.access" fallback={<WholesaleCta />}>
  <WholesaleLevelCard />
</Can>
```

- `usePermission('x')` → boolean para lógica.
- `RequirePermission` para rutas.
- Visitante que intenta una acción que requiere sesión (favorito, checkout) → `LoginModal` y retoma la acción tras login.
- **El backend valida todo.** Ocultar un botón en el front es UX, no seguridad.

---

## 9. Estados de usuario

### Sesión

```text
UNKNOWN (cargando /users/me) → ANONYMOUS | AUTHENTICATED
```

Mientras está `UNKNOWN`, las rutas protegidas muestran skeleton (no redirigen).

### Perfil comercial

```text
role: BUYER | WHOLESALE | ADMIN
```

### Solicitud mayorista → UI

| Estado         | UI en `/cuenta/solicitud-mayorista` y dashboard                         |
| -------------- | ----------------------------------------------------------------------- |
| `null`         | Formulario + beneficios del programa                                    |
| `PENDING`      | "Recibimos tu solicitud", fecha de envío, datos enviados (solo lectura) |
| `UNDER_REVIEW` | "Estamos revisando", línea de tiempo con paso actual                    |
| `APPROVED`     | Nivel asignado + CTA al panel mayorista                                 |
| `REJECTED`     | Motivo (`rejectionReason`) + "Enviar nueva solicitud"                   |
| `SUSPENDED`    | Aviso + contacto. Pierde `wholesale.access` (lo decide el backend)      |

Constantes en `src/constants/statuses.js` con label y variante de badge por estado.

---

## 10. Sistema de precios (frontend)

Principio: **el front no calcula precios**. Solo los presenta.

Cadena que aplica el backend (implementada así en el mock, `services/api/mocks/pricing.js`):

```text
precio base → promoción → escala por cantidad (todos los clientes) → % del nivel mayorista
```

Las escalas por cantidad aplican a cualquier cliente ("Compra más, paga menos"); el mayorista suma encima el descuento de su nivel. Si el catálogo se filtra por color, `image` corresponde a ese color.

1. Cada producto llega con un `PriceView` ya calculado para el usuario actual.
2. Si el usuario cambia la cantidad en el detalle de producto, `usePriceQuote(variantId, qty)` llama `/pricing/quote` (con debounce de 300 ms y `placeholderData` del valor anterior para no parpadear).
3. El resaltado de tier en la tabla (`isCurrent`, `isBest`) viene del backend.
4. Al cambiar de sesión (login, logout, aprobación mayorista), se invalidan **todas** las queries de catálogo, precios y carrito: `queryClient.invalidateQueries()` + reset de las que dependen del usuario. Los precios dependen de quién mira.
5. El texto lo arma la presentación con datos del backend:
   - `PriceDisplay`: "Precio público $35.000 · **Tu precio $29.500** · Ahorras $5.500" + `appliedRules` como explicación ("Nivel ORO −12%").
   - `QuantityTierProgress`: `nextTier.unitsToReach` → "Agrega 1 unidad y desbloquea precio de media docena".
   - `FreeShippingProgress`: `incentive.remaining` → "Agrega $25.000 más y obtén envío gratis".
6. Única utilidad monetaria del front: `formatMoney(amount)`. Nada de sumas ni descuentos.

Excepción: el subtotal visual del carrito invitado **no** se calcula localmente; se obtiene de `/cart/quote`.

---

## 11. Estrategia responsive

Mobile-first: los estilos base son para móvil y los breakpoints solo **agregan** (`min-width`).

| Token | min-width | Uso típico                                           |
| ----- | --------- | ---------------------------------------------------- |
| `sm`  | 480px     | grid de 2 columnas                                   |
| `md`  | 768px     | tablet: grid de 3, filtros aún en drawer             |
| `lg`  | 1024px    | desktop: sidebar de filtros visible, header completo |
| `xl`  | 1280px    | grid de 4, contenedor máximo                         |

```scss
@include mq(md) { ... }
```

| Elemento                 | Móvil                                    | Desktop                        |
| ------------------------ | ---------------------------------------- | ------------------------------ |
| Navegación               | Hamburguesa → `Drawer` izquierda         | `CategoryNav` horizontal       |
| Carrito                  | `Drawer` derecha (bottom sheet opcional) | `Drawer` derecha               |
| Filtros                  | Botón "Filtrar" → `Drawer`               | Sidebar fija                   |
| Tiers de precio          | Scroll horizontal con snap               | Tabla/fila completa            |
| Tablas (pedidos, listas) | Cards apiladas                           | Tabla                          |
| Checkout                 | Un paso por pantalla, CTA fijo abajo     | Pasos + resumen lateral sticky |
| Cuenta                   | Tabs con scroll                          | Sidebar                        |

- Áreas táctiles de al menos 44×44px.
- Imágenes con `srcset`/`sizes` y `aspect-ratio` reservado (evita CLS).
- Contenedor con `padding-inline` de 16px en móvil.

---

## 12. Design system

Marca provisional: **"Trama"** (ropa). Todo vive en tokens: cambiar marca = cambiar `_tokens.scss`.

Los tokens se exponen como **CSS custom properties** en `:root` (permite tema y overrides en runtime). SCSS se usa para mixins y funciones.

### Color

Fuente de verdad: `src/styles/base/_tokens.scss`. Todos los pares texto/fondo cumplen WCAG AA (≥ 4.5:1) y los bordes de controles ≥ 3:1 (WCAG 1.4.11).

| Token                                                | Uso                                     | Valor                                         |
| ---------------------------------------------------- | --------------------------------------- | --------------------------------------------- |
| `--color-bg` / `--color-surface`                     | fondo / cards                           | `#FAFAF8` / `#FFFFFF`                         |
| `--color-text` / `-muted` / `-subtle`                | texto                                   | `#1A1A1A` / `#5C5C5C` / `#767676`             |
| `--color-border`                                     | separadores decorativos                 | `#E4E2DD`                                     |
| `--color-border-strong`                              | borde de inputs y botones secundarios   | `#8A867E`                                     |
| `--color-primary`                                    | CTA compra individual                   | `#1F3A5F`                                     |
| `--color-wholesale`                                  | todo lo mayorista                       | `#B4561E`                                     |
| `--color-success` / `-warning` / `-danger` / `-info` | estados (con variante `-soft` de fondo) | `#256B42` / `#8A5800` / `#B3261E` / `#1F5FA8` |
| `--color-level-bronze/silver/gold/platinum`          | badges de nivel (texto blanco)          | `#8C5A2B` / `#626770` / `#86690F` / `#4E6A7A` |

Regla visual: **azul = compra individual, cobre = mayorista**. Así la home y las cards comunican las dos propuestas.

### Tipografía

- Fuente: **Inter** (self-hosted con `@fontsource-variable/inter`, sin dependencias externas), fallback `system-ui`.
- Escala (rem): `xs 0.75 · sm 0.875 · md 1 · lg 1.125 · xl 1.25 · 2xl 1.5 · 3xl 1.875 · 4xl 2.25`. Títulos con `clamp()` en hero.
- Precios con `font-variant-numeric: tabular-nums`.

### Espaciado, forma, profundidad

- Espaciado en base 4px: `--space-1` (4px) … `--space-16` (64px).
- Radios: `--radius-sm 4px · md 8px · lg 16px · pill 999px`.
- Sombras: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- z-index: `header 100 · drawer 200 · modal 300 · toast 400`.
- Movimiento: `--duration-fast 150ms · base 250ms`, siempre dentro de `@media (prefers-reduced-motion: no-preference)`.

### Convenciones BEM

- Un componente = un bloque. `ProductCard.jsx` ↔ `.product-card` ↔ `product-card.scss` en la misma carpeta.
- Elementos `__`, modificadores `--`. Sin anidar elementos (`block__el__sub` está prohibido).
- Estados de JS como modificador (`.drawer--open`) o atributo ARIA (`[aria-expanded="true"]`). Nada de `.is-active` global.
- `clsx` para componer modificadores.
- Sin clases utilitarias (`mt-20`) ni nombres de color (`red`).
- Globales permitidos: reset, tipografía base y tokens.
- Stylelint valida el patrón BEM (`selector-class-pattern`); `npm run lint` falla si una clase no lo cumple.
- Cada componente vive en su carpeta kebab-case: `components/ui/quantity-stepper/QuantityStepper.jsx` + `quantity-stepper.scss`.

### Componentes base (fase 2)

- `components/ui`: Button, IconButton, Icon (set SVG propio), TextField, SelectField, Checkbox, QuantityStepper, Price, Badge, ProgressBar, ResponsiveImage, Spinner.
- `components/feedback`: LoadingState, EmptyState, ErrorState, Skeleton, QueryBoundary, Toast (`useToast`), RouteErrorBoundary.
- Formularios: `hooks/useForm` (valores, validación, errores del backend por campo, foco al primer error), `StackedForm` (campos + `FormError` + enviar), `PasswordField`.
- `ConfirmModal` (foco inicial en Cancelar: lo destructivo nunca es la opción por defecto) y `ContentCard` (tarjeta de sección para dashboards). `EmptyState compact` dentro de tarjetas y paneles.
- `components/modal` y `components/drawer`: comparten `hooks/useOverlay` (scroll lock con contador, focus trap con retorno de foco, ESC solo cierra el overlay superior, `#root` inerte) y `hooks/usePresence` (animación de salida).
- En desarrollo, `/_ds` muestra todos los componentes. No existe en el build de producción.

---

## 13. Decisiones arquitectónicas

| #   | Decisión                                                                                | Motivo                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **JavaScript** (no TS)                                                                  | Decisión del proyecto. Se compensa con contrato documentado aquí, JSDoc en tipos compartidos (`PriceView`, `Cart`) y oxlint estricto.                                                        |
| D2  | **TanStack Query** para estado del servidor                                             | Cache, loading/error/retry, invalidación por sesión, `placeholderData` para cotizar. Cubre el 80% del estado.                                                                                |
| D3  | **Context** para auth, carrito invitado y UI                                            | Poco estado cliente. Redux/Zustand serían ceremonia innecesaria.                                                                                                                             |
| D4  | **axios** + interceptores                                                               | Token, normalización de errores, manejo de 401 en un solo lugar. Los componentes nunca lo importan.                                                                                          |
| D5  | API por feature, infraestructura en `services/api`                                      | Features autocontenidos. Fácil de borrar o mover.                                                                                                                                            |
| D6  | **Mocks como adapter de axios** (`VITE_USE_MOCKS=true`)                                 | El backend aún no existe. El adapter responde con el contrato de §7, incluyendo un motor de precios falso. Cuando haya backend: `VITE_USE_MOCKS=false` y se borra `mocks/`. La UI no cambia. |
| D7  | Backend calcula precios y manda números; el front arma los textos                       | Reglas comerciales en un solo lugar. Copy editable sin redeploy del backend.                                                                                                                 |
| D8  | Dinero en enteros COP                                                                   | COP no usa centavos. Evita errores de coma flotante.                                                                                                                                         |
| D9  | Token JWT en `localStorage` (v1)                                                        | Igual que web_project_api_full. Riesgo XSS conocido. Migrar a cookie httpOnly + refresh cuando exista el backend propio.                                                                     |
| D10 | Lazy loading por página, no por componente                                              | Code splitting donde importa. Sin optimizar prematuramente.                                                                                                                                  |
| D11 | `QueryBoundary` obligatorio en vistas remotas                                           | Garantiza loading/empty/error/retry. Nunca pantalla blanca.                                                                                                                                  |
| D12 | Tooling: Vite 8, React Router 8, oxlint + Prettier, Vitest + Testing Library, Stylelint | oxlint es el linter por defecto de la plantilla de Vite; incluye regla que prohíbe importar axios fuera de `services/api`.                                                                   |

---

## Pendientes a confirmar

1. La spec original salta las secciones **6, 7, 9 y 13**. ¿Se eliminaron a propósito o falta contenido (p. ej. búsqueda, notificaciones)?
2. **Pasarela de pago** (Wompi, MercadoPago, PayU). En v1 el checkout simula el pago.
3. ¿Precios **con IVA incluido**?
4. ¿Mayorista tiene **mínimo de compra** por pedido?
5. ¿El envío se cobra por tarifa fija, por ciudad o por peso?
6. ¿Checkout de invitado? La spec dice que no (exige login). Se mantiene así.

---

## Plan por fases

| Fase | Entregable                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 1    | Scaffold Vite, tooling, estructura, providers, `apiClient` + mocks, rutas lazy con páginas placeholder |
| 2    | Tokens, `styles/`, componentes `ui/` y `feedback/`, Modal, Drawer                                      |
| 3    | Header, Footer, layouts, menú móvil, CartDrawer vacío                                                  |
| 4    | Catálogo: listado, filtros (URL), búsqueda, paginación                                                 |
| 5    | Detalle de producto, variantes, `PriceDisplay`, `PricingTiers`, cotización                             |
| 6    | Carrito invitado y autenticado, incentivos                                                             |
| 7    | Checkout                                                                                               |
| 8    | Auth: login, registro, guards, merge de carrito                                                        |
| 9    | Cuenta comprador: dashboard, perfil, direcciones                                                       |
| 10   | Solicitud mayorista y estados                                                                          |
| 11   | Dashboard mayorista: nivel, progreso, beneficios                                                       |
| 12   | Pedidos, cancelar, recompra, pedido rápido, frecuentes                                                 |
| 13   | Favoritos y listas                                                                                     |
| 14   | Promociones, home completa                                                                             |
| 15   | Accesibilidad (axe), performance, tests                                                                |

> Nota: auth (fase 8) va después del checkout (fase 7) en la spec. Se adelanta un `AuthProvider` mínimo con mocks en fase 1, para que los guards y precios por usuario funcionen desde el inicio.
