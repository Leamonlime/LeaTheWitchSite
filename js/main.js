/* ============================================================
   LEA THE WITCH — main.js — V3
   Slow. Deliberate. Nothing draws attention to itself.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- navigation ---------- */

  var nav = document.getElementById('siteNav');
  if (nav) {
    var onNavScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  var toggle = document.getElementById('navToggle');
  var drawer = document.getElementById('navDrawer');
  if (toggle && drawer) {
    var setDrawer = function (open) {
      drawer.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('drawer-locked', open);
    };
    toggle.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }

  /* ---------- scroll reveal ---------- */

  // stagger children within a group by 120ms
  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    group.querySelectorAll('.reveal').forEach(function (el, i) {
      el.style.setProperty('--d', (i * 0.12) + 's');
    });
  });

  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- cut-out parallax — objects drift at ~0.4x scroll ---------- */

  var cutouts = document.querySelectorAll('.cutout');
  if (cutouts.length && !reduceMotion) {
    var ticking = false;
    var drift = function () {
      ticking = false;
      var vh = window.innerHeight;
      cutouts.forEach(function (el) {
        var host = el.parentElement;
        if (!host) return;
        var rect = host.getBoundingClientRect();
        var offset = rect.top + rect.height / 2 - vh / 2;
        el.style.setProperty('--drift', (offset * -0.12).toFixed(1) + 'px');
      });
    };
    var requestDrift = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(drift);
      }
    };
    window.addEventListener('scroll', requestDrift, { passive: true });
    window.addEventListener('resize', requestDrift, { passive: true });
    drift();
  }

  /* ---------- category filters ---------- */

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
        window.setTimeout(function () { banner.hidden = true; }, 550);
      });
    });
  }

})();
