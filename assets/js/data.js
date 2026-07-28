/* ============================================================
   FREDXPREX — Static data layer
   New Brunswick geography, postal zones and rate model.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------------------------------------------------------
     Service hubs. Coordinates are real so the map projection
     and the distance-based rate model stay consistent.
     --------------------------------------------------------- */
  var HUBS = {
    bathurst:    { name: 'Bathurst',      lat: 47.6187, lng: -65.6510, region: 'north',   major: true },
    campbellton: { name: 'Campbellton',   lat: 48.0075, lng: -66.6731, region: 'north',   major: true },
    dalhousie:   { name: 'Dalhousie',     lat: 48.0658, lng: -66.3739, region: 'north' },
    tracadie:    { name: 'Tracadie',      lat: 47.5122, lng: -64.9161, region: 'north',   major: true },
    caraquet:    { name: 'Caraquet',      lat: 47.7939, lng: -64.9394, region: 'north',   major: true },
    shippagan:   { name: 'Shippagan',     lat: 47.7439, lng: -64.7086, region: 'north',   major: true },
    edmundston:  { name: 'Edmundston',    lat: 47.3737, lng: -68.3251, region: 'north',   major: true },
    grandfalls:  { name: 'Grand Falls',   lat: 47.0470, lng: -67.7387, region: 'north' },
    miramichi:   { name: 'Miramichi',     lat: 47.0286, lng: -65.5019, region: 'central', major: true },
    neguac:      { name: 'Neguac',        lat: 47.2419, lng: -65.0625, region: 'central' },
    fredericton: { name: 'Fredericton',   lat: 45.9636, lng: -66.6431, region: 'central', major: true },
    oromocto:    { name: 'Oromocto',      lat: 45.8355, lng: -66.4790, region: 'central', major: true },
    woodstock:   { name: 'Woodstock',     lat: 46.1526, lng: -67.5734, region: 'central', major: true },
    perth:       { name: 'Perth-Andover', lat: 46.7440, lng: -67.7060, region: 'central' },
    moncton:     { name: 'Moncton',       lat: 46.0878, lng: -64.7782, region: 'south',   major: true },
    dieppe:      { name: 'Dieppe',        lat: 46.0989, lng: -64.6873, region: 'south' },
    riverview:   { name: 'Riverview',     lat: 46.0614, lng: -64.8052, region: 'south' },
    shediac:     { name: 'Shediac',       lat: 46.2192, lng: -64.5406, region: 'south' },
    bouctouche:  { name: 'Bouctouche',    lat: 46.4700, lng: -64.7400, region: 'south' },
    sackville:   { name: 'Sackville',     lat: 45.8975, lng: -64.3689, region: 'south' },
    sussex:      { name: 'Sussex',        lat: 45.7222, lng: -65.5069, region: 'south',   major: true },
    saintjohn:   { name: 'Saint John',    lat: 45.2733, lng: -66.0633, region: 'south',   major: true },
    rothesay:    { name: 'Rothesay',      lat: 45.3866, lng: -65.9986, region: 'south' },
    quispamsis:  { name: 'Quispamsis',    lat: 45.4324, lng: -65.9455, region: 'south' },
    hampton:     { name: 'Hampton',       lat: 45.5286, lng: -65.8500, region: 'south' },
    ststephen:   { name: 'St. Stephen',   lat: 45.1936, lng: -67.2757, region: 'south',   major: true },
    standrews:   { name: 'St. Andrews',   lat: 45.0733, lng: -67.0533, region: 'south' }
  };

  /* Hubs plotted on the interactive map, with a hand-placed label side.
     Placement is explicit rather than automatic because the north-east
     (Acadian Peninsula) and south-east (Moncton) clusters collide otherwise. */
  var MAP_HUBS = [
    ['campbellton', 'w'],  ['dalhousie', 'ne'],  ['bathurst', 'w'],
    ['caraquet', 'n'],     ['shippagan', 'se'],  ['tracadie', 'se'],
    ['edmundston', 'e'],   ['grandfalls', 'e'],  ['miramichi', 'e'],
    ['woodstock', 'w'],    ['fredericton', 'sw'], ['oromocto', 'e'],
    ['moncton', 'w'],      ['shediac', 'ne'],    ['sackville', 'se'],
    ['sussex', 'e'],       ['saintjohn', 'e'],   ['ststephen', 'w']
  ];

  /* Label offset + text anchor for each placement. */
  var LABEL_PLACEMENT = {
    e:  { dx: 11,  dy: 4.5,  anchor: 'start' },
    w:  { dx: -11, dy: 4.5,  anchor: 'end' },
    n:  { dx: 0,   dy: -11,  anchor: 'middle' },
    s:  { dx: 0,   dy: 18,   anchor: 'middle' },
    ne: { dx: 9,   dy: -8,   anchor: 'start' },
    nw: { dx: -9,  dy: -8,   anchor: 'end' },
    se: { dx: 9,   dy: 15,   anchor: 'start' },
    sw: { dx: -9,  dy: 15,   anchor: 'end' }
  };

  /* Line-haul lanes drawn between hubs on the map */
  var LANES = [
    ['campbellton', 'bathurst', true],
    ['bathurst', 'caraquet', false],
    ['caraquet', 'shippagan', false],
    ['shippagan', 'tracadie', false],
    ['tracadie', 'miramichi', true],
    ['bathurst', 'miramichi', true],
    ['miramichi', 'moncton', true],
    ['miramichi', 'fredericton', true],
    ['edmundston', 'grandfalls', false],
    ['grandfalls', 'woodstock', false],
    ['woodstock', 'fredericton', true],
    ['fredericton', 'oromocto', false],
    ['fredericton', 'saintjohn', true],
    ['moncton', 'shediac', false],
    ['moncton', 'sackville', false],
    ['moncton', 'sussex', true],
    ['sussex', 'saintjohn', true],
    ['saintjohn', 'ststephen', false]
  ];

  /* Simplified New Brunswick boundary (lng, lat) for the SVG map */
  var NB_OUTLINE = [
    [-68.38, 47.36], [-68.05, 47.44], [-67.78, 47.62], [-67.40, 47.86], [-66.85, 48.05],
    [-66.35, 48.07], [-66.05, 47.98], [-65.85, 47.83], [-65.60, 47.72], [-65.35, 47.75],
    [-65.05, 47.83], [-64.72, 47.81], [-64.65, 47.60], [-64.78, 47.42], [-64.95, 47.22],
    [-65.05, 47.05], [-64.92, 46.90], [-64.80, 46.72], [-64.72, 46.45], [-64.53, 46.22],
    [-64.30, 46.05], [-63.78, 46.14], [-64.12, 45.92], [-64.30, 45.82], [-64.42, 45.72],
    [-64.75, 45.63], [-65.00, 45.58], [-65.35, 45.32], [-65.75, 45.22], [-66.06, 45.24],
    [-66.45, 45.10], [-66.85, 45.02], [-67.10, 45.10], [-67.16, 45.28], [-67.42, 45.58],
    [-67.78, 45.70], [-67.80, 46.20], [-67.79, 47.06], [-68.10, 47.20], [-68.38, 47.36]
  ];

  /* ---------------------------------------------------------
     Forward Sortation Areas. New Brunswick is postal zone "E".
     --------------------------------------------------------- */
  var FSA = {
    E1A: 'moncton',   E1B: 'riverview', E1C: 'moncton',   E1E: 'moncton',   E1G: 'moncton',
    E1H: 'moncton',   E1J: 'moncton',   E1N: 'miramichi', E1V: 'miramichi', E1W: 'miramichi',
    E1X: 'tracadie',
    E2A: 'bathurst',  E2E: 'rothesay',  E2G: 'quispamsis', E2H: 'saintjohn', E2J: 'saintjohn',
    E2K: 'saintjohn', E2L: 'saintjohn', E2M: 'saintjohn', E2N: 'saintjohn', E2P: 'saintjohn',
    E2R: 'saintjohn', E2S: 'quispamsis', E2V: 'oromocto',
    E3A: 'fredericton', E3B: 'fredericton', E3C: 'fredericton', E3E: 'fredericton',
    E3G: 'fredericton', E3L: 'ststephen', E3N: 'campbellton',
    E3V: 'edmundston', E3Y: 'edmundston', E3Z: 'edmundston',
    E4E: 'sussex',    E4G: 'sussex',    E4L: 'sackville', E4M: 'sackville',
    E4P: 'shediac',   E4S: 'bouctouche', E4T: 'bouctouche', E4V: 'bouctouche',
    E4W: 'bouctouche', E4X: 'bouctouche', E4Z: 'shediac',
    E5A: 'standrews', E5B: 'standrews', E5C: 'ststephen', E5E: 'saintjohn',
    E5G: 'standrews', E5H: 'hampton',   E5J: 'hampton',   E5K: 'hampton',
    E5L: 'hampton',   E5M: 'hampton',   E5N: 'hampton',   E5P: 'hampton',
    E5R: 'hampton',   E5S: 'hampton',   E5T: 'sussex',    E5V: 'sussex',
    E6B: 'fredericton', E6C: 'fredericton', E6E: 'fredericton', E6G: 'fredericton',
    E6H: 'fredericton', E6J: 'fredericton', E6K: 'fredericton', E6L: 'oromocto',
    E7A: 'woodstock', E7B: 'woodstock', E7C: 'woodstock', E7E: 'woodstock',
    E7G: 'perth',     E7H: 'perth',     E7J: 'perth',     E7K: 'grandfalls',
    E7L: 'grandfalls', E7M: 'woodstock', E7N: 'perth',    E7P: 'grandfalls',
    E8A: 'caraquet',  E8B: 'caraquet',  E8C: 'caraquet',  E8E: 'shippagan',
    E8G: 'shippagan', E8J: 'shippagan', E8K: 'shippagan', E8L: 'tracadie',
    E8M: 'tracadie',  E8N: 'tracadie',  E8P: 'tracadie',  E8R: 'neguac',
    E8S: 'caraquet',  E8T: 'caraquet',
    E9A: 'campbellton', E9B: 'campbellton', E9C: 'dalhousie', E9E: 'dalhousie',
    E9G: 'campbellton', E9H: 'dalhousie', E9J: 'bathurst',  E9K: 'bathurst',
    E9L: 'bathurst',  E9N: 'bathurst',  E9P: 'bathurst',  E9R: 'campbellton'
  };

  /* Fallback: unlisted "E" FSAs resolve to the nearest operating hub. */
  var FSA_FALLBACK = [
    { test: /^E1[A-M]/, hub: 'moncton' },
    { test: /^E1[N-Z]/, hub: 'miramichi' },
    { test: /^E2[A-D]/, hub: 'bathurst' },
    { test: /^E2[E-U]/, hub: 'saintjohn' },
    { test: /^E2[V-Z]/, hub: 'oromocto' },
    { test: /^E3[A-K]/, hub: 'fredericton' },
    { test: /^E3[L-M]/, hub: 'ststephen' },
    { test: /^E3[N-T]/, hub: 'campbellton' },
    { test: /^E3[V-Z]/, hub: 'edmundston' },
    { test: /^E4[A-K]/, hub: 'sussex' },
    { test: /^E4[L-Z]/, hub: 'bouctouche' },
    { test: /^E5[A-G]/, hub: 'standrews' },
    { test: /^E5[H-Z]/, hub: 'hampton' },
    { test: /^E6/,      hub: 'fredericton' },
    { test: /^E7[A-F]/, hub: 'woodstock' },
    { test: /^E7[G-Z]/, hub: 'grandfalls' },
    { test: /^E8[A-K]/, hub: 'caraquet' },
    { test: /^E8[L-Z]/, hub: 'tracadie' },
    { test: /^E9[A-H]/, hub: 'campbellton' },
    { test: /^E9[J-Z]/, hub: 'bathurst' }
  ];

  /* Rural hubs carry an out-of-route surcharge on residential lanes. */
  var RURAL_HUBS = [
    'caraquet', 'shippagan', 'tracadie', 'neguac', 'dalhousie',
    'grandfalls', 'perth', 'bouctouche', 'standrews', 'hampton'
  ];

  /* ---------------------------------------------------------
     Rate model (indicative, CAD, pre-tax unless noted)
     --------------------------------------------------------- */
  var SERVICES = {
    sameday: {
      key: 'sameday', base: 34.95, perKm: 0.62, perKg: 1.45, minCharge: 42.00,
      dimFactor: 5000, speedKmh: 78, dispatchHrs: 1.5, maxWeight: 68, cutoff: 14
    },
    nextday: {
      key: 'nextday', base: 16.95, perKm: 0.24, perKg: 0.92, minCharge: 21.50,
      dimFactor: 5000, speedKmh: 70, dispatchHrs: 18, maxWeight: 68, cutoff: 17
    },
    freight: {
      key: 'freight', base: 89.00, perKm: 0.94, perKg: 0.38, minCharge: 129.00,
      dimFactor: 3000, speedKmh: 65, dispatchHrs: 22, maxWeight: 8000, cutoff: 15
    },
    hotshot: {
      key: 'hotshot', base: 129.00, perKm: 1.85, perKg: 0.28, minCharge: 165.00,
      dimFactor: 4000, speedKmh: 85, dispatchHrs: 1, maxWeight: 1400, cutoff: 24
    }
  };

  var FEES = {
    fuelPct: 0.145,       // fuel surcharge
    hstPct: 0.15,         // New Brunswick HST
    residential: 6.75,
    liftgate: 42.00,
    signature: 3.25,
    insurance: 12.50,
    rural: 8.90,
    extraPiece: 4.25,
    peninsulaLane: 11.00  // Acadian Peninsula out-and-back allowance
  };

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function normalizePostal(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function formatPostal(value) {
    var raw = normalizePostal(value).slice(0, 6);
    return raw.length > 3 ? raw.slice(0, 3) + ' ' + raw.slice(3) : raw;
  }

  /**
   * Resolve a postal code to a New Brunswick hub.
   * Returns { ok: true, hub, key, fsa } or { ok:false, reason }.
   * reason: 'empty' | 'format' | 'outside'
   */
  function lookupPostal(value) {
    var raw = normalizePostal(value);
    if (!raw) return { ok: false, reason: 'empty' };
    if (!/^[A-Z]\d[A-Z]/.test(raw)) return { ok: false, reason: 'format' };
    if (raw.length < 6) return { ok: false, reason: 'format' };
    if (!/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(raw)) return { ok: false, reason: 'format' };

    var fsa = raw.slice(0, 3);
    if (fsa.charAt(0) !== 'E') return { ok: false, reason: 'outside' };

    var key = FSA[fsa];
    if (!key) {
      for (var i = 0; i < FSA_FALLBACK.length; i++) {
        if (FSA_FALLBACK[i].test.test(fsa)) { key = FSA_FALLBACK[i].hub; break; }
      }
    }
    if (!key || !HUBS[key]) return { ok: false, reason: 'outside' };
    return { ok: true, key: key, hub: HUBS[key], fsa: fsa, postal: formatPostal(raw) };
  }

  /** Great-circle distance in km. */
  function haversine(a, b) {
    var R = 6371;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLng = (b.lng - a.lng) * Math.PI / 180;
    var la1 = a.lat * Math.PI / 180;
    var la2 = b.lat * Math.PI / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(la1) * Math.cos(la2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /** Road distance ≈ great-circle × NB road winding factor. */
  function roadDistance(a, b) {
    var direct = haversine(a, b);
    if (direct < 1) return 0;
    return Math.round(direct * 1.28 + 4);
  }

  global.FX_DATA = {
    HUBS: HUBS,
    MAP_HUBS: MAP_HUBS,
    LABEL_PLACEMENT: LABEL_PLACEMENT,
    LANES: LANES,
    NB_OUTLINE: NB_OUTLINE,
    FSA: FSA,
    RURAL_HUBS: RURAL_HUBS,
    SERVICES: SERVICES,
    FEES: FEES,
    normalizePostal: normalizePostal,
    formatPostal: formatPostal,
    lookupPostal: lookupPostal,
    roadDistance: roadDistance,
    haversine: haversine
  };
})(window);
