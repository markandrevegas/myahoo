<script setup lang="ts">
import { computed } from 'vue'
import HumidityIcon from './icons/HumidityIcon.vue';

interface WeatherDataProps {
  weatherData: WeatherData | null
}

const props = defineProps<WeatherDataProps>()
const emit = defineEmits(['open-search'])

const weatherMain = computed(() => props.weatherData?.weather?.[0]?.main || '---')
const currentTemp = computed(() => {
  const t = props.weatherData?.main?.temp
  return t !== undefined ? Math.round(t) : null
})

const tempMax = computed(() => {
  const t = props.weatherData?.main?.temp_max
  return t !== undefined ? Math.round(t) : null
})

const tempMin = computed(() => {
  const t = props.weatherData?.main?.temp_min
  return t !== undefined ? Math.round(t) : null
})

const windSpeed = computed(() => {
  const speed = props.weatherData?.wind?.speed
  return speed !== undefined ? Math.floor(speed) : 0
})

const airPressure = computed(() => {
  const pressure = props.weatherData?.main?.pressure
  return pressure !== undefined ? Math.floor(pressure) : 0
})

const humidity = computed(() => props.weatherData?.main?.humidity ?? 0)

const weatherIconId = computed(() => props.weatherData?.weather?.[0]?.id)

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
watch(
  () => props.weatherData,
  (val) => {
    console.log('weatherData:', val)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="relative z-50 flex-1 flex flex-col justify-start items-center text-palladian">
    <div class="flex flex-col gap-4 justify-center w-4/5 mx-auto">
      <p class="text-center">{{ weatherMain }}</p>
      <div class="flex items-start justify-center">
        <span class="text-center text-8xl font-light tabular-nums font-sans tracking-tighter leading-none">
          {{ currentTemp ?? '--' }}
        </span>
        <span class="text-4xl font-semibold pt-3">&deg;C</span>
      </div>
      <div class="grid grid-cols-2 w-4/5 mx-auto leading-none text-white gap-4">
        <div class="col-span-1 flex flex-col gap-2 bg-white/30 rounded-xl p-4">
          <span class="inline-flex justify-start items-center gap-2 text-xxs">
            <HighTempIcon class="size-5" /><span>High</span>
          </span>
          <span class="inline-flex items-start gap-1">
            <span class="text-2xl leading-none">{{ tempMax ?? '--' }}</span>
            <span class="text-sm relative -top-[2px]">&deg;C</span>
          </span>
        </div>
        <div class="col-span-1 flex flex-col gap-2 bg-white/30 rounded-xl p-4">
          <span class="inline-flex justify-start items-center gap-2 text-xxs">
            <LowTempIcon class="size-5" /><span>Low</span>
          </span>
          <span class="inline-flex items-start gap-1">
            <span class="text-2xl leading-none">{{ tempMin ?? '--' }}</span>
            <span class="text-sm relative -top-[2px]">&deg;C</span>
          </span>
        </div>
        <div class="col-span-1 flex flex-col gap-2 bg-white/30 rounded-xl p-4">
          <span class="inline-flex justify-start items-center gap-2 text-xxs">
            <HumidityIcon class="size-5" /><span>Humidity</span>
          </span>
          <span class="inline-flex items-start gap-1">
            <span class="tabular-nums text-2xl leading-none">{{ humidity }}</span>
            <span class="text-sm relative -top-[2px]">%</span>
          </span>
        </div>
        <div class="col-span-1 flex flex-col gap-2 bg-white/30 rounded-xl p-4">
          <span class="inline-flex justify-start items-center gap-2 text-xxs">
            <WindIcon class="size-5" /><span>Wind</span>
          </span>
          <span class="inline-flex items-start gap-1">
            <span class="tabular-nums text-2xl leading-none">{{ windSpeed }}</span>
            <span class="text-sm relative -top-[2px]">m/s</span>
          </span>
        </div>
        <div class="hidden col-span-1 flex flex-col items-center">
          <BarometerIcon class="size-5" />
          <span class="tabular-nums"><span>{{ airPressure }}</span> hPa</span>
        </div>
      </div>
    </div>

    <div class="hidden flex flex-col items-center gap-4">
      <div class="flex justify-start items-center gap-2">
        <Icon :name="getWeatherIcon(weatherData?.weather?.[0]?.id)" class="size-12" />
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