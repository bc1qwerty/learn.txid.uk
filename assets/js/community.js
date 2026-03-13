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
      icons: '아이콘', select_icon: '적용', icon_locked: '미획득',
      icon_selected: '사용 중', icon_default: '기본',
      nostr_pubkey: 'Nostr 공개키', view_on_nostr: 'Nostr에서 보기', copy: '복사', copied: '복사됨',
      change_icon: '아이콘 변경', nostr_edit: '변경', nostr_reset: '기본값 복원', nostr_save: '저장', nostr_invalid: '올바른 npub 형식이 아닙니다',
      nip05: 'NIP-05 인증', nip05_desc: 'Nostr 인증 주소 @txid.uk',
      nip05_username: '유저네임', nip05_register: '등록', nip05_renew: '갱신',
      nip05_checking: '확인 중...', nip05_available: '사용 가능', nip05_taken: '이미 사용 중',
      nip05_pay: '결제 대기 중...', nip05_open_wallet: '지갑으로 열기',
      nip05_success: '등록 완료!', nip05_expires: '만료일',
      nip05_sats: 'sats/년', nip05_invalid: '3-16자, 영소문자/숫자/하이픈',
      nip05_expired: '만료됨', nip05_change: '변경', nip05_change_info: '30일에 1회 변경 가능',
      nip05_change_cooldown: '일 후 변경 가능',
      nip05_purchased: '구매일', nip05_plan: '연간 플랜',
      nip05_price_promo: '🔥 기간한정 할인 중!', nip05_price_original: '정가', nip05_price_now: '할인가',
      nip05_confirm: '결제 확인', nip05_confirm_msg: '아래 내용으로 등록합니다.',
      nip05_confirm_proceed: '결제 진행', nip05_not_purchased: '미구매',
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
      icons: 'Icons', select_icon: 'Apply', icon_locked: 'Locked',
      icon_selected: 'In Use', icon_default: 'Default',
      nostr_pubkey: 'Nostr Public Key', view_on_nostr: 'View on Nostr', copy: 'Copy', copied: 'Copied',
      change_icon: 'Change Icon', nostr_edit: 'Edit', nostr_reset: 'Reset to default', nostr_save: 'Save', nostr_invalid: 'Invalid npub format',
      nip05: 'NIP-05 Verification', nip05_desc: 'Nostr verification @txid.uk',
      nip05_username: 'Username', nip05_register: 'Register', nip05_renew: 'Renew',
      nip05_checking: 'Checking...', nip05_available: 'Available', nip05_taken: 'Taken',
      nip05_pay: 'Awaiting payment...', nip05_open_wallet: 'Open Wallet',
      nip05_success: 'Registered!', nip05_expires: 'Expires',
      nip05_sats: 'sats/year', nip05_invalid: '3-16 chars, lowercase/numbers/hyphens',
      nip05_expired: 'Expired', nip05_change: 'Change', nip05_change_info: 'Can change once every 30 days',
      nip05_change_cooldown: ' days until change available',
      nip05_purchased: 'Purchased', nip05_plan: 'Annual Plan',
      nip05_price_promo: '🔥 Limited-time discount!', nip05_price_original: 'Regular', nip05_price_now: 'Now',
      nip05_confirm: 'Confirm', nip05_confirm_msg: 'You are registering the following.',
      nip05_confirm_proceed: 'Proceed to Payment', nip05_not_purchased: 'Not purchased',
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
      icons: 'アイコン', select_icon: '適用', icon_locked: '未獲得',
      icon_selected: '使用中', icon_default: 'デフォルト',
      nostr_pubkey: 'Nostr公開鍵', view_on_nostr: 'Nostrで見る', copy: 'コピー', copied: 'コピー済み',
      change_icon: 'アイコン変更', nostr_edit: '変更', nostr_reset: 'デフォルトに戻す', nostr_save: '保存', nostr_invalid: '無効なnpub形式です',
      nip05: 'NIP-05認証', nip05_desc: 'Nostr認証アドレス @txid.uk',
      nip05_username: 'ユーザー名', nip05_register: '登録', nip05_renew: '更新',
      nip05_checking: '確認中...', nip05_available: '利用可能', nip05_taken: '使用中',
      nip05_pay: '支払い待ち...', nip05_open_wallet: 'ウォレットを開く',
      nip05_success: '登録完了！', nip05_expires: '有効期限',
      nip05_sats: 'sats/年', nip05_invalid: '3-16文字、小文字/数字/ハイフン',
      nip05_expired: '期限切れ', nip05_change: '変更', nip05_change_info: '30日に1回変更可能',
      nip05_change_cooldown: '日後に変更可能',
      nip05_purchased: '購入日', nip05_plan: '年間プラン',
      nip05_price_promo: '🔥 期間限定割引中！', nip05_price_original: '定価', nip05_price_now: '割引価格',
      nip05_confirm: '確認', nip05_confirm_msg: '以下の内容で登録します。',
      nip05_confirm_proceed: '支払いへ進む', nip05_not_purchased: '未購入',
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

  // ─── NIP-05 Registration ───
  function loadNip05Section() {
    var sec = document.getElementById('nip05-section');
    if (!sec) return;
    api('/nip05/my').then(function(data) {
      if (data.registered && data.status === 'active') {
        var paidDate = data.paidAt ? new Date(data.paidAt * 1000).toLocaleDateString() : '-';
        var expDate = new Date(data.expiresAt * 1000).toLocaleDateString();
        var changeHtml = '';
        if (data.canChangeUsername) {
          changeHtml = '<div class="mt-3 pt-3 border-t border-gray-800/30" id="nip05-change-area">' +
            '<div class="flex gap-2 items-center">' +
            '<input id="nip05-change-input" class="comm-input" style="max-width:120px;padding:4px 8px;font-size:.75rem" placeholder="' + t('nip05_username') + '" maxlength="16">' +
            '<span class="text-[10px] text-gray-500">@txid.uk</span>' +
            '<button id="nip05-change-btn" class="comm-btn" style="padding:4px 10px;font-size:.72rem">' + t('nip05_change') + '</button></div>' +
            '<div class="text-[10px] text-gray-600 mt-1">' + t('nip05_change_info') + '</div>' +
            '<div id="nip05-change-status" class="text-[10px] mt-1 h-4"></div></div>';
        } else if (data.usernameChangedAt) {
          var elapsed = Math.floor(Date.now() / 1000) - data.usernameChangedAt;
          var daysLeft = Math.ceil((30 * 86400 - elapsed) / 86400);
          changeHtml = '<div class="text-[10px] text-gray-600 mt-2">' + daysLeft + t('nip05_change_cooldown') + '</div>';
        }
        sec.innerHTML = '<div>' +
          '<span class="text-purple-400 text-xs font-bold">' + t('nip05') + '</span>' +
          '<div class="text-sm text-green-400 font-mono mt-1">✓ ' + esc(data.identifier) + '</div>' +
          '<div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[10px]">' +
            '<div class="text-gray-500">' + t('nip05_purchased') + '</div><div class="text-gray-300">' + paidDate + '</div>' +
            '<div class="text-gray-500">' + t('nip05_expires') + '</div><div class="text-gray-300">' + expDate + '</div>' +
            '<div class="text-gray-500">' + t('nip05_plan') + '</div><div class="text-gray-300">' + data.priceSats + ' ' + t('nip05_sats') + '</div>' +
          '</div>' +
          '<div class="mt-2">' +
            '<button id="nip05-renew" class="comm-btn-primary" style="padding:5px 12px;font-size:.75rem">' + t('nip05_renew') + '</button>' +
          '</div>' +
          '</div>' + changeHtml;
        document.getElementById('nip05-renew').addEventListener('click', function() { startNip05Renewal(sec); });
        if (data.canChangeUsername) {
          document.getElementById('nip05-change-btn').addEventListener('click', function() {
            var newName = document.getElementById('nip05-change-input').value.toLowerCase().trim();
            var cStatus = document.getElementById('nip05-change-status');
            var cBtn = document.getElementById('nip05-change-btn');
            if (!newName || newName.length < 3 || !/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(newName)) {
              cStatus.textContent = t('nip05_invalid'); cStatus.className = 'text-[10px] mt-1 h-4 text-red-400'; return;
            }
            cBtn.disabled = true; cBtn.textContent = '...';
            api('/nip05/username', {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: newName }),
            }).then(function(r) {
              loadNip05Section();
            }).catch(function(e) {
              cStatus.textContent = e.message || 'Error'; cStatus.className = 'text-[10px] mt-1 h-4 text-red-400';
              cBtn.disabled = false; cBtn.textContent = t('nip05_change');
            });
          });
        }
      } else if (data.registered && data.status === 'expired') {
        var expDate2 = data.expiresAt ? new Date(data.expiresAt * 1000).toLocaleDateString() : '-';
        sec.innerHTML = '<div>' +
          '<span class="text-purple-400 text-xs font-bold">' + t('nip05') + '</span>' +
          '<div class="text-sm text-red-400 font-mono mt-1">✗ ' + esc(data.identifier) + ' <span class="text-[10px]">(' + t('nip05_expired') + ')</span></div>' +
          '<div class="text-[10px] text-gray-500 mt-1">' + t('nip05_expires') + ': ' + expDate2 + '</div>' +
          nip05PriceHtml() +
          '<div class="mt-2">' +
            '<button id="nip05-renew" class="comm-btn-primary" style="padding:5px 12px;font-size:.75rem">' + t('nip05_renew') + '</button>' +
          '</div>' +
          '</div>';
        document.getElementById('nip05-renew').addEventListener('click', function() { startNip05Renewal(sec); });
      } else {
        showNip05RegisterForm(sec);
      }
    }).catch(function() { showNip05RegisterForm(sec); });
  }

  function nip05PriceHtml() {
    return '<div class="mt-2 p-2 rounded bg-gray-800/30 text-[10px]">' +
      '<div class="text-yellow-400 font-semibold">' + t('nip05_price_promo') + '</div>' +
      '<div class="mt-1 text-gray-400">' + t('nip05_price_original') + ': <span class="line-through">10,000 sats</span>/' + t('nip05_sats').replace('sats/', '') + '</div>' +
      '<div class="text-green-400 font-bold">' + t('nip05_price_now') + ': 5,000 sats/' + t('nip05_sats').replace('sats/', '') + '</div>' +
      '</div>';
  }

  function showNip05RegisterForm(sec) {
    sec.innerHTML = '<div><span class="text-purple-400 text-xs font-bold">' + t('nip05') + '</span>' +
      '<div class="text-[10px] text-gray-500 mt-0.5">' + t('nip05_desc') + '</div>' +
      '<div class="text-[10px] text-gray-600 mt-0.5">' + t('nip05_not_purchased') + '</div>' +
      nip05PriceHtml() +
      '<div class="flex gap-2 items-center mt-2">' +
      '<input id="nip05-input" class="comm-input" style="max-width:140px;padding:5px 8px;font-size:.78rem" placeholder="' + t('nip05_username') + '" maxlength="16">' +
      '<span class="text-xs text-gray-500">@txid.uk</span>' +
      '<button id="nip05-reg-btn" class="comm-btn-primary" style="padding:5px 12px;font-size:.75rem">' + t('nip05_register') + '</button>' +
      '</div>' +
      '<div id="nip05-status" class="text-[10px] mt-1 h-4"></div>' +
      '</div>';

    var input = document.getElementById('nip05-input');
    var btn = document.getElementById('nip05-reg-btn');
    var status = document.getElementById('nip05-status');

    btn.addEventListener('click', function() {
      var username = input.value.toLowerCase().trim();
      input.value = username;
      status.textContent = '';
      status.className = 'text-[10px] mt-1 h-4';

      if (username.length < 3 || !/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(username)) {
        status.textContent = t('nip05_invalid');
        status.className = 'text-[10px] mt-1 h-4 text-red-400';
        return;
      }

      // Confirmation step
      showNip05Confirm(sec, username);
    });
  }

  function showNip05Confirm(sec, username) {
    var identifier = username + '@txid.uk';
    sec.innerHTML = '<div><span class="text-purple-400 text-xs font-bold">' + t('nip05_confirm') + '</span>' +
      '<div class="text-[10px] text-gray-400 mt-1">' + t('nip05_confirm_msg') + '</div>' +
      '<div class="mt-2 p-3 rounded bg-gray-800/40 border border-gray-700/50">' +
        '<div class="text-sm text-white font-mono">' + esc(identifier) + '</div>' +
        '<div class="text-[10px] text-gray-400 mt-1">' + t('nip05_plan') + ' · 5,000 sats</div>' +
      '</div>' +
      '<div class="flex gap-2 mt-3">' +
        '<button id="nip05-confirm-btn" class="comm-btn-primary" style="padding:5px 14px;font-size:.75rem">⚡ ' + t('nip05_confirm_proceed') + '</button>' +
        '<button id="nip05-confirm-cancel" class="comm-btn" style="padding:5px 12px;font-size:.75rem">' + t('cancel') + '</button>' +
      '</div>' +
      '<div id="nip05-status" class="text-[10px] mt-1 h-4"></div>' +
      '</div>';

    document.getElementById('nip05-confirm-btn').addEventListener('click', function() {
      var cbtn = document.getElementById('nip05-confirm-btn');
      var status = document.getElementById('nip05-status');
      cbtn.disabled = true; cbtn.textContent = '...';
      api('/nip05/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username }),
      }).then(function(data) {
        showNip05Payment(sec, data);
      }).catch(function(e) {
        status.textContent = e.message || 'Error';
        status.className = 'text-[10px] mt-1 h-4 text-red-400';
        cbtn.disabled = false; cbtn.textContent = '⚡ ' + t('nip05_confirm_proceed');
      });
    });

    document.getElementById('nip05-confirm-cancel').addEventListener('click', function() {
      showNip05RegisterForm(sec);
    });
  }

  function showNip05Payment(sec, data) {
    var short = data.paymentRequest.slice(0, 40) + '…';
    sec.innerHTML = '<div><span class="text-purple-400 text-xs font-bold">' + t('nip05') + '</span>' +
      '<div class="text-sm text-white mt-1">' + esc(data.identifier) + ' — ' + data.amountSats + ' sats</div>' +
      '<div class="mt-2 p-2 rounded bg-gray-800/50 font-mono text-[10px] text-gray-400 break-all select-all cursor-pointer" id="nip05-invoice" title="Click to copy">' + esc(short) + '</div>' +
      '<div class="flex gap-2 mt-2">' +
      '<a href="lightning:' + esc(data.paymentRequest) + '" class="comm-btn-primary" style="padding:5px 12px;font-size:.75rem;text-decoration:none">⚡ ' + t('nip05_open_wallet') + '</a>' +
      '<button id="nip05-copy-inv" class="comm-btn" style="padding:5px 12px;font-size:.75rem">' + t('copy') + '</button>' +
      '</div>' +
      '<div id="nip05-poll-status" class="text-[10px] text-yellow-400 mt-2">⏳ ' + t('nip05_pay') + '</div>' +
      '</div>';

    document.getElementById('nip05-invoice').addEventListener('click', function() {
      navigator.clipboard.writeText(data.paymentRequest);
      this.textContent = t('copied');
      var el = this;
      setTimeout(function() { el.textContent = short; }, 1500);
    });
    document.getElementById('nip05-copy-inv').addEventListener('click', function() {
      navigator.clipboard.writeText(data.paymentRequest);
      this.textContent = t('copied');
      var btn = this;
      setTimeout(function() { btn.textContent = t('copy'); }, 1500);
    });

    // Poll payment status every 3 seconds
    var pollCount = 0;
    var pollTimer = setInterval(function() {
      pollCount++;
      if (pollCount > 200) { clearInterval(pollTimer); return; } // 10 min timeout
      api('/nip05/payment/' + data.paymentHash).then(function(r) {
        if (r.paid) {
          clearInterval(pollTimer);
          var ps = document.getElementById('nip05-poll-status');
          if (ps) { ps.textContent = '✓ ' + t('nip05_success'); ps.className = 'text-[10px] text-green-400 mt-2'; }
          setTimeout(function() { loadNip05Section(); }, 1500);
        }
      }).catch(function() {});
    }, 3000);
  }

  function startNip05Renewal(sec) {
    var btn = document.getElementById('nip05-renew');
    if (btn) { btn.disabled = true; btn.textContent = '...'; }
    api('/nip05/renew', { method: 'POST' }).then(function(data) {
      showNip05Payment(sec, data);
    }).catch(function(e) {
      if (btn) { btn.disabled = false; btn.textContent = t('nip05_renew'); }
      alert(e.message || 'Error');
    });
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

  // ─── Course Icon SVGs ───
  var COURSE_ICONS = {
    'bitcoin': 'M21.2 14.4c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.7-1.7-.4-.7 2.7c-.4-.1-.7-.2-1-.2l-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.3c0 0 .1 0 .2.1h-.2l-1.2 4.7c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.7 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.7c2.8.5 4.9.3 5.8-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.5zm-3.7 5.2c-.5 2-4 .9-5.1.7l.9-3.7c1.1.3 4.7.8 4.2 3zm.5-5.3c-.5 1.8-3.4.9-4.3.7l.8-3.3c1 .2 4 .7 3.5 2.6z',
    'austrian-economics': 'M18 8l-7 6h3v8h8v-8h3L18 8zm-2 12v-5h4v5h-4z',
    'libertarianism': 'M18 6c-.6 0-1 .4-1 1v2.3c-1.8.5-3 2-3 3.7v1l-2 8h12l-2-8v-1c0-1.7-1.2-3.2-3-3.7V7c0-.6-.4-1-1-1zm0 5c1.1 0 2 .9 2 2v.5l1.5 6.5h-7L14 13.5V13c0-1.1.9-2 2-2h2z',
    'thinkers': 'M12 26h12v2H12v-2zm2-2h8v2h-8v-2zm-2-2V12h2V10h2V8h4v2h2v2h2v10H12zm4-8v2h4v-2h-4z',
    'money-and-state': 'M8 26h20v2H8v-2zm1-2h18v2H9v-2zm0-12l9-5 9 5v2H9v-2zm3 4h2v8h-2v-8zm5 0h2v8h-2v-8zm5 0h2v8h-2v-8z',
    'bitcoin-technical': 'M18 6a12 12 0 010 24A12 12 0 0118 6zm0 3a9 9 0 100 18 9 9 0 000-18zm0 2.5a2 2 0 011.7 3L22 18l-2.3 3.5A2 2 0 0118 22.5a2 2 0 01-1.7-1L14 18l2.3-3.5A2 2 0 0118 11.5z',
    'bitcoin-sovereignty': 'M18 5l-9 5v7c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12v-7l-9-5zm0 3.2l6 3.3v5.5c0 4-2.7 7.9-6 9-3.3-1.1-6-5-6-9v-5.5l6-3.3z',
    'libertarianism-advanced': 'M12 6h3v4.6L12 14v12h3V16l3-3.4V6h2v20h-2V16.6L15 20v6h-3V14.6l3-3.4V8h-1v3l-2 2.3V28h10V6h-3v5l-2-2.3V6z',
    'austrian-economics-advanced': 'M10 28l8-20 8 20H10zm8-15.5L13.5 26h9L18 12.5zM17 20h2v3h-2v-3z',
  };

  function courseIconSvg(slug, size, earned) {
    var path = COURSE_ICONS[slug];
    if (!path) return avatarSvg(size, false);
    var bg = earned ? '#f7931a' : '#21262d';
    var stroke = earned ? '#e8850e' : '#30363d';
    var sym = earned ? '#fff' : '#6e7681';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="18" cy="18" r="17" fill="' + bg + '" stroke="' + stroke + '" stroke-width="1.5"/>'
      + '<path d="' + path + '" fill="' + sym + '"/></svg>';
  }

  // Avatar SVGs — fixed viewBox, scaled via width/height
  function avatarSvg(size, isAdmin) {
    if (isAdmin) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#2d1b00" stroke="#f7931a" stroke-width="2"/><circle cx="18" cy="15" r="5" fill="#f7931a"/><path d="M10 30c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="#f7931a"/><path d="M11 8l3 4 4-4 4 4 3-4v5H11z" fill="#f7931a"/></svg>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" fill="#21262d" stroke="#30363d" stroke-width="1.5"/><circle cx="18" cy="14" r="5.5" fill="#6e7681"/><path d="M9 30c0-5 4-9 9-9s9 4 9 9" fill="#6e7681"/></svg>`;
  }
  function authorAvatar(author, size) {
    size = size || 20;
    if (author.selectedIcon && COURSE_ICONS[author.selectedIcon]) {
      return courseIconSvg(author.selectedIcon, size, true);
    }
    return avatarSvg(size, author.isAdmin);
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

  var svgLock = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-1px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>';

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
