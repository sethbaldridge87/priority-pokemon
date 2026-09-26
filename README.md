# Priority Pokémon

A Pokémon-themed single-page application built with Nuxt 4, Vue, TypeScript, PokéAPI, and SQLite. Visitors can browse the Pokédex in batches of 50, view detailed entries, catch Pokémon, and manage a private browser-specific collection without creating an account.

## Why Nitro instead of Express?

Nuxt already includes Nitro, a production-ready Node.js server with file-based API routes. Adding Express would introduce a second server, a second router, proxy configuration, and duplicated development tooling. Nitro handles the three collection endpoints directly while preserving a single Nuxt build and deployment artifact.

## Getting started

Requirements: Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Optional environment configuration:

```bash
copy .env.example .env
```

`NUXT_DATABASE_PATH` can be an absolute path or a path relative to the project root. The default database is `data/priority-pokemon.sqlite`.

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
- `server/api/collection/` exposes `GET`, `POST`, and `DELETE` endpoints.
- `server/utils/collection-repository.ts` owns all SQLite access.
- `shared/` contains the types and pure utilities used by both the Vue app and server.

Each browser receives a random, HTTP-only visitor cookie. Collection rows are keyed by that anonymous ID in SQLite, giving each visitor an isolated collection without accounts or personal data. Clearing browser cookies starts a new anonymous collection. Duplicate catches are intentionally allowed, and every capture receives its own ID so a visitor can release one specific catch.

The production output requires a persistent filesystem for SQLite. Deploy it as a Node server (for example, a VM or container with a mounted data volume), not to an ephemeral edge-function filesystem.

## Data source

Pokémon data and artwork are loaded from [PokéAPI](https://pokeapi.co/). Pokémon is a trademark of Nintendo, Game Freak, and Creatures; this project is not affiliated with or endorsed by them.
