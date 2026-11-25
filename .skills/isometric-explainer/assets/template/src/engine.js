// Page shell, hash router (#/lesson-id/step) and step navigation.
import { renderScene } from './scene.js';
import { esc } from './iso.js';

const DEFAULT_UI = {
  prev: '← Anterior',
  next: 'Próximo →',
  nextLesson: 'Próxima lição →',
  end: 'Fim',
  lesson: 'Lição',
  step: 'Passo',
  theme: 'Alternar tema',
};

const DEFAULT_TAGS = {
  setup: { label: 'Contexto', tone: 'sand' },
  problem: { label: 'Problema', tone: 'red' },
  solution: { label: 'Solução', tone: 'green' },
  technique: { label: 'Técnica', tone: 'blue' },
  tradeoff: { label: 'Trade-off', tone: 'yellow' },
};

export function start(course, root) {
  const ui = { ...DEFAULT_UI, ...course.ui };
  const tags = { ...DEFAULT_TAGS, ...course.tags };
  const lessons = course.lessons;
  if (course.lang) document.documentElement.lang = course.lang;
  document.title = course.title;

  root.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#/${esc(lessons[0].id)}/1">${esc(course.title)}</a>
    <select class="lesson-select" aria-label="${esc(ui.lesson)}">
      ${lessons.map((l, i) => `<option value="${esc(l.id)}">${String(i + 1).padStart(2, '0')} · ${esc(l.title)}</option>`).join('')}
    </select>
    <button class="btn btn--icon theme-toggle" type="button" aria-label="${esc(ui.theme)}" title="${esc(ui.theme)}">◐</button>
  </header>
  <main class="layout">
    <section class="panel">
      <div class="panel__meta"><span class="lesson-index"></span><span class="step-count"></span></div>
      <h1 class="lesson-title"></h1>
      <article class="step" aria-live="polite">
        <span class="chip"></span>
        <h2 class="step__title"></h2>
        <div class="step__body"></div>
      </article>
      <footer class="controls">
        <button class="btn prev" type="button">${esc(ui.prev)}</button>
        <div class="dots"></div>
        <button class="btn btn--primary next" type="button"></button>
      </footer>
    </section>
    <section class="stage"><div class="sheet"><svg class="scene" role="img" xmlns="http://www.w3.org/2000/svg"></svg></div></section>
  </main>`;

  const $ = (s) => root.querySelector(s);
  const current = { lesson: null, scene: null };

  function parse() {
    const [, id, n] = location.hash.match(/^#\/([^/]+)(?:\/(\d+))?/) ?? [];
    const li = Math.max(0, lessons.findIndex((l) => l.id === decodeURIComponent(id ?? '')));
    const total = lessons[li].steps.length;
    const si = Math.min(Math.max(1, Number(n) || 1), total) - 1;
    return { li, si };
  }

  const go = (li, si) => { location.hash = `#/${lessons[li].id}/${si + 1}`; };

  function next() {
    const { li, si } = parse();
    if (si < lessons[li].steps.length - 1) go(li, si + 1);
    else if (li < lessons.length - 1) go(li + 1, 0);
  }

  function prev() {
    const { li, si } = parse();
    if (si > 0) go(li, si - 1);
    else if (li > 0) go(li - 1, lessons[li - 1].steps.length - 1);
  }

  // A step without `show` keeps the previous step's visible set.
  function resolveStep(lesson, si) {
    let show = null;
    for (let i = 0; i <= si; i++) if (lesson.steps[i].show) show = lesson.steps[i].show;
    return { ...lesson.steps[si], show };
  }

  function render() {
    const { li, si } = parse();
    const lesson = lessons[li];

    if (current.lesson !== lesson) {
      current.scene?.destroy();
      current.scene = renderScene($('.scene'), lesson.scene, lesson.steps);
      current.lesson = lesson;
      $('.lesson-title').textContent = lesson.title;
      $('.lesson-index').textContent = `${ui.lesson} ${String(li + 1).padStart(2, '0')}/${String(lessons.length).padStart(2, '0')}`;
      $('.lesson-select').value = lesson.id;
      $('.scene').setAttribute('aria-label', lesson.title);
      $('.dots').innerHTML = lesson.steps
        .map((_, i) => `<a class="dot" href="#/${esc(lesson.id)}/${i + 1}" aria-label="${esc(ui.step)} ${i + 1}"></a>`)
        .join('');
    }

    const step = resolveStep(lesson, si);
    const tag = tags[step.tag] ?? tags.setup;
    const chip = $('.chip');
    chip.textContent = tag.label;
    chip.className = `chip tone-${tag.tone}`;
    $('.step__title').textContent = step.title ?? '';
    $('.step__body').innerHTML = step.body ?? ''; // author-written HTML, never user input
    $('.step-count').textContent = `${ui.step} ${si + 1}/${lesson.steps.length}`;

    const article = $('.step');
    article.classList.remove('is-entering');
    void article.offsetWidth; // restart the CSS animation
    article.classList.add('is-entering');

    root.querySelectorAll('.dot').forEach((d, i) => {
      if (i === si) d.setAttribute('aria-current', 'step');
      else d.removeAttribute('aria-current');
    });

    const isLastStep = si === lesson.steps.length - 1;
    const isEnd = isLastStep && li === lessons.length - 1;
    $('.prev').disabled = li === 0 && si === 0;
    $('.next').disabled = isEnd;
    $('.next').textContent = isEnd ? ui.end : isLastStep ? ui.nextLesson : ui.next;

    current.scene.apply(step);
  }

  $('.prev').addEventListener('click', prev);
  $('.next').addEventListener('click', next);
  $('.lesson-select').addEventListener('change', (e) => { go(lessons.findIndex((l) => l.id === e.target.value), 0); });

  $('.theme-toggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    if (dark) document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  });

  addEventListener('keydown', (e) => {
    if (e.target.closest?.('select, input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === 'j') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft' || e.key === 'k') { e.preventDefault(); prev(); }
  });

  let touchX = null;
  $('.stage').addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') touchX = e.clientX; });
  $('.stage').addEventListener('pointerup', (e) => {
    if (touchX === null) return;
    const dx = e.clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  });

  addEventListener('hashchange', render);
  if (!/^#\/[^/]+/.test(location.hash)) history.replaceState(null, '', `#/${lessons[0].id}/1`);
  render();
}
