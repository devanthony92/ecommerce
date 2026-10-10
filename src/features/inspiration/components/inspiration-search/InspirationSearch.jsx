import { useRef, useState } from 'react'
import clsx from 'clsx'
import { Button, TextField } from '@/components/ui'
import './inspiration-search.scss'

export const EMPTY_KEYWORD_ERROR = 'Por favor, introduzca una palabra clave'

const SUGGESTIONS = ['Streetwear', 'Denim', 'Minimalista', 'Oficina']

// Formulario de búsqueda: valida que haya palabra clave antes de llamar a la API.
export function InspirationSearch({ initialQuery = '', isLoading, onSearch, className }) {
  const inputRef = useRef(null)
  const [value, setValue] = useState(initialQuery)
  const [error, setError] = useState(null)

  function submit(keyword) {
    const trimmed = keyword.trim()
    if (!trimmed) {
      setError(EMPTY_KEYWORD_ERROR)
      inputRef.current?.focus()
      return
    }
    setError(null)
    onSearch(trimmed)
  }

  return (
    <div className={clsx('inspiration-search', className)}>
      <form
        className="inspiration-search__form"
        role="search"
        aria-label="Buscar inspiración"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          submit(value)
        }}
      >
        <TextField
          ref={inputRef}
          className="inspiration-search__field"
          label="Estilo, prenda o color"
          type="search"
          value={value}
          error={error}
          placeholder="Ej. denim, streetwear, verde oliva"
          onChange={(event) => {
            setValue(event.target.value)
            if (error) setError(null)
          }}
        />
        <Button
          type="submit"
          iconStart="search"
          loading={isLoading}
          className="inspiration-search__submit"
        >
          Buscar fotos
        </Button>
      </form>

      <p className="inspiration-search__suggestions">
        Prueba con:
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="inspiration-search__suggestion"
            onClick={() => {
              setValue(suggestion)
              submit(suggestion)
            }}
          >
            {suggestion}
          </button>
        ))}
      </p>
    </div>
  )
}
