/* =========================================================================
   THE LETTER
   -------------------------------------------------------------------------
   Draws the final answer as a pixel-art picture on a <canvas> so she can
   save it and send it over. Nothing is uploaded anywhere - the image is made
   in her browser, and she chooses who to send it to.

   Drawn by hand rather than screenshotted, so there is no screenshot library
   to download and the result is a clean, shareable 1080x1350 image.
   ========================================================================= */

'use strict';

/* =========================================================================
   1. LETTER CONFIG — ✏️ EDIT ME
   ========================================================================= */
const LETTER_CONFIG = {
  fileName: 'our-hangout.png',

  title: 'WE ARE HANGING OUT',
  whenLabel: 'WHEN',
  whatLabel: 'WHAT',
  note: 'Looking forward to it, see you then',
  signoff: 'delivered by Mochi the messenger cat',

  /* Text shown under the picture on the final screen. */
  howTo: 'Save this picture and send it to him 💌',
  steps: [
    '1. Tap Save the picture, or press and hold the picture itself',
    '2. Send it to him on any of these, and he will know',
  ],
  saveButton: 'Save the picture',
  shareButton: 'Share it now',
  savedMessage: 'Saved 💾 now send it to him',
  holdMessage: 'Press and hold the picture above, then Save Image 💾',

  /* Text that goes with the image when she uses the share button. */
  shareText: 'Mochi just delivered your message 💕',

  /* --- ✏️ PUT YOUR OWN HANDLES HERE ---
     Fill these in and the buttons open a chat with YOU directly. Leave a
     value empty and the button just opens that app so she can pick you.
       whatsapp  : your number in full international form, digits only
                   e.g. '8562091234567' - no +, no spaces
       instagram : your instagram username, without the @
       messenger : your facebook username (the one in your profile link)   */
  contact: {
    whatsapp: '',
    instagram: '',
    messenger: '',
  },

  /* Colours of the picture itself. */
  colors: {
    skyTop: '#ffe6f2',
    skyBottom: '#efe3ff',
    frame: '#ffb3d1',
    frameDark: '#f4629a',
    paper: '#ffffff',
    ink: '#5b3a4a',
    inkSoft: '#8a6377',
    accent: '#f4629a',
  },
};


/* =========================================================================
   2. DRAWING THE PICTURE
   ========================================================================= */
const Letter = {
  canvas: null,
  blob: null,

  /** Paint one of the character-grid sprites onto the canvas. */
  drawSprite(g, rows, colors, x, y, pixel) {
    rows.forEach((row, ry) => {
      [...row].forEach((ch, rx) => {
        const fill = colors[ch];
        if (!fill) return;
        g.fillStyle = fill;
        g.fillRect(x + rx * pixel, y + ry * pixel, pixel, pixel);
      });
    });
  },

  /** A pixel frame: four edges, corners left out, like the UI cards. */
  drawFrame(g, x, y, w, h, thickness, color) {
    g.fillStyle = color;
    g.fillRect(x + thickness, y, w - thickness * 2, thickness);              // top
    g.fillRect(x + thickness, y + h - thickness, w - thickness * 2, thickness); // bottom
    g.fillRect(x, y + thickness, thickness, h - thickness * 2);              // left
    g.fillRect(x + w - thickness, y + thickness, thickness, h - thickness * 2); // right
  },

  /** Word-wrapped centred text. Returns the y position after the last line. */
  drawWrapped(g, text, centreX, y, maxWidth, lineHeight) {
    const words = String(text).split(' ');
    let line = '';
    let cursor = y;

    words.forEach((word) => {
      const attempt = line ? line + ' ' + word : word;
      if (g.measureText(attempt).width > maxWidth && line) {
        g.fillText(line, centreX, cursor);
        cursor += lineHeight;
        line = word;
      } else {
        line = attempt;
      }
    });
    if (line) {
      g.fillText(line, centreX, cursor);
      cursor += lineHeight;
    }
    return cursor;
  },

  /** Build the whole picture. Returns the canvas. */
  async draw(dateText, activityText) {
    const W = 1080, H = 1350;
    const c = LETTER_CONFIG.colors;

    // the pixel fonts have to be loaded before canvas can use them
    try {
      await document.fonts.load('64px "Press Start 2P"');
      await document.fonts.load('44px "Pixelify Sans"');
      await document.fonts.ready;
    } catch (e) { /* fall back to monospace */ }

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.textAlign = 'center';

    // --- sky ---
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, c.skyTop);
    sky.addColorStop(1, c.skyBottom);
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // --- scattered hearts in the background ---
    const heartColors = { o: '#ffc2da', a: '#ffd9e6', w: '#fff2f7' };
    [[70, 150, 7], [930, 260, 5], [120, 1120, 6], [900, 1050, 8],
     [520, 90, 4], [980, 640, 5], [60, 700, 4]].forEach(([hx, hy, hp]) => {
      this.drawSprite(g, HEART_SPRITE.px, heartColors, hx, hy, hp);
    });

    // --- outer frame + paper ---
    this.drawFrame(g, 40, 40, W - 80, H - 80, 16, c.frame);
    g.fillStyle = c.paper;
    g.fillRect(96, 96, W - 192, H - 192);
    this.drawFrame(g, 96, 96, W - 192, H - 192, 8, '#ffd0e6');

    // --- title (wraps if you give it a longer one) ---
    g.fillStyle = c.accent;
    g.font = '42px "Press Start 2P", monospace';
    this.drawWrapped(g, LETTER_CONFIG.title, W / 2, 250, 800, 56);

    // --- the cat, in love ---
    const pixel = 15;
    const spriteX = W / 2 - (16 * pixel) / 2;
    this.drawSprite(g, MASCOT_BODY, PIXEL_COLORS, spriteX, 330, pixel);
    this.drawSprite(g, MASCOT_FACES.love, PIXEL_COLORS, spriteX, 330, pixel);

    // --- dashed divider ---
    g.fillStyle = '#ffd0e6';
    for (let x = 190; x < W - 190; x += 32) g.fillRect(x, 630, 18, 8);

    // --- when / what ---
    g.font = '30px "Press Start 2P", monospace';
    g.fillStyle = c.inkSoft;
    g.fillText(LETTER_CONFIG.whenLabel, W / 2, 730);

    g.font = '44px "Pixelify Sans", monospace';
    g.fillStyle = c.ink;
    this.drawWrapped(g, dateText, W / 2, 790, W - 300, 56);

    g.font = '30px "Press Start 2P", monospace';
    g.fillStyle = c.inkSoft;
    g.fillText(LETTER_CONFIG.whatLabel, W / 2, 900);

    g.font = '44px "Pixelify Sans", monospace';
    g.fillStyle = c.ink;
    this.drawWrapped(g, activityText, W / 2, 960, W - 300, 56);

    // --- dashed divider ---
    g.fillStyle = '#ffd0e6';
    for (let x = 190; x < W - 190; x += 32) g.fillRect(x, 1040, 18, 8);

    // --- the note ---
    g.font = '44px "Pixelify Sans", monospace';
    g.fillStyle = c.accent;
    this.drawWrapped(g, LETTER_CONFIG.note, W / 2, 1130, W - 280, 58);

    g.font = '18px "Press Start 2P", monospace';
    g.fillStyle = c.inkSoft;
    this.drawWrapped(g, LETTER_CONFIG.signoff, W / 2, 1230, 820, 30);

    this.canvas = canvas;
    return canvas;
  },

  /** Turn the canvas into a PNG blob (kept for saving and sharing). */
  toBlob() {
    return new Promise((resolve) => {
      if (!this.canvas) return resolve(null);
      this.canvas.toBlob((blob) => { this.blob = blob; resolve(blob); }, 'image/png');
    });
  },
};


/* =========================================================================
   3. THE FINAL SCREEN: show it, save it, send it
   ========================================================================= */
async function buildFinalLetter(dateText, activityText) {
  const img = document.getElementById('letter-img');
  const saveBtn = document.getElementById('btn-save');
  const shareBtn = document.getElementById('btn-share');
  const howToEl = document.getElementById('final-howto');
  const stepsEl = document.getElementById('final-steps');

  howToEl.textContent = LETTER_CONFIG.howTo;
  stepsEl.innerHTML = LETTER_CONFIG.steps
    .map((line) => '<span>' + line + '</span>').join('');
  saveBtn.textContent = LETTER_CONFIG.saveButton;
  shareBtn.textContent = LETTER_CONFIG.shareButton;

  await Letter.draw(dateText, activityText);
  const blob = await Letter.toBlob();
  if (!blob) return;

  /* A data: URL rather than a blob: URL - iOS refuses to "Save Image" from a
     blob, but happily saves a data URL when she presses and holds it. */
  img.src = Letter.canvas.toDataURL('image/png');

  const url = URL.createObjectURL(blob);
  const file = new File([blob], LETTER_CONFIG.fileName, { type: 'image/png' });
  const canShareFile = !!(navigator.canShare && navigator.canShare({ files: [file] }));

  /* iPhones and iPads ignore the download attribute for a picture made in the
     page, so there the share sheet (which has "Save Image" in it) is the way. */
  const isApplePhone = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));

  const holdHint = () => { howToEl.textContent = LETTER_CONFIG.holdMessage; };

  const shareIt = () => navigator.share({ files: [file], text: LETTER_CONFIG.shareText })
    .then(() => { howToEl.textContent = LETTER_CONFIG.savedMessage; })
    .catch(() => { /* she closed the sheet */ });

  /* --- save it --- */
  saveBtn.onclick = () => {
    if (isApplePhone && canShareFile) return shareIt();

    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = LETTER_CONFIG.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      howToEl.textContent = LETTER_CONFIG.savedMessage;
    } catch (e) {
      holdHint();
    }
  };

  /* --- or share the actual file, which opens her phone's share sheet
         with Instagram / WhatsApp / Messenger right in it --- */
  if (canShareFile) {
    shareBtn.hidden = false;
    shareBtn.onclick = shareIt;
  }
}

/** Pixel glyphs for the buttons: 'x' is drawn, '.' lets the colour show. */
const SOCIAL_GLYPHS = {
  /* a hollow chat bubble with a tail */
  whatsapp: [
    '................',
    '................',
    '..xxxxxxxxxxxx..',
    '..x..........x..',
    '..x..xxxxxx..x..',
    '..x..........x..',
    '..x..xxxxxx..x..',
    '..x..........x..',
    '..xxxxxxxxxxxx..',
    '....xx..........',
    '...xx...........',
    '..xx............',
    '................',
    '................',
    '................',
    '................',
  ],
  /* a little camera */
  instagram: [
    '................',
    '................',
    '..xxxxxxxxxxxx..',
    '..x.......x..x..',
    '..x...xxxx...x..',
    '..x..x....x..x..',
    '..x..x....x..x..',
    '..x...xxxx...x..',
    '..x..........x..',
    '..xxxxxxxxxxxx..',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  /* a filled bubble with a bolt cut out of it */
  messenger: [
    '................',
    '................',
    '..xxxxxxxxxxxx..',
    '..xxxxxxxxxxxx..',
    '..xxxxxxx..xxx..',
    '..xxxxxx..xxxx..',
    '..xxx....xxxxx..',
    '..xxxx..xxxxxx..',
    '..xxx..xxxxxxx..',
    '..xxxxxxxxxxxx..',
    '....xx..........',
    '...xx...........',
    '..xx............',
    '................',
    '................',
    '................',
  ],
};

/** Turn one of those grids into an inline SVG. */
function glyphSvg(rows) {
  const rects = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === 'x') {
        rects.push('<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02"/>');
      }
    });
  });
  return '<svg viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" ' +
         'aria-hidden="true">' + rects.join('') + '</svg>';
}

/** The three send-it-to-him buttons. */
function buildSocialLinks() {
  const row = document.getElementById('social-row');
  if (!row || row.childElementCount) return;

  const contact = LETTER_CONFIG.contact;
  const msg = encodeURIComponent(LETTER_CONFIG.shareText);

  const links = [
    {
      name: 'WhatsApp',
      cls: 'is-whatsapp',
      glyph: glyphSvg(SOCIAL_GLYPHS.whatsapp),
      href: contact.whatsapp
        ? 'https://wa.me/' + contact.whatsapp + '?text=' + msg
        : 'https://wa.me/?text=' + msg,
    },
    {
      name: 'Instagram',
      cls: 'is-instagram',
      glyph: glyphSvg(SOCIAL_GLYPHS.instagram),
      href: contact.instagram
        ? 'https://ig.me/m/' + contact.instagram
        : 'https://www.instagram.com/direct/inbox/',
    },
    {
      name: 'Messenger',
      cls: 'is-messenger',
      glyph: glyphSvg(SOCIAL_GLYPHS.messenger),
      href: contact.messenger
        ? 'https://m.me/' + contact.messenger
        : 'https://www.messenger.com/',
    },
  ];

  links.forEach((link) => {
    const a = document.createElement('a');
    a.className = 'social ' + link.cls;
    a.href = link.href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = link.glyph + '<span>' + link.name + '</span>';
    row.appendChild(a);
  });
}
