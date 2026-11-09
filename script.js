/* =========================================================
   Adithya Suresh — Portfolio interactions
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Intro (replaces the blocking loader) ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

  /* ---------- Year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    $('#toast-text').textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
    }
    showToast('Email copied to clipboard');
  }
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => copyText(btn.dataset.copy)));

  /* ---------- Nav: scrolled state, hide on scroll down, progress ---------- */
  const nav = $('#nav');
  const progress = $('#progress');
  const toTop = $('#to-top');
  const ringFill = $('#ring-fill');
  const RING_LEN = 2 * Math.PI * 22;
  ringFill.style.strokeDasharray = RING_LEN;
  ringFill.style.strokeDashoffset = RING_LEN;

  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(y / max, 1) : 0;

    progress.style.transform = `scaleX(${p})`;
    ringFill.style.strokeDashoffset = RING_LEN * (1 - p);

    nav.classList.toggle('is-scrolled', y > 10);
    const menuOpen = document.body.classList.contains('menu-open');
    if (!menuOpen) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    toTop.classList.toggle('is-visible', y > 600);

    lastY = y;
    updateActive();
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Nav: active section + sliding indicator ---------- */
  const navLinks = $$('.nav-link');
  const indicator = $('#nav-indicator');
  const linksWrap = $('#nav-links');
  const trackedSections = navLinks.map(l => document.getElementById(l.dataset.section)).filter(Boolean);
  let activeLink = null;

  function moveIndicator(link) {
    if (!link) { indicator.style.opacity = '0'; return; }
    indicator.style.opacity = '1';
    indicator.style.left = `${link.offsetLeft}px`;
    indicator.style.width = `${link.offsetWidth}px`;
  }

  function updateActive() {
    const probe = window.innerHeight * 0.35;
    let current = null;
    for (const sec of trackedSections) {
      const r = sec.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { current = sec.id; break; }
    }
    const link = navLinks.find(l => l.dataset.section === current) || null;
    if (link !== activeLink) {
      navLinks.forEach(l => { l.classList.toggle('is-active', l === link); l.toggleAttribute('aria-current', l === link); });
      activeLink = link;
      if (!linksWrap.matches(':hover')) moveIndicator(link);
    }
  }
  navLinks.forEach(l => l.addEventListener('mouseenter', () => moveIndicator(l)));
  linksWrap.addEventListener('mouseleave', () => moveIndicator(activeLink));
  window.addEventListener('resize', () => moveIndicator(activeLink));

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menu-btn');
  const mobileMenu = $('#mobile-menu');
  function setMenu(open) {
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    document.body.classList.toggle('menu-open', open);
    if (open) nav.classList.remove('is-hidden');
    $$('a', mobileMenu).forEach((a, i) => { a.style.transitionDelay = open ? `${i * 35}ms` : '0ms'; });
  }
  menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
  $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-in');
          io.unobserve(el);
          // hand control back to the element's own hover transitions
          setTimeout(() => { el.style.transitionDelay = ''; el.classList.add('settled'); }, 1300);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    // stagger siblings in the same grid
    revealEls.forEach(el => {
      const sibs = $$(':scope > .reveal', el.parentElement);
      const i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-in', 'settled'));
  }

  /* ---------- Count-up stats ---------- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    const dur = 1400;
    const start = performance.now();
    const step = now => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = (0).toFixed(decimals);
    setTimeout(() => requestAnimationFrame(step), 500);
  }
  $$('[data-count]').forEach(countUp);

  /* ---------- Card spotlight (cursor-tracked glow) ---------- */
  if (finePointer) {
    $$('.spot').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Projects: category tabs + skill filter ---------- */
  const projects = $$('#project-grid .project');
  const realProjects = projects.filter(p => !p.classList.contains('project-more'));
  const moreCard = $('.project-more');
  const tabs = $$('.tab');
  const emptyMsg = $('#projects-empty');
  const filterNote = $('#filter-note');
  const filterSkill = $('#filter-skill');
  const skillTags = $$('button.tag[data-skill]');
  let state = { cat: 'all', skill: null, skillLabel: '' };

  tabs.forEach(tab => {
    const f = tab.dataset.filter;
    const n = f === 'all' ? realProjects.length : realProjects.filter(p => p.dataset.cat.split(' ').includes(f)).length;
    $('.count', tab).textContent = n;
  });

  function applyFilter() {
    let shown = 0;
    realProjects.forEach(p => {
      const catOk = state.cat === 'all' || p.dataset.cat.split(' ').includes(state.cat);
      const skillOk = !state.skill || p.dataset.tech.split(' ').includes(state.skill);
      const show = catOk && skillOk;
      p.classList.toggle('is-hidden', !show);
      if (show) shown++;
    });
    moreCard.classList.toggle('is-hidden', !!state.skill);
    emptyMsg.classList.toggle('is-visible', shown === 0);
    tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.filter === state.cat)));
    filterNote.classList.toggle('is-visible', !!state.skill);
    filterSkill.textContent = state.skillLabel;
    skillTags.forEach(t => t.classList.toggle('is-match', t.dataset.skill === state.skill));
  }

  tabs.forEach(tab => tab.addEventListener('click', () => { state.cat = tab.dataset.filter; applyFilter(); }));
  $('#filter-clear').addEventListener('click', () => { state.skill = null; state.skillLabel = ''; applyFilter(); });

  skillTags.forEach(tag => {
    tag.setAttribute('aria-label', `Show projects using ${tag.textContent}`);
    tag.addEventListener('click', () => {
      const same = state.skill === tag.dataset.skill;
      state.skill = same ? null : tag.dataset.skill;
      state.skillLabel = same ? '' : tag.textContent;
      state.cat = 'all';
      applyFilter();
      if (!same) document.getElementById('projects').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Project dialog ---------- */
  const dlg = $('#project-dialog');
  const pdHero = $('#pd-hero');
  let currentIdx = -1;

  function visibleProjects() { return realProjects.filter(p => !p.classList.contains('is-hidden')); }

  function fillDialog(card) {
    const list = visibleProjects();
    currentIdx = list.indexOf(card);
    $('#pd-title').textContent = $('h3', card).textContent;
    const kind = $('.project-kind', card) || $('.badge', card);
    $('#pd-kind').textContent = kind ? kind.textContent : '';
    const tpl = $('template.project-detail', card);
    const text = $('#pd-text');
    text.replaceChildren(tpl ? tpl.content.cloneNode(true) : document.createTextNode(''));
    const tags = $('#pd-tags');
    tags.replaceChildren(...$$('.project-tags .tag', card).map(t => {
      const s = document.createElement('span'); s.className = 'tag'; s.textContent = t.textContent; return s;
    }));
    $('#pd-repo').href = card.dataset.repo;
    pdHero.className = 'dialog-hero ' + (card.classList.contains('grad-violet') ? 'grad-violet'
      : card.classList.contains('grad-sunset') ? 'grad-sunset' : 'plain');
    $('.grad-overlay', pdHero).style.display = pdHero.classList.contains('plain') ? 'none' : '';
    $('#pd-prev').disabled = list.length < 2;
    $('#pd-next').disabled = list.length < 2;
    $('.dialog-card', dlg).scrollTop = 0;
  }

  function openProject(card) {
    fillDialog(card);
    if (!dlg.open) dlg.showModal();
    history.replaceState(null, '', '#project-' + slug($('h3', card).textContent));
  }
  function step(dir) {
    const list = visibleProjects();
    if (!list.length) return;
    fillDialog(list[(currentIdx + dir + list.length) % list.length]);
    history.replaceState(null, '', '#project-' + slug($('#pd-title').textContent));
  }

  realProjects.forEach(card => {
    $('.project-open', card).addEventListener('click', () => openProject(card));
  });
  $('#pd-prev').addEventListener('click', () => step(-1));
  $('#pd-next').addEventListener('click', () => step(1));
  $('[data-close]', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  dlg.addEventListener('close', () => {
    if (location.hash.startsWith('#project-')) history.replaceState(null, '', '#projects');
  });

  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

  // Deep link: /#project-healthcare-ai-chatbot opens that project
  if (location.hash.startsWith('#project-')) {
    const target = realProjects.find(p => '#project-' + slug($('h3', p).textContent) === location.hash);
    if (target) {
      document.getElementById('projects').scrollIntoView();
      setTimeout(() => openProject(target), 300);
    }
  }

  /* ---------- Command palette ---------- */
  const cmdk = $('#cmdk');
  const cmdkInput = $('#cmdk-input');
  const cmdkList = $('#cmdk-list');
  const cmdkEmpty = $('#cmdk-empty');
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $('#cmdk-key').textContent = isMac ? '⌘K' : 'Ctrl K';

  const go = id => () => document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  const download = (href) => () => { const a = document.createElement('a'); a.href = href; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); };
  const openUrl = url => () => window.open(url, '_blank', 'noopener');

  const commands = [
    { group: 'Actions', label: 'Download resume', icon: 'i-download', hint: 'PDF', run: download('AdithyaSuresh_Resume.pdf') },
    { group: 'Actions', label: 'Download cover letter', icon: 'i-file', hint: 'PDF', run: download('AdithyaSuresh_CoverLetter.pdf') },
    { group: 'Actions', label: 'Copy email address', icon: 'i-copy', hint: 'adithyasuresh470@gmail.com', run: () => copyText('adithyasuresh470@gmail.com') },
    { group: 'Actions', label: 'Send an email', icon: 'i-mail', run: () => { location.href = 'mailto:adithyasuresh470@gmail.com'; } },
    { group: 'Links', label: 'LinkedIn', icon: 'i-linkedin', hint: 'Opens in new tab', run: openUrl('https://www.linkedin.com/in/adithya-suresh-044435166/') },
    { group: 'Links', label: 'GitHub', icon: 'i-github', hint: 'Opens in new tab', run: openUrl('https://github.com/adithya280399') },
    ...[['hero', 'Home'], ['about', 'About'], ['experience', 'Experience'], ['skills', 'Skills'], ['projects', 'Projects'],
        ['education', 'Education'], ['certifications', 'Certifications'], ['awards', 'Awards'], ['contact', 'Contact']]
      .map(([id, label]) => ({ group: 'Go to', label, icon: 'i-hash', run: go(id) })),
    ...realProjects.map(card => ({
      group: 'Projects', label: $('h3', card).textContent, icon: 'i-folder',
      keywords: card.dataset.tech,
      run: () => { state = { cat: 'all', skill: null, skillLabel: '' }; applyFilter(); go('projects')(); setTimeout(() => openProject(card), 350); }
    })),
  ];

  let filtered = commands;
  let sel = 0;

  function renderCmdk() {
    const q = cmdkInput.value.trim().toLowerCase();
    filtered = !q ? commands : commands.filter(c =>
      (c.label + ' ' + c.group + ' ' + (c.keywords || '') + ' ' + (c.hint || '')).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(filtered.length - 1, 0));
    cmdkList.replaceChildren();
    let lastGroup = null;
    filtered.forEach((c, i) => {
      if (c.group !== lastGroup) {
        const g = document.createElement('div');
        g.className = 'cmdk-group'; g.textContent = c.group; g.setAttribute('role', 'presentation');
        cmdkList.appendChild(g); lastGroup = c.group;
      }
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cmdk-item'; b.id = 'cmdk-opt-' + i;
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', String(i === sel));
      b.innerHTML = `<svg aria-hidden="true"><use href="#${c.icon}"/></svg><span></span>${c.hint ? '<span class="hint"></span>' : ''}`;
      b.querySelector('span').textContent = c.label;
      if (c.hint) b.querySelector('.hint').textContent = c.hint;
      b.addEventListener('click', () => runCmd(i));
      b.addEventListener('mousemove', () => { if (sel !== i) { sel = i; markSel(); } });
      cmdkList.appendChild(b);
    });
    cmdkEmpty.style.display = filtered.length ? 'none' : 'block';
    markSel();
  }
  function markSel() {
    $$('.cmdk-item', cmdkList).forEach((el, i) => el.setAttribute('aria-selected', String(i === sel)));
    const cur = $('#cmdk-opt-' + sel);
    if (cur) { cur.scrollIntoView({ block: 'nearest' }); cmdkInput.setAttribute('aria-activedescendant', cur.id); }
  }
  function runCmd(i) {
    const c = filtered[i];
    if (!c) return;
    cmdk.close();
    setMenu(false);
    c.run();
  }
  function openCmdk() {
    if (dlg.open) dlg.close();
    cmdkInput.value = ''; sel = 0; renderCmdk();
    cmdk.showModal();
    cmdkInput.focus();
  }

  $('#cmdk-open').addEventListener('click', openCmdk);
  cmdkInput.addEventListener('input', () => { sel = 0; renderCmdk(); });
  cmdkInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(filtered.length, 1); markSel(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % Math.max(filtered.length, 1); markSel(); }
    else if (e.key === 'Enter') { e.preventDefault(); runCmd(sel); }
  });
  cmdk.addEventListener('click', e => { if (e.target === cmdk) cmdk.close(); });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdk.open ? cmdk.close() : openCmdk();
    } else if (e.key === '/' && !cmdk.open && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault(); openCmdk();
    }
  });

  onScroll();
  applyFilter();
})();
