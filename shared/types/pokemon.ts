export interface NamedApiResource {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: NamedApiResource[]
}

export interface PokeApiPokemon {
  id: number
  name: string
  height: number
  weight: number
  abilities: Array<{
    ability: NamedApiResource
    is_hidden: boolean
    slot: number
  }>
  types: Array<{
    slot: number
    type: NamedApiResource
  }>
  sprites: {
    other: {
      home: {
        front_default: string | null
        front_shiny: string | null
      }
    }
  }
}

export interface PokemonCardDetails {
  id: number
  name: string
  image: string | null
}

export interface NewCapturedPokemon {
  pokemonId: number
  name: string
  height: number
  weight: number
  abilities: string[]
  types: string[]
  dayCaught: string
  timeCaught: string
  image: string
  shinyImage?: string
}

export interface CapturedPokemon extends NewCapturedPokemon {
  captureId: string
}
