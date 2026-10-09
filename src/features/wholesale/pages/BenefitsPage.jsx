import { PageHeader } from '@/components/layout'
import { ProgramBenefits } from '../components/program-benefits/ProgramBenefits'
import './benefits-page.scss'

export default function BenefitsPage() {
  return (
    <div className="benefits-page">
      <PageHeader title="Beneficios" description="Lo que incluye tu cuenta mayorista." />
      <ProgramBenefits />
    </div>
  )
}
