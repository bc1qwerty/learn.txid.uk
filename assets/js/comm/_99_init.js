  // ─── Init ───
  var _loading = null;
  var _routeVer = 0;
  async function safeRoute() {
    var ver = ++_routeVer;
    // Only show skeleton if there's no real content yet (avoid flicker on re-render)
    var hasContent = app.children.length > 0 && !app.querySelector('.comm-skeleton');
    _loading = setTimeout(function() {
      if (ver !== _routeVer) return;
      if (!hasContent && !app.querySelector('.comm-skeleton')) {
        app.innerHTML = '<div class="comm-skeleton"><div></div><div></div><div></div></div>';
      }
    }, 150);
    try {
      await route();
    } catch (e) {
      if (ver !== _routeVer) return; // stale render, discard
      console.error('[community] route error:', e);
      app.innerHTML = '<p class="text-center py-20 text-gray-500">Error: ' + (e.message || 'Unknown') + '</p>';
    } finally {
      clearTimeout(_loading);
    }
  }

  function subscribeAuth() {
    if (window.txidAuth) {
      window.txidAuth.onAuthChange(function (user) {
        currentUser = user;
        safeRoute();
      });
    }
  }

  async function init() {
    // Render page immediately (non-blocking), auth in parallel
    var authDone = checkAuth();
    await safeRoute();
    window.addEventListener('hashchange', safeRoute);

    // Intercept community nav link clicks while already on community page
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || !/\/community\/#/.test(href)) return;
      if (!document.getElementById('community-app')) return;
      e.preventDefault();
      var hash = href.split('#')[1] || '';
      if (location.hash === '#' + hash) {
        safeRoute();
      } else {
        location.hash = hash;
      }
    });

    // Re-render once auth resolves (shows login-dependent UI)
    authDone.then(function() {
      if (currentUser) safeRoute();
    });

    // Subscribe to auth changes — txid-auth.js loads with defer, so retry if not ready
    if (window.txidAuth) {
      subscribeAuth();
    } else {
      var _authRetry = 0;
      var _authTimer = setInterval(function() {
        if (window.txidAuth || ++_authRetry > 20) {
          clearInterval(_authTimer);
          if (window.txidAuth) subscribeAuth();
        }
      }, 200);
    }
  }

  init();
})();
