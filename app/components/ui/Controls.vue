<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'

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
  watch(() => props.localTime, () => {
    updateFormattedDateTime()
  })
  onMounted(() => {
    isClientMounted.value = true
    updateFormattedDateTime()

    // Update date portion every minute
    const interval = setInterval(updateFormattedDateTime, 60 * 1000)

    onUnmounted(() => {
      clearInterval(interval)
    })
  })
</script>

<template>
  <div class="relative w-full flex flex-col text-palladian z-50">
    <div class="w-full flex justify-between items-center p-8">
      <MenuIcon @click="handleOpenList" />
      <div class="flex flex-col items-center">
        <div class="flex justify-start items-center gap-1">
          <LocationIcon class="scale-50" />
          <p class="text-lg"><span class="capitalize">{{ props.city }}</span>, {{ props.country }}</p>
        </div>
        
        <div class="flex justify-center gap-4">
          <p v-if="isClientMounted && formattedDate" class="hidden inline-block text-center text-palladian">
            {{ formattedDate }}
          </p>
          <p v-if="isClientMounted && formattedTime" class="text-sm inline-block text-center text-palladian">
            {{ formattedTime }}
          </p>
        </div>
      </div>
      <PlusIcon @click="emit('open-search')" class="scale-125 hover:cursor-pointer"/>
    </div>
  </div>
</template>