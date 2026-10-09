import clsx from 'clsx'
import './badge.scss'

/**
 * tone: neutral | info | success | warning | danger | wholesale
 * level: bronze | silver | gold | platinum (niveles mayoristas; reemplaza tone)
 */
export function Badge({ tone = 'neutral', level, className, children }) {
  return (
    <span className={clsx('badge', level ? `badge--level-${level}` : `badge--${tone}`, className)}>
      {children}
    </span>
  )
}
