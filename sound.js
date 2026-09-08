/* =========================================================================
   CHIPTUNE SOUND
   -------------------------------------------------------------------------
   Everything here is generated live with the Web Audio API - there are no
   sound files to download, which keeps the whole thing dependency-free and
   matches the 8-bit look.

   Browsers refuse to start audio until the visitor interacts with the page,
   so the engine keeps trying to wake up on every tap/click/key press until
   it succeeds. In practice that means it starts on the Continue button of
   the loading screen and just plays from then on - nothing to switch on.
   ========================================================================= */

'use strict';

/* =========================================================================
   1. SOUND CONFIG — ✏️ EDIT ME
   ========================================================================= */
const SOUND_CONFIG = {
  musicOn: true,          // set false to ship it with no background music
  musicVolume: 0.05,      // background tune (keep it low - it loops forever)
  sfxVolume: 0.13,        // blips and bloops

  /* The background music. Each track is a loop: `melody` is one note per
     eighth note (null = rest) and `bass` is one note per half bar.
     Switch tracks from the app with Sound.setTrack('tense') etc.          */
  tracks: {
    /* the default: sweet and bouncy, C - Am - F - G */
    calm: {
      bpm: 96,
      lead: 'square', bassWave: 'triangle',
      melody: [
        'C5', 'E5', 'G5', 'E5',   'A4', 'C5', 'E5', 'C5',
        'F4', 'A4', 'C5', 'A4',   'G4', 'B4', 'D5', 'B4',
        'C5', 'E5', 'G5', 'C6',   'A5', 'E5', 'C5', 'A4',
        'F5', 'C5', 'A4', 'F4',   'G4', 'D5', 'B4', 'G5',
      ],
      bass: ['C3', 'A2', 'F2', 'G2', 'C3', 'A2', 'F2', 'G2'],
    },

    /* the compliment: slower, dreamy, lots of space */
    sweet: {
      bpm: 78,
      lead: 'triangle', bassWave: 'sine',
      melody: [
        'F5', null, 'A5', null,   'C6', null, 'A5', null,
        'G5', null, 'B5', null,   'D6', null, 'B5', null,
        'E5', null, 'G5', null,   'C6', null, 'G5', null,
        'F5', null, 'A5', null,   'F5', null, 'C5', null,
      ],
      bass: ['F2', 'G2', 'C3', 'F2', 'F2', 'G2', 'C3', 'F2'],
    },

    /* the big question: faster, minor, driving - proper nerves */
    tense: {
      bpm: 138,
      lead: 'square', bassWave: 'sawtooth',
      melody: [
        'A4', 'A4', 'C5', 'A4',   'E5', 'A4', 'C5', 'A4',
        'G4', 'G4', 'B4', 'G4',   'D5', 'G4', 'B4', 'G4',
        'F4', 'F4', 'A4', 'F4',   'C5', 'F4', 'A4', 'F4',
        'E4', 'E4', 'G#4', 'E4',  'B4', 'E4', 'G#4', 'E4',
      ],
      bass: ['A2', 'A2', 'G2', 'G2', 'F2', 'F2', 'E2', 'E2'],
    },
  },
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
  ready: false,
  trackName: 'calm',
  musicTimer: null,
  nextStepTime: 0,
  step: 0,

  /**
   * Build (or resume) the audio engine. Safe to call as often as you like -
   * it does the work once and afterwards only nudges a suspended context.
   */
  init() {
    if (this.ready) {
      // Chrome/Safari can suspend the context again; poke it awake.
      if (this.ctx && this.ctx.state !== 'running') this.ctx.resume();
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;                 // very old browser: stay silent

    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 1;
    this.master.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = SOUND_CONFIG.sfxVolume;
    this.sfxGain.connect(this.master);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = SOUND_CONFIG.musicVolume;
    this.musicGain.connect(this.master);

    // a context built inside a gesture is usually running already, but not
    // always - resume() is what actually starts it on iOS
    if (this.ctx.state !== 'running') this.ctx.resume();

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

  /** A note that slides from one pitch to another (boings, zips, stings). */
  slide(from, to, duration, type, volume, delay) {
    if (!this.ready) return;
    const t = this.ctx.currentTime + (delay || 0);
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
    if (!this.ready) return;
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

      /* the compliment screen: soft twinkling, like a blush */
      case 'sparkle':
        ['E6', 'G#6', 'B6', 'E7', 'B6', 'E7'].forEach((note, i) => {
          this.tone(n(note), now + i * 0.11, 0.5, 'triangle', 0.4 - i * 0.04);
        });
        this.tone(n('E4'), now, 1.2, 'sine', 0.5);
        break;

      /* the big question: a low ominous sting */
      case 'tense':
        this.tone(n('A2'), now, 1.4, 'sawtooth', 0.4);
        this.tone(n('E3'), now, 1.4, 'triangle', 0.3);
        ['A4', 'G#4', 'G4', 'F#4'].forEach((note, i) => {   // creeping down
          this.tone(n(note), now + 0.12 + i * 0.16, 0.2, 'square', 0.4);
        });
        this.slide(180, 90, 1.1, 'sawtooth', 0.35, 0.5);
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
     4. BACKGROUND MUSIC (looping, and switchable per screen)
     -------------------------------------------------------------------- */
  track() {
    return SOUND_CONFIG.tracks[this.trackName] || SOUND_CONFIG.tracks.calm;
  },

  /** Swap to another track from SOUND_CONFIG.tracks, starting from the top. */
  setTrack(name) {
    if (this.trackName === name) return;
    this.trackName = name;
    if (!this.ready || !SOUND_CONFIG.musicOn) return;
    this.stopMusic();
    this.startMusic();
  },

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
    const track = this.track();
    const stepDur = 30 / track.bpm;                 // an eighth note
    const steps = track.melody.length;

    while (this.nextStepTime < this.ctx.currentTime + 0.25) {
      const t = this.nextStepTime;

      // melody
      this.tone(noteFreq(track.melody[this.step]),
                t, stepDur * 0.9, track.lead, 0.5, this.musicGain);

      // bass, once every four steps
      if (this.step % 4 === 0) {
        const bassNote = track.bass[(this.step / 4) % track.bass.length];
        this.tone(noteFreq(bassNote), t, stepDur * 3.4,
                  track.bassWave, 0.75, this.musicGain);
      }

      this.nextStepTime += stepDur;
      this.step = (this.step + 1) % steps;
    }

    this.musicTimer = setTimeout(() => this.scheduleMusic(), 60);
  },
};


/* =========================================================================
   5. WAKING THE AUDIO
   -------------------------------------------------------------------------
   No on/off button: it simply starts as soon as the browser allows it. The
   listeners stay attached until the context is actually running, so a tap
   that arrives before the page is ready cannot leave it silent.
   ========================================================================= */
(function setupSound() {
  // clear the old mute setting from earlier versions, so nobody is stuck muted
  try { localStorage.removeItem('hangout-muted'); } catch (e) { /* private mode */ }

  const wake = () => {
    Sound.init();
    if (Sound.ready && Sound.ctx && Sound.ctx.state === 'running') {
      ['pointerdown', 'touchstart', 'keydown', 'click'].forEach((ev) =>
        document.removeEventListener(ev, wake, true));
    }
  };

  // capture phase, so this runs before the app's own click handlers
  ['pointerdown', 'touchstart', 'keydown', 'click'].forEach((ev) =>
    document.addEventListener(ev, wake, true));

  // if the tab is hidden and comes back, make sure audio is still awake
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) Sound.init();
  });
})();
