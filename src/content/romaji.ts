import { hepburn } from '@/core/hepburn';
import type { VocabWord } from '@/core/vocab';

// How a word is said, in romaji, for English readers: おはようございます is "ohayō gozaimasu".
// Worked out from the reading (src/core/hepburn.ts), except where that can't know: phrases,
// written with a space between their words and particles (たばこをすう is "tabako o suu", not
// "tabakōsū"); は read "wa" as a particle (こんにちは); and words made of two whose sounds meet
// (みずうみ is mizu + umi, not mizūmi). By reading.
const SAID: Readonly<Record<string, string>> = {
  おはようございます: 'ohayō gozaimasu',
  こんにちは: 'konnichiwa',
  こんばんは: 'konbanwa',
  おやすみなさい: 'oyasumi nasai',
  ありがとうございます: 'arigatō gozaimasu',
  いってきます: 'itte kimasu',
  いってらっしゃい: 'itte rasshai',
  おかえりなさい: 'okaeri nasai',
  ごちそうさまでした: 'gochisōsama deshita',
  よろしくおねがいします: 'yoroshiku onegai shimasu',
  ごめんなさい: 'gomen nasai',
  ひとりで: 'hitori de',
  いっしょに: 'issho ni',
  あとで: 'ato de',
  つれてくる: 'tsurete kuru',
  もってくる: 'motte kuru',
  もっていく: 'motte iku',
  おとこのひと: 'otoko no hito',
  おんなのひと: 'onna no hito',
  きをつける: 'ki o tsukeru',
  みずうみ: 'mizuumi',
  にじはん: 'niji han',
  アジアけんきゅう: 'ajia kenkyū',
  をおねがいします: 'o onegai shimasu',
  をください: 'o kudasai',
  たばこをすう: 'tabako o suu',
  シャワーをあびる: 'shawā o abiru',
  せがたかい: 'se ga takai',
  せがひくい: 'se ga hikui',
  あたまがいい: 'atama ga ii',
  しっています: 'shitte imasu',
  ふとっています: 'futotte imasu',
  やせています: 'yasete imasu',
  めがねをかける: 'megane o kakeru',
  おそくなる: 'osoku naru',
  おふろにはいる: 'ofuro ni hairu',
  みんなで: 'minna de',
  について: 'ni tsuite',
  くすりをのむ: 'kusuri o nomu',
  にんきがある: 'ninki ga aru',
  うそをつく: 'uso o tsuku',
  おなかがすく: 'onaka ga suku',
  スポーツせんしゅ: 'supōtsu senshu',
  うちゅうひこうし: 'uchū hikōshi',
  かぜをひく: 'kaze o hiku',
  ねつがある: 'netsu ga aru',
  のどがかわく: 'nodo ga kawaku',
  きょうみがある: 'kyōmi ga aru',
  せきがでる: 'seki ga deru',
  げんきがない: 'genki ga nai',
  おだいじに: 'odaiji ni',
  できるだけ: 'dekiru dake',
  にさんにち: 'ni-san nichi',
  べつに: 'betsu ni',
};

function said(reading: string, verbU: boolean): string {
  const known = SAID[reading];
  if (known) return known;
  // A する verb: its noun, then suru (べんきょうする is "benkyō suru").
  if (reading.length > 2 && reading.endsWith('する')) return `${said(reading.slice(0, -2), false)} suru`;
  // A phrase ending in です: そうですか is "sō desu ka".
  const desu = reading.match(/^(.+)です(か|ね)?$/);
  if (desu?.[1]) return `${said(desu[1], false)} desu${desu[2] ? ` ${desu[2] === 'か' ? 'ka' : 'ne'}` : ''}`;
  return hepburn(reading, { verbU }) ?? '';
}

export function romajiOf(word: VocabWord): string {
  // A verb ending in う (思う, omou): its う is a sound of its own.
  const verbU = word.pos.some((p) => p === 'v5u' || p === 'v5u-s');
  const romaji = said(word.reading, verbU);
  // A suffix or prefix (～さん) is written with a hyphen: -san.
  const before = /^[～〜]/.test(word.word) ? '-' : '';
  const after = /[～〜]$/.test(word.word) && word.word.length > 1 ? '-' : '';
  return `${before}${romaji}${after}`;
}
