export default defineNuxtConfig({
  compatibilityDate: '2026-09-25',
  devtools: { enabled: true },
  ssr: false,

  css: ['~/assets/css/main.scss'],

  app: {
    head: {
      titleTemplate: '%s · Priority Pokémon',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#ef4444' },
        {
          name: 'description',
          content: 'Browse the Pokédex, discover Pokémon, and build your own collection.',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
})
