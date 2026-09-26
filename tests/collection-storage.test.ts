import { describe, expect, it } from 'vitest'
import type { NewCapturedPokemon } from '../shared/types/pokemon'
import { newCapturedPokemonSchema } from '../shared/schemas/collection'
import {
  addPokemonToCollection,
  COLLECTION_STORAGE_KEY,
  readPokemonCollection,
  removePokemonFromCollection,
} from '../app/utils/collection-storage'

const BULBASAUR_CAPTURE_ID = '11111111-1111-4111-8111-111111111111'
const SECOND_CAPTURE_ID = '22222222-2222-4222-8222-222222222222'

const validCapture: NewCapturedPokemon = {
  pokemonId: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  abilities: ['overgrow'],
  types: ['grass', 'poison'],
  dayCaught: '9.25.2026',
  timeCaught: '3:49PM',
  image: 'https://example.com/1.png',
  shinyImage: 'https://example.com/shiny/1.png',
}

class MemoryStorage {
  private readonly values = new Map<string, string>()
  failWrites = false

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) {
      throw new Error('Storage quota exceeded.')
    }

    this.values.set(key, value)
  }

  setRaw(value: string): void {
    this.values.set(COLLECTION_STORAGE_KEY, value)
  }

  getRaw(): string | null {
    return this.getItem(COLLECTION_STORAGE_KEY)
  }
}

describe('captured Pokémon validation', () => {
  it('accepts a valid capture payload', () => {
    expect(newCapturedPokemonSchema.parse(validCapture)).toEqual(validCapture)
  })

  it('requires a shiny image for Grass Pokémon', () => {
    const { shinyImage: _shinyImage, ...withoutShinyImage } = validCapture
    expect(newCapturedPokemonSchema.safeParse(withoutShinyImage).success).toBe(false)
  })

  it('rejects a shiny image for a non-Grass Pokémon', () => {
    expect(newCapturedPokemonSchema.safeParse({
      ...validCapture,
      name: 'squirtle',
      types: ['water'],
    }).success).toBe(false)
  })

  it('rejects names and URLs outside the expected format', () => {
    expect(newCapturedPokemonSchema.safeParse({
      ...validCapture,
      name: '../bulbasaur',
      image: 'javascript:alert(1)',
    }).success).toBe(false)
  })
})

describe('browser collection storage', () => {
  it('returns an empty collection when nothing has been captured', () => {
    expect(readPokemonCollection(new MemoryStorage())).toEqual([])
  })

  it('persists duplicate catches with unique IDs and newest first', () => {
    const storage = new MemoryStorage()
    const first = addPokemonToCollection(storage, validCapture, BULBASAUR_CAPTURE_ID)
    const second = addPokemonToCollection(storage, validCapture, SECOND_CAPTURE_ID)

    expect(first.capturedPokemon.captureId).toBe(BULBASAUR_CAPTURE_ID)
    expect(second.capturedPokemon.captureId).toBe(SECOND_CAPTURE_ID)
    expect(readPokemonCollection(storage).map(pokemon => pokemon.captureId)).toEqual([
      SECOND_CAPTURE_ID,
      BULBASAUR_CAPTURE_ID,
    ])
    expect(JSON.parse(storage.getRaw() ?? '{}')).toMatchObject({ version: 1 })
  })

  it('deletes only the selected capture', () => {
    const storage = new MemoryStorage()
    addPokemonToCollection(storage, validCapture, BULBASAUR_CAPTURE_ID)
    addPokemonToCollection(storage, validCapture, SECOND_CAPTURE_ID)

    const collection = removePokemonFromCollection(storage, BULBASAUR_CAPTURE_ID)

    expect(collection.map(pokemon => pokemon.captureId)).toEqual([SECOND_CAPTURE_ID])
    expect(readPokemonCollection(storage)).toEqual(collection)
  })

  it('does not rewrite storage when the selected capture is missing', () => {
    const storage = new MemoryStorage()
    addPokemonToCollection(storage, validCapture, BULBASAUR_CAPTURE_ID)
    const storedValue = storage.getRaw()

    expect(() => removePokemonFromCollection(storage, SECOND_CAPTURE_ID))
      .toThrow('Captured Pokémon not found.')
    expect(storage.getRaw()).toBe(storedValue)
  })

  it('rejects malformed JSON and unsupported storage versions', () => {
    const storage = new MemoryStorage()
    storage.setRaw('{not-json')
    expect(() => readPokemonCollection(storage)).toThrow()

    storage.setRaw(JSON.stringify({ version: 2, pokemonCollection: [] }))
    expect(() => readPokemonCollection(storage)).toThrow()
  })

  it('leaves the stored collection intact when a browser write fails', () => {
    const storage = new MemoryStorage()
    addPokemonToCollection(storage, validCapture, BULBASAUR_CAPTURE_ID)
    const storedValue = storage.getRaw()
    storage.failWrites = true

    expect(() => addPokemonToCollection(storage, validCapture, SECOND_CAPTURE_ID))
      .toThrow('Storage quota exceeded.')
    expect(storage.getRaw()).toBe(storedValue)
  })
})
