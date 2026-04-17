export interface WeatherData {
	weather: {
		id: number
		main: string
		description: string
		icon: string
	}[]
	main: {
		temp: number
		feels_like: number
		temp_min: number
		temp_max: number
		pressure: number
		humidity: number
	}
	wind: {
		speed: number
		deg: number
	}
	sys: {
		country: string
		sunrise: number
		sunset: number
	}
	name: string
	timezone: number
	dt: number
	// Add this to support your caching logic
	fetchedAt?: number
}
export interface UnsplashPhoto {
	id: string
	urls: {
		regular: string
		small: string
		thumb: string
	}
	alt_description?: string
	[key: string]: any
}
export interface SearchedCity {
	city: string
	weather: WeatherData | null
	photo: UnsplashPhoto | null
	timestamp: number
}
