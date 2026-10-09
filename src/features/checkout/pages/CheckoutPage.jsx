import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { EmptyState, QueryBoundary, Skeleton } from '@/components/feedback'
import { PageHeader } from '@/components/layout'
import { Button, TextField } from '@/components/ui'
import { useCart } from '@/features/cart'
import { useCreateOrder } from '@/features/orders'
import { formatAddress, useAddresses } from '@/features/users'
import { paths } from '@/constants/paths'
import { formatMoney } from '@/utils/formatMoney'
import { AddressStep } from '../components/address-step/AddressStep'
import { CheckoutStep } from '../components/checkout-step/CheckoutStep'
import { CheckoutSummary } from '../components/checkout-summary/CheckoutSummary'
import { PaymentStep } from '../components/payment-step/PaymentStep'
import { ShippingStep } from '../components/shipping-step/ShippingStep'
import { PAYMENT_METHODS } from '../constants'
import { useShippingOptions } from '../hooks/useShippingOptions'
import './checkout-page.scss'

const STEPS = ['address', 'shipping', 'payment', 'review']

function stepStatus(step, current) {
  const diff = STEPS.indexOf(step) - STEPS.indexOf(current)
  if (diff === 0) return 'current'
  return diff < 0 ? 'complete' : 'upcoming'
}

function Checkout({ cart }) {
  const navigate = useNavigate()
  const addresses = useAddresses()
  const createOrder = useCreateOrder()
  const [step, setStep] = useState('address')
  const [chosenAddressId, setAddressId] = useState(null)
  const [chosenShippingId, setShippingId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [notes, setNotes] = useState('')
  const [submitError, setSubmitError] = useState(null)

  // Valores por defecto derivados: dirección predeterminada y primera opción de envío.
  const addressId =
    chosenAddressId ?? addresses.data?.find((address) => address.isDefault)?.id ?? null
  const address = addresses.data?.find((item) => item.id === addressId)
  const shippingQuery = useShippingOptions(addressId)
  const shippingOption =
    shippingQuery.data?.find((option) => option.id === chosenShippingId) ?? shippingQuery.data?.[0]
  const payment = PAYMENT_METHODS.find((method) => method.value === paymentMethod)
  const canConfirm = Boolean(addressId && shippingOption && paymentMethod)

  async function handleConfirm() {
    setSubmitError(null)
    try {
      const { order } = await createOrder.mutateAsync({
        addressId,
        shippingOptionId: shippingOption.id,
        paymentMethod,
        notes,
      })
      navigate(paths.orderConfirmation(order.id), { replace: true })
    } catch (error) {
      setSubmitError(error.message)
    }
  }

  return (
    <div className="checkout-page__layout">
      <ol className="checkout-page__steps" role="list">
        <li>
          <CheckoutStep
            number={1}
            title="Dirección de entrega"
            status={stepStatus('address', step)}
            summary={address && `${address.label} · ${formatAddress(address)}`}
            onEdit={() => setStep('address')}
          >
            <AddressStep
              selectedId={addressId}
              onSelect={setAddressId}
              onContinue={() => setStep('shipping')}
            />
          </CheckoutStep>
        </li>
        <li>
          <CheckoutStep
            number={2}
            title="Envío"
            status={stepStatus('shipping', step)}
            summary={
              shippingOption &&
              `${shippingOption.label} · ${shippingOption.estimatedDays} · ${
                shippingOption.price === 0 ? 'Gratis' : formatMoney(shippingOption.price)
              }`
            }
            onEdit={() => setStep('shipping')}
          >
            <ShippingStep
              query={shippingQuery}
              selectedId={shippingOption?.id}
              onSelect={setShippingId}
              onContinue={() => setStep('payment')}
            />
          </CheckoutStep>
        </li>
        <li>
          <CheckoutStep
            number={3}
            title="Pago"
            status={stepStatus('payment', step)}
            summary={payment?.label}
            onEdit={() => setStep('payment')}
          >
            <PaymentStep
              selected={paymentMethod}
              onSelect={setPaymentMethod}
              onContinue={() => setStep('review')}
            />
          </CheckoutStep>
        </li>
        <li>
          <CheckoutStep number={4} title="Revisar y confirmar" status={stepStatus('review', step)}>
            <TextField
              label="Notas para el pedido (opcional)"
              multiline
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            {submitError && (
              <p className="checkout-page__error" role="alert">
                {submitError}
              </p>
            )}
            <Button
              size="lg"
              block
              disabled={!canConfirm}
              loading={createOrder.isPending}
              onClick={handleConfirm}
            >
              Confirmar pedido
              {shippingOption && ` · ${formatMoney(shippingOption.total)}`}
            </Button>
          </CheckoutStep>
        </li>
      </ol>

      <CheckoutSummary
        cart={cart}
        shippingOption={STEPS.indexOf(step) > 0 ? shippingOption : null}
        className="checkout-page__summary"
      />
    </div>
  )
}

export default function CheckoutPage() {
  const { query } = useCart()

  return (
    <div className="checkout-page">
      <PageHeader title="Finalizar compra" />
      <QueryBoundary
        query={query}
        loading={<Skeleton variant="rect" height="20rem" />}
        isEmpty={(cart) => !cart.items.some((item) => item.available)}
        empty={
          <EmptyState
            icon="bag"
            title="No hay productos para comprar"
            description="Agrega productos al carrito para finalizar tu compra."
            action={
              <Button as={Link} to={paths.catalog}>
                Ver catálogo
              </Button>
            }
          />
        }
        errorTitle="No pudimos cargar tu carrito"
      >
        {(cart) => <Checkout cart={cart} />}
      </QueryBoundary>
    </div>
  )
}
