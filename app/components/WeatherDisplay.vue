<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="relative rounded-[40px] overflow-auto shadow-lg bg-white" style="width: 430px; height: 810px;">
      <div class="relative h-full w-full overflow-hidden">
        <div class="relative z-30 w-full h-full flex flex-col justify-between" style="min-height: 810px; min-width: 430px;">
          <div class="relative z-20 h-full w-full p-8">
            <Controls :city="city" @open-search="toggleSearchDrawer" @open-list="toggleDrawer" @city-selected="fetchWeatherForCity" />
            <div v-if="weatherData" class="absolute bottom-0 h-64 flex flex-col items-start text-white">
              <div class="flex justify-start items-center w-full gap-2">
                <Icon :name="getWeatherIcon(weatherData.weather?.[0]?.id)" class="size-8" />
                <span class="text-lg capitalize">{{ weatherMain || '' }}</span>
              </div>
              <div class="flex justify-start gap-2">
                <div class="flex justify-start items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-5 -4.5 24 24">
                    <path fill="currentColor" d="m6 4.071l-3.95 3.95A1 1 0 0 1 .636 6.607L6.293.95a.997.997 0 0 1 1.414 0l5.657 5.657A1 1 0 0 1 11.95 8.02L8 4.07v9.586a1 1 0 1 1-2 0z"/></svg>
                  <span>{{ tempMax !== null ? tempMax.toFixed(0) : '--' }}°</span>
                </div>
                <div class="flex justify-start items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-5 -4.5 24 24">
                    <path fill="currentColor" d="m8 11.243l3.95-3.95a1 1 0 1 1 1.414 1.414l-5.657 5.657a.997.997 0 0 1-1.414 0L.636 8.707A1 1 0 1 1 2.05 7.293L6 11.243V1.657a1 1 0 1 1 2 0z"/></svg>
                  <span>{{ tempMin !== null ? tempMin.toFixed(0) : '--' }}°</span>
                </div>
              </div>
              <h1 class="text-8xl font-light">{{ Math.round(weatherData.main.temp) }}</h1>
            </div>
          </div>
          <div class="absolute inset-0 w-full h-full z-10 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
      </div>

      <div v-if="photoData" class="absolute inset-0">
        <div class="w-full h-full filter brightness-110 contrast-110 saturate-110" :style="{ backgroundImage: `url(${photoData.urls.regular})`, backgroundSize: 'cover', backgroundPosition: 'center'}"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-black/30"></div>
      </div>
      <div v-if="loading" class="absolute inset-0 flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><circle cx="12" cy="2.5" r="1.5" fill="currentColor"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></circle></svg>
      </div>
      <div v-if="error" class="absolute inset-0 bg-sky-950"></div>
      <transition name="fade">
        <div v-if="showDrawer || showSearchDrawer" class="absolute inset-0 bg-slate-100/40 z-40" @click.self="toggleDrawer"></div>
      </transition>
      <transition name="fade">
        <aside v-if="showDrawer" class="absolute top-0 left-0 w-full h-full bg-gray-900 text-gray-300 z-50 p-8 flex flex-col">
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
          <div class="flex-1 overflow-y-auto">
            <div v-if="searchedCities.length === 0" class="text-gray-500 text-sm">
              No cities searched yet.
            </div>
            <ul class="space-y-2">
              <li
                @click="loadCity(c)"
                v-for="(c, index) in searchedCities"
                :key="index"
                class="p-3 hover:bg-gray-500/40 hover:cursor-pointer hover:text-gray-200 transition ease-in-out duration-300 rounded"
              >
                <div class="flex flex-col text-sm">
                  <h3 class="capitalize">{{ c.city }}, {{ c.weather?.sys.country }}</h3>
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
      </transition>
      <transition name="fade" class="absolute top-0 left-0 w-full h-full bg-gray-900 text-gray-300 z-50 p-8 flex flex-col">
        <aside v-if="showSearchDrawer" class="absolute inset-0 p-8 flex flex-col gap-4">
          <div class="flex-shrink-0 flex justify-between items-center my-4">
            <h2 class="text-lg font-semibold">Add a new location</h2>
            <button @click="closeSearchDrawer" aria-label="Close">
              <span>Cancel</span>
            </button>
          </div>
          <div class="flex justify-start gap-4 items-center bg-gray-600 text-gray-400 rounded-lg p-3">
            <svg class="flex-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-2.5 -2.5 24 24">
              <path fill="currentColor" d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12m6.32-1.094l3.58 3.58a1 1 0 1 1-1.415 1.413l-3.58-3.58a8 8 0 1 1 1.414-1.414z"/></svg>
            <input @keyup.enter="handleSearch" type="text" placeholder="Enter city name..." v-model="cityInput" class="flex-1 focus:outline-none placeholder:text-gray-400" />
          </div>
        </aside>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Home'
})

import { ref } from 'vue'
import { useUnsplash } from '~/composables/useUnsplash'
import { useWeather } from '~/composables/useWeather'


// --- Interfaces ---
interface UnsplashPhoto {
  id: string
  urls: { regular: string }
  alt_description?: string
  city?: string
}
interface WeatherData {
  name: string
  timezone: number
  sys: { country: string }
  weather: { id: number; description: string; main: string }[]
  main: { temp: number; temp_min: number; temp_max: number }
}
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
const weatherMain = ref<string>('Rain')
// const weatherId = ref<number>(800)
const forecastIcon = computed(() => {
  const id = weatherData.value?.weather?.[0]?.id
  return id ? getWeatherIcon(id) : 'ph:question'
})

// --- Composables ---
const weatherError = ref<any>(null)
const { photo, loading, error, fetchPhoto } = useUnsplash() as {
  photo: Ref<UnsplashPhoto | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchPhoto: (city: string) => Promise<void>
}

// --- State ---
const showDrawer = ref(false)
const showSearchDrawer = ref(false)
const localTime = ref('')
const city = ref('Miami')
const searchedCities = ref<Array<{
  city: string
  weather: WeatherData | null
  photo: UnsplashPhoto | null
  timestamp: number
}>>([])
const weatherData = ref<any>(null)
const currentTemp = ref<number | null>(null)
const tempMin = ref<number | null>(null)
const tempMax = ref<number | null>(null)
const cityInput = ref<string>('')
const photoData = ref<UnsplashPhoto | null>(null)
const CACHE_DURATION = 1000 * 60 * 60 * 3

// --- UI handlers ---
const toggleSearchDrawer = () => {
  showSearchDrawer.value = !showSearchDrawer.value
  cityInput.value = ''
}
const closeSearchDrawer = () => {
  showSearchDrawer.value = !showSearchDrawer.value
  cityInput.value = ''
}

// --- Helper: Load cached weather ---
const loadCachedWeather = (cityName: string) => {
  const stored = localStorage.getItem(`weather_${cityName}`)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    const now = Date.now()

    // if cache is still valid (under 3 hours old)
    if (now - parsed.timestamp < CACHE_DURATION) {
      console.log('Loaded cached weather for', cityName)
      return parsed.data
    } else {
      localStorage.removeItem(`weather_${cityName}`)
      return null
    }
  } catch (e) {
    console.warn('Failed to parse cached weather:', e)
    return null
  }
}
// --- City search ---
const searchCity = async () => {
  const trimmedCity = cityInput.value.trim()
  if (!trimmedCity) return

  console.log('Searching for city:', trimmedCity)
  city.value = trimmedCity
  toggleSearchDrawer()

  const exists = searchedCities.value.some(
    (c) => c.city.toLowerCase() === trimmedCity.toLowerCase()
  )
  if (exists) {
    return
  }

  try {
    await Promise.all([fetchPhoto(trimmedCity), fetchWeather(trimmedCity)])

    searchedCities.value.push({
      city: trimmedCity,
      weather: weatherData.value,
      photo: photo.value,
      timestamp: Date.now()
    })

    localStorage.setItem('searchedCities', JSON.stringify(searchedCities.value))
  } catch (e) {
    console.error('Error searching city:', e)
  }
}
function handleSearch() {
  if (!cityInput.value.trim()) return
  searchCity()
  cityInput.value = ''
}
// --- Drawer ---
function toggleDrawer() {
  showDrawer.value = !showDrawer.value
}
const loadCity = (selectedCity: typeof searchedCities.value[0]) => {
  if (!selectedCity) return

  city.value = selectedCity.city
  weatherData.value = selectedCity.weather
  photoData.value = selectedCity.photo

  showDrawer.value = false

  // fetchWeather(selectedCity.city)
  fetchPhoto(selectedCity.city)
}
// --- Store weather details in refs & localStorage ---
const setWeatherRefs = (data: WeatherData) => {
  weatherData.value = data
  currentTemp.value = data.main.temp
  tempMin.value = weatherData.value.main.temp_min
  tempMax.value = weatherData.value.main.temp_max
  weatherMain.value = weatherData.value.weather?.[0]?.main || ''

  localStorage.setItem(
    `weather_${city.value}`,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  )
}
// --- Fetch weather ---
const fetchWeather = async (cityName: string) => {
  // Try cache first
  const cached = loadCachedWeather(cityName)
  if (cached) {
    setWeatherRefs(cached)
    return
  }

  try {
    const { data, error } = await useWeather(cityName)
    if (error.value) throw new Error(error.value.message || 'Failed to fetch weather')
    if (data.value) setWeatherRefs(data.value as WeatherData)
  } catch (err) {
    console.error('Weather error:', err)
    weatherError.value = err
  }
}
async function fetchWeatherForCity(newCity: string) {
  if (!newCity) return

  city.value = newCity.trim()
  // Check if the city already exists
  const existing = searchedCities.value.find(
    (c) => c.city.toLowerCase() === newCity.toLowerCase()
  )
  if (existing) return

  // Add temporary entry while loading
  searchedCities.value.push({
    city: newCity,
    weather: null,
    photo: null,
    timestamp: Date.now()
  })

  try {
    // Fetch both weather and photo in parallel
    const [{ data, error }, _] = await Promise.all([
      useWeather(newCity),
      fetchPhoto(newCity)
    ])

    if (error.value) {
      console.error(`Failed to fetch weather for ${newCity}`, error.value)
      return
    }

    const weatherData = data.value as WeatherData
    const index = searchedCities.value.findIndex(
      (c) => c.city.toLowerCase() === newCity.toLowerCase()
    )
    if (index !== -1 && weatherData) {
      searchedCities.value[index]!.weather = weatherData
      searchedCities.value[index]!.photo = photo.value
      searchedCities.value[index]!.timestamp = Date.now()
      localStorage.setItem(
        'searchedCities',
        JSON.stringify(searchedCities.value)
      )
    }
  } catch (err) {
    console.error('Error fetching weather or photo:', err)
  }
}

// --- Load from storage ---
const loadPhotoFromStorage = () => {
  const stored = localStorage.getItem('unsplashPhoto')
  if (!stored) return

  try {
    const parsed = JSON.parse(stored)
    if (parsed?.photo?.urls?.regular) {
      photoData.value = parsed.photo
      city.value = parsed.city
      console.log('Loaded from localStorage:', city.value)
    }
  } catch (e) {
    console.warn('Failed to parse stored photo:', e)
  }
}
const loadWeatherFromStorage = () => {
  if (!city.value) return
  const storedWeather = localStorage.getItem(`weather_${city.value}`)
  if (!storedWeather) return

  try {
    const parsed = JSON.parse(storedWeather)
    if (parsed?.data?.main) setWeatherRefs(parsed.data)
  } catch (e) {
    console.warn('Failed to parse stored weather:', e)
  }
}

// --- Local time updater ---
const updateLocalTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  localTime.value = hours + ':' + minutes
}

// --- utility to check localStorage values are really valid ---
function hasValidLocalItem(key: string): boolean {
  const raw = localStorage.getItem(key)
  if (raw == null) return false

  const trimmed = raw.trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return false

  try {
    JSON.parse(trimmed)
    return true
  } catch {
    // if parsing fails it's still possibly a plain string — consider it valid
    return true
  }
}

// named storage handler so we can remove it later
function handleStorageEvent(event: StorageEvent) {
  if (!event.key) return
  if (event.key === 'unsplashPhoto' && event.newValue) {
    console.log('storage event: unsplashPhoto updated')
    loadPhotoFromStorage()
    loadWeatherFromStorage()
  }
  if (event.key.startsWith('weather_') && event.newValue) {
    console.log('storage event: weather_* updated')
    loadWeatherFromStorage()
  }
}

// --- Watchers ---
watch(
  () => photo.value?.urls?.regular,
  (url) => {
    if (url) {
      useHead({
        link: [
          { rel: 'prefetch', href: url, as: 'image', crossorigin: 'anonymous' }
        ]
      })
    }
  }
)
watch(photo, (newPhoto) => {
  if (newPhoto && city.value) {
    photoData.value = newPhoto
    localStorage.setItem(
      'unsplashPhoto',
      JSON.stringify({
        city: city.value,
        photo: newPhoto,
        timestamp: Date.now(),
      })
    )
  }},
  { immediate: true }
)

// --- Lifecycle ---
onMounted(() => {
  loadPhotoFromStorage()
  loadWeatherFromStorage()
  updateLocalTime()

  let currentCity = localStorage.getItem('currentCity')?.trim() || ''
  const defaultCity = 'Miami'

  const hasPhoto = hasValidLocalItem('unsplashPhoto')
  const hasWeather = currentCity ? hasValidLocalItem(`weather_${currentCity}`) : false
  const hasCity = !!currentCity

  console.log({ hasPhoto, hasWeather, hasCity, currentCity })

  if (!hasPhoto || !hasWeather || !hasCity) {
    currentCity = defaultCity
    city.value = currentCity
    console.log('No local data found — fetching for', city.value)
    localStorage.setItem('currentCity', currentCity)

    fetchPhoto(currentCity)
    fetchWeather(currentCity)
  } else {
    console.log(`Loaded cached data for: ${city.value}`)
    loadPhotoFromStorage()
    loadWeatherFromStorage()
  }
  const timeInterval = setInterval(updateLocalTime, 60 * 1000)

  // Sync across tabs
  window.addEventListener('storage', handleStorageEvent)

  const stored = localStorage.getItem('searchedCities')
  if (stored) {
    try {
      searchedCities.value = JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse searchedCities:', e)
    }
  }
  onUnmounted(() => {
    clearInterval(timeInterval)
    window.removeEventListener('storage', handleStorageEvent)
  })
})
</script>
<style>
/* Slide left transition */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.6s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* Fade overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
