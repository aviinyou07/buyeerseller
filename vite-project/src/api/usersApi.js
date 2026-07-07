import axiosClient from './axiosClient'

export const getProfileData = async () => {
  const response = await axiosClient.get('/users/profile-data')

  return response.data
}
