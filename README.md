# MykoGame

MykoGame is a small educational web app for learning Mykolaiv historic regions. The first target is a Discord event game, so the project is intentionally lightweight, fast to test locally, and structured to grow without becoming messy.

## Chosen stack

- `Vite` for local development and production build
- `TypeScript` for safer structure and easier refactoring later
- `Leaflet` for interactive maps
- `GeoJSON`-shaped region content for map packs
- no database in v1

## Why this stack

The hard part of this project is not general UI, it is the combination of:

- region data
- game rules
- map rendering

So the project is organized around those concerns directly instead of adding a framework first. This keeps the code easier to study end-to-end while still giving us a strong foundation for expansion.

## Core product idea

The app has two modes:

1. `Learn`
   - show all regions
   - show names
   - allow the player to inspect the map and region descriptions
2. `Test`
   - hide labels
   - ask the player to find a named region
   - check whether the clicked region matches the target
   - keep score

## Architecture

```text
src/
  app/        app bootstrap and DOM rendering
  config/     easily changeable project rules and map settings
  content/    map packs and region data
  game/       framework-independent game logic
  map/        Leaflet integration only
  styles/     global styles
```

### Why each folder exists

- `src/app`
  - coordinates the application
  - should not contain raw region data or map internals
- `src/config`
  - stores decisions that are expected to change
  - examples: default pack, map center, tile provider, styles
- `src/content`
  - stores educational content
  - this is where future cities or region sets should be added
- `src/game`
  - contains quiz/session logic
  - should stay independent from DOM and Leaflet so it can be tested easily
- `src/map`
  - the only layer that should know Leaflet details

## Important project rules

These are decisions worth staying aware of as the project grows:

1. Keep `content` separate from `logic`.
   Region names, descriptions, and shapes are content. Quiz flow is logic.

2. Use stable region `id` values.
   Text labels can change later. IDs should not.

3. Keep config centralized.
   If a value is likely to change, prefer putting it in `src/config` instead of scattering it through the app.

4. Treat boundaries honestly.
   Historic regions are often approximate. The app should not pretend these polygons are official if they are not.

5. Make expansion additive.
   New map packs should mostly mean adding new files in `src/content/packs`, not rewriting the game engine.

## Current content state

The current pack is:

- `mykolaiv-historic`

Right now it contains a small starter set of approximate example regions so the technical structure is visible. The final educational quality will depend on improving the region polygons and content accuracy.

## Configuration points

These files are intended to be modified often:

- `src/config/app.ts`
  - title
  - default pack
  - high-level app text
- `src/config/map.ts`
  - initial map center
  - zoom level
  - tile provider
  - visual styles
- `src/content/packs/*`
  - region geometry
  - names
  - descriptions

## Local development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

The app will be available at:

```text
http://localhost:5173
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## What is already implemented

- base project scaffold
- learn/test mode structure
- map pack registry
- first example content pack
- isolated game session logic
- Leaflet rendering layer

## Recommended next steps

1. Replace the starter example polygons with the real Mykolaiv region set.
2. Decide whether test mode accepts only exact polygon clicks or allows softer scoring.
3. Add metadata per region:
   - alternate names
   - short history
   - confidence level for approximate boundaries
4. Add pack validation tests so bad geometry or duplicate IDs are caught early.

## Honest limitation

This scaffold is intentionally simple. It gives us a clean base, but the educational value will come from the quality of the region definitions, not from the framework choice.
