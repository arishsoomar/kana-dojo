import { Pressable, StyleSheet, Text, View } from 'react-native';

import { beltColors, beltEdges, colors, dojoColors, fonts, scrollColors, wallColors } from '@/constants/theme';
import type { Belt } from '@/core/boxes';
import type { DojoRoom as DojoRoomContents, RackGame, RackRecord, RoomPlaque } from '@/core/dojo';

import { AliveKarasu, type KarasuMove } from './alive-karasu';
import { Bonsai } from './bonsai';
import { MonIcon } from './mon-icon';

// Plaques on the wall's rail before the rest are counted as "+ more".
const WALL_PLAQUES = 8;
// Lanterns hung before the rest are counted.
const WALL_LANTERNS = 3;
const PLANK_GAPS = [70, 140, 210, 280];

type Props = {
  room: DojoRoomContents;
  rank: Belt; // for Karasu
  // The doorway to the supply shed, with the mon to spend. Only in your own dojo: a friend's
  // has no way into their shed.
  shed?: { mon: number; onPress: () => void };
  gear?: readonly string[]; // Karasu's gear; left out, the learner's own
  move?: { kind: KarasuMove; id: number } | null; // something for Karasu to do, like bow back
};

// A dojo: a room that fills with what's been earned. Things not yet earned are drawn dashed,
// with a hint of what fills them. In your own, the supply shed is through the curtained doorway.
export function DojoRoom({ room, rank, shed, gear, move = null }: Props) {
  const shown = room.plaques.slice(0, WALL_PLAQUES);
  const more = room.plaques.length - shown.length;

  return (
    <View style={styles.room}>
      <View style={styles.beam} />

      <View style={styles.wall}>
        <View style={styles.wallLeft}>
          {/* Row plaques, hanging from a rail, with a "+" for the next one. */}
          <View style={styles.plaques}>
            {shown.map((plaque) => (
              <Plaque key={`${plaque.script}:${plaque.row}`} plaque={plaque} />
            ))}
            {more > 0 ? (
              <View style={[styles.plaque, styles.emptyPlaque]}>
                <Text style={styles.moreText}>+{more}</Text>
              </View>
            ) : (
              <View style={[styles.plaque, styles.emptyPlaque]} aria-label="Pass a belt exam to hang a plaque">
                <Text style={styles.plus}>+</Text>
              </View>
            )}
          </View>
          <View style={styles.rail} />
          {room.plaques.length === 0 && <Text style={styles.hint}>Pass a belt exam to hang a plaque</Text>}

          {/* The weapon rack: a practice sword for each game's record. */}
          <View style={styles.rack}>
            {room.rack.map((record) => (
              <Weapon key={record.game} record={record} />
            ))}
          </View>
          <View style={styles.rail} />
          <Text style={styles.label}>Weapon rack</Text>
        </View>

        <View style={styles.wallRight}>
          {room.scroll ? (
            <View style={styles.scroll} aria-label={`Scroll won: ${room.scroll.name}`}>
              <Text style={styles.scrollKana}>{room.scroll.kana[0]}</Text>
              <Text style={styles.scrollKana}>{room.scroll.kana[1]}</Text>
              <View style={styles.hanko}>
                <Text style={styles.hankoText}>勝</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.scroll, styles.emptyScroll]}>
              <Text style={styles.emptyText}>Win a duel</Text>
            </View>
          )}
          <Text style={[styles.label, styles.centered]} numberOfLines={2}>
            {room.scroll ? room.scroll.name : 'Scroll'}
          </Text>

          {/* A lantern for each moon, and a dashed one for the next. */}
          <View style={styles.lanterns}>
            {Array.from({ length: Math.min(room.lanterns, WALL_LANTERNS) }, (_, i) => (
              <Lantern key={i} />
            ))}
            {room.lanterns < WALL_LANTERNS && <Lantern empty />}
          </View>
          <Text style={[styles.label, styles.centered]}>
            {room.lanterns === 0 ? 'Earn a moon' : `${room.lanterns} ${room.lanterns === 1 ? 'moon' : 'moons'}`}
          </Text>
        </View>
      </View>

      {/* The floor: the bonsai, Karasu in his gear on his cushion, and the doorway to the shed. */}
      <View style={styles.floor}>
        {PLANK_GAPS.map((left) => (
          <View key={left} style={[styles.plank, { left }]} />
        ))}
        <View style={styles.floorThing}>
          <Bonsai stage={room.bonsai} size={62} />
          <Text style={styles.label}>{room.bonsai === 0 ? 'Train to grow it' : 'Bonsai'}</Text>
        </View>
        <View style={styles.karasu}>
          <AliveKarasu mood="focus" rank={rank} size={112} gear={gear} move={move} />
          <View style={styles.cushion} />
        </View>
        {shed ? (
          <Pressable role="button" aria-label={`Supply shed: ${shed.mon} mon to spend`} onPress={shed.onPress} style={styles.floorThing}>
            <View style={styles.doorway}>
              {/* A noren: the split curtain hung in a shop's doorway, with 店 ("shop") on it. */}
              <View style={styles.noren}>
                <View style={styles.norenPanel} />
                <View style={[styles.norenPanel, styles.norenMiddle]}>
                  <Text style={styles.norenText}>店</Text>
                </View>
                <View style={styles.norenPanel} />
              </View>
            </View>
            <Text style={styles.label}>Supply shed</Text>
            <View style={styles.mon}>
              <MonIcon size={13} />
              <Text style={styles.monText}>{shed.mon}</Text>
            </View>
          </Pressable>
        ) : (
          // The floor keeps its shape without the doorway.
          <View style={styles.floorThing} />
        )}
      </View>
    </View>
  );
}

// A row's plaque: its kana top to bottom, and its belt as a band across the foot.
function Plaque({ plaque }: { plaque: RoomPlaque }) {
  const chars = [...plaque.kana];
  return (
    <View style={styles.plaque} aria-label={`${plaque.kana}: ${plaque.belt} belt`}>
      <View style={styles.plaqueKana}>
        {chars.map((char, i) => (
          <Text key={i} style={[styles.plaqueChar, chars.length > 5 && styles.plaqueCharSmall]}>
            {char}
          </Text>
        ))}
      </View>
      <View
        style={[
          styles.band,
          { backgroundColor: beltColors[plaque.belt], borderColor: plaque.belt === 'white' ? beltEdges.light : beltEdges.dark },
        ]}
      />
    </View>
  );
}

const RECORD_NAMES: Readonly<Record<RackGame, string>> = { rain: 'Rain', dungeon: 'Dungeon', taiko: 'Taiko', memory: 'Memory' };

function recordText({ game, value }: RackRecord): string {
  if (value === null) return RECORD_NAMES[game];
  if (game === 'dungeon') return `Floor ${value}`;
  if (game === 'memory') return `${value} moves`;
  return value.toLocaleString('en-US');
}

// A practice sword on the rack for a game's record, or a dashed outline for a game not played.
function Weapon({ record }: { record: RackRecord }) {
  const empty = record.value === null;
  return (
    <View style={styles.weapon} aria-label={empty ? `${RECORD_NAMES[record.game]}: not played yet` : `${RECORD_NAMES[record.game]} record: ${recordText(record)}`}>
      <View style={[styles.blade, empty && styles.emptyBlade]} />
      <View style={[styles.guard, empty && styles.emptyGuard]} />
      <View style={[styles.grip, empty && styles.emptyBlade]} />
      <Text style={[styles.record, empty && styles.emptyText]} numberOfLines={1}>
        {recordText(record)}
      </Text>
    </View>
  );
}

function Lantern({ empty = false }: { empty?: boolean }) {
  return (
    <View style={styles.lantern}>
      <View style={[styles.lanternCap, empty && styles.emptyCap]} />
      <View style={[styles.lanternBody, empty && styles.emptyLantern]} />
    </View>
  );
}


const styles = StyleSheet.create({
  room: {
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: wallColors.rail,
    backgroundColor: dojoColors.wall,
  },
  beam: {
    height: 10,
    backgroundColor: wallColors.rail,
  },
  wall: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  wallLeft: {
    flex: 1,
  },
  wallRight: {
    alignItems: 'center',
    width: 76,
  },
  plaques: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  plaque: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 32,
    height: 76,
    paddingTop: 4,
    overflow: 'hidden',
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: wallColors.floorEdge,
    backgroundColor: colors.wood,
  },
  plaqueKana: {
    alignItems: 'center',
  },
  plaqueChar: {
    fontFamily: fonts.jp,
    fontSize: 10,
    lineHeight: 12,
    color: colors.sumi,
  },
  plaqueCharSmall: {
    fontSize: 8,
    lineHeight: 9,
  },
  band: {
    alignSelf: 'stretch',
    height: 8,
    borderTopWidth: 1,
  },
  emptyPlaque: {
    justifyContent: 'center',
    paddingTop: 0,
    borderStyle: 'dashed',
    borderColor: dojoColors.empty,
    backgroundColor: 'transparent',
  },
  plus: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 20,
    color: dojoColors.emptyInk,
  },
  moreText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    color: dojoColors.label,
  },
  rail: {
    height: 7,
    marginTop: 4,
    borderRadius: 2,
    backgroundColor: wallColors.rail,
  },
  hint: {
    marginTop: 4,
    fontFamily: fonts.uiBold,
    fontSize: 10,
    color: dojoColors.emptyInk,
  },
  rack: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
  },
  weapon: {
    alignItems: 'center',
    width: 50,
  },
  blade: {
    width: 6,
    height: 34,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1,
    borderColor: wallColors.floorEdge,
    backgroundColor: dojoColors.rack,
  },
  guard: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: wallColors.peg,
  },
  grip: {
    width: 6,
    height: 12,
    borderWidth: 1,
    borderColor: wallColors.peg,
    backgroundColor: wallColors.rail,
  },
  emptyBlade: {
    borderStyle: 'dashed',
    borderColor: dojoColors.empty,
    backgroundColor: 'transparent',
  },
  emptyGuard: {
    backgroundColor: dojoColors.empty,
  },
  record: {
    marginTop: 2,
    fontFamily: fonts.uiBold,
    fontSize: 10,
    color: dojoColors.label,
  },
  label: {
    marginTop: 3,
    fontFamily: fonts.uiBold,
    fontSize: 10,
    color: dojoColors.label,
  },
  centered: {
    textAlign: 'center',
  },
  scroll: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 62,
    height: 110,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: wallColors.rail,
    backgroundColor: scrollColors.paper,
  },
  scrollKana: {
    fontFamily: fonts.jp,
    fontSize: 22,
    lineHeight: 26,
    color: colors.sumi,
  },
  hanko: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    marginTop: 3,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.vermilion,
  },
  hankoText: {
    fontFamily: fonts.jp,
    fontSize: 11,
    lineHeight: 13,
    color: colors.vermilion,
  },
  // Dashed borders only draw when every side is the same width.
  emptyScroll: {
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: dojoColors.empty,
    backgroundColor: 'transparent',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: fonts.uiBold,
    fontSize: 10,
    color: dojoColors.emptyInk,
  },
  lanterns: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
  },
  lantern: {
    alignItems: 'center',
  },
  lanternCap: {
    width: 3,
    height: 7,
    backgroundColor: wallColors.peg,
  },
  emptyCap: {
    backgroundColor: dojoColors.empty,
  },
  lanternBody: {
    width: 20,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.vermilionDark,
    backgroundColor: colors.vermilion,
  },
  emptyLantern: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: dojoColors.empty,
    backgroundColor: 'transparent',
  },
  floor: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 150,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderTopWidth: 5,
    borderTopColor: wallColors.floorEdge,
    backgroundColor: wallColors.floor,
  },
  plank: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: wallColors.plank,
  },
  floorThing: {
    alignItems: 'center',
    width: 70,
  },
  karasu: {
    alignItems: 'center',
    marginTop: -40,
  },
  doorway: {
    width: 64,
    height: 92,
    paddingTop: 5,
    paddingHorizontal: 5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: wallColors.peg,
  },
  noren: {
    flexDirection: 'row',
    gap: 2,
    height: 46,
  },
  norenPanel: {
    flex: 1,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: colors.indigoDark,
  },
  norenMiddle: {
    alignItems: 'center',
    paddingTop: 10,
  },
  norenText: {
    fontFamily: fonts.jp,
    fontSize: 13,
    color: colors.card,
  },
  mon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  monText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    color: colors.sumi,
  },
  cushion: {
    width: 70,
    height: 14,
    marginTop: -6,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: dojoColors.cushionEdge,
    backgroundColor: dojoColors.cushion,
  },
});
