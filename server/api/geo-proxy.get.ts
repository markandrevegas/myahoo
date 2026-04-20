export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const config = useRuntimeConfig()

	const cityName = query.q

	if (!cityName || cityName.length < 2) {
		return []
	}

	try {
		// OpenWeather Geocoding API: /geo/1.0/direct
		// docs: https://openweathermap.org/api/geocoding-api
		const data = await $fetch("http://api.openweathermap.org/geo/1.0/direct", {
			query: {
				q: cityName,
				limit: 5,
				appid: config.public.openWeatherApiKey
			}
		})

		return data
	} catch (error) {
		console.error("Geocoding Proxy Error:", error)
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to fetch city suggestions"
		})
	}
})
