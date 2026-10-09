import { useState } from 'react'
import { Drawer } from '@/components/drawer'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  QueryBoundary,
  Skeleton,
  useToast,
} from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Modal } from '@/components/modal'
import {
  Badge,
  Button,
  Checkbox,
  IconButton,
  Price,
  ProgressBar,
  QuantityStepper,
  ResponsiveImage,
  SelectField,
  TextField,
} from '@/components/ui'
import './design-system-page.scss'

// Catálogo visual de componentes. Solo existe en desarrollo (ruta /_ds).

const SIZES = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
]

function Section({ title, children }) {
  return (
    <section className="design-system-page__section">
      <h2 className="design-system-page__heading">{title}</h2>
      <div className="design-system-page__row">{children}</div>
    </section>
  )
}

export default function DesignSystemPage() {
  const toast = useToast()
  const [quantity, setQuantity] = useState(5)
  const [modalOpen, setModalOpen] = useState(false)
  const [nestedOpen, setNestedOpen] = useState(false)
  const [drawer, setDrawer] = useState(null)
  const [queryState, setQueryState] = useState('success')

  const fakeQuery = {
    isPending: queryState === 'loading',
    isError: queryState === 'error',
    isFetching: false,
    error: { message: 'No pudimos conectar con el servidor. Revisa tu conexión.' },
    data:
      queryState === 'error' || queryState === 'loading'
        ? undefined
        : { items: queryState === 'empty' ? [] : ['a', 'b'] },
    refetch: () => setQueryState('success'),
  }

  return (
    <div className="design-system-page">
      <PageHeader title="Design system" description="Componentes base de Trama." />

      <Section title="Botones">
        <Button>Comprar</Button>
        <Button variant="wholesale">Precio mayorista</Button>
        <Button variant="secondary">Secundario</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Cancelar pedido</Button>
        <Button iconStart="bag">Con icono</Button>
        <Button loading>Guardando</Button>
        <Button disabled>Deshabilitado</Button>
        <Button size="sm">Pequeño</Button>
        <Button size="lg">Grande</Button>
        <IconButton icon="heart" label="Agregar a favoritos" />
        <IconButton icon="bag" label="Carrito, 3 productos" badge={3} variant="secondary" />
      </Section>

      <Section title="Badges">
        <Badge>Neutral</Badge>
        <Badge tone="info">En preparación</Badge>
        <Badge tone="success">Aprobada</Badge>
        <Badge tone="warning">Pendiente</Badge>
        <Badge tone="danger">Cancelado</Badge>
        <Badge tone="wholesale">Mayorista</Badge>
        <Badge level="bronze">Bronce</Badge>
        <Badge level="silver">Plata</Badge>
        <Badge level="gold">Oro</Badge>
        <Badge level="platinum">Platino</Badge>
      </Section>

      <Section title="Precios">
        <Price amount={35000} strike srLabel="Precio público" />
        <Price amount={29500} tone="wholesale" size="lg" srLabel="Tu precio" />
        <Price amount={5500} tone="success" size="sm" srLabel="Ahorras" />
        <Price amount={8450000} size="xl" />
      </Section>

      <Section title="Progreso">
        <div className="design-system-page__stack">
          <ProgressBar
            value={5}
            max={6}
            label="Progreso a media docena"
            valueText="5 de 6 unidades"
          />
          <ProgressBar value={175000} max={200000} tone="success" label="Progreso a envío gratis" />
          <ProgressBar value={84} tone="wholesale" label="Progreso a nivel Platino" />
        </div>
      </Section>

      <Section title="Formularios">
        <div className="design-system-page__stack">
          <TextField label="Nombre comercial" placeholder="Mi tienda" required />
          <TextField label="NIT" hint="Sin dígito de verificación" />
          <TextField label="Correo" error="Ingresa un correo válido." defaultValue="carlos@" />
          <TextField label="Notas" multiline />
          <SelectField
            label="Talla"
            options={SIZES}
            placeholder="Elige una talla"
            defaultValue=""
          />
          <Checkbox label="Recordarme" />
          <Checkbox
            label="Acepto los términos"
            description="Puedes leerlos en cualquier momento."
          />
          <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={24} />
          <QuantityStepper value={quantity} onChange={setQuantity} size="sm" />
        </div>
      </Section>

      <Section title="Imagen">
        <div className="design-system-page__image">
          <ResponsiveImage src="/no-existe.jpg" alt="Camiseta (placeholder)" />
        </div>
      </Section>

      <Section title="Overlays">
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          Abrir modal
        </Button>
        <Button variant="secondary" onClick={() => setDrawer('right')}>
          Drawer derecha
        </Button>
        <Button variant="secondary" onClick={() => setDrawer('left')}>
          Drawer izquierda
        </Button>
        <Button variant="secondary" onClick={() => setDrawer('bottom')}>
          Drawer inferior
        </Button>
      </Section>

      <Section title="Toasts">
        <Button
          variant="secondary"
          onClick={() =>
            toast.show({
              title: 'Producto agregado',
              description: 'Camiseta básica × 6',
              tone: 'success',
            })
          }
        >
          Éxito
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.show({ title: 'Stock reducido', tone: 'warning' })}
        >
          Aviso
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.show({
              title: 'No se pudo guardar',
              description: 'Intenta de nuevo.',
              tone: 'danger',
            })
          }
        >
          Error
        </Button>
      </Section>

      <Section title="Estados de datos">
        <div className="design-system-page__stack">
          <SelectField
            label="Estado simulado"
            value={queryState}
            onChange={(event) => setQueryState(event.target.value)}
            options={[
              { value: 'loading', label: 'Loading' },
              { value: 'error', label: 'Error' },
              { value: 'empty', label: 'Empty' },
              { value: 'success', label: 'Success' },
            ]}
          />
          <QueryBoundary
            query={fakeQuery}
            isEmpty={(data) => data.items.length === 0}
            empty={
              <EmptyState
                title="Sin productos"
                description="Prueba con otros filtros."
                action={<Button variant="secondary">Limpiar filtros</Button>}
              />
            }
          >
            {(data) => <p>Datos cargados: {data.items.length} elementos.</p>}
          </QueryBoundary>
        </div>
      </Section>

      <Section title="Estados sueltos">
        <div className="design-system-page__stack">
          <LoadingState />
          <ErrorState error={{ message: 'El servidor no respondió.' }} onRetry={() => {}} />
          <Skeleton variant="rect" />
          <Skeleton lines={3} />
          <Skeleton variant="circle" />
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cancelar pedido"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Volver
            </Button>
            <Button variant="danger" onClick={() => setNestedOpen(true)}>
              Cancelar pedido
            </Button>
          </>
        }
      >
        <p>¿Seguro que quieres cancelar el pedido PED-000123?</p>
        <TextField label="Motivo" multiline />
      </Modal>

      <Modal
        open={nestedOpen}
        onClose={() => setNestedOpen(false)}
        title="Confirmación"
        size="sm"
        closeOnBackdrop={false}
        footer={<Button onClick={() => setNestedOpen(false)}>Entendido</Button>}
      >
        <p>Modal anidado: ESC cierra solo este.</p>
      </Modal>

      <Drawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        position={drawer ?? 'right'}
        title="Mi carrito"
        footer={<Button block>Ver carrito</Button>}
      >
        <p>Contenido del drawer ({drawer}).</p>
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </Drawer>
    </div>
  )
}
