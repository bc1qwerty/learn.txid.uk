// ── 링크 프리패치 (hover 시 미리 로드) ──
var _prefetched = {};
function prefetch(url) {
  if (_prefetched[url]) return;
  _prefetched[url] = 1;
  var link = document.createElement('link');
  link.rel = 'prefetch'; link.href = url; link.as = 'document';
  document.head.appendChild(link);
}
document.addEventListener('mouseover', function(e) {
  var a = e.target.closest('a[href]');
  if (!a) return;
  var href = a.getAttribute('href');
  if (!href || href.charAt(0) === '#' || href.indexOf('http') === 0 || href.indexOf('mailto') === 0) return;
  prefetch(a.href);
}, { passive: true });

// ── 페이지 전환 페이드 애니메이션 ──
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.style.cssText += ';opacity:0;transition:opacity 180ms ease';
  requestAnimationFrame(function(){ document.body.style.opacity = '1'; });
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('http') === 0 || href.indexOf('mailto') === 0 || a.target === '_blank') return;
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(function(){ window.location.href = a.href; }, 160);
  });
})();

// ── UTM 자동 삽입 (txid.uk 서브도메인 링크에만) ──
(function() {
  document.querySelectorAll('a[href]').forEach(function(a) {
    var href = a.getAttribute('href');
    if (!href) return;
    if (/^https?:\/\/(txid\.uk|tools\.txid\.uk|tx\.txid\.uk|apps\.txid\.uk|map\.txid\.uk|stats\.txid\.uk|viz\.txid\.uk|portfolio\.txid\.uk)/.test(href)) {
      if (href.indexOf('utm_') === -1) {
        a.setAttribute('href', href + (href.indexOf('?') === -1 ? '?' : '&') + 'utm_source=learn.txid.uk&utm_medium=referral&utm_campaign=internal');
      }
    }
  });
})();
