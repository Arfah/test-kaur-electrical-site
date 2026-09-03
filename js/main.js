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
