/* =========================================================================
   "Wanna hang out?" — a tiny single-page app
   -------------------------------------------------------------------------
   EVERYTHING YOU'LL WANT TO EDIT IS IN THE CONFIG BLOCK BELOW.
   The rest of the file is the machinery (typing animation, screens,
   YES/NO grow-shrink, calendar, confetti).
   ========================================================================= */

'use strict';

/* =========================================================================
   1. CONFIG — ✏️ EDIT ME
   ========================================================================= */
const CONFIG = {

  /* --- timing / behaviour knobs --- */
  typingSpeed: 42,        // milliseconds per typed character (lower = faster)
  typingEndPause: 250,    // pause after typing before the Continue button unlocks
  /* The YES button grows a step with every NO click and stays big - it never
     shrinks back. It stops growing once it fills the width it has. */
  yesGrowthPerClick: 0.34,// how much bigger YES gets per click
  noShrinkPerClick: 0.09, // how much smaller NO gets per step
  hideAtStep: 4,          // from this many NO clicks on, the cat hides behind the card
  sadMomentMs: 1100,      // how long the "sad" moment lasts after a NO click

  /* --- 0. loading screen (shown first) --- */
  loadingTitle: 'Loading something cute...',
  loadingStatus: 'gathering friends... {pct}%',
  loadingDoneStatus: 'all ready for you',
  loadingButton: 'Continue',
  loadingDurationMs: 5000,   // how long the loading screen lasts
  loadingCritters: 24,       // how many little animals hop around
  loadingBlocks: 20,         // chunks in the pixel progress bar

  /* --- 1. landing screen --- */
  landingTitle: 'Hi there! 💕',
  landingSubtitle: 'I made this little thing just for you...',
  landingButton: 'Get Started',

  /* --- 2. greeting screen (typed out) ---
     `face` + `mood` control how the mascot looks & moves on this screen.
     Faces : happy | shy | nervous | curious | pleading | sad | excited | love
     Moods : idle  | shy | nervous | curious | wiggle   | sad | happy   | love  */
  greeting: {
    text: 'Hiii! I have something to ask you...',
    face: 'happy',   // it smiles once it has finished hopping in
    mood: 'idle',
  },

  /* --- mascot entrance (landing -> greeting) ---
     The mascot is hidden on the landing screen, then drops in and bounces
     `hops` times before settling into its normal idle bob.
     NOTE: changing `hops` also means editing the @keyframes dropIn bounces
     in style.css — the duration below just has to match that animation.   */
  mascotEntrance: {
    face: 'happy',
    mood: 'idle',
    durationMs: 1550,  // must match .mascot.is-entering in style.css
  },

  /* --- 3. the message screens, in order (each entry = one screen) ---
     Add, remove or reorder freely - the screens are generated from this list.
     `speed` is optional: leave it out for the normal typing speed, or set a
     bigger number to make that line type out slowly.                        */
  flirtyLines: [
    {
      text: 'I hope your day is going well so far, and please do not stress about anything okay?',
      face: 'happy',
      mood: 'idle',
    },
    {
      text: 'I had so much fun last time we hung out.',
      face: 'excited',
      mood: 'wiggle',
    },
    {
      text: 'Oh, and I hope you enjoyed my little gift from last time.',
      face: 'love',
      mood: 'love',
    },
    {
      text: 'Also...',
      face: 'curious',
      mood: 'curious',
      speed: 220,          // types out slowly on purpose
    },
    {
      text: "Even though I can't see you right now... I just know you look reallyyyyyy cute.",
      face: 'shy',
      mood: 'shy',
      theme: 'sweet',      // dreamy pink-lavender background
      track: 'sweet',      // slower, dreamier background music
      sound: 'sparkle',    // twinkly little sting when it appears
    },
    {
      /* laughs nervously for a moment, then clams up (see `then`) */
      text: 'Haha okay, that was a little silly of me...',
      face: 'laugh',
      mood: 'wiggle',
      theme: 'funny',      // sunny cream yellow
      track: 'calm',
      then: { face: 'shut', mood: 'nervous', delayMs: 1600 },
    },
    {
      text: 'Well...',
      face: 'nervous',
      mood: 'nervous',
      theme: 'tense',      // the sky starts to darken
      track: 'tense',
      speed: 220,          // slow again, building up to the question
    },
  ],

  /* --- 4. the ask --- */
  askQuestion: 'Would you like to hang out with me?',
  yesLabel: 'YES 💖',
  /* The NO button relabels itself on every click. Index 0 is the label it
     starts with; the last one sticks once she runs out of clicks. */
  noLabels: [
    'No',
    'Are you sure?',
    'Really?',
    'Think again',
    'Please?',
    'Still no?',
    'Are you certain?',
    'You sure about that?',
    'Last chance',
    'Pretty please?',
    'I will wait here',
  ],
  /* Reactions shown after each NO click. Index 0 = 1st click, and so on.
     If there are more clicks than lines, the last line keeps showing. */
  noReactions: [
    'Wait... are you sure? 🥺',
    'Hmm, maybe think about it one more time?',
    'That kinda hurt a little... 😢',
    'The YES button is getting suspiciously big...',
    'Pleeeease? I promise it will be fun 🥹',
    'I even planned what we could do already...',
    'My little heart is cracking 💔',
    'Okay okay... just one tiny yes?',
    'I will be very very sad forever 😭',
    'Last chance... look how huge YES is! 🥺💖',
  ],

  /* --- 5. celebration --- */
  celebrateTitle: 'Yay!! 🎉',
  celebrateSubtitle: 'You just made my whole week. Now let us plan it!',

  /* --- 6. date picker --- */
  dateTitle: 'When are you free? 🗓️',
  /* What the cat says as she pages further into the future. Entry 0 is one
     month ahead, entry 1 is two months ahead, and so on - the last entry
     keeps showing after that. `level` 1-4 sets how panicky the bubble looks. */
  monthReactions: [
    { text: 'Thats so long 😢',              face: 'curious',  mood: 'curious', level: 1 },
    { text: 'That is really far away 😥',    face: 'sad',      mood: 'shy',     level: 2 },
    { text: 'Wait, that is months away 😰',  face: 'nervous',  mood: 'nervous', level: 3 },
    { text: 'I cannot wait that long 😱',    face: 'nervous',  mood: 'shiver',  level: 4 },
    { text: 'I will be a ghost by then 👻',  face: 'sad',      mood: 'shake',   level: 4 },
  ],

  /* --- 7. activity picker — add your own options here --- */
  activityTitle: 'What should we do? ✨',
  activities: [
    { id: 'movie',    emoji: '🎬', label: 'Movie' },
    { id: 'sports',   emoji: '🏸', label: 'Sports' },
    { id: 'shopping', emoji: '🛍️', label: 'Shopping' },
    { id: 'park',     emoji: '🌳', label: 'Walk in the Park' },
    { id: 'mystery',  emoji: '🎁', label: 'Mystery Hangout' },
    // { id: 'cafe',  emoji: '☕', label: 'Coffee' },   <-- example of adding more
  ],
  /* the type-your-own box under the cards */
  activityOtherLabel: 'Or tell me your own idea 💭',
  activityOtherPlaceholder: 'Your choice...',
  activityOtherEmoji: '💭',

  /* --- 8. final screen --- */
  finalTitle: 'It is a date! 🥰',
  finalMessage: 'I honestly cannot wait. I will be counting down the days.',
  finalSignoff: 'See you soon! 💕',
  finalDateLabel: 'When',
  finalActivityLabel: 'What',


  /* --- background mood per screen — ✏️ EDIT ME ---
     `sky` is any CSS background, `hearts` are the little things drifting up.
     A message screen can pick one of these with `theme: 'sweet'`.          */
  themes: {
    loading:  { sky: 'radial-gradient(120% 80% at 50% 0%, #ffe6f2 0%, #fff5fa 45%, #f3e9ff 100%)',
                hearts: ['💗', '💕', '🌸', '✨', '💖'] },
    landing:  { sky: 'radial-gradient(120% 80% at 50% 0%, #ffe1ee 0%, #fff6f8 50%, #ffeede 100%)',
                hearts: ['💗', '💕', '🌸', '✨', '💖'] },
    typing:   { sky: 'radial-gradient(120% 80% at 50% 0%, #fff0e2 0%, #fffaf3 50%, #ffeef6 100%)',
                hearts: ['💗', '☀️', '🌸', '✨', '💕'] },
    sweet:    { sky: 'radial-gradient(120% 90% at 50% 10%, #ffd9ee 0%, #f6e6ff 45%, #e4dcff 100%)',
                hearts: ['💗', '✨', '🌸', '💞', '🫧'] },
    funny:    { sky: 'radial-gradient(120% 80% at 50% 0%, #fff6d6 0%, #fffdf0 50%, #ffeef2 100%)',
                hearts: ['😆', '✨', '💫', '🌼', '😹'] },
    tense:    { sky: 'radial-gradient(120% 90% at 50% 0%, #ffbcd2 0%, #e79ab8 45%, #9c76a6 100%)',
                hearts: ['💓', '😳', '💗', '⚡', '💦'] },
    celebrate:{ sky: 'radial-gradient(120% 80% at 50% 0%, #fff3b0 0%, #ffe0ef 45%, #d9f5ea 100%)',
                hearts: ['🎉', '🎊', '✨', '💖', '⭐'] },
    date:     { sky: 'radial-gradient(120% 80% at 50% 0%, #dff0ff 0%, #f2f9ff 50%, #ffeef7 100%)',
                hearts: ['☁️', '🗓️', '✨', '💙', '💗'] },
    activity: { sky: 'radial-gradient(120% 80% at 50% 0%, #dff7e8 0%, #f4fff8 50%, #fff0f6 100%)',
                hearts: ['🌿', '✨', '💚', '🍀', '💗'] },
    final:    { sky: 'radial-gradient(120% 90% at 50% 0%, #ffd9c2 0%, #ffd3e4 45%, #f0d4ff 100%)',
                hearts: ['💕', '✨', '🌅', '💖', '⭐'] },
  },

  /* which theme each screen uses */
  screenThemes: {
    'screen-loading':  'loading',
    'screen-landing':  'landing',
    'screen-typing':   'typing',
    'screen-ask':      'tense',
    'screen-celebrate':'celebrate',
    'screen-date':     'date',
    'screen-activity': 'activity',
    'screen-final':    'final',
  },

  /* --- mascot per stage — ✏️ mix and match faces + moods here ---
     Faces : happy | shy | nervous | curious | pleading | sad | excited | love
     Moods : idle | shy | nervous | curious | wiggle | sad | happy | love
             shiver | sulk | shake | wobble
     (The greeting and flirty screens set their own — see sections 2 and 3.) */
  mascotStages: {
    landing:   { face: 'happy',    mood: 'idle' },     // waiting, calm and cute
    ask:       { face: 'nervous',  mood: 'nervous' },  // asking the big question
    celebrate: { face: 'love',     mood: 'happy' },    // she said yes!
    date:      { face: 'excited',  mood: 'wiggle' },   // picking a day
    activity:  { face: 'curious',  mood: 'curious' },  // picking what to do
    final:     { face: 'love',     mood: 'love' },     // all set, dreamy heartbeat
  },

  /* --- hovering the mascot itself --- */
  mascotHover: { face: 'excited', mood: 'wiggle' },

  /* --- poking the mascot: these play in order, one per click ---
     `anim` is a one-shot class in style.css (.mascot.is-jump / -spin / -fly). */
  mascotClicks: [
    { face: 'excited', anim: 'jump', durationMs: 800 },
    { face: 'happy',   anim: 'spin', durationMs: 900 },
    { face: 'love',    anim: 'fly',  durationMs: 1150 },
  ],

  /* --- hovering YES / NO on the ask screen --- */
  mascotYesHover: { face: 'love', mood: 'happy' },   // excited & tempting
  mascotNoHover:  { face: 'sad',  mood: 'sad' },     // instantly sad

  /* --- one entry per NO click: the brief sad moment, then how it looks
         while it waits. Every stage uses a different animation.
         Extra clicks past the end keep the last entry. --- */
  noStages: [
    { sadMood: 'sad',    face: 'pleading', mood: 'idle'    },
    { sadMood: 'sulk',   face: 'pleading', mood: 'shy'     },
    { sadMood: 'shiver', face: 'sad',      mood: 'shiver'  },
    { sadMood: 'sad',    face: 'pleading', mood: 'nervous' },
    { sadMood: 'sulk',   face: 'pleading', mood: 'wobble'  },
    { sadMood: 'shiver', face: 'sad',      mood: 'shake'   },
    { sadMood: 'sad',    face: 'pleading', mood: 'curious' },
    { sadMood: 'sulk',   face: 'sad',      mood: 'sulk'    },
    { sadMood: 'shiver', face: 'pleading', mood: 'wiggle'  },
    { sadMood: 'sad',    face: 'sad',      mood: 'sad'     },
  ],
};


/* =========================================================================
   2. PIXEL-ART MASCOT
   -------------------------------------------------------------------------
   The mascot is a 16x16 pixel grid drawn as <rect> elements inside an SVG.
   Edit the strings below to redraw it — one character per pixel.
     .  = transparent    o = outline      b = body
     p  = inner ear      r = blush        w = white (eye shine)
     c  = tear
   ========================================================================= */
const PIXEL_COLORS = {
  o: '#5b3a4a',
  b: '#ffb3d1',
  p: '#ff8fbf',
  r: '#ff7fae',
  w: '#ffffff',
  c: '#8fd8ff',
};

/* The body never changes. */
const MASCOT_BODY = [
  '................',
  '..oo........oo..',
  '.obbo......obbo.',
  '.obpbo....obpbo.',
  '.obbbboooobbbbo.',
  '.obbbbbbbbbbbbo.',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbbbbbbbbbbo',
  '.obbbbbbbbbbbbo.',
  '.obbbbbbbbbbbbo.',
  '..oobbbbbbbboo..',
  '....oooooooo....',
  '................',
];

/* Faces are drawn on top of the body. */
const MASCOT_FACES = {
  happy: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '....oo....oo....',
    '....oo....oo....',
    '................',
    '..rr........rr..',
    '.....o....o.....',
    '......oooo......',
    '................',
    '................',
    '................',
    '................',
  ],
  sad: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '...oo........oo.',
    '....oo....oo....',
    '....oo....oo....',
    '...c............',
    '..rc........rr..',
    '......oooo......',
    '.....o....o.....',
    '................',
    '................',
    '................',
    '................',
  ],
  pleading: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '...oooo..oooo...',
    '...owoo..owoo...',
    '...oooo..oooo...',
    '..rr........rr..',
    '.......oo.......',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  excited: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '....o......o....',
    '...o.o....o.o...',
    '................',
    '................',
    '..rr........rr..',
    '......oooo......',
    '......oooo......',
    '.......oo.......',
    '................',
    '................',
    '................',
  ],
  /* shy: eyes squeezed shut, huge blush, tiny smile */
  shy: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '...o..o..o..o...',
    '....oo....oo....',
    '..rrr......rrr..',
    '..rrr......rrr..',
    '......oo........',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  /* nervous: wide shiny eyes, sweat drop, squiggly mouth */
  nervous: [
    '................',
    '................',
    '................',
    '................',
    '.............c..',
    '.............c..',
    '....oo....oo....',
    '....ow....ow....',
    '................',
    '..rr........rr..',
    '.....o.o.o......',
    '......o.o.......',
    '................',
    '................',
    '................',
    '................',
  ],
  /* curious: one raised brow, small round mouth */
  curious: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '..........ooo...',
    '....oo....oo....',
    '....oo....oo....',
    '................',
    '..rr........rr..',
    '......oo........',
    '......oo........',
    '................',
    '................',
    '................',
    '................',
  ],
  /* laugh: squeezed-shut eyes, wide open mouth, nervous sweat drop */
  laugh: [
    '................',
    '................',
    '................',
    '................',
    '.............c..',
    '.............c..',
    '....o......o....',
    '...o.o....o.o...',
    '................',
    '..rr........rr..',
    '.....oooooo.....',
    '.....oooooo.....',
    '......oooo......',
    '................',
    '................',
    '................',
  ],
  /* shut: mouth clamped flat, still sweating */
  shut: [
    '................',
    '................',
    '................',
    '................',
    '.............c..',
    '.............c..',
    '....oo....oo....',
    '....ow....ow....',
    '................',
    '..rr........rr..',
    '......oooo......',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  /* love: heart eyes, big open smile */
  love: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '...r.r....r.r...',
    '...rrr....rrr...',
    '....r......r....',
    '..rr........rr..',
    '.....oooooo.....',
    '......oooo......',
    '................',
    '................',
    '................',
    '................',
  ],
};

const mascotEl = document.getElementById('mascot');

/** Draw the mascot with the given expression ('happy' | 'sad' | 'pleading' | 'excited'). */
function setMascot(expression) {
  const face = MASCOT_FACES[expression] || MASCOT_FACES.happy;
  const rects = [];

  const paint = (grid) => {
    grid.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const fill = PIXEL_COLORS[ch];
        if (!fill) return;
        // 1.02 width/height avoids hairline seams between pixels
        rects.push(`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`);
      });
    });
  };

  paint(MASCOT_BODY);
  paint(face);
  mascotEl.innerHTML = rects.join('');
}

/* Every mood maps to a CSS class ".is-<mood>" in style.css.
   'idle' is the default gentle bob and has no extra class. */
const MASCOT_MOODS = ['sad', 'happy', 'nervous', 'shy', 'curious', 'wiggle', 'love',
                      'shiver', 'sulk', 'shake', 'wobble'];

/* One-shot animation classes used by the click reactions. */
const MASCOT_ONE_SHOTS = ['jump', 'spin', 'fly'];

/** Swap the mascot's idle animation ('idle' | any name in MASCOT_MOODS). */
function setMascotMood(mood) {
  MASCOT_MOODS.forEach((m) => mascotEl.classList.remove('is-' + m));
  if (mood && mood !== 'idle') mascotEl.classList.add('is-' + mood);
}

/* The mascot is hidden until the greeting screen. */
const mascotWrap = document.getElementById('mascot-wrap');
let entranceTimer = null;

/**
 * Reveal the mascot with the drop-in bounce, then hand it back to its
 * normal idle animation. Used once, when leaving the landing screen.
 */
function playMascotEntrance() {
  const cfg = CONFIG.mascotEntrance;

  setMascot(cfg.face);              // already smiling as it lands
  setMascotMood('idle');
  mascotWrap.classList.add('is-visible');

  // restart the animation cleanly even if it somehow ran before
  mascotEl.classList.remove('is-entering');
  void mascotEl.getBoundingClientRect();
  mascotEl.classList.add('is-entering');
  // one boing per landing of the three-hop entrance
  [380, 900, 1300].forEach((at) => setTimeout(() => Sound.play('hop'), at));

  // once the hops are done, settle into the gentle idle bob
  clearTimeout(entranceTimer);
  entranceTimer = setTimeout(() => setMascotStage(cfg), cfg.durationMs);
}

/** Stop the entrance early (e.g. she skipped ahead before it finished). */
function endMascotEntrance() {
  clearTimeout(entranceTimer);
  entranceTimer = null;
  mascotEl.classList.remove('is-entering');
}

/* The stage the mascot goes back to once a hover / poke reaction is over. */
let currentStage = CONFIG.mascotStages.landing;
let reactionTimer = null;
let lineTimer = null;      // a message screen's optional follow-up expression

/** Apply a { face, mood } pair — used by every screen. */
function setMascotStage(stage) {
  if (!stage) return;
  endMascotEntrance();
  clearTimeout(reactionTimer);
  clearTimeout(lineTimer);
  reactionTimer = null;
  MASCOT_ONE_SHOTS.forEach((a) => mascotEl.classList.remove('is-' + a));
  currentStage = stage;             // remembered as the "resting" look
  setMascot(stage.face);
  setMascotMood(stage.mood);
}

/** Temporary look (hover) that does NOT become the resting stage. */
function peekMascot(stage) {
  if (!stage) return;
  clearTimeout(reactionTimer);
  reactionTimer = null;
  setMascot(stage.face);
  setMascotMood(stage.mood);
}

/** Go back to whatever the current screen's resting look is. */
function restoreMascot() {
  clearTimeout(reactionTimer);
  reactionTimer = null;
  MASCOT_ONE_SHOTS.forEach((a) => mascotEl.classList.remove('is-' + a));
  setMascot(currentStage.face);
  setMascotMood(currentStage.mood);
}

/* ---------- speech bubble above the cat ---------- */
const bubbleEl     = document.getElementById('mascot-bubble');
const bubbleTextEl = document.getElementById('bubble-text');

/** Show a line above the cat. `level` 1-4 controls how panicky it looks. */
function showBubble(text, level) {
  bubbleTextEl.textContent = text;
  bubbleEl.className = 'bubble' + (level > 1 ? ' lv' + level : '');
  bubbleEl.hidden = false;
  Sound.play('pop');
  // restart the pop animation each time the text changes
  void bubbleEl.getBoundingClientRect();
}

function hideBubble() {
  bubbleEl.hidden = true;
}

/* ---------- poke the mascot: jump / spin / fly, cycling per click ---------- */
let clickIndex = 0;

function pokeMascot() {
  Sound.play('poke');
  const reaction = CONFIG.mascotClicks[clickIndex % CONFIG.mascotClicks.length];
  clickIndex++;

  clearTimeout(reactionTimer);
  endMascotEntrance();
  setMascot(reaction.face);
  setMascotMood('idle');            // the one-shot class does the moving

  // restart the animation cleanly even on rapid clicks
  MASCOT_ONE_SHOTS.forEach((a) => mascotEl.classList.remove('is-' + a));
  void mascotEl.getBoundingClientRect();
  mascotEl.classList.add('is-' + reaction.anim);

  reactionTimer = setTimeout(restoreMascot, reaction.durationMs);
}

mascotEl.addEventListener('click', pokeMascot);
mascotEl.addEventListener('mouseenter', () => {
  // don't interrupt a poke reaction that is still playing
  if (reactionTimer) return;
  peekMascot(CONFIG.mascotHover);
});
mascotEl.addEventListener('mouseleave', () => {
  if (reactionTimer) return;
  restoreMascot();
});



/* =========================================================================
   2b. LOADING-SCREEN CRITTERS
   -------------------------------------------------------------------------
   Ten little 8x8 pixel animals. Same idea as the mascot: one character per
   pixel, plus a palette per animal.
     . transparent   o outline   b body   e eye   m muzzle/beak   a accent
     w white
   ========================================================================= */
const LOADING_ANIMALS = [
  { name:'cat',    colors:{o:'#5b3a4a',b:'#ffb3d1',e:'#5b3a4a',m:'#5b3a4a',a:'#ff7fae'},
    px:['.o....o.','.oboobo.','oobbbboo','obebbebo','obbbbbbo','oabmmbao','.obbbbo.','..oooo..'] },
  { name:'bunny',  colors:{o:'#8a6377',b:'#fff3f7',e:'#5b3a4a',m:'#e2789f',a:'#ffb3d1'},
    px:['..o..o..','..o..o..','.oooooo.','obbbbbbo','obebbebo','oabbbbao','.obmmbo.','..oooo..'] },
  { name:'bear',   colors:{o:'#7a4a2c',b:'#c98b5e',e:'#3b2418',m:'#e8c3a0',a:'#e0a878'},
    px:['........','oo....oo','obboobbo','obbbbbbo','obebbebo','obbbbbbo','.obmmbo.','..oooo..'] },
  { name:'panda',  colors:{o:'#3a3540',b:'#ffffff',e:'#3a3540',m:'#3a3540',a:'#ffb3d1'},
    px:['........','oo....oo','obboobbo','obbbbbbo','oeebbeeo','obbbbbbo','.obmmbo.','..oooo..'] },
  { name:'frog',   colors:{o:'#3f7a4a',b:'#8fd98f',e:'#2f5d3a',m:'#2f5d3a',a:'#b6ecb6'},
    px:['.o....o.','oeo..oeo','obbbbbbo','obbbbbbo','obbbbbbo','ommmmmmo','.obbbbo.','..oooo..'] },
  { name:'chick',  colors:{o:'#a87b2a',b:'#ffe07a',e:'#5b3a4a',m:'#ff9f43',a:'#ffd24d'},
    px:['........','..oooo..','.obbbbo.','obebbebo','obbmmbbo','obbbbbbo','.obbbbo.','..oooo..'] },
  { name:'pig',    colors:{o:'#a35a6b',b:'#ffc0cb',e:'#5b3a4a',m:'#f08fa8',a:'#ff9db3'},
    px:['........','.o....o.','oobbbboo','obebbebo','obbbbbbo','obmmmmbo','.obbbbo.','..oooo..'] },
  { name:'penguin',colors:{o:'#2b3550',b:'#4a5b7a',e:'#ffffff',m:'#ff9f43',w:'#ffffff'},
    px:['........','..oooo..','.obbbbo.','obebbebo','obwmmwbo','obwwwwbo','.owwwwo.','..oooo..'] },
  { name:'dog',    colors:{o:'#7a5230',b:'#e6b985',e:'#3b2418',m:'#5b3a4a',a:'#b07d47'},
    px:['........','.oooooo.','oabbbbao','oaebbeao','oabbbbao','obmmmmbo','.obbbbo.','..oooo..'] },
  { name:'koala',  colors:{o:'#6f6f7d',b:'#c9c9d4',e:'#3b3b46',m:'#5b3a4a',a:'#9a9aa8'},
    px:['oo....oo','oo....oo','.oooooo.','obbbbbbo','obebbebo','obbmmbbo','.obbbbo.','..oooo..'] },
];

/* The little heart that rides along the loading bar. */
const HEART_SPRITE = {
  colors:{ o:'#c2185b', a:'#ff5c8a', w:'#ffd6e6' },
  px:['.oo..oo.',
      'owaooaao',
      'oaaaaaao',
      'oaaaaaao',
      '.oaaaao.',
      '..oaao..',
      '...oo...',
      '........'],
};

/** Turn a pixel grid + palette into an <svg> sprite string. */
function spriteSvg(rows, colors, className) {
  const size = rows.length;
  const rects = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = colors[ch];
      if (!fill) return;
      rects.push('<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + fill + '"/>');
    });
  });
  return '<svg class="' + className + '" viewBox="0 0 ' + size + ' ' + size + '" ' +
         'shape-rendering="crispEdges">' + rects.join('') + '</svg>';
}

/* =========================================================================
   3. APP STATE
   ========================================================================= */
const state = {
  typingQueue: [],   // remaining lines for the typing screen (greeting + flirty)
  noClicks: 0,       // how many times NO has been clicked
  selectedDate: null,// Date object
  selectedActivity: null, // one entry from CONFIG.activities
};


/* =========================================================================
   4. SCREEN SWITCHING (fade / slide transition)
   ========================================================================= */
const OUT_DURATION = 280; // must match .is-leaving animation in style.css
let currentScreen = document.getElementById('screen-loading');

function showScreen(id, onShown) {
  const next = document.getElementById(id);
  if (!next || next === currentScreen) return;

  const prev = currentScreen;
  prev.classList.add('is-leaving');
  setTheme(CONFIG.screenThemes[id]);
  if (typeof hideBubble === 'function') hideBubble();

  setTimeout(() => {
    prev.classList.remove('is-active', 'is-leaving');
    next.classList.add('is-active');
    currentScreen = next;
    if (typeof onShown === 'function') onShown();
  }, OUT_DURATION);
}



/* =========================================================================
   4b. BACKGROUND MOOD
   -------------------------------------------------------------------------
   Two stacked sky layers cross-fade into each other, because CSS cannot
   animate between two gradients directly. The floating emoji swap over too.
   ========================================================================= */
const skyLayers = [document.getElementById('bg-a'), document.getElementById('bg-b')];
let skyIndex = 0;                 // which layer is currently showing
let currentTheme = null;
let heartEls = [];                // filled in when the hearts are spawned

function setTheme(name) {
  const theme = CONFIG.themes[name];
  if (!theme || name === currentTheme) return;
  currentTheme = name;

  // paint the hidden layer, then fade it in over the visible one
  const next = skyLayers[1 - skyIndex];
  next.style.background = theme.sky;
  next.classList.add('is-on');
  skyLayers[skyIndex].classList.remove('is-on');
  skyIndex = 1 - skyIndex;

  // the drifting emoji change with the mood
  heartEls.forEach((el, i) => { el.textContent = theme.hearts[i % theme.hearts.length]; });
}

/* =========================================================================
   5. TYPING ANIMATION + "Continue stays disabled until done"
   -------------------------------------------------------------------------
   typeText() writes one character at a time into `target`. The Continue
   button passed in is disabled at the start and only re-enabled once the
   whole string has been printed (plus a short pause).
   Clicking/tapping the text skips straight to the end.
   ========================================================================= */
const typedTextEl   = document.getElementById('typed-text');
const typingHintEl  = document.getElementById('typing-hint');
const typingBtn     = document.getElementById('btn-typing-continue');

let typingTimer = null;
let skipTyping = null; // function that jumps to the end of the current line

function typeText(target, text, button, speed = CONFIG.typingSpeed) {
  clearInterval(typingTimer);

  // 1. lock the button for the whole animation
  button.disabled = true;

  let i = 0;
  const caret = '<span class="caret"></span>';
  target.innerHTML = caret;

  const finish = () => {
    clearInterval(typingTimer);
    typingTimer = null;
    skipTyping = null;
    target.textContent = text;          // make sure the full text is shown
    typingHintEl.classList.add('is-hidden');
    // 2. unlock the button only once typing is completely done
    setTimeout(() => { button.disabled = false; }, CONFIG.typingEndPause);
  };

  skipTyping = finish;
  typingHintEl.classList.remove('is-hidden');

  typingTimer = setInterval(() => {
    i++;
    if (i % 3 === 0) Sound.play('type');    // a soft blip as it types
    target.innerHTML = escapeHtml(text.slice(0, i)) + caret;
    if (i >= text.length) finish();
  }, speed);
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Tap the text to skip the animation
typedTextEl.addEventListener('click', () => { if (skipTyping) skipTyping(); });

/** Show the next queued line, or move on to the ask screen when empty. */
function nextTypingLine() {
  if (state.typingQueue.length === 0) {
    showScreen('screen-ask', () => {
      setMascotStage(CONFIG.mascotStages.ask);
      Sound.setTrack('tense');
      Sound.play('tense');
    });
    return;
  }
  const line = state.typingQueue.shift();
  setMascotStage(line);              // each line has its own face + animation
  setTheme(line.theme || 'typing');            // background mood for this line
  if (line.track) Sound.setTrack(line.track);   // swap the background music
  if (line.sound) Sound.play(line.sound);       // one-off sting for this line

  /* Optional follow-up: e.g. laugh for a moment, then clam up. Cleared
     automatically if she moves on first (setMascotStage clears it). */
  if (line.then) {
    lineTimer = setTimeout(() => setMascotStage(line.then), line.then.delayMs || 1200);
  }
  // `speed` lets a single line type out slower than the rest
  typeText(typedTextEl, line.text, typingBtn, line.speed || CONFIG.typingSpeed);
}

typingBtn.addEventListener('click', () => {
  if (typingBtn.disabled) return;
  if (state.typingQueue.length === 0) {
    showScreen('screen-ask', () => {
      setMascotStage(CONFIG.mascotStages.ask);
      Sound.setTrack('tense');
      Sound.play('tense');
    });
  } else {
    // stay on the same screen but re-run the intro animation for the new line
    const screen = document.getElementById('screen-typing');
    screen.style.animation = 'none';
    void screen.offsetWidth;           // force reflow so the animation restarts
    screen.style.animation = '';
    nextTypingLine();
  }
});



/* =========================================================================
   6a. LOADING SCREEN
   -------------------------------------------------------------------------
   A crowd of hopping pixel animals + a chunky progress bar that fills over
   CONFIG.loadingDurationMs. When it hits the end, the Continue button pops
   in and it moves on to the landing screen.
   ========================================================================= */
const crittersEl   = document.getElementById('critters');
const loadbarEl    = document.getElementById('loadbar');
const loadStatusEl = document.getElementById('loading-status');
const loadHeartEl  = document.getElementById('loadheart');
const loadingBtn   = document.getElementById('btn-loading-continue');

document.getElementById('loading-title').textContent = CONFIG.loadingTitle;
loadingBtn.textContent = CONFIG.loadingButton;

/* --- fill the screen with little animals, each on its own beat --- */
for (let i = 0; i < CONFIG.loadingCritters; i++) {
  const animal = LOADING_ANIMALS[i % LOADING_ANIMALS.length];
  const holder = document.createElement('div');
  holder.innerHTML = spriteSvg(animal.px, animal.colors, 'critter');
  const svg = holder.firstChild;
  svg.style.animationDelay = (Math.random() * -1.2).toFixed(2) + 's';
  svg.style.animationDuration = (0.7 + Math.random() * 0.7).toFixed(2) + 's';
  crittersEl.appendChild(svg);
}

loadHeartEl.innerHTML = spriteSvg(HEART_SPRITE.px, HEART_SPRITE.colors, 'heart');

/* --- the chunky progress bar --- */
const loadBlocks = [];
for (let i = 0; i < CONFIG.loadingBlocks; i++) {
  const block = document.createElement('i');
  loadbarEl.appendChild(block);
  loadBlocks.push(block);
}

function paintStatus(pct) {
  loadStatusEl.textContent = CONFIG.loadingStatus.replace('{pct}', pct);
}
paintStatus(0);

/* Driven by the clock rather than by counting ticks, so the bar always
   takes exactly CONFIG.loadingDurationMs even if the browser throttles
   timers (background tab, slow device). */
const loadStart = Date.now();
let lastFilled = 0;

const loadTimer = setInterval(() => {
  const progress = Math.min((Date.now() - loadStart) / CONFIG.loadingDurationMs, 1);
  const filled = Math.round(progress * CONFIG.loadingBlocks);

  if (filled > lastFilled) { Sound.play('tick'); lastFilled = filled; }
  loadBlocks.forEach((b, i) => b.classList.toggle('on', i < filled));
  paintStatus(Math.round(progress * 100));
  loadHeartEl.style.left = (progress * 100) + '%';   // heart rides the edge

  if (progress >= 1) {
    clearInterval(loadTimer);
    loadHeartEl.classList.add('is-done');            // happy spin-pop
    Sound.play('loaded');

    loadStatusEl.textContent = CONFIG.loadingDoneStatus;
    loadingBtn.hidden = false;      // pops in via the .btn-pop animation
  }
}, 80);

loadingBtn.addEventListener('click', () => {
  /* This click is what unlocks audio in most browsers, so the finished-
     loading chime is played here too - otherwise she would never hear it. */
  Sound.init();
  Sound.play('loaded');
  showScreen('screen-landing');
});

/* Every ordinary button gets a click blip. YES, NO and the cat have their
   own sounds, so they are skipped here. */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn, .cal-nav');
  if (!btn || btn.id === 'btn-yes' || btn.id === 'btn-no') return;
  Sound.play('click');
});

/* =========================================================================
   6. LANDING SCREEN
   ========================================================================= */
document.getElementById('landing-title').textContent    = CONFIG.landingTitle;
document.getElementById('landing-subtitle').textContent = CONFIG.landingSubtitle;
const startBtn = document.getElementById('btn-start');
startBtn.textContent = CONFIG.landingButton;

startBtn.addEventListener('click', () => {
  // greeting first, then every flirty line, one screen each
  state.typingQueue = [CONFIG.greeting, ...CONFIG.flirtyLines];
  showScreen('screen-typing', () => {
    nextTypingLine();
    playMascotEntrance();   // hop down 3x, smiling, then idle
  });
});


/* =========================================================================
   7. THE ASK — YES grows / NO shrinks, capped at CONFIG.maxNoClicks
   ========================================================================= */
const yesBtn      = document.getElementById('btn-yes');
const noBtn       = document.getElementById('btn-no');
const reactionEl  = document.getElementById('no-reaction');

document.getElementById('ask-question').textContent = CONFIG.askQuestion;
yesBtn.textContent = CONFIG.yesLabel;
noBtn.textContent  = CONFIG.noLabels[0];

let sadTimer = null;

/* ---------- the NO button runs around the card ---------- */
const cardEl = document.querySelector('.card');

/**
 * Fling NO to a random spot anywhere on the screen - top, bottom, well
 * outside the card - while keeping it fully visible and never letting it
 * land on top of the YES button (`avoid` is YES's target rectangle).
 */
function detachNoButton() {
  if (noBtn.classList.contains('is-loose')) return;

  // freeze it where it already is, then let it roam free
  const btn0 = noBtn.getBoundingClientRect();
  noBtn.style.left = btn0.left + 'px';
  noBtn.style.top  = btn0.top + 'px';
  noBtn.classList.add('is-loose');     // switches it to position:fixed
  /* Move it to <body>: the screen sections animate their transform, which
     would otherwise capture position:fixed and offset the coordinates. */
  document.body.appendChild(noBtn);
}

function moveNoButton(avoid) {
  const pad = 10;
  detachNoButton();

  const bw = noBtn.offsetWidth;        // unscaled size = the safe bound
  const bh = noBtn.offsetHeight;
  const maxX = Math.max(pad, window.innerWidth  - bw - pad);
  const maxY = Math.max(pad, window.innerHeight - bh - pad);

  const clashes = (x, y) => {
    if (!avoid) return false;
    const gap = 14;                    // keep a little air around YES
    return x < avoid.right + gap && x + bw > avoid.left - gap &&
           y < avoid.bottom + gap && y + bh > avoid.top - gap;
  };

  // try a few spots until one misses the YES button
  let x = 0, y = 0;
  for (let i = 0; i < 30; i++) {
    x = pad + Math.random() * (maxX - pad);
    y = pad + Math.random() * (maxY - pad);
    if (!clashes(x, y)) break;
  }

  noBtn.style.left = x + 'px';
  noBtn.style.top  = y + 'px';
}

/* If the window changes size, pull it back on screen. */
window.addEventListener('resize', () => {
  if (!noBtn.classList.contains('is-loose')) return;
  const bw = noBtn.offsetWidth, bh = noBtn.offsetHeight, pad = 10;
  const x = Math.min(parseFloat(noBtn.style.left) || 0, window.innerWidth  - bw - pad);
  const y = Math.min(parseFloat(noBtn.style.top)  || 0, window.innerHeight - bh - pad);
  noBtn.style.left = Math.max(pad, x) + 'px';
  noBtn.style.top  = Math.max(pad, y) + 'px';
});

noBtn.addEventListener('click', () => {
  state.noClicks++;
  Sound.play('no');

  // YES keeps growing with every click and stays at its biggest.
  const n = state.noClicks;

  // NO leaves the layout on the very first click, which re-centres YES,
  // so do that before measuring anything.
  detachNoButton();

  /* YES grows about its own centre, so it also slides to the middle of the
     row as it grows and is capped at the row width - that way it can never
     hang off the card. */
  const row      = yesBtn.parentElement;
  const rowWidth = row.clientWidth;
  const btnWidth = yesBtn.offsetWidth;                       // layout width
  const btnCentre = (yesBtn.offsetLeft - row.offsetLeft) + btnWidth / 2;
  const shift    = rowWidth / 2 - btnCentre;                 // px to recentre
  const maxScale = Math.max(1, (rowWidth - 8) / btnWidth);

  const yesScale = Math.min(1 + n * CONFIG.yesGrowthPerClick, maxScale);
  const noScale  = Math.max(1 - n * CONFIG.noShrinkPerClick, 0.55);
  // translate first, then scale: the shift is NOT multiplied by the scale
  yesBtn.style.transform = `translateX(${shift}px) scale(${yesScale})`;
  noBtn.style.transform  = `scale(${noScale})`;

  /* ...and NO flings itself somewhere else entirely, steering clear of
     wherever YES is about to end up. */
  const rowRect = row.getBoundingClientRect();   // measured after detaching
  const yesW = btnWidth * yesScale;
  const yesH = yesBtn.offsetHeight * yesScale;
  const yesCx = rowRect.left + rowWidth / 2;
  const yesCy = rowRect.top + (yesBtn.offsetTop - row.offsetTop) + yesBtn.offsetHeight / 2;
  moveNoButton({
    left:  yesCx - yesW / 2,  right:  yesCx + yesW / 2,
    top:   yesCy - yesH / 2,  bottom: yesCy + yesH / 2,
  });

  /* Once YES is enormous the cat ducks behind the card and only peeks over
     the top. It pops back up when she finally says yes. */
  const hiding = n >= CONFIG.hideAtStep;
  mascotWrap.classList.toggle('is-hiding', hiding);

  // --- the button relabels itself: No -> Are you sure? -> Really? ... ---
  noBtn.textContent = CONFIG.noLabels[Math.min(state.noClicks, CONFIG.noLabels.length - 1)];

  // --- reaction text: escalates, then sticks on the last line ---
  const msg = CONFIG.noReactions[Math.min(state.noClicks - 1, CONFIG.noReactions.length - 1)];
  reactionEl.textContent = msg;
  reactionEl.classList.remove('pop');
  void reactionEl.offsetWidth; // restart the pop animation
  reactionEl.classList.add('pop');

  // --- brief sad moment, then this click's own face + animation ---
  const stage = CONFIG.noStages[Math.min(state.noClicks - 1, CONFIG.noStages.length - 1)];
  clearTimeout(sadTimer);
  setMascotStage({ face: 'sad', mood: stage.sadMood });
  sadTimer = setTimeout(() => {
    setMascotStage({ face: stage.face, mood: stage.mood });
  }, CONFIG.sadMomentMs);
});

/* --- hovering the buttons changes how the cat feels about them --- */
yesBtn.addEventListener('mouseenter', () => peekMascot(CONFIG.mascotYesHover));
yesBtn.addEventListener('focus',      () => peekMascot(CONFIG.mascotYesHover));
noBtn.addEventListener('mouseenter',  () => peekMascot(CONFIG.mascotNoHover));
noBtn.addEventListener('focus',       () => peekMascot(CONFIG.mascotNoHover));
[yesBtn, noBtn].forEach((btn) => {
  btn.addEventListener('mouseleave', restoreMascot);
  btn.addEventListener('blur', restoreMascot);
});

yesBtn.addEventListener('click', () => {
  Sound.play('yes');
  clearTimeout(sadTimer);
  mascotWrap.classList.remove('is-hiding');   // pop back up, she said yes
  if (noBtn.classList.contains('is-loose')) noBtn.remove();  // it lives on <body> by then
  showScreen('screen-celebrate', () => {
    setMascotStage(CONFIG.mascotStages.celebrate);
    Sound.setTrack('calm');
    Sound.play('fanfare');
    launchConfetti(3200);
  });
});


/* =========================================================================
   8. CELEBRATION
   ========================================================================= */
document.getElementById('celebrate-title').textContent    = CONFIG.celebrateTitle;
document.getElementById('celebrate-subtitle').textContent = CONFIG.celebrateSubtitle;

document.getElementById('btn-celebrate-continue').addEventListener('click', () => {
  showScreen('screen-date', () => setMascotStage(CONFIG.mascotStages.date));
});


/* =========================================================================
   9. DATE PICKER (small hand-rolled calendar so it can look cute)
   ========================================================================= */
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

const calGrid   = document.getElementById('cal-grid');
const calMonth  = document.getElementById('cal-month');
const calPrev   = document.getElementById('cal-prev');
const calNext   = document.getElementById('cal-next');
const pickedEl  = document.getElementById('date-picked');
const dateBtn   = document.getElementById('btn-date-continue');

document.getElementById('date-title').textContent = CONFIG.dateTitle;

const today = startOfDay(new Date());
let viewYear  = today.getFullYear();
let viewMonth = today.getMonth();

function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function sameDay(a, b) { return a && b && a.getTime() === b.getTime(); }

function renderCalendar() {
  calMonth.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  // never let them page back before the current month
  calPrev.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());

  calGrid.innerHTML = '';
  const firstDow   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // leading blanks so day 1 lands on the right weekday
  for (let i = 0; i < firstDow; i++) {
    const blank = document.createElement('div');
    blank.className = 'cal-cell empty';
    calGrid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonth, day);
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cal-cell';
    cell.textContent = day;
    if (date < today) cell.disabled = true;                 // no past dates
    if (sameDay(date, today)) cell.classList.add('today');
    if (sameDay(date, state.selectedDate)) cell.classList.add('selected');

    cell.addEventListener('click', () => {
      Sound.play('select');
      state.selectedDate = date;
      pickedEl.textContent = formatDate(date);
      dateBtn.disabled = false;                              // unlock Continue
      renderCalendar();
    });
    calGrid.appendChild(cell);
  }
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

/* How far ahead of this month she is browsing, and what the cat thinks. */
function monthsAhead() {
  return (viewYear - today.getFullYear()) * 12 + (viewMonth - today.getMonth());
}

function reactToMonth() {
  const ahead = monthsAhead();

  if (ahead <= 0) {                       // back to this month: all good again
    hideBubble();
    setMascotStage(CONFIG.mascotStages.date);
    return;
  }

  const r = CONFIG.monthReactions[Math.min(ahead - 1, CONFIG.monthReactions.length - 1)];
  setMascotStage({ face: r.face, mood: r.mood });
  showBubble(r.text, r.level);
}

calPrev.addEventListener('click', () => {
  if (--viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar();
  reactToMonth();
});
calNext.addEventListener('click', () => {
  if (++viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderCalendar();
  reactToMonth();
});

dateBtn.addEventListener('click', () => {
  showScreen('screen-activity', () => setMascotStage(CONFIG.mascotStages.activity));
});
renderCalendar();


/* =========================================================================
   10. ACTIVITY PICKER
   ========================================================================= */
const activityGrid  = document.getElementById('activity-grid');
const activityBtn   = document.getElementById('btn-activity-continue');
const activityOther = document.getElementById('activity-other');

document.getElementById('activity-title').textContent = CONFIG.activityTitle;
document.getElementById('activity-other-label').textContent = CONFIG.activityOtherLabel;
activityOther.placeholder = CONFIG.activityOtherPlaceholder;

/** Clear every card highlight (used when she types her own idea instead). */
function clearActivityCards() {
  activityGrid.querySelectorAll('.activity-card')
    .forEach((c) => c.classList.remove('selected'));
}

CONFIG.activities.forEach((activity) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'activity-card';
  card.innerHTML = `<span class="emoji">${activity.emoji}</span><span>${activity.label}</span>`;

  card.addEventListener('click', () => {
    Sound.play('select');
    clearActivityCards();
    card.classList.add('selected');
    // picking a card wins over anything typed in the box
    activityOther.value = '';
    activityOther.classList.remove('filled');
    state.selectedActivity = activity;
    activityBtn.disabled = false;        // unlock Continue
  });

  activityGrid.appendChild(card);
});

/* Typing her own idea counts as the choice and deselects the cards. */
activityOther.addEventListener('input', () => {
  const text = activityOther.value.trim();
  activityOther.classList.toggle('filled', text.length > 0);

  if (text.length > 0) {
    clearActivityCards();
    state.selectedActivity = {
      id: 'custom',
      emoji: CONFIG.activityOtherEmoji,
      label: text,
    };
    activityBtn.disabled = false;
  } else {
    // emptied the box and no card is picked -> lock Continue again
    state.selectedActivity = null;
    activityBtn.disabled = true;
  }
});

/* Enter in the text box acts like pressing Continue. */
activityOther.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !activityBtn.disabled) {
    e.preventDefault();
    activityBtn.click();
  }
});

activityBtn.addEventListener('click', () => {
  renderFinalScreen();
  showScreen('screen-final', () => {
    setMascotStage(CONFIG.mascotStages.final);
    Sound.play('fanfare');
    launchConfetti(2600);
  });
});


/* =========================================================================
   11. FINAL SCREEN
   ========================================================================= */
function renderFinalScreen() {
  document.getElementById('final-title').textContent   = CONFIG.finalTitle;
  document.getElementById('final-message').textContent = CONFIG.finalMessage;
  document.getElementById('final-signoff').textContent = CONFIG.finalSignoff;

  const dateText = state.selectedDate ? formatDate(state.selectedDate) : '-';
  const actText  = state.selectedActivity
    ? `${state.selectedActivity.emoji} ${state.selectedActivity.label}`
    : '-';

  /* The letter picture carries the date and the plan now, so she has
     something to actually save and send. */
  if (typeof buildFinalLetter === 'function') {
    buildFinalLetter(dateText, actText);
    buildSocialLinks();
  }
}


/* =========================================================================
   12. CONFETTI (tiny canvas implementation, no libraries)
   ========================================================================= */
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
const CONFETTI_COLORS = ['#ff7fae', '#ffd0e6', '#ffe66d', '#7ee0b0', '#b8a4f7', '#ffffff'];

let confettiPieces = [];
let confettiRaf = null;

function sizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  confettiCanvas.width  = window.innerWidth * dpr;
  confettiCanvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);

function launchConfetti(durationMs = 3000, count = 140) {
  const W = window.innerWidth;
  confettiPieces = [];
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: Math.random() * W,
      y: -20 - Math.random() * window.innerHeight * 0.5,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      vx: -1.2 + Math.random() * 2.4,
      vy: 2 + Math.random() * 3.2,
      spin: -0.15 + Math.random() * 0.3,
      angle: Math.random() * Math.PI * 2,
      color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
    });
  }

  const endAt = performance.now() + durationMs;
  cancelAnimationFrame(confettiRaf);

  (function frame(now) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const fading = now > endAt;

    confettiPieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;               // gravity
      p.angle += p.spin;
      if (p.y > window.innerHeight + 30 && !fading) {
        // recycle from the top until the burst is over
        p.y = -20;
        p.x = Math.random() * window.innerWidth;
        p.vy = 2 + Math.random() * 3.2;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    const allGone = fading && confettiPieces.every((p) => p.y > window.innerHeight + 40);
    if (allGone) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      confettiPieces = [];
      return;
    }
    confettiRaf = requestAnimationFrame(frame);
  })(performance.now());
}


/* =========================================================================
   13. BACKGROUND HEARTS (decoration)
   ========================================================================= */
(function spawnHearts() {
  const wrap = document.querySelector('.bg-hearts');
  const emojis = ['💗', '💕', '🌸', '✨', '💖'];
  for (let i = 0; i < 14; i++) {
    const el = document.createElement('span');
    el.textContent = emojis[i % emojis.length];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = 12 + Math.random() * 16 + 'px';
    el.style.animationDuration = 12 + Math.random() * 12 + 's';
    el.style.animationDelay = -Math.random() * 20 + 's';
    wrap.appendChild(el);
    heartEls.push(el);
  }
})();


/* =========================================================================
   14. BOOT
   ========================================================================= */
/* The landing screen shows no mascot — it only appears (hopping in) on the
   greeting screen. The face is pre-drawn so the first frame is never empty. */
setMascotStage(CONFIG.mascotStages.landing);
setTheme('loading');
