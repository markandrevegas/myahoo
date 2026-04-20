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
  <aside class="absolute inset-0 flex flex-col gap-4 p-4 bg-abyssal text-palladian z-50">
    <div class="flex-shrink-0 flex justify-between items-center my-4">
      <h2 class="text-lg font-semibold">Add a new location</h2>
      <button @click="emit('close')" aria-label="Close" class="hover:opacity-70 transition"><XIcon /></button>
    </div>

    <div class="flex flex-col bg-zinc-800/50 rounded-2xl overflow-hidden border border-white/10">
      <div class="w-full flex items-center gap-3 px-4 py-3">
        <SearchIcon class="text-white/50 size-5" />
        <input v-model="query" type="text" placeholder="Enter city name..." class="flex-1 bg-transparent text-lg focus:outline-none placeholder:text-white/30" @keyup.enter="emit('search', query)" />
        <div v-if="loading" class="animate-spin size-4 border-2 border-white/20 border-t-white rounded-full"></div>
      </div>

      <div v-if="suggestions.length > 0" class="w-full border-t border-white/5">
        <ul class="w-full flex flex-col max-h-64 overflow-y-auto divide-y divide-white/5">
          <li v-for="(s, index) in suggestions" :key="index" @click="emit('select', s)" class="px-4 py-3 hover:bg-white/10 cursor-pointer transition flex flex-col">
            <span class="text-sm font-medium">{{ s.name }}</span>
            <span class="text-[10px] uppercase tracking-wider opacity-50">{{ s.state ? `${s.state}, ` : '' }}{{ s.country }}</span>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>