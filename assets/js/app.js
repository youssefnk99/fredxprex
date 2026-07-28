/* ============================================================
   FREDXPREX — Application logic
   Bilingual UI, NB map, rate engine, tracking, modals.
   ============================================================ */
(function () {
  'use strict';

  var D = window.FX_DATA;
  var I = window.FX_I18N;
  var t = I.t;

  /* ---------------------------------------------------------
     Utilities
     --------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(node, evt, fn, opts) { if (node) node.addEventListener(evt, fn, opts); }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(value) {
    return new Intl.NumberFormat(I.locale(), {
      style: 'currency', currency: 'CAD', minimumFractionDigits: 2
    }).format(value);
  }

  function num(value, decimals) {
    return new Intl.NumberFormat(I.locale(), {
      minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0
    }).format(value);
  }

  function dateLong(date) {
    return new Intl.DateTimeFormat(I.locale(), {
      weekday: 'long', day: 'numeric', month: 'long'
    }).format(date);
  }

  function dateTime(date) {
    return new Intl.DateTimeFormat(I.locale(), {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
  }

  function timeOnly(date) {
    return new Intl.DateTimeFormat(I.locale(), {
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
  }

  /** Mon–Sat operating week: skip Sundays. */
  function addBusinessDays(date, days) {
    var d = new Date(date.getTime());
    while (days > 0) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) days--;
    }
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d;
  }

  function atHour(date, hour) {
    var d = new Date(date.getTime());
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  function hoursFromNow(base, hours) {
    return new Date(base.getTime() + hours * 3600000);
  }

  /* Deterministic PRNG so a tracking number always returns the same shipment. */
  function hashString(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var tt = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      tt = (tt + Math.imul(tt ^ (tt >>> 7), 61 | tt)) ^ tt;
      return ((tt ^ (tt >>> 14)) >>> 0) / 4294967296;
    };
  }

  function icon(id, cls) {
    return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  /* French elides "de" before a vowel: de Bathurst, but d'Edmundston. */
  function de(name) {
    return /^[aeiouyàâéèêîïôöûü]/i.test(name) ? 'd’' + name : 'de ' + name;
  }

  /* French typography puts a thin space before a colon. */
  function colon() { return I.lang === 'fr' ? ' : ' : ': '; }

  /* ---------------------------------------------------------
     Toasts
     --------------------------------------------------------- */
  var toastHost = $('#toasts');

  function toast(message, kind) {
    if (!toastHost) return;
    var node = document.createElement('div');
    node.className = 'toast toast--' + (kind || 'ok');
    node.innerHTML = icon(kind === 'err' ? 'i-alert' : 'i-check-circle') + '<span>' + esc(message) + '</span>';
    toastHost.appendChild(node);
    setTimeout(function () {
      node.classList.add('is-out');
      setTimeout(function () { node.remove(); }, 260);
    }, 3600);
  }

  /* ---------------------------------------------------------
     Field validation helpers
     --------------------------------------------------------- */
  function showError(input, messageKey) {
    if (!input) return;
    var id = input.id || input.name;
    var slot = document.querySelector('[data-error-for="' + id + '"]');
    input.setAttribute('aria-invalid', 'true');
    if (slot) {
      slot.textContent = t(messageKey);
      slot.hidden = false;
    }
  }

  function clearError(input) {
    if (!input) return;
    var id = input.id || input.name;
    var slot = document.querySelector('[data-error-for="' + id + '"]');
    input.removeAttribute('aria-invalid');
    if (slot) { slot.hidden = true; slot.textContent = ''; }
  }

  function clearFormErrors(form) {
    $$('[aria-invalid]', form).forEach(function (n) { n.removeAttribute('aria-invalid'); });
    $$('.field__error', form).forEach(function (n) { n.hidden = true; n.textContent = ''; });
  }

  function isEmail(value) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(value).trim()); }
  function isPhone(value) { return String(value).replace(/[^\d]/g, '').length >= 10; }

  /* Validate a required text input. Returns true when valid. */
  function requireText(input, minLen) {
    var value = String(input.value || '').trim();
    if (value.length < (minLen || 1)) { showError(input, 'err.required'); return false; }
    clearError(input);
    return true;
  }

  /* ---------------------------------------------------------
     Internationalisation
     --------------------------------------------------------- */
  var LANG_KEY = 'fx-lang';

  function applyLanguage(lang, announce) {
    I.lang = lang;
    document.documentElement.lang = I.lang === 'fr' ? 'fr-CA' : 'en';

    $$('[data-i18n]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    $$('[data-i18n-placeholder]').forEach(function (node) {
      node.setAttribute('placeholder', t(node.getAttribute('data-i18n-placeholder')));
    });
    $$('[data-i18n-aria]').forEach(function (node) {
      node.setAttribute('aria-label', t(node.getAttribute('data-i18n-aria')));
    });

    $$('.langtoggle__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === I.lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { localStorage.setItem(LANG_KEY, I.lang); } catch (e) { /* private mode */ }

    // Re-render anything already on screen in the previous language.
    if (lastQuote) renderQuote(lastQuote);
    if (lastShipment) renderShipment(lastShipment);
    refreshCityHints();
    repaintCounters();
    if (activeHubKey) describeHub(activeHubKey);
    if (announce) toast(t('toast.lang'));
  }

  function initLanguage() {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* ignore */ }
    if (!saved) saved = (navigator.language || 'en').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
    applyLanguage(saved, false);

    $$('.langtoggle__btn').forEach(function (btn) {
      on(btn, 'click', function () {
        var next = btn.getAttribute('data-lang');
        if (next === I.lang) return;
        applyLanguage(next, true);
        closeNav();
      });
    });
  }

  /* ---------------------------------------------------------
     Header, navigation, scroll behaviour
     --------------------------------------------------------- */
  var header = $('#header');
  var nav = $('#primary-nav');
  var hamburger = $('#hamburger');
  var scrim = $('#nav-scrim');
  var toTop = $('#totop');

  function openNav() {
    nav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    scrim.hidden = false;
    document.body.classList.add('is-locked');
  }

  function closeNav() {
    if (!nav || !nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    scrim.hidden = true;
    document.body.classList.remove('is-locked');
  }

  on(hamburger, 'click', function () {
    if (nav.classList.contains('is-open')) closeNav(); else openNav();
  });
  on(scrim, 'click', closeNav);
  $$('.nav__link').forEach(function (link) { on(link, 'click', closeNav); });

  var sections = ['services', 'coverage', 'rates', 'tracking', 'leadership', 'contact'];

  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (toTop) toTop.hidden = y < 600;

    var mark = y + (header ? header.offsetHeight : 70) + 40;
    var current = '';
    for (var i = 0; i < sections.length; i++) {
      var node = document.getElementById(sections[i]);
      if (node && node.offsetTop <= mark) current = sections[i];
    }
    $$('.nav__link').forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
    });
  }

  on(window, 'scroll', onScroll, { passive: true });
  on(toTop, 'click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  on(window, 'resize', function () {
    if (window.innerWidth > 980) closeNav();
  });

  /* ---------------------------------------------------------
     Reveal on scroll + KPI counters
     --------------------------------------------------------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (n, i) {
      n.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(n);
    });
  }

  /* Locale-aware: "98.6%" in English, "98,6 %" in French. */
  function formatCount(node, value) {
    var decimals = parseInt(node.getAttribute('data-decimals') || '0', 10);
    var suffix = node.getAttribute('data-suffix') || '';
    if (suffix === '%' && I.lang === 'fr') suffix = ' %';
    return num(value, decimals) + suffix;
  }

  function repaintCounters() {
    $$('[data-count]').forEach(function (node) {
      if (node.getAttribute('data-counted') === '1') {
        node.textContent = formatCount(node, parseFloat(node.getAttribute('data-count')));
      }
    });
  }

  function animateCount(node) {
    var target = parseFloat(node.getAttribute('data-count'));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function settle() {
      node.setAttribute('data-counted', '1');
      node.textContent = formatCount(node, target);
    }
    if (reduce) { settle(); return; }

    var start = performance.now();
    var duration = 1400;
    function frame(now) {
      var p = Math.min(1, (now - start) / duration);
      if (p >= 1) { settle(); return; }
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = formatCount(node, target * eased);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var host = $('#kpis');
    if (!host) return;
    if (!('IntersectionObserver' in window)) {
      $$('[data-count]', host).forEach(animateCount);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('[data-count]', entry.target).forEach(animateCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    io.observe(host);
  }

  /* ---------------------------------------------------------
     Hero widget tabs
     --------------------------------------------------------- */
  function initTabs() {
    var tabs = $$('.widget__tab');

    function select(tab) {
      tabs.forEach(function (other) {
        var isTarget = other === tab;
        other.classList.toggle('is-active', isTarget);
        other.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        other.tabIndex = isTarget ? 0 : -1;
        var panel = document.getElementById(other.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !isTarget;
          panel.classList.toggle('is-active', isTarget);
        }
      });
    }

    tabs.forEach(function (tab, index) {
      on(tab, 'click', function () { select(tab); });
      on(tab, 'keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(index + dir + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  }

  /* ---------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------- */
  function initAccordion() {
    $$('#faq .acc__q').forEach(function (btn) {
      on(btn, 'click', function () {
        var item = btn.closest('.acc');
        var open = btn.getAttribute('aria-expanded') === 'true';
        $$('#faq .acc').forEach(function (other) {
          other.classList.remove('is-open');
          $('.acc__q', other).setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Interactive New Brunswick map
     --------------------------------------------------------- */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var activeHubKey = null;

  function makeProjection() {
    var lngMin = -68.75, lngMax = -63.45, latMin = 44.80, latMax = 48.30;
    var latMid = ((latMin + latMax) / 2) * Math.PI / 180;
    var kx = Math.cos(latMid);
    var innerW = 400;
    var scale = innerW / ((lngMax - lngMin) * kx);
    var innerH = (latMax - latMin) * scale;
    var padX = 84, padY = 26;

    return {
      width: innerW + padX * 2,
      height: innerH + padY * 2,
      point: function (lat, lng) {
        return {
          x: padX + (lng - lngMin) * kx * scale,
          y: padY + (latMax - lat) * scale
        };
      }
    };
  }

  function svgEl(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    return node;
  }

  function transitFromHQ(km) {
    if (km < 60) return { en: 'Same-day, under 2 h', fr: 'Jour même, moins de 2 h' };
    if (km < 180) return { en: 'Same-day express lane', fr: 'Trajet express jour même' };
    if (km < 320) return { en: 'Same-day or next morning', fr: 'Jour même ou lendemain matin' };
    return { en: 'Next-day guaranteed', fr: 'Lendemain garanti' };
  }

  function describeHub(key) {
    var caption = $('#map-caption');
    var hub = D.HUBS[key];
    if (!caption || !hub) return;
    var km = D.roadDistance(D.HUBS.bathurst, hub);
    var regionKey = hub.region === 'north' ? 'cov.r1.short' : hub.region === 'central' ? 'cov.r2.short' : 'cov.r3.short';
    var transit = transitFromHQ(km);
    caption.innerHTML =
      '<strong>' + esc(hub.name) + '</strong> — ' + esc(t(regionKey)) +
      '<span class="cap-meta">' + num(km) + ' km ' +
      (I.lang === 'fr' ? 'du siège de Bathurst' : 'from Bathurst HQ') + ' · ' +
      esc(transit[I.lang] || transit.en) + '</span>';
  }

  function buildMap() {
    var svg = $('#nb-map');
    var layer = $('#map-layer');
    if (!svg || !layer) return;

    var proj = makeProjection();
    svg.setAttribute('viewBox', '0 0 ' + proj.width.toFixed(0) + ' ' + proj.height.toFixed(0));
    layer.innerHTML = '';

    // Province outline
    var d = D.NB_OUTLINE.map(function (pair, i) {
      var p = proj.point(pair[1], pair[0]);
      return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
    }).join(' ') + ' Z';
    layer.appendChild(svgEl('path', { d: d, class: 'nb-outline' }));

    // Line-haul lanes (gentle arcs between hubs)
    D.LANES.forEach(function (lane) {
      var a = D.HUBS[lane[0]], b = D.HUBS[lane[1]];
      if (!a || !b) return;
      var p1 = proj.point(a.lat, a.lng);
      var p2 = proj.point(b.lat, b.lng);
      var mx = (p1.x + p2.x) / 2;
      var my = (p1.y + p2.y) / 2;
      var dx = p2.x - p1.x, dy = p2.y - p1.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var bow = Math.min(24, len * 0.13);
      var cx = mx + (-dy / len) * bow;
      var cy = my + (dx / len) * bow;
      layer.appendChild(svgEl('path', {
        d: 'M' + p1.x.toFixed(1) + ' ' + p1.y.toFixed(1) +
           ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1),
        class: 'route-line' + (lane[2] ? ' route-line--live' : '')
      }));
    });

    // Hubs
    D.MAP_HUBS.forEach(function (entry) {
      var key = entry[0];
      var place = D.LABEL_PLACEMENT[entry[1]] || D.LABEL_PLACEMENT.e;
      var hub = D.HUBS[key];
      if (!hub) return;
      var p = proj.point(hub.lat, hub.lng);
      var group = svgEl('g', {
        class: 'hub hub--' + hub.region + (hub.major ? ' hub--major' : ''),
        tabindex: '0', role: 'button',
        'data-hub': key,
        'aria-label': hub.name
      });

      group.appendChild(svgEl('circle', {
        class: 'hub__ring', cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: hub.major ? 9 : 7
      }));
      group.appendChild(svgEl('circle', {
        class: 'hub__dot', cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: hub.major ? 6.5 : 4.5
      }));

      var label = svgEl('text', {
        class: 'hub__label',
        x: (p.x + place.dx).toFixed(1),
        y: (p.y + place.dy).toFixed(1),
        'text-anchor': place.anchor
      });
      label.textContent = hub.name;
      group.appendChild(label);

      function activate() {
        activeHubKey = key;
        $$('.hub', layer).forEach(function (n) { n.classList.remove('is-active'); });
        group.classList.add('is-active');
        describeHub(key);
        $$('.region').forEach(function (card) {
          card.classList.toggle('is-active', card.getAttribute('data-region') === hub.region);
        });
      }

      on(group, 'mouseenter', activate);
      on(group, 'focus', activate);
      on(group, 'click', activate);
      on(group, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });

      layer.appendChild(group);
    });

    // Region cards highlight their hubs
    $$('.region').forEach(function (card) {
      var region = card.getAttribute('data-region');
      function highlight(state) {
        $$('.hub', layer).forEach(function (hubNode) {
          var hub = D.HUBS[hubNode.getAttribute('data-hub')];
          hubNode.classList.toggle('is-active', state && hub && hub.region === region);
        });
      }
      on(card, 'mouseenter', function () { highlight(true); });
      on(card, 'mouseleave', function () { highlight(false); });
    });
  }

  /* ---------------------------------------------------------
     Postal code inputs
     --------------------------------------------------------- */
  var POSTAL_SAMPLES = [
    ['E2A 1Y2', 'bathurst'], ['E3N 1E9', 'campbellton'], ['E1X 1A1', 'tracadie'],
    ['E8S 1M4', 'caraquet'], ['E8Y 1G1', 'shippagan'], ['E3V 3K1', 'edmundston'],
    ['E3B 5A3', 'fredericton'], ['E2V 2N4', 'oromocto'], ['E1N 3A5', 'miramichi'],
    ['E7M 2B5', 'woodstock'], ['E1C 8L3', 'moncton'], ['E1G 1A1', 'dieppe'],
    ['E2K 1E5', 'saintjohn'], ['E4E 1C7', 'sussex'], ['E3L 1X1', 'ststephen'],
    ['E4L 1E2', 'sackville'], ['E2E 2R6', 'rothesay'], ['E7K 1A1', 'grandfalls']
  ];

  function populateDatalist() {
    var list = $('#nb-fsa');
    if (!list) return;
    list.innerHTML = POSTAL_SAMPLES.map(function (row) {
      var hub = D.HUBS[row[1]];
      return '<option value="' + row[0] + '">' + esc(hub ? hub.name : '') + '</option>';
    }).join('');
  }

  function refreshCityHints() {
    $$('[data-city-for]').forEach(function (slot) {
      var input = document.getElementById(slot.getAttribute('data-city-for'));
      if (!input) return;
      updateCityHint(input);
    });
  }

  function updateCityHint(input) {
    var slot = document.querySelector('[data-city-for="' + input.id + '"]');
    if (!slot) return;
    var raw = D.normalizePostal(input.value);
    if (raw.length < 3) { slot.textContent = ''; slot.classList.remove('is-error'); return; }

    if (raw.charAt(0) !== 'E') {
      slot.textContent = t('err.outside');
      slot.classList.add('is-error');
      return;
    }
    var probe = D.lookupPostal(raw.length >= 6 ? raw : raw.slice(0, 3) + '1A1');
    if (probe.ok) {
      var regionKey = probe.hub.region === 'north' ? 'cov.r1.short'
        : probe.hub.region === 'central' ? 'cov.r2.short' : 'cov.r3.short';
      slot.textContent = probe.hub.name + ' · ' + t(regionKey);
      slot.classList.remove('is-error');
    } else {
      slot.textContent = '';
      slot.classList.remove('is-error');
    }
  }

  function initPostalInputs() {
    $$('.input--pc').forEach(function (input) {
      on(input, 'input', function () {
        var caretAtEnd = input.selectionStart === input.value.length;
        var formatted = D.formatPostal(input.value);
        if (formatted !== input.value) {
          input.value = formatted;
          if (caretAtEnd) input.setSelectionRange(formatted.length, formatted.length);
        }
        clearError(input);
        updateCityHint(input);
      });
      on(input, 'blur', function () { updateCityHint(input); });
    });
  }

  /* ---------------------------------------------------------
     Rate engine
     --------------------------------------------------------- */
  var lastQuote = null;

  function serviceLabel(key) { return t('svc.' + key + '.name'); }

  function estimateDelivery(service, distanceKm) {
    var now = new Date();
    var driveHrs = distanceKm / service.speedKmh;

    if (service.key === 'hotshot') {
      return { date: hoursFromNow(now, service.dispatchHrs + driveHrs), precise: true };
    }
    if (service.key === 'sameday') {
      var latest = hoursFromNow(now, service.dispatchHrs + driveHrs);
      if (now.getHours() < service.cutoff && latest.getHours() < 20 && now.getDay() !== 0) {
        return { date: latest, precise: true };
      }
      return { date: atHour(addBusinessDays(now, 1), 18), precise: false };
    }
    if (service.key === 'freight') {
      return { date: atHour(addBusinessDays(now, distanceKm > 260 ? 2 : 1), 17), precise: false };
    }
    return { date: atHour(addBusinessDays(now, 1), 17), precise: false };
  }

  var PENINSULA = ['caraquet', 'shippagan', 'tracadie', 'neguac'];

  /**
   * Build a full quote breakdown.
   * Returns { ok:false, kind } for out-of-area / same-zone / overweight cases.
   */
  function computeQuote(input) {
    var from = D.lookupPostal(input.origin);
    var to = D.lookupPostal(input.dest);

    if (!from.ok || !to.ok) {
      var bad = !from.ok ? from : to;
      return { ok: false, kind: bad.reason === 'outside' ? 'outside' : 'format', which: !from.ok ? 'origin' : 'dest' };
    }
    if (from.key === to.key) return { ok: false, kind: 'same' };

    var service = D.SERVICES[input.service] || D.SERVICES.nextday;
    var weight = Math.max(0.1, parseFloat(input.weight) || 0);
    if (weight > service.maxWeight) return { ok: false, kind: 'weight' };

    var pieces = Math.max(1, Math.min(26, parseInt(input.pieces, 10) || 1));
    var distance = D.roadDistance(from.hub, to.hub);

    var volumetric = 0;
    if (input.length && input.width && input.height) {
      volumetric = (input.length * input.width * input.height / service.dimFactor) * pieces;
    }
    var billable = Math.max(weight, volumetric);

    /* Labels are stored as thunks, not strings: the quote is re-rendered on a
       language switch and t()/num() must resolve against the language in
       effect at render time, not at calculation time. */
    var lines = [];
    var transport = service.base + distance * service.perKm;
    var weightCharge = billable * service.perKg;
    var core = Math.max(service.minCharge, transport + weightCharge);

    function addLine(labelFn, subFn, value) {
      lines.push({ label: labelFn, sub: subFn || null, value: value });
    }

    addLine(
      function () { return t('q.res.transport'); },
      function () { return t('q.res.transportSub', { km: num(distance), service: serviceLabel(service.key) }); },
      transport
    );
    addLine(
      function () { return t('q.res.weightline') + ' — ' + num(billable, 1) + ' kg'; },
      volumetric > 0
        ? function () { return t('q.res.weightSub', { actual: num(weight, 1), vol: num(volumetric, 1) }); }
        : null,
      weightCharge
    );

    var extras = 0;
    if (pieces > 1) {
      var extraPieces = (pieces - 1) * D.FEES.extraPiece;
      extras += extraPieces;
      addLine(function () { return t('q.res.extrapiece', { n: pieces - 1 }); }, null, extraPieces);
    }
    [['residential', 'q.res.residential'], ['liftgate', 'q.res.liftgate'],
     ['signature', 'q.res.signature'], ['insurance', 'q.res.insurance']].forEach(function (pair) {
      if (!input[pair[0]]) return;
      var fee = D.FEES[pair[0]];
      extras += fee;
      addLine(function () { return t(pair[1]); }, null, fee);
    });

    var onPeninsula = PENINSULA.indexOf(from.key) > -1 || PENINSULA.indexOf(to.key) > -1;
    var isRural = D.RURAL_HUBS.indexOf(from.key) > -1 || D.RURAL_HUBS.indexOf(to.key) > -1;
    if (onPeninsula) {
      extras += D.FEES.peninsulaLane;
      addLine(function () { return t('q.res.peninsula'); }, null, D.FEES.peninsulaLane);
    } else if (isRural) {
      extras += D.FEES.rural;
      addLine(function () { return t('q.res.rural'); }, null, D.FEES.rural);
    }

    var beforeFuel = core + extras;
    var fuel = beforeFuel * D.FEES.fuelPct;
    var subtotal = beforeFuel + fuel;
    var hst = subtotal * D.FEES.hstPct;
    var total = subtotal + hst;

    return {
      ok: true,
      from: from, to: to,
      service: service,
      distance: distance,
      weight: weight,
      volumetric: volumetric,
      billable: billable,
      pieces: pieces,
      lines: lines,
      minApplied: core > transport + weightCharge,
      fuel: fuel,
      subtotal: subtotal,
      hst: hst,
      total: total,
      eta: estimateDelivery(service, distance),
      reference: 'FXQ-' + Math.floor(100000 + Math.random() * 899999)
    };
  }

  function renderNotice(kind) {
    var host = $('#rate-output');
    var empty = $('#rate-empty');
    if (!host) return;
    empty.hidden = true;
    host.hidden = false;
    host.innerHTML =
      '<div class="notice">' + icon('i-alert') +
      '<div><h4>' + esc(t('notice.' + kind + '.t')) + '</h4>' +
      '<p>' + esc(t('notice.' + kind + '.d')) + '</p></div></div>';
  }

  function renderQuote(quote) {
    var host = $('#rate-output');
    var empty = $('#rate-empty');
    if (!host) return;
    lastQuote = quote;
    empty.hidden = true;
    host.hidden = false;

    var etaText = quote.eta.precise
      ? dateLong(quote.eta.date) + ', ' + timeOnly(quote.eta.date)
      : dateLong(quote.eta.date) + ' — ' + (I.lang === 'fr' ? 'avant ' : 'by ') + timeOnly(quote.eta.date);

    var linesHtml = quote.lines.map(function (line) {
      return '<div class="qline"><span class="qline__k">' + esc(line.label()) +
        (line.sub ? '<small>' + esc(line.sub()) + '</small>' : '') +
        '</span><span class="qline__v">' + esc(money(line.value)) + '</span></div>';
    }).join('');

    host.innerHTML =
      '<div class="quote">' +
        '<span class="quote__badge">' + icon('i-shield') + esc(t('q.res.badge')) + '</span>' +
        '<div class="quote__route">' +
          '<div><div class="quote__city">' + esc(quote.from.hub.name) + '</div>' +
              '<div class="quote__pc">' + esc(quote.from.postal) + '</div></div>' +
          '<div><div class="quote__arrow">' + icon('i-arrow-right') + '</div>' +
              '<div class="quote__dist">' + esc(t('q.res.distance', { km: num(quote.distance) })) + '</div></div>' +
          '<div class="quote__right"><div class="quote__city">' + esc(quote.to.hub.name) + '</div>' +
              '<div class="quote__pc">' + esc(quote.to.postal) + '</div></div>' +
        '</div>' +
        '<div class="quote__lines">' + linesHtml +
          '<div class="qline qline--sub qline--muted"><span class="qline__k">' + esc(t('q.res.fuel')) + '</span>' +
            '<span class="qline__v">' + esc(money(quote.fuel)) + '</span></div>' +
          '<div class="qline"><span class="qline__k">' + esc(t('q.res.subtotal')) + '</span>' +
            '<span class="qline__v">' + esc(money(quote.subtotal)) + '</span></div>' +
          '<div class="qline qline--muted"><span class="qline__k">' + esc(t('q.res.hst')) + '</span>' +
            '<span class="qline__v">' + esc(money(quote.hst)) + '</span></div>' +
        '</div>' +
        '<div class="quote__total"><span class="quote__total-k">' + esc(t('q.res.total')) + '</span>' +
          '<span class="quote__total-v">' + esc(money(quote.total)) + '</span></div>' +
        '<div class="quote__eta">' + icon('i-clock') +
          '<span>' + esc(t('q.res.eta') + colon()) + '<strong>' + esc(etaText) + '</strong></span></div>' +
        '<div class="quote__actions">' +
          '<button class="btn btn--accent btn--block" type="button" data-quote-book>' +
            icon('i-package') + '<span>' + esc(t('q.res.book')) + '</span></button>' +
          '<button class="btn btn--outline-light btn--block" type="button" data-quote-save>' +
            icon('i-mail') + '<span>' + esc(t('q.res.email')) + '</span></button>' +
        '</div>' +
        '<p class="quote__fine">' + esc(t('q.res.fine')) + '</p>' +
      '</div>';

    on($('[data-quote-book]', host), 'click', function () { openModal('ship', { quote: quote }); });
    on($('[data-quote-save]', host), 'click', function () {
      openModal('quotesaved', { quote: quote });
    });
  }

  function readRateForm(form) {
    var checked = $('input[name="service"]:checked', form);
    return {
      origin: $('#rc-origin', form).value,
      dest: $('#rc-dest', form).value,
      weight: $('#rc-weight', form).value,
      pieces: $('#rc-pieces', form).value,
      length: parseFloat($('#rc-l', form).value) || 0,
      width: parseFloat($('#rc-w', form).value) || 0,
      height: parseFloat($('#rc-h', form).value) || 0,
      service: checked ? checked.value : 'nextday',
      residential: $('input[name="residential"]', form).checked,
      liftgate: $('input[name="liftgate"]', form).checked,
      signature: $('input[name="signature"]', form).checked,
      insurance: $('input[name="insurance"]', form).checked
    };
  }

  function validateQuoteFields(originInput, destInput, weightInput) {
    var valid = true;

    [originInput, destInput].forEach(function (input) {
      var probe = D.lookupPostal(input.value);
      if (!probe.ok) {
        showError(input, probe.reason === 'outside' ? 'err.outside' : probe.reason === 'empty' ? 'err.required' : 'err.postal');
        valid = false;
      } else {
        clearError(input);
      }
    });

    var weight = parseFloat(weightInput.value);
    if (!(weight > 0) || weight > 8000) {
      showError(weightInput, 'err.weight');
      valid = false;
    } else {
      clearError(weightInput);
    }
    return valid;
  }

  function initRateForm() {
    var form = $('#rate-form');
    if (!form) return;

    on(form, 'submit', function (e) {
      e.preventDefault();
      var originInput = $('#rc-origin', form);
      var destInput = $('#rc-dest', form);
      var weightInput = $('#rc-weight', form);
      var piecesInput = $('#rc-pieces', form);

      var valid = validateQuoteFields(originInput, destInput, weightInput);

      var pieces = parseInt(piecesInput.value, 10);
      if (!(pieces >= 1 && pieces <= 26)) { showError(piecesInput, 'err.pieces'); valid = false; }
      else clearError(piecesInput);

      if (!valid) { toast(t('toast.formerr'), 'err'); return; }

      var result = computeQuote(readRateForm(form));
      if (!result.ok) {
        renderNotice(result.kind === 'format' ? 'outside' : result.kind);
        return;
      }
      renderQuote(result);
      toast(t('toast.quotesent'));
      if (window.innerWidth <= 980) {
        $('#rate-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    on(form, 'reset', function () {
      setTimeout(function () {
        clearFormErrors(form);
        refreshCityHints();
        lastQuote = null;
        $('#rate-output').hidden = true;
        $('#rate-output').innerHTML = '';
        $('#rate-empty').hidden = false;
      }, 0);
    });

    // Quick-quote widget in the hero
    var quick = $('#quick-quote-form');
    on(quick, 'submit', function (e) {
      e.preventDefault();
      var originInput = $('#qq-origin', quick);
      var destInput = $('#qq-dest', quick);
      var weightInput = $('#qq-weight', quick);
      if (!validateQuoteFields(originInput, destInput, weightInput)) {
        toast(t('toast.formerr'), 'err');
        return;
      }

      // Mirror the values into the full estimator, then run it there.
      $('#rc-origin').value = D.formatPostal(originInput.value);
      $('#rc-dest').value = D.formatPostal(destInput.value);
      $('#rc-weight').value = weightInput.value;
      var svcValue = $('#qq-service', quick).value;
      var radio = $('input[name="service"][value="' + svcValue + '"]', form);
      if (radio) radio.checked = true;
      refreshCityHints();

      var result = computeQuote({
        origin: originInput.value, dest: destInput.value, weight: weightInput.value,
        pieces: 1, service: svcValue, signature: true
      });
      if (!result.ok) { renderNotice(result.kind === 'format' ? 'outside' : result.kind); }
      else { renderQuote(result); }

      $('#rates').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // "Quote this service" buttons on the service cards
    $$('[data-quote-service]').forEach(function (btn) {
      on(btn, 'click', function () {
        var key = btn.getAttribute('data-quote-service');
        var radio = $('input[name="service"][value="' + key + '"]', form);
        if (radio) radio.checked = true;
        $('#rates').scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () { $('#rc-origin').focus({ preventScroll: true }); }, 550);
      });
    });
  }

  /* ---------------------------------------------------------
     Tracking engine
     --------------------------------------------------------- */
  var lastShipment = null;
  var TRACK_HUBS = ['bathurst', 'campbellton', 'caraquet', 'tracadie', 'edmundston',
    'miramichi', 'fredericton', 'woodstock', 'moncton', 'saintjohn', 'sussex', 'ststephen'];
  var SIGNERS = ['L. Doucet', 'M. Chiasson', 'R. LeBlanc', 'J. Savoie', 'C. Roy',
    'P. Gauvin', 'S. Thériault', 'K. Landry', 'D. Comeau', 'A. Boudreau'];

  function normalizeTracking(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function prettyTracking(raw) {
    if (/^FX\d{8}CA$/.test(raw)) {
      return 'FX ' + raw.slice(2, 6) + ' ' + raw.slice(6, 10) + ' CA';
    }
    return raw;
  }

  function buildShipment(rawInput) {
    var raw = normalizeTracking(rawInput);
    var rnd = mulberry32(hashString(raw));

    var fromIdx = Math.floor(rnd() * TRACK_HUBS.length);
    var toIdx = Math.floor(rnd() * TRACK_HUBS.length);
    if (toIdx === fromIdx) toIdx = (toIdx + 1 + Math.floor(rnd() * 3)) % TRACK_HUBS.length;
    var from = D.HUBS[TRACK_HUBS[fromIdx]];
    var to = D.HUBS[TRACK_HUBS[toIdx]];

    var serviceKeys = ['sameday', 'nextday', 'nextday', 'freight', 'hotshot'];
    var serviceKey = serviceKeys[Math.floor(rnd() * serviceKeys.length)];

    var roll = rnd();
    var stage = roll < 0.42 ? 4 : roll < 0.62 ? 3 : roll < 0.88 ? 2 : 1;

    var pieces = 1 + Math.floor(rnd() * 4);
    var weight = serviceKey === 'freight'
      ? Math.round((60 + rnd() * 420) * 10) / 10
      : Math.round((0.4 + rnd() * 26) * 10) / 10;

    var relayKey = from.region === to.region ? TRACK_HUBS[fromIdx]
      : (from.region === 'north' || to.region === 'north') ? 'miramichi' : 'moncton';
    var relay = D.HUBS[relayKey];

    var now = new Date();
    var events = [];
    var deliveredAt = null;
    var anchor;

    var unit = 'NB-' + (100 + Math.floor(rnd() * 180));
    var signer = SIGNERS[Math.floor(rnd() * SIGNERS.length)];

    /* `phase` maps an event onto one of the four progress steps
       (0 = pre-pickup, so it gets no stamp on the bar). Keys are stored
       untranslated so the card can re-render in the other language. */
    function push(labelKey, phase, date, vars, noteKey, noteVars) {
      events.push({
        labelKey: labelKey, labelVars: vars || null,
        noteKey: noteKey || null, noteVars: noteVars || null,
        phase: phase,
        date: date
      });
    }

    if (stage === 4) {
      deliveredAt = hoursFromNow(now, -(2 + rnd() * 30));
      anchor = deliveredAt;
      push('trk.e.created', 0, hoursFromNow(anchor, -22));
      push('trk.e.picked', 1, hoursFromNow(anchor, -20), null, 'trk.e.note.driver', { unit: unit });
      push('trk.e.arrived', 2, hoursFromNow(anchor, -12), { hub: relay.name, hubDe: de(relay.name) }, 'trk.e.note.sorted', { city: to.name, cityDe: de(to.name) });
      push('trk.e.departed', 2, hoursFromNow(anchor, -9), { hub: relay.name, hubDe: de(relay.name) });
      push('trk.e.out', 3, hoursFromNow(anchor, -3.5));
      push('trk.e.delivered', 4, anchor, null, 'trk.e.note.pod', { name: signer });
    } else if (stage === 3) {
      anchor = hoursFromNow(now, -(0.5 + rnd() * 3.5));
      push('trk.e.created', 0, hoursFromNow(anchor, -19));
      push('trk.e.picked', 1, hoursFromNow(anchor, -17), null, 'trk.e.note.driver', { unit: unit });
      push('trk.e.arrived', 2, hoursFromNow(anchor, -8), { hub: relay.name, hubDe: de(relay.name) }, 'trk.e.note.sorted', { city: to.name, cityDe: de(to.name) });
      push('trk.e.departed', 2, hoursFromNow(anchor, -5), { hub: relay.name, hubDe: de(relay.name) });
      push('trk.e.out', 3, anchor);
    } else if (stage === 2) {
      anchor = hoursFromNow(now, -(1 + rnd() * 5));
      push('trk.e.created', 0, hoursFromNow(anchor, -9));
      push('trk.e.picked', 1, hoursFromNow(anchor, -7), null, 'trk.e.note.driver', { unit: unit });
      push('trk.e.arrived', 2, anchor, { hub: relay.name, hubDe: de(relay.name) }, 'trk.e.note.sorted', { city: to.name, cityDe: de(to.name) });
      push('trk.e.linehaul', 2, hoursFromNow(anchor, 0.4));
    } else {
      anchor = hoursFromNow(now, -(0.4 + rnd() * 2.5));
      push('trk.e.created', 0, hoursFromNow(anchor, -1.6));
      push('trk.e.picked', 1, anchor, null, 'trk.e.note.driver', { unit: unit });
    }

    var eta = deliveredAt || estimateDelivery(D.SERVICES[serviceKey], D.roadDistance(from, to)).date;
    if (!deliveredAt && stage === 3) eta = hoursFromNow(now, 1 + rnd() * 4);

    return {
      raw: raw,
      display: prettyTracking(raw),
      from: from, to: to, relay: relay,
      serviceKey: serviceKey,
      stage: stage,
      pieces: pieces,
      weight: weight,
      events: events,
      deliveredAt: deliveredAt,
      eta: eta,
      signer: signer
    };
  }

  var STATUS_META = {
    1: { key: 'trk.st.picked', cls: 'picked', icon: 'i-package' },
    2: { key: 'trk.st.transit', cls: 'transit', icon: 'i-truck' },
    3: { key: 'trk.st.out', cls: 'out', icon: 'i-route' },
    4: { key: 'trk.st.delivered', cls: 'delivered', icon: 'i-check-circle' }
  };

  function renderShipment(shipment) {
    var host = $('#track-result');
    if (!host) return;
    lastShipment = shipment;

    var status = STATUS_META[shipment.stage];
    var fill = ((shipment.stage - 1) / 3) * 75;

    var steps = ['trk.p1', 'trk.p2', 'trk.p3', 'trk.p4'].map(function (key, i) {
      var index = i + 1;
      var state = index < shipment.stage ? 'is-done' : index === shipment.stage ? 'is-current' : '';
      // Stamp each step with the most recent scan that belongs to it.
      var match = shipment.events.filter(function (evt) { return evt.phase === index; }).pop();
      var stamp = match ? timeOnly(match.date) : '';
      var done = index < shipment.stage || shipment.stage === 4;
      return '<div class="pstep ' + state + '">' +
        '<div class="pstep__dot">' + icon(done ? 'i-check' : 'i-package') + '</div>' +
        '<div class="pstep__label">' + esc(t(key)) + '</div>' +
        '<div class="pstep__time">' + esc(stamp) + '</div></div>';
    }).join('');

    var history = shipment.events.slice().reverse().map(function (evt, i) {
      return '<li class="tl ' + (i === 0 ? 'tl--latest' : '') + '">' +
        '<span class="tl__dot"></span>' +
        '<div class="tl__title">' + esc(t(evt.labelKey, evt.labelVars)) + '</div>' +
        '<div class="tl__meta"><span>' + esc(dateTime(evt.date)) + '</span></div>' +
        (evt.noteKey ? '<div class="tl__note">' + esc(t(evt.noteKey, evt.noteVars)) + '</div>' : '') +
        '</li>';
    }).join('');

    var etaLabel = shipment.deliveredAt ? t('trk.m.delivered') : t('trk.m.eta');
    var etaValue = shipment.deliveredAt
      ? dateLong(shipment.deliveredAt) + ', ' + timeOnly(shipment.deliveredAt)
      : dateLong(shipment.eta) + ', ' + timeOnly(shipment.eta);

    host.innerHTML =
      '<article class="shipment">' +
        '<header class="shipment__head">' +
          '<div><div class="shipment__num">' + esc(shipment.display) + '</div>' +
            '<div class="shipment__sub">' + esc(t('trk.waybill')) + ' · ' + esc(serviceLabel(shipment.serviceKey)) + '</div></div>' +
          '<span class="statuspill statuspill--' + status.cls + '">' + icon(status.icon) + esc(t(status.key)) + '</span>' +
        '</header>' +
        '<div class="progress"><div class="progress__track">' +
          '<div class="progress__fill" style="width:' + fill.toFixed(1) + '%"></div>' + steps +
        '</div></div>' +
        '<div class="shipment__grid">' +
          '<div class="meta"><div class="meta__k">' + esc(t('trk.m.from')) + '</div>' +
            '<div class="meta__v">' + esc(shipment.from.name) + '<small>' + esc(t('cov.r' + (shipment.from.region === 'north' ? 1 : shipment.from.region === 'central' ? 2 : 3) + '.short')) + '</small></div></div>' +
          '<div class="meta"><div class="meta__k">' + esc(t('trk.m.to')) + '</div>' +
            '<div class="meta__v">' + esc(shipment.to.name) + '<small>' + esc(t('cov.r' + (shipment.to.region === 'north' ? 1 : shipment.to.region === 'central' ? 2 : 3) + '.short')) + '</small></div></div>' +
          '<div class="meta"><div class="meta__k">' + esc(t('trk.m.weight')) + '</div>' +
            '<div class="meta__v">' + esc(num(shipment.weight, 1)) + ' kg<small>' + shipment.pieces + ' ' + esc(t('trk.m.pieces')) + '</small></div></div>' +
          '<div class="meta"><div class="meta__k">' + esc(etaLabel) + '</div>' +
            '<div class="meta__v">' + esc(etaValue) +
              (shipment.deliveredAt ? '<small>' + esc(t('trk.m.signedby')) + ' ' + esc(shipment.signer) + '</small>' : '') +
            '</div></div>' +
        '</div>' +
        '<div class="shipment__body"><h4>' + esc(t('trk.history')) + '</h4>' +
          '<ol class="timeline">' + history + '</ol></div>' +
        '<footer class="shipment__foot">' +
          '<p>' + esc(t('trk.foot')) + '</p>' +
          '<div style="display:flex;gap:.5rem;flex-wrap:wrap">' +
            '<button class="btn btn--ghost" type="button" data-track-print>' + icon('i-file') + '<span>' + esc(t('trk.print')) + '</span></button>' +
            '<button class="btn btn--ghost" type="button" data-track-again>' + icon('i-search') + '<span>' + esc(t('trk.newsearch')) + '</span></button>' +
          '</div>' +
        '</footer>' +
      '</article>';

    on($('[data-track-print]', host), 'click', function () { window.print(); });
    on($('[data-track-again]', host), 'click', function () {
      var input = $('#tk-number');
      input.value = '';
      input.focus();
      host.innerHTML = '';
      lastShipment = null;
    });

    // Animate the progress bar in after paint.
    var bar = $('.progress__fill', host);
    if (bar) {
      var target = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bar.style.width = target; });
      });
    }
  }

  function renderNotFound(value) {
    var host = $('#track-result');
    if (!host) return;
    lastShipment = null;
    host.innerHTML =
      '<div class="panel" style="border-left:4px solid var(--red-600)">' +
        '<div style="display:flex;gap:.85rem;align-items:flex-start">' +
          icon('i-alert') +
          '<div><h3 style="font-size:1.05rem;margin-bottom:.35rem">' + esc(t('trk.notfound.t')) + '</h3>' +
          '<p style="font-size:.9rem;color:var(--text-muted)">' + esc(t('trk.notfound.d', { n: value })) + '</p></div>' +
        '</div></div>';
  }

  function demoTracking() {
    var digits = String(Math.floor(10000000 + Math.random() * 89999999));
    return 'FX ' + digits.slice(0, 4) + ' ' + digits.slice(4) + ' CA';
  }

  function runTracking(value) {
    var raw = normalizeTracking(value);
    // Deliberately reject a small deterministic slice so "not found" is reachable.
    if (raw.length >= 8 && (hashString(raw) % 17) === 3) { renderNotFound(value); return; }
    renderShipment(buildShipment(raw));
  }

  function initTracking() {
    var mainForm = $('#track-form');
    var quickForm = $('#quick-track-form');

    function handle(input, scroll) {
      var value = String(input.value || '').trim();
      if (normalizeTracking(value).length < 8) {
        showError(input, 'err.tracking');
        toast(t('toast.formerr'), 'err');
        return;
      }
      clearError(input);
      runTracking(value);
      if (scroll) {
        $('#tk-number').value = value;
        $('#tracking').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    on(mainForm, 'submit', function (e) { e.preventDefault(); handle($('#tk-number'), false); });
    on(quickForm, 'submit', function (e) { e.preventDefault(); handle($('#qt-number'), true); });

    [['#qt-sample', '#qt-number'], ['#tk-sample', '#tk-number']].forEach(function (pair) {
      on($(pair[0]), 'click', function () {
        var input = $(pair[1]);
        input.value = demoTracking();
        clearError(input);
        input.focus();
        toast(t('toast.demo'));
      });
    });

    [$('#qt-number'), $('#tk-number')].forEach(function (input) {
      on(input, 'input', function () { clearError(input); });
    });
  }

  /* ---------------------------------------------------------
     Modals
     --------------------------------------------------------- */
  var modal = $('#modal');
  var modalTitle = $('#modal-title');
  var modalBody = $('#modal-body');
  var lastFocused = null;

  function trapFocus(e) {
    if (e.key !== 'Tab' || modal.hidden) return;
    var focusables = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', modal)
      .filter(function (n) { return n.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function showModal(title, html) {
    lastFocused = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    var target = $('input, select, textarea, button', modalBody);
    if (target) setTimeout(function () { target.focus(); }, 60);
  }

  /* Local-date ISO string. toISOString() would shift to UTC and, after
     ~20:00 Atlantic, hand back tomorrow — breaking the date input's min. */
  function todayISO(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + (offsetDays || 0));
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function fieldText(id, labelKey, type, opts) {
    opts = opts || {};
    return '<div class="field">' +
      '<label class="field__label" for="' + id + '">' + esc(t(labelKey)) + '</label>' +
      '<input class="input ' + (opts.cls || '') + '" id="' + id + '" name="' + id + '" type="' + type + '"' +
        (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') +
        (opts.value ? ' value="' + esc(opts.value) + '"' : '') +
        (opts.min ? ' min="' + opts.min + '"' : '') +
        (opts.autocomplete ? ' autocomplete="' + opts.autocomplete + '"' : '') +
        ' />' +
      '<p class="field__error" data-error-for="' + id + '" role="alert" hidden></p>' +
      '</div>';
  }

  function fieldSelect(id, labelKey, options) {
    return '<div class="field">' +
      '<label class="field__label" for="' + id + '">' + esc(t(labelKey)) + '</label>' +
      '<div class="field__control field__control--select">' +
        '<select class="input select" id="' + id + '" name="' + id + '">' +
          options.map(function (opt) {
            return '<option value="' + esc(opt[0]) + '"' + (opt[2] ? ' selected' : '') + '>' + esc(opt[1]) + '</option>';
          }).join('') +
        '</select>' + icon('i-chev-down', 'field__caret') +
      '</div></div>';
  }

  var WINDOWS = [['08-11', '08:00 – 11:00'], ['11-14', '11:00 – 14:00', true], ['14-17', '14:00 – 17:00'], ['17-20', '17:00 – 20:00']];

  function serviceOptions(selected) {
    return ['sameday', 'nextday', 'freight', 'hotshot'].map(function (key) {
      return [key, serviceLabel(key), key === selected];
    });
  }

  function reference(prefix) {
    return prefix + '-' + String(Math.floor(100000 + Math.random() * 899999));
  }

  function successPanel(titleKey, descKey, ref, rows) {
    return '<div class="success">' +
      '<div class="success__icon">' + icon('i-check-circle') + '</div>' +
      '<h3>' + esc(t(titleKey)) + '</h3>' +
      '<p>' + esc(t(descKey)) + '</p>' +
      '<div class="refbox"><span class="refbox__k">' + esc(t('ok.ref')) + '</span>' +
        '<span class="refbox__v">' + esc(ref) + '</span></div>' +
      (rows && rows.length
        ? '<div class="summary">' + rows.map(function (row) {
            return '<div class="summary__row"><span>' + esc(row[0]) + '</span><span>' + esc(row[1]) + '</span></div>';
          }).join('') + '</div>'
        : '') +
      '<div style="display:flex;gap:.6rem;margin-top:1.5rem;flex-wrap:wrap">' +
        '<a class="btn btn--accent" style="flex:1" href="tel:+15067331316">' + icon('i-phone') + '<span>' + esc(t('ok.call')) + '</span></a>' +
        '<button class="btn btn--ghost" style="flex:1" type="button" data-close-modal>' + esc(t('ok.close')) + '</button>' +
      '</div></div>';
  }

  var MODALS = {
    ship: function (opts) {
      var quote = opts && opts.quote;
      var origin = quote ? quote.from.hub.name : '';
      var dest = quote ? quote.to.hub.name : '';
      return {
        title: t('md.ship.title'),
        html: '<p>' + esc(t('md.ship.lede')) + '</p>' +
          '<form class="form" data-modal-form="ship">' +
            '<div class="grid-2">' +
              fieldText('sh-name', 'f.contactname', 'text', { autocomplete: 'name' }) +
              fieldText('sh-phone', 'f.phone', 'tel', { placeholder: '+1 506 000 0000', autocomplete: 'tel' }) +
            '</div>' +
            fieldText('sh-email', 'f.email', 'email', { autocomplete: 'email' }) +
            '<div class="grid-2">' +
              fieldText('sh-origin', 'f.pickupcity', 'text', { value: origin, placeholder: 'Bathurst' }) +
              fieldText('sh-dest', 'f.deliverycity', 'text', { value: dest, placeholder: 'Moncton' }) +
            '</div>' +
            '<div class="grid-2">' +
              fieldSelect('sh-service', 'f.service', serviceOptions(quote ? quote.service.key : 'nextday')) +
              fieldText('sh-weight', 'f.weight', 'number', { value: quote ? String(quote.weight) : '', min: '0.1' }) +
            '</div>' +
            fieldText('sh-goods', 'f.goods', 'text', { placeholder: t('f.goods.ph') }) +
            (quote ? '<div class="summary" style="margin-top:0"><div class="summary__row"><span>' +
              esc(t('sum.total')) + '</span><span>' + esc(money(quote.total)) + '</span></div></div>' : '') +
            '<button class="btn btn--accent btn--lg btn--block" type="submit">' +
              icon('i-package') + '<span>' + esc(t('md.ship.btn')) + '</span></button>' +
          '</form>'
      };
    },

    pickup: function () {
      return {
        title: t('md.pickup.title'),
        html: '<p>' + esc(t('md.pickup.lede')) + '</p>' +
          '<form class="form" data-modal-form="pickup">' +
            '<div class="grid-2">' +
              fieldText('pk-name', 'f.contactname', 'text', { autocomplete: 'name' }) +
              fieldText('pk-phone', 'f.phone', 'tel', { placeholder: '+1 506 000 0000', autocomplete: 'tel' }) +
            '</div>' +
            fieldText('pk-address', 'f.pickupaddr', 'text', { placeholder: '1318 Miramichi Ave, Bathurst', autocomplete: 'street-address' }) +
            '<div class="grid-2">' +
              fieldText('pk-postal', 'f.origin', 'text', { placeholder: 'E2A 1Y2', cls: 'input--pc' }) +
              fieldText('pk-pieces', 'f.pieces', 'number', { value: '1', min: '1' }) +
            '</div>' +
            '<div class="grid-2">' +
              fieldText('pk-date', 'f.date', 'date', { value: todayISO(0), min: todayISO(0) }) +
              fieldSelect('pk-window', 'f.window', WINDOWS) +
            '</div>' +
            '<button class="btn btn--accent btn--lg btn--block" type="submit">' +
              icon('i-calendar') + '<span>' + esc(t('md.pickup.btn')) + '</span></button>' +
          '</form>'
      };
    },

    enterprise: function () {
      return {
        title: t('md.enterprise.title'),
        html: '<p>' + esc(t('md.enterprise.lede')) + '</p>' +
          '<form class="form" data-modal-form="enterprise">' +
            '<div class="grid-2">' +
              fieldText('en-name', 'f.contactname', 'text', { autocomplete: 'name' }) +
              fieldText('en-company', 'f.company', 'text', { autocomplete: 'organization' }) +
            '</div>' +
            '<div class="grid-2">' +
              fieldText('en-email', 'f.email', 'email', { autocomplete: 'email' }) +
              fieldText('en-phone', 'f.phone', 'tel', { placeholder: '+1 506 000 0000', autocomplete: 'tel' }) +
            '</div>' +
            fieldSelect('en-volume', 'f.volume', [
              ['1', t('v.1'), true], ['2', t('v.2')], ['3', t('v.3')], ['4', t('v.4')]
            ]) +
            '<div class="grid-2">' +
              fieldText('en-origin', 'f.pickupcity', 'text', { placeholder: 'Bathurst' }) +
              fieldText('en-dest', 'f.deliverycity', 'text', { placeholder: 'Saint John' }) +
            '</div>' +
            '<button class="btn btn--accent btn--lg btn--block" type="submit">' +
              icon('i-briefcase') + '<span>' + esc(t('md.enterprise.btn')) + '</span></button>' +
          '</form>'
      };
    },

    quotesaved: function (opts) {
      var quote = opts.quote;
      return {
        title: t('md.quote.title'),
        html: successPanel('ok.quote.t', 'ok.quote.d', quote.reference, [
          [t('sum.route'), quote.from.hub.name + ' → ' + quote.to.hub.name],
          [t('sum.service'), serviceLabel(quote.service.key)],
          [t('q.res.weightline'), num(quote.billable, 1) + ' kg'],
          [t('sum.total'), money(quote.total)]
        ])
      };
    },

    legal: function (opts) {
      var key = opts.legal || 'privacy';
      return {
        title: t('legal.' + key + '.title'),
        html: t('legal.' + key + '.body')
      };
    }
  };

  function openModal(name, opts) {
    var builder = MODALS[name];
    if (!builder) return;
    var config = builder(opts || {});
    showModal(config.title, config.html);
    wireModalForm(name);
    $$('.input--pc', modalBody).forEach(function (input) {
      on(input, 'input', function () {
        input.value = D.formatPostal(input.value);
        clearError(input);
      });
    });
  }

  function wireModalForm(name) {
    var form = $('[data-modal-form]', modalBody);
    if (!form) return;

    on(form, 'submit', function (e) {
      e.preventDefault();
      clearFormErrors(form);
      var valid = true;
      var prefix = { ship: 'sh', pickup: 'pk', enterprise: 'en' }[name];

      // Required text fields
      var nameInput = $('#' + prefix + '-name', form);
      if (nameInput && !requireText(nameInput, 2)) valid = false;

      var phoneInput = $('#' + prefix + '-phone', form);
      if (phoneInput && !isPhone(phoneInput.value)) { showError(phoneInput, 'err.phone'); valid = false; }
      else if (phoneInput) clearError(phoneInput);

      var emailInput = $('#' + prefix + '-email', form);
      if (emailInput && !isEmail(emailInput.value)) { showError(emailInput, 'err.email'); valid = false; }
      else if (emailInput) clearError(emailInput);

      if (name === 'ship') {
        ['sh-origin', 'sh-dest'].forEach(function (id) {
          if (!requireText($('#' + id, form), 2)) valid = false;
        });
        var weightInput = $('#sh-weight', form);
        var weight = parseFloat(weightInput.value);
        if (!(weight > 0) || weight > 8000) { showError(weightInput, 'err.weight'); valid = false; }
        else clearError(weightInput);
      }

      if (name === 'pickup') {
        if (!requireText($('#pk-address', form), 4)) valid = false;
        var postalInput = $('#pk-postal', form);
        var probe = D.lookupPostal(postalInput.value);
        if (!probe.ok) {
          showError(postalInput, probe.reason === 'outside' ? 'err.outside' : probe.reason === 'empty' ? 'err.required' : 'err.postal');
          valid = false;
        } else clearError(postalInput);

        var dateInput = $('#pk-date', form);
        if (!dateInput.value || dateInput.value < todayISO(0)) { showError(dateInput, 'err.date'); valid = false; }
        else clearError(dateInput);
      }

      if (name === 'enterprise') {
        if (!requireText($('#en-company', form), 2)) valid = false;
      }

      if (!valid) { toast(t('toast.formerr'), 'err'); return; }

      // Success
      var rows = [];
      var ref;
      if (name === 'ship') {
        ref = reference('FXS');
        rows = [
          [t('sum.route'), $('#sh-origin', form).value + ' → ' + $('#sh-dest', form).value],
          [t('sum.service'), serviceLabel($('#sh-service', form).value)],
          [t('f.weight'), $('#sh-weight', form).value + ' kg'],
          [t('sum.contact'), $('#sh-phone', form).value]
        ];
        modalTitle.textContent = t('ok.booking.t');
        modalBody.innerHTML = successPanel('ok.booking.t', 'ok.booking.d', ref, rows);
      } else if (name === 'pickup') {
        ref = reference('FXP');
        var windowLabel = $('#pk-window', form);
        rows = [
          [t('f.pickupaddr'), $('#pk-address', form).value],
          [t('sum.when'), $('#pk-date', form).value + ' · ' + windowLabel.options[windowLabel.selectedIndex].text],
          [t('f.pieces'), $('#pk-pieces', form).value],
          [t('sum.contact'), $('#pk-phone', form).value]
        ];
        modalTitle.textContent = t('ok.pickup.t');
        modalBody.innerHTML = successPanel('ok.pickup.t', 'ok.pickup.d', ref, rows);
      } else {
        ref = reference('FXE');
        var vol = $('#en-volume', form);
        rows = [
          [t('f.company'), $('#en-company', form).value],
          [t('f.volume'), vol.options[vol.selectedIndex].text],
          [t('sum.route'), ($('#en-origin', form).value || '—') + ' → ' + ($('#en-dest', form).value || '—')],
          [t('sum.contact'), $('#en-phone', form).value]
        ];
        modalTitle.textContent = t('ok.enterprise.t');
        modalBody.innerHTML = successPanel('ok.enterprise.t', 'ok.enterprise.d', ref, rows);
      }

      var closer = $('[data-close-modal]', modalBody);
      if (closer) closer.focus();
    });
  }

  function initModals() {
    $$('[data-open-modal]').forEach(function (btn) {
      on(btn, 'click', function () {
        openModal(btn.getAttribute('data-open-modal'), { legal: btn.getAttribute('data-legal') });
        closeNav();
      });
    });

    on(modal, 'click', function (e) {
      if (e.target.closest('[data-close-modal]')) closeModal();
    });
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); closeNav(); }
      trapFocus(e);
    });
  }

  /* ---------------------------------------------------------
     Hero quick-pickup + contact form
     --------------------------------------------------------- */
  function initQuickPickup() {
    var form = $('#quick-pickup-form');
    if (!form) return;
    var dateInput = $('#qp-date', form);
    dateInput.value = todayISO(0);
    dateInput.min = todayISO(0);

    on(form, 'submit', function (e) {
      e.preventDefault();
      clearFormErrors(form);
      var valid = true;
      if (!requireText($('#qp-address', form), 4)) valid = false;
      if (!dateInput.value || dateInput.value < todayISO(0)) { showError(dateInput, 'err.date'); valid = false; }
      var phoneInput = $('#qp-phone', form);
      if (!isPhone(phoneInput.value)) { showError(phoneInput, 'err.phone'); valid = false; }

      if (!valid) { toast(t('toast.formerr'), 'err'); return; }

      var windowSelect = $('#qp-window', form);
      var ref = reference('FXP');
      showModal(t('ok.pickup.t'), successPanel('ok.pickup.t', 'ok.pickup.d', ref, [
        [t('f.pickupaddr'), $('#qp-address', form).value],
        [t('sum.when'), dateInput.value + ' · ' + windowSelect.options[windowSelect.selectedIndex].text],
        [t('sum.contact'), phoneInput.value]
      ]));
      form.reset();
      dateInput.value = todayISO(0);
    });
  }

  function initContactForm() {
    var form = $('#contact-form');
    if (!form) return;

    on(form, 'submit', function (e) {
      e.preventDefault();
      clearFormErrors(form);
      var valid = true;

      if (!requireText($('#ct-name', form), 2)) valid = false;

      var emailInput = $('#ct-email', form);
      if (!isEmail(emailInput.value)) { showError(emailInput, 'err.email'); valid = false; }

      var phoneInput = $('#ct-phone', form);
      if (!isPhone(phoneInput.value)) { showError(phoneInput, 'err.phone'); valid = false; }

      if (!requireText($('#ct-message', form), 10)) valid = false;

      var consent = $('input[name="consent"]', form);
      if (!consent.checked) { showError(consent, 'err.consent'); valid = false; }
      else clearError(consent);

      if (!valid) { toast(t('toast.formerr'), 'err'); return; }

      var subject = $('#ct-subject', form);
      var region = $('#ct-region', form);
      showModal(t('ok.contact.t'), successPanel('ok.contact.t', 'ok.contact.d', reference('FXC'), [
        [t('f.subject'), subject.options[subject.selectedIndex].text],
        [t('f.region'), region.options[region.selectedIndex].text],
        [t('f.email'), emailInput.value],
        [t('sum.contact'), phoneInput.value]
      ]));
      form.reset();
    });

    $$('input, textarea', form).forEach(function (input) {
      on(input, 'input', function () { clearError(input); });
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function init() {
    var yearNode = $('#year');
    if (yearNode) yearNode.textContent = String(new Date().getFullYear());

    initLanguage();
    initTabs();
    initAccordion();
    populateDatalist();
    initPostalInputs();
    buildMap();
    initRateForm();
    initTracking();
    initQuickPickup();
    initContactForm();
    initModals();
    initReveal();
    initCounters();
    onScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
