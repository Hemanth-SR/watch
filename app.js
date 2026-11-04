(function () {
  'use strict';
  var C = window.CATALOG, V = C.videos;
  var HERO_COPY = {
    ZSmRTfd4g3w: "The head of one of the world's most powerful AI companies wrote down what scares him. I read all of it, with the sources.",
    WLZSMOMvyzU: "The man who built Claude Code changed how he uses it. Five changes, shown on screen, that you can copy today.",
    yh_klnmVxuE: "Your AI agrees with you too easily. Here's how to make it the honest coach you never had."
  };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)'), touch = matchMedia('(hover: none)');
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(d, cls) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    if (cls) s.setAttribute('class', cls);
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '2.4');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    s.appendChild(p);
    return s;
  }
  var ICON = {
    play: 'M7 4v16l13-8z', left: 'M15 4l-8 8 8 8', right: 'M9 4l8 8-8 8', close: 'M5 5l14 14M19 5L5 19',
    out: 'M8 16L17 7M9 7h8v8', spk: 'M4 9v6h4l5 4V5L8 9zM17 9a4 4 0 0 1 0 6', mute: 'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6'
  };
  function fill(svgEl) { svgEl.querySelector('path').setAttribute('fill', 'currentColor'); svgEl.querySelector('path').setAttribute('stroke-width', '1'); return svgEl; }

  function fmtViews(n) {
    var s;
    if (n >= 1e6) s = (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    else if (n >= 1e3) s = (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K';
    else s = String(n);
    return s + ' views';
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d) { return d ? (+d.slice(6, 8)) + ' ' + MON[+d.slice(4, 6) - 1] + ' ' + d.slice(0, 4) : ''; }
  function xText(v) { return (v.x < 10 ? v.x.toFixed(1) : String(Math.round(v.x))) + '× ITS CHANNEL'; }
  function metaParts(v) {
    var a = [fmtViews(v.views)];
    if (v.own && v.date) a.push(fmtDate(v.date));
    else if (v.age) a.push(v.age);
    a.push(v.dur);
    return a;
  }
  function ytUrl(id) { return 'https://www.youtube.com/watch?v=' + id; }

  /* thumbnails with fallback chain */
  function setImg(el, id, chain, lb) {
    var i = 0;
    function go() { el.src = 'https://i.ytimg.com/vi/' + id + '/' + chain[i] + '.jpg'; }
    el.onerror = function () { if (i < chain.length - 1) { i++; go(); } };
    el.onload = function () {
      if (el.naturalWidth <= 120 && i < chain.length - 1) { i++; go(); return; }
      if (lb && chain[i] === 'hqdefault') el.classList.add('lb');
      el.classList.add('ok');
    };
    go();
  }
  var SIZES = '(max-width:760px) 41vw, (max-width:1222px) 220px, (max-width:1667px) 18vw, 300px';
  function cardImg(id, sizes) {
    var im = h('img'), step = 0, base = 'https://i.ytimg.com/vi/' + id + '/';
    im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
    im.sizes = sizes || SIZES;
    im.srcset = base + 'mqdefault.jpg 320w, ' + base + 'maxresdefault.jpg 1280w';
    im.src = base + 'mqdefault.jpg';
    im.onerror = function () {
      step++;
      im.removeAttribute('srcset'); im.removeAttribute('sizes');
      im.src = base + (step === 1 ? 'mqdefault' : 'hqdefault') + '.jpg';
      if (step > 2) im.onerror = null;
    };
    im.onload = function () { im.classList.add('ok'); };
    return im;
  }
  function thumb(id, chain, lb) {
    var im = h('img');
    im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
    setImg(im, id, chain, lb);
    return im;
  }

  /* cards */
  function makeCard(id, kind, rowKey) {
    var v = V[id];
    var b = h('button', 'card card-' + kind);
    b.type = 'button';
    b.dataset.id = id; b.dataset.row = rowKey; b.dataset.kind = kind;
    b.setAttribute('aria-label', v.title + ', ' + v.channel);
    var fr = h('span', 'frame');
    fr.appendChild(kind === 'short' || v.short ? thumb(id, ['hqdefault']) : cardImg(id));
    b.appendChild(fr);
    if (kind === 'std' || kind === 'short') {
      b.appendChild(h('span', 'shade'));
      b.appendChild(h('span', 'ttl', v.title));
    } else if (kind === 'outlier') {
      b.appendChild(h('span', 'shade'));
      if (v.x) b.appendChild(h('span', 'pill', xText(v)));
      b.appendChild(h('span', 'chan', v.channel));
    }
    return b;
  }

  /* rows */
  var rowsEl = $('rows');
  function buildRows() {
    C.rows.forEach(function (r) {
      var items = r.items.filter(function (id) { return V[id]; });
      if (!items.length) return;
      var sec = h('section', 'row row-' + r.kind);
      sec.id = 'row-' + r.key;
      var title = h('h2', null, r.title);
      title.id = 'rt-' + r.key;
      sec.setAttribute('aria-labelledby', title.id);
      var wrap = h('div', 'row-wrap');
      var track = h('div', 'track');
      var bl = h('button', 'chev l'); bl.type = 'button'; bl.setAttribute('aria-label', 'Scroll left'); bl.tabIndex = -1; bl.appendChild(svg(ICON.left));
      var br = h('button', 'chev r'); br.type = 'button'; br.setAttribute('aria-label', 'Scroll right'); br.tabIndex = -1; br.appendChild(svg(ICON.right));
      items.forEach(function (id, i) {
        if (r.kind === 'top10') {
          var t = h('div', 't10');
          t.appendChild(h('span', 'num', String(i + 1)));
          t.appendChild(makeCard(id, 'top10', r.key));
          track.appendChild(t);
        } else track.appendChild(makeCard(id, r.kind, r.key));
      });
      function upd() {
        wrap.classList.toggle('can-l', track.scrollLeft > 8);
        wrap.classList.toggle('can-r', track.scrollLeft < track.scrollWidth - track.clientWidth - 8);
        hl.disabled = track.scrollLeft < 8; hr.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 8;
      }
      track.addEventListener('scroll', function () { upd(); if (hcEl) hcClose(true); }, { passive: true });
      window.addEventListener('resize', upd);
      bl.addEventListener('click', function () { track.scrollBy({ left: -track.clientWidth * 0.92, behavior: reduce ? 'auto' : 'smooth' }); });
      br.addEventListener('click', function () { track.scrollBy({ left: track.clientWidth * 0.92, behavior: reduce ? 'auto' : 'smooth' }); });
      wrap.append(track, bl, br);
      var head = h('div', 'row-head');
      var hl = h('button', 'hchev'); hl.type = 'button'; hl.setAttribute('aria-label', 'Scroll left'); hl.tabIndex = -1; hl.appendChild(svg(ICON.left));
      var hr = h('button', 'hchev'); hr.type = 'button'; hr.setAttribute('aria-label', 'Scroll right'); hr.tabIndex = -1; hr.appendChild(svg(ICON.right));
      hl.addEventListener('click', function () { bl.click(); });
      hr.addEventListener('click', function () { br.click(); });
      head.append(title, hl, hr);
      sec.append(head, wrap);
      rowsEl.appendChild(sec);
      requestAnimationFrame(upd);
      setTimeout(upd, 400);
    });
  }

  /* overlay system */
  var ov = $('overlay'), cur = null; // cur = {kind, opener}
  var pageEls = [$('bar'), $('main'), $('foot')];
  function focusables() {
    return Array.prototype.filter.call(ov.querySelectorAll('button,a[href],input,[tabindex]:not([tabindex="-1"])'), function (e) { return !e.disabled && !e.hidden; });
  }
  function openOverlay(kind, opener, top) {
    hcClose(true);
    var keep = cur && cur.opener;
    ov.textContent = '';
    ov.className = 'overlay' + (top ? ' top' : '');
    ov.hidden = false;
    cur = { kind: kind, opener: keep || opener || document.activeElement };
    document.body.classList.add('lock');
    pageEls.forEach(function (e) { e.inert = true; });
    heroVideoStop();
    requestAnimationFrame(function () { ov.classList.add('in'); });
  }
  function closeOverlay(silent) {
    if (!cur) return;
    var op = cur.opener;
    ov.textContent = '';
    ov.hidden = true;
    ov.className = 'overlay';
    cur = null;
    if (silent) return;
    document.body.classList.remove('lock');
    pageEls.forEach(function (e) { e.inert = false; });
    if (op && op.focus && document.contains(op)) op.focus();
    heroVideoStart();
  }
  function mkClose() {
    var c = h('button', 'close'); c.type = 'button'; c.setAttribute('aria-label', 'Close');
    c.appendChild(svg(ICON.close)); c.addEventListener('click', function () { closeOverlay(); });
    return c;
  }
  ov.addEventListener('mousedown', function (e) { if (e.target === ov) closeOverlay(); });
  ov.addEventListener('click', function (e) { if (e.target === ov && cur) closeOverlay(); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cur) { e.preventDefault(); closeOverlay(); return; }
    if (e.key === 'Escape') hcClose(true);
    if (e.key === 'Tab' && cur) {
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (!ov.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function metaLine(parent, v, withPill) {
    metaParts(v).forEach(function (t) { parent.appendChild(h('span', null, t)); });
  }

  /* player */
  function openPlayer(id, opener) {
    var v = V[id]; if (!v) return;
    openOverlay('player', opener);
    var card = h('div', 'mcard pcard' + (v.short ? ' s' : ''));
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-label', v.title);
    var fr = h('div', 'pframe');
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1' + (/[?&]mute=1/.test(location.search) ? '&mute=1' : '');
    f.title = v.title;
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    fr.appendChild(f);
    var info = h('div', 'pinfo');
    info.appendChild(h('h2', null, v.title));
    var m = h('div', 'pm');
    m.appendChild(h('span', null, v.channel));
    m.appendChild(h('span', null, fmtViews(v.views)));
    if (!v.own && v.x) m.appendChild(h('span', 'pill', xText(v)));
    var a = h('a', 'ytlink', 'Watch on YouTube ↗');
    a.href = ytUrl(id); a.target = '_blank'; a.rel = 'noopener noreferrer';
    m.appendChild(a);
    info.appendChild(m);
    card.append(mkClose(), fr, info);
    ov.appendChild(card);
    card.querySelector('.close').focus();
  }

  /* info modal */
  function rowOf(id, rowKey) {
    var r = C.rows.filter(function (x) { return x.key === rowKey && x.items.indexOf(id) > -1; })[0] ||
      C.rows.filter(function (x) { return x.items.indexOf(id) > -1 && x.kind !== 'top10'; })[0] || C.rows[0];
    return r;
  }
  function openInfo(id, opener, rowKey) {
    var v = V[id]; if (!v) return;
    openOverlay('info', opener, true);
    var card = h('div', 'mcard icard');
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-label', v.title);
    var hero = h('div', 'ihero');
    var im = h('img'); im.alt = ''; setImg(im, id, ['maxresdefault', 'hqdefault']);
    var cp = h('div', 'icopy');
    if (v.own) cp.appendChild(h('p', 'kicker', 'HEMANTH SR ORIGINAL'));
    cp.appendChild(h('h2', null, v.title));
    var m = h('div', 'im');
    metaParts(v).forEach(function (t) { m.appendChild(h('span', null, t)); });
    if (!v.own) { m.appendChild(h('span', null, v.channel)); if (v.x) m.appendChild(h('span', 'pill', xText(v))); }
    cp.appendChild(m);
    var bt = h('div', 'btns');
    var pb = h('button', 'btn btn-play'); pb.type = 'button';
    pb.appendChild(fill(svg(ICON.play))); pb.appendChild(document.createTextNode('Play'));
    pb.addEventListener('click', function () { openPlayer(id); });
    var yb = h('a', 'btn btn-info', 'Open on YouTube ↗');
    yb.href = ytUrl(id); yb.target = '_blank'; yb.rel = 'noopener noreferrer';
    bt.append(pb, yb);
    cp.appendChild(bt);
    hero.append(im, cp);
    var body = h('div', 'ibody');
    if (HERO_COPY[id]) body.appendChild(h('p', null, HERO_COPY[id]));
    var r = rowOf(id, rowKey);
    var more = r.items.filter(function (x) { return x !== id && V[x]; }).slice(0, 9);
    if (more.length) {
      body.appendChild(h('h3', null, 'More like this'));
      var g = h('div', 'grid');
      more.forEach(function (x) {
        var c = makeCard(x, V[x].short ? 'std' : (r.kind === 'outlier' ? 'outlier' : 'std'), r.key);
        c.classList.remove('card-short');
        g.appendChild(c);
      });
      g.addEventListener('click', function (e) {
        var c = e.target.closest('.card'); if (!c) return;
        openInfo(c.dataset.id, null, c.dataset.row);
      });
      body.appendChild(g);
    }
    card.append(mkClose(), hero, body);
    ov.appendChild(card);
    pb.focus();
    ov.scrollTop = 0;
  }

  /* search */
  function openSearch(opener) {
    openOverlay('search', opener, true);
    var card = h('div', 'mcard scard');
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-label', 'Search');
    var box = h('div', 'sbox');
    box.appendChild(svg('M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5L21 21'));
    var inp = h('input'); inp.type = 'text'; inp.placeholder = 'Search titles and channels'; inp.setAttribute('aria-label', 'Search titles and channels');
    inp.autocomplete = 'off'; inp.spellcheck = false;
    box.appendChild(inp);
    var count = h('p', 'scount');
    var grid = h('div', 'sgrid');
    var all = Object.keys(V).map(function (k) { return V[k]; });
    function run() {
      var q = inp.value.trim().toLowerCase();
      grid.textContent = '';
      if (!q) { count.textContent = ''; grid.appendChild(h('p', 'sempty', 'Type to search all ' + all.length + ' videos.')); return; }
      var toks = q.split(/\s+/);
      var res = all.filter(function (v) {
        var s = (v.title + ' ' + v.channel).toLowerCase();
        return toks.every(function (t) { return s.indexOf(t) > -1; });
      }).sort(function (a, b) { return (b.own - a.own) || (b.views - a.views); });
      count.textContent = res.length + (res.length === 1 ? ' result' : ' results');
      if (!res.length) { grid.appendChild(h('p', 'sempty', 'Nothing matches "' + inp.value.trim() + '".')); return; }
      res.slice(0, 60).forEach(function (v) { grid.appendChild(makeCard(v.id, 'std', 'search')); });
    }
    inp.addEventListener('input', run);
    grid.addEventListener('click', function (e) {
      var c = e.target.closest('.card'); if (!c) return;
      openPlayer(c.dataset.id);
    });
    card.append(mkClose(), box, count, grid);
    ov.appendChild(card);
    run();
    inp.focus();
  }

  /* hover card */
  var hcTimer = 0, hcLeave = 0, hcEl = null, hcFor = null;
  var layer = $('hoverLayer');
  function hcClose(now) {
    clearTimeout(hcTimer); clearTimeout(hcLeave);
    if (!hcEl) { hcFor = null; return; }
    var el = hcEl; hcEl = null; hcFor = null;
    if (now || reduce) { el.remove(); return; }
    el.classList.add('pre');
    setTimeout(function () { el.remove(); }, 260);
  }
  function hcOpen(card) {
    var id = card.dataset.id, v = V[id], kind = card.dataset.kind;
    var r = card.getBoundingClientRect();
    var isShort = kind === 'short';
    var w = isShort ? r.width * 1.2 : Math.max(r.width * 1.45, 300);
    var imgH = isShort ? w * 16 / 9 : w * 9 / 16;
    var el = h('div', 'hc' + (reduce ? '' : ' pre'));
    var im = h('div', 'himg' + (isShort ? ' s' : ''));
    im.appendChild(isShort ? thumb(id, ['hqdefault']) : cardImg(id, w + 'px'));
    im.firstChild.loading = 'eager';
    var p = h('div', 'hpanel');
    var bs = h('div', 'hbtns');
    var pb = h('button', 'rb p'); pb.type = 'button'; pb.setAttribute('aria-label', 'Play'); pb.appendChild(fill(svg(ICON.play)));
    var ob = h('a', 'rb'); ob.href = ytUrl(id); ob.target = '_blank'; ob.rel = 'noopener noreferrer'; ob.setAttribute('aria-label', 'Open on YouTube'); ob.appendChild(svg(ICON.out));
    ob.addEventListener('click', function (e) { e.stopPropagation(); });
    bs.append(pb, ob);
    var mt = h('div', 'hmeta');
    metaParts(v).slice(0, 1).forEach(function (t) { mt.appendChild(h('span', null, t)); });
    mt.appendChild(h('span', null, v.dur));
    if (!v.own && v.x) mt.appendChild(h('span', 'pill', xText(v)));
    mt.appendChild(h('span', null, v.channel));
    p.append(bs, h('p', 'htitle', v.title), mt);
    el.append(im, p);
    layer.appendChild(el);
    var vw = innerWidth, vh = innerHeight;
    var cx = r.left + r.width / 2, left = cx - w / 2, origin = 'center';
    if (r.left < 24 + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad') || 0) || left < 8) { left = Math.max(8, r.left); origin = 'left'; }
    else if (r.right > vw - 40 || left + w > vw - 8) { left = Math.min(vw - w - 8, r.right - w); origin = 'right'; }
    el.style.width = w + 'px';
    var th = el.offsetHeight;
    var top = r.top + r.height / 2 - imgH / 2;
    top = Math.max(76, Math.min(top, vh - th - 8));
    el.style.width = w + 'px'; el.style.left = left + 'px'; el.style.top = top + 'px';
    el.style.transformOrigin = origin + ' ' + Math.max(0, Math.min(100, (r.top + r.height / 2 - top) / th * 100)) + '%';
    el.addEventListener('mouseenter', function () { clearTimeout(hcLeave); });
    el.addEventListener('mouseleave', function () { hcLeave = setTimeout(function () { hcClose(); }, 120); });
    el.addEventListener('click', function () { var o = card; hcClose(true); openPlayer(id, o); });
    hcEl = el; hcFor = card;
    if (!reduce) requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove('pre'); }); });
  }
  rowsEl.addEventListener('mouseover', function (e) {
    if (!fine.matches || cur) return;
    var c = e.target.closest('.card'); if (!c || c.parentNode.closest('.hc')) return;
    clearTimeout(hcLeave);
    if (hcFor === c) return;
    clearTimeout(hcTimer);
    if (hcEl) hcClose(true);
    hcTimer = setTimeout(function () { hcOpen(c); }, 450);
  });
  rowsEl.addEventListener('mouseout', function (e) {
    var c = e.target.closest('.card'); if (!c) return;
    if (e.relatedTarget && c.contains(e.relatedTarget)) return;
    clearTimeout(hcTimer);
    clearTimeout(hcLeave);
    hcLeave = setTimeout(function () { hcClose(); }, 120);
  });
  window.addEventListener('scroll', function () { if (hcEl) hcClose(true); }, { passive: true });

  rowsEl.addEventListener('focusin', function (e) {
    var c = e.target.closest('.card');
    if (!c || cur || !e.target.matches(':focus-visible') || touch.matches) return;
    clearTimeout(hcTimer); clearTimeout(hcLeave);
    if (hcFor === c) return;
    if (hcEl) hcClose(true);
    hcTimer = setTimeout(function () { hcOpen(c); }, 260);
  });
  rowsEl.addEventListener('focusout', function (e) {
    if (!e.target.closest('.card')) return;
    clearTimeout(hcTimer);
    hcLeave = setTimeout(function () { hcClose(); }, 120);
  });
  rowsEl.addEventListener('click', function (e) {
    var c = e.target.closest('.card'); if (!c) return;
    if (touch.matches) openInfo(c.dataset.id, c, c.dataset.row); else openPlayer(c.dataset.id, c);
  });

  /* hero */
  var heroIds = ['WLZSMOMvyzU', 'ZSmRTfd4g3w', 'yh_klnmVxuE'].filter(function (id) { return V[id]; });
  var hi = 0, hTimer = 0, hVideoT = 0, hMuted = true, hPaused = false, hVisible = true, hElapsed = 0;
  var hImg = $('heroImg'), hVid = $('heroVideo'), hMute = $('heroMute'), hDots = $('heroDots');
  function heroSize() {
    var f = hVid.firstChild; if (!f) return;
    var W = hVid.clientWidth, H = hVid.clientHeight, w = Math.max(W, H * 16 / 9);
    f.style.width = w + 'px'; f.style.height = (w * 9 / 16) + 'px';
  }
  function heroVideoStop() {
    clearTimeout(hVideoT);
    hVid.classList.remove('on'); hVid.textContent = ''; hMute.hidden = true;
  }
  function heroSrc(id) {
    return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=' + (hMuted ? 1 : 0) + '&controls=0&loop=1&playlist=' + id + '&playsinline=1&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&cc_load_policy=0';
  }
  function heroVideoMount() {
    hVid.textContent = '';
    var id = heroIds[hi];
    var f = document.createElement('iframe');
    f.src = heroSrc(id);
    f.title = 'Preview: ' + V[id].title;
    f.tabIndex = -1;
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    f.setAttribute('aria-hidden', 'true');
    f.addEventListener('load', function () { setTimeout(function () { if (hVid.firstChild === f) hVid.classList.add('on'); }, 1200); });
    hVid.appendChild(f);
    heroSize();
    setMuteIcon();
    hMute.hidden = false;
  }
  function heroVideoStart() {
    if (reduce || cur || touch.matches) return;
    clearTimeout(hVideoT);
    if (hVid.firstChild) { hMute.hidden = false; return; }
    hVideoT = setTimeout(heroVideoMount, 4500);
  }
  function setMuteIcon() {
    hMute.textContent = '';
    hMute.appendChild(svg(hMuted ? ICON.mute : ICON.spk));
    hMute.setAttribute('aria-label', hMuted ? 'Unmute' : 'Mute');
  }
  hMute.addEventListener('click', function () {
    hMuted = !hMuted;
    var f = hVid.firstChild;
    if (f) f.src = heroSrc(heroIds[hi]);
    setMuteIcon();
  });
  function setHero(i, user) {
    hi = (i + heroIds.length) % heroIds.length;
    var id = heroIds[hi], v = V[id];
    heroVideoStop();
    hImg.classList.remove('ok', 'kb');
    setTimeout(function () {
      hImg.onload = null;
      setImg(hImg, id, ['maxresdefault', 'hqdefault']);
      var base = hImg.onload;
      hImg.onload = function () { base.call(hImg); void hImg.offsetWidth; if (!reduce) hImg.classList.add('kb'); };
    }, user ? 120 : 0);
    $('heroTitle').textContent = v.title;
    var m = $('heroMeta'); m.textContent = '';
    metaParts(v).forEach(function (t, k) { m.appendChild(h('span', null, (k ? ' · ' : '') + t)); });
    $('heroBlurb').textContent = HERO_COPY[id] || '';
    Array.prototype.forEach.call(hDots.children, function (d, k) { d.setAttribute('aria-selected', k === hi ? 'true' : 'false'); });
    hElapsed = 0;
    heroVideoStart();
  }
  heroIds.forEach(function (id, k) {
    var d = h('button', 'dot'); d.type = 'button'; d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', 'Show featured video ' + (k + 1)); d.addEventListener('click', function () { setHero(k, true); });
    hDots.appendChild(d);
  });
  $('heroPlay').addEventListener('click', function (e) { openPlayer(heroIds[hi], e.currentTarget); });
  $('heroInfo').addEventListener('click', function (e) { openInfo(heroIds[hi], e.currentTarget, 'new'); });
  var hero = $('hero');
  ['mouseenter', 'focusin'].forEach(function (n) { $('heroCopy').addEventListener(n, function () { hPaused = true; }); hDots.addEventListener(n, function () { hPaused = true; }); });
  ['mouseleave', 'focusout'].forEach(function (n) { $('heroCopy').addEventListener(n, function () { hPaused = false; }); hDots.addEventListener(n, function () { hPaused = false; }); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { hVisible = en[0].isIntersecting; }, { threshold: 0.25 }).observe(hero);
  setInterval(function () {
    if (cur || hPaused || !hVisible || document.hidden || heroIds.length < 2) return;
    if (++hElapsed >= 25) setHero(hi + 1);
  }, 1000);
  window.addEventListener('resize', heroSize);

  /* top bar, nav */
  var bar = $('bar');
  function onScroll() { bar.classList.toggle('solid', scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = a.dataset.go === 'top' ? null : $(a.dataset.go);
      var y = t ? t.getBoundingClientRect().top + scrollY - 90 : 0;
      scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  $('brand').addEventListener('click', function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  $('searchBtn').addEventListener('click', function (e) { openSearch(e.currentTarget); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !cur && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch($('searchBtn')); }
  });

  buildRows();
  if (heroIds.length) setHero(0);
})();
