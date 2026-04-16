<script setup lang="ts">
import { computed } from 'vue'
import type { WeatherData } from '~/composables/useWeather'

interface WeatherDataProps {
  weatherData: WeatherData
}

const props = defineProps<WeatherDataProps>()
const emit = defineEmits(['open-search'])

// Local computed properties for clean template logic
const weatherMain = computed(() => props.weatherData?.weather?.[0]?.main || 'Rain')
const tempMax = computed(() => props.weatherData?.main?.temp_max ?? null)
const tempMin = computed(() => props.weatherData?.main?.temp_min ?? null)

const windSpeed = computed(() => props.weatherData?.wind?.speed ?? null)
const humidity = computed(() => props.weatherData?.main?.humidity ?? null)

// Move the icon logic here or keep it in a shared util. 
// For now, I'll include it here for self-containment.
function getWeatherIcon(id?: number): string {
  if (id == null) return 'ph:question'
  if (id >= 200 && id < 300) return 'wi:storm-showers'
  if (id >= 300 && id < 400) return 'wi:sprinkle'
  if (id >= 500 && id < 600) return 'wi:rain'
  if (id >= 600 && id < 700) return 'wi:snow'
  if (id === 800) return 'wi:day-sunny'
  if (id > 800 && id < 805) return 'wi:cloudy'
  return 'ph:question'
}
</script>

<template>
  <div class="relative z-50 flex-1 flex flex-col justify-start items-center text-palladian">
    <div class="flex flex-col gap-1 justify-center w-3/5 mx-auto">
      <p class="text-center">{{ weatherMain }}</p>
      <div class="flex items-start justify-center">
        <span class="text-center text-8xl font-light tabular-nums font-sans tracking-tighter leading-none">
          {{ Math.round(weatherData.main.temp) }}
        </span>
        <span class="text-4xl font-semibold pt-3">&deg;C</span>
      </div>
      <div class="grid grid-cols-2 w-full text-center">
        <div>
          <p>High: <span>{{ tempMax !== null ? tempMax.toFixed(0) : '--' }}</span><span>&deg;C</span></p>
        </div>
        <div>
          <p>Low: <span>{{ tempMin !== null ? tempMin.toFixed(0) : '--' }}</span><span>&deg;C</span></p>
        </div>
      </div>
      <div class="grid grid-cols-2 w-full bg-white/30 rounded-3xl p-2 text-white">
        <div class="col-span-1 flex flex-col gap-2 justify-center items-center">
          <HumidityIcon class="scale-125"/>
          <span class="text-[12px]">{{ humidity }} %</span>
        </div>
        <div class="col-span-1 flex flex-col gap-2 justify-center items-center">
          <WindIcon class="scale-125"/>
          <span class="text-[12px]">{{ windSpeed }} m/s</span>
        </div>
      </div>
    </div>

    <button 
      @click="emit('open-search')" 
      class="flex justify-start items-center gap-1 pl-1 pr-4 py-1 bg-zinc-200/80 rounded-full text-[11px] text-abyssal font-medium"
    >
      <SearchIcon class="scale-50" />
      <span>Search cities...</span>
    </button>

    <div class="hidden flex flex-col items-center gap-4">
      <div class="flex justify-start items-center gap-2">
        <Icon :name="getWeatherIcon(weatherData.weather?.[0]?.id)" class="size-12" />
        <span class="text-2xl capitalize">{{ weatherMain }}</span>
      </div>

      <div class="flex justify-start gap-4">
        <div class="flex justify-start items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="-5 -4.5 24 24">
            <path fill="currentColor" d="m6 4.071l-3.95 3.95A1 1 0 0 1 .636 6.607L6.293.95a.997.997 0 0 1 1.414 0l5.657 5.657A1 1 0 0 1 11.95 8.02L8 4.07v9.586a1 1 0 1 1-2 0z"/>
          </svg>
          <span class="text-xl">{{ tempMax !== null ? tempMax.toFixed(0) : '--' }}°</span>
        </div>
        <div class="flex justify-start items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="-5 -4.5 24 24">
            <path fill="currentColor" d="m8 11.243l3.95-3.95a1 1 0 1 1 1.414 1.414l-5.657 5.657a.997.997 0 0 1-1.414 0L.636 8.707A1 1 0 1 1 2.05 7.293L6 11.243V1.657a1 1 0 1 1 2 0z"/>
          </svg>
          <span class="text-xl">{{ tempMin !== null ? tempMin.toFixed(0) : '--' }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>