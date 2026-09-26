import { describe, expect, it } from 'vitest'
import { capturedPokemonSchema } from '../server/utils/collection-schema'

const validCapture = {
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

describe('captured Pokémon API validation', () => {
  it('accepts a valid capture payload', () => {
    expect(capturedPokemonSchema.parse(validCapture)).toEqual(validCapture)
  })

  it('requires a shiny image for Grass Pokémon', () => {
    const { shinyImage: _shinyImage, ...withoutShinyImage } = validCapture
    expect(capturedPokemonSchema.safeParse(withoutShinyImage).success).toBe(false)
  })

  it('rejects a shiny image for a non-Grass Pokémon', () => {
    expect(capturedPokemonSchema.safeParse({
      ...validCapture,
      name: 'squirtle',
      types: ['water'],
    }).success).toBe(false)
  })

  it('rejects names and URLs outside the expected format', () => {
    expect(capturedPokemonSchema.safeParse({
      ...validCapture,
      name: '../bulbasaur',
      image: 'javascript:alert(1)',
    }).success).toBe(false)
  })
})
