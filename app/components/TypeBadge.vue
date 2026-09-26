<script setup lang="ts">
import { formatPokemonName, getPokemonTypeColor } from '#shared/utils/pokemon'

const props = defineProps<{
  type: string
}>()

const backgroundColor = computed(() => getPokemonTypeColor(props.type))
</script>

<template>
  <span class="type-badge" :style="{ backgroundColor }">
    {{ formatPokemonName(type) }}
  </span>
</template>
