// Isometric primitives. Everything returns SVG markup strings.
// Grid coordinates: x grows to the lower-right, y to the lower-left, z goes up.
// One grid unit = UNIT px along each axis.

export const UNIT = 32;
const COS = Math.cos(Math.PI / 6); // 0.866
const SIN = 0.5;

export function iso(x, y, z = 0) {
  return [(x - y) * COS * UNIT, (x + y) * SIN * UNIT - z * UNIT];
}

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const pts = (list) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');

export function dims(n) {
  return { x: n.x, y: n.y, z: n.z ?? 0, w: n.w ?? 1, d: n.d ?? 1, h: n.h ?? 1 };
}

// Footprint centre in grid space (used for wires and notes).
export function center(n) {
  const { x, y, w, d } = dims(n);
  return [x + w / 2, y + d / 2];
}

// Labels go in their own layer above every node, so a block in front never hides them.
// They share the node's data-id, so step states (hidden, dim) apply to them too.
function labels(n, ax, ay) {
  if (!n.label && !n.sub) return '';
  let out = '';
  if (n.label) out += `<text class="label" x="${ax.toFixed(1)}" y="${(ay + 20).toFixed(1)}">${esc(n.label)}</text>`;
  if (n.sub) out += `<text class="sublabel" x="${ax.toFixed(1)}" y="${(ay + 34).toFixed(1)}">${esc(n.sub)}</text>`;
  return `<g class="node-label" data-id="${esc(n.id)}">${out}</g>`;
}

// Text drawn flat on the top face (sheared into the iso plane).
function glyph(n, cx, cy, z) {
  if (!n.glyph) return '';
  const [gx, gy] = iso(cx, cy, z);
  return `<text class="glyph" transform="matrix(${COS.toFixed(4)} ${SIN} ${(-COS).toFixed(4)} ${SIN} ${gx.toFixed(1)} ${gy.toFixed(1)})">${esc(n.glyph)}</text>`;
}

// Node shapes return { shape, label } markup strings.
// Box. shape: 'block' (default) | 'server' (adds rack lines and a status light).
export function block(n) {
  const { x, y, z, w, d, h } = dims(n);
  const top = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const left = [iso(x, y + d, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x, y + d, z)];
  const right = [iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x + w, y, z)];

  let deco = '';
  if (n.shape === 'server') {
    for (let i = 1; i <= 3; i++) {
      const zz = z + (h * i) / 4;
      const [x1, y1] = iso(x + w * 0.14, y + d, zz);
      const [x2, y2] = iso(x + w * 0.62, y + d, zz);
      deco += `<line class="deco" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    const [lx, ly] = iso(x + w * 0.82, y + d, z + h * 0.75);
    deco += `<circle class="led" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.6"/>`;
  }

  const [ax, ay] = iso(x + w, y + d, z);
  const shape = `<g class="node tone-${esc(n.tone ?? 'sand')}" data-id="${esc(n.id)}">
  <g class="node__body">
    <polygon class="face face--top" points="${pts(top)}"/>
    <polygon class="face face--left" points="${pts(left)}"/>
    <polygon class="face face--right" points="${pts(right)}"/>
    ${deco}${glyph(n, x + w / 2, y + d / 2, z + h)}
  </g>
</g>`;
  return { shape, label: labels(n, ax, ay) };
}

// Upright cylinder (databases, queues, caches). Uses the footprint's inscribed circle.
export function cylinder(n) {
  const { z, w, d, h } = dims(n);
  const [cx, cy] = center(n);
  const r = (Math.min(w, d) / 2) * 0.92;
  const rx = r * UNIT * Math.SQRT2 * COS;
  const ry = r * UNIT * Math.SQRT2 * SIN;
  const [bx, by] = iso(cx, cy, z);
  const ty = by - h * UNIT;
  const f = (v) => v.toFixed(1);

  const side = `M${f(bx - rx)},${f(ty)} L${f(bx - rx)},${f(by)} A${f(rx)},${f(ry)} 0 0 0 ${f(bx + rx)},${f(by)} L${f(bx + rx)},${f(ty)} Z`;
  let bands = '';
  for (const k of [1 / 3, 2 / 3]) {
    const yy = by - h * UNIT * k;
    bands += `<path class="deco" d="M${f(bx - rx)},${f(yy)} A${f(rx)},${f(ry)} 0 0 0 ${f(bx + rx)},${f(yy)}"/>`;
  }

  const shape = `<g class="node tone-${esc(n.tone ?? 'sand')}" data-id="${esc(n.id)}">
  <g class="node__body">
    <path class="face face--left" d="${side}"/>
    ${bands}
    <ellipse class="face face--top" cx="${f(bx)}" cy="${f(ty)}" rx="${f(rx)}" ry="${f(ry)}"/>
    ${glyph(n, cx, cy, z + h)}
  </g>
</g>`;
  return { shape, label: labels(n, bx, by + ry - 4) };
}

// Flat floor area grouping nodes (datacenter, region, VPC...). Label sits above the back corner.
export function zone(n) {
  const { x, y, w, d } = dims(n);
  const z = -0.02;
  const poly = [iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)];
  const [lx, ly] = iso(x, y, z);
  const text = n.label ? `<text class="label zone__label" x="${lx.toFixed(1)}" y="${(ly - 10).toFixed(1)}">${esc(String(n.label).toUpperCase())}</text>` : '';
  return `<g class="zone tone-${esc(n.tone ?? 'green')}" data-id="${esc(n.id)}"><polygon class="face" points="${pts(poly)}"/>${text}</g>`;
}

// Floor-level path between two grid points. route: 'xy' (along x, then y) | 'yx' | 'straight'.
export function wirePath([ax, ay], [bx, by], route = 'xy') {
  const way =
    route === 'straight' ? [[ax, ay], [bx, by]]
    : route === 'yx' ? [[ax, ay], [ax, by], [bx, by]]
    : [[ax, ay], [bx, ay], [bx, by]];
  return way.map(([gx, gy], i) => {
    const [sx, sy] = iso(gx, gy, 0);
    return `${i ? 'L' : 'M'}${sx.toFixed(1)},${sy.toFixed(1)}`;
  }).join(' ');
}
