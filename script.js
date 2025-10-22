/* ----------------------------------------------------------
   Fixed design-space (desktop) + Mobile stacked previews
   - Desktop: stars & text at absolute pixel coords (no scaling).
   - Mobile: stacked iframes with "Artist — Title", each clickable.
   - Preview overlay: desktop only; mobile opens directly in new tab.
----------------------------------------------------------- */

const TOL = 16; // preview trigger tolerance (desktop)
const PADDING = 60; // extra canvas padding (desktop)

/* Students (pos = star coord; slot = viewport trigger size on desktop) */
const STUDENTS = [
  {
    name: "Flutter Shy",
    work: "Year 2 Pop Up",
    url: "https://flutter-shy-bit.github.io/Year2PopUp/",
    pos: { x: 1021, y: 434 },
    slot: { w: 1021, h: 434 },
  },
  {
    name: "M Tyda",
    work: "Unit 5",
    url: "https://mtyda.github.io/unit5/",
    pos: { x: 1100, y: 619 },
    slot: { w: 1100, h: 619 },
  },
  {
    name: "Val Ehu",
    work: "Who Am I",
    url: "https://valehu2517.github.io/WhoAmI/",
    pos: { x: 1274, y: 715 },
    slot: { w: 1274, h: 715 },
  },
  {
    name: "Mina",
    work: "Title",
    url: "https://minoliiih.github.io/unit5/",
    pos: { x: 1034, y: 725 },
    slot: { w: 1034, h: 725 },
  },
];

/* Desktop text positions (absolute pixels inside design canvas) */
const TEXT_POS = {
  title: { x: 620, y: 110 },
  subtitle: { x: 820, y: 150 },
  hint: { x: 90, y: 250 },
  year: { x: 130, y: 440 },
};

/* ---------- DOM ---------- */
const stage = document.getElementById("stage");
const sky = document.getElementById("sky");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const hintEl = document.getElementById("hint");
const yearEl = document.getElementById("year");

const workForm = document.getElementById("workForm");
const workSelect = document.getElementById("workSelect");

const preview = document.getElementById("preview");
const previewIframe = document.getElementById("previewIframe");
const previewLabel = document.getElementById("previewLabel");
const previewClose = document.getElementById("previewClose");

const mobileList = document.getElementById("mobileList");

/* ---------- Helpers ---------- */
function isMobile() {
  return window.matchMedia("(max-width: 560px)").matches;
}

function getViewportSize() {
  if (window.visualViewport) {
    return {
      w: Math.round(window.visualViewport.width),
      h: Math.round(window.visualViewport.height),
    };
  }
  return {
    w: Math.round(document.documentElement.clientWidth),
    h: Math.round(document.documentElement.clientHeight),
  };
}

/* ---------- Desktop: menu ---------- */
function buildMenu() {
  workSelect.innerHTML =
    `<option value="">works…</option>` +
    STUDENTS.map(
      (s, i) => `<option value="${i}">${s.name} — ${s.work}</option>`
    ).join("");
}

/* ---------- Desktop: fixed canvas ---------- */
function buildCanvas() {
  // compute canvas bounds to include all star + text positions
  const maxX = Math.max(
    ...STUDENTS.map((s) => s.pos.x),
    TEXT_POS.title.x,
    TEXT_POS.subtitle.x,
    TEXT_POS.hint.x,
    TEXT_POS.year.x
  );
  const maxY = Math.max(
    ...STUDENTS.map((s) => s.pos.y),
    TEXT_POS.title.y,
    TEXT_POS.subtitle.y,
    TEXT_POS.hint.y,
    TEXT_POS.year.y
  );
  const W = Math.ceil(maxX + PADDING);
  const H = Math.ceil(maxY + PADDING);

  // lock canvas size (no scaling)
  sky.style.width = `${W}px`;
  sky.style.height = `${H}px`;

  // position desktop text
  titleEl.style.left = TEXT_POS.title.x + "px";
  titleEl.style.top = TEXT_POS.title.y + "px";
  subtitleEl.style.left = TEXT_POS.subtitle.x + "px";
  subtitleEl.style.top = TEXT_POS.subtitle.y + "px";
  hintEl.style.left = TEXT_POS.hint.x + "px";
  hintEl.style.top = TEXT_POS.hint.y + "px";
  yearEl.style.left = TEXT_POS.year.x + "px";
  yearEl.style.top = TEXT_POS.year.y + "px";

  // inject stars
  sky.querySelectorAll(".star").forEach((n) => n.remove());
  const frag = document.createDocumentFragment();
  const cs = getComputedStyle(document.documentElement);
  const min = parseInt(cs.getPropertyValue("--star-min")) || 18;
  const max = parseInt(cs.getPropertyValue("--star-max")) || 34;

  STUDENTS.forEach((s) => {
    const a = document.createElement("p");
    a.className = "star";
    a.style.left = s.pos.x + "px";
    a.style.top = s.pos.y + "px";
    a.innerHTML = "✷";
    frag.appendChild(a);
  });

  sky.appendChild(frag);
}

/* ---------- Desktop: resize -> preview ---------- */
function matchPreview() {
  if (isMobile()) return; // no overlay on mobile
  const { w, h } = getViewportSize();

  const match = STUDENTS.find(
    (s) => Math.abs(w - s.slot.w) <= TOL && Math.abs(h - s.slot.h) <= TOL
  );

  if (match) {
    previewIframe.src = match.url;
    // keep the label as "Artist — Title" (no sizes)
    previewLabel.textContent = `${match.name} — ${match.work}`;
    // make the whole preview clickable to open a new tab
    let link = document.getElementById("previewLink");
    if (!link) {
      link = document.createElement("a");
      link.id = "previewLink";
      link.className = "coverlink";
      link.target = "_blank";
      link.rel = "noopener";
      preview.querySelector(".frame").appendChild(link);
    }
    link.href = match.url;

    preview.hidden = false;
  } else {
    preview.hidden = true;
    previewIframe.removeAttribute("src");
    const link = document.getElementById("previewLink");
    if (link) link.removeAttribute("href");
    previewLabel.textContent = "";
  }
}

/* ---------- Mobile: stacked previews ---------- */
function buildMobileList() {
  if (!mobileList) return;
  mobileList.innerHTML = STUDENTS.map(
    (s) => `
    <article class="mobile-card">
      <div class="label">${s.name} — ${s.work}</div>
      <div class="frame">
        <iframe src="${s.url}" loading="lazy" title="${s.name} — ${s.work}"></iframe>
        <a class="coverlink" href="${s.url}" target="_blank" rel="noopener" aria-label="open ${s.name} — ${s.work} in a new tab"></a>
      </div>
    </article>
  `
  ).join("");
}

/* toggle which mode is visible (no style changes beyond CSS @media) */
function toggleMode() {
  if (isMobile()) {
    // ensure overlay is hidden on mobile
    if (!preview.hidden) {
      preview.hidden = true;
      previewIframe.removeAttribute("src");
    }
  } else {
    // desktop: update overlay state to current viewport
    matchPreview();
  }
}

/* ---------- UI events ---------- */
workForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const idx = workSelect.value;
  if (idx !== "") window.open(STUDENTS[Number(idx)].url, "_blank", "noopener");
});

previewClose.addEventListener("click", () => {
  preview.hidden = true;
});

// Re-check on viewport changes (desktop) and toggle modes
window.addEventListener("resize", () => {
  toggleMode();
  matchPreview();
});
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    toggleMode();
    matchPreview();
  });
  window.visualViewport.addEventListener("scroll", () => {
    toggleMode();
    matchPreview();
  });
}

/* ---------- init ---------- */
buildMenu();
buildCanvas();
buildMobileList();
toggleMode();
matchPreview();
