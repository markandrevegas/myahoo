<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

  const emit = defineEmits<{
    (e: 'open-search'): void
    (e: 'open-list'): void
  }>()

  const props = defineProps<{
    city: string
    country: string
    localTime?: string
  }>()

  const isClientMounted = ref(false)
  const formattedDate = ref('')
  const formattedTime = ref('')

  const updateFormattedDateTime = () => {
    if (!props.localTime) {
      formattedDate.value = ''
      formattedTime.value = ''
      return
    }

    const now = new Date()
    const dateOptions = { 
      weekday: 'long', 
      // year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    } as const

    // Set the values separately
    formattedDate.value = now.toLocaleDateString(undefined, dateOptions)
    formattedTime.value = props.localTime
  }

  const handleOpenSearch = () => {
    emit('open-search')
  }

  const handleOpenList = () => {
    emit('open-list')
  }

  onMounted(() => {
    isClientMounted.value = true
    updateFormattedDateTime()

    // Update date portion every minute
    const interval = setInterval(updateFormattedDateTime, 60 * 1000)

    onUnmounted(() => {
      clearInterval(interval)
    })
  })

  // Watch for localTime prop changes
  watch(() => props.localTime, () => {
    updateFormattedDateTime()
  })
</script>

<template>
  <div class="relative w-full flex flex-col text-palladian z-50">
    <div class="w-full h-24 p-4 hidden">
      <button @click="handleOpenList" class="scale-75">
        <MenuIcon />
      </button>
    </div>
    <div class="h-48 flex flex-col gap-1 justify-center text-center">
      <p class="text-2xl font-light">{{ props.city }}, {{ props.country }}</p>
      <div class="flex justify-center gap-4">
        <p v-if="isClientMounted && formattedDate" class="inline-block text-center text-palladian">
          {{ formattedDate }}
        </p>
        <p v-if="isClientMounted && formattedTime" class="inline-block text-center text-palladian">
          {{ formattedTime }}
        </p>
      </div>
    </div>
  </div>
</template>