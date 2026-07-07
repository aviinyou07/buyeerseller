import axiosClient from './axiosClient'

export const getOrders = async () => {
  const response = await axiosClient.get('/orders')

  return response.data
}

export const getSales = async () => {
  const response = await axiosClient.get('/orders/sales')

  return response.data
}
