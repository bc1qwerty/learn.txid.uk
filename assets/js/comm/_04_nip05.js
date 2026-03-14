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
      '<div class="mt-1 text-[9px] text-gray-500">' + t('nip05_premium_link') + '</div>' +
      '</div>';
  }

  function showNip05RegisterForm(sec) {
    sec.innerHTML = '<div><span class="text-purple-400 text-xs font-bold">' + t('nip05') + '</span>' +
      '<div class="text-[10px] text-gray-500 mt-0.5">' + t('nip05_desc') + '</div>' +
      '<div class="text-[10px] text-gray-600 mt-0.5">' + t('nip05_not_purchased') + '</div>' +
      nip05PriceHtml() +
      '<div class="flex gap-2 items-center mt-2">' +
      '<input id="nip05-input" class="comm-input" style="max-width:140px;padding:5px 8px;font-size:.78rem" placeholder="' + t('nip05_username') + '" minlength="5" maxlength="16">' +
      '<span class="text-xs text-gray-500">@txid.uk</span>' +
      '<button id="nip05-reg-btn" class="comm-btn-primary" style="padding:5px 12px;font-size:.75rem">' + t('nip05_register') + '</button>' +
      '</div>' +
      '<div id="nip05-status" class="text-[10px] mt-1 h-4"></div>' +
      '<div class="mt-2 text-[9px] text-gray-500">' + t('nip05_premium_link') + '</div>' +
      '</div>';

    var input = document.getElementById('nip05-input');
    var btn = document.getElementById('nip05-reg-btn');
    var status = document.getElementById('nip05-status');

    btn.addEventListener('click', function() {
      var username = input.value.toLowerCase().trim();
      input.value = username;
      status.textContent = '';
      status.className = 'text-[10px] mt-1 h-4';

      if (username.length < 5 || !/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(username)) {
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
        '<div class="text-[10px] text-gray-400 mt-1">' + t('nip05_plan') + ' · <span class="line-through text-gray-600">10,000</span> <span class="text-green-400 font-bold">5,000 sats</span></div>' +
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
    sec.innerHTML = '<div><span class="text-purple-400 text-xs font-bold">' + t('nip05_confirm') + '</span>' +
      '<div class="text-[10px] text-gray-400 mt-1">' + t('nip05_confirm_msg') + '</div>' +
      '<div class="mt-2 p-3 rounded bg-gray-800/40 border border-gray-700/50">' +
        '<div class="text-sm text-white">' + t('nip05_renew') + ' (+1' + t('nip05_sats') + ')</div>' +
        '<div class="text-[10px] text-gray-400 mt-1"><span class="line-through text-gray-600">10,000</span> <span class="text-green-400 font-bold">5,000 sats</span></div>' +
      '</div>' +
      '<div class="flex gap-2 mt-3">' +
        '<button id="nip05-renew-confirm" class="comm-btn-primary" style="padding:5px 14px;font-size:.75rem">⚡ ' + t('nip05_confirm_proceed') + '</button>' +
        '<button id="nip05-renew-cancel" class="comm-btn" style="padding:5px 12px;font-size:.75rem">' + t('cancel') + '</button>' +
      '</div>' +
      '<div id="nip05-status" class="text-[10px] mt-1 h-4"></div>' +
      '</div>';

    document.getElementById('nip05-renew-confirm').addEventListener('click', function() {
      var cbtn = document.getElementById('nip05-renew-confirm');
      var status = document.getElementById('nip05-status');
      cbtn.disabled = true; cbtn.textContent = '...';
      api('/nip05/renew', { method: 'POST' }).then(function(data) {
        showNip05Payment(sec, data);
      }).catch(function(e) {
        status.textContent = e.message || 'Error';
        status.className = 'text-[10px] mt-1 h-4 text-red-400';
        cbtn.disabled = false; cbtn.textContent = '⚡ ' + t('nip05_confirm_proceed');
      });
    });

    document.getElementById('nip05-renew-cancel').addEventListener('click', function() {
      loadNip05Section();
    });
  }
