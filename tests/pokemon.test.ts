import { describe, expect, it } from 'vitest'
import type { PokeApiPokemon } from '../shared/types/pokemon'
import {
  createCapturedPokemon,
  formatCaptureDate,
  formatCaptureTime,
  formatPokemonName,
  getPokemonTypeColor,
  hasPokemonType,
} from '../shared/utils/pokemon'

function makePokemon(overrides: Partial<PokeApiPokemon> = {}): PokeApiPokemon {
  return {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    abilities: [
      {
        ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
        is_hidden: false,
        slot: 1,
      },
      {
        ability: { name: 'chlorophyll', url: 'https://pokeapi.co/api/v2/ability/34/' },
        is_hidden: true,
        slot: 3,
      },
    ],
    types: [
      { slot: 1, type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' } },
      { slot: 2, type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' } },
    ],
    sprites: {
      other: {
        home: {
          front_default: 'https://example.com/1.png',
          front_shiny: 'https://example.com/shiny/1.png',
        },
      },
    },
    ...overrides,
  }
}

describe('Pokémon presentation helpers', () => {
  it('formats hyphenated API names for people', () => {
    expect(formatPokemonName('mr-mime')).toBe('Mr Mime')
  })

  it('matches types case-insensitively', () => {
    expect(hasPokemonType(makePokemon(), 'Grass')).toBe(true)
    expect(hasPokemonType(makePokemon(), 'fire')).toBe(false)
  })

  it('returns a safe fallback color for unknown types', () => {
    expect(getPokemonTypeColor('fire')).toBe('#e24a3b')
    expect(getPokemonTypeColor('cosmic')).toBe('#596274')
  })
})

describe('capture creation', () => {
  const caughtAt = new Date(2026, 8, 25, 15, 49)

  it('formats the local date and time required by the collection', () => {
    expect(formatCaptureDate(caughtAt)).toBe('9.25.2026')
    expect(formatCaptureTime(caughtAt)).toBe('3:49PM')
  })

  it('includes the shiny image for Grass Pokémon', () => {
    expect(createCapturedPokemon(makePokemon(), caughtAt)).toEqual({
      pokemonId: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      abilities: ['overgrow', 'chlorophyll'],
      types: ['grass', 'poison'],
      dayCaught: '9.25.2026',
      timeCaught: '3:49PM',
      image: 'https://example.com/1.png',
      shinyImage: 'https://example.com/shiny/1.png',
    })
  })

  it('omits the shiny image for non-Grass Pokémon', () => {
    const squirtle = makePokemon({
      id: 7,
      name: 'squirtle',
      types: [{ slot: 1, type: { name: 'water', url: 'https://pokeapi.co/api/v2/type/11/' } }],
    })

    expect(createCapturedPokemon(squirtle, caughtAt)).not.toHaveProperty('shinyImage')
  })

  it('refuses to create a capture without a display image', () => {
    const missingImage = makePokemon({
      sprites: { other: { home: { front_default: null, front_shiny: null } } },
    })

    expect(() => createCapturedPokemon(missingImage, caughtAt)).toThrow('available image')
  })
})
