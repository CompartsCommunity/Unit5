/* ----------------------------------------------------------
   Fixed design-space (no scaling, no reflow)
   - Stars + desktop text are placed at absolute pixel coords
     in a fixed canvas (#sky). They never move on resize.
   - Preview shows when the layout viewport (CSS px) bottom-
     right corner matches a student's slot within ±TOL.
----------------------------------------------------------- */

const TOL = 16;       // a bit friendlier than 10px
const PADDING = 60;   // extra canvas padding (pixels)

/* 1) Student data
   pos.x/pos.y = star position in DESIGN PIXELS
   slot.w/slot.h = viewport size that triggers preview
*/
const STUDENTS = [
  {
    name: "Melissa Li",
    work: "Noisy Echos",
    url: "https://melissayunzhi.github.io/NoisyEchos/",
    // star sits exactly where the viewport needs to be
    pos:  { x: 800,  y: 906 },
    slot: { w: 800,  h: 906 }
  },
  {
    name: "Flutter Shy",
    work: "Year 2 Pop Up",
    url: "https://flutter-shy-bit.github.io/Year2PopUp/",
    pos:  { x: 1021, y: 434 },
    slot: { w: 1021, h: 434 }
  },
  {
    name: "M Tyda",
    work: "Unit 5",
    url: "https://mtyda.github.io/unit5/",
    pos:  { x: 1100, y: 619 },
    slot: { w: 1100, h: 619 }
  },
  {
    name: "Val Ehu",
    work: "Who Am I",
    url: "https://valehu2517.github.io/WhoAmI/",
    pos:  { x: 1274, y: 715 },
    slot: { w: 1274, h: 715 }
  }
];


/* 2) Desktop text positions in the same design space */
const TEXT_POS = {
  title:    { x: 620,  y: 110 },
  subtitle: { x: 820,  y: 150 },
  hint:     { x:  90,  y: 250 },
  year:     { x: 130,  y: 440 }
};

/* ---------- DOM ---------- */
const stage = document.getElementById('stage');
const sky = document.getElementById('sky');
const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const hintEl = document.getElementById('hint');
const yearEl = document.getElementById('year');

const workForm = document.getElementById('workForm');
const workSelect = document.getElementById('workSelect');

const preview = document.getElementById('preview');
const previewLink  = document.getElementById('previewLink');

const previewIframe = document.getElementById('previewIframe');
const previewLabel = document.getElementById('previewLabel');
const previewClose = document.getElementById('previewClose');

/* ---------- Build select ---------- */
function buildMenu(){
  workSelect.innerHTML = `<option value="">works…</option>` +
    STUDENTS.map((s,i)=>`<option value="${i}">${s.name} — ${s.work}</option>`).join('');
}

/* ---------- Build fixed canvas (1:1, no scale) ---------- */
function buildCanvas(){
  // canvas size to include all star + text positions
  const maxX = Math.max(
    ...STUDENTS.map(s=>s.pos.x),
    TEXT_POS.title.x, TEXT_POS.subtitle.x, TEXT_POS.hint.x, TEXT_POS.year.x
  );
  const maxY = Math.max(
    ...STUDENTS.map(s=>s.pos.y),
    TEXT_POS.title.y, TEXT_POS.subtitle.y, TEXT_POS.hint.y, TEXT_POS.year.y
  );
  const W = Math.ceil(maxX + PADDING);
  const H = Math.ceil(maxY + PADDING);

  // lock canvas size (no transform scaling)
  sky.style.width  = `${W}px`;
  sky.style.height = `${H}px`;

  // place desktop text at fixed pixels
  titleEl.style.left = TEXT_POS.title.x + 'px';
  titleEl.style.top  = TEXT_POS.title.y + 'px';

  subtitleEl.style.left = TEXT_POS.subtitle.x + 'px';
  subtitleEl.style.top  = TEXT_POS.subtitle.y + 'px';

  hintEl.style.left = TEXT_POS.hint.x + 'px';
  hintEl.style.top  = TEXT_POS.hint.y + 'px';

  yearEl.style.left = TEXT_POS.year.x + 'px';
  yearEl.style.top  = TEXT_POS.year.y + 'px';

  // inject stars at fixed pixels (size picked once for look only)
  sky.querySelectorAll('.star').forEach(n=>n.remove());
  const frag = document.createDocumentFragment();
  const cs = getComputedStyle(document.documentElement);
  const min = parseInt(cs.getPropertyValue('--star-min')) || 18;
  const max = parseInt(cs.getPropertyValue('--star-max')) || 34;

  STUDENTS.forEach(s=>{
    const a = document.createElement('a');
    a.className = 'star';
    a.href = s.url; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', `${s.name} — ${s.work}`);
    const sz = Math.round(min + Math.random()*(max-min));
    a.style.setProperty('--sz', sz + 'px');
    a.style.left = s.pos.x + 'px';
    a.style.top  = s.pos.y + 'px';
    a.innerHTML = `<span></span><div class="label">${s.name}</div>`;
    frag.appendChild(a);
  });

  sky.appendChild(frag);
}

/* ---------- Viewport sizing like CSS media queries ---------- */
function getViewportSize(){
  if (window.visualViewport) {
    return {
      w: Math.round(window.visualViewport.width),
      h: Math.round(window.visualViewport.height)
    };
  }
  return {
    w: Math.round(document.documentElement.clientWidth),
    h: Math.round(document.documentElement.clientHeight)
  };
}

/* ---------- Viewport → preview (corner hits slot) ---------- */
function matchPreview(){
  const { w, h } = getViewportSize();

  const match = STUDENTS.find(s =>
    Math.abs(w - s.slot.w) <= TOL &&
    Math.abs(h - s.slot.h) <= TOL
  );

  if (match) {
    // load preview + make whole preview clickable
    previewIframe.src = match.url;
    previewLink.href  = match.url;

    // label: artist — title (NO width/height)
    previewLabel.textContent = `${match.name} — ${match.work}`;

    preview.hidden = false;
  } else {
    preview.hidden = true;
    previewIframe.removeAttribute('src');
    previewLink.removeAttribute('href');
    previewLabel.textContent = '';
  }
}

/* ---------- UI events ---------- */
workForm.addEventListener('submit', e=>{
  e.preventDefault();
  const idx = workSelect.value;
  if (idx !== '') window.open(STUDENTS[Number(idx)].url,'_blank','noopener');
});

previewClose.addEventListener('click', ()=>{ preview.hidden = true; });

// Re-check preview on any viewport change (desktop + mobile UI collapses)
window.addEventListener('resize', matchPreview);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', matchPreview);
  window.visualViewport.addEventListener('scroll', matchPreview);
}

/* ---------- init ---------- */
buildMenu();
buildCanvas();
matchPreview();
