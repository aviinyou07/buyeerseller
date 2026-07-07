import axiosClient from './axiosClient'

export const getCategories = async () => {
  const response = await axiosClient.get('/categories')

  return response.data?.data || []
}

export const getCategoryForm = async (slug) => {
  const response = await axiosClient.get(`/categories/${slug}/form`)

  return response.data?.data || null
}
