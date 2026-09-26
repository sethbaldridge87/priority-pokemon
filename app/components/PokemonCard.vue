<script setup lang="ts">
import type { PokeApiPokemon, PokemonCardDetails } from '#shared/types/pokemon'
import { formatPokemonName, POKE_API_BASE_URL } from '#shared/utils/pokemon'

const props = withDefaults(defineProps<{
  name: string
  details?: PokemonCardDetails
  mode?: 'browse' | 'collection'
  isCollected?: boolean
}>(), {
  details: undefined,
  mode: 'browse',
  isCollected: false,
})

const emit = defineEmits<{
  select: []
}>()

const endpoint = computed(() => `${POKE_API_BASE_URL}/pokemon/${encodeURIComponent(props.name)}`)
const { data: fetchedPokemon, status, error } = useLazyFetch<PokeApiPokemon>(endpoint, {
  key: `pokemon-card-${props.name}`,
  immediate: !props.details,
  server: false,
})

const cardDetails = computed<PokemonCardDetails | null>(() => {
  if (props.details) {
    return props.details
  }

  if (!fetchedPokemon.value) {
    return null
  }

  return {
    id: fetchedPokemon.value.id,
    name: fetchedPokemon.value.name,
    image: fetchedPokemon.value.sprites.other.home.front_default,
  }
})

const isLoading = computed(() => !props.details && (status.value === 'idle' || status.value === 'pending'))

function selectCard(): void {
  if (props.mode === 'collection') {
    emit('select')
  }
}
</script>

<template>
  <article class="pokemon-card" :aria-busy="isLoading">
    <NuxtLink
      v-if="mode === 'browse'"
      class="pokemon-card__surface"
      :to="`/pokedex/${name}`"
      :aria-label="isCollected
        ? `View ${formatPokemonName(name)}'s Pokédex entry; already in your collection`
        : `View ${formatPokemonName(name)}'s Pokédex entry`"
    >
      <span v-if="isCollected" class="pokemon-card__collected" aria-hidden="true">✓</span>
      <div class="pokemon-card__image-wrap">
        <span v-if="isLoading" class="pokemon-card__skeleton" aria-hidden="true" />
        <img
          v-else-if="cardDetails?.image"
          class="pokemon-card__image"
          :src="cardDetails.image"
          :alt="formatPokemonName(name)"
          width="240"
          height="240"
          loading="lazy"
        >
        <span v-else class="pokemon-card__fallback" aria-hidden="true">?</span>
      </div>
      <div class="pokemon-card__copy">
        <span class="pokemon-card__number">
          {{ cardDetails ? `#${String(cardDetails.id).padStart(4, '0')}` : error ? 'Unavailable' : 'Loading…' }}
        </span>
        <h2>{{ formatPokemonName(name) }}</h2>
        <span class="pokemon-card__cta">View entry <span aria-hidden="true">→</span></span>
      </div>
    </NuxtLink>

    <button
      v-else
      class="pokemon-card__surface pokemon-card__button"
      type="button"
      :aria-label="`View captured ${formatPokemonName(name)}`"
      @click="selectCard"
    >
      <div class="pokemon-card__image-wrap">
        <img
          v-if="cardDetails?.image"
          class="pokemon-card__image"
          :src="cardDetails.image"
          :alt="formatPokemonName(name)"
          width="240"
          height="240"
          loading="lazy"
        >
        <span v-else class="pokemon-card__fallback" aria-hidden="true">?</span>
      </div>
      <div class="pokemon-card__copy">
        <span class="pokemon-card__number">#{{ String(cardDetails?.id ?? 0).padStart(4, '0') }}</span>
        <h2>{{ formatPokemonName(name) }}</h2>
        <span class="pokemon-card__cta">View capture <span aria-hidden="true">→</span></span>
      </div>
    </button>
  </article>
</template>
