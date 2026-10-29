import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { speakWord } from '@/audio/pronounce';
import { colors, fonts, jpRoom } from '@/constants/theme';
import type { MnemonicPicture } from '@/constants/mnemonic-pictures';
import { VOCAB_PICTURES } from '@/constants/vocab-pictures';
import type { WordMnemonic } from '@/content/mnemonics';
import { REGISTERS } from '@/content/registers';
import { romajiOf } from '@/content/romaji';
import { WORD_FAMILIES, type WordFamily } from '@/content/word-families';
import type { WordFront } from '@/core/answers';
import { furiganaText, type VocabWord } from '@/core/vocab';

import { Furigana } from './furigana';
import { SpeakerIcon } from './speaker-icon';

type Props = {
  word: VocabWord;
  mnemonic?: WordMnemonic | null; // a memory tip, shown on the back (src/content/mnemonics.ts)
  mnemonicPicture?: MnemonicPicture;
  front: WordFront; // which side is the front: the Japanese, or the English and picture
  back: boolean; // whether the back is showing
  onSpeak: () => void;
};

// What a word's flashcard shows. With the Japanese in front: the word with furigana, and on
// the back its reading, picture, meanings, memory tip, example sentence and word families. With
// the English in front: its picture and meanings (say it in Japanese), and on the back
// everything. The memory tip is only ever on the back: it would give the answer away in front.
export function WordCardFace({ word, mnemonic, mnemonicPicture, front, back, onSpeak }: Props) {
  if (front === 'english' && !back) {
    return (
      <>
        <EnglishFront word={word} />
        <Text style={styles.hint}>Say it in Japanese, then tap to check</Text>
      </>
    );
  }
  return (
    <>
      <Furigana furigana={word.furigana} size={48} align="center" />
      {back ? (
        <Back word={word} mnemonic={mnemonic} mnemonicPicture={mnemonicPicture} onSpeak={onSpeak} />
      ) : (
        <>
          {/* Hear it again: say what it means in your head, then turn it over. */}
          <Pressable role="button" aria-label={`Hear ${word.reading}`} onPress={onSpeak} hitSlop={12} style={styles.frontSpeaker}>
            <SpeakerIcon color={colors.ink2} size={26} />
          </Pressable>
          <Text style={styles.hint}>Say what it means, then tap to check</Text>
        </>
      )}
    </>
  );
}

// The front of a card shown English first: its picture, its main meaning, and who says it how
// (Polite, Humble…), which tells words for the same thing apart. Say it in Japanese, then turn it
// over to see it and hear it.
function EnglishFront({ word }: { word: VocabWord }) {
  return (
    <View style={styles.back}>
      <WordPicture word={word} />
      {/* Just the main meaning: the rest, often rare senses, are on the back. */}
      <Text style={styles.meaning}>{word.meanings[0]}</Text>
      <Labels word={word} />
    </View>
  );
}

// Who says a word and how: its labels, and with `note`, its usage note (which can name the word
// in Japanese, so not on an English front).
function Labels({ word, note = false }: { word: VocabWord; note?: boolean }) {
  const shownNote = note ? word.note : null;
  if (word.labels.length === 0 && !shownNote) return null;
  return (
    <View style={styles.labels}>
      {word.labels.map((label) => (
        <Text key={label} style={styles.label} aria-label={REGISTERS[label]?.about}>
          {REGISTERS[label]?.name ?? label}
        </Text>
      ))}
      {shownNote && <Text style={styles.note}>{shownNote}</Text>}
    </View>
  );
}

// A picture of it, for words a picture shows well (src/constants/vocab-pictures.ts).
export function WordPicture({ word, size = PICTURE }: { word: VocabWord; size?: number }) {
  // By word#id first, for one of two cards written alike (いる: to be, いる: to need).
  const picture = VOCAB_PICTURES[`${word.word}#${word.id}`] ?? VOCAB_PICTURES[word.word];
  if (!picture) return null;
  // The badge and its circle keep their size relative to the picture.
  const scale = size / PICTURE;
  const circle = 40 * scale;
  return (
    <View style={{ width: size, height: size }}>
      <Image source={picture.picture} style={styles.pictureImage} accessibilityIgnoresInvertColors />
      {/* A second, smaller picture in its corner, for words one picture can't show. */}
      {picture.badge && (
        <View style={[styles.badgeCircle, { right: -14 * scale, bottom: -6 * scale, width: circle, height: circle, borderRadius: circle / 2 }]}>
          <Image source={picture.badge} style={{ width: 30 * scale, height: 30 * scale }} accessibilityIgnoresInvertColors />
        </View>
      )}
    </View>
  );
}

// A word's picture on its card.
const PICTURE = 76;

function Meanings({ word }: { word: VocabWord }) {
  return (
    <View style={styles.meanings}>
      {word.meanings.map((meaning, i) => (
        <Text key={i} style={[styles.meaning, i > 0 && styles.meaningMore]}>
          {word.meanings.length > 1 ? `${i + 1}. ` : ''}
          {meaning}
        </Text>
      ))}
    </View>
  );
}

// The back of the card: its reading (for words with kanji), a picture if it has one, meanings,
// a memory tip, and an example sentence.
function Back({
  word,
  mnemonic,
  mnemonicPicture,
  onSpeak,
}: {
  word: VocabWord;
  mnemonic?: WordMnemonic | null;
  mnemonicPicture?: MnemonicPicture;
  onSpeak: () => void;
}) {
  return (
    <View style={styles.back}>
      {/* Its reading and how it's said in romaji: tap either to hear it. */}
      <Pressable role="button" aria-label={`Hear ${word.reading}`} onPress={onSpeak} style={styles.said} hitSlop={8}>
        <View style={styles.reading}>
          {word.reading !== word.word && <Text style={styles.readingText}>{word.reading}</Text>}
          <SpeakerIcon color={colors.ink2} size={20} />
        </View>
        <Text style={styles.romaji}>{romajiOf(word)}</Text>
      </Pressable>
      <Labels word={word} note />
      <WordPicture word={word} />
      <Meanings word={word} />
      {mnemonic && <Mnemonic mnemonic={mnemonic} picture={mnemonicPicture} />}
      {/* The example sentence: tap it (or its speaker) to hear it. */}
      {word.example && (
        <Pressable
          role="button"
          aria-label={`${furiganaText(word.example.ja)}: ${word.example.en}. Hear it`}
          onPress={() => word.example && speakWord(furiganaText(word.example.ja))}
          style={styles.example}>
          <View style={styles.exampleText}>
            <Furigana furigana={word.example.ja} size={19} />
            <Text style={styles.exampleEn}>{word.example.en}</Text>
          </View>
          <SpeakerIcon color={colors.muted} size={20} />
        </Pressable>
      )}
      {familiesOf(word).map((family) => (
        <Family key={family.id} family={family} word={word} />
      ))}
    </View>
  );
}

// A word's memory tip: its scene, the keyword it sounds like, and the tip. The scene's two
// pictures overlap, the keyword's and what it's doing, so they read as one scene.
function Mnemonic({ mnemonic, picture }: { mnemonic: WordMnemonic; picture?: MnemonicPicture }) {
  return (
    <View style={styles.mnemonic}>
      {picture && (
        <View style={styles.scene}>
          <Image source={picture.picture} style={styles.sceneMain} accessibilityIgnoresInvertColors />
          <Image source={picture.badge} style={styles.sceneWith} accessibilityIgnoresInvertColors />
        </View>
      )}
      <View style={styles.mnemonicText}>
        <Text style={styles.mnemonicTitle}>{mnemonic.keyword ? `Sounds like “${mnemonic.keyword}”` : 'Memory tip'}</Text>
        <Text style={styles.mnemonicTip}>{mnemonic.tip}</Text>
      </View>
    </View>
  );
}

// A word family the word is in ("Ways to say 'mother'"): open it to see every word in it and
// when each is used, with this one picked out.
function Family({ family, word }: { family: WordFamily; word: VocabWord }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.family}>
      <Pressable role="button" aria-expanded={open} onPress={() => setOpen(!open)} style={styles.familyHead}>
        <Text style={styles.familyTitle}>{family.title}</Text>
        <Text style={styles.familyToggle}>{open ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {open && (
        <>
          <Text style={styles.exampleEn}>{family.about}</Text>
          {family.members.map((m) => {
            const self = m.word === word.word && m.reading === word.reading;
            return (
              // Tap one to hear it, as it's read.
              <Pressable
                key={m.word}
                role="button"
                aria-label={`${m.word}, ${m.reading}: ${m.when} Hear it`}
                onPress={() => speakWord(m.reading)}
                style={[styles.member, self && styles.memberSelf]}>
                <View style={styles.memberText}>
                  <Text style={styles.memberWord}>
                    {m.word}
                    {m.reading !== m.word && <Text style={styles.memberReading}>  {m.reading}</Text>}
                  </Text>
                  <Text style={styles.memberWhen}>{m.when}</Text>
                </View>
                <SpeakerIcon color={colors.muted} size={18} />
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  );
}

// The word families a word is in.
function familiesOf(word: VocabWord): WordFamily[] {
  return WORD_FAMILIES.filter((f) => f.members.some((m) => m.word === word.word && m.reading === word.reading));
}

const styles = StyleSheet.create({
  frontSpeaker: {
    padding: 6,
  },
  hint: {
    marginTop: 'auto',
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.muted,
  },
  back: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 14,
  },
  said: {
    alignItems: 'center',
    gap: 4,
  },
  romaji: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: colors.ink2,
  },
  reading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingText: {
    fontFamily: fonts.jp,
    fontSize: 20,
    ...jpRoom(20),
    color: colors.ink2,
  },
  pictureImage: {
    width: '100%',
    height: '100%',
  },
  badgeCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  meanings: {
    alignSelf: 'stretch',
    gap: 4,
  },
  meaning: {
    textAlign: 'center',
    fontFamily: fonts.uiExtraBold,
    fontSize: 19,
    color: colors.sumi,
  },
  meaningMore: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  example: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
  mnemonic: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
  },
  scene: {
    width: 64,
    height: 64,
  },
  sceneMain: {
    width: 52,
    height: 52,
  },
  sceneWith: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
  },
  mnemonicText: {
    flex: 1,
    gap: 3,
  },
  mnemonicTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    color: colors.goldDark,
  },
  mnemonicTip: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.sumi,
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    overflow: 'hidden',
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    color: colors.indigoDark,
    backgroundColor: colors.indigoLight,
  },
  note: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.ink2,
  },
  family: {
    alignSelf: 'stretch',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
  familyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  familyTitle: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  familyToggle: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 8,
  },
  memberText: {
    flex: 1,
    gap: 2,
  },
  memberSelf: {
    backgroundColor: colors.goldLight,
  },
  memberWord: {
    fontFamily: fonts.jp,
    fontSize: 17,
    ...jpRoom(17),
    color: colors.sumi,
  },
  memberReading: {
    fontFamily: fonts.jp,
    fontSize: 12,
    ...jpRoom(12),
    color: colors.ink2,
  },
  memberWhen: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink2,
  },
  exampleText: {
    flex: 1,
    gap: 6,
  },
  exampleEn: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
});
