  // ─── User Profile ───

  async function renderUserProfile(pubkey, tab) {
    var isOwner = currentUser && currentUser.pubkey === pubkey;

    // Icons tab — render separately (no list data needed)
    if (tab === 'icons' && isOwner) {
      return renderIconsTab(pubkey);
    }

    // Determine API path based on tab
    var apiPath, type;
    if (tab === 'comments') {
      apiPath = '/board/users/' + pubkey + '/comments'; type = 'comments';
    } else if (tab === 'voted-posts' && isOwner) {
      apiPath = '/board/me/voted-posts'; type = 'posts';
    } else if (tab === 'voted-comments' && isOwner) {
      apiPath = '/board/me/voted-comments'; type = 'comments';
    } else if (tab === 'bookmarks' && isOwner) {
      apiPath = '/board/me/bookmarks'; type = 'posts';
    } else {
      tab = 'posts';
      apiPath = '/board/users/' + pubkey + '/posts'; type = 'posts';
    }

    var page = parseInt(new URLSearchParams(location.hash.split('?')[1]).get('page')) || 1;
    var results = await Promise.all([
      api('/board/users/' + pubkey),
      api(apiPath + '?page=' + page + '&limit=20'),
    ]);
    var profile = results[0];
    var data = results[1];
    var items = data.posts || data.comments || [];
    var pg = data.pagination;
    var displayName = profile.displayName || shortKey(pubkey);
    var initials = (profile.displayName || pubkey.slice(0, 2)).slice(0, 2).toUpperCase();
    var base = 'user/' + pubkey;

    app.innerHTML = `
      <header class="mb-8">
        <nav class="text-sm text-gray-500 mb-4"><a href="#" class="hover:text-bitcoin">${t('boards')}</a> / <span class="text-white">${esc(displayName)}</span></nav>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-5 rounded-xl border border-gray-800/50 bg-gray-900/30${isOwner ? '' : ' md:col-span-2'}">
            <div class="flex items-center gap-4${isOwner ? ' mb-4' : ''}">
              <div class="flex-shrink-0">${authorAvatar({isAdmin: profile.isAdmin, selectedIcon: profile.selectedIcon}, 32)}</div>
              <div>
                <div class="text-white font-semibold flex items-center gap-2" id="profile-name">${esc(displayName)}${profile.isAdmin ? ' <span class="text-[10px] px-1 py-0.5 rounded bg-bitcoin/20 text-bitcoin font-bold leading-none">ADMIN</span>' : ''}</div>
                <div class="text-xs text-gray-500 font-mono">${shortKey(pubkey)}</div>
                <div class="text-xs text-gray-600 mt-1">${profile.postCount} ${t('tab_posts')} · ${profile.commentCount} ${t('tab_comments')}</div>
              </div>
            </div>
            ${isOwner ? `
              <label class="text-xs text-gray-500 block mb-1">${t('nickname')}</label>
              <div class="flex gap-2 items-center">
                <input id="nick-input" class="comm-input" style="max-width:180px;padding:6px 10px;font-size:.8rem" placeholder="${t('nickname_ph')}" maxlength="8" value="${esc(currentUser.displayName || '')}">
                <button class="comm-btn-primary" id="nick-save" style="padding:6px 14px;font-size:.78rem">${t('save')}</button>
              </div>
              <div class="flex items-center gap-2 mt-3">
                <div class="flex-shrink-0">${authorAvatar({isAdmin: profile.isAdmin, selectedIcon: profile.selectedIcon}, 20)}</div>
                <a href="#${base}/icons" class="text-xs text-gray-400 hover:text-bitcoin transition-colors">${t('change_icon')}</a>
              </div>
            ` : ''}
          </div>
          ${isOwner ? `
          <div class="p-5 rounded-xl border border-gray-800/50 bg-gray-900/30">
            <div id="nip05-section"></div>
          </div>
          <div class="p-5 rounded-xl border border-gray-800/50 bg-gray-900/30" id="nostr-card">
            <span class="text-purple-400 text-xs font-bold">Nostr</span>
            <div id="nostr-pubkey-row" class="mt-2 flex items-center gap-2">
              <span class="text-xs text-gray-500">...</span>
            </div>
          </div>
          ` : ''}
        </div>

        <div class="flex gap-2 flex-wrap text-xs">
          <a href="#${base}/posts" class="comm-tab${tab === 'posts' ? ' comm-tab-active' : ''}">${t('tab_posts')}</a>
          <a href="#${base}/comments" class="comm-tab${tab === 'comments' ? ' comm-tab-active' : ''}">${t('tab_comments')}</a>
          ${isOwner ? `
            <a href="#${base}/voted-posts" class="comm-tab${tab === 'voted-posts' ? ' comm-tab-active' : ''}">${t('voted_posts')}</a>
            <a href="#${base}/voted-comments" class="comm-tab${tab === 'voted-comments' ? ' comm-tab-active' : ''}">${t('voted_comments')}</a>
            <a href="#${base}/bookmarks" class="comm-tab${tab === 'bookmarks' ? ' comm-tab-active' : ''}">${t('bookmarks')}</a>
            <a href="#${base}/icons" class="comm-tab${tab === 'icons' ? ' comm-tab-active' : ''}">${t('icons')}</a>
          ` : ''}
        </div>
      </header>
      <div>
        ${items.length === 0 ? '<p class="text-gray-500 text-sm py-10 text-center">' + t('no_items') + '</p>' :
          type === 'comments' ? items.map(commentCard).join('') :
          items.map(function(p) { return postCard(p, p.boardSlug); }).join('')}
      </div>
      ${pg && pg.totalPages > 1 ? myPagHtml(pg, base + '/' + tab) : ''}
    `;

    // Nostr pubkey display (fetch async)
    if (isOwner) {
      api('/nostr/me').then(function(data) {
        var row = document.getElementById('nostr-pubkey-row');
        if (!row) return;
        if (data && data.npub) {
          var displayNpub = data.customNpub || data.npub;
          var isCustom = !!data.customNpub;
          renderNostrRow(row, displayNpub, isCustom, data.npub);
        } else {
          var card = document.getElementById('nostr-card');
          if (card) card.style.display = 'none';
        }
      }).catch(function() {
        var card = document.getElementById('nostr-card');
        if (card) card.style.display = 'none';
      });

      // NIP-05 section
      loadNip05Section();
    }

    function renderNostrRow(row, displayNpub, isCustom, derivedNpub) {
      row.innerHTML = '<span class="text-xs text-gray-400 font-mono">' + displayNpub.slice(0, 16) + '…' + displayNpub.slice(-6) + '</span>' +
        ' <button id="nostr-copy" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400">' + t('copy') + '</button>' +
        ' <button id="nostr-edit-btn" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-purple-400">' + t('nostr_edit') + '</button>' +
        (isCustom ? ' <button id="nostr-reset-btn" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-red-400">' + t('nostr_reset') + '</button>' : '');
      row.title = displayNpub;

      document.getElementById('nostr-copy').addEventListener('click', function(e) {
        e.preventDefault();
        navigator.clipboard.writeText(displayNpub).then(function() {
          e.target.textContent = t('copied');
          setTimeout(function() { e.target.textContent = t('copy'); }, 1500);
        });
      });

      document.getElementById('nostr-edit-btn').addEventListener('click', function() {
        row.innerHTML = '<div class="flex gap-2 items-center flex-wrap">' +
          '<input id="nostr-input" class="comm-input" style="max-width:240px;padding:4px 8px;font-size:.75rem" placeholder="npub1..." value="' + (isCustom ? esc(displayNpub) : '') + '">' +
          '<button id="nostr-save-btn" class="text-[10px] px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white">' + t('nostr_save') + '</button>' +
          '<button id="nostr-cancel-btn" class="text-[10px] px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400">' + t('cancel') + '</button>' +
          '</div>';

        document.getElementById('nostr-save-btn').addEventListener('click', async function() {
          var input = document.getElementById('nostr-input');
          var val = input.value.trim();
          try {
            var res = await api('/nostr/me', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customNpub: val || null }),
            });
            var newNpub = res.customNpub || derivedNpub;
            renderNostrRow(row, newNpub, !!res.customNpub, derivedNpub);
          } catch(e) {
            input.style.borderColor = '#ef4444';
            input.placeholder = t('nostr_invalid');
          }
        });

        document.getElementById('nostr-cancel-btn').addEventListener('click', function() {
          renderNostrRow(row, displayNpub, isCustom, derivedNpub);
        });
      });

      var resetBtn = document.getElementById('nostr-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', async function() {
          try {
            await api('/nostr/me', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customNpub: null }),
            });
            renderNostrRow(row, derivedNpub, false, derivedNpub);
          } catch(e) { /* ignore */ }
        });
      }
    }

    // Nickname save (owner only)
    if (isOwner) {
      document.getElementById('nick-save').addEventListener('click', async function() {
        var input = document.getElementById('nick-input');
        var name = input.value.trim();
        var saveBtn = document.getElementById('nick-save');
        if (!confirm(name ? name + ' — ' + t('confirm_nickname') : t('confirm_nickname_clear'))) return;
        try {
          await api('/auth/me/display-name', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName: name }),
          });
          currentUser.displayName = name || null;
          document.getElementById('profile-name').textContent = name || shortKey(pubkey);
          if (window.txidAuth && window.txidAuth.updateDisplayName) {
            window.txidAuth.updateDisplayName(name || null);
          }
          saveBtn.textContent = t('saved');
          setTimeout(function() { saveBtn.textContent = t('save'); }, 1500);
        } catch(e) {
          saveBtn.textContent = '!';
          setTimeout(function() { saveBtn.textContent = t('save'); }, 1500);
        }
      });
    }
  }

  function commentCard(c) {
    return `
      <a href="#${c.boardSlug}/${c.postId}" class="block px-4 py-3 rounded-lg border border-gray-800/50 hover:border-gray-700 bg-gray-900/20 hover:bg-gray-900/40 transition-all mb-2">
        <div class="flex items-center gap-3">
          <span class="text-bitcoin font-mono font-semibold text-xs min-w-[28px] text-center">${c.voteScore}</span>
          <p class="text-sm text-gray-300 truncate flex-1 min-w-0">${esc(c.body)}</p>
          <div class="flex items-center gap-2 text-xs text-gray-600 flex-shrink-0">
            <span>${esc(c.postTitle)}</span>
            <span>${timeAgo(c.createdAt)}</span>
          </div>
        </div>
      </a>`;
  }

  // ─── Icons Tab ───
  async function renderIconsTab(pubkey) {
    var results = await Promise.all([
      api('/board/users/' + pubkey),
      api('/progress/icons'),
    ]);
    var profile = results[0];
    var iconsData = results[1];
    var displayName = profile.displayName || shortKey(pubkey);
    var base = 'user/' + pubkey;
    var selected = iconsData.selectedIcon || null;

    var gridHtml = '';

    // Default avatar option
    var isDefault = !selected;
    gridHtml += '<div class="flex flex-col items-center gap-2 p-3 rounded-lg border ' + (isDefault ? 'border-bitcoin bg-bitcoin/10' : 'border-gray-800/50 bg-gray-900/20') + '">'
      + '<div class="relative">' + avatarSvg(48, false) + '</div>'
      + '<span class="text-xs text-gray-400">' + t('icon_default') + '</span>'
      + (isDefault
        ? '<span class="text-[10px] px-2 py-0.5 rounded bg-bitcoin/20 text-bitcoin font-semibold">' + t('icon_selected') + '</span>'
        : '<button class="text-[10px] px-2 py-0.5 rounded border border-gray-700 text-gray-400 hover:border-bitcoin hover:text-bitcoin comm-apply-icon" data-icon="">' + t('select_icon') + '</button>')
      + '</div>';

    // Course icons
    iconsData.courses.forEach(function(c) {
      var isCurrent = selected === c.slug;
      var borderClass = isCurrent ? 'border-bitcoin bg-bitcoin/10' : (c.earned ? 'border-gray-700 bg-gray-900/20 hover:border-bitcoin/50' : 'border-gray-800/30 bg-gray-900/10 opacity-60');
      gridHtml += '<div class="flex flex-col items-center gap-2 p-3 rounded-lg border ' + borderClass + '">'
        + '<div class="relative">' + courseIconSvg(c.slug, 48, c.earned) + '</div>'
        + '<span class="text-xs ' + (c.earned ? 'text-gray-300' : 'text-gray-600') + '">' + esc(c.title) + '</span>';
      if (isCurrent) {
        gridHtml += '<span class="text-[10px] px-2 py-0.5 rounded bg-bitcoin/20 text-bitcoin font-semibold">' + t('icon_selected') + '</span>';
      } else if (c.earned) {
        gridHtml += '<button class="text-[10px] px-2 py-0.5 rounded border border-gray-700 text-gray-400 hover:border-bitcoin hover:text-bitcoin comm-apply-icon" data-icon="' + c.slug + '">' + t('select_icon') + '</button>';
      } else {
        gridHtml += '<span class="text-[10px] px-2 py-0.5 text-gray-600">' + svgLock + ' ' + t('icon_locked') + '</span>';
      }
      gridHtml += '</div>';
    });

    app.innerHTML = `
      <header class="mb-8">
        <nav class="text-sm text-gray-500 mb-4"><a href="#" class="hover:text-bitcoin">${t('boards')}</a> / <span class="text-white">${esc(displayName)}</span></nav>

        <div class="p-5 rounded-xl border border-gray-800/50 bg-gray-900/30 mb-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="flex-shrink-0">${authorAvatar({isAdmin: profile.isAdmin, selectedIcon: selected}, 32)}</div>
            <div>
              <div class="text-white font-semibold flex items-center gap-2" id="profile-name">${esc(displayName)}${profile.isAdmin ? ' <span class="text-[10px] px-1 py-0.5 rounded bg-bitcoin/20 text-bitcoin font-bold leading-none">ADMIN</span>' : ''}</div>
              <div class="text-xs text-gray-500 font-mono">${shortKey(pubkey)}</div>
              <div class="text-xs text-gray-600 mt-1">${profile.postCount} ${t('tab_posts')} · ${profile.commentCount} ${t('tab_comments')}</div>
            </div>
          </div>
          <label class="text-xs text-gray-500 block mb-1">${t('nickname')}</label>
          <div class="flex gap-2 items-center">
            <input id="nick-input" class="comm-input" style="max-width:180px;padding:6px 10px;font-size:.8rem" placeholder="${t('nickname_ph')}" maxlength="8" value="${esc(currentUser.displayName || '')}">
            <button class="comm-btn-primary" id="nick-save" style="padding:6px 14px;font-size:.78rem">${t('save')}</button>
          </div>
        </div>

        <div class="flex gap-2 flex-wrap text-xs">
          <a href="#${base}/posts" class="comm-tab">${t('tab_posts')}</a>
          <a href="#${base}/comments" class="comm-tab">${t('tab_comments')}</a>
          <a href="#${base}/voted-posts" class="comm-tab">${t('voted_posts')}</a>
          <a href="#${base}/voted-comments" class="comm-tab">${t('voted_comments')}</a>
          <a href="#${base}/bookmarks" class="comm-tab">${t('bookmarks')}</a>
          <a href="#${base}/icons" class="comm-tab comm-tab-active">${t('icons')}</a>
        </div>
      </header>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" id="icons-grid">
        ${gridHtml}
      </div>
    `;

    // Nickname save handler
    document.getElementById('nick-save').addEventListener('click', async function() {
      var input = document.getElementById('nick-input');
      var name = input.value.trim();
      var saveBtn = document.getElementById('nick-save');
      if (!confirm(name ? name + ' — ' + t('confirm_nickname') : t('confirm_nickname_clear'))) return;
      try {
        await api('/auth/me/display-name', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: name }),
        });
        currentUser.displayName = name || null;
        document.getElementById('profile-name').textContent = name || shortKey(pubkey);
        if (window.txidAuth && window.txidAuth.updateDisplayName) {
          window.txidAuth.updateDisplayName(name || null);
        }
        saveBtn.textContent = t('saved');
        setTimeout(function() { saveBtn.textContent = t('save'); }, 1500);
      } catch(e) {
        saveBtn.textContent = '!';
        setTimeout(function() { saveBtn.textContent = t('save'); }, 1500);
      }
    });

    // Apply icon handlers
    document.getElementById('icons-grid').addEventListener('click', async function(e) {
      var btn = e.target.closest('.comm-apply-icon');
      if (!btn) return;
      var icon = btn.dataset.icon || null;
      btn.textContent = '...';
      try {
        var res = await api('/auth/me/icon', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icon: icon }),
        });
        currentUser.selectedIcon = res.selectedIcon;
        if (window.txidAuth && window.txidAuth.updateSelectedIcon) {
          window.txidAuth.updateSelectedIcon(res.selectedIcon);
        }
        // Re-render icons tab to reflect change
        renderIconsTab(pubkey);
      } catch(e) {
        btn.textContent = '!';
        setTimeout(function() { btn.textContent = t('select_icon'); }, 1500);
      }
    });
  }

  function myPagHtml(pg, hashBase) {
    if (pg.totalPages <= 1) return '';
    var html = '<div class="flex items-center justify-center gap-2 mt-8">';
    if (pg.page > 1) html += '<a href="#' + hashBase + '?page=' + (pg.page - 1) + '" class="comm-btn-secondary">' + t('prev') + '</a>';
    html += '<span class="text-sm text-gray-500">' + pg.page + ' ' + t('of') + ' ' + pg.totalPages + '</span>';
    if (pg.page < pg.totalPages) html += '<a href="#' + hashBase + '?page=' + (pg.page + 1) + '" class="comm-btn-secondary">' + t('next') + '</a>';
    html += '</div>';
    return html;
  }
