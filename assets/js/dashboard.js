/**
 * dashboard.js — Admin Dashboard SPA for learn.txid.uk/dashboard/
 * Hash-based routing: # (overview), #analytics, #users, #content, #courses, #system
 */
(function () {
  'use strict';

  var API = 'https://api.txid.uk';
  var app = document.getElementById('dashboard-app');
  if (!app) return;

  var LANG = app.dataset.lang || 'ko';

  // ─── i18n ───
  var T = {
    ko: {
      dashboard: '대시보드', overview: '개요', analytics: '통계', users: '유저',
      content: '콘텐츠', courses: '코스', system: '시스템',
      total: '전체', today: '오늘', active_sessions: '활성 세션',
      posts: '게시글', comments: '댓글', new_users: '신규 가입',
      weekly_activity: '7일 활동', date: '날짜',
      login_required: '로그인이 필요합니다.', no_access: '관리자 권한이 필요합니다.',
      loading: '로딩 중...', error: '데이터를 불러올 수 없습니다.',
      search: '검색', search_ph: '닉네임 또는 pubkey 검색',
      admin: '관리자', user: '일반', set_admin: '관리자 지정', remove_admin: '관리자 해제',
      confirm_admin: '관리자 권한을 변경하시겠습니까?',
      pubkey: 'Pubkey', nickname: '닉네임', joined: '가입일', last_login: '마지막 로그인',
      post_count: '게시글', comment_count: '댓글',
      board: '게시판', recent_posts: '최근 게시글', recent_comments: '최근 댓글',
      delete: '삭제', pin: '고정', unpin: '해제', confirm_delete: '삭제하시겠습니까?',
      author: '작성자', title: '제목', body: '내용',
      course: '코스', completed: '완료', steps: '단계', learners: '학습자',
      total_pages_read: '총 읽은 페이지', active_learners: '활성 학습자',
      uptime: '가동 시간', db_size: 'DB 크기', node_ver: 'Node 버전',
      memory: '메모리', rss: 'RSS', heap: 'Heap',
      period: '기간', days: '일', visitors: '방문자', pageviews: '페이지뷰',
      pages: '인기 페이지', browsers: '브라우저', systems: 'OS', locations: '국가', referrers: '레퍼러',
      prev: '이전', next: '다음', page: '페이지',
      no_data: '데이터가 없습니다.',
      pinned: '고정됨',
    },
    en: {
      dashboard: 'Dashboard', overview: 'Overview', analytics: 'Analytics', users: 'Users',
      content: 'Content', courses: 'Courses', system: 'System',
      total: 'Total', today: 'Today', active_sessions: 'Active Sessions',
      posts: 'Posts', comments: 'Comments', new_users: 'New Users',
      weekly_activity: '7-Day Activity', date: 'Date',
      login_required: 'Login required.', no_access: 'Admin access required.',
      loading: 'Loading...', error: 'Failed to load data.',
      search: 'Search', search_ph: 'Search by nickname or pubkey',
      admin: 'Admin', user: 'User', set_admin: 'Set Admin', remove_admin: 'Remove Admin',
      confirm_admin: 'Change admin status?',
      pubkey: 'Pubkey', nickname: 'Nickname', joined: 'Joined', last_login: 'Last Login',
      post_count: 'Posts', comment_count: 'Comments',
      board: 'Board', recent_posts: 'Recent Posts', recent_comments: 'Recent Comments',
      delete: 'Delete', pin: 'Pin', unpin: 'Unpin', confirm_delete: 'Delete this?',
      author: 'Author', title: 'Title', body: 'Content',
      course: 'Course', completed: 'Completed', steps: 'Steps', learners: 'Learners',
      total_pages_read: 'Total Pages Read', active_learners: 'Active Learners',
      uptime: 'Uptime', db_size: 'DB Size', node_ver: 'Node Version',
      memory: 'Memory', rss: 'RSS', heap: 'Heap',
      period: 'Period', days: 'days', visitors: 'Visitors', pageviews: 'Pageviews',
      pages: 'Top Pages', browsers: 'Browsers', systems: 'OS', locations: 'Countries', referrers: 'Referrers',
      prev: 'Prev', next: 'Next', page: 'Page',
      no_data: 'No data available.',
      pinned: 'Pinned',
    },
  };

  function t(key) { return (T[LANG] || T.ko)[key] || (T.ko)[key] || key; }

  // ─── API Helper ───
  function api(path, opts) {
    opts = opts || {};
    var url = API + path;
    var fetchOpts = {
      method: opts.method || 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    };
    if (opts.body) fetchOpts.body = JSON.stringify(opts.body);
    return fetch(url, fetchOpts).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { return Promise.reject(e); });
      return r.json();
    });
  }

  // ─── Utilities ───
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div'); d.textContent = s; return d.innerHTML;
  }
  function shortPubkey(pk) { return pk ? pk.slice(0, 8) + '...' : ''; }
  function fmtDate(ts) {
    if (!ts) return '-';
    var d = new Date(ts * 1000);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function fmtTime(ts) {
    if (!ts) return '-';
    var d = new Date(ts * 1000);
    return fmtDate(ts) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function fmtBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }
  function fmtDuration(sec) {
    sec = Math.floor(sec);
    var d = Math.floor(sec / 86400);
    var h = Math.floor((sec % 86400) / 3600);
    var m = Math.floor((sec % 3600) / 60);
    if (d > 0) return d + 'd ' + h + 'h';
    if (h > 0) return h + 'h ' + m + 'm';
    return m + 'm';
  }
  function fmtTimeAgo(ts) {
    var diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return diff + (LANG === 'en' ? 's ago' : '초 전');
    if (diff < 3600) return Math.floor(diff / 60) + (LANG === 'en' ? 'm ago' : '분 전');
    if (diff < 86400) return Math.floor(diff / 3600) + (LANG === 'en' ? 'h ago' : '시간 전');
    return Math.floor(diff / 86400) + (LANG === 'en' ? 'd ago' : '일 전');
  }

  // ─── Auth Check ───
  var currentUser = null;

  function checkAuth() {
    var user = window.txidAuth && window.txidAuth.getUser();
    if (user) {
      currentUser = user;
      if (currentUser.isAdmin) {
        initDashboard();
      } else {
        app.innerHTML = '<div class="text-center py-20"><p class="text-lg text-red-400">' + t('no_access') + '</p></div>';
      }
    } else {
      app.innerHTML = '<div class="text-center py-20"><p class="text-lg text-gray-400">' + t('login_required') + '</p></div>';
      if (window.txidAuth) {
        window.txidAuth.onAuthChange(function (u) {
          if (!u) return;
          currentUser = u;
          if (currentUser.isAdmin) initDashboard();
          else app.innerHTML = '<div class="text-center py-20"><p class="text-lg text-red-400">' + t('no_access') + '</p></div>';
        });
      }
    }
  }

  // ─── Tab Navigation ───
  var TABS = ['overview', 'analytics', 'users', 'content', 'courses', 'system'];

  function getTab() {
    var h = location.hash.replace('#', '') || 'overview';
    return TABS.indexOf(h) >= 0 ? h : 'overview';
  }

  function initDashboard() {
    render();
    window.addEventListener('hashchange', render);
  }

  function render() {
    var tab = getTab();
    app.innerHTML = renderNav(tab) + '<div id="dash-content" class="mt-6">' + renderLoading() + '</div>';
    loadTab(tab);
  }

  function renderNav(active) {
    var html = '<div class="flex items-center justify-between mb-2"><h1 class="text-2xl font-bold text-white">' + t('dashboard') + '</h1></div>';
    html += '<nav class="flex gap-1 border-b border-gray-800 overflow-x-auto">';
    TABS.forEach(function (tab) {
      var cls = tab === active
        ? 'px-4 py-2 text-sm font-medium border-b-2 border-bitcoin text-bitcoin'
        : 'px-4 py-2 text-sm text-gray-400 hover:text-gray-200';
      html += '<a href="#' + tab + '" class="' + cls + ' whitespace-nowrap">' + t(tab) + '</a>';
    });
    html += '</nav>';
    return html;
  }

  function renderLoading() {
    return '<div class="text-center py-12 text-gray-500">' + t('loading') + '</div>';
  }

  function renderError() {
    return '<div class="text-center py-12 text-red-400">' + t('error') + '</div>';
  }

  function setContent(html) {
    var el = document.getElementById('dash-content');
    if (el) el.innerHTML = html;
  }

  // ─── CSS classes (site theme: gray-*, surface, bitcoin) ───
  var cardCls = 'bento-tile';
  var statCls = 'text-3xl font-bold text-white';
  var labelCls = 'text-sm text-gray-400 mt-1';
  var btnCls = 'px-3 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition';
  var btnDanger = 'px-3 py-1 text-xs rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 transition';
  var btnSuccess = 'px-3 py-1 text-xs rounded bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-900/40 transition';
  var tableCls = 'w-full text-sm text-left';
  var thCls = 'px-3 py-2 text-xs font-medium text-gray-500 uppercase border-b border-gray-800';
  var tdCls = 'px-3 py-2 border-b border-gray-800/50 text-gray-300';

  // ─── Tab Loaders ───

  function loadTab(tab) {
    switch (tab) {
      case 'overview': loadOverview(); break;
      case 'analytics': loadAnalytics(); break;
      case 'users': loadUsers(1, ''); break;
      case 'content': loadContent(); break;
      case 'courses': loadCourses(); break;
      case 'system': loadSystem(); break;
    }
  }

  // ─── Overview ───

  function loadOverview() {
    api('/admin/stats/overview').then(function (d) {
      var html = '<div class="bento-grid">';
      html += statCard(t('users'), d.users.total, '+' + d.users.today + ' ' + t('today'));
      html += statCard(t('posts'), d.posts.total, '+' + d.posts.today + ' ' + t('today'));
      html += statCard(t('comments'), d.comments.total, '+' + d.comments.today + ' ' + t('today'));
      html += statCard(t('active_sessions'), d.sessions.active, '');

      // Activity chart (full-width)
      if (d.activity && d.activity.length > 0) {
        html += '<div class="bento-tile" style="flex:0 0 100%">';
        html += '<h3 class="font-semibold mb-4 text-white">' + t('weekly_activity') + '</h3>';
        html += renderBarChart(d.activity);
        html += '</div>';
      }
      html += '</div>';
      setContent(html);
    }).catch(function () { setContent(renderError()); });
  }

  function statCard(label, value, sub) {
    return '<div class="bento-tile" style="flex:1 1 8rem;min-width:8rem">'
      + '<div class="' + statCls + '">' + value + '</div>'
      + '<div class="' + labelCls + '">' + label + '</div>'
      + (sub ? '<div class="text-xs text-bitcoin mt-2">' + sub + '</div>' : '')
      + '</div>';
  }

  function renderBarChart(data) {
    var maxVal = 1;
    data.forEach(function (d) { var v = d.posts + d.comments; if (v > maxVal) maxVal = v; });
    var html = '<div class="flex items-end gap-2" style="height:140px">';
    data.forEach(function (d) {
      var total = d.posts + d.comments;
      var pctPosts = Math.max((d.posts / maxVal) * 100, 0);
      var pctComments = Math.max((d.comments / maxVal) * 100, 0);
      var dateLabel = d.date.slice(5);
      html += '<div class="flex-1 flex flex-col items-center gap-1">';
      html += '<div class="w-full flex flex-col items-center justify-end" style="height:110px">';
      html += '<div class="text-xs text-gray-400 mb-1">' + total + '</div>';
      html += '<div class="w-full flex flex-col items-stretch">';
      html += '<div class="rounded-t" style="height:' + pctPosts + 'px;background:var(--color-bitcoin)" title="' + t('posts') + ': ' + d.posts + '"></div>';
      html += '<div class="rounded-b" style="height:' + pctComments + 'px;background:var(--color-bitcoin-dark);opacity:0.6" title="' + t('comments') + ': ' + d.comments + '"></div>';
      html += '</div></div>';
      html += '<div class="text-xs text-gray-500">' + dateLabel + '</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="flex gap-4 mt-3 text-xs text-gray-500">';
    html += '<span class="flex items-center gap-1"><span class="w-3 h-3 rounded inline-block" style="background:var(--color-bitcoin)"></span>' + t('posts') + '</span>';
    html += '<span class="flex items-center gap-1"><span class="w-3 h-3 rounded inline-block" style="background:var(--color-bitcoin-dark);opacity:0.6"></span>' + t('comments') + '</span>';
    html += '</div>';
    return html;
  }

  // ─── Analytics ───

  var analyticsPeriod = '7';

  function loadAnalytics() {
    // Period selector + placeholder cards
    var html = '<div class="flex gap-1 mb-4">';
    ['7', '30', '90'].forEach(function (p) {
      var cls = p === analyticsPeriod ? 'bg-bitcoin text-gray-900 font-semibold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700';
      html += '<button class="px-3 py-1 text-xs rounded ' + cls + '" data-period="' + p + '">' + p + t('days') + '</button>';
    });
    html += '</div>';
    html += '<div id="a-hits" class="' + cardCls + ' mb-4"><h3 class="font-semibold mb-3 text-white">' + t('pageviews') + '</h3><div class="text-gray-500 text-sm">' + t('loading') + '</div></div>';
    html += '<div id="a-pages" class="' + cardCls + ' mb-4"><h3 class="font-semibold mb-3 text-white">' + t('pages') + '</h3><div class="text-gray-500 text-sm">' + t('loading') + '</div></div>';
    html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">';
    html += '<div id="a-browsers" class="' + cardCls + '"><h3 class="font-semibold mb-3 text-white">' + t('browsers') + '</h3><div class="text-gray-500 text-sm">' + t('loading') + '</div></div>';
    html += '<div id="a-systems" class="' + cardCls + '"><h3 class="font-semibold mb-3 text-white">' + t('systems') + '</h3><div class="text-gray-500 text-sm">' + t('loading') + '</div></div>';
    html += '<div id="a-locations" class="' + cardCls + '"><h3 class="font-semibold mb-3 text-white">' + t('locations') + '</h3><div class="text-gray-500 text-sm">' + t('loading') + '</div></div>';
    html += '</div>';
    setContent(html);

    document.querySelectorAll('[data-period]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        analyticsPeriod = btn.dataset.period;
        loadAnalytics();
      });
    });

    // Fetch all types in parallel
    fetchAnalyticsCard('hits', 'a-hits', renderHitsChart);
    fetchAnalyticsCard('pages', 'a-pages', renderPagesTable);
    fetchAnalyticsCard('browsers', 'a-browsers', renderStatsBar);
    fetchAnalyticsCard('systems', 'a-systems', renderStatsBar);
    fetchAnalyticsCard('locations', 'a-locations', renderStatsBar);
  }

  function fetchAnalyticsCard(type, elId, renderFn) {
    api('/admin/analytics?period=' + analyticsPeriod + '&type=' + type)
      .then(function (data) {
        var el = document.getElementById(elId);
        if (!el) return;
        var title = el.querySelector('h3').outerHTML;
        el.innerHTML = title + renderFn(data);
      })
      .catch(function () {
        var el = document.getElementById(elId);
        if (el) {
          var title = el.querySelector('h3').outerHTML;
          el.innerHTML = title + '<div class="text-red-400 text-sm">' + t('error') + '</div>';
        }
      });
  }

  function renderHitsChart(data) {
    if (!data || !data.hits || !data.hits.length) return '<p class="text-gray-500 text-sm">' + t('no_data') + '</p>';
    // Aggregate daily totals across all paths
    var dayMap = {};
    data.hits.forEach(function (h) {
      if (!h.stats) return;
      h.stats.forEach(function (s) {
        if (!dayMap[s.day]) dayMap[s.day] = 0;
        dayMap[s.day] += (s.daily || 0);
      });
    });
    var days = Object.keys(dayMap).sort();
    if (!days.length) return '<p class="text-gray-500 text-sm">' + t('no_data') + '</p>';
    var maxVal = Math.max.apply(null, days.map(function (d) { return dayMap[d]; })) || 1;
    var totalViews = 0;
    days.forEach(function (d) { totalViews += dayMap[d]; });

    var html = '<div class="text-sm text-gray-400 mb-3">' + t('total') + ': <strong class="text-white">' + totalViews + '</strong></div>';
    html += '<div class="flex items-end gap-1" style="height:120px">';
    days.forEach(function (d) {
      var pct = Math.max((dayMap[d] / maxVal) * 100, 3);
      html += '<div class="flex-1 flex flex-col items-center">';
      html += '<div class="text-xs text-gray-400 mb-1">' + dayMap[d] + '</div>';
      html += '<div class="w-full rounded-t" style="height:' + pct + '%;background:var(--color-bitcoin)" title="' + d + ': ' + dayMap[d] + '"></div>';
      html += '<div class="text-xs text-gray-600 mt-1 truncate w-full text-center">' + d.slice(5) + '</div>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderPagesTable(data) {
    if (!data || !data.hits || !data.hits.length) return '<p class="text-gray-500 text-sm">' + t('no_data') + '</p>';
    var html = '<div class="overflow-x-auto max-h-80"><table class="' + tableCls + '"><thead><tr>';
    html += '<th class="' + thCls + '">Path</th>';
    html += '<th class="' + thCls + ' text-right">Views</th>';
    html += '</tr></thead><tbody>';
    data.hits.slice(0, 20).forEach(function (h) {
      html += '<tr><td class="' + tdCls + ' max-w-xs truncate text-xs">' + esc(h.path || '-') + '</td>';
      html += '<td class="' + tdCls + ' text-right font-mono">' + (h.count || 0) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function renderStatsBar(data) {
    if (!data || !data.stats || !data.stats.length) return '<p class="text-gray-500 text-sm">' + t('no_data') + '</p>';
    var total = 0;
    data.stats.forEach(function (s) { total += (s.count || 0); });
    var html = '';
    data.stats.slice(0, 8).forEach(function (s) {
      var pct = total > 0 ? ((s.count / total) * 100).toFixed(1) : 0;
      var barW = total > 0 ? Math.max((s.count / total) * 100, 1) : 0;
      html += '<div class="flex items-center gap-2 mb-2">';
      html += '<div class="w-20 text-xs text-gray-300 truncate">' + esc(s.name || '-') + '</div>';
      html += '<div class="flex-1 h-4 bg-gray-800 rounded overflow-hidden"><div class="h-full rounded" style="width:' + barW + '%;background:var(--color-bitcoin)"></div></div>';
      html += '<div class="text-xs text-gray-500 w-16 text-right">' + s.count + ' <span class="text-gray-600">(' + pct + '%)</span></div>';
      html += '</div>';
    });
    return html;
  }

  // ─── Users ───

  function loadUsers(page, search) {
    var html = '<div class="mb-4">';
    html += '<input type="text" id="user-search" placeholder="' + t('search_ph') + '" value="' + esc(search) + '" class="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 w-full max-w-sm focus:outline-none focus:border-bitcoin">';
    html += '</div>';
    html += '<div id="users-table">' + renderLoading() + '</div>';
    setContent(html);

    var searchInput = document.getElementById('user-search');
    var debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var val = searchInput.value.trim();
      debounceTimer = setTimeout(function () { fetchUsers(1, val); }, 300);
    });

    fetchUsers(page, search);
  }

  function fetchUsers(page, search) {
    var qs = '?page=' + page + '&limit=20';
    if (search) qs += '&search=' + encodeURIComponent(search);
    api('/admin/stats/users' + qs).then(function (d) {
      var el = document.getElementById('users-table');
      if (!el) return;
      el.innerHTML = renderUsersTable(d, search);
    }).catch(function () {
      var el = document.getElementById('users-table');
      if (el) el.innerHTML = renderError();
    });
  }

  function renderUsersTable(d, search) {
    if (!d.users.length) return '<p class="text-gray-500 py-8 text-center">' + t('no_data') + '</p>';
    var html = '<div class="overflow-x-auto"><table class="' + tableCls + '"><thead><tr>';
    html += '<th class="' + thCls + '">#</th>';
    html += '<th class="' + thCls + '">' + t('nickname') + '</th>';
    html += '<th class="' + thCls + '">' + t('pubkey') + '</th>';
    html += '<th class="' + thCls + ' text-center">' + t('post_count') + '</th>';
    html += '<th class="' + thCls + ' text-center">' + t('comment_count') + '</th>';
    html += '<th class="' + thCls + '">' + t('joined') + '</th>';
    html += '<th class="' + thCls + '">' + t('last_login') + '</th>';
    html += '<th class="' + thCls + ' text-center">' + t('admin') + '</th>';
    html += '</tr></thead><tbody>';

    d.users.forEach(function (u) {
      html += '<tr class="hover:bg-gray-800/50">';
      html += '<td class="' + tdCls + ' font-mono text-gray-500">' + u.id + '</td>';
      html += '<td class="' + tdCls + '">' + (esc(u.displayName) || '<span class="text-gray-600">-</span>') + '</td>';
      html += '<td class="' + tdCls + ' font-mono text-xs">' + shortPubkey(u.pubkey) + '</td>';
      html += '<td class="' + tdCls + ' text-center">' + u.postCount + '</td>';
      html += '<td class="' + tdCls + ' text-center">' + u.commentCount + '</td>';
      html += '<td class="' + tdCls + ' text-xs">' + fmtDate(u.createdAt) + '</td>';
      html += '<td class="' + tdCls + ' text-xs">' + fmtTimeAgo(u.lastLogin) + '</td>';
      html += '<td class="' + tdCls + ' text-center">';
      if (u.isAdmin) {
        html += '<button class="' + btnDanger + '" data-toggle-admin="' + u.id + '" data-admin="false">' + t('remove_admin') + '</button>';
      } else {
        html += '<button class="' + btnSuccess + '" data-toggle-admin="' + u.id + '" data-admin="true">' + t('set_admin') + '</button>';
      }
      html += '</td></tr>';
    });
    html += '</tbody></table></div>';

    // Pagination
    var pg = d.pagination;
    if (pg.totalPages > 1) {
      html += '<div class="flex justify-center gap-2 mt-4">';
      if (pg.page > 1) html += '<button class="' + btnCls + '" data-upage="' + (pg.page - 1) + '">' + t('prev') + '</button>';
      html += '<span class="text-sm text-gray-400 self-center">' + t('page') + ' ' + pg.page + ' / ' + pg.totalPages + '</span>';
      if (pg.page < pg.totalPages) html += '<button class="' + btnCls + '" data-upage="' + (pg.page + 1) + '">' + t('next') + '</button>';
      html += '</div>';
    }

    // Bind events after render
    setTimeout(function () {
      document.querySelectorAll('[data-toggle-admin]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!confirm(t('confirm_admin'))) return;
          var uid = parseInt(btn.dataset.toggleAdmin);
          var val = btn.dataset.admin === 'true';
          api('/admin/users/' + uid + '/admin', { method: 'PUT', body: { isAdmin: val } })
            .then(function () { fetchUsers(pg.page, search); })
            .catch(function (e) { alert(e.error || t('error')); });
        });
      });
      document.querySelectorAll('[data-upage]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          fetchUsers(parseInt(btn.dataset.upage), search);
        });
      });
    }, 0);

    return html;
  }

  // ─── Content ───

  function loadContent() {
    api('/admin/stats/content').then(function (d) {
      var html = '';

      // Board stats
      html += '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">';
      d.boards.forEach(function (b) {
        var name = LANG === 'en' ? b.nameEn : (LANG === 'ja' ? b.nameJa : b.nameKo);
        html += '<div class="' + cardCls + '">';
        html += '<div class="font-semibold">' + esc(name) + ' <span class="text-gray-500 text-xs">' + b.slug + '</span></div>';
        html += '<div class="flex gap-4 mt-2 text-sm text-gray-400">';
        html += '<span>' + t('posts') + ': <strong class="text-gray-200">' + b.postCount + '</strong></span>';
        html += '<span>' + t('comments') + ': <strong class="text-gray-200">' + b.commentCount + '</strong></span>';
        html += '</div></div>';
      });
      html += '</div>';

      // Recent posts
      html += '<div class="' + cardCls + ' mb-6">';
      html += '<h3 class="font-semibold mb-3">' + t('recent_posts') + '</h3>';
      if (d.recentPosts.length) {
        html += '<div class="overflow-x-auto"><table class="' + tableCls + '"><thead><tr>';
        html += '<th class="' + thCls + '">#</th>';
        html += '<th class="' + thCls + '">' + t('board') + '</th>';
        html += '<th class="' + thCls + '">' + t('title') + '</th>';
        html += '<th class="' + thCls + '">' + t('author') + '</th>';
        html += '<th class="' + thCls + '">' + t('date') + '</th>';
        html += '<th class="' + thCls + '"></th>';
        html += '</tr></thead><tbody>';
        d.recentPosts.forEach(function (p) {
          html += '<tr class="hover:bg-gray-800/50">';
          html += '<td class="' + tdCls + ' font-mono text-gray-500">' + p.id + '</td>';
          html += '<td class="' + tdCls + ' text-xs">' + p.boardSlug + '</td>';
          html += '<td class="' + tdCls + '">';
          if (p.isPinned) html += '<span class="text-bitcoin text-xs mr-1">[' + t('pinned') + ']</span>';
          html += esc(p.title) + '</td>';
          html += '<td class="' + tdCls + ' text-xs">' + (esc(p.authorName) || shortPubkey(p.authorPubkey)) + '</td>';
          html += '<td class="' + tdCls + ' text-xs">' + fmtTimeAgo(p.createdAt) + '</td>';
          html += '<td class="' + tdCls + ' text-right whitespace-nowrap">';
          html += '<button class="' + btnCls + ' mr-1" data-pin-post="' + p.id + '">' + (p.isPinned ? t('unpin') : t('pin')) + '</button>';
          html += '<button class="' + btnDanger + '" data-del-post="' + p.id + '">' + t('delete') + '</button>';
          html += '</td></tr>';
        });
        html += '</tbody></table></div>';
      } else {
        html += '<p class="text-gray-500">' + t('no_data') + '</p>';
      }
      html += '</div>';

      // Recent comments
      html += '<div class="' + cardCls + '">';
      html += '<h3 class="font-semibold mb-3">' + t('recent_comments') + '</h3>';
      if (d.recentComments.length) {
        html += '<div class="overflow-x-auto"><table class="' + tableCls + '"><thead><tr>';
        html += '<th class="' + thCls + '">#</th>';
        html += '<th class="' + thCls + '">' + t('body') + '</th>';
        html += '<th class="' + thCls + '">' + t('posts') + '</th>';
        html += '<th class="' + thCls + '">' + t('author') + '</th>';
        html += '<th class="' + thCls + '">' + t('date') + '</th>';
        html += '<th class="' + thCls + '"></th>';
        html += '</tr></thead><tbody>';
        d.recentComments.forEach(function (c) {
          html += '<tr class="hover:bg-gray-800/50">';
          html += '<td class="' + tdCls + ' font-mono text-gray-500">' + c.id + '</td>';
          html += '<td class="' + tdCls + ' max-w-xs truncate">' + esc(c.bodyPreview) + '</td>';
          html += '<td class="' + tdCls + ' text-xs max-w-[120px] truncate">' + esc(c.postTitle) + '</td>';
          html += '<td class="' + tdCls + ' text-xs">' + (esc(c.authorName) || shortPubkey(c.authorPubkey)) + '</td>';
          html += '<td class="' + tdCls + ' text-xs">' + fmtTimeAgo(c.createdAt) + '</td>';
          html += '<td class="' + tdCls + ' text-right">';
          html += '<button class="' + btnDanger + '" data-del-comment="' + c.id + '">' + t('delete') + '</button>';
          html += '</td></tr>';
        });
        html += '</tbody></table></div>';
      } else {
        html += '<p class="text-gray-500">' + t('no_data') + '</p>';
      }
      html += '</div>';

      setContent(html);

      // Bind actions
      document.querySelectorAll('[data-del-post]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!confirm(t('confirm_delete'))) return;
          api('/admin/posts/' + btn.dataset.delPost, { method: 'DELETE' })
            .then(function () { loadContent(); })
            .catch(function (e) { alert(e.error || t('error')); });
        });
      });
      document.querySelectorAll('[data-pin-post]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          api('/admin/posts/' + btn.dataset.pinPost + '/pin', { method: 'PUT' })
            .then(function () { loadContent(); })
            .catch(function (e) { alert(e.error || t('error')); });
        });
      });
      document.querySelectorAll('[data-del-comment]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!confirm(t('confirm_delete'))) return;
          api('/admin/comments/' + btn.dataset.delComment, { method: 'DELETE' })
            .then(function () { loadContent(); })
            .catch(function (e) { alert(e.error || t('error')); });
        });
      });
    }).catch(function () { setContent(renderError()); });
  }

  // ─── Courses ───

  function loadCourses() {
    api('/admin/stats/courses').then(function (d) {
      var html = '<div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">';
      html += statCard(t('total_pages_read'), d.totalPagesRead, '');
      html += statCard(t('active_learners'), d.activeLearners, '');
      html += '</div>';

      html += '<div class="' + cardCls + '">';
      html += '<div class="overflow-x-auto"><table class="' + tableCls + '"><thead><tr>';
      html += '<th class="' + thCls + '">' + t('course') + '</th>';
      html += '<th class="' + thCls + ' text-center">' + t('steps') + '</th>';
      html += '<th class="' + thCls + ' text-center">' + t('completed') + '</th>';
      html += '</tr></thead><tbody>';
      d.courses.forEach(function (c) {
        html += '<tr class="hover:bg-gray-800/50">';
        html += '<td class="' + tdCls + '">' + esc(c.title) + ' <span class="text-gray-500 text-xs">' + c.slug + '</span></td>';
        html += '<td class="' + tdCls + ' text-center">' + c.totalSteps + '</td>';
        html += '<td class="' + tdCls + ' text-center font-mono">' + c.completedUsers + '</td>';
        html += '</tr>';
      });
      html += '</tbody></table></div></div>';
      setContent(html);
    }).catch(function () { setContent(renderError()); });
  }

  // ─── System ───

  function loadSystem() {
    api('/admin/stats/system').then(function (d) {
      var mem = d.memoryUsage || {};
      var html = '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
      html += statCard(t('uptime'), fmtDuration(d.uptime), '');
      html += statCard(t('db_size'), fmtBytes(d.dbSizeBytes), '');
      html += statCard(t('node_ver'), d.nodeVersion, '');
      html += statCard(t('memory'), fmtBytes(mem.heapUsed || 0), 'RSS: ' + fmtBytes(mem.rss || 0));
      html += '</div>';

      // Health check
      html += '<div class="' + cardCls + ' mt-6" id="health-result">' + renderLoading() + '</div>';
      setContent(html);

      fetch(API + '/health').then(function (r) { return r.json(); }).then(function (h) {
        var el = document.getElementById('health-result');
        if (el) el.innerHTML = '<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span><span class="text-emerald-400 font-semibold">API OK</span><span class="text-gray-500 text-sm ml-2">' + new Date(h.timestamp * 1000).toLocaleString() + '</span></div>';
      }).catch(function () {
        var el = document.getElementById('health-result');
        if (el) el.innerHTML = '<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span><span class="text-red-400 font-semibold">API DOWN</span></div>';
      });
    }).catch(function () { setContent(renderError()); });
  }

  // ─── Init ───

  // Wait for txidAuth SDK to be ready
  if (window.txidAuth && window.txidAuth.getUser()) {
    checkAuth();
  } else {
    // SDK loads async — poll until ready, then check auth
    var initTimer = setInterval(function () {
      if (window.txidAuth) {
        clearInterval(initTimer);
        checkAuth();
      }
    }, 200);
    // Stop polling after 5s
    setTimeout(function () { clearInterval(initTimer); if (!currentUser) checkAuth(); }, 5000);
  }
})();
