// app/composables/useCityAutocomplete.ts
export function useCityAutocomplete() {
	const query = ref("")

	const {
		data: suggestions,
		status,
		error
	} = useFetch<any[]>("/api/geo-proxy", {
		query: { q: query },
		watch: [query],
		immediate: false,
		default: () => [],
		transform: (data) => {
			if (!data || !Array.isArray(data)) return []

			const seen = new Set()
			return data.filter((item) => {
				const duplicate = seen.has(`${item.name}-${item.country}`)
				seen.add(`${item.name}-${item.country}`)
				return !duplicate
			})
		}
	})

	const loading = computed(() => status.value === "pending")

	return { query, suggestions, loading, error }
}
