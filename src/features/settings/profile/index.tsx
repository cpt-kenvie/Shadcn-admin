import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

export default function SettingsProfile() {
  return (
    <ContentSection
      title='个人资料'
      desc='这是你在网站上的显示方式。'
    >
      <ProfileForm />
    </ContentSection>
  )
}
