<script setup lang="ts">
  const props = defineProps<{
    weatherData?: WeatherData | null
  }>()

  const emit = defineEmits(['open-search'])

  const searchedCities = useLocalStorage<SearchedCity[]>('searched-cities', [])
  const currentCityName = useLocalStorage('current-city', 'Miami')

  const city = computed(() => {
    const value = (currentCityName.value as string) || 'Miami'
    if (!value) return ''

    const parts = value.split(',')
    return parts[0]?.trim() || ''
  })

  const countryCode = computed(() => {
    const value = currentCityName.value as string
    if (!value) return ''

    const parts = value.split(',')
    return parts[1]?.trim() || ''
  })

  const { query, suggestions, loading } = useCityAutocomplete()

  watch(query, newQuery => {
    if (newQuery.length < 3) {
      suggestions.value = []
    }
  })

  const { photo } = useUnsplash(city)

  const {
    data: weatherData,
    status: weatherStatus,
    refresh: refreshWeather
  } = useWeather(city)

  const showDrawer = ref(false)
  const showSearchDrawer = ref(false)
  const localTime = ref('')
  const isInitialLoading = computed(() => weatherStatus.value === 'pending')

  const toggleDrawer = () => (showDrawer.value = !showDrawer.value)

  const toggleSearchDrawer = () => {
    showSearchDrawer.value = !showSearchDrawer.value

    if (!showSearchDrawer.value) {
      query.value = ''
      suggestions.value = []
    }
  }

  async function searchCity(cityName: string) {
    const name = cityName.trim()
    if (!name) return

    showSearchDrawer.value = false
    currentCityName.value = name
  }

  function selectCity(suggestion: any) {
    const searchString = `${suggestion.name},${suggestion.country}`

    searchCity(searchString)

    query.value = ''
    suggestions.value = []
    showSearchDrawer.value = false
  }

  function loadCity(saved: SearchedCity) {
    currentCityName.value = saved.city
    showDrawer.value = false
  }

  function removeCity(index: number) {
    searchedCities.value.splice(index, 1)
  }

  const updateLocalTime = () => {
    const timezone = weatherData.value?.timezone
    if (timezone === undefined) return

    const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000
    const cityTime = new Date(utc + timezone * 1000)

    localTime.value = cityTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  watch([weatherData, photo], ([newWeather, newPhoto]) => {
    if (!newWeather || !newPhoto) return

    const cityName = newWeather.name || city.value

    const exists = searchedCities.value.some(
      c => c.city.toLowerCase() === cityName.toLowerCase()
    )

    if (!exists) {
      searchedCities.value.push({
        city: cityName,
        weather: newWeather as WeatherData,
        photo: newPhoto,
        timestamp: Date.now()
      })
    }
  }, { deep: true })

  useHead({
    title: computed(() => `Weather in ${city.value}`),
    link: computed(() =>
      photo.value?.urls?.regular ? [
          {
            rel: 'prefetch',
            href: photo.value.urls.regular,
            as: 'image',
            crossorigin: 'anonymous'
          }
        ]
      : []
    )
  })

  useIntervalFn(updateLocalTime, 60000)
  watch(weatherData, updateLocalTime, { immediate: true })
</script>
<template>
  <div class="flex flex-col justify-center h-screen p-8">
    <div class="relative rounded-2xl overflow-auto shadow-lg bg-white w-full max-w-[393px] h-[616px] mx-auto flex flex-col justify-center items-stretch">
      <div class="relative z-40 flex-1 flex flex-col h-full w-full overflow-hidden">
        <Controls :city="city" :country="countryCode" :local-time="localTime"@open-search="toggleSearchDrawer" @open-list="toggleDrawer" />
        <template v-if="weatherData && weatherStatus !== 'pending'">
          <WeatherData :weather-data="weatherData!" @open-search="toggleSearchDrawer" />
        </template>
        <Overlay />
      </div>
      <SplashScreen v-if="isInitialLoading" />
      <CityPhoto :photo="photo" />
      <!--<div v-if="error" class="absolute inset-0 bg-sky-950"></div>-->
      <Transition name="slide-left">
        <div v-if="showDrawer || showSearchDrawer" class="absolute inset-0 bg-slate-100/40 z-40" @click.self="toggleDrawer"></div>
      </Transition>
      <Transition name="slide-left">
        <aside v-if="showDrawer" class="absolute top-0 left-0 w-full h-full bg-abyssal text-palladian z-50 p-4 flex flex-col">
          <div class="flex-shrink-0 flex justify-between items-center my-4">
            <h2 class="text-lg font-semibold">Locations</h2>
            <button @click="toggleDrawer" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-1 -1 24 24">
                <path
                  fill="currentColor"
                  d="m12 10.586l4.95-4.95l1.414 1.414L13.414 12l4.95 4.95l-1.414 1.414L12 13.414l-4.95 4.95l-1.414-1.414L10.586 12l-4.95-4.95L7.05 5.636z"
                />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto no-scrollbar">
            <div v-if="searchedCities.length === 0" class="text-yellow-50/70">
              <p class="text-lg font-light mt-8">No cities searched yet.</p>
            </div>
            <ul class="space-y-2">
              <li v-for="(c, index) in searchedCities" :key="index" class="p-3 hover:cursor-pointer hover:text-gray-200 transition ease-in-out duration-300 rounded">
                <div class="flex flex-col text-sm">
                  <div class="w-full flex justify-between items-center">
                    <h3 @click="loadCity(c)" class="capitalize text-lg">{{ c.city }}, {{ c.weather?.sys.country }}</h3>
                    <Icon @click="removeCity(index)" name="material-symbols:heart-minus-rounded" class="size-6 text-yellow-50/70 hover:text-yellow-50/90" />
                  </div>
                  <div v-if="c.weather" class="flex justify-start items-center gap-2">
                    <span>{{ Math.round(c.weather.main.temp) }}°C</span>
                    <Icon :name="getWeatherIcon(c.weather?.weather?.[0]?.id)" class="w-8 h-8" />
                    <span>
                      {{ c.weather.weather[0]?.main }}
                    </span>
                  </div>
                  <div v-else class="text-gray-400">Loading...</div>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </Transition>
      <Transition name="slide-left" class="absolute top-0 left-0 w-full h-full z-50 p-4 flex flex-col">
        <CitySearchDrawer v-if="showSearchDrawer" v-model:query="query" :suggestions="suggestions" :loading="loading" @close="toggleSearchDrawer" @select="selectCity" @search="searchCity" />
      </Transition>
    </div>
  </div>
</template>
