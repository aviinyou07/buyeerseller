import axiosClient from './axiosClient'

export const getListingEngagement = async (listingId) => {
  const response = await axiosClient.get(`/listings/${listingId}`)

  return response.data.engagement || {}
}

export const toggleListingLike = async (listingId) => {
  const response = await axiosClient.post(`/listings/${listingId}/like`)

  return response.data
}

export const postListingReview = async (listingId, payload) => {
  const response = await axiosClient.post(`/listings/${listingId}/reviews`, payload)

  return response.data.review
}

export const postListingComment = async (listingId, payload) => {
  const response = await axiosClient.post(`/listings/${listingId}/comments`, payload)

  return response.data.comment
}
