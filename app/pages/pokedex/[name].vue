<script setup lang="ts">
import type { PokeApiPokemon } from '#shared/types/pokemon'
import {
  createCapturedPokemon,
  formatPokemonName,
  hasPokemonType,
  POKE_API_BASE_URL,
} from '#shared/utils/pokemon'

const route = useRoute()
const pokemonName = computed(() => String(route.params.name ?? '').toLowerCase())
const endpoint = computed(() => `${POKE_API_BASE_URL}/pokemon/${encodeURIComponent(pokemonName.value)}`)
const { data: pokemon, status, error } = useFetch<PokeApiPokemon>(endpoint, {
  server: false,
})

const showShiny = ref(false)
const isCatching = ref(false)
const catchMessage = ref('')
const catchError = ref('')
const { addPokemon, hasPokemon } = usePokemonCollection()

const formattedName = computed(() => formatPokemonName(pokemon.value?.name ?? pokemonName.value))
const isAlreadyInCollection = computed(() => pokemon.value ? hasPokemon(pokemon.value.id) : false)
const isGrassType = computed(() => pokemon.value ? hasPokemonType(pokemon.value, 'grass') : false)
const canShowShiny = computed(() => Boolean(isGrassType.value && pokemon.value?.sprites.other.home.front_shiny))
const displayedImage = computed(() => {
  if (!pokemon.value) return null
  return showShiny.value
    ? pokemon.value.sprites.other.home.front_shiny
    : pokemon.value.sprites.other.home.front_default
})

watch(pokemonName, () => {
  showShiny.value = false
  catchMessage.value = ''
  catchError.value = ''
})

useSeoMeta({
  title: () => pokemon.value ? `${formattedName.value} Pokédex Entry` : 'Pokédex Entry',
  description: () => pokemon.value
    ? `View ${formattedName.value}'s abilities, types, height, weight, and add it to your collection.`
    : 'View a detailed Pokémon entry.',
})

function catchPokemon(): void {
  if (!pokemon.value || isCatching.value || isAlreadyInCollection.value) return

  isCatching.value = true
  catchMessage.value = ''
  catchError.value = ''

  try {
    const capturedPokemon = createCapturedPokemon(pokemon.value)
    addPokemon(capturedPokemon)
    catchMessage.value = `${formattedName.value} was added to your collection!`
  }
  catch {
    catchError.value = `We couldn't catch ${formattedName.value}. Please try again.`
  }
  finally {
    isCatching.value = false
  }
}
</script>

<template>
  <div class="entry-page">
    <div v-if="status === 'pending' || status === 'idle'" class="entry-loading" role="status">
      <span class="pokeball-loader" aria-hidden="true" />
      <p>Tracking down {{ formatPokemonName(pokemonName) }}…</p>
    </div>

    <section v-else-if="pokemon" class="entry-hero">
      <div class="entry-hero__wash" aria-hidden="true" />
      <div class="shell entry-hero__inner">
        <NuxtLink class="back-link" to="/"><span aria-hidden="true">←</span> Back to Pokédex</NuxtLink>

        <div class="entry-layout">
          <div class="entry-art">
            <span class="entry-art__number" aria-hidden="true">#{{ String(pokemon.id).padStart(4, '0') }}</span>
            <div class="entry-art__circle" aria-hidden="true" />
            <img
              v-if="displayedImage"
              :key="displayedImage"
              class="entry-art__image"
              :src="displayedImage"
              :alt="showShiny ? `Shiny ${formattedName}` : formattedName"
              width="475"
              height="475"
            >
            <div v-else class="entry-art__missing">Image unavailable</div>
          </div>

          <div class="entry-details">
            <p class="entry-details__number">Pokédex #{{ String(pokemon.id).padStart(4, '0') }}</p>
            <h1>{{ formattedName }}</h1>

            <div class="type-list" aria-label="Pokémon types">
              <TypeBadge v-for="entry in pokemon.types" :key="entry.type.name" :type="entry.type.name" />
            </div>

            <dl class="stat-grid">
              <div>
                <dt>Height</dt>
                <dd>{{ (pokemon.height / 10).toFixed(1) }} m <small>{{ pokemon.height }} dm</small></dd>
              </div>
              <div>
                <dt>Weight</dt>
                <dd>{{ (pokemon.weight / 10).toFixed(1) }} kg <small>{{ pokemon.weight }} hg</small></dd>
              </div>
            </dl>

            <div class="abilities">
              <p class="detail-label">Abilities</p>
              <ul>
                <li v-for="ability in pokemon.abilities" :key="ability.ability.name">
                  {{ formatPokemonName(ability.ability.name) }}
                </li>
              </ul>
            </div>

            <div v-if="canShowShiny" class="shiny-toggle">
              <div>
                <strong>Shiny form</strong>
                <span>Switch this Grass-type Pokémon’s appearance.</span>
              </div>
              <button
                class="toggle"
                type="button"
                role="switch"
                :aria-checked="showShiny"
                :aria-label="`${showShiny ? 'Hide' : 'Show'} shiny ${formattedName}`"
                @click="showShiny = !showShiny"
              >
                <span />
              </button>
            </div>

            <button
              class="button button--catch"
              type="button"
              :disabled="isCatching || isAlreadyInCollection"
              @click="catchPokemon"
            >
              {{ isAlreadyInCollection ? 'Already in Collection' : isCatching ? 'Catching…' : `Catch ${formattedName}` }}
            </button>
            <p v-if="catchMessage" class="action-message action-message--success" role="status">{{ catchMessage }}</p>
            <p v-if="catchError" class="action-message action-message--error" role="alert">{{ catchError }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="shell not-found" role="alert">
      <span class="not-found__number">404</span>
      <p class="eyebrow">Pokémon not found</p>
      <h1>That trail went cold.</h1>
      <p>{{ error?.statusMessage ?? `We couldn't find “${formatPokemonName(pokemonName)}” in the Pokédex.` }}</p>
      <NuxtLink class="button button--primary" to="/">Return to the Pokédex</NuxtLink>
    </section>
  </div>
</template>
