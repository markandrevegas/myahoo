<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="relative border border-gray-400 rounded-[40px] overflow-auto shadow-lg bg-white" style="width: 430px; height: 896px;">
      <div class="relative h-full w-full overflow-hidden">
        <div class="relative z-30 w-full h-full flex flex-col justify-between" style="min-height: 896px; min-width: 430px;">
          <div class="relative z-20 h-full w-full p-8">
            <Controls />
            <div class="absolute bottom-0 h-96 flex flex-col items-start text-white">
              <div class="flex flex-col justify-start items-center">
                <div class="flex justify-start items-center gap-2">
                  <Icon name="fluent:weather-cloudy-20-filled" class="h-8 w-8" />
                  <p class="text-lg font-semibold">Cloudy</p>
                </div>
                <div class="w-full flex justify-start items-center">
                  <span class="col-span-1 flex justify-start items-center">
                    <Icon name="wi:direction-down" class="size-12" />
                    <span>12</span>
                  </span>
                  <span class="col-span-1 flex justify-start items-center">
                    <Icon name="wi:direction-down" class="size-12 rotate-180" />
                    <span>19</span>
                  </span>
                </div>
              </div>
              <div class="flex justify-start items-start">
                <h1 class="text-8xl tracking-tighter">19</h1>
                <Icon name="wi:celsius" class="h-12 w-12" />
              </div>
            </div>
          </div>
          <div class="relative z-20 p-8">
            <CityPhoto @update:photo="photoData = $event" />
          </div>
          <div class="absolute inset-0 w-full h-full z-10 bg-sky-950 opacity-30"></div>
        </div>
      </div>
      <div v-if="photoData" class="absolute inset-0" :style="{ backgroundImage: `url(${photoData.urls.regular})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Home'
})
import { ref } from 'vue'
import CityPhoto from '~/components/CityPhoto.vue'

const photoData = ref<any>(null)
</script>
