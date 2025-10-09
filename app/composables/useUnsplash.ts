export const useUnsplash = () => {
  const photo = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPhoto = async (city: string) => {
    if (!city) {
      error.value = 'Please enter a city name.'
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch(`/api/unsplash`, {
        query: { city },
      })

      if (fetchError.value) throw fetchError.value
      photo.value = data.value
    } catch (err: any) {
      error.value = err?.message || 'Failed to load photo.'
    } finally {
      loading.value = false
    }
  }

  return { photo, loading, error, fetchPhoto }
}
