import { WORDS } from '@/core/words';

import { WORD_PICTURES } from './word-pictures';

describe('word pictures', () => {
  it('has a picture for every word', () => {
    const missing = WORDS.filter((w) => WORD_PICTURES[w.picture] === undefined).map((w) => w.text);
    expect(missing).toEqual([]);
  });
});
