import { defineEventHandler, getQuery } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let city = Array.isArray(query.city) ? query.city[0] : query.city

  // Default to Miami if no city is provided
  if (!city) {
    city = 'Miami'
    console.log('no city using default:', city)
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  const baseUrl = 'https://api.unsplash.com/photos/random'
  const keywords = `${city}, landmark, capital`

    const buildUrl = (orientation: string) =>
    `${baseUrl}?query=${encodeURIComponent(
      keywords
    )}&orientation=${orientation}&content_filter=high&count=1&client_id=${accessKey}`

  try {
    let data = await $fetch(buildUrl('portrait'))
    if (Array.isArray(data)) data = data[0]
    // If no valid photo, try squarish
    if (!data || !data.urls) {
      console.warn('No portrait result found, trying squarish...')
      let fallback = await $fetch(buildUrl('squarish'))
      if (Array.isArray(fallback)) fallback = fallback[0]
      if (!fallback || !fallback.urls) {
        throw createError({
          statusCode: 404,
          statusMessage: 'No suitable image found for this city',
        })
      }
      data = fallback
      console.log(data)
    }
    return data
  } catch (error) {
    console.error('Unsplash API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch image from Unsplash',
    })
  }
})
