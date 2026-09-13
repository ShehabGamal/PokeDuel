/*
# Create battle_scores table for Pokémon battle game (single-tenant, no auth)

1. New Tables
- `battle_scores`
  - `id` (uuid, primary key)
  - `player_pokemon` (text, name of the player's Pokémon)
  - `bot_pokemon` (text, name of the bot's Pokémon)
  - `winner` (text, either 'player' or 'bot')
  - `player_hp_remaining` (integer, HP left when battle ended)
  - `bot_hp_remaining` (integer, HP left when battle ended)
  - `total_turns` (integer, number of turns in the battle)
  - `created_at` (timestamp, when the battle occurred)
2. Security
- Enable RLS on `battle_scores`.
- Allow anon + authenticated CRUD because this is a single-tenant game with no sign-in.
- All data is intentionally public/shared.
*/

CREATE TABLE IF NOT EXISTS battle_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_pokemon text NOT NULL,
  bot_pokemon text NOT NULL,
  winner text NOT NULL CHECK (winner IN ('player', 'bot')),
  player_hp_remaining integer NOT NULL DEFAULT 0,
  bot_hp_remaining integer NOT NULL DEFAULT 0,
  total_turns integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE battle_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_battle_scores" ON battle_scores;
CREATE POLICY "anon_select_battle_scores" ON battle_scores FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_battle_scores" ON battle_scores;
CREATE POLICY "anon_insert_battle_scores" ON battle_scores FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_battle_scores" ON battle_scores;
CREATE POLICY "anon_delete_battle_scores" ON battle_scores FOR DELETE
TO anon, authenticated USING (true);
