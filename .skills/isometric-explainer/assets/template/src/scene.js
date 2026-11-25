// Builds one lesson's diagram once, then switches step states on it.
import { iso, esc, dims, center, block, cylinder, zone, wirePath, UNIT } from './iso.js';

const NS = 'http://www.w3.org/2000/svg';
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

// `steps` is only used to include every step's notes in the framing.
export function renderScene(svg, scene, steps = []) {
  const { nodes = [], wires = [], zones = [] } = scene;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const known = new Set([...nodes, ...wires, ...zones].map((e) => e.id));

  const wireSvg = wires.map((w) => {
    const a = byId.get(w.from);
    const b = byId.get(w.to);
    if (!a || !b) {
      console.warn(`[scene] wire "${w.id}" points to an unknown node`, w);
      return '';
    }
    const d = wirePath(center(a), center(b), w.route);
    return `<g class="wire" data-id="${esc(w.id)}"><path class="wire__base" d="${d}"/><path class="wire__flow" d="${d}"/></g>`;
  }).join('');

  // Painter's algorithm: draw from back (small x+y) to front.
  const depth = (n) => { const { x, y, z, w, d } = dims(n); return x + w / 2 + y + d / 2 + z * 0.01; };
  const drawn = [...nodes].sort((a, b) => depth(a) - depth(b))
    .map((n) => (n.shape === 'cylinder' ? cylinder(n) : block(n)));

  svg.innerHTML = `<g class="world">
    <g class="layer">${zones.map(zone).join('')}</g>
    <g class="layer">${wireSvg}</g>
    <g class="layer">${drawn.map((d) => d.shape).join('')}</g>
    <g class="layer labels">${drawn.map((d) => d.label).join('')}</g>
    <g class="layer notes"></g>
    <g class="layer packets"></g>
  </g>`;

  const notesLayer = svg.querySelector('.notes');
  const packetsLayer = svg.querySelector('.packets');
  let raf = 0;

  // Frame the whole lesson once (every element and every step's notes, visible or not)
  // so the camera never jumps and no note is cut off at the edge.
  notesLayer.innerHTML = steps.flatMap((s) => s.notes ?? []).map(noteSvg).join('');
  const bb = svg.querySelector('.world').getBBox();
  notesLayer.replaceChildren();
  const pad = 40;
  const top = pad + 16; // room for packet labels on the highest wire
  svg.setAttribute('viewBox', `${bb.x - pad} ${bb.y - top} ${bb.width + pad * 2} ${bb.height + pad + top}`);

  const check = (ids = [], field) => ids.forEach((id) => {
    if (!known.has(id)) console.warn(`[scene] step.${field} has unknown id "${id}"`);
  });

  function noteSvg(note) {
    const n = byId.get(note.at);
    if (!n) { console.warn(`[scene] note points to unknown node "${note.at}"`); return ''; }
    const { z, w, d, h } = dims(n);
    const [cx, cy] = center(n);
    const [px, py] = iso(cx, cy, z + h);
    const topEdge = py - ((w + d) / 2) * 0.5 * UNIT; // back vertex of the top face
    const text = String(note.text);
    const bw = text.length * 7.2 + 22;
    const bh = 24;
    const by = topEdge - 16 - bh;
    const bx = px - bw / 2;
    const f = (v) => v.toFixed(1);
    return `<g class="note ${note.tone ? `tone-${esc(note.tone)}` : ''}">
      <line class="note__stem" x1="${f(px)}" y1="${f(by + bh)}" x2="${f(px)}" y2="${f(topEdge - 4)}"/>
      <rect class="note__shadow" x="${f(bx + 2)}" y="${f(by + 2)}" width="${f(bw)}" height="${bh}" rx="6"/>
      <rect class="note__box" x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${bh}" rx="6"/>
      <text class="note__text" x="${f(px)}" y="${f(by + bh / 2)}">${esc(text)}</text>
    </g>`;
  }

  function stopPackets() {
    cancelAnimationFrame(raf);
    packetsLayer.replaceChildren();
  }

  // All packets of a step share one loop period, so delays chain them (request, then response).
  function startPackets(list = []) {
    const items = list.map((p) => {
      const path = svg.querySelector(`.wire[data-id="${CSS.escape(p.wire)}"] .wire__base`);
      if (!path) { console.warn(`[scene] packet on unknown wire "${p.wire}"`); return null; }
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', `packet ${p.tone ? `tone-${p.tone}` : ''}`);
      g.innerHTML = `<circle r="6"/>${p.label ? `<text y="-12">${esc(p.label)}</text>` : ''}`;
      g.style.opacity = 0;
      packetsLayer.appendChild(g);
      return { g, path, len: path.getTotalLength(), delay: p.delay ?? 0, dur: p.duration ?? 1400, reverse: !!p.reverse };
    }).filter(Boolean);
    if (!items.length) return;

    const place = (it, t) => {
      const pt = it.path.getPointAtLength((it.reverse ? 1 - t : t) * it.len);
      it.g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    };

    if (reducedMotion()) {
      items.forEach((it) => { place(it, 0.5); it.g.style.opacity = 1; });
      return;
    }

    const period = Math.max(...items.map((it) => it.delay + it.dur)) + 700;
    const t0 = performance.now();
    const tick = (now) => {
      const e = (now - t0) % period;
      for (const it of items) {
        const t = (e - it.delay) / it.dur;
        if (t < 0 || t > 1) { it.g.style.opacity = 0; continue; }
        place(it, ease(t));
        it.g.style.opacity = Math.min(1, t / 0.12, (1 - t) / 0.12);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function apply(step) {
    check(step.show, 'show');
    check(step.active, 'active');
    check(step.focus, 'focus');

    const show = step.show ? new Set(step.show) : null; // null = everything visible
    const active = new Set(step.active ?? []);
    const focus = step.focus ? new Set(step.focus) : null;

    svg.querySelectorAll('[data-id]').forEach((el) => {
      const id = el.dataset.id;
      const visible = !show || show.has(id);
      el.classList.toggle('is-hidden', !visible);
      el.classList.toggle('is-active', visible && active.has(id));
      el.classList.toggle('is-dim', !!focus && visible && !focus.has(id) && !active.has(id) && !el.classList.contains('zone'));
    });

    notesLayer.innerHTML = (step.notes ?? []).map(noteSvg).join('');
    stopPackets();
    startPackets(step.packets);
  }

  return { apply, destroy: stopPackets };
}
