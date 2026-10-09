import { Badge } from '@/components/ui'
import { ORDER_STATUS } from '@/constants/statuses'

export function OrderStatusBadge({ status }) {
  const config = ORDER_STATUS[status] ?? { label: status, badge: 'neutral' }
  return <Badge tone={config.badge}>{config.label}</Badge>
}
