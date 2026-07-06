/* ============================================================
   LEA THE WITCH — main.js
   Slow, deliberate, purposeful. Nothing snaps.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- page enter / leave fades ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(function () {
      document.body.classList.add('page-ready');
    });
  });

  // restore opacity when returning via back/forward cache
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.body.classList.remove('page-leaving');
      document.body.classList.add('page-ready');
    }
  });

  document.addEventListener('click', function (e) {
    if (reduceMotion) return;
    var link = e.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || link.target === '_blank') return;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
    if (link.origin && link.origin !== window.location.origin) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    document.body.classList.add('page-leaving');
    window.setTimeout(function () {
      window.location.href = link.href;
    }, 350);
  });

  /* ---------- navigation ---------- */

  var nav = document.getElementById('siteNav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var toggle = document.getElementById('navToggle');
  var drawer = document.getElementById('navDrawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('drawer-locked', open);
    });
  }

  /* ---------- scroll reveal — elements emerge from the dark ---------- */

  var revealables = document.querySelectorAll('[data-reveal]');

  // stagger children of a reveal group by 100ms
  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    var children = group.querySelectorAll('[data-reveal]');
    children.forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', (i * 0.1) + 's');
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-revealed'); });
  }

  /* ---------- hero whisper — words surface one by one ---------- */

  var whisper = document.querySelector('.hero-whisper');
  if (whisper && !whisper.querySelector('.w')) {
    var words = whisper.textContent.trim().split(/\s+/);
    whisper.textContent = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      span.style.setProperty('--w-delay', (0.45 + i * 0.12) + 's');
      whisper.appendChild(span);
      if (i < words.length - 1) whisper.appendChild(document.createTextNode(' '));
    });
    window.setTimeout(function () {
      whisper.classList.add('is-awake');
    }, reduceMotion ? 0 : 150);
  }

  /* ---------- category filters (blog / rituals) ---------- */

  var pills = document.querySelectorAll('.filter-pill');
  if (pills.length) {
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        var filter = pill.getAttribute('data-filter');
        document.querySelectorAll('.grid-card').forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.classList.toggle('is-filtered-out', !match);
        });
      });
    });
  }

  /* ---------- cookie consent ---------- */

  var banner = document.getElementById('cookieBanner');
  if (banner) {
    var stored = null;
    try { stored = window.localStorage.getItem('cookiesAccepted'); } catch (err) { /* private mode */ }
    if (stored === null) {
      banner.hidden = false;
    }
    banner.querySelectorAll('[data-cookie]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var accepted = btn.getAttribute('data-cookie') === 'accept';
        try { window.localStorage.setItem('cookiesAccepted', accepted ? 'true' : 'false'); } catch (err) { /* private mode */ }
        banner.classList.add('is-dismissed');
        window.setTimeout(function () { banner.hidden = true; }, 650);
      });
    });
  }

})();
