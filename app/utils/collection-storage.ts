import type { CapturedPokemon, NewCapturedPokemon } from '../../shared/types/pokemon'
import {
  capturedPokemonSchema,
  newCapturedPokemonSchema,
  storedPokemonCollectionSchema,
} from '../../shared/schemas/collection'

export const COLLECTION_STORAGE_KEY = 'priority-pokemon.collection.v1'
export const COLLECTION_STORAGE_VERSION = 1 as const

export interface CollectionStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function readPokemonCollection(storage: CollectionStorage): CapturedPokemon[] {
  const storedValue = storage.getItem(COLLECTION_STORAGE_KEY)

  if (storedValue === null) {
    return []
  }

  const parsedValue: unknown = JSON.parse(storedValue)
  return storedPokemonCollectionSchema.parse(parsedValue).pokemonCollection
}

export function writePokemonCollection(
  storage: CollectionStorage,
  pokemonCollection: CapturedPokemon[],
): void {
  const storedCollection = storedPokemonCollectionSchema.parse({
    version: COLLECTION_STORAGE_VERSION,
    pokemonCollection,
  })

  storage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(storedCollection))
}

export function addPokemonToCollection(
  storage: CollectionStorage,
  pokemon: NewCapturedPokemon,
  captureId: string,
): { capturedPokemon: CapturedPokemon, pokemonCollection: CapturedPokemon[] } {
  const capturedPokemon = capturedPokemonSchema.parse({
    captureId,
    ...newCapturedPokemonSchema.parse(pokemon),
  })
  const pokemonCollection = [
    capturedPokemon,
    ...readPokemonCollection(storage),
  ]

  writePokemonCollection(storage, pokemonCollection)

  return {
    capturedPokemon,
    pokemonCollection,
  }
}

export function removePokemonFromCollection(
  storage: CollectionStorage,
  captureId: string,
): CapturedPokemon[] {
  const currentCollection = readPokemonCollection(storage)
  const pokemonCollection = currentCollection.filter(pokemon => pokemon.captureId !== captureId)

  if (pokemonCollection.length === currentCollection.length) {
    throw new Error('Captured Pokémon not found.')
  }

  writePokemonCollection(storage, pokemonCollection)
  return pokemonCollection
}
