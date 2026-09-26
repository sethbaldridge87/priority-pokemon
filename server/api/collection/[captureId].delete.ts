import { releaseCapturedPokemon } from '#server/utils/collection-repository'
import { getVisitorId } from '#server/utils/visitor'

export default defineEventHandler((event) => {
  const captureIdParam = getRouterParam(event, 'captureId') ?? ''

  if (!/^\d+$/.test(captureIdParam)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid capture ID.' })
  }

  const wasReleased = releaseCapturedPokemon(getVisitorId(event), Number(captureIdParam))

  if (!wasReleased) {
    throw createError({ statusCode: 404, statusMessage: 'Captured Pokémon not found.' })
  }

  setResponseStatus(event, 204)
  return null
})
