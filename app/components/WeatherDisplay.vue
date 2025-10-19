<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="relative border border-gray-400 rounded-[40px] overflow-auto shadow-lg bg-white" style="width: 430px; height: 810px;">
      <div class="relative h-full w-full overflow-hidden">
        <div class="relative z-30 w-full h-full flex flex-col justify-between" style="min-height: 810px; min-width: 430px;">
          <div class="relative z-20 h-full w-full p-8">
            <Controls :city="city" @open-search="openSearch" />
            <div v-if="weatherData" class="absolute bottom-0 h-64 flex flex-col items-start text-white">
              <span class="text-xl capitalize block">{{ weatherMain || '' }}</span>
              <div class="flex justify-start gap-8">
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
              <h1 class="text-8xl tracking-tighter">{{ Math.round(weatherData.main.temp) }}</h1>
            </div>
          </div>
          <div class="absolute inset-0 w-full h-full z-10 bg-sky-950 opacity-20"></div>
        </div>
      </div>

      <div v-if="photoData" class="absolute inset-0" :style="{ backgroundImage: `url(${photoData.urls.regular})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></div>
      <div v-if="loading" class="absolute inset-0 flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><circle cx="12" cy="2.5" r="1.5" fill="currentColor"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></circle></svg>
      </div>
      <div v-if="error" class="absolute inset-0 bg-red-600/40"></div>

      <div v-if="showCitySearch" class="absolute inset-0 z-50 bg-gray-900 text-gray-200 p-8 flex flex-col gap-4">
        <div class="w-full flex justify-between items-center">
          <svg class="invisible" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-5 -7 24 24">
            <path fill="currentColor" d="M1 0h5a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2m7 8h5a1 1 0 0 1 0 2H8a1 1 0 1 1 0-2M1 4h12a1 1 0 0 1 0 2H1a1 1 0 1 1 0-2"/>
          </svg>

          <div class="flex flex-col justify-center items-center">
            <span class="text-lg">Add a new location</span>
          </div>

          <button @click="closeSearch" class="p-1 rounded-full hover:bg-gray-900/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-6 -6 24 24"><path fill="currentColor" d="m7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485L2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535l3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"/></svg>
          </button>
        </div>
        <div class="flex justify-start gap-4 items-center border border-gray-100 rounded-lg p-3">
          <svg class="flex-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-2.5 -2.5 24 24">
            <path fill="currentColor" d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12m6.32-1.094l3.58 3.58a1 1 0 1 1-1.415 1.413l-3.58-3.58a8 8 0 1 1 1.414-1.414z"/></svg>
          <input type="text" placeholder="Enter city name..." v-model="cityInput" class="flex-1 focus:outline-none" />
          <button @click="searchCity" class="transition duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-6 -6 24 24">
              <path fill="currentColor" d="m7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485L2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535l3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z"/></svg>
          </button>
        </div>
      </div>
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
  weather: { id: number; description: string }[]
  main: { temp: number; temp_min: number; temp_max: number }
}

// --- Composables ---
const weatherError = ref<any>(null)
const { photo, loading, error, fetchPhoto } = useUnsplash() as {
  photo: Ref<UnsplashPhoto | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchPhoto: (city: string) => Promise<void>
}

// --- State ---
const localTime = ref('')
const city = ref('Copenhagen')
const weatherData = ref<any>(null)
const currentTemp = ref<number | null>(null)
const tempMin = ref<number | null>(null)
const tempMax = ref<number | null>(null)
const weatherMain = ref<string>('')
const showCitySearch = ref(false)
const cityInput = ref<string>('')
const photoData = ref<UnsplashPhoto | null>(null)
const CACHE_DURATION = 1000 * 60 * 60 * 3

// --- UI handlers ---
const openSearch = () => {
  showCitySearch.value = true
  cityInput.value = ''
}
const closeSearch = () => {
  showCitySearch.value = false
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

// --- City search ---
const searchCity = async () => {
  const trimmedCity = cityInput.value.trim()
  if (!trimmedCity) return

  console.log('Searching for city:', trimmedCity)
  city.value = trimmedCity

  await Promise.all([
    fetchPhoto(trimmedCity),
    fetchWeather(trimmedCity)
  ])

  localStorage.setItem('lastCity', trimmedCity)
  closeSearch()
}

// --- Load from storage ---
const loadPhotoFromStorage = () => {
  const stored = localStorage.getItem('unsplashPhoto')
  if (!stored) return

  try {
    const parsed = JSON.parse(stored)
    if (parsed?.photo?.urls?.regular) {
      photoData.value = parsed.photo
      city.value = parsed.city || 'Copenhagen'
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

  const hasPhoto = !!localStorage.getItem('unsplashPhoto')
  const hasWeather = city.value && !!localStorage.getItem(`weather_${city.value}`)
  const hasCity = !!city.value
  if (!hasPhoto || !hasWeather || !hasCity) {
    city.value = 'Copenhagen'
    console.log('No local data found — fetching for Copenhagen')
    fetchPhoto('Copenhagen')
    fetchWeather('Copenhagen')
  } else {
    console.log(`Loaded cached data for: ${city.value}`)
  }
  const timeInterval = setInterval(updateLocalTime, 60 * 1000)
  loadPhotoFromStorage()
  loadWeatherFromStorage()
  // Sync across tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'unsplashPhoto' && event.newValue) {
      loadPhotoFromStorage()
      loadWeatherFromStorage()
    }
    if (event.key?.startsWith('weather_') && event.newValue) {
      loadWeatherFromStorage()
    }
  })
  onUnmounted(() => {
    clearInterval(timeInterval)
    window.removeEventListener('storage', loadPhotoFromStorage)
  })
})
</script>
