// The farewell: a realistic tombstone, as a live CSS scene and as a downloadable PNG.

export function wrapLines(text, maxChars) {
  const lines = [];
  let line = '';
  for (let word of String(text).trim().split(/\s+/).filter(Boolean)) {
    while (word.length > maxChars) {
      if (line) { lines.push(line); line = ''; }
      lines.push(word.slice(0, maxChars));
      word = word.slice(maxChars);
    }
    if (!line) line = word;
    else if (line.length + 1 + word.length <= maxChars) line += ' ' + word;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

function candle(n, left, height, width) {
  const c = el('div', `candle c${n}`);
  c.style.left = left;
  c.style.setProperty('--h', `${height}px`);
  c.style.setProperty('--w', `${width}px`);
  c.append(el('div', 'glow'), el('div', 'wick'), el('div', 'flame'));
  return c;
}

function marigold(left, bottom, size) {
  const m = el('div', 'marigold');
  Object.assign(m.style, { left, bottom: `${bottom}px`, width: `${size}px`, height: `${size}px` });
  return m;
}

// Live scene (animated candles). All text goes through textContent.
export function renderTombstone(container, { name, roman, epitaph, closing, dateLabel, hereLies }) {
  const scene = el('div', 'tomb-scene');
  scene.append(el('div', 'moon'));

  const stone = el('div', 'stone');
  stone.append(el('div', 'moss moss-a'), el('div', 'moss moss-b'));
  stone.insertAdjacentHTML('beforeend', '<svg class="crack" width="60" height="150" viewBox="0 0 60 150" aria-hidden="true"><path d="M50 0 L40 30 L46 52 L30 80 L34 104 L18 150" stroke="rgba(0,0,0,.55)" stroke-width="2" fill="none"/><path d="M51 1 L41 31 L47 53 L31 81 L35 105 L19 150" stroke="rgba(255,255,255,.08)" stroke-width="1" fill="none"/></svg>');
  const engraving = el('div', 'engraving');
  engraving.append(
    el('div', 'cross', '✝'),
    el('div', 'here', hereLies),
    el('div', 'name', name),
    el('div', 'dates', `${roman} – ∞`),
    el('div', 'rule'),
    el('div', 'epitaph', epitaph),
    el('div', 'closing', closing),
  );
  stone.append(engraving);

  scene.append(
    stone,
    el('div', 'stone-light'),
    el('div', 'ground'),
    el('div', 'grass'),
    candle(1, 'calc(50% - 200px)', 84, 20),
    candle(2, 'calc(50% - 168px)', 52, 16),
    candle(3, 'calc(50% + 150px)', 70, 18),
    candle(4, 'calc(50% + 180px)', 42, 15),
    marigold('calc(50% - 132px)', 40, 26),
    marigold('calc(50% - 112px)', 34, 20),
    marigold('calc(50% + 112px)', 38, 24),
    el('div', 'fog'),
    el('div', 'tomb-date', dateLabel),
  );
  container.replaceChildren(scene);
  return scene;
}

// ---------- PNG (Canvas 2D redraw; flames frozen in time) ----------

const W = 1080, H = 1350;

function rand(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function archPath(ctx, x, y, w, h) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function drawCandle(ctx, cx, baseY, w, h) {
  const top = baseY - h;
  const glow = ctx.createRadialGradient(cx, top - 30, 0, cx, top - 30, 170);
  glow.addColorStop(0, 'rgba(255,170,60,.42)');
  glow.addColorStop(.4, 'rgba(255,120,30,.14)');
  glow.addColorStop(1, 'rgba(255,120,30,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 180, top - 210, 360, 360);

  const wax = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  wax.addColorStop(0, '#b9a98a'); wax.addColorStop(.35, '#f3e9d2'); wax.addColorStop(.5, '#fff7e6');
  wax.addColorStop(.7, '#e6d7b8'); wax.addColorStop(1, '#9c8c6e');
  ctx.fillStyle = wax;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, top, w, h, 4);
  ctx.fill();
  // drips
  ctx.fillStyle = '#fbf1dc';
  ctx.beginPath(); ctx.roundRect(cx - w / 2 + w * .15, top - 2, w * .3, h * .28, [0, 0, 8, 8]); ctx.fill();
  ctx.beginPath(); ctx.roundRect(cx + w / 2 - w * .34, top - 2, w * .22, h * .4, [0, 0, 6, 6]); ctx.fill();
  // wick
  ctx.fillStyle = '#2a2018';
  ctx.fillRect(cx - 2, top - 14, 4, 15);
  // flame
  const fh = w * 2.2, fw = w * .9;
  const fy = top - 14 - fh;
  const flame = ctx.createRadialGradient(cx, fy + fh * .85, 0, cx, fy + fh * .6, fh * .7);
  flame.addColorStop(0, '#ffffff'); flame.addColorStop(.18, '#fff6c2'); flame.addColorStop(.4, '#ffc94a');
  flame.addColorStop(.7, '#ff7a1a'); flame.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(cx, fy);
  ctx.bezierCurveTo(cx + fw * .7, fy + fh * .45, cx + fw * .6, fy + fh, cx, fy + fh);
  ctx.bezierCurveTo(cx - fw * .6, fy + fh, cx - fw * .7, fy + fh * .45, cx, fy);
  ctx.fill();
  const blue = ctx.createRadialGradient(cx, fy + fh * .92, 0, cx, fy + fh * .92, fw * .35);
  blue.addColorStop(0, 'rgba(58,107,255,.7)'); blue.addColorStop(1, 'rgba(58,107,255,0)');
  ctx.fillStyle = blue;
  ctx.fillRect(cx - fw, fy + fh * .7, fw * 2, fh * .4);
}

function drawMarigold(ctx, cx, cy, r, rnd) {
  for (let ring = 3; ring >= 1; ring--) {
    const rr = (r * ring) / 3;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + ring;
      ctx.fillStyle = ring === 1 ? '#c94f00' : ring === 2 ? '#ff8c00' : '#ffa51f';
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * rr * .55, cy + Math.sin(a) * rr * .45, rr * .38, rr * .26, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(80,30,0,.6)';
  ctx.beginPath(); ctx.arc(cx, cy, r * .12 + rnd() * 2, 0, Math.PI * 2); ctx.fill();
}

function engrave(ctx, text, x, y) {
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  ctx.fillText(text, x + 2, y + 2);
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillText(text, x - 1, y - 1);
  ctx.fillStyle = '#383b37';
  ctx.fillText(text, x, y);
}

export async function drawTombstonePng({ name, roman, epitaph, last_words, closing, dateLabel, hereLies, spiritId }) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const rnd = rand(name.length * 7919 + 17);
  const groundY = H - 230;

  // night sky + moon
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#05080a'); sky.addColorStop(.55, '#0d1714'); sky.addColorStop(1, '#111a12');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const moon = ctx.createRadialGradient(W * .8, 190, 0, W * .8, 190, 260);
  moon.addColorStop(0, '#eef4ee'); moon.addColorStop(.17, '#b9c9bc'); moon.addColorStop(.24, 'rgba(90,110,100,.35)'); moon.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = moon; ctx.fillRect(0, 0, W, H);

  // stone
  const sw = 600, sh = 820, sx = (W - sw) / 2, sy = groundY - sh + 40;
  ctx.save();
  ctx.translate(W / 2, groundY);
  ctx.rotate(-0.026);
  ctx.translate(-W / 2, -groundY);
  ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  archPath(ctx, sx, sy, sw, sh);
  const granite = ctx.createRadialGradient(sx + sw * .35, sy + sh * .2, 20, sx + sw * .5, sy + sh * .5, sh * .75);
  granite.addColorStop(0, '#8f938e'); granite.addColorStop(.45, '#5d625d'); granite.addColorStop(1, '#353935');
  ctx.fillStyle = granite; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.save();
  ctx.clip();
  // grain
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = rnd() > .5 ? `rgba(255,255,255,${rnd() * .09})` : `rgba(0,0,0,${rnd() * .2})`;
    ctx.fillRect(sx + rnd() * sw, sy + rnd() * sh, 1 + rnd() * 2.5, 1 + rnd() * 2.5);
  }
  // edge shading
  const edge = ctx.createLinearGradient(sx, 0, sx + sw, 0);
  edge.addColorStop(0, 'rgba(255,255,255,.07)'); edge.addColorStop(.7, 'rgba(0,0,0,0)'); edge.addColorStop(1, 'rgba(0,0,0,.5)');
  ctx.fillStyle = edge; ctx.fillRect(sx, sy, sw, sh);
  // candle light on the stone
  for (const [x, a] of [[sx + 40, .3], [sx + sw - 40, .26]]) {
    const warm = ctx.createRadialGradient(x, sy + sh, 0, x, sy + sh, 420);
    warm.addColorStop(0, `rgba(255,150,50,${a})`); warm.addColorStop(1, 'rgba(255,150,50,0)');
    ctx.fillStyle = warm; ctx.fillRect(sx, sy, sw, sh);
  }
  // moss
  const moss = ctx.createRadialGradient(sx + 40, sy + sh, 0, sx + 40, sy + sh, 230);
  moss.addColorStop(0, 'rgba(70,110,40,.9)'); moss.addColorStop(.45, 'rgba(60,95,35,.5)'); moss.addColorStop(1, 'rgba(60,95,35,0)');
  ctx.fillStyle = moss; ctx.fillRect(sx, sy, sw, sh);
  const moss2 = ctx.createRadialGradient(sx + sw - 60, sy + 140, 0, sx + sw - 60, sy + 140, 70);
  moss2.addColorStop(0, 'rgba(80,120,50,.6)'); moss2.addColorStop(1, 'rgba(80,120,50,0)');
  ctx.fillStyle = moss2; ctx.fillRect(sx, sy, sw, sh);
  // crack
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath();
  const crack = [[sw - 70, 70], [sw - 95, 150], [sw - 80, 205], [sw - 120, 280], [sw - 110, 340], [sw - 150, 430]];
  crack.forEach(([x, y], i) => (i ? ctx.lineTo(sx + x, sy + y) : ctx.moveTo(sx + x, sy + y)));
  ctx.stroke();
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.1)';
  ctx.beginPath();
  crack.forEach(([x, y], i) => (i ? ctx.lineTo(sx + x + 3, sy + y + 2) : ctx.moveTo(sx + x + 3, sy + y + 2)));
  ctx.stroke();
  ctx.restore();

  // engraving
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const cx = W / 2;
  let y = sy + 150;
  ctx.font = '64px Georgia, serif'; engrave(ctx, '✝', cx, y);
  y += 60; ctx.font = '26px Georgia, serif'; ctx.letterSpacing = '8px'; engrave(ctx, hereLies, cx, y);
  y += 82; ctx.font = 'bold 76px Georgia, serif'; ctx.letterSpacing = '10px'; engrave(ctx, name, cx, y);
  y += 54; ctx.font = '30px Georgia, serif'; ctx.letterSpacing = '6px'; engrave(ctx, `${roman} – ∞`, cx, y);
  y += 38;
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(cx - 140, y, 280, 2);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(cx - 140, y + 2, 280, 1);
  ctx.letterSpacing = '0px';
  ctx.font = 'italic 34px Georgia, serif';
  y += 62;
  for (const line of wrapLines(epitaph, 24)) { engrave(ctx, line, cx, y); y += 46; }
  ctx.font = '22px Georgia, serif'; ctx.letterSpacing = '4px';
  engrave(ctx, closing, cx, Math.max(y + 30, sy + sh - 120));
  ctx.letterSpacing = '0px';
  ctx.restore();

  // ground + grass
  const ground = ctx.createLinearGradient(0, groundY, 0, H);
  ground.addColorStop(0, '#18230f'); ground.addColorStop(1, '#070b05');
  ctx.fillStyle = ground; ctx.fillRect(0, groundY, W, H - groundY);
  for (let i = 0; i < 900; i++) {
    const gx = rnd() * W, gh = 14 + rnd() * 34;
    ctx.strokeStyle = `rgba(${30 + rnd() * 25},${50 + rnd() * 30},${18 + rnd() * 12},.9)`;
    ctx.lineWidth = 1.5 + rnd() * 1.5;
    ctx.beginPath(); ctx.moveTo(gx, groundY + 20); ctx.quadraticCurveTo(gx + 4, groundY + 10 - gh / 2, gx + (rnd() - .5) * 14, groundY + 20 - gh); ctx.stroke();
  }

  // candles + marigolds
  drawCandle(ctx, cx - 380, groundY + 40, 40, 190);
  drawCandle(ctx, cx - 318, groundY + 50, 32, 120);
  drawCandle(ctx, cx + 330, groundY + 44, 36, 160);
  drawCandle(ctx, cx + 390, groundY + 52, 30, 96);
  drawMarigold(ctx, cx - 250, groundY + 70, 36, rnd);
  drawMarigold(ctx, cx - 205, groundY + 92, 28, rnd);
  drawMarigold(ctx, cx + 250, groundY + 80, 34, rnd);

  // fog
  for (const [fx, fy, r, a] of [[W * .3, groundY + 40, 420, .17], [W * .75, groundY + 70, 380, .13]]) {
    const fog = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
    fog.addColorStop(0, `rgba(200,215,205,${a})`); fog.addColorStop(1, 'rgba(200,215,205,0)');
    ctx.fillStyle = fog; ctx.fillRect(0, groundY - r, W, r * 2);
  }

  // terminal overlay: last words + credits
  ctx.textAlign = 'left';
  ctx.font = '26px Consolas, "Courier New", monospace';
  ctx.shadowColor = 'rgba(57,255,106,.9)'; ctx.shadowBlur = 10;
  ctx.fillStyle = '#39ff6a';
  ctx.fillText(`> release --spirit=${spiritId}`, 48, 70);
  ctx.font = '30px Consolas, "Courier New", monospace';
  let ly = 120;
  for (const line of wrapLines(`${name}> ${last_words}`, 52)) { ctx.fillText(line, 48, ly); ly += 40; }
  ctx.font = '22px Consolas, "Courier New", monospace';
  ctx.globalAlpha = .7;
  ctx.textAlign = 'right';
  ctx.fillText(`${dateLabel} · SÉANCE.EXE · gemma4:e2b · offline`, W - 40, H - 36);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
