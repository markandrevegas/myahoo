import { ref, onMounted } from 'vue'

export const useUnsplash = () => {
  const DEFAULT_CITY = "Copenhagen"

  const photo = ref<any>(null)
  const city = ref<string>(DEFAULT_CITY)
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
      const { data, error: fetchError } = await useFetch(`/api/unsplash`, {
        query: { city: queryCity },
      })

      if (fetchError.value) throw fetchError.value

      photo.value = data.value
      city.value = queryCity

      // persist in localStorage
      if (typeof window !== 'undefined' && photo.value?.urls?.regular) {
        localStorage.setItem('unsplashPhoto', JSON.stringify({
          city: city.value,
          photo: photo.value,
          timestamp: Date.now()
        }))
      }

    } catch (err: any) {
      error.value = err?.message || 'Failed to load photo.'
    } finally {
      loading.value = false
    }
  }

  // Check stored data and handle default logic
  onMounted(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('unsplashPhoto')

      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const storedCity = parsed.city
          const storedPhoto = parsed.photo

          // If stored city differs from DEFAULT_CITY → fetch new photo
          if (storedCity !== DEFAULT_CITY) {
            fetchPhoto(DEFAULT_CITY)
            return
          }

          // Otherwise, use stored photo
          photo.value = storedPhoto
          city.value = storedCity || DEFAULT_CITY
          return
        } catch (e) {
          console.warn('Failed to parse stored Unsplash photo', e)
        }
      }
    }

    // No stored data or error parsing → fallback to default
    fetchPhoto(DEFAULT_CITY)
  })

  return { photo, city, loading, error, fetchPhoto }
}
