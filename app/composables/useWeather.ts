interface WeatherData {
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

export async function useWeather(city: string): Promise<{
  data: WeatherData | null
  error: Error | null
}> {
  if (!city) throw new Error("City name is required")

  const config = useRuntimeConfig()
  const apiKey = config.public.openWeatherApiKey

  try {
    const geoUrl =
      'https://api.openweathermap.org/geo/1.0/direct?q=' +
      encodeURIComponent(city) +
      '&limit=1&appid=' +
      apiKey

    const geoData = await $fetch<any[]>(geoUrl)

    if (!geoData || geoData.length === 0) {
      return { data: null, error: new Error('City "' + city + '" not found') }
    }

    const validCity = geoData[0].name

    const weatherUrl =
      'https://api.openweathermap.org/data/2.5/weather?q=' +
      encodeURIComponent(validCity) +
      '&units=metric&appid=' +
      apiKey

    const data = await $fetch<WeatherData>(weatherUrl)
    return { data, error: null }
    
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    return { data: null, error }
  }
}