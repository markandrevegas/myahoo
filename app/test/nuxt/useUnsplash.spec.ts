// FIX: Re-include 'vi' in the destructured import.
// Nuxt's test environment often disables globals, requiring explicit import access for vi.mock.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useUnsplash } from '../../composables/useUnsplash'

// The vi object is now accessed via the imported object, which is necessary if globals: false.
const mockFetch = vi.fn()

// This call now uses the imported vi.mock.
vi.mock('#app', () => ({
  $fetch: mockFetch,
}))

// Helper to mount a dummy component that uses the composable
function mountComposable() {
  let composableReturn: any
  mount(
    defineComponent({
      setup() {
        composableReturn = useUnsplash()
        return () => null
      }
    })
  )
  return composableReturn
}

describe('useUnsplash', () => {
  let localStorageMock: Record<string, string>

  // The ReturnType<typeof vi.spyOn> utility should work correctly now that vi is imported.
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let setItemSpy: ReturnType<typeof vi.spyOn>
  let removeItemSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    localStorageMock = {}

    // vi is available via the import
    getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => localStorageMock[key] || null)
    setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
        localStorageMock[key] = value
      })
    removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation((key: string) => {
      delete localStorageMock[key]
    })

    // This may still be an issue due to vi.stubGlobal being deprecated, but let's try it first.
    vi.stubGlobal('window', {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()

    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
    removeItemSpy.mockRestore()
  })

  it('initializes with default values', () => {
    const { photo, city, loading, error } = mountComposable()
    expect(photo.value).toBeNull()
    expect(city.value).toBe('')
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('sets error if no city is provided', async () => {
    const { fetchPhoto, error } = mountComposable()
    await fetchPhoto('')
    expect(error.value).toBe('Please enter a city name.')
  })

  it('fetches photo successfully and stores in localStorage', async () => {
    const mockPhoto = {
      id: '123',
      urls: { regular: 'regular.jpg', small: 'small.jpg', thumb: 'thumb.jpg' },
      alt_description: 'test image'
    }

    mockFetch.mockResolvedValueOnce(mockPhoto)
    const { fetchPhoto, photo, city, loading, error } = mountComposable()
    await fetchPhoto('Paris')
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith('/api/unsplash', {
      query: { city: 'Paris' }
    })
    expect(photo.value).toEqual(mockPhoto)
    expect(city.value).toBe('Paris')
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'unsplashPhoto',
      expect.stringContaining('"city":"Paris"')
    )
  })

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failed'))

    const { fetchPhoto, error, loading } = mountComposable()
    await fetchPhoto('Berlin')
    await flushPromises()

    expect(error.value).toBe('Network failed')
    expect(loading.value).toBe(false)
  })

  it('restores state from localStorage on mount', async () => {
    const storedData = {
      city: 'Rome',
      photo: { id: '99', urls: { regular: 'r.jpg', small: 's.jpg', thumb: 't.jpg' } },
      timestamp: Date.now()
    }
    localStorageMock['unsplashPhoto'] = JSON.stringify(storedData)

    const { photo, city } = mountComposable()
    await flushPromises()

    expect(city.value).toBe('Rome')
    expect(photo.value).toEqual(storedData.photo)
  })

  it('handles corrupted localStorage JSON safely', async () => {
    localStorageMock['unsplashPhoto'] = '{bad json'

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { photo, city } = mountComposable()
    await flushPromises()

    expect(photo.value).toBeNull()
    expect(city.value).toBe('')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})