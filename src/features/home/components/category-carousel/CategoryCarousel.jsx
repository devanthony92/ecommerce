import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import clsx from 'clsx'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import { QueryBoundary, Skeleton } from '@/components/feedback'
import { IconButton, ResponsiveImage } from '@/components/ui'
import { CATEGORY_TITLE_TRANSITION, useCategories } from '@/features/catalog'
import { paths } from '@/constants/paths'
import { useMouseDrag } from './useMouseDrag'
import './category-carousel.scss'

const AUTOPLAY_MS = 3000
// Tres copias de la lista: se navega por la del medio y, al detenerse en una
// copia lateral, se salta sin animación a la misma categoría de la del medio.
const COPIES = [0, 1, 2]
const MIDDLE = 1
// Respaldo para navegadores sin `scrollend`: espera a que el scroll se calme.
const SETTLE_MS = 150
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange) {
  const media = window.matchMedia?.(REDUCED_MOTION)
  media?.addEventListener('change', onChange)
  return () => media?.removeEventListener('change', onChange)
}

const prefersReducedMotion = () => window.matchMedia?.(REDUCED_MOTION).matches ?? false

// La página de categoría es lazy: se pide el chunk antes de navegar.
const loadCategoryPage = () => import('@/features/catalog/pages/CatalogPage')

// Espera a que el título de la categoría esté pintado (el chunk lazy puede tardar
// un instante en montarse aunque ya esté descargado). Máximo ~1 s.
function waitForCategoryTitle() {
  return new Promise((resolve) => {
    const started = performance.now()
    const check = () => {
      const title = document.querySelector('h1')
      const ready = title?.style.viewTransitionName === CATEGORY_TITLE_TRANSITION
      if (ready || performance.now() - started > 1000) resolve()
      // setTimeout y no requestAnimationFrame: durante la transición el navegador
      // no pinta, así que rAF no correría hasta que se agote el tiempo.
      else setTimeout(check, 16)
    }
    check()
  })
}

/**
 * Carrusel infinito de categorías: pista con scroll-snap (se desliza con el
 * dedo o se arrastra con el mouse) y botones anterior/siguiente. Avanza solo,
 * salvo con movimiento reducido; se detiene fuera de pantalla, con el mouse
 * encima, al arrastrar, con el foco de teclado dentro o con el botón de pausa.
 * Al abrir una categoría, su nombre se convierte en el título de la página
 * (View Transitions, si el navegador las soporta).
 */
export function CategoryCarousel({ labelledBy }) {
  const query = useCategories()

  return (
    <QueryBoundary
      query={query}
      loading={<Skeleton variant="rect" className="category-carousel__skeleton" />}
    >
      {(categories) => <Carousel categories={categories} labelledBy={labelledBy} />}
    </QueryBoundary>
  )
}

function Carousel({ categories, labelledBy }) {
  const trackRef = useRef(null)
  const pauseRef = useRef(null)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(true)
  const navigate = useNavigate()

  // Distancia entre dos categorías: el padding de la pista centra la n-ésima en n * step.
  const getStep = () => {
    const track = trackRef.current
    const slide = track?.firstElementChild
    if (!slide) return 0
    // getBoundingClientRect y no offsetWidth: el ancho es fraccionario y el
    // redondeo se acumularía al saltar entre copias.
    return (
      slide.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0)
    )
  }

  const move = useCallback(
    (direction) => {
      const track = trackRef.current
      const step = getStep()
      if (!step) return
      // Se parte de la categoría más cercana: un clic a mitad de animación no deja la pista desalineada.
      const current = Math.round(track.scrollLeft / step)
      track.scrollTo?.({
        left: (current + direction) * step,
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    },
    [reducedMotion],
  )

  // Vuelve a la categoría más cercana (tras arrastrar, con el snap ya activo).
  const snapToNearest = useCallback(() => {
    const track = trackRef.current
    const step = getStep()
    if (!step) return
    track.scrollTo?.({
      left: Math.round(track.scrollLeft / step) * step,
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [reducedMotion])

  // Durante el arrastre: si se acerca al borde de la pista, salta a la copia del
  // medio (mismo dibujo) para que el gesto nunca choque con el final.
  const recenter = useCallback(() => {
    const track = trackRef.current
    const step = getStep()
    if (!step) return 0
    const index = track.scrollLeft / step
    let shift = 0
    if (index < categories.length * 0.5) shift = categories.length * step
    else if (index > categories.length * 2.5) shift = -categories.length * step
    track.scrollLeft += shift
    return shift
  }, [categories.length])

  const drag = useMouseDrag(trackRef, { reducedMotion, onEnd: snapToNearest, recenter })
  const { isDragging } = drag
  const rotating = !reducedMotion && !paused && !hovered && !focused && visible && !drag.dragging

  // Arranca en la primera categoría de la copia del medio.
  useLayoutEffect(() => {
    trackRef.current.scrollLeft = getStep() * categories.length * MIDDLE
  }, [categories.length])

  // Al terminar de desplazarse fuera de la copia del medio, salta a su gemela.
  // Con `scrollend` el salto espera a que se suelte el dedo y acabe la inercia.
  useEffect(() => {
    const track = trackRef.current
    let timer
    const settle = () => {
      const step = getStep()
      // Mientras se arrastra, la posición la manda el mouse; se ajusta al soltar.
      if (!step || isDragging()) return
      const index = Math.round(track.scrollLeft / step)
      const offset = Math.floor(index / categories.length) - MIDDLE
      if (offset !== 0) track.scrollLeft -= offset * categories.length * step
    }
    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(settle, SETTLE_MS)
    }
    const [event, handler] = 'onscrollend' in track ? ['scrollend', settle] : ['scroll', onScroll]
    track.addEventListener(event, handler, { passive: true })
    return () => {
      clearTimeout(timer)
      track.removeEventListener(event, handler)
    }
  }, [categories.length, isDragging])

  // Fuera de pantalla no avanza: evita trabajo y que cambie sin que nadie lo vea.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!rotating) return undefined
    const id = setInterval(() => {
      if (!document.hidden) move(1)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [rotating, move])

  // El nombre de la tarjeta se convierte en el título de la página de categoría.
  // Sin soporte, con movimiento reducido o abriendo en otra pestaña: navegación normal.
  const openCategory = (event, slug) => {
    const plainClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
    if (!document.startViewTransition || reducedMotion || !plainClick) return
    event.preventDefault()
    const name = event.currentTarget.querySelector('.category-carousel__name')
    name.style.viewTransitionName = CATEGORY_TITLE_TRANSITION
    document.startViewTransition(async () => {
      await loadCategoryPage()
      flushSync(() => navigate(paths.category(slug)))
      await waitForCategoryTitle()
    })
  }

  return (
    <div
      className="category-carousel"
      role="group"
      aria-roledescription="carrusel"
      aria-labelledby={labelledBy}
      // Solo el foco de teclado detiene el avance: un clic en anterior/siguiente no
      // debe dejarlo detenido. El botón de pausa no cuenta: si no, reanudar no
      // tendría efecto hasta salir.
      onFocus={(event) =>
        setFocused(event.target !== pauseRef.current && event.target.matches(':focus-visible'))
      }
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <div
        className={clsx('category-carousel__track', {
          'category-carousel__track--dragging': drag.dragging,
        })}
        // Solo el mouse sobre las tarjetas detiene el avance; sobre los controles no,
        // para que "reanudar" se note sin tener que sacar el puntero.
        onPointerEnter={(event) => {
          if (event.pointerType !== 'mouse') return
          setHovered(true)
          loadCategoryPage()
        }}
        onPointerLeave={() => setHovered(false)}
        ref={trackRef}
        {...drag.handlers}
      >
        {COPIES.flatMap((copy) =>
          categories.map((category, index) => {
            const clone = copy !== MIDDLE
            return (
              <div
                key={`${copy}-${category.id}`}
                className={clsx(
                  'category-carousel__slide',
                  `category-carousel__slide--tone-${index % 4}`,
                )}
                // Las copias solo completan el giro: ni se leen ni reciben foco.
                {...(clone
                  ? { 'aria-hidden': true, inert: true }
                  : {
                      role: 'group',
                      'aria-roledescription': 'diapositiva',
                      'aria-label': `${index + 1} de ${categories.length}`,
                    })}
              >
                <Link
                  className="category-carousel__link"
                  to={paths.category(category.slug)}
                  onClick={(event) => openCategory(event, category.slug)}
                >
                  <ResponsiveImage
                    src={category.image?.url}
                    alt=""
                    ratio="4 / 5"
                    priority={!clone && index < 3}
                    className="category-carousel__image"
                  />
                  <span className="category-carousel__label">
                    <span className="category-carousel__name">{category.name}</span>
                    <span className="category-carousel__count">
                      {category.productCount} productos
                    </span>
                  </span>
                </Link>
              </div>
            )
          }),
        )}
      </div>

      {/* En el DOM en el mismo orden que se ven: anterior → pausa → siguiente. */}
      <div className="category-carousel__controls">
        <IconButton
          icon="chevron-left"
          label="Categoría anterior"
          variant="secondary"
          onClick={() => move(-1)}
        />
        {!reducedMotion && (
          <IconButton
            ref={pauseRef}
            icon={paused ? 'play' : 'pause'}
            label={paused ? 'Reanudar carrusel' : 'Pausar carrusel'}
            variant="secondary"
            onClick={() => {
              // Al reanudar avanza de inmediato: esperar el intervalo completo parece un fallo.
              if (paused) move(1)
              setPaused(!paused)
            }}
          />
        )}
        <IconButton
          icon="chevron-right"
          label="Categoría siguiente"
          variant="secondary"
          onClick={() => move(1)}
        />
      </div>
    </div>
  )
}
