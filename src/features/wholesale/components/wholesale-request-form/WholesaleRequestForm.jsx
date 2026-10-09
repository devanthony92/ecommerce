import { CheckboxGroup, SelectField, StackedForm, TextField } from '@/components/ui'
import { useCategories } from '@/features/catalog'
import { useForm } from '@/hooks/useForm'
import { BUSINESS_TYPES, MONTHLY_VOLUMES } from '../../constants'
import { validateWholesaleRequest } from '../../utils/requestValidation'
import './wholesale-request-form.scss'

const EMPTY = {
  tradeName: '',
  legalName: '',
  nit: '',
  phone: '',
  city: '',
  address: '',
  businessType: '',
  socialLinks: '',
  estimatedMonthlyVolume: '',
  categoriesOfInterest: [],
}

// Formulario comercial. `initialValues` permite reenviar tras un rechazo.
export function WholesaleRequestForm({ initialValues, onSubmit }) {
  const { data: categories = [] } = useCategories()
  const { values, errors, field, setValue, formError, isSubmitting, handleSubmit } = useForm({
    initialValues: { ...EMPTY, ...initialValues, socialLinks: initialValues?.socialLinks ?? '' },
    validate: validateWholesaleRequest,
    onSubmit,
  })

  return (
    <StackedForm
      onSubmit={handleSubmit}
      formError={formError}
      isSubmitting={isSubmitting}
      submitLabel="Enviar solicitud"
      className="wholesale-request-form"
    >
      <fieldset className="wholesale-request-form__section">
        <legend className="wholesale-request-form__legend">Tu negocio</legend>
        <TextField label="Nombre comercial" required {...field('tradeName')} />
        <TextField
          label="Razón social o nombre completo"
          autoComplete="organization"
          required
          {...field('legalName')}
        />
        <div className="wholesale-request-form__row">
          <TextField
            label="NIT o cédula"
            hint="Sin puntos. Ej: 900123456-7"
            required
            {...field('nit')}
          />
          <SelectField
            label="Tipo de negocio"
            options={BUSINESS_TYPES}
            placeholder="Elige una opción"
            required
            {...field('businessType')}
          />
        </div>
      </fieldset>

      <fieldset className="wholesale-request-form__section">
        <legend className="wholesale-request-form__legend">Contacto</legend>
        <div className="wholesale-request-form__row">
          <TextField
            label="Celular"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            {...field('phone')}
          />
          <TextField label="Ciudad" autoComplete="address-level2" required {...field('city')} />
        </div>
        <TextField
          label="Dirección del negocio"
          autoComplete="street-address"
          required
          {...field('address')}
        />
        <TextField
          label="Redes sociales o sitio web (opcional)"
          placeholder="@tutienda, tutienda.com"
          {...field('socialLinks')}
        />
      </fieldset>

      <fieldset className="wholesale-request-form__section">
        <legend className="wholesale-request-form__legend">Tus compras</legend>
        <SelectField
          label="Volumen de compra mensual estimado"
          options={MONTHLY_VOLUMES}
          placeholder="Elige un rango"
          required
          {...field('estimatedMonthlyVolume')}
        />
        <CheckboxGroup
          legend="Categorías de interés"
          name="categoriesOfInterest"
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          value={values.categoriesOfInterest}
          onChange={(next) => setValue('categoriesOfInterest', next)}
          error={errors.categoriesOfInterest}
          required
        />
      </fieldset>
    </StackedForm>
  )
}
