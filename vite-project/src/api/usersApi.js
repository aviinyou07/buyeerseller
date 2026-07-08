import axiosClient from './axiosClient'

export const getProfileData = async () => {
  const response = await axiosClient.get('/users/profile-data')

  return response.data
}

export const updateProfileData = async (payload) => {
  const response = await axiosClient.patch('/users/profile-data', payload)
  return response.data
}
