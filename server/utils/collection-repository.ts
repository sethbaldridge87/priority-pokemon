import { mkdirSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import Database from 'better-sqlite3'
import type { CapturedPokemon, NewCapturedPokemon } from '#shared/types/pokemon'

interface CapturedPokemonRow {
  id: number
  pokemon_id: number
  name: string
  height: number
  weight: number
  abilities: string
  types: string
  day_caught: string
  time_caught: string
  image: string
  shiny_image: string | null
}

const globalDatabase = globalThis as typeof globalThis & {
  priorityPokemonDatabase?: Database.Database
}

function getDatabasePath(): string {
  const configuredPath = useRuntimeConfig().databasePath
  return isAbsolute(configuredPath) ? configuredPath : resolve(process.cwd(), configuredPath)
}

function getDatabase(): Database.Database {
  if (globalDatabase.priorityPokemonDatabase) {
    return globalDatabase.priorityPokemonDatabase
  }

  const databasePath = getDatabasePath()
  mkdirSync(dirname(databasePath), { recursive: true })

  const database = new Database(databasePath)
  database.pragma('journal_mode = WAL')
  database.pragma('foreign_keys = ON')
  database.exec(`
    CREATE TABLE IF NOT EXISTS captured_pokemon (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      pokemon_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      height INTEGER NOT NULL,
      weight INTEGER NOT NULL,
      abilities TEXT NOT NULL CHECK(json_valid(abilities)),
      types TEXT NOT NULL CHECK(json_valid(types)),
      day_caught TEXT NOT NULL,
      time_caught TEXT NOT NULL,
      image TEXT NOT NULL,
      shiny_image TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS captured_pokemon_visitor_id
      ON captured_pokemon (visitor_id, id DESC);
  `)

  globalDatabase.priorityPokemonDatabase = database
  return database
}

function mapCapturedPokemon(row: CapturedPokemonRow): CapturedPokemon {
  const pokemon: CapturedPokemon = {
    captureId: row.id,
    pokemonId: row.pokemon_id,
    name: row.name,
    height: row.height,
    weight: row.weight,
    abilities: JSON.parse(row.abilities) as string[],
    types: JSON.parse(row.types) as string[],
    dayCaught: row.day_caught,
    timeCaught: row.time_caught,
    image: row.image,
  }

  if (row.shiny_image) {
    pokemon.shinyImage = row.shiny_image
  }

  return pokemon
}

export function listCapturedPokemon(visitorId: string): CapturedPokemon[] {
  const rows = getDatabase()
    .prepare(`
      SELECT id, pokemon_id, name, height, weight, abilities, types,
             day_caught, time_caught, image, shiny_image
      FROM captured_pokemon
      WHERE visitor_id = ?
      ORDER BY id DESC
    `)
    .all(visitorId) as CapturedPokemonRow[]

  return rows.map(mapCapturedPokemon)
}

export function addCapturedPokemon(
  visitorId: string,
  pokemon: NewCapturedPokemon,
): CapturedPokemon {
  const result = getDatabase()
    .prepare(`
      INSERT INTO captured_pokemon (
        visitor_id, pokemon_id, name, height, weight, abilities, types,
        day_caught, time_caught, image, shiny_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      visitorId,
      pokemon.pokemonId,
      pokemon.name,
      pokemon.height,
      pokemon.weight,
      JSON.stringify(pokemon.abilities),
      JSON.stringify(pokemon.types),
      pokemon.dayCaught,
      pokemon.timeCaught,
      pokemon.image,
      pokemon.shinyImage ?? null,
    )

  return {
    captureId: Number(result.lastInsertRowid),
    ...pokemon,
  }
}

export function releaseCapturedPokemon(visitorId: string, captureId: number): boolean {
  const result = getDatabase()
    .prepare('DELETE FROM captured_pokemon WHERE visitor_id = ? AND id = ?')
    .run(visitorId, captureId)

  return result.changes === 1
}
