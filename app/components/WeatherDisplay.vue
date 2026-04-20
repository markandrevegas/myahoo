<script setup lang="ts">
  const props = defineProps<{
    weatherData?: WeatherData | null
  }>()
  const emit = defineEmits(['open-search'])
  const searchedCities = useLocalStorage<SearchedCity[]>('searched-cities', [])
  const currentCityName = useLocalStorage('current-city', 'Miami')

  const cleanCityName = computed(() => {
    const value = currentCityName.value

    if (typeof value !== 'string' || !value.trim()) {
      return 'Miami'
    }

    return value.split(',')[0].trim()
  })

  const { query, suggestions, loading } = useCityAutocomplete()
  watch(query, (newQuery) => {
    if (newQuery.length < 3) {
      suggestions.value = []
    }
  })
  const { photo } = useUnsplash(cleanCityName)
  const { 
    data: weatherData, 
    status: weatherStatus, 
    refresh: refreshWeather 
  } = useWeather(currentCityName)

  // state
  const showDrawer = ref(false)
  const showSearchDrawer = ref(false)
  const localTime = ref('')

  // computed props
  const isInitialLoading = computed(() => weatherStatus.value === 'pending')
  const country = computed(() => weatherData.value?.sys?.country || '')

  // 5. CORE OPERATIONS
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

  // 6. TIME LOGIC
  const updateLocalTime = () => {
    const timezone = weatherData.value?.timezone
    if (timezone === undefined) return
    
    const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000
    const cityTime = new Date(utc + (timezone * 1000))
    localTime.value = cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  // 7. HISTORY SYNC
  watch([weatherData, photo], ([newWeather, newPhoto]) => {
    // 1. Strict null check
    if (!newWeather || !newPhoto) return

    const cityName = newWeather.name || currentCityName.value

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

  // 8. LIFECYCLE & SEO
  useHead({
    title: computed(() => `Weather in ${currentCityName.value}`),
    link: computed(() => photo.value?.urls?.regular ? [
      { rel: 'prefetch', href: photo.value.urls.regular, as: 'image', crossorigin: 'anonymous' }
    ] : [])
  })

  // Use Interval utility for automatic cleanup on unmount
  useIntervalFn(updateLocalTime, 60000)
  watch(weatherData, updateLocalTime, { immediate: true })
</script>
<template>
  <div class="flex flex-col justify-center h-screen bg-gray-100 p-8 dark:bg-gray-900">
    <div class="relative rounded-2xl overflow-auto shadow-lg bg-white w-full max-w-[393px] h-[616px] mx-auto flex flex-col justify-center items-stretch">
      <div class="relative z-40 flex-1 flex flex-col h-full w-full overflow-hidden">
        <Controls :city="cleanCityName" :country="country" :local-time="localTime"@open-search="toggleSearchDrawer" @open-list="toggleDrawer" />
        <template v-if="weatherData && weatherStatus !== 'pending'">
          <WeatherData :weather-data="weatherData!" @open-search="toggleSearchDrawer" />
        </template>
        <Overlay />
      </div>

      <SplashScreen v-if="isInitialLoading" />

      <div v-if="photo" class="absolute inset-0">
        <div class="w-full h-full filter brightness-110 contrast-110 saturate-110"
          :style="'background-image: url(' + photo.urls.regular + '); background-size: cover; background-position: center'">
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-black/30"></div>
      </div>

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
      <Transition name="slide-left" class="absolute top-0 left-0 w-full h-full bg-abyssal text-palladian z-50 p-4 flex flex-col">
        <aside v-if="showSearchDrawer" class="absolute inset-0 flex flex-col gap-4">
          <div class="flex-shrink-0 flex justify-between items-center my-4">
            <h2 class="text-lg font-semibold">Add a new location</h2>
            <button @click="toggleSearchDrawer" aria-label="Close">
              <XIcon />
            </button>
          </div>
          <div class="flex flex-col justify-center items-center bg-gray-600 rounded-lg">
            <div class="w-full flex justify-start gap-4">
              <SearchIcon />
              <input @keyup.enter="() => searchCity(query)" type="text" placeholder="Enter city name..." v-model="query" class="flex-1 text-lg focus:outline-none placeholder:text-yellow-50/50" />
            </div>
            <div class="flex-1 w-full">
              <ul v-if="suggestions?.length" class="w-full flex flex-col bg-gray-700 text-yellow-50/90 mt-1 rounded shadow max-h-48 overflow-auto">
                <li v-for="(s, index) in suggestions" :key="index" @click="selectCity(s)" class="w-full h-4 px-3 py-2 hover:bg-gray-600 cursor-pointer">
                  {{ s.name }}, {{ s.country }}
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </Transition>
    </div>
  </div>
</template>
