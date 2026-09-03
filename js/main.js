/* Kaur Electrical — navigation and light interactions. No dependencies. */
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  var body = document.body;

  /* ---------- Mobile menu ---------- */
  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('.nav-toggle__text').textContent = 'Close';
    body.classList.add('menu-open');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.nav-toggle__text').textContent = 'Menu';
    body.classList.remove('menu-open');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    /* Close if the viewport grows past the mobile breakpoint */
    var mq = window.matchMedia('(min-width: 56.25em)');
    var onChange = function (ev) { if (ev.matches) closeMenu(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------- Current section highlight ---------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]')
  );
  var sections = [];
  links.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el && sections.indexOf(el) === -1) sections.push(el);
  });

  function setCurrent(id) {
    links.forEach(function (link) {
      if (link.getAttribute('href') === '#' + id) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      var best = null;
      var bestRatio = 0;
      sections.forEach(function (s) {
        if (visible[s.id] > bestRatio) { bestRatio = visible[s.id]; best = s.id; }
      });
      if (best) {
        setCurrent(best);
      } else if (window.scrollY < 200) {
        setCurrent('');
      }
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

/* ---------- Scroll motion ---------- */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Stagger: children of [data-stagger] reveal in sequence */
  var groups = document.querySelectorAll('[data-stagger]');
  Array.prototype.forEach.call(groups, function (group) {
    var step = parseInt(group.getAttribute('data-stagger'), 10) || 100;
    var offset = parseInt(group.getAttribute('data-stagger-offset'), 10) || 0;
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', '');
      child.style.setProperty('--d', (offset + i * step) + 'ms');
    });
  });

  var targets = Array.prototype.slice.call(
    document.querySelectorAll('[data-reveal], .trace, [data-count]')
  );

  function show(el) {
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) countUp(el);
  }

  /* Count numbers up from zero when they come into view */
  function countUp(el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    if (isNaN(target) || reduced) return;
    var decimals = (raw.split('.')[1] || '').length;
    var start = null;
    var duration = 1400;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = raw;
    }
    el.textContent = (0).toFixed(decimals);
    requestAnimationFrame(frame);
  }

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Header lifts off the page once scrolled */
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero__media img');
  var desktop = window.matchMedia('(min-width: 56.25em)');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      /* Gentle parallax on the hero photo, desktop only */
      if (hero && desktop.matches && !reduced && y < window.innerHeight * 1.2) {
        hero.style.transform = 'translate3d(0,' + Math.round(Math.min(y * 0.12, window.innerHeight * 0.12)) + 'px,0)';
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
