# PokéDuel

A turn-based Pokémon battle arena built with React Native and Expo. Pick your fighter from a pool of 20 iconic Pokémon, face off against an AI opponent that thinks strategically, and climb your win rate — all backed by real Pokémon data from PokéAPI and persistent battle history on Supabase.

![PokéDuel](assets/images/icon.png)

---

## Features

### Battle System
- **Turn-based combat** with a simplified Pokémon damage formula (attack/defense scaling, type effectiveness, critical hits, and accuracy checks)
- **Smart AI opponent** — the bot evaluates expected damage across all its moves and picks the strongest, with a 25% wildcard chance to keep things unpredictable
- **Speed-based turn order** — the faster Pokémon strikes first, with random tie-breaking
- **18-type effectiveness chart** — fire beats grass, water beats fire, ground is immune to electric, and everything in between
- **Animated battle arena** — attack lunges, hit reactions, damage popups, and a scrolling battle log

### Pokémon Selection
- **20 curated Pokémon** ranging from starters to legendaries (Bulbasaur, Charizard, Blastoise, Pikachu, Mewtwo, Mew, Snorlax, Gyarados, and more)
- **Live data from PokéAPI** — stats, types, sprites, official artwork, and move sets are all fetched in real time
- **Top 4 damaging moves** per Pokémon, automatically sorted by power

### Statistics Tracking
- **Win/loss/total scorecards** with color-coded win rate
- **Battle history** showing your Pokémon, the bot's Pokémon, turn count, and result for every match
- **Persistent storage** — all battles are saved to Supabase and survive app reloads

### Design
- Clean, card-based UI with an 8px spacing system
- **Outfit** font for body text and **Press Start 2P** for the retro-style logo
- Type-colored badges for instant visual recognition
- Dark battle arena contrasting with light home and stats screens
- Responsive two-column Pokémon grid with pull-to-refresh

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 54 |
| Navigation | Expo Router (tab-based) |
| Data Source | PokéAPI |
| Backend | Supabase (PostgreSQL) |
| Icons | lucide-react-native |
| Fonts | @expo-google-fonts/outfit, @expo-google-fonts/press-start-2p |
| Language | TypeScript |

---

## Project Structure

```
app/
├── _layout.tsx              # Root layout
├── +not-found.tsx           # 404 screen
├── battle-arena.tsx         # Full-screen battle view
└── (tabs)/
    ├── _layout.tsx           # Tab bar configuration
    ├── index.tsx             # Home screen
    ├── battle.tsx            # Pokémon selection screen
    └── stats.tsx             # Battle statistics screen

components/
├── BattleSprite.tsx         # Animated Pokémon sprite
├── HpBar.tsx                # Health bar
├── MoveButton.tsx           # Move selection button
├── PokemonCard.tsx          # Pokémon selection card
└── TypeBadge.tsx            # Type indicator badge

services/
├── pokeApi.ts               # PokéAPI data fetching & normalization
├── battleLogic.ts           # Damage calc, bot AI, turn order
├── typeChart.ts             # 18-type effectiveness matrix
├── typeColors.ts            # Type-to-color mapping
└── supabase.ts              # Battle history persistence

types/
└── pokemon.ts               # TypeScript interfaces

supabase/
└── migrations/
    └── create_battle_scores.sql
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dev server will provide a local URL (typically `http://localhost:8081`). Open it in your browser, or scan the QR code with the Expo Go app on your phone.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Expo dev server |
| `npm run build:web` | Export a production web build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

### Environment Variables

The project uses Expo's environment variable system. The following variables are pre-configured in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## How It Works

### Damage Formula

The battle engine uses a simplified version of the official Pokémon damage formula:

```
Damage = ((2 * Level / 5 + 2) * Power * (Attack / Defense) / 50 + 2) * Effectiveness * CritModifier
```

- **Level** is fixed at 50
- **Effectiveness** ranges from 0x (immune) to 4x (double weakness)
- **Crit chance** is 15% with a 1.5x multiplier
- **Accuracy** is rolled per move — moves can miss

### Bot AI

The bot doesn't just pick randomly. For each turn it:
1. Calculates a score for every move: `power * type_effectiveness * accuracy`
2. Picks the highest-scoring move
3. Has a 25% chance to override with a random pick — keeping the player on their toes

### Data Flow

1. On the battle screen, 20 Pokémon are fetched from PokéAPI in parallel
2. Each Pokémon's top 20 moves are fetched, filtered to damaging moves only, sorted by power, and the top 4 are selected
3. The player picks a Pokémon, the bot picks randomly from the rest
4. Both are passed to the battle arena via route params
5. After the battle ends, the result is saved to Supabase
6. The stats tab reads all past battles to compute win rate and show history

## License

This is a personal portfolio project. Pokémon and all related properties are trademarks of Nintendo, Game Freak, and The Pokémon Company. Data is provided by [PokéAPI](https://pokeapi.co).
