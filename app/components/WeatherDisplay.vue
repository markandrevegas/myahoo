<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="relative border border-gray-400 rounded-[40px] overflow-auto shadow-lg bg-white" style="width: 430px; height: 896px;">
      <div class="relative h-full w-full overflow-hidden">
        <div class="relative z-30 w-full h-full flex flex-col justify-between" style="min-height: 896px; min-width: 430px;">
          <div class="relative z-20 h-full w-full p-8">
            <Controls @open-search="openSearch" />
            <div class="absolute bottom-0 h-96 flex flex-col items-start text-white">
              </div>
          </div>
          <div class="absolute inset-0 w-full h-full z-10 bg-sky-950 opacity-20"></div>
        </div>
      </div>
      <div v-if="photoData" class="absolute inset-0" :style="{ backgroundImage: `url(${photoData.urls.regular})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></div>

      <div v-if="showCitySearch" class="absolute inset-0 z-50 bg-white p-8">
        <div class="flex justify-end mb-4">
          <button @click="closeSearch" class="text-gray-600 hover:text-gray-900 text-2xl font-bold">
            &times;
          </button>
        </div>
        <h2 class="text-xl font-semibold mb-4">Search for a City</h2>
        <div class="flex justify-start">
          <input type="text" placeholder="Enter city name..." class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" v-model="cityInput" />
          <button @click="searchCity" class="w-full p-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition duration-150">
            Search
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
interface UnsplashPhoto {
  id: string
  urls: { regular: string }
  alt_description?: string
  city?: string
}

const { photo, loading, error, fetchPhoto } = useUnsplash() as {
  photo: Ref<UnsplashPhoto | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchPhoto: (city: string) => Promise<void>
}

const showCitySearch = ref(false)
const cityInput = ref<string>('')
const city = ref<string>('')
const photoData = ref<UnsplashPhoto | null>(null)

const openSearch = () => {
  showCitySearch.value = true
}
const closeSearch = () => {
  showCitySearch.value = false
}

const searchCity = () => {
  const trimmedCity = cityInput.value.trim()
  if (trimmedCity) {
    console.log('Searching for city:', trimmedCity)
    fetchPhoto(trimmedCity)
    city.value = trimmedCity

    closeSearch()
  }
}

const loadFromStorage = () => {
  const stored = localStorage.getItem('unsplashPhoto')
  if (!stored) return

  try {
    const parsed = JSON.parse(stored)
    if (parsed?.photo?.urls?.regular) {
      photoData.value = parsed.photo
      city.value = parsed.city || ''
      console.log('Loaded from localStorage:', city.value)
    }
  } catch (e) {
    console.warn('Failed to parse stored photo:', e)
  }
}

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
onMounted(() => {
  loadFromStorage()
  window.addEventListener('storage', (event) => {
    if (event.key === 'unsplashPhoto' && event.newValue) {
      loadFromStorage()
    }
  })
})
</script>
