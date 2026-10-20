import clsx from 'clsx'
import './badge.scss'

/**
 * tone: neutral | brand | highlight | info | success | warning | danger | wholesale
 */
export function Badge({ tone = 'neutral', className, children }) {
  return <span className={clsx('badge', `badge--${tone}`, className)}>{children}</span>
}
