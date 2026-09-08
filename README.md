# Wanna hang out? 💕

A tiny single-page pixel-art web app for asking someone to hang out.
No backend, no build step, no dependencies — just open `index.html`.

**Mochi does the asking.** The pixel cat is a messenger delivering the message
on your behalf - it introduces itself, passes on what you wanted to say, asks
the question for you and takes notes. That way nothing on screen is you
talking directly, which makes the whole thing easier to send.

To rename the cat, search the project for `Mochi` and replace it - it appears
only in the editable copy at the top of `script.js` and `letter.js`.

## The flow

1. **Loading screen** — a crowd of hopping pixel animals and a chunky progress
   bar with a beating heart on its leading edge (~5 seconds), then a Continue
   button pops in.
2. **Landing** — a short welcome, a note to turn the sound on, and a button
   to open the message.
3. **Greeting** — the cat hops down three times, smiles, then says who sent it.
4. **Message screens** — each line types itself out; Continue stays locked
   until the typing finishes (tap the text to skip).
5. **The ask** — Mochi asks on your behalf; YES grows with every NO click and
   stays big, NO relabels itself and flies off to a random spot on the screen,
   and the cat gets more and more worried on your behalf.
6. **Celebration** — confetti.
7. **Date picker** — a pixel calendar; the cat gets more and more panicked
   the further into the future you page.
8. **Activity picker** — cards, plus a "type your own idea" box.
9. **Final screen** — Mochi's note, drawn as a pixel-art letter she can save
   and send to you, with instructions and WhatsApp / Instagram / Messenger
   buttons.

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

## Sound

Chiptune sound effects and looping background music, all generated live with
the Web Audio API - there are no audio files. Browsers block audio until the
visitor interacts, so it starts itself on her first tap (the Continue button on
the loading screen) and plays from then on. There is nothing to switch on.

That also means the blips as the loading bar fills can only be heard once the
browser trusts the page, so the finished-loading chime is played on that first
Continue click instead of being lost.

The music changes with the mood - three loops in `SOUND_CONFIG.tracks`:

| Track | Where | Feel |
| --- | --- | --- |
| `calm` | most screens | bouncy C - Am - F - G, 96 bpm |
| `sweet` | the compliment | slow and dreamy, 78 bpm |
| `tense` | the question | driving A minor, 138 bpm |

A message screen can set `track: 'sweet'` to change the music and
`sound: 'sparkle'` to fire a one-off sting when it appears.

Everything is in `SOUND_CONFIG` at the top of [`sound.js`](sound.js): volumes
and the tracks, written as plain note names. Set `musicOn: false` to ship it
with no background music. The effects themselves (typing blip, click, YES
arpeggio, NO sad slide, the tense sting, the compliment twinkle, celebration
fanfare, boings) are in `Sound.play()` - change the notes there to change how
anything sounds.

## Background moods

The sky changes with the story. Two stacked layers cross-fade into each other
(CSS cannot animate between two gradients directly), and the little emoji
drifting upwards swap over at the same time.

| Theme | Where | Look |
| --- | --- | --- |
| `loading` / `landing` | the start | soft pink |
| `typing` | the message screens | warm peach |
| `sweet` | the compliment | dreamy pink-lavender |
| `funny` | laughing it off | sunny cream |
| `tense` | "Well..." and the question | deep dusk rose |
| `celebrate` | after YES | party yellow into mint |
| `date` | the calendar | sky blue |
| `activity` | the options | fresh mint |
| `final` | the ending | sunset peach into lilac |

They live in `CONFIG.themes` (a CSS background plus the emoji list) and
`CONFIG.screenThemes` maps each screen to one. A message screen can pick its
own with `theme: 'sweet'`.

## Getting her answer back

Nothing is sent anywhere - there is no server and no tracking. Instead the
final screen draws her answer as a 1080x1350 pixel-art letter on a `<canvas>`
(no screenshot library involved) and offers it to her:

- **Save the picture** downloads the PNG. On an iPhone the download attribute
  is ignored for a picture made in the page, so there the button opens the
  share sheet instead, which has Save Image in it.
- The picture on screen is a `data:` URL rather than a `blob:` one, because
  iOS will not "Save Image" from a blob - so pressing and holding it works.
- **Share it now** appears on phones that support it and opens the native
  share sheet with the image attached, so Instagram / WhatsApp / Messenger
  are one tap away.
- The three buttons underneath open those apps directly.

Fill in `LETTER_CONFIG.contact` in [`letter.js`](letter.js) with your WhatsApp
number, Instagram username or Facebook username and those buttons open a chat
with **you** instead of just opening the app. Everything on the letter - the
title, labels, note, sign-off and the instructions under it - is in
`LETTER_CONFIG` too.

## Files

- `index.html` — screen markup
- `style.css` — pastel pixel theme, every animation
- `sound.js` — the chiptune synth, sound effects and background music
- `script.js` — config, sprites, and all the logic
- `letter.js` — draws the saveable letter and the send-it-to-me buttons
