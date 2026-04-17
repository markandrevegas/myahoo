export function useWeather(city: Ref<string> | string) {
	const cityRef = isRef(city) ? city : ref(city)
	const nuxtApp = useNuxtApp()

	return useAsyncData(
		`weather-${unref(cityRef)}`,
		async () => {
			const cityName = unref(cityRef)
			if (!cityName) return null

			return await $fetch<WeatherData>("https://api.openweathermap.org/data/2.5/weather", {
				query: {
					q: cityName,
					units: "metric",
					appid: useRuntimeConfig().public.openWeatherApiKey
				}
			})
		},
		{
			watch: [cityRef],
			lazy: true,
			getCachedData(key) {
				const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
				if (!cached) return

				// Check if the cache is older than 10 minutes
				const expiration = 1000 * 60 * 10
				const isExpired = Date.now() - (cached.fetchedAt || 0) > expiration

				if (isExpired) {
					return
				}

				return cached
			},
			transform: (data) => {
				return {
					...data,
					fetchedAt: Date.now()
				}
			}
		}
	)
}
