export interface WeatherData {
	weather: {
		id: number
		main: string
		description: string
		icon: string
	}[]
	main: {
		temp: number
		feels_like: number
		temp_min: number
		temp_max: number
		pressure: number
		humidity: number
	}
	wind: {
		speed: number
		deg: number
	}
	sys: {
		country: string
		sunrise: number
		sunset: number
	}
	name: string
	timezone: number
	dt: number
}

// Cache to prevent duplicate requests
const weatherCache = new Map<string, Promise<WeatherData>>()
const cache_duration = 1000 * 60 * 10 // 10 minutes

export function useWeather(city?: string) {
	const config = useRuntimeConfig()
	const apiKey = config.public.openWeatherApiKey

	const data = ref<WeatherData | null>(null)
	const loading = ref(false)
	const error = ref<Error | null>(null)

	async function fetchWeather(cityName: string): Promise<WeatherData> {
		if (!cityName?.trim()) {
			throw new Error("City name is required")
		}

		const normalizedCity = cityName.trim().toLowerCase()

		// Check cache first
		const cached = weatherCache.get(normalizedCity)
		if (cached) {
			return cached
		}

		// Create promise and cache it immediately (deduplication)
		const promise = (async () => {
			const params = new URLSearchParams({
				q: cityName,
				units: "metric",
				appid: apiKey
			})

			const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?${params}`

			const result = await $fetch<WeatherData>(weatherUrl)
			console.log(`[API Response] Weather for ${cityName}:`, result)
			
			// Clear cache after duration
			setTimeout(() => {
				weatherCache.delete(normalizedCity)
			}, cache_duration)

			return result
		})()

		weatherCache.set(normalizedCity, promise)
		return promise
	}

	async function fetch(cityName: string) {
		loading.value = true
		error.value = null
		data.value = null

		try {
			const result = await fetchWeather(cityName)
			data.value = result
			return { data: result, error: null }
		} catch (err) {
			const apiError = err instanceof Error ? err : new Error(String(err))
			error.value = apiError
			return { data: null, error: apiError }
		} finally {
			loading.value = false
		}
	}

	// Auto-fetch if city provided
	if (city) {
		fetch(city)
	}

	return {
		data: readonly(data),
		loading: readonly(loading),
		error: readonly(error),
		fetch,
		refetch: () => (city ? fetch(city) : Promise.resolve({ data: null, error: null }))
	}
}
