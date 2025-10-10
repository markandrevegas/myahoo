<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="relative border border-gray-400 rounded-[40px] overflow-auto shadow-lg bg-white" style="width: 430px; height: 896px;">
      <div class="relative h-full w-full overflow-hidden">
        <div class="relative z-30 w-full h-full flex flex-col justify-between" style="min-height: 896px; min-width: 430px;">
          <div class="relative z-20 h-full w-full p-8">
            <Controls />
            <div class="border-t border-white absolute bottom-0 h-96 flex flex-col items-start">
              <h1 class="text-white text-8xl">19</h1>
            </div>
          </div>
          <div class="relative z-20 p-8">
            <CityPhoto @update:photo="photoData = $event" />
          </div>
          <div class="absolute inset-0 w-full h-full z-10 bg-sky-950 opacity-40"></div>
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
