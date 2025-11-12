// ./app/composables/useCityAutocomplete.ts
import { ref, watch } from 'vue'

export function useCityAutocomplete(apiKey: string) {
  const query = ref('')
  const suggestions = ref<Array<{ name: string; country: string }>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Watch the query and fetch suggestions
  watch(query, async (newQuery) => {
    if (!newQuery || newQuery.length < 2) {
      suggestions.value = []
      return
    }
    const config = useRuntimeConfig()
    const apiKey = config.public.openWeatherApiKey
    loading.value = true
    error.value = null

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          newQuery
        )}&limit=5&appid=${apiKey}`
      )
      const data: Array<{ name: string; country: string }> = await res.json()
      const unique = new Map<string, { name: string; country: string }>()
      for (const c of data) {
        const key = `${c.name.toLowerCase()},${c.country}`
        if (!unique.has(key)) {
          unique.set(key, { name: c.name, country: c.country })
        }
      }
      suggestions.value = Array.from(unique.values())
      console.log(suggestions.value)

    } catch (err: any) {
      error.value = err.message || 'Failed to fetch cities'
      suggestions.value = []
    } finally {
      loading.value = false
    }

  })

  return {
    query,
    suggestions,
    loading,
    error
  }
}
