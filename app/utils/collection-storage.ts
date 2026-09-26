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

export function isPokemonInCollection(
  pokemonCollection: readonly CapturedPokemon[],
  pokemonId: number,
): boolean {
  return pokemonCollection.some(pokemon => pokemon.pokemonId === pokemonId)
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
  const validatedPokemon = newCapturedPokemonSchema.parse(pokemon)
  const currentCollection = readPokemonCollection(storage)

  if (isPokemonInCollection(currentCollection, validatedPokemon.pokemonId)) {
    throw new Error('Pokémon is already in the collection.')
  }

  const capturedPokemon = capturedPokemonSchema.parse({
    captureId,
    ...validatedPokemon,
  })
  const pokemonCollection = [
    capturedPokemon,
    ...currentCollection,
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
