<script setup lang="ts">
import type { CapturedPokemon, PokemonCardDetails } from '#shared/types/pokemon'
import { formatPokemonName } from '#shared/utils/pokemon'

useSeoMeta({
  title: 'My Collection',
  description: 'Review the Pokémon you have caught and manage your personal collection.',
})

const {
  pokemonCollection,
  status,
  loadError,
  removePokemon,
} = usePokemonCollection()

const selectedPokemon = ref<CapturedPokemon | null>(null)
const detailsOpen = ref(false)
const confirmationOpen = ref(false)
const isReleasing = ref(false)
const releaseError = ref('')

function cardDetails(pokemon: CapturedPokemon): PokemonCardDetails {
  return {
    id: pokemon.pokemonId,
    name: pokemon.name,
    image: pokemon.image,
  }
}

function showPokemon(pokemon: CapturedPokemon): void {
  selectedPokemon.value = pokemon
  detailsOpen.value = true
  confirmationOpen.value = false
  releaseError.value = ''
}

function closeDetails(): void {
  detailsOpen.value = false
  confirmationOpen.value = false
  releaseError.value = ''
  selectedPokemon.value = null
}

function releasePokemon(): void {
  if (!selectedPokemon.value || isReleasing.value) return

  isReleasing.value = true
  releaseError.value = ''

  try {
    removePokemon(selectedPokemon.value.captureId)
    closeDetails()
  }
  catch {
    releaseError.value = `We couldn't release ${formatPokemonName(selectedPokemon.value.name)}. Please try again.`
  }
  finally {
    isReleasing.value = false
  }
}
</script>

<template>
  <div class="collection-page">
    <section class="collection-hero">
      <div class="shell collection-hero__inner">
        <div>
          <p class="eyebrow eyebrow--light">Trainer’s archive</p>
          <h1>My Collection</h1>
          <p>Every great team starts with a first catch. Your Pokémon are safely kept right here.</p>
        </div>
        <div class="collection-count" aria-live="polite">
          <strong>{{ pokemonCollection.length }}</strong>
          <span>{{ pokemonCollection.length === 1 ? 'Pokémon caught' : 'Pokémon caught' }}</span>
        </div>
      </div>
    </section>

    <section class="page-section shell" aria-labelledby="collection-title">
      <div class="section-heading section-heading--collection">
        <div>
          <p class="eyebrow">Your team</p>
          <h2 id="collection-title">Caught Pokémon</h2>
        </div>
        <NuxtLink class="text-link" to="/">Catch more <span aria-hidden="true">→</span></NuxtLink>
      </div>

      <div v-if="status === 'idle'" class="initial-loader" role="status">
        <span class="pokeball-loader" aria-hidden="true" />
        <p>Checking your Poké Balls…</p>
      </div>

      <div v-else-if="loadError" class="empty-state empty-state--error" role="alert">
        <span class="empty-state__icon" aria-hidden="true">!</span>
        <h2>We couldn’t open your collection.</h2>
        <p>Please refresh the page and try again.</p>
      </div>

      <div v-else-if="pokemonCollection.length" class="pokemon-grid">
        <PokemonCard
          v-for="pokemon in pokemonCollection"
          :key="pokemon.captureId"
          :name="pokemon.name"
          :details="cardDetails(pokemon)"
          mode="collection"
          @select="showPokemon(pokemon)"
        />
      </div>

      <div v-else class="empty-state">
        <span class="empty-state__pokeball" aria-hidden="true" />
        <p class="eyebrow">Your collection is empty</p>
        <h2>Oops! You don’t have any Pokémon to view here! Go catch some right now!</h2>
        <NuxtLink class="button button--primary" to="/">Explore the Pokédex</NuxtLink>
      </div>
    </section>

    <AppModal
      v-if="selectedPokemon"
      :model-value="detailsOpen"
      :title="formatPokemonName(selectedPokemon.name)"
      labelled-by="pokemon-details-title"
      :inert="confirmationOpen"
      @update:model-value="value => value ? detailsOpen = true : closeDetails()"
    >
      <div class="captured-details">
        <div class="captured-details__image">
          <img :src="selectedPokemon.image" :alt="formatPokemonName(selectedPokemon.name)" width="240" height="240">
        </div>

        <div class="captured-details__content">
          <div class="type-list">
            <TypeBadge v-for="type in selectedPokemon.types" :key="type" :type="type" />
          </div>

          <dl class="modal-stats">
            <div><dt>Pokédex ID</dt><dd>#{{ String(selectedPokemon.pokemonId).padStart(4, '0') }}</dd></div>
            <div><dt>Height</dt><dd>{{ selectedPokemon.height }} dm</dd></div>
            <div><dt>Weight</dt><dd>{{ selectedPokemon.weight }} hg</dd></div>
            <div><dt>Caught</dt><dd>{{ selectedPokemon.dayCaught }} at {{ selectedPokemon.timeCaught }}</dd></div>
          </dl>

          <div class="modal-abilities">
            <h3>Abilities</h3>
            <ul>
              <li v-for="ability in selectedPokemon.abilities" :key="ability">{{ formatPokemonName(ability) }}</li>
            </ul>
          </div>

          <a
            v-if="selectedPokemon.shinyImage"
            class="shiny-preview"
            :href="selectedPokemon.shinyImage"
            target="_blank"
            rel="noreferrer"
          >
            View shiny image <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <template #footer>
        <button class="button button--secondary" type="button" @click="closeDetails">Close</button>
        <button class="button button--danger" type="button" @click="confirmationOpen = true">Release</button>
      </template>
    </AppModal>

    <AppModal
      v-if="selectedPokemon"
      v-model="confirmationOpen"
      :title="`Release ${formatPokemonName(selectedPokemon.name)}?`"
      labelled-by="release-confirmation-title"
      :close-on-backdrop="false"
    >
      <div class="confirmation-copy">
        <span class="confirmation-copy__icon" aria-hidden="true">?</span>
        <p>Are you sure you want to release this Pokémon?</p>
        <p>This will permanently remove it from your collection.</p>
        <p v-if="releaseError" class="action-message action-message--error" role="alert">{{ releaseError }}</p>
      </div>

      <template #footer>
        <button class="button button--secondary" type="button" :disabled="isReleasing" @click="confirmationOpen = false">No</button>
        <button class="button button--danger" type="button" :disabled="isReleasing" @click="releasePokemon">
          {{ isReleasing ? 'Releasing…' : 'Yes' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>
