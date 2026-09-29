import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';

import { recordAnswer } from '@/core/answers';
import type { Kana } from '@/core/kana';
import {
  completeLiveDuel,
  liveStep,
  makeRoomCode,
  parseLiveMessage,
  sharedKana,
  startLive,
  type LiveEvent,
  type LiveMessage,
} from '@/core/live-duel';
import { metKana } from '@/core/unlock';
import { supabase } from '@/storage/supabase';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';

// How often the duel's clock ticks.
const TICK_MS = 100;
// How long the other phone can be missing before the duel is called off.
const DROP_MS = 10_000;
// The broadcast event every message goes out as.
const EVENT = 'duel';

// The connection, as opposed to the duel: still connecting, open, the room already had two
// players, it couldn't connect, the other player left, or this build has no Supabase.
export type Connection = 'connecting' | 'open' | 'full' | 'error' | 'gone' | 'unavailable';

type Presence = { joinedAt: number };

// Runs a live duel in the room `code`. The phones talk through a Supabase Realtime channel
// named after the room: presence says who's there, and broadcast messages carry hellos and
// answers. The rules live in src/core/live-duel.ts; this feeds them events and sends what they
// say to send. `onRematch` moves both players to a new room; it should never change (a state
// setter), since the room reconnects when it does.
export function useLiveDuel(code: string, onRematch: (code: string) => void) {
  const { progress, changeProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const [me] = useState(() => Math.random().toString(36).slice(2));
  const [duel, setDuel] = useState(() =>
    startLive(code, [...metKana(progress, 'hiragana'), ...metKana(progress, 'katakana')].map((k) => k.char)),
  );
  const [connection, setConnection] = useState<Connection>(supabase ? 'connecting' : 'unavailable');
  const [now, setNow] = useState(() => Date.now());
  const [pick, setPick] = useState<{ round: number; char: string } | null>(null); // this player's tap
  const channel = useRef<RealtimeChannel | null>(null);
  const sent = useRef(0); // how much of the outbox has gone out
  const recorded = useRef(false);
  const rematchSent = useRef<string | null>(null);

  const step = (event: LiveEvent) => setDuel((current) => liveStep(current, event));

  // The room's channel, for as long as the screen is open.
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let opponentHere = false;
    let dropTimer: ReturnType<typeof setTimeout> | null = null;
    const room = client.channel(`live-duel:${code}`, { config: { broadcast: { self: false }, presence: { key: me } } });
    channel.current = room;

    room.on('presence', { event: 'sync' }, () => {
      // The first two to arrive have the room; anyone later is turned away.
      const present = Object.entries(room.presenceState<Presence>())
        .map(([key, metas]) => ({ key, joinedAt: metas[0]?.joinedAt ?? 0 }))
        .sort((a, b) => a.joinedAt - b.joinedAt || (a.key < b.key ? -1 : 1));
      const players = present.slice(0, 2);
      if (!players.some((p) => p.key === me)) {
        if (present.some((p) => p.key === me)) setConnection('full');
        return;
      }
      const here = players.some((p) => p.key !== me);
      if (here && !opponentHere) {
        if (dropTimer) clearTimeout(dropTimer);
        dropTimer = null;
        step({ type: 'joined' });
      }
      if (!here && opponentHere) dropTimer = setTimeout(() => setConnection('gone'), DROP_MS);
      opponentHere = here;
    });

    room.on('broadcast', { event: EVENT }, ({ payload }) => {
      const message = parseLiveMessage(payload);
      if (!message) return;
      if (message.type === 'leave') {
        setConnection('gone');
        return;
      }
      if (message.type === 'rematch') {
        // If both asked for a rematch at once, both go to the alphabetically first room.
        const mine = rematchSent.current;
        onRematch(mine && mine < message.code ? mine : message.code);
        return;
      }
      step({ type: 'message', message, now: Date.now() });
    });

    room.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setConnection((c) => (c === 'connecting' ? 'open' : c));
        void room.track({ joinedAt: Date.now() } satisfies Presence);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setConnection((c) => (c === 'connecting' ? 'error' : c));
      }
    });

    return () => {
      if (dropTimer) clearTimeout(dropTimer);
      void room.send({ type: 'broadcast', event: EVENT, payload: { type: 'leave' } satisfies LiveMessage });
      void client.removeChannel(room);
      channel.current = null;
    };
  }, [code, me, onRematch]);

  // Sends whatever the rules have added to the outbox.
  useEffect(() => {
    const room = channel.current;
    if (!room) return;
    for (const message of duel.outbox.slice(sent.current)) {
      void room.send({ type: 'broadcast', event: EVENT, payload: message });
    }
    sent.current = duel.outbox.length;
  }, [duel.outbox]);

  // The clock, while there's a countdown, a round or a reveal running.
  const running = duel.phase === 'countdown' || duel.phase === 'playing' || duel.phase === 'reveal';
  useEffect(() => {
    if (!running || connection !== 'open') return;
    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);
      step({ type: 'tick', now: time });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [running, connection]);

  // The end: kept with the finished games, once, with a drum.
  useEffect(() => {
    if (duel.phase !== 'over' || recorded.current) return;
    recorded.current = true;
    changeProgress((current) => completeLiveDuel(current, code, Date.now(), duel.score));
    haptics.thunk();
    sounds.play('taiko');
  }, [duel.phase, duel.score, code, changeProgress, haptics, sounds]);

  const question = duel.phase === 'playing' || duel.phase === 'reveal' ? (duel.questions[duel.round] ?? null) : null;

  function answer(choice: Kana) {
    if (!question || duel.phase !== 'playing' || duel.myAttempt) return;
    const time = Date.now();
    const correct = choice.char === question.kana.char;
    changeProgress((current) =>
      recordAnswer(current, { char: question.kana.char, guess: choice.char, ms: time - duel.shownAt, now: time }),
    );
    if (correct) haptics.right();
    else haptics.miss();
    setPick({ round: duel.round, char: choice.char });
    step({ type: 'tap', correct, now: time });
  }

  // A new room for the same two players: tell the other phone, then go there.
  function playAgain() {
    const next = makeRoomCode(Math.random);
    rematchSent.current = next;
    void channel.current?.send({ type: 'broadcast', event: EVENT, payload: { type: 'rematch', code: next } satisfies LiveMessage });
    onRematch(next);
  }

  return {
    duel,
    connection,
    question,
    // The answer this player tapped this round, if any.
    picked: pick?.round === duel.round ? pick.char : null,
    shared: duel.theirs ? sharedKana(duel.mine, duel.theirs).length : null,
    // Seconds left in the countdown.
    countdown: Math.max(Math.ceil((duel.phaseEnds - now) / 1000), 1),
    answer,
    playAgain,
  };
}
