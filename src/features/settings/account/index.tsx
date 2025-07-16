import ContentSection from '../components/content-section'
import { AccountForm } from './account-form'

export default function SettingsAccount() {
  return (
    <ContentSection
      title='账户'
      desc='更新你的账户设置。设置你的首选语言和时区。'
    >
      <AccountForm />
    </ContentSection>
  )
}
