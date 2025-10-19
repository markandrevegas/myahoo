export async function useWeather(city: string) {
  const config = useRuntimeConfig()
  const apiKey = config.public.openWeatherApiKey
  const cityName = typeof city === 'string' ? city : city

  if (!cityName) {
    throw new Error('City name is required')
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${apiKey}`

  const { data, error } = await useFetch(url)
  console.log('Weather data:', data.value)

  return { data, error }
}
