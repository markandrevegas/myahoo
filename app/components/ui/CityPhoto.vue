<script setup lang="ts">
	interface Photo { urls: { regular: string } }
	defineProps<{ photo?: Photo | null }>()
</script>

<template>
  <div v-if="photo" class="absolute inset-0 z-0">
    <div class="w-full h-full filter brightness-110 contrast-110 saturate-110" :style="{ backgroundImage: `url(${photo.urls.regular})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-black/30"></div>
  </div>
</template>