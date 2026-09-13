import { Pokemon, PokemonMove, PokemonType } from '@/types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// A curated pool of iconic Pokémon IDs for the selection screen
export const POKEMON_POOL: number[] = [
  1, 4, 7, 25, 39, 52, 54, 74, 92, 133,
  143, 150, 151, 6, 9, 3, 59, 130, 131, 134,
];

interface ApiStat {
  base_stat: number;
  stat: { name: string };
}

interface ApiType {
  type: { name: string };
}

interface ApiMove {
  move: { name: string; url: string };
}

interface ApiMoveDetail {
  power: number | null;
  accuracy: number | null;
  type: { name: string };
  names: { name: string; language: { name: string } }[];
}

interface PokemonApiResponse {
  id: number;
  name: string;
  types: ApiType[];
  stats: ApiStat[];
  moves: ApiMove[];
  sprites: {
    front_default: string;
    other: {
      'official-artwork': { front_default: string };
    };
  };
  cries?: { latest: string; legacy: string };
}

function formatMoveName(name: string): string {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatPokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function fetchMoveDetails(moveUrl: string): Promise<ApiMoveDetail | null> {
  try {
    const res = await fetch(moveUrl);
    if (!res.ok) return null;
    return (await res.json()) as ApiMoveDetail;
  } catch {
    return null;
  }
}

// Fetches a Pokémon by ID or name and returns a normalized Pokemon object
// with 4 moves that have actual power values
export async function fetchPokemon(idOrName: number | string): Promise<Pokemon> {
  const res = await fetch(`${POKEAPI_BASE}/pokemon/${idOrName}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch Pokémon: ${idOrName}`);
  }
  const data: PokemonApiResponse = await res.json();

  const types = data.types.map((t) => t.type.name as PokemonType);

  // Extract base stats
  const getStat = (name: string): number =>
    data.stats.find((s) => s.stat.name === name)?.base_stat ?? 50;

  const baseHp = getStat('hp');
  const baseAttack = getStat('attack');
  const baseDefense = getStat('defense');
  const baseSpeed = getStat('speed');

  // Fetch move details in parallel — we want 4 damaging moves
  const moveUrls = data.moves.slice(0, 20).map((m) => m.move.url);
  const moveDetails = await Promise.all(moveUrls.map(fetchMoveDetails));

  // Filter to moves that have power > 0, sort by power descending, take top 4
  const validMoves = moveDetails
    .filter((m): m is ApiMoveDetail => m !== null && m.power !== null && m.power > 0 && m.accuracy !== null)
    .sort((a, b) => (b.power ?? 0) - (a.power ?? 0))
    .slice(0, 4);

  // If we don't have 4 moves, add a fallback tackle
  const moves: PokemonMove[] = validMoves.map((m) => ({
    name: formatMoveName(
      m.names.find((n) => n.language.name === 'en')?.name ??
        m.type.name
    ),
    power: m.power ?? 40,
    type: m.type.name as PokemonType,
    accuracy: m.accuracy ?? 100,
  }));

  // Pad with a basic move if fewer than 4
  while (moves.length < 4) {
    moves.push({
      name: 'Tackle',
      power: 40,
      type: 'normal',
      accuracy: 100,
    });
  }

  // Scale HP to a battle-friendly range (100-200)
  const maxHp = Math.round(baseHp * 2 + 50);

  return {
    id: data.id,
    name: formatPokemonName(data.name),
    types,
    sprite: data.sprites.front_default,
    officialArtwork: data.sprites.other['official-artwork'].front_default,
    baseHp,
    baseAttack,
    baseDefense,
    baseSpeed,
    maxHp,
    currentHp: maxHp,
    moves,
    cry: data.cries?.latest,
  };
}

// Fetches multiple Pokémon in parallel
export async function fetchPokemonPool(ids: number[] = POKEMON_POOL): Promise<Pokemon[]> {
  const results = await Promise.all(
    ids.map((id) => fetchPokemon(id).catch(() => null))
  );
  return results.filter((p): p is Pokemon => p !== null);
}
