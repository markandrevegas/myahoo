export const useUnsplash = (city: Ref<string>) => {
	const { data: photo, status } = useFetch<UnsplashPhoto>("/api/unsplash", {
		query: { city },
		watch: [city]
	})

	return { photo, loading: status }
}
