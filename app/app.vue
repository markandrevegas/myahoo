<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - My Awesome Nuxt App` : 'My Awesome Nuxt App';
  },
  meta: [
    { name: 'description', content: 'A Nuxt 4, Tailwind 3, and Bun project.' }
  ]
})
</script>
