import { useId } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import clsx from 'clsx'
import { Icon } from '@/components/ui'
import { paths } from '@/constants/paths'
import './header-search.scss'

export function HeaderSearch({ className }) {
  const inputId = useId()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  function handleSubmit(event) {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('q').trim()
    if (query) navigate(`${paths.search}?q=${encodeURIComponent(query)}`)
  }

  return (
    <form className={clsx('header-search', className)} role="search" onSubmit={handleSubmit}>
      <label className="header-search__label" htmlFor={inputId}>
        Buscar productos
      </label>
      <input
        id={inputId}
        className="header-search__input"
        type="search"
        name="q"
        placeholder="Buscar camisetas, jeans…"
        autoComplete="off"
        enterKeyHint="search"
        // Remontar al cambiar la URL mantiene el campo sincronizado con ?q=
        key={searchParams.get('q') ?? ''}
        defaultValue={searchParams.get('q') ?? ''}
      />
      <button className="header-search__submit" type="submit" aria-label="Buscar">
        <Icon name="search" />
      </button>
    </form>
  )
}
