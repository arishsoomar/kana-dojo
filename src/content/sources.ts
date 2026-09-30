// Everything the app is built on that someone else made, with its licence: shown on the
// Sources screen (Settings, About: sources), which the licences ask for.

export type Source = {
  name: string;
  by: string;
  what: string; // what the app uses it for
  licence: string;
  licenceUrl: string;
  url: string;
};

export const SOURCES: readonly Source[] = [
  {
    name: 'JMdict',
    by: 'the Electronic Dictionary Research and Development Group',
    what: "The word deck's readings, meanings and parts of speech. The deck (src/content/vocab.json) is under the same licence.",
    licence: 'CC BY-SA 4.0',
    licenceUrl: 'https://www.edrdg.org/edrdg/licence.html',
    url: 'https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project',
  },
  {
    name: 'Jiten frequency list',
    by: 'jiten.moe',
    what: 'Which words are in the word deck, and in what order: how often each is used in anime, drama, films, novels and more.',
    licence: 'CC BY-SA 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    url: 'https://jiten.moe/frequency-dictionaries',
  },
  {
    name: 'JmdictFurigana',
    by: 'Doublevil',
    what: 'Which part of a reading goes over which kanji, for furigana.',
    licence: 'CC BY-SA 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    url: 'https://github.com/Doublevil/JmdictFurigana',
  },
  {
    name: 'Tatoeba',
    by: 'the Tatoeba community',
    what: "The word deck's example sentences and their translations.",
    licence: 'CC BY 2.0 FR',
    licenceUrl: 'https://creativecommons.org/licenses/by/2.0/fr/deed.en',
    url: 'https://tatoeba.org',
  },
  {
    name: 'KanjiVG',
    by: 'Ulrich Apel',
    what: 'The stroke order of each kana, for calligraphy.',
    licence: 'CC BY-SA 3.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    url: 'https://kanjivg.tagaini.net',
  },
  {
    name: 'Fluent Emoji',
    by: 'Microsoft',
    what: "The pictures for Word Forge's words and the kana's memory tips.",
    licence: 'MIT',
    licenceUrl: 'https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE',
    url: 'https://github.com/microsoft/fluentui-emoji',
  },
];
