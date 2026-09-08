# Wanna hang out? 💕

A tiny single-page pixel-art web app for asking someone to hang out.
No backend, no build step, no dependencies — just open `index.html`.

## The flow

1. **Loading screen** — a crowd of hopping pixel animals and a chunky progress
   bar with a beating heart on its leading edge (~5 seconds), then a Continue
   button pops in.
2. **Landing** — "Hi there!" and a Get Started button.
3. **Greeting** — the pixel cat hops down three times, smiles, then settles.
4. **Message screens** — each line types itself out; Continue stays locked
   until the typing finishes (tap the text to skip).
5. **The ask** — YES grows with every NO click and stays big, NO relabels
   itself and flies off to a random spot on the screen, and the cat reacts.
6. **Celebration** — confetti.
7. **Date picker** — a pixel calendar; the cat gets more and more panicked
   the further into the future you page.
8. **Activity picker** — cards, plus a "type your own idea" box.
9. **Final screen** — a summary of the date and the plan.

## Editing the words

Everything you'd want to reword lives in the `CONFIG` object at the top of
[`script.js`](script.js):

| Setting | What it does |
| --- | --- |
| `loading*` | loading screen title, status text, duration, number of critters |
| `landing*` | landing screen title, subtitle, button |
| `greeting` | the first typed line (with its own `face` + `mood`) |
| `flirtyLines` | every message screen, in order — add/remove/reorder freely |
| `askQuestion`, `yesLabel` | the big question and the YES button |
| `noLabels` | what the NO button relabels itself to on each click |
| `noReactions` | the pleading message shown after each NO |
| `noStages` | the cat's face + animation after each NO |
| `monthReactions` | what the cat says as you page further into the future |
| `activities` | the hangout option cards |
| `final*` | the closing message |

A message screen is just `{ text, face, mood }`. Add `speed: 220` to make one
line type out slowly, or `then: { face, mood, delayMs }` to give it a second
beat (that's how the "haha, silly" line laughs and then clams up).

**Faces:** `happy`, `shy`, `nervous`, `curious`, `pleading`, `sad`, `excited`,
`love`, `laugh`, `shut`
**Moods (animations):** `idle`, `shy`, `nervous`, `curious`, `wiggle`, `sad`,
`happy`, `love`, `shiver`, `sulk`, `shake`, `wobble`

## Editing the art

Every sprite is a grid of characters — one character per pixel — rendered as
SVG rectangles. The cat's body and each facial expression are in
`MASCOT_BODY` / `MASCOT_FACES`, the loading animals are in `LOADING_ANIMALS`,
and the loading heart is `HEART_SPRITE`. Edit the strings to redraw them:

```
. transparent   o outline   b body   e eye   m muzzle   a accent   w white
```

## Running it

Open `index.html` in any modern browser, or serve the folder:

```bash
python -m http.server 5599
```

The pixel fonts (Press Start 2P, Pixelify Sans) load from Google Fonts, so
offline it falls back to a monospace stack.

## Files

- `index.html` — screen markup
- `style.css` — pastel pixel theme, every animation
- `script.js` — config, sprites, and all the logic
