/* =========================================================================
   CHIPTUNE SOUND
   -------------------------------------------------------------------------
   Everything here is generated live with the Web Audio API - there are no
   sound files to download, which keeps the whole thing dependency-free and
   matches the 8-bit look.

   Browsers refuse to play audio until the visitor interacts with the page,
   so the audio engine wakes up on her first tap/click (the Continue button
   on the loading screen) and the music starts from there.
   ========================================================================= */

'use strict';

/* =========================================================================
   1. SOUND CONFIG — ✏️ EDIT ME
   ========================================================================= */
const SOUND_CONFIG = {
  musicOn: true,          // set false to ship it with background music off
  musicVolume: 0.05,      // background tune (keep it low - it loops forever)
  sfxVolume: 0.13,        // blips and bloops
  bpm: 96,                // tempo of the background tune

  /* The looping tune: four bars of C - Am - F - G, two notes per beat.
     Use null for a rest. Note names are like C4, F#5, A3.               */
  melody: [
    'C5', 'E5', 'G5', 'E5',   'A4', 'C5', 'E5', 'C5',
    'F4', 'A4', 'C5', 'A4',   'G4', 'B4', 'D5', 'B4',
    'C5', 'E5', 'G5', 'C6',   'A5', 'E5', 'C5', 'A4',
    'F5', 'C5', 'A4', 'F4',   'G4', 'D5', 'B4', 'G5',
  ],
  /* One bass note per half bar, under the melody. */
  bass: ['C3', 'A2', 'F2', 'G2', 'C3', 'A2', 'F2', 'G2'],
};


/* =========================================================================
   2. TINY SYNTH
   ========================================================================= */
const NOTE_STEPS = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6,
                     G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

/** 'A4' -> 440. Returns 0 for a rest. */
function noteFreq(name) {
  if (!name) return 0;
  const m = /^([A-G]#?)(-?\d)$/.exec(name);
  if (!m) return 0;
  const midi = (parseInt(m[2], 10) + 1) * 12 + NOTE_STEPS[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const Sound = {
  ctx: null,
  master: null,
  sfxGain: null,
  musicGain: null,
  muted: false,
  ready: false,
  musicTimer: null,
  nextStepTime: 0,
  step: 0,

  /** Called on the first tap - anything earlier would be blocked anyway. */
  init() {
    if (this.ready) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;                 // very old browser: stay silent

    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = SOUND_CONFIG.sfxVolume;
    this.sfxGain.connect(this.master);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = SOUND_CONFIG.musicVolume;
    this.musicGain.connect(this.master);

    this.ready = true;
    if (SOUND_CONFIG.musicOn) this.startMusic();
  },

  /** One blippy note. `type` is a wave shape: square/triangle/sawtooth/sine. */
  tone(freq, startAt, duration, type, volume, destination) {
    if (!this.ready || !freq) return;
    const t = startAt || this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);

    // quick attack, then fade out - that plucky 8-bit envelope
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(volume, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(env);
    env.connect(destination || this.sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  },

  /** A note that slides from one pitch to another (boings and zips). */
  slide(from, to, duration, type, volume) {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = type || 'square';
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + duration);

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(volume, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  },

  /* --------------------------------------------------------------------
     3. THE SOUND EFFECTS — ✏️ tweak the notes to change how things sound
     -------------------------------------------------------------------- */
  play(name) {
    if (!this.ready || this.muted) return;
    const now = this.ctx.currentTime;
    const n = noteFreq;

    switch (name) {
      case 'type':                                   // one typed character
        this.tone(n('E6'), now, 0.03, 'square', 0.25);
        break;

      case 'click':                                  // any normal button
        this.tone(n('C6'), now, 0.05, 'square', 0.6);
        this.tone(n('G6'), now + 0.05, 0.07, 'square', 0.45);
        break;

      case 'select':                                 // a card or a date
        this.tone(n('A5'), now, 0.05, 'triangle', 0.7);
        this.tone(n('E6'), now + 0.05, 0.09, 'triangle', 0.55);
        break;

      case 'no':                                     // she pressed NO
        this.tone(n('G4'), now, 0.09, 'square', 0.5);
        this.tone(n('E4'), now + 0.09, 0.09, 'square', 0.5);
        this.tone(n('C4'), now + 0.18, 0.18, 'square', 0.45);
        break;

      case 'yes':                                    // she said YES
        ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((note, i) => {
          this.tone(n(note), now + i * 0.07, 0.16, 'square', 0.6);
        });
        break;

      case 'fanfare':                                // celebration / ending
        [['G5', 0], ['C6', 0.12], ['E6', 0.24], ['G6', 0.36],
         ['E6', 0.5], ['G6', 0.62]].forEach(([note, at]) => {
          this.tone(n(note), now + at, 0.28, 'square', 0.55);
          this.tone(n(note) / 2, now + at, 0.28, 'triangle', 0.35);
        });
        break;

      case 'poke':                                   // the cat got poked
        this.slide(320, 900, 0.16, 'square', 0.5);
        break;

      case 'pop':                                    // speech bubble appears
        this.slide(700, 1500, 0.09, 'triangle', 0.5);
        break;

      case 'tick':                                   // one loading block
        this.tone(n('B5'), now, 0.025, 'square', 0.3);
        break;

      case 'loaded':                                 // loading finished
        ['C6', 'E6', 'G6'].forEach((note, i) => {
          this.tone(n(note), now + i * 0.09, 0.2, 'triangle', 0.6);
        });
        break;

      case 'hop':                                    // mascot lands
        this.slide(500, 260, 0.12, 'triangle', 0.45);
        break;
    }
  },

  /* --------------------------------------------------------------------
     4. BACKGROUND MUSIC (a looping four-bar tune)
     -------------------------------------------------------------------- */
  startMusic() {
    if (!this.ready || this.musicTimer) return;
    this.step = 0;
    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.scheduleMusic();
  },

  stopMusic() {
    clearTimeout(this.musicTimer);
    this.musicTimer = null;
  },

  /* Notes are scheduled a little ahead of time against the audio clock, so
     the tune stays in time even when the browser throttles timers. */
  scheduleMusic() {
    const stepDur = 30 / SOUND_CONFIG.bpm;          // an eighth note
    const steps = SOUND_CONFIG.melody.length;

    while (this.nextStepTime < this.ctx.currentTime + 0.25) {
      const t = this.nextStepTime;

      // melody
      this.tone(noteFreq(SOUND_CONFIG.melody[this.step]),
                t, stepDur * 0.9, 'square', 0.5, this.musicGain);

      // bass, once every four steps
      if (this.step % 4 === 0) {
        const bassNote = SOUND_CONFIG.bass[(this.step / 4) % SOUND_CONFIG.bass.length];
        this.tone(noteFreq(bassNote), t, stepDur * 3.4, 'triangle', 0.75, this.musicGain);
      }

      this.nextStepTime += stepDur;
      this.step = (this.step + 1) % steps;
    }

    this.musicTimer = setTimeout(() => this.scheduleMusic(), 60);
  },

  /* --------------------------------------------------------------------
     5. MUTE
     -------------------------------------------------------------------- */
  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 1;
    try { localStorage.setItem('hangout-muted', muted ? '1' : '0'); } catch (e) { /* private mode */ }
    const btn = document.getElementById('sound-toggle');
    if (btn) {
      btn.textContent = muted ? '🔇' : '🔊';
      btn.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
    }
  },

  toggle() {
    this.setMuted(!this.muted);
    if (!this.muted) this.play('click');
  },
};


/* =========================================================================
   6. WIRE IT UP: mute button + waking the audio on the first tap
   ========================================================================= */
(function setupSound() {
  try { Sound.muted = localStorage.getItem('hangout-muted') === '1'; } catch (e) { /* ignore */ }

  const btn = document.createElement('button');
  btn.id = 'sound-toggle';
  btn.className = 'sound-toggle';
  btn.type = 'button';
  btn.textContent = Sound.muted ? '🔇' : '🔊';
  btn.setAttribute('aria-label', Sound.muted ? 'Turn sound on' : 'Turn sound off');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    Sound.init();
    Sound.toggle();
  });
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(btn));

  // the first tap or key press anywhere unlocks audio
  const wake = () => Sound.init();
  document.addEventListener('pointerdown', wake, { once: true });
  document.addEventListener('keydown', wake, { once: true });
})();
