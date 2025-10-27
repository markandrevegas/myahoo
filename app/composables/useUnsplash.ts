import { ref, onMounted, watchEffect } from 'vue'

interface UnsplashPhoto {
  id: string
  urls: {
    regular: string
    small: string
    thumb: string
  }
  alt_description?: string
  [key: string]: any
}

export const useUnsplash = () => {
  const photo = ref<UnsplashPhoto | null>(null)
  const city = ref<string>('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPhoto = async (queryCity: string) => {
    if (!queryCity) {
      error.value = 'Please enter a city name.'
      return
    }

    loading.value = true
    error.value = null

    try {
      const data: UnsplashPhoto = await $fetch(`/api/unsplash`, {
        query: { city: queryCity },
      })

      photo.value = data
      city.value = queryCity

      // persist in localStorage
      if (typeof window !== 'undefined' && data?.urls?.regular) {
        localStorage.setItem(
          'unsplashPhoto',
          JSON.stringify({
            city: city.value,
            photo: data,
            timestamp: Date.now(),
          })
        )
      }
    } catch (err: unknown) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load photo.'
      console.error('Unsplash fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('unsplashPhoto')
    if (!stored) return

    try {
      const parsed = JSON.parse(stored)
      photo.value = parsed.photo
      city.value = parsed.city || ''
    } catch (e) {
      console.warn('Failed to parse stored Unsplash photo', e)
    }
  })

  watchEffect(() => {
    if (typeof window !== 'undefined' && photo.value && city.value) {
      localStorage.setItem(
        'unsplashPhoto',
        JSON.stringify({
          city: city.value,
          photo: photo.value,
          timestamp: Date.now(),
        })
      )
    }
  })

  return { photo, city, loading, error, fetchPhoto }
}