# Priority Pokémon

A Pokémon-themed single-page application built with Nuxt 4, Vue, TypeScript, PokéAPI, and browser local storage. Visitors can browse the Pokédex in batches of 50, view detailed entries, catch Pokémon, and manage a private browser-specific collection without creating an account.

## Why browser local storage?

The collection belongs to one browser rather than a signed-in account, so it does not require a server database. Captures are validated and saved directly in local storage, which keeps the application simple and compatible with Vercel's ephemeral serverless filesystem.

## Getting started

Requirements: Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev        # development server
npm run test       # unit tests
npm run typecheck  # Nuxt and TypeScript checks
npm run build      # production Node build
npm run preview    # preview the production build
```

## Architecture

- `app/pages/index.vue` loads 50 Pokémon at a time and preserves already loaded results in Nuxt state.
- `app/components/PokemonCard.vue` receives the Pokémon name and loads that Pokémon’s ID and Home sprite.
- `app/pages/pokedex/[name].vue` renders detailed slug pages and builds the captured Pokémon payload.
- `app/composables/usePokemonCollection.ts` exposes reactive collection state and collection actions.
- `app/utils/collection-storage.ts` owns local-storage reads and writes.
- `shared/schemas/collection.ts` validates captured and persisted Pokémon data.
- `shared/` contains types, schemas, and pure utilities used throughout the application.

The collection is stored under a versioned local-storage key. Each Pokémon can be caught only once, and every capture receives a UUID so a visitor can release that specific catch. Changes made in another open tab are synchronized through the browser's storage event.

Collections are isolated by browser profile and site origin. Clearing site data removes the collection, and Vercel preview URLs do not share collections with the production URL or with one another.

## Deployment

Vercel detects Nuxt automatically. Use the default `npm run build` command; the collection does not require environment variables, server routes, or persistent server storage.

## Data source

Pokémon data and artwork are loaded from [PokéAPI](https://pokeapi.co/). Pokémon is a trademark of Nintendo, Game Freak, and Creatures; this project is not affiliated with or endorsed by them.
