<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 1. Define the event this component can emit
const emit = defineEmits<{
  (e: 'open-search'): void
  (e: 'open-list'): void
}>()
const props = defineProps<{
  city: string
  country: string
}>()

const city = ref<string>('')
const localTime = ref<string>('')
const isClientMounted = ref(false)

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

  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const timeStr = `${hours}:${minutes}`

  const dateOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  } as const
  const dateStr = now.toLocaleDateString(undefined, dateOptions)

  localTime.value = `${dateStr} | ${timeStr}`
}

// --- Lifecycle ---
onMounted(() => {
  isClientMounted.value = true
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
  <div class="w-full flex flex-col">
    <div class="h-24 flex flex-col gap-1 justify-center text-palladian text-center">
      <p class="text-3xl font-light">{{ props.city }}, {{ props.country }}</p>
      <p v-if="isClientMounted" class="text-xs text-center text-palladian">{{ localTime }}</p>
    </div>
    <div class="w-full flex justify-between items-center text-yellow-50">
      <button @click="handleOpenList" class="scale-75"><SettingsIcon/></button>

      <div class="flex flex-col justify-center items-center">
        <p class="text-2xl font-light">{{ props.city }}, {{ props.country }}</p>
      </div>

      <button @click="handleOpenSearch" class="scale-75">
        <SearchIcon />
      </button>
    </div>
    <p v-if="isClientMounted" class="text-sm text-center text-palladian">{{ localTime }}</p>
  </div>
</template>