<script setup lang="ts">
import { ref, onMounted } from 'vue'

const city = ref<string>('')
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
// Load from localStorage on mount
onMounted(() => {
  loadCityFromStorage()
  // 🔹 React to localStorage changes across tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'unsplashPhoto' && event.newValue) {
      loadCityFromStorage()
    }
  })
  // 🔹 React to same-tab changes (using polling)
  setInterval(loadCityFromStorage, 1000)
})
// 🔹 Watch for local changes in city value
/* watch(city, (newCity, oldCity) => {
  if (newCity && newCity !== oldCity) {
    console.log(`City changed: ${oldCity || '(none)'} → ${newCity}`)
  }
}) */
</script>

<template>
  <div class="w-full flex justify-between items-center text-white">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-5 -7 24 24"><!-- Icon from Jam Icons by Michael Amprimo - https://github.com/cyberalien/jam-backup/blob/main/LICENSE --><path fill="currentColor" d="M1 0h5a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2m7 8h5a1 1 0 0 1 0 2H8a1 1 0 1 1 0-2M1 4h12a1 1 0 0 1 0 2H1a1 1 0 1 1 0-2"/></svg>
    <div class="flex flex-col justify-center items-center">
      <span class="text-2xl capitalize">{{ city }}</span>
      <span class="text-lg">18:37</span>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-4.5 -4.5 24 24"><!-- Icon from Jam Icons by Michael Amprimo - https://github.com/cyberalien/jam-backup/blob/main/LICENSE --><path fill="currentColor" d="M8.9 6.9v-5a1 1 0 1 0-2 0v5h-5a1 1 0 1 0 0 2h5v5a1 1 0 1 0 2 0v-5h5a1 1 0 1 0 0-2z"/></svg>
  </div>
</template>
