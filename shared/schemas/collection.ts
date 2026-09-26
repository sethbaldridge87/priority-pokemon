import { z } from 'zod'

const pokemonName = z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/)
const pokemonAttributeList = z.array(pokemonName).min(1).max(20)
const imageUrl = z.string().url().refine(url => url.startsWith('https://'), {
  message: 'Image URLs must use HTTPS.',
})

const capturedPokemonFields = {
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
}

function validateShinyImage(
  pokemon: { types: string[], shinyImage?: string },
  context: z.RefinementCtx,
): void {
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
}

export const newCapturedPokemonSchema = z
  .object(capturedPokemonFields)
  .strict()
  .superRefine(validateShinyImage)

export const capturedPokemonSchema = z
  .object({
    captureId: z.string().uuid(),
    ...capturedPokemonFields,
  })
  .strict()
  .superRefine(validateShinyImage)

export const storedPokemonCollectionSchema = z
  .object({
    version: z.literal(1),
    pokemonCollection: z.array(capturedPokemonSchema),
  })
  .strict()
