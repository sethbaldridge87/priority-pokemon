import { listCapturedPokemon } from '#server/utils/collection-repository'
import { getVisitorId } from '#server/utils/visitor'
import type { CollectionResponse } from '#shared/types/pokemon'

export default defineEventHandler((event): CollectionResponse => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  return {
    pokemonCollection: listCapturedPokemon(getVisitorId(event)),
  }
})
