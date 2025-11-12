// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap'
        },
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      meta: [
        { name: 'apple-mobile-web-app-title', content: 'myahoo' }
      ]
    }
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  vite: {
    server: {
      allowedHosts: ['myahoo.local']
    }
	},
  css: ["~/assets/css/tailwind.css"],
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    '@nuxt/test-utils/module'
  ],
  runtimeConfig: {
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
    public: {
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
      unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY
    }
  },
  nitro: {
		preset: "node-server",
		externals: {
			inline: ["ofetch"]
		}
	}
})
