import axiosClient from './axiosClient'

export const getWishlist = async () => {
  const response = await axiosClient.get('/wishlists')

  return response.data
}

export const addWishlistItem = async (productId) => {
  const response = await axiosClient.post('/wishlists', { product_id: productId })

  return response.data
}

export const removeWishlistItem = async (productId) => {
  const response = await axiosClient.delete(`/wishlists/${productId}`)

  return response.data
}
