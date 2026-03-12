/**
 * community.js — SPA for learn.txid.uk/community/
 * Hash-based routing: #free, #free/123, #free/new, #search?q=..., #user/{pubkey}
 * v2 — avatars, admin badges, layout improvements
 */
(function () {
  'use strict';

  const API = 'https://api.txid.uk';
  const app = document.getElementById('community-app');
  if (!app) return;

  const LANG = app.dataset.lang || 'ko';

  // ─── i18n ───
  const T = {
    ko: {
      boards: '게시판', newPost: '글쓰기', login_required: 'Lightning 로그인이 필요합니다',
      title: '제목', body: '내용', submit: '등록', cancel: '취소',
      edit: '수정', delete: '삭제', pin: '고정', unpin: '고정 해제',
      comments: '댓글', reply: '답글', write_comment: '댓글을 작성하세요...',
      search: '검색', search_placeholder: '검색어를 입력하세요 (2자 이상)',
      no_posts: '아직 게시글이 없습니다.', no_results: '검색 결과가 없습니다.',
      newest: '최신순', votes: '추천순', most_comments: '댓글순',
      prev: '이전', next: '다음', page: '페이지', of: '/',
      confirm_delete: '정말 삭제하시겠습니까?', pinned: '고정',
      ago_s: '초 전', ago_m: '분 전', ago_h: '시간 전', ago_d: '일 전',
      by: '', write_reply: '답글을 작성하세요...',
      checkin: '출석체크', already_checked: '오늘 이미 출석했습니다.', checkin_success: '출석 완료!',
      admin_only_msg: '관리자만 글을 작성할 수 있습니다.',
      blocked_word: '부적절한 표현이 포함되어 있습니다.',
      my_posts: '작성 글', my_comments: '작성 댓글',
      voted_posts: '추천 글', voted_comments: '추천 댓글',
      bookmarks: '북마크', bookmark: '저장', unbookmark: '저장 해제',
      no_items: '항목이 없습니다.',
      my_info: '내 정보', nickname: '닉네임', nickname_ph: '닉네임 (최대 8자)',
      save: '저장', saved: '저장됨!',
      tab_posts: '게시글', tab_comments: '댓글',
      confirm_nickname: '닉네임을 변경하시겠습니까?', confirm_nickname_clear: '닉네임을 삭제하시겠습니까?',
    },
    en: {
      boards: 'Boards', newPost: 'New Post', login_required: 'Lightning login required',
      title: 'Title', body: 'Content', submit: 'Submit', cancel: 'Cancel',
      edit: 'Edit', delete: 'Delete', pin: 'Pin', unpin: 'Unpin',
      comments: 'Comments', reply: 'Reply', write_comment: 'Write a comment...',
      search: 'Search', search_placeholder: 'Search (min 2 chars)',
      no_posts: 'No posts yet.', no_results: 'No results found.',
      newest: 'Newest', votes: 'Top', most_comments: 'Most discussed',
      prev: 'Prev', next: 'Next', page: 'Page', of: '/',
      confirm_delete: 'Are you sure?', pinned: 'Pinned',
      ago_s: 's ago', ago_m: 'm ago', ago_h: 'h ago', ago_d: 'd ago',
      by: 'by ', write_reply: 'Write a reply...',
      checkin: 'Check in', already_checked: 'Already checked in today.', checkin_success: 'Checked in!',
      admin_only_msg: 'Only admins can post here.',
      blocked_word: 'Inappropriate language detected.',
      my_posts: 'My Posts', my_comments: 'My Comments',
      voted_posts: 'Upvoted Posts', voted_comments: 'Upvoted Comments',
      bookmarks: 'Bookmarks', bookmark: 'Bookmark', unbookmark: 'Remove Bookmark',
      no_items: 'No items found.',
      my_info: 'My Profile', nickname: 'Nickname', nickname_ph: 'Nickname (max 8)',
      save: 'Save', saved: 'Saved!',
      tab_posts: 'Posts', tab_comments: 'Comments',
      confirm_nickname: 'Change nickname?', confirm_nickname_clear: 'Clear nickname?',
    },
    ja: {
      boards: '掲示板', newPost: '新規投稿', login_required: 'Lightningログインが必要です',
      title: 'タイトル', body: '内容', submit: '投稿', cancel: 'キャンセル',
      edit: '編集', delete: '削除', pin: 'ピン留め', unpin: 'ピン解除',
      comments: 'コメント', reply: '返信', write_comment: 'コメントを書く...',
      search: '検索', search_placeholder: '検索 (2文字以上)',
      no_posts: 'まだ投稿がありません。', no_results: '結果が見つかりません。',
      newest: '新着順', votes: '人気順', most_comments: 'コメント順',
      prev: '前へ', next: '次へ', page: 'ページ', of: '/',
      confirm_delete: '本当に削除しますか？', pinned: 'ピン留め',
      ago_s: '秒前', ago_m: '分前', ago_h: '時間前', ago_d: '日前',
      by: '', write_reply: '返信を書く...',
      checkin: '出席チェック', already_checked: '今日はすでに出席済みです。', checkin_success: '出席完了！',
      admin_only_msg: '管理者のみ投稿できます。',
      blocked_word: '不適切な表現が含まれています。',
      my_posts: '自分の投稿', my_comments: '自分のコメント',
      voted_posts: '推薦した投稿', voted_comments: '推薦したコメント',
      bookmarks: 'ブックマーク', bookmark: 'ブックマーク', unbookmark: 'ブックマーク解除',
      no_items: '項目がありません。',
      my_info: 'マイページ', nickname: 'ニックネーム', nickname_ph: 'ニックネーム (最大8文字)',
      save: '保存', saved: '保存済み!',
      tab_posts: '投稿', tab_comments: 'コメント',
      confirm_nickname: 'ニックネームを変更しますか？', confirm_nickname_clear: 'ニックネームを削除しますか？',
    },
  };
  const t = (k) => (T[LANG] || T.ko)[k] || k;

  // ─── Helpers ───
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderMarkdown(text) {
    var html = esc(text);
    var blocks = [], codes = [];
    html = html.replace(/```\w*\n?([\s\S]*?)```/g, function(_, c) {
      blocks.push('<pre class="md-pre"><code>' + c.trim() + '</code></pre>');
      return '\uE000B' + (blocks.length - 1) + '\uE000';
    });
    html = html.replace(/`([^`\n]+)`/g, function(_, c) {
      codes.push('<code class="md-code">' + c + '</code>');
      return '\uE000C' + (codes.length - 1) + '\uE000';
    });
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, function(_, t, u) {
      return '<a href="' + u.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer" class="text-bitcoin hover:underline">' + t + '</a>';
    });
    html = html.replace(/^### (.+)$/gm, '<h4 class="md-h">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 class="md-h">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="md-h">$1</h2>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="md-quote">$1</blockquote>');
    html = html.replace(/^---$/gm, '<hr class="md-hr">');
    codes.forEach(function(c, i) { html = html.replace('\uE000C' + i + '\uE000', c); });
    blocks.forEach(function(b, i) { html = html.replace('\uE000B' + i + '\uE000', b); });
    return html;
  }

  function timeAgo(ts) {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return diff + t('ago_s');
    if (diff < 3600) return Math.floor(diff / 60) + t('ago_m');
    if (diff < 86400) return Math.floor(diff / 3600) + t('ago_h');
    if (diff < 604800) return Math.floor(diff / 86400) + t('ago_d');
    var d = new Date(ts * 1000);
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    if (d.getFullYear() === new Date().getFullYear()) return mm + '.' + dd;
    return String(d.getFullYear()).slice(2) + '.' + mm + '.' + dd;
  }

  function shortKey(pubkey) {
    return pubkey.slice(0, 6) + '..' + pubkey.slice(-4);
  }

  function boardName(b) {
    if (LANG === 'en') return b.nameEn;
    if (LANG === 'ja') return b.nameJa || b.nameEn;
    return b.nameKo;
  }

  async function api(path, opts) {
    if (!opts) opts = {};
    if (!opts.signal) {
      var ac = new AbortController();
      setTimeout(function(){ ac.abort(); }, 8000);
      opts.signal = ac.signal;
    }
    const res = await fetch(API + path, { credentials: 'include', ...opts });
    if (!res.ok) {
      var errData = {};
      try { errData = await res.json(); } catch {}
      var msg = errData.error || 'HTTP ' + res.status;
      if (msg === 'Inappropriate language detected') msg = t('blocked_word');
      throw new Error(msg);
    }
    return res.json();
  }

  async function apiJson(path, body) {
    return api(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  // ─── State (U-6: use txidAuth public API when available) ───
  let currentUser = null;

  async function checkAuth() {
    if (window.txidAuth) {
      currentUser = window.txidAuth.getUser();
      if (currentUser) return;
    }
    try {
      const data = await api('/auth/me');
      currentUser = data.authenticated ? data : null;
    } catch (e) {
      currentUser = null;
    }
  }

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

  // Avatar SVGs — fixed viewBox, scaled via width/height
  function avatarSvg(size, isAdmin) {
    if (isAdmin) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#2d1b00" stroke="#f7931a" stroke-width="2"/><circle cx="18" cy="15" r="5" fill="#f7931a"/><path d="M10 30c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#f7931a"/><path d="M11 8l3 4 4-4 4 4 3-4v5H11z" fill="#f7931a"/></svg>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#21262d" stroke="#30363d" stroke-width="1.5"/><circle cx="18" cy="14" r="5.5" fill="#6e7681"/><path d="M9 30c0-5 4-9 9-9s9 4 9 9" fill="#6e7681"/></svg>`;
  }
  function authorAvatar(author, size) { return avatarSvg(size || 20, author.isAdmin); }

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

  // ─── User Profile ───

  async function renderUserProfile(pubkey, tab) {
    var isOwner = currentUser && currentUser.pubkey === pubkey;

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

        <div class="p-5 rounded-xl border border-gray-800/50 bg-gray-900/30 mb-6">
          <div class="flex items-center gap-4${isOwner ? ' mb-4' : ''}">
            <div class="flex-shrink-0">${authorAvatar({isAdmin: profile.isAdmin}, 32)}</div>
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
          ` : ''}
        </div>

        <div class="flex gap-2 flex-wrap text-xs">
          <a href="#${base}/posts" class="comm-tab${tab === 'posts' ? ' comm-tab-active' : ''}">${t('tab_posts')}</a>
          <a href="#${base}/comments" class="comm-tab${tab === 'comments' ? ' comm-tab-active' : ''}">${t('tab_comments')}</a>
          ${isOwner ? `
            <a href="#${base}/voted-posts" class="comm-tab${tab === 'voted-posts' ? ' comm-tab-active' : ''}">${t('voted_posts')}</a>
            <a href="#${base}/voted-comments" class="comm-tab${tab === 'voted-comments' ? ' comm-tab-active' : ''}">${t('voted_comments')}</a>
            <a href="#${base}/bookmarks" class="comm-tab${tab === 'bookmarks' ? ' comm-tab-active' : ''}">${t('bookmarks')}</a>
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

  function myPagHtml(pg, hashBase) {
    if (pg.totalPages <= 1) return '';
    var html = '<div class="flex items-center justify-center gap-2 mt-8">';
    if (pg.page > 1) html += '<a href="#' + hashBase + '?page=' + (pg.page - 1) + '" class="comm-btn-secondary">' + t('prev') + '</a>';
    html += '<span class="text-sm text-gray-500">' + pg.page + ' ' + t('of') + ' ' + pg.totalPages + '</span>';
    if (pg.page < pg.totalPages) html += '<a href="#' + hashBase + '?page=' + (pg.page + 1) + '" class="comm-btn-secondary">' + t('next') + '</a>';
    html += '</div>';
    return html;
  }

  // ─── SVG Icons ───
  const svgUp = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  const svgDown = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
  const svgComment = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-1px"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  const svgSearch = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-2px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  const svgBookmark = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-2px"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>';

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
