import type { CapturedPokemon, NewCapturedPokemon } from '../../shared/types/pokemon'
import {
  addPokemonToCollection,
  COLLECTION_STORAGE_KEY,
  isPokemonInCollection,
  readPokemonCollection,
  removePokemonFromCollection,
} from '../utils/collection-storage'

type CollectionStatus = 'idle' | 'ready' | 'error'

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The browser collection could not be accessed.'
}

export function usePokemonCollection() {
  const pokemonCollection = useState<CapturedPokemon[]>('pokemon-collection', () => [])
  const status = useState<CollectionStatus>('pokemon-collection-status', () => 'idle')
  const loadError = useState<string | null>('pokemon-collection-load-error', () => null)

  function loadCollection(): void {
    if (!import.meta.client) return

    try {
      pokemonCollection.value = readPokemonCollection(window.localStorage)
      status.value = 'ready'
      loadError.value = null
    }
    catch (error) {
      pokemonCollection.value = []
      status.value = 'error'
      loadError.value = errorMessage(error)
    }
  }

  function addPokemon(pokemon: NewCapturedPokemon): CapturedPokemon {
    if (!import.meta.client) {
      throw new Error('The browser collection is only available on the client.')
    }

    const result = addPokemonToCollection(
      window.localStorage,
      pokemon,
      window.crypto.randomUUID(),
    )

    pokemonCollection.value = result.pokemonCollection
    status.value = 'ready'
    loadError.value = null
    return result.capturedPokemon
  }

  function hasPokemon(pokemonId: number): boolean {
    return isPokemonInCollection(pokemonCollection.value, pokemonId)
  }

  function removePokemon(captureId: string): void {
    if (!import.meta.client) {
      throw new Error('The browser collection is only available on the client.')
    }

    pokemonCollection.value = removePokemonFromCollection(window.localStorage, captureId)
    status.value = 'ready'
    loadError.value = null
  }

  function handleStorageChange(event: StorageEvent): void {
    if (event.storageArea === window.localStorage
      && (event.key === COLLECTION_STORAGE_KEY || event.key === null)) {
      loadCollection()
    }
  }

  onMounted(() => {
    loadCollection()
    window.addEventListener('storage', handleStorageChange)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
  })

  return {
    pokemonCollection: shallowReadonly(pokemonCollection),
    status: readonly(status),
    loadError: readonly(loadError),
    loadCollection,
    addPokemon,
    hasPokemon,
    removePokemon,
  }
}
