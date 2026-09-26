<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="site-frame">
    <a class="skip-link" href="#main-content">Skip to content</a>

    <header class="site-header">
      <div class="shell site-header__inner">
        <NuxtLink class="brand" to="/" aria-label="Priority Pokémon home">
          <span class="brand__mark" aria-hidden="true"><span /></span>
          <span>Priority <strong>Pokémon</strong></span>
        </NuxtLink>

        <nav aria-label="Main navigation">
          <ul class="site-nav">
            <li><NuxtLink to="/">Pokédex</NuxtLink></li>
            <li><NuxtLink to="/collection">My Collection</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="main-content" class="site-main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="shell site-footer__inner">
        <p>Built for trainers everywhere.</p>
        <p>Pokémon data provided by <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>.</p>
        <p>© {{ currentYear }} Priority Pokémon</p>
      </div>
    </footer>
  </div>
</template>
