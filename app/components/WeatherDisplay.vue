<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useHead } from '#app'
  import { useUnsplash } from '~/composables/useUnsplash'
  import { useWeather, type WeatherData } from '~/composables/useWeather'
  import { useCityAutocomplete } from '~/composables/useCityAutocomplete'

  const config = useRuntimeConfig()
  const apiKey = config.public.openWeatherApiKey

  useHead({
    title: 'Home'
  })

  interface UnsplashPhoto {
    id: string
    urls: { regular: string }
    alt_description?: string
    city?: string
  }

  interface SearchedCity {
    city: string
    weather: WeatherData | null
    photo: UnsplashPhoto | null
    timestamp: number
  }

  // Constants
  const CACHE_DURATION = 1000 * 60 * 60 * 3 // 3 hours
  const STATIC_CITY = 'Copenhagen'

  // Weather icon mapping
  function getWeatherIcon(id?: number): string {
    if (id == null) return 'ph:question'
    if (id >= 200 && id < 300) return 'wi:storm-showers'
    if (id >= 300 && id < 400) return 'wi:sprinkle'
    if (id >= 500 && id < 600) return 'wi:rain'
    if (id >= 600 && id < 700) return 'wi:snow'
    if (id === 701) return 'wi:strong-wind'
    if (id === 711) return 'wi:smoke'
    if (id === 721) return 'wi:fog'
    if (id === 731 || id === 761) return 'wi:strong-wind'
    if (id === 741) return 'wi:fog'
    if (id === 751) return 'wi:strong-wind'
    if (id === 762) return 'wi:smoke'
    if (id === 771) return 'wi:strong-wind'
    if (id === 781) return 'wi:tornado'
    if (id === 800) return 'wi:day-sunny'
    if (id > 800 && id < 805) return 'wi:cloudy'
    return 'ph:question'
  }

  // Composables
  const { photo, loading, error, fetchPhoto } = useUnsplash()
  const weather = useWeather()
  const { query, suggestions } = useCityAutocomplete(apiKey)

  // State
  const showDrawer = ref(false)
  const showSearchDrawer = ref(false)
  const localTime = ref('')
  const city = ref('')
  const weatherData = ref<WeatherData | null>(null)
  const photoData = ref<UnsplashPhoto | null>(null)
  const searchedCities = ref<SearchedCity[]>([])
  const isInitialLoading = ref(true)

  // Computed properties
  const currentTemp = computed(() => weatherData.value?.main.temp ?? null)
  const tempMin = computed(() => weatherData.value?.main.temp_min ?? null)
  const tempMax = computed(() => weatherData.value?.main.temp_max ?? null)
  const weatherMain = computed(() => weatherData.value?.weather?.[0]?.main || 'Rain')
  const country = computed(() => weatherData.value?.sys.country || '')

  // LocalStorage utilities
  const storage = {
    get<T>(key: string): T | null {
      const item = localStorage.getItem(key)
      if (!item) return null
      try {
        return JSON.parse(item)
      } catch {
        return null
      }
    },

    set(key: string, value: any): void {
      localStorage.setItem(key, JSON.stringify(value))
    },

    remove(key: string): void {
      localStorage.removeItem(key)
    },

    isValid(key: string, maxAge: number = CACHE_DURATION): boolean {
      const item = this.get<{ timestamp: number }>(key)
      if (!item?.timestamp) return false
      return Date.now() - item.timestamp < maxAge
    }
  }

  // Time management
  function updateLocalTime() {
    if (!weatherData.value?.timezone) {
      localTime.value = ''
      return
    }
    
    const utcTime = new Date().getTime() + new Date().getTimezoneOffset() * 60000
    const cityTime = new Date(utcTime + weatherData.value.timezone * 1000)
    
    const hours = cityTime.getHours().toString().padStart(2, '0')
    const minutes = cityTime.getMinutes().toString().padStart(2, '0')
    localTime.value = `${hours}:${minutes}`
  }

  // Weather operations
  async function fetchWeather(cityName: string) {
    const cachedKey = `weather_${cityName}`
    
    // Try cache first (local storage layer)
    if (storage.isValid(cachedKey)) {
      const cached = storage.get<{ data: WeatherData }>(cachedKey)
      if (cached?.data) {
        weatherData.value = cached.data
        updateLocalTime()
        return
      }
    }

    // Fetch using composable (has its own cache layer)
    const { data, error: weatherError } = await weather.fetch(cityName)
    if (weatherError) {
      throw new Error(weatherError.message)
    }

    weatherData.value = data
    storage.set(cachedKey, {
      data,
      timestamp: Date.now()
    })
    updateLocalTime()
  }

  // Photo operations
  function loadPhotoFromStorage() {
    const cached = storage.get<{ photo: UnsplashPhoto }>('unsplashPhoto')
    if (cached?.photo) {
      photoData.value = cached.photo
    }
  }

  function savePhotoToStorage(photo: UnsplashPhoto, cityName: string) {
    storage.set('unsplashPhoto', {
      city: cityName,
      photo,
      timestamp: Date.now()
    })
  }

  // City search - consolidated single function
  async function searchCity(cityName: string) {
    const trimmedCity = cityName.trim()
    if (!trimmedCity) return

    // Close search drawer
    showSearchDrawer.value = false
    query.value = ''
    suggestions.value = []

    // Check for duplicates
    const exists = searchedCities.value.some(
      c => c.city.toLowerCase() === trimmedCity.toLowerCase()
    )
    if (exists) {
      // Just load existing city
      const existing = searchedCities.value.find(
        c => c.city.toLowerCase() === trimmedCity.toLowerCase()
      )
      if (existing) loadCity(existing)
      return
    }

    try {
      // Fetch both in parallel
      await Promise.all([
        fetchPhoto(trimmedCity),
        fetchWeather(trimmedCity)
      ])

      // Add to searched cities
      const newCity: SearchedCity = {
        city: trimmedCity,
        weather: weatherData.value,
        photo: photo.value,
        timestamp: Date.now()
      }

      searchedCities.value.push(newCity)
      storage.set('searchedCities', searchedCities.value)
      storage.set('currentCity', trimmedCity)
      
      city.value = trimmedCity
    } catch (err) {
      console.error('Error searching city:', err)
      alert('Failed to fetch city data. Please try again.')
    }
  }

  // Autocomplete selection
  async function selectCity(suggestion: { name: string; country: string }) {
    await searchCity(suggestion.name)
  }

  // City management
  function loadCity(selectedCity: SearchedCity) {
    if (!selectedCity) return

    city.value = selectedCity.city
    weatherData.value = selectedCity.weather
    photoData.value = selectedCity.photo
    showDrawer.value = false

    // Refresh photo in background
    fetchPhoto(selectedCity.city)
    storage.set('currentCity', selectedCity.city)
    updateLocalTime()
  }

  function removeCity(index: number) {
    searchedCities.value.splice(index, 1)
    storage.set('searchedCities', searchedCities.value)
  }

  // UI toggles
  function toggleDrawer() {
    showDrawer.value = !showDrawer.value
  }

  function toggleSearchDrawer() {
    showSearchDrawer.value = !showSearchDrawer.value
    if (!showSearchDrawer.value) {
      query.value = ''
      suggestions.value = []
    }
  }

  // Storage event handler for cross-tab sync
  function handleStorageEvent(e: StorageEvent) {
    if (e.key === 'currentCity' && e.newValue) {
      const newCity = e.newValue.trim()
      if (newCity && newCity !== city.value) {
        city.value = newCity
        fetchWeather(newCity).catch(console.error)
      }
    }
  }

  // Initialization
  async function initialize() {
    // Load searched cities from storage
    const stored = storage.get<SearchedCity[]>('searchedCities')
    if (stored && Array.isArray(stored)) {
      searchedCities.value = stored
    }

    // Determine startup city
    let currentCity = storage.get<string>('currentCity') || ''
    
    if (!currentCity && searchedCities.value.length > 0) {
      // Use most recent searched city
      const sorted = [...searchedCities.value].sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      )
      currentCity = sorted[0]?.city || ''
    }

    if (!currentCity) {
      currentCity = STATIC_CITY
      storage.set('currentCity', currentCity)
    }

    city.value = currentCity

    // Check cache validity
    const hasValidPhoto = storage.isValid('unsplashPhoto')
    const hasValidWeather = storage.isValid(`weather_${currentCity}`)

    if (hasValidPhoto && hasValidWeather) {
      // Load from cache
      loadPhotoFromStorage()
      const cached = storage.get<{ data: WeatherData }>(`weather_${currentCity}`)
      if (cached?.data) {
        weatherData.value = cached.data
        updateLocalTime()
      }
      isInitialLoading.value = false
    } else {
      // Fetch fresh data
      try {
        await Promise.all([
          fetchPhoto(currentCity),
          fetchWeather(currentCity)
        ])
      } catch (err) {
        console.error('Failed to load initial data:', err)
      } finally {
        isInitialLoading.value = false
      }
    }
  }

  // Watchers
  watch(
    () => weatherData.value,
    (newWeather) => {
      if (newWeather) {
        updateLocalTime()
      }
    },
    { immediate: true }
  )

  watch(
    () => photo.value,
    (newPhoto) => {
      if (newPhoto && city.value) {
        photoData.value = newPhoto
        savePhotoToStorage(newPhoto, city.value)
        
        // Prefetch image
        if (newPhoto.urls?.regular) {
          useHead({
            link: [
              { 
                rel: 'prefetch', 
                href: newPhoto.urls.regular, 
                as: 'image', 
                crossorigin: 'anonymous' 
              }
            ]
          })
        }
      }
    },
    { immediate: true }
  )

  // Lifecycle
  onMounted(() => {
    // Initialize time update interval
    const timeInterval = setInterval(updateLocalTime, 60 * 1000)
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', handleStorageEvent)

    // Initialize app
    initialize()

    onUnmounted(() => {
      clearInterval(timeInterval)
      window.removeEventListener('storage', handleStorageEvent)
    })
  })
</script>
<template>
  <div class="flex flex-col justify-center h-screen bg-gray-100 p-8 dark:bg-gray-900">
    <div class="relative rounded-2xl overflow-auto shadow-lg bg-white w-full max-w-[393px] h-[616px] mx-auto flex flex-col justify-center">
      <div class="relative z-40 flex-1 flex flex-col items-stretch h-full w-full overflow-hidden">
        <div class="relative z-40">
          <Controls :city="city" :country="country" :local-time="localTime"@open-search="toggleSearchDrawer" @open-list="toggleDrawer" @city-selected="fetchWeather" />
          <div v-if="weatherData" class="relative my-auto h-[18rem] max-h-[24rem] flex flex-col items-center text-palladian">
            <p>{{ weatherMain || '' }}</p>
            <div class="flex items-start">
              <span class="text-9xl font-light tracking-tighter leading-none">
                {{ Math.round(weatherData.main.temp) }}
              </span>
              
              <span class="text-5xl font-light pt-3">
                &deg;C
              </span>
            </div>
            <button @click="toggleSearchDrawer" class="flex justify-start items-center gap-1 pl-1 pr-4 py-1 bg-zinc-200/80 rounded-full text-[11px] text-abyssal font-medium">
              <SearchIcon class="scale-50" />
              <span>Search cities...</span>
            </button>
            <div class="hidden flex justify-start items-center w-full gap-2">
              <Icon :name="getWeatherIcon(weatherData.weather?.[0]?.id)" class="size-12" />
              <span class="text-2xl capitalize">{{ weatherMain || '' }}</span>
            </div>
            <div class="flex justify-start gap-4">
              <div class="flex justify-start items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="-5 -4.5 24 24">
                  <path fill="currentColor" d="m6 4.071l-3.95 3.95A1 1 0 0 1 .636 6.607L6.293.95a.997.997 0 0 1 1.414 0l5.657 5.657A1 1 0 0 1 11.95 8.02L8 4.07v9.586a1 1 0 1 1-2 0z"/>
                </svg>
                <span class="text-xl">{{ tempMax !== null ? tempMax.toFixed(0) : '--' }}°</span>
              </div>
              <div class="flex justify-start items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="-5 -4.5 24 24">
                  <path fill="currentColor" d="m8 11.243l3.95-3.95a1 1 0 1 1 1.414 1.414l-5.657 5.657a.997.997 0 0 1-1.414 0L.636 8.707A1 1 0 1 1 2.05 7.293L6 11.243V1.657a1 1 0 1 1 2 0z"/>
                </svg>
                <span>{{ tempMin !== null ? tempMin.toFixed(0) : '--' }}°</span>
              </div>
            </div>
          </div>
        </div>
        <Overlay />
      </div>

      <SplashScreen v-if="isInitialLoading" />

      <div v-if="photoData" class="absolute inset-0">
        <div class="w-full h-full filter brightness-110 contrast-110 saturate-110"
          :style="'background-image: url(' + photoData.urls.regular + '); background-size: cover; background-position: center'">
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-black/30"></div>
      </div>

      <div v-if="error" class="absolute inset-0 bg-sky-950"></div>
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
              <!-- Autocomplete dropdown -->
              <ul v-if="suggestions.length > 0" class="w-full flex flex-col bg-gray-700 text-yellow-50/90 mt-1 rounded shadow max-h-48 overflow-auto">
                <li v-for="(s, index) in suggestions" :key="index"
                  @click="selectCity(s)"
                  class="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                >
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
