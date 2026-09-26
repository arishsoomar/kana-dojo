import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, BackHandler, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AliveKarasu } from '@/components/alive-karasu';
import { CharmIcon, DoorIcon } from '@/components/charm-icon';
import { FlameIcon } from '@/components/flame-icon';
import { HeartIcon } from '@/components/heart-icon';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { Yokai } from '@/components/yokai';
import { colors, dungeonColors, fonts } from '@/constants/theme';
import { bestScore } from '@/core/answers';
import { CHARMS, DUNGEON_MIN_KANA, dungeonId, MAX_HEARTS, type Charm, type Rarity } from '@/core/dungeon';
import type { Kana, Script } from '@/core/kana';
import { metKana } from '@/core/unlock';
import { useDungeon, type Flash } from '@/hooks/use-dungeon';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

const useNativeDriver = Platform.OS !== 'web';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// The Yokai dungeon: choose a script, then go down floor after floor of yokai, each showing
// one of your kana. Each new run gets a new key, so "Run again" starts fresh.
export default function DungeonScreen() {
  const [script, setScript] = useState<Script | null>(null);
  const [runNumber, setRunNumber] = useState(0);
  if (!script) return <Entrance onEnter={setScript} />;
  return (
    <Battle
      key={runNumber}
      script={script}
      onAgain={() => setRunNumber((n) => n + 1)}
      onOtherScript={() => setScript(null)}
    />
  );
}

// The dungeon's door: which script to face, with what's been learned in each.
function Entrance({ onEnter }: { onEnter: (script: Script) => void }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const [choice, setChoice] = useState<Script>(progress.settings.script);
  const scripts = (['hiragana', 'katakana'] as const).map((script) => ({
    script,
    known: metKana(progress, script).length,
    deepest: bestScore(progress, dungeonId(script)),
  }));
  const chosen = scripts.find((s) => s.script === choice);
  const open = (chosen?.known ?? 0) >= DUNGEON_MIN_KANA;

  return (
    <View style={[styles.night, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.topRow}>
        <Pressable role="button" aria-label="Leave the dungeon" onPress={leave} hitSlop={10}>
          <XIcon color={dungeonColors.soft} />
        </Pressable>
      </View>
      <View style={styles.entrance}>
        <Yokai char="鬼" size={120} hue="red" />
        <Text style={styles.title}>Yokai dungeon</Text>
        <Text style={styles.soft}>Each yokai is one of your kana. Read it before it attacks.</Text>

        <View style={styles.scriptChoices} role="radiogroup">
          {scripts.map(({ script, known, deepest }) => (
            <Pressable
              key={script}
              role="radio"
              aria-checked={choice === script}
              onPress={() => setChoice(script)}
              style={[styles.scriptCard, choice === script && styles.scriptCardChosen]}>
              <Text style={styles.scriptName}>{script === 'hiragana' ? 'Hiragana' : 'Katakana'}</Text>
              <Text style={styles.scriptKana}>{script === 'hiragana' ? 'ひらがな' : 'カタカナ'}</Text>
              <Text style={styles.scriptInfo}>
                {known >= DUNGEON_MIN_KANA ? `${known} kana learned` : `Learn ${DUNGEON_MIN_KANA} kana to enter`}
              </Text>
              {deepest !== null && <Text style={styles.scriptInfo}>Deepest: floor {deepest}</Text>}
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Enter the dungeon" tone="light" disabled={!open} onPress={() => onEnter(choice)} />
      </View>
    </View>
  );
}

type BattleProps = { script: Script; onAgain: () => void; onOtherScript: () => void };

function Battle({ script, onAgain, onOtherScript }: BattleProps) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const dungeon = useDungeon(script);
  const { run, question, flash, lastBlow, hint, offered, result } = dungeon;
  const [leaving, setLeaving] = useState(false);

  // Android's back button asks first, like the X. Once the run is over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result]);

  if (result) {
    const best = result.deepest === null || result.floor > result.deepest;
    return (
      <View style={[styles.paper, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={result.summary}
          onContinue={leave}
          title="The yokai win this time"
          headline={{ label: 'Floor', value: String(result.floor) }}
          note={best ? 'Your deepest yet!' : `Deepest: floor ${result.deepest}`}
          secondary={{ label: 'Run again', onPress: onAgain }}
          rank={rank}
          celebrate={best && result.floor > 1}
        />
        <Pressable role="button" onPress={onOtherScript} style={styles.otherScript}>
          <Text style={styles.otherScriptText}>Try the other script</Text>
        </Pressable>
      </View>
    );
  }

  if (offered) {
    return <CharmPick floor={run.floor} offered={offered} rank={rank} onTake={dungeon.choose} />;
  }

  const hurt = lastBlow?.blow.kind === 'hurt';
  const seconds = Math.ceil(dungeon.attackIn / 1000);

  return (
    <View style={[styles.night, { paddingTop: insets.top }]}>
      {/* Floor, kept charms, and how many yokai are left on this floor. */}
      <View style={styles.statsRow}>
        <Pressable role="button" aria-label="Leave the dungeon" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={dungeonColors.soft} />
        </Pressable>
        <View style={styles.chip}>
          <DoorIcon />
          <Text style={styles.chipText}>Floor {run.floor}</Text>
        </View>
        <View style={styles.charms}>
          {run.charms.map((charm) => (
            <View key={charm} style={styles.charmSlot} aria-label={CHARMS[charm].name}>
              <CharmIcon charm={charm} size={18} />
            </View>
          ))}
        </View>
        <Text style={styles.left}>{run.enemiesLeft} left</Text>
      </View>

      {/* The yokai between two torches, with its name and HP. */}
      <View style={styles.arena}>
        <Torch side="left" />
        <Torch side="right" />
        <View style={styles.enemy}>
          <Text style={styles.enemyName}>
            <Text style={styles.kana}>{question.kana.char}</Text> {run.enemy.name}
          </Text>
          <View style={styles.hpBar} aria-label={`${run.enemy.hp} of ${run.enemy.maxHp} HP`}>
            {Array.from({ length: run.enemy.maxHp }, (_, i) => (
              <View key={i} style={[styles.hpPip, i < run.enemy.hp && styles.hpPipFull]} />
            ))}
          </View>
          <Yokai char={question.kana.char} size={146} hue={hurt && flash ? 'red' : 'slate'} />
        </View>
        {lastBlow?.blow.kind === 'strike' && lastBlow.blow.clean && <CleanPop key={lastBlow.id} />}
      </View>

      {/* Karasu, his hearts, and the attack timer. */}
      <View style={styles.fighter}>
        <AliveKarasu
          mood={hurt ? 'stern' : 'focus'}
          rank={rank}
          size={86}
          move={lastBlow ? { kind: lastBlow.blow.kind === 'strike' ? 'hop' : 'shake', id: lastBlow.id } : null}
        />
        <View style={styles.fighterInfo}>
          <View style={styles.hearts} aria-label={`${run.hearts} of ${MAX_HEARTS} hearts`}>
            {Array.from({ length: MAX_HEARTS }, (_, i) => (
              <HeartIcon key={i} size={20} color={i < run.hearts ? colors.vermilion : dungeonColors.edge} />
            ))}
          </View>
          <Text style={styles.timerText}>
            {flash ? (flash.picked ? 'It strikes back!' : 'Too slow: it attacks!') : `It attacks in ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`}
          </Text>
          <View style={styles.timerTrack}>
            <View style={[styles.timerFill, { width: `${dungeon.attackShare * 100}%` }]} />
          </View>
        </View>
      </View>

      {/* The hint scroll, if kept: the answer's first letter. */}
      {run.charms.includes('hint') && (
        <Pressable
          role="button"
          aria-label="Use a hint"
          onPress={dungeon.revealHint}
          disabled={run.hintsLeft === 0 || hint !== null}
          style={[styles.hint, (run.hintsLeft === 0 || hint !== null) && styles.hintUsed]}>
          <CharmIcon charm="hint" size={16} />
          <Text style={styles.hintText}>{hint ? `Starts with "${hint}"` : `Hint (${run.hintsLeft} left)`}</Text>
        </Pressable>
      )}

      <View style={[styles.tiles, { paddingBottom: insets.bottom + 16 }]}>
        {question.choices.map((choice) => (
          <Pressable
            key={choice.char}
            role="button"
            aria-label={`Answer ${choice.romaji[0]}`}
            disabled={flash !== null}
            onPress={() => dungeon.answer(choice)}
            style={[styles.tile, tileStyle(choice, question.kana, flash)]}>
            <Text style={styles.tileText}>{choice.romaji[0]}</Text>
          </Pressable>
        ))}
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leave} />
    </View>
  );
}

// After a wrong answer or an attack: the pick in red, the right answer in green.
function tileStyle(choice: Kana, answer: Kana, flash: Flash | null) {
  if (!flash) return null;
  if (choice === flash.picked) return styles.tileWrong;
  if (choice === answer) return styles.tileRight;
  return null;
}

// A torch on a post at one side of the arena.
function Torch({ side }: { side: 'left' | 'right' }) {
  return (
    <View style={[styles.torch, side === 'left' ? styles.torchLeft : styles.torchRight]}>
      <FlameIcon size={26} />
      <View style={styles.post} />
    </View>
  );
}

// "Clean!", popping up beside the yokai after a quick strike.
function CleanPop() {
  const reduceMotion = useReducedMotion();
  const [pop] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion) return;
    const show = Animated.sequence([
      Animated.timing(pop, { toValue: 1, duration: 180, easing: Easing.out(Easing.back(2)), useNativeDriver }),
      Animated.delay(500),
      Animated.timing(pop, { toValue: 0, duration: 250, useNativeDriver }),
    ]);
    show.start();
    return () => show.stop();
  }, [pop, reduceMotion]);
  if (reduceMotion) return null;
  return (
    <Animated.Text
      style={[styles.clean, { opacity: pop, transform: [{ rotate: '8deg' }, { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}
      pointerEvents="none">
      Clean!
    </Animated.Text>
  );
}

const RARITY_STYLES: Readonly<Record<Rarity, { chip: object; text: object; label: string }>> = {
  common: { chip: { backgroundColor: dungeonColors.iconBack }, text: { color: dungeonColors.soft }, label: 'Common' },
  rare: { chip: { backgroundColor: dungeonColors.rareBack }, text: { color: dungeonColors.rareText }, label: 'Rare' },
  epic: { chip: { backgroundColor: colors.gold }, text: { color: dungeonColors.epicText }, label: 'Epic' },
};

// Between floors: take one of up to three charms.
function CharmPick({ floor, offered, rank, onTake }: { floor: number; offered: Charm[]; rank: ReturnType<typeof useRank>; onTake: (charm: Charm) => void }) {
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<Charm>(offered[offered.length - 1] ?? 'tea');
  return (
    <View style={[styles.night, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.pickHeader}>
        <AliveKarasu mood="proud" rank={rank} size={94} move={{ kind: 'cheer', id: floor }} />
        <Text style={styles.title}>Floor {floor} cleared</Text>
        <Text style={styles.soft}>Take one charm before going deeper</Text>
      </View>
      <View style={styles.relics} role="radiogroup">
        {offered.map((charm) => {
          const { name, rarity, about } = CHARMS[charm];
          const chosen = picked === charm;
          return (
            <Pressable
              key={charm}
              role="radio"
              aria-checked={chosen}
              onPress={() => setPicked(charm)}
              style={[styles.relic, chosen && styles.relicChosen]}>
              <View style={[styles.relicIcon, rarity === 'epic' && styles.relicIconEpic]}>
                <CharmIcon charm={charm} size={30} />
              </View>
              <View style={styles.relicText}>
                <View style={styles.relicTitle}>
                  <Text style={styles.relicName}>{name}</Text>
                  <View style={[styles.rarity, RARITY_STYLES[rarity].chip]}>
                    <Text style={[styles.rarityText, RARITY_STYLES[rarity].text]}>{RARITY_STYLES[rarity].label}</Text>
                  </View>
                </View>
                <Text style={styles.relicAbout}>{about}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.footer}>
        <PrimaryButton label={`Take the ${CHARMS[picked].name.split(' ').pop()?.toLowerCase()}`} tone="gold" onPress={() => onTake(picked)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  night: {
    flex: 1,
    backgroundColor: colors.night,
  },
  paper: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  topRow: {
    paddingTop: 6,
    paddingHorizontal: 18,
  },
  entrance: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 6,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    textAlign: 'center',
    color: colors.card,
  },
  soft: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: dungeonColors.soft,
  },
  scriptChoices: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  scriptCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: dungeonColors.edge,
    backgroundColor: dungeonColors.card,
  },
  scriptCardChosen: {
    borderColor: colors.gold,
  },
  scriptName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.card,
  },
  scriptKana: {
    marginBottom: 4,
    fontFamily: fonts.jp,
    fontSize: 15,
    color: dungeonColors.soft,
  },
  scriptInfo: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    textAlign: 'center',
    color: dungeonColors.cardText,
  },
  footer: {
    paddingHorizontal: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 6,
    paddingHorizontal: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: dungeonColors.tile,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.card,
  },
  charms: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  charmSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: dungeonColors.tile,
  },
  left: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: dungeonColors.soft,
  },
  arena: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 230,
  },
  torch: {
    position: 'absolute',
    top: 14,
    alignItems: 'center',
  },
  torchLeft: {
    left: 14,
  },
  torchRight: {
    right: 14,
  },
  post: {
    width: 5,
    height: 56,
    backgroundColor: dungeonColors.edge,
  },
  enemy: {
    alignItems: 'center',
  },
  enemyName: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: dungeonColors.soft,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  hpBar: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 5,
    marginBottom: 4,
  },
  hpPip: {
    width: 34,
    height: 8,
    borderRadius: 4,
    backgroundColor: dungeonColors.edge,
  },
  hpPipFull: {
    backgroundColor: colors.vermilion,
  },
  clean: {
    position: 'absolute',
    right: 36,
    top: '42%',
    fontFamily: fonts.uiBlack,
    fontSize: 19,
    color: colors.gold,
  },
  fighter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
  },
  fighterInfo: {
    flex: 1,
    paddingBottom: 10,
  },
  hearts: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  timerText: {
    marginBottom: 4,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: dungeonColors.soft,
  },
  timerTrack: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: dungeonColors.edge,
  },
  timerFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.vermilion,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: dungeonColors.edge,
    backgroundColor: dungeonColors.tile,
  },
  hintUsed: {
    opacity: 0.7,
  },
  hintText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.card,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 18,
  },
  tile: {
    flexBasis: '45%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: dungeonColors.edge,
    backgroundColor: dungeonColors.tile,
  },
  tileWrong: {
    borderColor: colors.vermilion,
  },
  tileRight: {
    borderColor: colors.pine,
  },
  tileText: {
    fontFamily: fonts.uiBold,
    fontSize: 18,
    color: colors.card,
  },
  pickHeader: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
  },
  relics: {
    flex: 1,
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 18,
  },
  relic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: dungeonColors.edge,
    backgroundColor: dungeonColors.card,
  },
  relicChosen: {
    borderColor: colors.gold,
  },
  relicIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: dungeonColors.iconBack,
  },
  relicIconEpic: {
    backgroundColor: dungeonColors.epicBack,
  },
  relicText: {
    flex: 1,
  },
  relicTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  relicName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.card,
  },
  rarity: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 999,
  },
  rarityText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
  },
  relicAbout: {
    marginTop: 2,
    fontFamily: fonts.uiMedium,
    fontSize: 12.5,
    color: dungeonColors.cardText,
  },
  otherScript: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },
  otherScriptText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.ink2,
  },
});
