  // ─── Router ───
  async function route() {
    const hash = location.hash.slice(1) || '';
    const parts = hash.split('?')[0].split('/').filter(Boolean);

    if (!parts.length) return renderHome();
    if (parts[0] === 'search') return renderSearch();
    if (parts[0] === 'me' && currentUser) {
      location.hash = 'user/' + currentUser.pubkey;
      return;
    }
    if (parts[0] === 'user' && parts[1]) return renderUserProfile(parts[1], parts[2] || 'posts');
    if (parts.length === 1) return renderBoard(parts[0]);
    if (parts[1] === 'new') return renderNewPost(parts[0]);
    if (parts.length === 2 && /^\d+$/.test(parts[1])) return renderPost(parts[0], parseInt(parts[1]));
    if (parts[2] === 'edit') return renderEditPost(parts[0], parseInt(parts[1]));

    renderHome();
  }

  // ─── Views ───

  var _categoriesCache = null;
  var _categoriesCacheTs = 0;

  async function getCategories() {
    if (_categoriesCache && Date.now() - _categoriesCacheTs < 600000) return _categoriesCache;
    const data = await api('/board/categories');
    _categoriesCache = data.boards || [];
    _categoriesCacheTs = Date.now();
    return _categoriesCache;
  }

  async function renderHome() {
    const boards = await getCategories();

    app.innerHTML = `
      <header class="mb-10">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white">${t('boards')}</h1>
          </div>
          <div class="flex items-center gap-3">
            <button class="comm-btn-secondary" onclick="location.hash='search'">${svgSearch} ${t('search')}</button>
          </div>
        </div>
      </header>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${boards.map(b => `
          <a href="#${b.slug}" class="group p-6 rounded-xl border border-gray-800/50 hover:border-bitcoin/30 bg-gray-900/30 hover:bg-gray-900/60 transition-all">
            <h3 class="text-lg font-semibold text-white group-hover:text-bitcoin">${esc(boardName(b))}</h3>
            <p class="text-sm text-gray-500 mt-1">${esc(b.description || '')}</p>
            <span class="text-xs text-gray-600 mt-3 block">${b.postCount} posts</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  async function renderBoard(slug, page, sort) {
    page = page || parseInt(new URLSearchParams(location.hash.split('?')[1]).get('page')) || 1;
    sort = sort || new URLSearchParams(location.hash.split('?')[1]).get('sort') || 'newest';

    const data = await api(`/board/${slug}/posts?page=${page}&limit=20&sort=${sort}`);
    if (data.error) return renderHome();

    const { board, posts, pagination } = data;
    const bName = boardName(board);

    app.innerHTML = `
      <header class="mb-8">
        <nav class="text-sm text-gray-500 mb-4"><a href="#" class="hover:text-bitcoin">${t('boards')}</a> / <span class="text-white">${esc(bName)}</span></nav>
        <div class="flex items-center justify-between flex-wrap gap-4">
          <h1 class="text-2xl font-bold text-white">${esc(bName)}</h1>
          <div class="flex items-center gap-3">
            <button class="comm-btn-secondary" onclick="location.hash='search'">${svgSearch}</button>
            <button class="comm-btn-primary" id="new-post-btn">${t('newPost')}</button>
          </div>
        </div>
        <div class="flex gap-3 mt-4" id="sort-tabs">
          ${['newest', 'votes', 'comments'].map(s => `
            <button class="comm-tab${sort === s ? ' comm-tab-active' : ''}" data-sort="${s}">${t(s === 'comments' ? 'most_comments' : s)}</button>
          `).join('')}
        </div>
      </header>
      <div id="post-list">
        ${posts.length === 0 ? `<p class="text-gray-500 text-sm py-10 text-center">${t('no_posts')}</p>` :
          posts.map(p => postCard(p, slug)).join('')}
      </div>
      ${paginationHtml(pagination, slug, sort)}
    `;

    document.getElementById('sort-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-sort]');
      if (btn) {
        location.hash = `${slug}?sort=${btn.dataset.sort}`;
        renderBoard(slug, 1, btn.dataset.sort);
      }
    });

    // New post button (with admin-only check)
    const newPostBtn = document.getElementById('new-post-btn');
    if (newPostBtn) {
      newPostBtn.addEventListener('click', () => {
        if (!currentUser) {
          if (window.txidAuth) window.txidAuth.openLogin();
          return;
        }
        if (board.adminOnly && !currentUser.isAdmin) {
          alert(t('admin_only_msg'));
          return;
        }
        location.hash = `${slug}/new`;
      });
    }
  }

  function postCard(p, slug) {
    return `
      <a href="#${slug}/${p.id}" class="block px-4 py-3 rounded-lg border border-gray-800/50 hover:border-gray-700 bg-gray-900/20 hover:bg-gray-900/40 transition-all mb-2">
        <div class="flex items-center gap-3">
          <span class="text-bitcoin font-mono font-semibold text-xs min-w-[28px] text-center">${p.voteScore}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              ${p.isPinned ? `<span class="text-xs px-1.5 py-0.5 rounded bg-bitcoin/10 text-bitcoin">${t('pinned')}</span>` : ''}
              <h3 class="text-sm font-semibold text-white truncate">${esc(p.title)}</h3>
              ${p.commentCount > 0 ? `<span class="text-xs text-gray-500">[${p.commentCount}]</span>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-600 flex-shrink-0">
            <span class="flex items-center gap-1">${esc(p.author.displayName || shortKey(p.author.pubkey))}${p.author.isAdmin ? ' <span class="text-[10px] px-1 py-0.5 rounded bg-bitcoin/20 text-bitcoin font-bold leading-none">ADMIN</span>' : ''}</span>
            <span>${timeAgo(p.createdAt)}</span>
          </div>
        </div>
      </a>
    `;
  }

  function paginationHtml(pg, slug, sort) {
    if (pg.totalPages <= 1) return '';
    let html = '<div class="flex items-center justify-center gap-2 mt-8">';
    if (pg.page > 1) html += `<button class="comm-btn-secondary comm-page" data-page="${pg.page - 1}">${t('prev')}</button>`;
    html += `<span class="text-sm text-gray-500">${pg.page} ${t('of')} ${pg.totalPages}</span>`;
    if (pg.page < pg.totalPages) html += `<button class="comm-btn-secondary comm-page" data-page="${pg.page + 1}">${t('next')}</button>`;
    html += '</div>';

    setTimeout(() => {
      document.querySelectorAll('.comm-page').forEach(btn => {
        btn.addEventListener('click', () => renderBoard(slug, parseInt(btn.dataset.page), sort));
      });
    }, 0);

    return html;
  }

  async function renderPost(slug, postId) {
    const data = await api(`/board/posts/${postId}`);
    if (data.error) return renderBoard(slug);

    const { post, comments } = data;
    const isOwner = currentUser && currentUser.pubkey === post.author.pubkey;
    const isAdmin = currentUser && currentUser.isAdmin;

    app.innerHTML = `
      <nav class="text-sm text-gray-500 mb-6">
        <a href="#" class="hover:text-bitcoin">${t('boards')}</a> /
        <a href="#${slug}" class="hover:text-bitcoin">${esc(slug)}</a> /
        <span class="text-white">${esc(post.title)}</span>
      </nav>
      <article class="mb-10">
        <div class="flex items-start gap-4">
          <div class="flex flex-col items-center gap-1 min-w-[48px]" id="post-vote">
            <button class="comm-vote${post.userVote === 1 ? ' comm-vote-active' : ''}" data-v="1">${svgUp}</button>
            <span class="text-sm font-mono font-semibold text-bitcoin" id="post-score">${post.voteScore}</span>
            <button class="comm-vote${post.userVote === -1 ? ' comm-vote-active' : ''}" data-v="-1">${svgDown}</button>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-xl sm:text-2xl font-bold text-white mb-2">${esc(post.title)}</h1>
            <div class="flex items-center gap-3 text-xs text-gray-500 mb-6">
              <span class="flex items-center gap-1.5">${authorAvatar(post.author)} <span class="${post.author.isAdmin ? 'text-bitcoin font-semibold' : ''}">${esc(post.author.displayName || shortKey(post.author.pubkey))}</span>${post.author.isAdmin ? ' <span class="text-[10px] px-1 py-0.5 rounded bg-bitcoin/20 text-bitcoin font-bold leading-none">ADMIN</span>' : ''}</span>
              <span>${timeAgo(post.createdAt)}</span>
              ${isOwner ? `<a href="#${slug}/${postId}/edit" class="hover:text-bitcoin">${t('edit')}</a>` : ''}
              ${isOwner || isAdmin ? `<button class="hover:text-red-400" id="delete-post-btn">${t('delete')}</button>` : ''}
              ${isAdmin ? `<button class="hover:text-bitcoin" id="pin-post-btn">${post.isPinned ? t('unpin') : t('pin')}</button>` : ''}
              ${currentUser ? `<button class="hover:text-bitcoin${post.isBookmarked ? ' text-bitcoin' : ''}" id="bookmark-btn">${svgBookmark} ${post.isBookmarked ? t('unbookmark') : t('bookmark')}</button>` : ''}
            </div>
            <div class="article-prose text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">${renderMarkdown(post.body)}</div>
            ${post.nostrEventId ? `<div class="mt-4 pt-3 border-t border-gray-800/30"><a href="https://njump.me/${post.nostrEventId}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 font-mono"><span>⚡</span> ${t('view_on_nostr')}</a></div>` : ''}
          </div>
        </div>
      </article>

      <div class="border-t border-gray-800/50 pt-8">
        <h2 class="text-base font-semibold text-white mb-4">${t('comments')} (${comments.length})</h2>
        ${currentUser ? `
          <div class="mb-6" id="comment-form-area">
            <textarea id="comment-input" class="comm-textarea" rows="2" placeholder="${t('write_comment')}"></textarea>
            <div class="flex justify-end mt-2"><button class="comm-btn-primary" id="submit-comment">${t('submit')}</button></div>
          </div>
        ` : ''}
        <div id="comments-list">
          ${comments.map(c => commentHtml(c, slug, postId)).join('')}
        </div>
      </div>
    `;

    // Vote handlers
    document.getElementById('post-vote').addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-v]');
      if (!btn || !currentUser) return;
      const value = parseInt(btn.dataset.v);
      const current = post.userVote;
      const newVal = current === value ? 0 : value;
      const res = await apiJson(`/board/posts/${postId}/vote`, { value: newVal });
      if (res.voteScore !== undefined) {
        document.getElementById('post-score').textContent = res.voteScore;
        post.userVote = res.userVote;
        btn.parentElement.querySelectorAll('.comm-vote').forEach(b => b.classList.remove('comm-vote-active'));
        if (res.userVote) btn.classList.add('comm-vote-active');
      }
    });

    // Delete handler
    const delBtn = document.getElementById('delete-post-btn');
    if (delBtn) delBtn.addEventListener('click', async () => {
      if (!confirm(t('confirm_delete'))) return;
      await api(`/board/posts/${postId}`, { method: 'DELETE' });
      location.hash = slug;
    });

    // Pin handler
    const pinBtn = document.getElementById('pin-post-btn');
    if (pinBtn) pinBtn.addEventListener('click', async () => {
      const res = await apiJson(`/board/posts/${postId}/pin`, {});
      pinBtn.textContent = res.isPinned ? t('unpin') : t('pin');
    });

    // Bookmark handler
    const bmBtn = document.getElementById('bookmark-btn');
    if (bmBtn && currentUser) {
      bmBtn.addEventListener('click', async () => {
        if (post.isBookmarked) {
          await api(`/board/posts/${postId}/bookmark`, { method: 'DELETE' });
          post.isBookmarked = false;
        } else {
          await apiJson(`/board/posts/${postId}/bookmark`, {});
          post.isBookmarked = true;
        }
        bmBtn.className = 'hover:text-bitcoin' + (post.isBookmarked ? ' text-bitcoin' : '');
        bmBtn.innerHTML = svgBookmark + ' ' + (post.isBookmarked ? t('unbookmark') : t('bookmark'));
      });
    }

    // Comment submit (optimistic update)
    const submitBtn = document.getElementById('submit-comment');
    if (submitBtn) submitBtn.addEventListener('click', async () => {
      const input = document.getElementById('comment-input');
      const body = input.value.trim();
      if (!body) return;
      const res = await apiJson(`/board/posts/${postId}/comments`, { body });
      if (res.commentId) {
        input.value = '';
        var newComment = {
          id: res.commentId, body: body, voteScore: 0,
          parentId: null, createdAt: Math.floor(Date.now() / 1000),
          author: { id: currentUser.id, pubkey: currentUser.pubkey, displayName: currentUser.displayName },
          userVote: null, replies: [],
        };
        var list = document.getElementById('comments-list');
        list.insertAdjacentHTML('beforeend', commentHtml(newComment, slug, postId));
        var countEl = list.parentElement.querySelector('h2');
        if (countEl) {
          var m = countEl.textContent.match(/\((\d+)\)/);
          if (m) countEl.innerHTML = countEl.innerHTML.replace('(' + m[1] + ')', '(' + (parseInt(m[1]) + 1) + ')');
        }
      }
    });

    // Reply & comment vote handlers (delegated)
    document.getElementById('comments-list').addEventListener('click', async (e) => {
      // Reply toggle
      const replyBtn = e.target.closest('.comm-reply-btn');
      if (replyBtn && currentUser) {
        const cId = replyBtn.dataset.cid;
        const existing = document.getElementById('reply-form-' + cId);
        if (existing) { existing.remove(); return; }
        const form = document.createElement('div');
        form.id = 'reply-form-' + cId;
        form.className = 'mt-3 ml-12';
        form.innerHTML = `
          <textarea class="comm-textarea" rows="2" placeholder="${t('write_reply')}"></textarea>
          <div class="flex justify-end mt-2"><button class="comm-btn-primary comm-submit-reply" data-cid="${cId}">${t('submit')}</button></div>
        `;
        replyBtn.parentElement.parentElement.appendChild(form);
        return;
      }

      // Submit reply (optimistic update)
      const submitReply = e.target.closest('.comm-submit-reply');
      if (submitReply) {
        const cId = submitReply.dataset.cid;
        const textarea = submitReply.previousElementSibling;
        const body = textarea.value.trim();
        if (!body) return;
        const res = await apiJson(`/board/posts/${postId}/comments`, { body, parentId: parseInt(cId) });
        if (res.commentId) {
          var newReply = {
            id: res.commentId, body: body, voteScore: 0,
            parentId: parseInt(cId), createdAt: Math.floor(Date.now() / 1000),
            author: { id: currentUser.id, pubkey: currentUser.pubkey, displayName: currentUser.displayName },
            userVote: null, replies: [],
          };
          var form = submitReply.parentElement;
          form.insertAdjacentHTML('beforebegin', commentHtml(newReply, slug, postId));
          form.remove();
        }
        return;
      }

      // Comment vote
      const voteBtn = e.target.closest('.comm-cv');
      if (voteBtn && currentUser) {
        const cId = parseInt(voteBtn.dataset.cid);
        const value = parseInt(voteBtn.dataset.v);
        const res = await apiJson(`/board/comments/${cId}/vote`, { value });
        if (res.voteScore !== undefined) {
          const scoreEl = document.getElementById('cscore-' + cId);
          if (scoreEl) scoreEl.textContent = res.voteScore;
        }
        return;
      }

      // Comment delete (optimistic update)
      const delCBtn = e.target.closest('.comm-del-comment');
      if (delCBtn) {
        if (!confirm(t('confirm_delete'))) return;
        await api(`/board/comments/${delCBtn.dataset.cid}`, { method: 'DELETE' });
        var commentEl = delCBtn.closest('.mb-2');
        if (commentEl) commentEl.remove();
        var countEl2 = document.getElementById('comments-list').parentElement.querySelector('h2');
        if (countEl2) {
          var m2 = countEl2.textContent.match(/\((\d+)\)/);
          if (m2) countEl2.innerHTML = countEl2.innerHTML.replace('(' + m2[1] + ')', '(' + Math.max(0, parseInt(m2[1]) - 1) + ')');
        }
      }
    });
  }

  function commentHtml(c, slug, postId) {
    const isOwner = currentUser && currentUser.pubkey === c.author.pubkey;
    const isAdmin = currentUser && currentUser.isAdmin;
    const indent = c.parentId ? 'ml-10 border-l border-gray-800/30 pl-4' : '';

    const isReply = !!c.parentId;
    const frame = isReply
      ? 'ml-8 pl-3 border-l-2 border-bitcoin/20'
      : 'p-3 rounded-lg border border-gray-800/40 bg-gray-900/20';

    const authorIsAdmin = c.author.isAdmin;
    const nameClass = authorIsAdmin ? 'font-semibold text-bitcoin' : 'font-semibold text-gray-400 hover:text-bitcoin';
    const adminBadge = authorIsAdmin ? '<span class="text-[10px] px-1 py-0.5 rounded bg-bitcoin/20 text-bitcoin font-bold leading-none">ADMIN</span>' : '';

    let html = `
      <div class="mb-2 ${frame}">
        <div class="flex items-start gap-2">
          <div class="flex flex-col items-center gap-0.5 min-w-[24px]">
            <button class="comm-cv comm-vote-sm" data-cid="${c.id}" data-v="1">${svgUp}</button>
            <span class="text-xs font-mono text-gray-500" id="cscore-${c.id}">${c.voteScore}</span>
            <button class="comm-cv comm-vote-sm" data-cid="${c.id}" data-v="-1">${svgDown}</button>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <a href="#user/${c.author.pubkey}" class="flex items-center gap-1 ${nameClass}">${authorAvatar(c.author)} ${esc(c.author.displayName || shortKey(c.author.pubkey))}</a>
              ${adminBadge}
              <span>${timeAgo(c.createdAt)}</span>
              ${!isReply && currentUser ? `<button class="hover:text-bitcoin comm-reply-btn" data-cid="${c.id}">${t('reply')}</button>` : ''}
              ${isOwner || isAdmin ? `<button class="hover:text-red-400 comm-del-comment" data-cid="${c.id}">${t('delete')}</button>` : ''}
            </div>
            <p class="text-sm text-gray-300 whitespace-pre-wrap">${esc(c.body)}</p>
          </div>
        </div>
    `;
    if (c.replies && c.replies.length > 0) {
      html += '<div class="mt-2">' + c.replies.map(r => commentHtml(r, slug, postId)).join('') + '</div>';
    }
    html += '</div>';
    return html;
  }

  async function renderNewPost(slug) {
    if (!currentUser) {
      app.innerHTML = `<p class="text-center py-20 text-gray-500">${t('login_required')}</p>`;
      return;
    }

    app.innerHTML = `
      <nav class="text-sm text-gray-500 mb-6">
        <a href="#" class="hover:text-bitcoin">${t('boards')}</a> /
        <a href="#${slug}" class="hover:text-bitcoin">${esc(slug)}</a> /
        <span class="text-white">${t('newPost')}</span>
      </nav>
      <div class="max-w-3xl">
        <input id="post-title" class="comm-input mb-4" placeholder="${t('title')}" maxlength="200">
        <textarea id="post-body" class="comm-textarea" rows="12" placeholder="${t('body')}" maxlength="10000"></textarea>
        <div class="flex gap-3 mt-4">
          <button class="comm-btn-primary" id="submit-post">${t('submit')}</button>
          <button class="comm-btn-secondary" onclick="location.hash='${slug}'">${t('cancel')}</button>
        </div>
      </div>
    `;

    document.getElementById('submit-post').addEventListener('click', async () => {
      const title = document.getElementById('post-title').value.trim();
      const body = document.getElementById('post-body').value.trim();
      if (!title || !body) return;
      const res = await apiJson(`/board/${slug}/posts`, { title, body });
      if (res.post) location.hash = `${slug}/${res.post.id}`;
    });
  }

  async function renderEditPost(slug, postId) {
    if (!currentUser) return;
    const data = await api(`/board/posts/${postId}`);
    if (data.error) return;
    const { post } = data;

    app.innerHTML = `
      <nav class="text-sm text-gray-500 mb-6">
        <a href="#" class="hover:text-bitcoin">${t('boards')}</a> /
        <a href="#${slug}" class="hover:text-bitcoin">${esc(slug)}</a> /
        <span class="text-white">${t('edit')}</span>
      </nav>
      <div class="max-w-3xl">
        <input id="post-title" class="comm-input mb-4" value="${esc(post.title)}" maxlength="200">
        <textarea id="post-body" class="comm-textarea" rows="12" maxlength="10000">${esc(post.body)}</textarea>
        <div class="flex gap-3 mt-4">
          <button class="comm-btn-primary" id="save-post">${t('submit')}</button>
          <button class="comm-btn-secondary" onclick="location.hash='${slug}/${postId}'">${t('cancel')}</button>
        </div>
      </div>
    `;

    document.getElementById('save-post').addEventListener('click', async () => {
      const title = document.getElementById('post-title').value.trim();
      const body = document.getElementById('post-body').value.trim();
      if (!title || !body) return;
      await api(`/board/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      location.hash = `${slug}/${postId}`;
    });
  }

  async function renderSearch() {
    const params = new URLSearchParams(location.hash.split('?')[1]);
    const q = params.get('q') || '';

    app.innerHTML = `
      <header class="mb-8">
        <a href="#" class="text-sm text-gray-500 hover:text-bitcoin mb-4 block">← ${t('boards')}</a>
        <h1 class="text-2xl font-bold text-white mb-4">${t('search')}</h1>
        <div class="flex gap-3">
          <input id="search-input" class="comm-input flex-1" value="${esc(q)}" placeholder="${t('search_placeholder')}">
          <button class="comm-btn-primary" id="do-search">${t('search')}</button>
        </div>
      </header>
      <div id="search-results"></div>
    `;

    const doSearch = async () => {
      const val = document.getElementById('search-input').value.trim();
      if (val.length < 2) return;
      location.hash = `search?q=${encodeURIComponent(val)}`;
      const data = await api(`/board/search?q=${encodeURIComponent(val)}`);
      const container = document.getElementById('search-results');
      if (!data.posts || data.posts.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-sm py-10 text-center">${t('no_results')}</p>`;
        return;
      }
      container.innerHTML = data.posts.map(p => `
        <a href="#${p.boardSlug}/${p.id}" class="block p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 bg-gray-900/20 hover:bg-gray-900/40 transition-all mb-3">
          <h3 class="text-base font-semibold text-white">${esc(p.title)}</h3>
          <p class="text-sm text-gray-500 mt-1">${esc(p.bodySnippet || '')}</p>
          <div class="text-xs text-gray-600 mt-2">${esc(p.author.displayName || shortKey(p.author.pubkey))} · ${timeAgo(p.createdAt)}</div>
        </a>
      `).join('');
    };

    document.getElementById('do-search').addEventListener('click', doSearch);
    document.getElementById('search-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    if (q) doSearch();
  }
