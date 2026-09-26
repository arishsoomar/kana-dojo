// Downloads the app's pictures: Microsoft's Fluent Emoji, in their 3D style (MIT licence,
// https://github.com/microsoft/fluentui-emoji). They're for Word Forge's words (each word in
// src/core/words.ts names its picture by an emoji) and for the 46 basic kana in each script
// (the mnemonic pictures). This saves them to assets/images/pictures/ with the licence, and
// writes src/constants/word-pictures.ts and src/constants/kana-pictures.ts.
// Run it with `node scripts/fetch-pictures.mjs` after adding a word or changing a picture.

import { mkdirSync, writeFileSync } from 'node:fs';

const REPO = 'microsoft/fluentui-emoji';
const OUT = new URL('../assets/images/pictures/', import.meta.url);
const WORD_TABLE = new URL('../src/constants/word-pictures.ts', import.meta.url);
const KANA_TABLE = new URL('../src/constants/kana-pictures.ts', import.meta.url);

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

const tree = await (await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`)).json();
const paths = tree.tree.map((entry) => entry.path);

mkdirSync(OUT, { recursive: true });

// Downloads a folder's 3D picture once, and returns its file name.
const saved = new Map();
async function download(folder) {
  if (saved.has(folder)) return saved.get(folder);
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

const wordLines = [];
for (const [emoji, folder] of Object.entries(FOLDERS)) {
  wordLines.push(`  '${emoji}': require('../../assets/images/pictures/${await download(folder)}'),`);
}
const kanaLines = [];
for (const [kana, folder] of Object.entries(KANA_FOLDERS)) {
  kanaLines.push(`  ${kana}: require('../../assets/images/pictures/${await download(folder)}'),`);
}

const license = await (await fetch(`https://raw.githubusercontent.com/${REPO}/main/LICENSE`)).text();
writeFileSync(new URL('LICENSE', OUT), `Fluent Emoji, by Microsoft: https://github.com/${REPO}\n\n${license}`);

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
console.log(`Saved ${saved.size} pictures.`);
