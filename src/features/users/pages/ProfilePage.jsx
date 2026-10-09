import { ContentCard, PageHeader } from '@/components/layout'
import { useAuth } from '@/features/auth'
import { ChangePasswordForm } from '../components/ChangePasswordForm'
import { ProfileForm } from '../components/ProfileForm'
import './profile-page.scss'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="profile-page">
      <PageHeader title="Perfil" description="Tus datos personales y de acceso." />
      <div className="profile-page__sections">
        <ContentCard title="Datos personales">
          <ProfileForm user={user} />
        </ContentCard>
        <ContentCard title="Contraseña">
          <ChangePasswordForm />
        </ContentCard>
      </div>
    </div>
  )
}
