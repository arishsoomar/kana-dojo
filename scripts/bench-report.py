# Sums up a flashcard benchmark run (src/dev/bench.ts): how smooth each turn of a card was,
# and whether each word was said, and how soon. Run it with
# `python3 scripts/bench-report.py results.jsonl`.
import json
import statistics
import sys

events = [json.loads(line) for line in open(sys.argv[1]) if line.strip()]
turns = [e for e in events if e['ev'] == 'turn']
taps = {(e['card'], e['turn']): e for e in events if e['ev'] == 'tap'}
handled = [e['jsMs'] for e in events if e['ev'] == 'tap-handled']

print(f"{len(turns)} turns over {len({t['card'] for t in turns})} cards")
if turns:
    gaps = [t['maxGap'] for t in turns]
    late = [t['late'] for t in turns]
    print(f"  longest frame gap per turn: median {statistics.median(gaps)}ms, worst {max(gaps)}ms")
    print(f"  turns with a dropped frame (a gap of 25ms or more): {sum(1 for n in late if n)} of {len(turns)}")
    print(f"  turns with a long stall (34ms or more): {sum(1 for t in turns if t['veryLate'])} of {len(turns)}")
    print(f"  dropped frames in all: {sum(late)}")
    # What was being drawn around each dropped frame (a card's back, or a card arriving).
    timeline = sorted(events, key=lambda e: e['t'])
    tap_at = {(e['card'], e['turn']): e['t'] for e in timeline if e['ev'] == 'tap'}
    for t in [t for t in turns if t['late']][:12]:
        t0 = tap_at[(t['card'], t['turn'])]
        near = [(e['ev'], e['t'] - t0) for e in timeline if e['ev'] in ('back-drawn', 'card-shown') and t0 - 120 <= e['t'] <= t['t']]
        print(f"    card {t['card']} turn {t['turn']}: {t['late']} dropped, worst {t['maxGap']}ms; drawn around it (ms from the tap): {near}")
    shown = [e for e in events if e['ev'] == 'card-shown']
    if shown:
        print(f"  cards that came up with their back already drawn: {sum(1 for e in shown if e.get('backDrawn'))} of {len(shown)}")
if handled:
    print(f"  JS time handling a tap: median {statistics.median(handled)}ms, worst {max(handled)}ms")

# Each turn to the Japanese side (turns 0 and 2) should say the word once.
said = [e for e in events if e['ev'] == 'speak']
playing = [e for e in events if e['ev'] == 'playing']
over = [(c, t) for (c, t) in taps if t in (0, 2)]
print(f"\nwords asked for: {len(said)} (turns to the Japanese side: {len(over)})")
print(f"  by recording: {sum(1 for e in said if e['via'] == 'recording')}, by the phone's voice: {sum(1 for e in said if e['via'] != 'recording')}")
print(f"  errors: {sum(1 for e in events if e['ev'] == 'audio-error')}, started again after not starting: {sum(1 for e in events if e['ev'] == 'audio-retry')}")

# For each tap to the Japanese side: was a word asked for before the next tap, and did it play?
ordered = sorted(events, key=lambda e: e['t'])
missed, delays = [], []
for i, e in enumerate(ordered):
    if e['ev'] != 'tap' or e['turn'] not in (0, 2):
        continue
    window = []
    for f in ordered[i + 1:]:
        if f['ev'] in ('tap', 'start', 'done'):
            break
        window.append(f)
    asked = [f for f in window if f['ev'] == 'speak']
    started = [f for f in window if f['ev'] == 'playing']
    if not asked or not started:
        missed.append((e['card'], e['turn'], 'not asked' if not asked else 'asked, never played'))
    else:
        delays.append(started[0]['t'] - e['t'])
print(f"  turns where the word wasn't heard: {len(missed)} {missed[:10]}")
if delays:
    print(f"  tap to sound: median {statistics.median(delays)}ms, worst {max(delays)}ms")
