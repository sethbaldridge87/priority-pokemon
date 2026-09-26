import type { NewCapturedPokemon, PokeApiPokemon } from '../types/pokemon'

export const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2'

export const POKEMON_TYPE_COLORS: Readonly<Record<string, string>> = {
  normal: '#8a8d98',
  fire: '#e24a3b',
  water: '#3978d4',
  electric: '#e3b526',
  grass: '#4d9f45',
  ice: '#42a9b8',
  fighting: '#b73c45',
  poison: '#8e4ca2',
  ground: '#b9783b',
  flying: '#7667bd',
  psychic: '#d64d78',
  bug: '#77962f',
  rock: '#8f7948',
  ghost: '#5f568c',
  dragon: '#6047c5',
  dark: '#4d4650',
  steel: '#667b8d',
  fairy: '#c95f95',
}

export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getPokemonTypeColor(type: string): string {
  return POKEMON_TYPE_COLORS[type.toLowerCase()] ?? '#596274'
}

export function hasPokemonType(pokemon: Pick<PokeApiPokemon, 'types'>, type: string): boolean {
  return pokemon.types.some(entry => entry.type.name.toLowerCase() === type.toLowerCase())
}

export function formatCaptureDate(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}`
}

export function formatCaptureTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .replace(/\s/g, '')
}

export function createCapturedPokemon(
  pokemon: PokeApiPokemon,
  caughtAt = new Date(),
): NewCapturedPokemon {
  const image = pokemon.sprites.other.home.front_default

  if (!image) {
    throw new Error('This Pokémon does not have an available image.')
  }

  const capturedPokemon: NewCapturedPokemon = {
    pokemonId: pokemon.id,
    name: pokemon.name,
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities.map(entry => entry.ability.name),
    types: pokemon.types.map(entry => entry.type.name),
    dayCaught: formatCaptureDate(caughtAt),
    timeCaught: formatCaptureTime(caughtAt),
    image,
  }

  const shinyImage = pokemon.sprites.other.home.front_shiny
  if (hasPokemonType(pokemon, 'grass') && shinyImage) {
    capturedPokemon.shinyImage = shinyImage
  }

  return capturedPokemon
}
