<script setup lang="ts">
import type { NamedApiResource, PokemonListResponse } from '#shared/types/pokemon'
import { POKE_API_BASE_URL } from '#shared/utils/pokemon'

useSeoMeta({
  title: 'Explore the Pokédex',
  description: 'Browse Pokémon from PokéAPI and open any card to see its complete entry.',
})

const PAGE_SIZE = 50
const pokemon = useState<NamedApiResource[]>('pokemon-list', () => [])
const totalPokemon = useState<number | null>('pokemon-total', () => null)
const isLoading = ref(false)
const loadError = ref('')
const { pokemonCollection } = usePokemonCollection()

const hasMorePokemon = computed(() => (
  totalPokemon.value === null || pokemon.value.length < totalPokemon.value
))
const collectedPokemonNames = computed(() => (
  new Set(pokemonCollection.value.map(entry => entry.name))
))

async function loadMorePokemon(): Promise<void> {
  if (isLoading.value || !hasMorePokemon.value) return

  isLoading.value = true
  loadError.value = ''

  try {
    const response = await $fetch<PokemonListResponse>(`${POKE_API_BASE_URL}/pokemon`, {
      query: {
        limit: PAGE_SIZE,
        offset: pokemon.value.length,
      },
    })

    const knownNames = new Set(pokemon.value.map(entry => entry.name))
    pokemon.value.push(...response.results.filter(entry => !knownNames.has(entry.name)))
    totalPokemon.value = response.count
  }
  catch {
    loadError.value = 'We could not reach the Pokédex. Please try again.'
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (pokemon.value.length === 0) void loadMorePokemon()
})
</script>

<template>
  <div>
    <section class="hero hero--home">
      <div class="hero__orb hero__orb--one" aria-hidden="true" />
      <div class="hero__orb hero__orb--two" aria-hidden="true" />
      <div class="shell hero__content">
        <p class="eyebrow eyebrow--light">Gotta browse ’em all</p>
        <h1>Your next favorite<br><em>Pokémon</em> is here.</h1>
        <p class="hero__lede">Explore the Pokédex, learn what makes every Pokémon unique, and catch the ones that belong on your team.</p>
        <a class="button button--light" href="#pokemon-grid">Start exploring <span aria-hidden="true">↓</span></a>
      </div>
    </section>

    <section class="page-section shell" aria-labelledby="browse-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">National Pokédex</p>
          <h2 id="browse-title">Meet the Pokémon</h2>
          <p class="collection-status-note">* A green checkmark indicates a Pokémon already in your collection.</p>
        </div>
        <p v-if="pokemon.length" class="result-count" aria-live="polite">
          Showing {{ pokemon.length }}{{ totalPokemon ? ` of ${totalPokemon}` : '' }}
        </p>
      </div>

      <div v-if="pokemon.length" id="pokemon-grid" class="pokemon-grid">
        <PokemonCard
          v-for="entry in pokemon"
          :key="entry.name"
          :name="entry.name"
          :is-collected="collectedPokemonNames.has(entry.name)"
        />
      </div>

      <div v-else-if="isLoading" class="initial-loader" role="status">
        <span class="pokeball-loader" aria-hidden="true" />
        <p>Opening the Pokédex…</p>
      </div>

      <div v-else-if="loadError" class="empty-state empty-state--error" role="alert">
        <span class="empty-state__icon" aria-hidden="true">!</span>
        <h2>Something interrupted our search.</h2>
        <p>{{ loadError }}</p>
      </div>

      <p v-if="loadError && pokemon.length" class="inline-error" role="alert">{{ loadError }}</p>

      <div class="load-more">
        <button
          v-if="hasMorePokemon"
          class="button button--primary"
          type="button"
          :disabled="isLoading"
          @click="loadMorePokemon"
        >
          <span v-if="isLoading" class="button-spinner" aria-hidden="true" />
          {{ isLoading ? 'Loading Pokémon…' : pokemon.length ? 'Load 50 more' : 'Try again' }}
        </button>
        <p v-else class="all-loaded">You’ve reached the end of the Pokédex.</p>
      </div>
    </section>
  </div>
</template>
