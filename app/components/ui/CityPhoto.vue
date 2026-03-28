<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUnsplash } from '~/composables/useUnsplash'

const city = ref('')
const { photo, loading, error, fetchPhoto } = useUnsplash()
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
const emits = defineEmits<{
  (e: 'update:photo', photo: any): void
}>()

// Watch photo changes and emit to parent
watch(photo, (newPhoto) => {
  if (newPhoto) emits('update:photo', newPhoto)
})

function handleSearch() {
  fetchPhoto(city.value)
}
</script>

<template>
  <div class="p-6 text-center">
    <input
      v-model="city"
      placeholder="Enter a city name"
      class="border rounded p-2 w-64 mb-4"
    />
    <button @click="handleSearch" class="bg-blue-500 text-white px-4 py-2 rounded">
      Search
    </button>

    <div v-if="loading" class="mt-4">Loading...</div>
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>
  </div>
</template>
