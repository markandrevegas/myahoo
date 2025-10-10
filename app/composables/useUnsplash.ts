import { ref, onMounted, watchEffect } from 'vue'

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

  // Load from localStorage on mount
  onMounted(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('unsplashPhoto')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          photo.value = parsed.photo
          city.value = parsed.city || DEFAULT_CITY
          return
        } catch (e) {
          console.warn('Failed to parse stored Unsplash photo', e)
        }
      }
    }
    fetchPhoto(DEFAULT_CITY)
  })

  // 🔹 Keep localStorage up-to-date whenever city or photo changes
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
