<script setup lang="ts">
interface Suggestion {
	name: string
	country:string
	state?: string
}
const props = defineProps<{ suggestions: Suggestion[]; loading?: boolean }>()
const query = defineModel<string>(
	'query',
	{ default: ''}
)
const emit = defineEmits<{
	(e: 'close'): void;
	(e: 'select', s: Suggestion): void;
	(e: 'search', q: string): void
}>()
</script>

<template>
  <aside class="absolute inset-0 flex flex-col gap-4 p-4 z-50 bg-white text-abyssal">
    <div class="flex-shrink-0 flex justify-end items-center my-4">
      <button @click="emit('close')" aria-label="Close" class="hover:opacity-70 transition"><XIcon /></button>
    </div>

    <div class="flex-1 flex flex-col justify-start pt-24 overflow-hidden">
      <div class="w-4/5 mx-auto grid grid-cols-[1fr_auto] p-4 border-b border-abyssal/50">
        <input v-model="query" type="text" placeholder="Enter city name..." class="flex-1 bg-transparent focus:outline-none placeholder:text-abyssal/50 text-abyssal" @keyup.enter="emit('search', query)" />
        <div @click.prevent="emit('search', query)" class="border-l border-abyssal pl-2">
          <SearchIcon class="scale-75"/>
        </div>
      </div>
      <div v-if="loading" class="animate-spin size-4 border-2 border-white/20 border-t-white rounded-full"></div>

      <div v-if="suggestions.length > 0" class="w-4/5 mx-auto border-b border-abyssal/50">
        <ul class="w-full flex flex-col max-h-64 overflow-y-auto divide-y divide-abyssal/50">
          <li v-for="(s, index) in suggestions" :key="index" @click="emit('select', s)" class="px-4 py-3 hover:bg-white/40 cursor-pointer transition flex flex-col">
            <span class="text-sm font-medium">{{ s.name }}</span>
            <span class="text-[10px] uppercase tracking-wider">{{ s.state ? `${s.state}, ` : '' }}{{ s.country }}</span>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>