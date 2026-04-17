// app/composables/useCityAutocomplete.ts
export function useCityAutocomplete() {
	const query = ref("")

	const {
		data: suggestions,
		status,
		error
	} = useFetch("/api/geo-proxy", {
		query: { q: query },
		watch: [query],
		immediate: false,
		// Only fetch if query is > 2 chars
		transform: (data: any[]) => {
			if (!data) return []
			// Your unique filtering logic here...
			return data
		}
	})

	return { query, suggestions, loading: status, error }
}
