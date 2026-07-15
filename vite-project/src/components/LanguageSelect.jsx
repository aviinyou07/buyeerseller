import { useAppText } from '../appText'
import CustomSelect from './CustomSelect'

const LanguageSelect = () => {
  const { language, setLanguage, t } = useAppText()

  const languageOptions = [
    { label: t('english') || 'English', value: 'en' },
    { label: t('hindi') || 'Hindi', value: 'hi' }
  ]

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
      <span>{t('language')}</span>
      <div className="w-24">
        <CustomSelect
          options={languageOptions}
          value={language}
          onChange={setLanguage}
          className="rounded-md border-gray-200 px-2 py-1.5 text-xs font-semibold text-[#082b49]"
          dropdownClassName="min-w-[100px]"
        />
      </div>
    </div>
  )
}

export default LanguageSelect
