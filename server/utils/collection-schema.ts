import { z } from 'zod'
import type { NewCapturedPokemon } from '#shared/types/pokemon'

const pokemonName = z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/)
const pokemonAttributeList = z.array(pokemonName).min(1).max(20)
const imageUrl = z.string().url().refine(url => url.startsWith('https://'), {
  message: 'Image URLs must use HTTPS.',
})

export const capturedPokemonSchema = z
  .object({
    pokemonId: z.number().int().positive().max(1_000_000),
    name: pokemonName,
    height: z.number().int().nonnegative().max(100_000),
    weight: z.number().int().nonnegative().max(100_000_000),
    abilities: pokemonAttributeList,
    types: pokemonAttributeList,
    dayCaught: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/),
    timeCaught: z.string().regex(/^\d{1,2}:\d{2}(?:AM|PM)$/),
    image: imageUrl,
    shinyImage: imageUrl.optional(),
  })
  .superRefine((pokemon, context) => {
    const isGrassType = pokemon.types.includes('grass')

    if (isGrassType && !pokemon.shinyImage) {
      context.addIssue({
        code: 'custom',
        path: ['shinyImage'],
        message: 'Grass Pokémon must include a shiny image.',
      })
    }

    if (!isGrassType && pokemon.shinyImage) {
      context.addIssue({
        code: 'custom',
        path: ['shinyImage'],
        message: 'Only Grass Pokémon may include a shiny image.',
      })
    }
  })

export function parseCapturedPokemon(value: unknown): NewCapturedPokemon {
  return capturedPokemonSchema.parse(value)
}
