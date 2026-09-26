import { ZodError } from 'zod'
import { addCapturedPokemon } from '#server/utils/collection-repository'
import { parseCapturedPokemon } from '#server/utils/collection-schema'
import { getVisitorId } from '#server/utils/visitor'

export default defineEventHandler(async (event) => {
  try {
    const pokemon = parseCapturedPokemon(await readBody(event))
    const capturedPokemon = addCapturedPokemon(getVisitorId(event), pokemon)

    setResponseStatus(event, 201)
    return capturedPokemon
  }
  catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid captured Pokémon data.',
        data: error.issues,
      })
    }

    throw error
  }
})
