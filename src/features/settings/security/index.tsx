import ContentSection from '../components/content-section'
import SecurityForm from './security-form'

export default function SettingsSecurity() {
  return (
    <ContentSection
      title='安全设置'
      desc='修改你的登录密码。'
    >
      <SecurityForm />
    </ContentSection>
  )
}
