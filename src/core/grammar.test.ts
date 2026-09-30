import { EMPTY_PROGRESS, completeLesson, type Progress } from './answers';
import {
  checkAnswer,
  exerciseAnswer,
  formOptions,
  grammarId,
  grammarPath,
  lessonDone,
  parseRuby,
  rubyText,
  type Exercise,
  type GrammarLesson,
} from './grammar';

describe('lesson text with readings', () => {
  it('puts a reading over the kanji just before it', () => {
    expect(parseRuby('私[わたし]は学生[がくせい]です。')).toEqual([['私', 'わたし'], ['は'], ['学生', 'がくせい'], ['です。']]);
    expect(parseRuby('食[た]べる')).toEqual([['食', 'た'], ['べる']]);
  });

  it('leaves text without readings as it is', () => {
    expect(parseRuby('これはペンです。')).toEqual([['これはペンです。']]);
  });

  it('gives the text back without its readings', () => {
    expect(rubyText('私[わたし]は学生[がくせい]です。')).toBe('私は学生です。');
  });
});

describe('answers', () => {
  const particle: Exercise = { kind: 'choose', prompt: 'わたし＿がくせいです。', options: ['は', 'を', 'に', 'で'], answer: 'は', explain: 'は marks the topic.' };
  const order: Exercise = { kind: 'order', en: 'I am a student.', pieces: ['私[わたし]は', '学生[がくせい]', 'です。'], explain: '' };
  const form: Exercise = { kind: 'form', word: '帰る', reading: 'かえる', pos: ['v5r'], form: 'masu', prompt: 'Polite present', explain: '' };

  it('checks a choice', () => {
    expect(checkAnswer(particle, 'は')).toBe(true);
    expect(checkAnswer(particle, 'を')).toBe(false);
  });

  it('checks words put in order, piece by piece', () => {
    expect(checkAnswer(order, ['私[わたし]は', '学生[がくせい]', 'です。'])).toBe(true);
    expect(checkAnswer(order, ['学生[がくせい]', '私[わたし]は', 'です。'])).toBe(false);
  });

  it('checks a form by the conjugation rules', () => {
    expect(exerciseAnswer(form)).toBe('帰ります');
    expect(checkAnswer(form, '帰ります')).toBe(true);
    expect(checkAnswer(form, '帰ます')).toBe(false);
  });
});

describe('wrong options for a form', () => {
  it('are the mistakes a learner makes: the wrong kind of verb, or the wrong form', () => {
    const options = formOptions('帰る', ['v5r'], 'masu');
    expect(options).toContain('帰ります');
    expect(options).toContain('帰ます'); // as if it were a る-verb
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
  });

  it('works for adjectives too', () => {
    const options = formOptions('高い', ['adj-i'], { adjective: 'past', polite: true });
    expect(options).toContain('高かったです');
    expect(options).toContain('高いでした'); // a common mistake
    expect(new Set(options).size).toBe(4);
  });
});

describe('the grammar path', () => {
  const lesson = (id: string, unit: number): GrammarLesson => ({ id, unit, title: id, goal: '', sections: [], exercises: [], words: [] });
  const lessons = [lesson('a', 1), lesson('b', 1), lesson('c', 2)];

  it('opens the first lesson, and each next one once the one before is done', () => {
    expect(grammarPath(EMPTY_PROGRESS, lessons).map((l) => l.state)).toEqual(['current', 'locked', 'locked']);
    const done: Progress = completeLesson(EMPTY_PROGRESS, grammarId('a'), 1, 5);
    expect(lessonDone(done, 'a')).toBe(true);
    expect(grammarPath(done, lessons).map((l) => l.state)).toEqual(['done', 'current', 'locked']);
  });
});
