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
  const formattedDateTime = ref<string>('')

  const updateFormattedDateTime = () => {
    if (!props.localTime) {
      formattedDateTime.value = ''
      return
    }

    const now = new Date()
    const dateOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    } as const
    const dateStr = now.toLocaleDateString(undefined, dateOptions)

    formattedDateTime.value = `${dateStr} | ${props.localTime}`
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
  <div class="w-full flex flex-col text-palladian">
    <div class="w-full flex justify-center items-center h-24">
      <button @click="handleOpenList" class="scale-75">
        <SettingsIcon />
      </button>


      <!--<button @click="handleOpenSearch" class="flex justify-start items-center gap-1 pl-1 pr-4 py-1 bg-zinc-200/80 rounded-full text-[11px] text-abyssal font-medium">
        <SearchIcon class="scale-50" />
        <span>Search cities...</span>
      </button>-->
    </div>
    <div class="h-16 flex flex-col gap-1 justify-center text-center">
      <p class="text-3xl font-light">{{ props.city }}, {{ props.country }}</p>
      <p v-if="isClientMounted && formattedDateTime" class="text-xs text-center text-palladian">
        {{ formattedDateTime }}
      </p>
    </div>
    
  </div>
</template>