// Downloads the app's pictures: Microsoft's Fluent Emoji, in their 3D style (MIT licence,
// https://github.com/microsoft/fluentui-emoji). They're for Word Forge's words (each word in
// src/core/words.ts names its picture by an emoji) and for the 46 basic kana in each script
// (the mnemonic pictures), and for some of the word deck's words, with Google's Noto Emoji for
// country flags (Apache licence). This saves them to assets/images/pictures/ with the licences,
// and writes src/constants/word-pictures.ts, src/constants/kana-pictures.ts and
// src/constants/vocab-pictures.ts.
// Run it with `node scripts/fetch-pictures.mjs` after adding a word or changing a picture.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

import { GENKI_PICTURES } from './genki-pictures.mjs';

const REPO = 'microsoft/fluentui-emoji';
const NOTO = 'googlefonts/noto-emoji';
const OUT = new URL('../assets/images/pictures/', import.meta.url);
const WORD_TABLE = new URL('../src/constants/word-pictures.ts', import.meta.url);
const KANA_TABLE = new URL('../src/constants/kana-pictures.ts', import.meta.url);
const VOCAB_TABLE = new URL('../src/constants/vocab-pictures.ts', import.meta.url);

// Word Forge: emoji → Fluent Emoji folder. Most folders are the emoji's everyday name. The set has no
// country flags, so the countries use something they're known for (🗽 for America).
const FOLDERS = {
  '❤️': 'Red heart',
  '🔵': 'Blue circle',
  '🔴': 'Red circle',
  '🍂': 'Fallen leaf',
  '🌅': 'Sunrise',
  '🦵': 'Leg',
  '🌧️': 'Cloud with rain',
  '🏠': 'House',
  '🦆': 'Duck',
  '🪑': 'Chair',
  '🐶': 'Dog face',
  '⏰': 'Alarm clock',
  '⬆️': 'Up arrow',
  '🎵': 'Musical note',
  '🌊': 'Water wave',
  '🚉': 'Station',
  '👹': 'Ogre',
  '😊': 'Smiling face with smiling eyes',
  '☂️': 'Umbrella',
  '📄': 'Page facing up',
  '🛶': 'Canoe',
  '👄': 'Mouth',
  '☁️': 'Cloud',
  '🚗': 'Automobile',
  '🗣️': 'Speaking head',
  '📍': 'Round pushpin',
  '🐟': 'Fish',
  '🧂': 'Salt',
  '⬇️': 'Down arrow',
  '🍣': 'Sushi',
  '🌤️': 'Sun behind small cloud',
  '🐙': 'Octopus',
  '🌙': 'Crescent moon',
  '🖥️': 'Desktop computer',
  '🐦': 'Bird',
  '☀️': 'Sun',
  '📛': 'Name badge',
  '🍖': 'Meat on bone',
  '🐱': 'Cat face',
  '🌸': 'Cherry blossom',
  '🥢': 'Chopsticks',
  '🌷': 'Tulip',
  '🧑': 'Person',
  '⛵': 'Sailboat',
  '⛄': 'Snowman without snow',
  '🛏️': 'Bed',
  '⭐': 'Star',
  '📖': 'Open book',
  '👂': 'Ear',
  '🐛': 'Bug',
  '🌲': 'Evergreen tree',
  '⛰️': 'Mountain',
  '❄️': 'Snowflake',
  '🌃': 'Night with stars',
  '🐊': 'Crocodile',
  '🔑': 'Key',
  '🌬️': 'Wind face',
  '💧': 'Droplet',
  '🪟': 'Window',
  '🗺️': 'World map',
  '🥚': 'Egg',
  '🍎': 'Red apple',
  '🍚': 'Cooked rice',
  '☎️': 'Telephone',
  '🗾': 'Map of japan',
  '💬': 'Speech balloon',
  '✍️': 'Writing hand',
  '🔠': 'Input latin uppercase',
  '🤝': 'Handshake',
  '🧑‍🏫': 'Teacher',
  '🙏': 'Folded hands',
  '🌞': 'Sun with face',
  '🙇': 'Person bowing',
  '🚶': 'Person walking',
  '🍤': 'Fried shrimp',
  '🚃': 'Railway car',
  '🖼️': 'Framed picture',
  '🩺': 'Stethoscope',
  '🍵': 'Teacup without handle',
  '📕': 'Closed book',
  '📅': 'Calendar',
  '🏛️': 'Classical building',
  '✏️': 'Pencil',
  '🧳': 'Luggage',
  '💯': 'Hundred points',
  '🐠': 'Tropical fish',
  '📷': 'Camera',
  '📺': 'Television',
  '📻': 'Radio',
  '🎹': 'Musical keyboard',
  '🍅': 'Tomato',
  '🍌': 'Banana',
  '🍈': 'Melon',
  '🍋': 'Lemon',
  '🍞': 'Bread',
  '🖊️': 'Pen',
  '🏨': 'Hotel',
  '🗽': 'Statue of liberty',
  '🍁': 'Maple leaf',
  '💂': 'Guard',
  '🥨': 'Pretzel',
  '🪆': 'Nesting dolls',
  '🐼': 'Panda',
  '🦁': 'Lion',
  '🦒': 'Giraffe',
  '🦍': 'Gorilla',
  '🔪': 'Kitchen knife',
  '🎾': 'Tennis',
  '⛳': 'Flag in hole',
  '🍕': 'Pizza',
  '🍝': 'Spaghetti',
  '🥓': 'Bacon',
  '🍗': 'Poultry leg',
  '🥛': 'Glass of milk',
  '🚪': 'Door',
  '🏞️': 'National park',
  '🎀': 'Ribbon',
  '🎬': 'Clapper board',
  '📚': 'Books',
  '🎤': 'Microphone',
  '👕': 'T-shirt',
  '🍓': 'Strawberry',
  '✉️': 'Envelope',
  '🏫': 'School',
  '📰': 'Newspaper',
  '🎫': 'Ticket',
  '📔': 'Notebook with decorative cover',
  '🧼': 'Soap',
  '🎺': 'Trumpet',
  '🤏': 'Pinching hand',
  '🍃': 'Leaf fluttering in wind',
  '💒': 'Wedding',
  '♨️': 'Hot springs',
  '☕': 'Hot beverage',
  '⚽': 'Soccer ball',
  '🎮': 'Video game',
  '🍰': 'Shortcake',
  '🥣': 'Bowl with spoon',
  '🧃': 'Beverage box',
  '🍺': 'Beer mug',
  '🏐': 'Volleyball',
  '📓': 'Notebook',
  '🛒': 'Shopping cart',
  '🚕': 'Taxi',
  '🚌': 'Bus',
  '📧': 'E-mail',
  '🍛': 'Curry rice',
  '🍜': 'Steaming bowl',
  '🍨': 'Ice cream',
  '🧀': 'Cheese wedge',
  '🧥': 'Coat',
  '💻': 'Laptop',
  '🤖': 'Robot',
  '🛏️': 'Bed',
  '🥤': 'Cup with straw',
  '🌭': 'Hot dog',
  '🍪': 'Cookie',
  '🚁': 'Helicopter',
  '🛗': 'Elevator',
  '🍔': 'Hamburger',
  '🥄': 'Spoon',
  '🎸': 'Guitar',
  '🫑': 'Bell pepper',
  '🍩': 'Doughnut',
  '💖': 'Sparkling heart',
  '⛷️': 'Skier',
  '🐨': 'Koala',
  '🐧': 'Penguin',
  '🚽': 'Toilet',
  '🥪': 'Sandwich',
  '🛋️': 'Couch and lamp',
  '🎉': 'Party popper',
  '🍴': 'Fork and knife',
  '🫖': 'Teapot',
  '✈️': 'Airplane',
  '🎞️': 'Film frames',
  '♟️': 'Chess pawn',
  '🧑‍🍳': 'Cook',
  '🎢': 'Roller coaster',
  '🧻': 'Roll of paper',
  '🍽️': 'Fork and knife with plate',
  '⛴️': 'Ferry',
};

// The mnemonic picture for each basic kana: kana → Fluent Emoji folder. Each matches the kana's
// tip in src/core/tips.ts.
const KANA_FOLDERS = {
  あ: 'Person cartwheeling', // 🤸
  い: 'Ice', // 🧊
  う: 'Face with open mouth', // 😮
  え: 'Face with raised eyebrow', // 🤨
  お: 'Astonished face', // 😲
  か: 'Martial arts uniform', // 🥋
  き: 'Key', // 🔑
  く: 'Bird', // 🐦
  け: 'Beer mug', // 🍺
  こ: 'Coin', // 🪙
  さ: 'Horse', // 🐎
  し: 'Fishing pole', // 🎣
  す: 'Cup with straw', // 🥤
  せ: 'Sunset', // 🌇
  そ: 'Thread', // 🧵
  た: 'Fork and knife with plate', // 🍽️
  ち: 'Hamster', // 🐹
  つ: 'Water wave', // 🌊
  て: 'Raised back of hand', // 🤚
  と: 'Foot', // 🦶
  な: 'Folded hands', // 🙏
  に: 'Leg', // 🦵
  ぬ: 'Steaming bowl', // 🍜
  ね: 'Cat', // 🐈
  の: 'No entry', // ⛔
  は: 'Grinning squinting face', // 😆
  ひ: 'Beaming face with smiling eyes', // 😁
  ふ: 'Mount fuji', // 🗻
  へ: 'Mountain', // ⛰️
  ほ: 'Santa claus', // 🎅
  ま: 'Sailboat', // ⛵
  み: 'Birthday cake', // 🎂
  む: 'Cow', // 🐄
  め: 'Eye', // 👁️
  も: 'Fish', // 🐟
  や: 'Water buffalo', // 🐃
  ゆ: 'Right arrow curving left', // ↩️
  よ: 'Yo-yo', // 🪀
  ら: 'Rabbit', // 🐇
  り: 'Sheaf of rice', // 🌾
  る: 'Motorway', // 🛣️
  れ: 'Person running', // 🏃
  ろ: 'Railway track', // 🛤️
  わ: 'Duck', // 🦆
  を: 'Horse face', // 🐴
  ん: 'Input latin lowercase', // 🔡
  ア: 'Axe', // 🪓
  イ: 'Artist palette', // 🎨
  ウ: 'Hut', // 🛖
  エ: 'Elevator', // 🛗
  オ: 'Canoe', // 🛶
  カ: 'Martial arts uniform', // 🥋
  キ: 'Old key', // 🗝️
  ク: 'Baby chick', // 🐤
  ケ: 'Teapot', // 🫖
  コ: 'Triangular ruler', // 📐
  サ: 'Carpentry saw', // 🪚
  シ: 'Smiling face with smiling eyes', // 😊
  ス: 'Person in suit levitating', // 🕴️
  セ: 'Sunrise over mountains', // 🌄
  ソ: 'Sewing needle', // 🪡
  タ: 'Tent', // ⛺
  チ: 'Megaphone', // 📣
  ツ: 'Water wave', // 🌊
  テ: 'Telephone receiver', // 📞
  ト: 'Tomato', // 🍅
  ナ: 'Kitchen knife', // 🔪
  ニ: 'Victory hand', // ✌️
  ヌ: 'Chopsticks', // 🥢
  ネ: 'Goal net', // 🥅
  ノ: 'Person gesturing no', // 🙅
  ハ: 'Face with tears of joy', // 😂
  ヒ: 'High-heeled shoe', // 👠
  フ: 'Mount fuji', // 🗻
  ヘ: 'Mountain', // ⛰️
  ホ: 'Church', // ⛪
  マ: 'Hatching chick', // 🐣
  ミ: 'Mouse face', // 🐭
  ム: 'Cow face', // 🐮
  メ: 'Cross mark', // ❌
  モ: 'Tropical fish', // 🐠
  ヤ: 'Ox', // 🐂
  ユ: 'Left arrow curving right', // ↪️
  ヨ: 'Yo-yo', // 🪀
  ラ: 'Rabbit face', // 🐰
  リ: 'Sheaf of rice', // 🌾
  ル: 'Person running', // 🏃
  レ: 'Check mark', // ✔️
  ロ: 'Lion', // 🦁
  ワ: 'Water wave', // 🌊
  ヲ: 'Horse face', // 🐴
  ン: 'Nose', // 👃
};

// Word deck cards: word (as the deck writes it) → its picture, shown on the back of the card.
// GENKI I's first words, before lesson 1 and lesson 1. A picture is a Fluent Emoji folder, or
// `flag:JP` for a country's flag (Noto's 3D flags: Fluent has none). Words no one picture shows
// get two: [picture, badge], the badge small in its corner: 日本人 is a person with a Japanese
// flag, and an older sister (お姉さん) a girl with an up arrow.
const VOCAB_FOLDERS = {
  // Before lesson 1: greetings and numbers.
  おはよう: 'Sunrise', // 🌅
  おはようございます: 'Sunrise',
  こんにちは: 'Sun', // ☀️
  こんばんは: 'Crescent moon', // 🌙
  おやすみ: 'Sleeping face', // 😴
  おやすみなさい: 'Sleeping face',
  さようなら: 'Waving hand', // 👋
  ありがとう: 'Folded hands', // 🙏
  ありがとうございます: 'Folded hands',
  すみません: 'Person bowing', // 🙇
  いいえ: 'Person gesturing no', // 🙅
  いってきます: 'Person walking', // 🚶
  いってらっしゃい: 'Door', // 🚪
  ただいま: 'House', // 🏠
  おかえり: 'House',
  おかえりなさい: 'House',
  いただきます: 'Cooked rice', // 🍚
  ごちそうさま: 'Face savoring food', // 😋
  ごちそうさまでした: 'Face savoring food',
  はじめまして: ['Waving hand', 'Sparkles'], // 👋 ✨: a first hello
  よろしくお願いします: 'Handshake', // 🤝
  ゼロ: 'Keycap 0',
  零: 'Keycap 0',
  一: 'Keycap 1',
  二: 'Keycap 2',
  三: 'Keycap 3',
  四: 'Keycap 4',
  五: 'Keycap 5',
  六: 'Keycap 6',
  七: 'Keycap 7',
  八: 'Keycap 8',
  九: 'Keycap 9',
  十: 'Keycap 10',
  // Built like their kanji: 十一 is ten and one (🔟 with 1️⃣), 二十 is two tens (2️⃣ with 🔟).
  ...Object.fromEntries(['一', '二', '三', '四', '五', '六', '七', '八', '九'].map((n, i) => [`十${n}`, ['Keycap 10', `Keycap ${i + 1}`]])),
  ...Object.fromEntries(['二', '三', '四', '五', '六', '七', '八', '九'].map((n, i) => [`${n}十`, [`Keycap ${i + 2}`, 'Keycap 10']])),
  百: 'Hundred points', // 💯
  '～です': 'Speaking head', // 🗣️: I am …
  // Lesson 1: new friends.
  '～年生': ['Student', 'Input numbers'], // 🧑‍🎓 🔢: … year student
  一年生: ['Student', 'Keycap 1'], // 🧑‍🎓 1️⃣
  '～さん': 'Bust in silhouette', // 👤: Mr./Ms. …
  '～人': ['Bust in silhouette', 'Globe showing americas'], // 👤 🌎: … people
  '～時': 'Alarm clock', // ⏰: o'clock
  一時: 'One oclock', // 🕐
  二時半: 'Two-thirty', // 🕝
  '～語': 'Speech balloon', // 💬: … language
  '～歳': 'Birthday cake', // 🎂: … years old
  '～番': 'Keycap hashtag', // #️⃣: number …
  そうです: 'Thumbs up', // 👍: that's right
  そうですか: 'Light bulb', // 💡: I see
  アジア研究: ['Globe showing asia-australia', 'Books'], // 🌏 📚
  工学: 'Gear', // ⚙️
  生物学: 'Microscope', // 🔬
  看護師: 'Syringe', // 💉
  私: 'Person raising hand', // 🙋: me!
  何: 'Red question mark', // ❓
  今: 'Watch', // ⌚
  あのう: 'Thinking face', // 🤔: um…
  はい: 'Check mark button', // ✅
  ええ: 'Person gesturing ok', // 🙆
  半: 'Three-thirty', // 🕞: half past
  午前: 'Sunrise over mountains', // 🌄
  午後: 'Sunset', // 🌇
  仕事: 'Briefcase', // 💼
  名前: 'Name badge', // 📛
  先生: 'Teacher', // 🧑‍🏫
  友達: 'People hugging', // 🫂
  お母さん: 'Woman', // 👩
  お父さん: 'Man', // 👨
  お姉さん: ['Girl', 'Up arrow'], // 👧 ⬆️: older sister
  妹: ['Girl', 'Down arrow'], // 👧 ⬇️: younger sister
  お兄さん: ['Boy', 'Up arrow'], // 👦 ⬆️
  弟: ['Boy', 'Down arrow'], // 👦 ⬇️
  主婦: 'Woman cook', // 👩‍🍳
  電話: 'Telephone', // ☎️
  大学: 'Classical building', // 🏛️
  大学生: 'Graduation cap', // 🎓
  大学院生: 'Scientist', // 🧑‍🔬
  学生: 'Student', // 🧑‍🎓
  高校: 'School', // 🏫
  高校生: 'Backpack', // 🎒
  留学生: 'Airplane', // ✈️
  専攻: ['Open book', 'Graduation cap'], // 📖 🎓: what you study at university
  歴史: 'Scroll', // 📜
  医者: 'Health worker', // 🧑‍⚕️
  番号: 'Input numbers', // 🔢
  英語: 'Input latin letters', // 🔤
  弁護士: 'Judge', // 🧑‍⚖️
  政治: 'Ballot box with ballot', // 🗳️
  ビジネス: 'Office building', // 🏢
  会社員: 'Office worker', // 🧑‍💼
  経済: 'Chart increasing', // 📈
  コンピューター: 'Laptop', // 💻
  文学: 'Books', // 📚
  国際関係: 'Globe with meridians', // 🌐
  日本: 'flag:JP',
  日本人: ['Person', 'flag:JP'], // 🧑 🇯🇵
  日本語: ['Speech balloon', 'flag:JP'], // 💬 🇯🇵
  アメリカ: 'flag:US',
  イギリス: 'flag:GB',
  中国: 'flag:CN',
  韓国: 'flag:KR',
  カナダ: 'flag:CA',
  オーストラリア: 'flag:AU',
  エジプト: 'flag:EG',
  インド: 'flag:IN',
  フィリピン: 'flag:PH',
};

// The rest of the GENKI cards' pictures, from lesson 2 on.
Object.assign(VOCAB_FOLDERS, GENKI_PICTURES);

const tree = await (await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`)).json();
const paths = tree.tree.map((entry) => entry.path);

// Every folder named, checked before anything is downloaded, so all typos show at once.
const folderNames = new Set(paths.map((p) => p.split('/')[1]));
const named = [...Object.values(FOLDERS), ...Object.values(KANA_FOLDERS), ...Object.values(VOCAB_FOLDERS).flat()];
const unknown = [...new Set(named.filter((f) => !f.startsWith('flag:') && !folderNames.has(f)))];
if (unknown.length > 0) throw new Error(`No such Fluent Emoji folders: ${unknown.join(', ')}`);

mkdirSync(OUT, { recursive: true });

// Downloads a folder's 3D picture once, and returns its file name.
const saved = new Map();
async function download(folder) {
  if (saved.has(folder)) return saved.get(folder);
  if (folder.startsWith('flag:')) return downloadFlag(folder);
  // Folders with skin tones keep the plain yellow one under Default.
  const png =
    paths.find((p) => p.startsWith(`assets/${folder}/3D/`) && p.endsWith('.png')) ??
    paths.find((p) => p.startsWith(`assets/${folder}/Default/3D/`) && p.endsWith('.png'));
  if (!png) throw new Error(`No 3D picture in ${folder}`);
  const name = `${folder.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png`;
  const response = await fetch(`https://raw.githubusercontent.com/${REPO}/main/${encodeURI(png)}`);
  if (!response.ok) throw new Error(`Couldn't download ${png}`);
  writeFileSync(new URL(name, OUT), Buffer.from(await response.arrayBuffer()));
  saved.set(folder, name);
  return name;
}

// A country's flag, from Noto's 3D emoji (Apache licence), made the size of Fluent's pictures.
// A flag emoji is the country's two letters as "regional indicator" letters: JP is 🇯 🇵.
async function downloadFlag(folder) {
  const country = folder.slice('flag:'.length);
  const code = [...country].map((letter) => (0x1f1e6 + letter.charCodeAt(0) - 65).toString(16)).join('_');
  const response = await fetch(`https://raw.githubusercontent.com/${NOTO}/main/3D/png/512/emoji_u${code}.png`);
  if (!response.ok) throw new Error(`Couldn't download the flag of ${country}`);
  const name = `flag_${country.toLowerCase()}.png`;
  const file = new URL(name, OUT);
  writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  execFileSync('sips', ['-Z', '256', file.pathname], { stdio: 'ignore' });
  saved.set(folder, name);
  return name;
}

const wordLines = [];
for (const [emoji, folder] of Object.entries(FOLDERS)) {
  wordLines.push(`  '${emoji}': require('../../assets/images/pictures/${await download(folder)}'),`);
}
const kanaLines = [];
for (const [kana, folder] of Object.entries(KANA_FOLDERS)) {
  kanaLines.push(`  ${kana}: require('../../assets/images/pictures/${await download(folder)}'),`);
}

const vocabLines = [];
const required = async (folder) => `require('../../assets/images/pictures/${await download(folder)}')`;
for (const [word, folders] of Object.entries(VOCAB_FOLDERS)) {
  const [picture, badge] = Array.isArray(folders) ? folders : [folders];
  vocabLines.push(`  ${JSON.stringify(word)}: { picture: ${await required(picture)}${badge ? `, badge: ${await required(badge)}` : ''} },`);
}

const license = await (await fetch(`https://raw.githubusercontent.com/${REPO}/main/LICENSE`)).text();
writeFileSync(new URL('LICENSE', OUT), `Fluent Emoji, by Microsoft: https://github.com/${REPO}\n\n${license}`);
const notoLicense = await (await fetch(`https://raw.githubusercontent.com/${NOTO}/main/LICENSE`)).text();
writeFileSync(new URL('LICENSE-flags', OUT), `The flags (flag_*.png): Noto Emoji, by Google: https://github.com/${NOTO}\n\n${notoLicense}`);

writeFileSync(
  WORD_TABLE,
  `// Written by scripts/fetch-pictures.mjs: don't edit by hand.
// The picture for each word in Word Forge, by the emoji that names it (see src/core/words.ts).
// Microsoft's Fluent Emoji, MIT licence: see assets/images/pictures/LICENSE.
import type { ImageSourcePropType } from 'react-native';

export const WORD_PICTURES: Readonly<Record<string, ImageSourcePropType>> = {
${wordLines.join('\n')}
};
`,
);
writeFileSync(
  KANA_TABLE,
  `// Written by scripts/fetch-pictures.mjs: don't edit by hand.
// The mnemonic picture for each of the 46 basic kana in each script, matching its tip in
// src/core/tips.ts. Other kana use their base kana's (see mnemonicBase there).
// Microsoft's Fluent Emoji, MIT licence: see assets/images/pictures/LICENSE.
import type { ImageSourcePropType } from 'react-native';

export const KANA_PICTURES: Readonly<Record<string, ImageSourcePropType>> = {
${kanaLines.join('\n')}
};
`,
);
writeFileSync(
  VOCAB_TABLE,
  `// Written by scripts/fetch-pictures.mjs: don't edit by hand.
// A picture for some of the word deck's words, by the word as the deck writes it, shown on the
// back of its card; some with a badge in its corner (日本人: a person, with a Japanese flag).
// Microsoft's Fluent Emoji, MIT licence: see assets/images/pictures/LICENSE. The flags are
// Google's Noto Emoji, Apache licence: see assets/images/pictures/LICENSE-flags.
import type { ImageSourcePropType } from 'react-native';

export type VocabPicture = { picture: ImageSourcePropType; badge?: ImageSourcePropType };

export const VOCAB_PICTURES: Readonly<Record<string, VocabPicture>> = {
${vocabLines.join('\n')}
};
`,
);
console.log(`Saved ${saved.size} pictures.`);
