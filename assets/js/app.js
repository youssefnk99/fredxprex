/* ============================================================
   FREDXPREX LTD. — interactions + bilingue FR/EN
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Dictionnaire ---------- */
  var T = {
    fr: {
      'skip': 'Aller au contenu principal',
      'nav.about': 'À propos', 'nav.network': 'Notre réseau', 'nav.services': 'Nos services',
      'nav.why': 'Pourquoi nous', 'nav.contact': 'Contact', 'nav.cta': 'Nous joindre',

      'hero.kicker': 'Entreprise canadienne · Nouveau-Brunswick',
      'hero.title': 'Votre partenaire de livraison au Nouveau-Brunswick',
      'hero.cta1': 'Parlons de vos besoins',
      'hero.cta2': 'Découvrir nos services',

      'v.reliability': 'Fiabilité', 'v.performance': 'Performance',
      'v.flexibility': 'Flexibilité', 'v.safety': 'Sécurité',

      'about.eyebrow': 'À propos',
      'about.title': 'Une entreprise canadienne de transport et de logistique',
      'about.p1': "Fredxprex Ltd. est une entreprise canadienne de transport et de logistique spécialisée dans la livraison du dernier kilomètre et la distribution de colis.",
      'about.p2': "Fondée au Nouveau-Brunswick en 2023, notre entreprise s'est développée avec un objectif clair : offrir aux entreprises et aux acteurs du commerce électronique une solution de livraison fiable, flexible et capable de s'adapter rapidement à leurs besoins opérationnels.",
      'about.p3': "Aujourd'hui, Fredxprex dispose d'un réseau opérationnel couvrant plusieurs régions stratégiques du Nouveau-Brunswick.",
      'facts.founded': 'Fondée au Nouveau-Brunswick',
      'facts.markets': 'Marchés desservis',
      'facts.focus': 'Dernier kilomètre',

      'net.eyebrow': 'Notre réseau',
      'net.title': '7 marchés au Nouveau-Brunswick',
      'net.lede': 'Nous opérons actuellement dans les régions de :',
      'net.p1': "Cette présence nous permet de desservir une vaste partie de la province, des principaux centres urbains aux nombreuses communautés environnantes.",
      'net.p2': "Notre réseau nous permet également d'adapter rapidement nos ressources aux besoins de nos partenaires, qu'il s'agisse d'opérations régulières, d'une augmentation saisonnière des volumes ou du déploiement de nouvelles routes.",

      'svc.eyebrow': 'Nos services',
      'svc.title': 'Ce que nous faisons',
      'svc.1.t': 'Livraison du dernier kilomètre',
      'svc.1.d': "Nous assurons la prise en charge et la livraison de colis jusqu'à leur destination finale, auprès des particuliers comme des entreprises.",
      'svc.2.t': 'Livraison résidentielle et commerciale',
      'svc.2.d': 'Nos équipes desservent quotidiennement des adresses résidentielles et commerciales dans plusieurs régions du Nouveau-Brunswick.',
      'svc.3.t': 'Gestion de routes de livraison',
      'svc.3.d': "Fredxprex peut prendre en charge l'organisation et l'exécution de routes de livraison, de la préparation opérationnelle jusqu'au suivi des performances.",
      'svc.4.t': 'Collecte et ramassage',
      'svc.4.d': 'Nous proposons des solutions de collecte adaptées aux besoins des entreprises, commerces et partenaires logistiques.',
      'svc.5.t': 'Solutions de livraison dédiées',
      'svc.5.d': 'Chaque entreprise possède des besoins différents. Nous pouvons mettre en place des équipes et des opérations adaptées aux volumes, aux territoires et aux exigences de nos partenaires.',
      'svc.6.t': 'Capacité flexible',
      'svc.6.d': 'Notre modèle opérationnel nous permet d’ajuster notre capacité en fonction des fluctuations de volume, des périodes de pointe et du développement de nouvelles régions.',

      'why.eyebrow': 'Pourquoi Fredxprex ?',
      'why.title': 'Un partenaire sur lequel vous pouvez compter',
      'why.p1': "Dans le secteur de la livraison, la performance repose sur bien plus que le transport d'un colis.",
      'why.p2': "Elle dépend de la qualité des équipes, de l'organisation des opérations, du respect des procédures, de la sécurité et de la capacité à maintenir un service constant, jour après jour.",
      'why.p3': "C'est pourquoi Fredxprex construit ses opérations autour de quatre engagements fondamentaux :",
      'why.v1': 'Respecter nos engagements et assurer la continuité des opérations.',
      'why.v2': "Maintenir des standards élevés de qualité et d'efficacité.",
      'why.v3': 'Adapter rapidement nos équipes et nos capacités aux besoins de nos partenaires.',
      'why.v4': "Promouvoir des pratiques responsables et sécuritaires dans l'ensemble de nos opérations.",

      'grow.eyebrow': 'Notre développement',
      'grow.title': 'Une entreprise construite pour évoluer',
      'grow.p1': "Depuis sa création, Fredxprex poursuit une stratégie de développement basée sur la proximité avec ses partenaires et l'expansion progressive de son réseau.",
      'grow.p2': "De Fredericton à Edmundston, de Bathurst à Campbellton, en passant par Miramichi, Tracadie et Woodstock, notre croissance reflète notre capacité à développer et gérer des opérations dans différentes régions du Nouveau-Brunswick.",
      'grow.p3': "Notre ambition est de continuer à renforcer notre réseau, développer de nouveaux partenariats et accroître notre capacité afin de devenir un partenaire de référence pour la livraison et la distribution au Nouveau-Brunswick et dans les provinces de l'Atlantique.",

      'mis.eyebrow': 'Notre mission',
      'mis.title': 'Simplifier le dernier kilomètre pour nos partenaires.',
      'mis.p1': "Nous voulons permettre à nos clients de se concentrer sur leur activité pendant que nos équipes prennent en charge l'exécution de leurs opérations de livraison avec professionnalisme, efficacité et constance.",
      'mis.p2': 'Chaque colis compte.',
      'mis.p3': "Chaque livraison représente la réputation de notre partenaire auprès de son client. C'est pourquoi nous traitons chaque opération avec le même objectif :",
      'mis.v1': 'Livrer correctement.', 'mis.v2': 'Livrer efficacement.', 'mis.v3': 'Livrer avec confiance.',

      'cta.title': 'Grandissons ensemble',
      'cta.p1': 'Vous recherchez un partenaire pour développer ou renforcer vos opérations de livraison au Nouveau-Brunswick ?',
      'cta.p2': "Fredxprex possède les équipes, l'expérience opérationnelle et la flexibilité nécessaires pour accompagner votre croissance.",
      'cta.btn': 'Parlons de vos besoins en livraison',

      'ct.eyebrow': 'Contact',
      'ct.title': 'Parlons de vos besoins',
      'ct.lede': 'Contactez directement notre équipe de direction.',
      'ct.general': 'Vous pouvez aussi nous joindre directement',
      'ct.office': 'Siège social',
      'ct.country': 'Nouveau-Brunswick, Canada',
      'ct.map': 'Voir sur la carte',
      'ct.email': 'Courriel',
      'role.assoc': 'Directeur Associé',

      'ft.note': 'Delivering with reliability. Growing with our partners.',
      'ft.nav': 'Navigation', 'ft.contact': 'Nous joindre',
      'ft.rights': 'Tous droits réservés.', 'ft.prov': 'Nouveau-Brunswick, Canada'
    },

    en: {
      'skip': 'Skip to main content',
      'nav.about': 'About', 'nav.network': 'Our network', 'nav.services': 'Our services',
      'nav.why': 'Why us', 'nav.contact': 'Contact', 'nav.cta': 'Get in touch',

      'hero.kicker': 'Canadian company · New Brunswick',
      'hero.title': 'Your delivery partner in New Brunswick',
      'hero.cta1': "Let's talk about your needs",
      'hero.cta2': 'Explore our services',

      'v.reliability': 'Reliability', 'v.performance': 'Performance',
      'v.flexibility': 'Flexibility', 'v.safety': 'Safety',

      'about.eyebrow': 'About',
      'about.title': 'A Canadian transportation and logistics company',
      'about.p1': 'Fredxprex Ltd. is a Canadian transportation and logistics company specialising in last-mile delivery and parcel distribution.',
      'about.p2': 'Founded in New Brunswick in 2023, our company has grown with one clear goal: to give businesses and e-commerce operators a delivery solution that is reliable, flexible and able to adapt quickly to their operational needs.',
      'about.p3': 'Today, Fredxprex operates a network covering several strategic regions of New Brunswick.',
      'facts.founded': 'Founded in New Brunswick',
      'facts.markets': 'Markets served',
      'facts.focus': 'Last-mile focused',

      'net.eyebrow': 'Our network',
      'net.title': '7 markets across New Brunswick',
      'net.lede': 'We currently operate in the regions of:',
      'net.p1': 'This presence lets us serve a large part of the province, from the main urban centres to the many surrounding communities.',
      'net.p2': 'Our network also lets us adapt our resources quickly to our partners’ needs — whether that means regular operations, a seasonal increase in volume, or the launch of new routes.',

      'svc.eyebrow': 'Our services',
      'svc.title': 'What we do',
      'svc.1.t': 'Last-mile delivery',
      'svc.1.d': 'We handle parcels from pickup through to their final destination, for both individuals and businesses.',
      'svc.2.t': 'Residential and commercial delivery',
      'svc.2.d': 'Our teams serve residential and commercial addresses daily across several regions of New Brunswick.',
      'svc.3.t': 'Delivery route management',
      'svc.3.d': 'Fredxprex can take charge of organising and running delivery routes, from operational set-up through to performance monitoring.',
      'svc.4.t': 'Collection and pickup',
      'svc.4.d': 'We offer collection solutions tailored to the needs of businesses, retailers and logistics partners.',
      'svc.5.t': 'Dedicated delivery solutions',
      'svc.5.d': 'Every business has different needs. We can put in place teams and operations matched to our partners’ volumes, territories and requirements.',
      'svc.6.t': 'Flexible capacity',
      'svc.6.d': 'Our operating model lets us adjust capacity to volume fluctuations, peak periods and the development of new regions.',

      'why.eyebrow': 'Why Fredxprex?',
      'why.title': 'A partner you can count on',
      'why.p1': 'In the delivery sector, performance rests on far more than moving a parcel.',
      'why.p2': 'It depends on the quality of the teams, how operations are organised, adherence to procedures, safety, and the ability to keep service consistent day after day.',
      'why.p3': 'That is why Fredxprex builds its operations around four core commitments:',
      'why.v1': 'Honour our commitments and keep operations running.',
      'why.v2': 'Maintain high standards of quality and efficiency.',
      'why.v3': 'Adapt our teams and capacity quickly to our partners’ needs.',
      'why.v4': 'Promote responsible, safe practices across all our operations.',

      'grow.eyebrow': 'Our growth',
      'grow.title': 'A company built to grow',
      'grow.p1': 'Since it was founded, Fredxprex has pursued a growth strategy built on staying close to its partners and expanding its network step by step.',
      'grow.p2': 'From Fredericton to Edmundston, from Bathurst to Campbellton, and through Miramichi, Tracadie and Woodstock, our growth reflects our ability to build and run operations across different regions of New Brunswick.',
      'grow.p3': 'Our ambition is to keep strengthening our network, develop new partnerships and increase our capacity, to become a reference partner for delivery and distribution in New Brunswick and across the Atlantic provinces.',

      'mis.eyebrow': 'Our mission',
      'mis.title': 'Simplify the last mile for our partners.',
      'mis.p1': 'We want our clients to focus on their business while our teams take care of running their delivery operations with professionalism, efficiency and consistency.',
      'mis.p2': 'Every parcel counts.',
      'mis.p3': 'Every delivery carries our partner’s reputation with their own customer. That is why we approach every operation with the same goal:',
      'mis.v1': 'Deliver correctly.', 'mis.v2': 'Deliver efficiently.', 'mis.v3': 'Deliver with confidence.',

      'cta.title': "Let's grow together",
      'cta.p1': 'Looking for a partner to build or strengthen your delivery operations in New Brunswick?',
      'cta.p2': 'Fredxprex has the teams, the operational experience and the flexibility to support your growth.',
      'cta.btn': "Let's talk about your delivery needs",

      'ct.eyebrow': 'Contact',
      'ct.title': "Let's talk about your needs",
      'ct.lede': 'Reach our management team directly.',
      'ct.general': 'You can also reach us directly',
      'ct.office': 'Head office',
      'ct.country': 'New Brunswick, Canada',
      'ct.map': 'View on map',
      'ct.email': 'Email',
      'role.assoc': 'Associate Director',

      'ft.note': 'Delivering with reliability. Growing with our partners.',
      'ft.nav': 'Navigation', 'ft.contact': 'Get in touch',
      'ft.rights': 'All rights reserved.', 'ft.prov': 'New Brunswick, Canada'
    }
  };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function on(n, e, f, o) { if (n) n.addEventListener(e, f, o); }

  /* ---------- Langue ---------- */
  var KEY = 'fx-lang';
  var lang = 'fr';

  function setLang(next, announce) {
    lang = T[next] ? next : 'fr';
    document.documentElement.lang = lang === 'fr' ? 'fr' : 'en';

    $$('[data-i18n]').forEach(function (n) {
      var v = T[lang][n.getAttribute('data-i18n')];
      if (v !== undefined) n.textContent = v;
    });
    $$('.lang button').forEach(function (b) {
      var active = b.getAttribute('data-lang') === lang;
      b.classList.toggle('on', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { localStorage.setItem(KEY, lang); } catch (e) { /* mode privé */ }
    if (announce) closeNav();
  }

  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
    // Français par défaut : l'entreprise et sa clientèle sont francophones.
    if (!saved) saved = /^en/i.test(navigator.language || '') ? 'en' : 'fr';
    setLang(saved, false);
    $$('.lang button').forEach(function (b) {
      on(b, 'click', function () { setLang(b.getAttribute('data-lang'), true); });
    });
  }

  /* ---------- Navigation ---------- */
  var hdr = $('#hdr'), nav = $('#nav'), burger = $('#burger'), scrim = $('#scrim'), toTop = $('#totop');

  function closeNav() {
    if (!nav || !nav.classList.contains('open')) return;
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    scrim.hidden = true;
    document.body.classList.remove('lock');
  }

  on(burger, 'click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    scrim.hidden = !open;
    document.body.classList.toggle('lock', open);
  });
  on(scrim, 'click', closeNav);
  $$('.nav a').forEach(function (a) { on(a, 'click', closeNav); });
  on(document, 'keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  on(window, 'resize', function () { if (window.innerWidth > 1040) closeNav(); });

  /* ---------- Défilement : en-tête, lien actif, bouton haut ---------- */
  var ids = ['apropos', 'reseau', 'services', 'pourquoi', 'contact'];

  function onScroll() {
    var y = window.pageYOffset;
    if (hdr) hdr.classList.toggle('stuck', y > 8);
    if (toTop) toTop.hidden = y < 560;

    var mark = y + (hdr ? hdr.offsetHeight : 76) + 60, cur = '';
    ids.forEach(function (id) {
      var n = document.getElementById(id);
      if (n && n.offsetTop <= mark) cur = id;
    });
    $$('.nav a').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('href') === '#' + cur);
    });
  }
  on(window, 'scroll', onScroll, { passive: true });
  on(toTop, 'click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Apparition au défilement ---------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -50px 0px' });

    items.forEach(function (n) {
      // Décalage en cascade entre voisins d'une même grille
      var sibs = n.parentElement ? Array.prototype.indexOf.call(n.parentElement.children, n) : 0;
      n.style.transitionDelay = (Math.min(sibs, 5) * 80) + 'ms';
      io.observe(n);
    });
  }

  /* ---------- Compteurs ---------- */
  function countUp(node) {
    var target = parseFloat(node.getAttribute('data-count'));
    var isYear = target > 1900;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = String(target); return;
    }
    var from = isYear ? target - 12 : 0;
    var t0 = performance.now(), dur = 1300;
    function frame(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      node.textContent = String(Math.round(from + (target - from) * e));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) { nodes.forEach(countUp); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: .6 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Démarrage ---------- */
  function init() {
    var yr = $('#yr');
    if (yr) yr.textContent = String(new Date().getFullYear());
    initLang();
    initReveal();
    initCounters();
    onScroll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
