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
