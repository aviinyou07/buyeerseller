import axiosClient from './axiosClient'

const getSchemeLink = (scheme) => {
  const directLink =
    scheme.link ||
    scheme.url ||
    scheme.website ||
    scheme.official_url ||
    scheme.officialWebsite

  if (directLink) return directLink

  const linkMatch = scheme.description?.match(/Link:\s*(https?:\/\/[^\s]+)/i)

  return linkMatch?.[1] || ''
}

const getSchemeDepartment = (scheme) => {
  if (scheme.department) return scheme.department

  const departmentMatch = scheme.description?.match(/\[Department:\s*([^\]]+)\]/i)

  return departmentMatch?.[1]?.trim() || ''
}

const getCleanDescription = (description) =>
  description
    ? description
        .replace(/\[Department:\s*[^\]]+\]\s*/i, '')
        .split(/\n\nLink:/i)[0]
        .trim()
    : description

const extractLabelValue = (description = '', label) => {
  const pattern = new RegExp(`${label}:\\s*([^\\n]+)`, 'i')
  const match = description.match(pattern)

  return match?.[1]?.trim() || ''
}

const getSchemeStatus = (scheme) => {
  if (scheme.status) return scheme.status

  const endDate = scheme.deadline || scheme.end_date
  if (!endDate) return 'Active'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadline = new Date(endDate)
  if (Number.isNaN(deadline.getTime())) return 'Active'

  deadline.setHours(0, 0, 0, 0)

  return deadline < today ? 'Expired' : 'Active'
}

export const getSchemes = async () => {
  const response = await axiosClient.get('/schemes')

  const schemes = response.data?.data || response.data?.schemes || []

  return schemes.map((scheme) => ({
    ...scheme,
    displayId: `SCH-${scheme.id}`,
    category: scheme.category || scheme.category_name,
    description: getCleanDescription(scheme.description),
    benefit:
      scheme.benefits ||
      scheme.benefit ||
      extractLabelValue(scheme.description, 'Benefit') ||
      getCleanDescription(scheme.description),
    department: getSchemeDepartment(scheme),
    eligibility:
      scheme.eligibility ||
      extractLabelValue(scheme.description, 'Eligibility') ||
      '',
    deadline: scheme.deadline || scheme.end_date,
    status: getSchemeStatus(scheme),
    link: getSchemeLink(scheme),
  }))
}
