#!/usr/bin/env node
// Validates a course.js file: ids, references, tags, tones, and step sizes.
// Usage: node check-course.mjs <path/to/src/course.js>
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('usage: node check-course.mjs <path/to/src/course.js>');
  process.exit(2);
}

const { course } = await import(pathToFileURL(resolve(file)).href);
const TONES = new Set(['sand', 'green', 'violet', 'orange', 'mint', 'blue', 'red', 'yellow']);
const SHAPES = new Set([undefined, 'block', 'server', 'cylinder']);
const ROUTES = new Set([undefined, 'xy', 'yx', 'straight']);
const TAGS = new Set(['setup', 'problem', 'solution', 'technique', 'tradeoff', ...Object.keys(course.tags ?? {})]);
const ID = /^[a-z0-9][a-z0-9-]*$/;

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

if (!course?.title) err('course.title is missing');
if (!Array.isArray(course?.lessons) || !course.lessons.length) err('course.lessons is empty');

const lessonIds = new Set();
for (const [li, lesson] of (course.lessons ?? []).entries()) {
  const where = `lesson[${li}] "${lesson.id}"`;
  if (!ID.test(lesson.id ?? '')) err(`${where}: id must be lowercase letters, digits and hyphens`);
  if (lessonIds.has(lesson.id)) err(`${where}: duplicate lesson id`);
  lessonIds.add(lesson.id);
  if (!lesson.title) err(`${where}: title is missing`);

  const { nodes = [], wires = [], zones = [] } = lesson.scene ?? {};
  const ids = new Map();
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const [kind, list] of [['node', nodes], ['wire', wires], ['zone', zones]]) {
    for (const e of list) {
      if (!e.id) { err(`${where}: a ${kind} has no id`); continue; }
      if (ids.has(e.id)) err(`${where}: id "${e.id}" used by both ${ids.get(e.id)} and ${kind}`);
      ids.set(e.id, kind);
      if (e.tone && !TONES.has(e.tone)) err(`${where}: ${kind} "${e.id}" has unknown tone "${e.tone}"`);
      if (kind !== 'wire' && (typeof e.x !== 'number' || typeof e.y !== 'number')) err(`${where}: ${kind} "${e.id}" needs numeric x and y`);
    }
  }
  for (const n of nodes) if (!SHAPES.has(n.shape)) err(`${where}: node "${n.id}" has unknown shape "${n.shape}"`);
  for (const w of wires) {
    if (!nodeIds.has(w.from)) err(`${where}: wire "${w.id}" from unknown node "${w.from}"`);
    if (!nodeIds.has(w.to)) err(`${where}: wire "${w.id}" to unknown node "${w.to}"`);
    if (!ROUTES.has(w.route)) err(`${where}: wire "${w.id}" has unknown route "${w.route}"`);
  }

  // Overlapping footprints at the same height usually mean a layout mistake.
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const ax2 = a.x + (a.w ?? 1), ay2 = a.y + (a.d ?? 1), bx2 = b.x + (b.w ?? 1), by2 = b.y + (b.d ?? 1);
      if ((a.z ?? 0) === (b.z ?? 0) && a.x < bx2 && b.x < ax2 && a.y < by2 && b.y < ay2) warn(`${where}: nodes "${a.id}" and "${b.id}" overlap`);
    }
  }

  const steps = lesson.steps ?? [];
  if (!steps.length) err(`${where}: no steps`);
  if (steps.length > 8) warn(`${where}: ${steps.length} steps; consider splitting the lesson (3-7 is the sweet spot)`);
  for (const [si, s] of steps.entries()) {
    const sw = `${where} step ${si + 1}`;
    if (!TAGS.has(s.tag)) err(`${sw}: unknown tag "${s.tag}"`);
    if (!s.title) err(`${sw}: title is missing`);
    for (const field of ['show', 'active', 'focus']) {
      for (const id of s[field] ?? []) if (!ids.has(id)) err(`${sw}: ${field} has unknown id "${id}"`);
    }
    for (const p of s.packets ?? []) {
      if (ids.get(p.wire) !== 'wire') err(`${sw}: packet on unknown wire "${p.wire}"`);
      if (p.tone && !TONES.has(p.tone)) err(`${sw}: packet has unknown tone "${p.tone}"`);
    }
    for (const n of s.notes ?? []) if (!nodeIds.has(n.at)) err(`${sw}: note on unknown node "${n.at}"`);
    const words = String(s.body ?? '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    if (words > 90) warn(`${sw}: body has ${words} words; aim for 30-80`);
  }
  if (steps[0] && !steps[0].show) warn(`${where}: step 1 has no "show", so the whole scene appears at once`);

  // Screen-space collisions: labels and notes hiding nodes or each other (per step, visible items only).
  const boxes = screenBoxes(nodes);
  let show = null;
  const seen = new Set();
  for (const [si, s] of steps.entries()) {
    if (s.show) show = new Set(s.show);
    const vis = (id) => !show || show.has(id);
    const items = [];
    for (const n of nodes) {
      if (!vis(n.id)) continue;
      items.push({ kind: 'node', id: n.id, owner: n.id, box: boxes.get(n.id).body });
      if (boxes.get(n.id).label) items.push({ kind: 'label', id: `label of "${n.id}"`, owner: n.id, box: boxes.get(n.id).label });
    }
    for (const note of s.notes ?? []) {
      const b = boxes.get(note.at);
      if (b) items.push({ kind: 'note', id: `note "${note.text}"`, owner: note.at, box: noteBox(b.topX, b.topY, String(note.text)) });
    }
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        if (a.owner === b.owner) continue;
        if (a.kind === 'node' && b.kind === 'node') continue; // depth sorting handles bodies
        if (!hit(a.box, b.box)) continue;
        const key = `${a.id}|${b.id}`;
        if (seen.has(key) && a.kind !== 'note' && b.kind !== 'note') continue;
        seen.add(key);
        warn(`${where} step ${si + 1}: ${a.kind === 'node' ? `node "${a.id}"` : a.id} overlaps ${b.kind === 'node' ? `node "${b.id}"` : b.id} on screen`);
      }
    }
  }
}

// Mirrors the geometry in assets/template/src/iso.js and scene.js (UNIT = 32).
function screenBoxes(nodes) {
  const U = 32, C = Math.cos(Math.PI / 6), S = 0.5;
  const iso = (x, y, z = 0) => [(x - y) * C * U, (x + y) * S * U - z * U];
  const textBox = (cx, baseline, text, charW, size) => {
    const w = String(text).length * charW;
    return { x1: cx - w / 2, x2: cx + w / 2, y1: baseline - size, y2: baseline + 3 };
  };
  const join = (a, b) => (!a ? b : !b ? a : { x1: Math.min(a.x1, b.x1), x2: Math.max(a.x2, b.x2), y1: Math.min(a.y1, b.y1), y2: Math.max(a.y2, b.y2) });
  const out = new Map();
  for (const n of nodes) {
    const x = n.x, y = n.y, z = n.z ?? 0, w = n.w ?? 1, d = n.d ?? 1, h = n.h ?? 1;
    const cx = x + w / 2, cy = y + d / 2;
    let body, ax, ay;
    if (n.shape === 'cylinder') {
      const r = (Math.min(w, d) / 2) * 0.92;
      const rx = r * U * Math.SQRT2 * C, ry = r * U * Math.SQRT2 * S;
      const [bx, by] = iso(cx, cy, z);
      body = { x1: bx - rx, x2: bx + rx, y1: by - h * U - ry, y2: by + ry };
      ax = bx; ay = by + ry - 4;
    } else {
      body = { x1: iso(x, y + d)[0], x2: iso(x + w, y)[0], y1: iso(x, y, z + h)[1], y2: iso(x + w, y + d, z)[1] };
      [ax, ay] = iso(x + w, y + d, z);
    }
    let label = null;
    if (n.label) label = textBox(ax, ay + 20, n.label, 7.0, 11.5);
    if (n.sub) label = join(label, textBox(ax, ay + 34, n.sub, 6.1, 10));
    const [tx, py] = iso(cx, cy, z + h);
    out.set(n.id, { body, label, topX: tx, topY: py - ((w + d) / 2) * 0.5 * U });
  }
  return out;
}

function noteBox(px, topEdge, text) {
  const bw = text.length * 7.2 + 22;
  const by = topEdge - 16 - 24;
  return { x1: px - bw / 2, x2: px + bw / 2, y1: by, y2: topEdge - 4 };
}

function hit(a, b, m = 2) {
  return a.x1 < b.x2 - m && b.x1 < a.x2 - m && a.y1 < b.y2 - m && b.y1 < a.y2 - m;
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`error ${e}`);
const lessons = course.lessons?.length ?? 0;
const steps = (course.lessons ?? []).reduce((n, l) => n + (l.steps?.length ?? 0), 0);
console.log(`${errors.length ? 'FAIL' : 'OK'}: ${lessons} lessons, ${steps} steps, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
