// Downloads the pictures for Word Forge's words: Microsoft's Fluent Emoji, in their 3D style
// (MIT licence, https://github.com/microsoft/fluentui-emoji). Each word in src/core/words.ts
// names its picture by an emoji; this maps each emoji to its Fluent Emoji folder, saves the
// pictures to assets/images/words/ with the licence, and writes src/constants/word-pictures.ts.
// Run it with `node scripts/fetch-word-pictures.mjs` after adding a word.

import { mkdirSync, writeFileSync } from 'node:fs';

const REPO = 'microsoft/fluentui-emoji';
const OUT = new URL('../assets/images/words/', import.meta.url);
const TABLE = new URL('../src/constants/word-pictures.ts', import.meta.url);

// Emoji → Fluent Emoji folder. Most folders are the emoji's everyday name. The set has no
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
};

const tree = await (await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`)).json();
const paths = tree.tree.map((entry) => entry.path);

mkdirSync(OUT, { recursive: true });
const lines = [];
for (const [emoji, folder] of Object.entries(FOLDERS)) {
  // Folders with skin tones keep the plain yellow one under Default.
  const png =
    paths.find((p) => p.startsWith(`assets/${folder}/3D/`) && p.endsWith('.png')) ??
    paths.find((p) => p.startsWith(`assets/${folder}/Default/3D/`) && p.endsWith('.png'));
  if (!png) throw new Error(`No 3D picture for ${emoji} in ${folder}`);
  const name = `${folder.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png`;
  const response = await fetch(`https://raw.githubusercontent.com/${REPO}/main/${encodeURI(png)}`);
  if (!response.ok) throw new Error(`Couldn't download ${png}`);
  writeFileSync(new URL(name, OUT), Buffer.from(await response.arrayBuffer()));
  lines.push(`  '${emoji}': require('../../assets/images/words/${name}'),`);
}

const license = await (await fetch(`https://raw.githubusercontent.com/${REPO}/main/LICENSE`)).text();
writeFileSync(new URL('LICENSE', OUT), `Fluent Emoji, by Microsoft: https://github.com/${REPO}\n\n${license}`);

writeFileSync(
  TABLE,
  `// Written by scripts/fetch-word-pictures.mjs: don't edit by hand.
// The picture for each word in Word Forge, by the emoji that names it (see src/core/words.ts).
// Microsoft's Fluent Emoji, MIT licence: see assets/images/words/LICENSE.
import type { ImageSourcePropType } from 'react-native';

export const WORD_PICTURES: Readonly<Record<string, ImageSourcePropType>> = {
${lines.join('\n')}
};
`,
);
console.log(`Saved ${lines.length} pictures.`);
