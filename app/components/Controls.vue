<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 1. Define the event this component can emit
const emit = defineEmits<{
  (e: 'open-search'): void
  (e: 'open-list'): void
}>()
const props = defineProps<{
  city: string
}>()

const city = ref<string>('')
const localTime = ref<string>('')

// 2. Function to handle the click on the plus sign
const handleOpenSearch = () => {
  emit('open-search')
}
const handleOpenList= () => {
  emit('open-list')
}

// --- Methods ---
const loadCityFromStorage = () => {
  const stored = localStorage.getItem('unsplashPhoto')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      city.value = parsed.city || ''
    } catch (e) {
      console.warn('Failed to parse stored city:', e)
    }
  }
}

const updateLocalTime = () => {
  const now = new Date()
  // format as HH:MM, with leading zeros
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  localTime.value = `${hours}:${minutes}`
}

// --- Lifecycle ---
onMounted(() => {
  loadCityFromStorage()
  updateLocalTime()
  window.addEventListener('storage', (event) => {
    if (event.key === 'unsplashPhoto' && event.newValue) {
      loadCityFromStorage()
    }
  })
  setInterval(loadCityFromStorage, 1000)

  // Auto-refresh every 30s or 1min
  const timeInterval = setInterval(updateLocalTime, 60 * 1000)
  const cityInterval = setInterval(loadCityFromStorage, 1000)

  // Clean up when component unmounts
  onUnmounted(() => {
    clearInterval(timeInterval)
    clearInterval(cityInterval)
    window.removeEventListener('storage', loadCityFromStorage)
  })
})
</script>

<template>
  <div class="w-full flex justify-between items-center text-white">
    <svg @click="handleOpenList"  xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-5 -7 24 24">
      <path fill="currentColor" d="M1 0h5a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2m7 8h5a1 1 0 0 1 0 2H8a1 1 0 1 1 0-2M1 4h12a1 1 0 0 1 0 2H1a1 1 0 1 1 0-2"/>
    </svg>

    <div class="flex flex-col justify-center items-center">
      <span class="text-2xl capitalize">{{ props.city }}</span>
      <span class="text-lg">{{ localTime }}</span>
    </div>

    <button @click="handleOpenSearch" class="p-1 rounded-full hover:bg-white/20 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-4.5 -4.5 24 24">
        <path fill="currentColor" d="M8.9 6.9v-5a1 1 0 1 0-2 0v5h-5a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2z"/>
      </svg>
    </button>
  </div>
</template>