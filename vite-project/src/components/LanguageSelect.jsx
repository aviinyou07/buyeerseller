import { useAppText } from '../appText'

const LanguageSelect = () => {
  const { language, setLanguage, t } = useAppText()

  return (
    <label className="flex items-center gap-2 text-xs font-bold text-gray-500">
      <span>{t('language')}</span>
      <select
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-[#082b49] outline-none"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <option value="en">{t('english')}</option>
        <option value="hi">{t('hindi')}</option>
      </select>
    </label>
  )
}

export default LanguageSelect
