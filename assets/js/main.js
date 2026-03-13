// ── Safe localStorage helpers ──
function safeGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }

// ── Theme Toggle ──
var THEME_COLORS = { dark: '#09090b', light: '#fafafa' };
var html = document.documentElement;

// 시스템 설정 감지 (prefers-color-scheme 지원)
var savedTheme = safeGet('theme');
if (savedTheme !== 'dark' && savedTheme !== 'light') {
    savedTheme = 'dark';
}
html.setAttribute('data-theme', savedTheme);
(function() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLORS[savedTheme];
})();

function updateThemeBtn() {
    var isDark = html.getAttribute('data-theme') !== 'light';
    var btn = document.getElementById('theme-btn');
    if (btn) {
        btn.innerHTML = isDark
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        var lang = document.documentElement.lang || 'ko';
        var labels = {
            ko: isDark ? '라이트 모드로 전환' : '다크 모드로 전환',
            en: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            ja: isDark ? 'ライトモードへ' : 'ダークモードへ'
        };
        btn.title = labels[lang] || labels.en;
    }
}

function toggleTheme() {
    document.body.classList.add('theme-transition');
    var current = html.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    safeSet('theme', next);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLORS[next];
    updateThemeBtn();
    setTimeout(function() {
        document.body.classList.remove('theme-transition');
    }, 400);
}

// Lang dropdown toggle
document.addEventListener('click', function(e) {
    var langMenu = document.getElementById('lang-menu');
    var langBtn = document.getElementById('lang-btn');
    if (langBtn && langBtn === e.target) {
        langMenu.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', langMenu.classList.contains('open'));
        return;
    }
    if (langMenu && !e.target.closest('.lang-dropdown')) {
        langMenu.classList.remove('open');
        if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
    }
});
// Lang menu item clicks
document.querySelectorAll('#lang-menu button[data-lang]').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(btn.dataset.lang); });
});
// Mobile lang buttons
document.querySelectorAll('.mobile-lang-row button[data-lang]').forEach(function(btn) {
    btn.addEventListener('click', function() { setLang(btn.dataset.lang); });
});
// Theme button
var themeBtn = document.getElementById('theme-btn');
if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
// Mobile theme toggle
var mobileThemeBtn = document.getElementById('mobileThemeToggle');
if (mobileThemeBtn) mobileThemeBtn.addEventListener('click', toggleTheme);
// PWA install (bottom banner only — header button removed)

// Init theme button (icon + title)
updateThemeBtn();

// ── Throttle Utility ──
function throttle(fn, delay) {
    var last = 0;
    return function() {
        var now = Date.now();
        if (now - last >= delay) {
            last = now;
            fn.apply(this, arguments);
        }
    };
}

// ── Sidebar Toggle (Left + Right) ──
(function() {
    var overlay = document.getElementById('sidebarOverlay');
    var isDesktop = function() { return window.innerWidth >= 1200; };

    // --- Left Sidebar ---
    var leftToggle = document.getElementById('sidebarToggle');
    var leftColumn = document.getElementById('sidebarColumn');

    function setLeft(collapsed) {
        if (!leftColumn) return;
        if (collapsed) {
            leftColumn.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
        } else {
            leftColumn.classList.remove('collapsed');
            document.body.classList.remove('sidebar-collapsed');
        }
        if (leftToggle) leftToggle.setAttribute('aria-expanded', String(!collapsed));
    }

    // --- Right Sidebar ---
    var rightToggle = document.getElementById('sidebarRightToggle');
    var rightColumn = document.getElementById('sidebarRightColumn');

    var rightTogglePortal = null;

    function setRight(collapsed) {
        if (!rightColumn) return;
        var ICON_OPEN   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>';
        var ICON_CLOSED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>';
        if (collapsed) {
            rightColumn.classList.add('collapsed');
            document.body.classList.add('sidebar-right-collapsed');
            if (rightToggle) rightToggle.innerHTML = ICON_OPEN;
            // overlay 비활성화
            if (overlay) { overlay.classList.remove('active'); overlay.style.display = ''; }
            document.body.style.overflow = '';
            // transform 컨텍스트 탈출: 토글 버튼을 body로 이동
            if (rightToggle && !rightTogglePortal) {
                rightTogglePortal = document.createElement('div');
                rightTogglePortal.id = 'right-toggle-portal';
                rightTogglePortal.style.cssText = 'position:fixed;right:0;top:5rem;z-index:200';
                var cloned = rightToggle.cloneNode(true);
                cloned.addEventListener('click', function() { setRight(false); safeSet('sidebar-right-state', 'open'); });
                rightTogglePortal.appendChild(cloned);
                document.body.appendChild(rightTogglePortal);
                rightToggle.style.display = 'none';
            }
        } else {
            rightColumn.classList.remove('collapsed');
            document.body.classList.remove('sidebar-right-collapsed');
            if (rightToggle) rightToggle.innerHTML = ICON_CLOSED;
            // overlay 활성화 (모바일만 스크롤 잠금)
            if (overlay) { overlay.style.display = 'block'; overlay.classList.add('active'); }
            if (!isDesktop()) document.body.style.overflow = 'hidden';
            // 원위치 복구
            if (rightTogglePortal) {
                rightTogglePortal.remove();
                rightTogglePortal = null;
                if (rightToggle) rightToggle.style.display = '';
            }
        }
        if (rightToggle) rightToggle.setAttribute('aria-expanded', String(!collapsed));
    }

    // --- Close any open mobile sidebar ---
    function closeMobileSidebars() {
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // --- Init states ---
    var savedLeft = safeGet('sidebar-state');
    var savedRight = safeGet('sidebar-right-state');
    if (isDesktop()) {
        setLeft(savedLeft !== 'open');
        setRight(savedRight !== 'open');
    } else {
        setLeft(true);
        setRight(true);
    }

    // --- Avatar click ---
    var avatar = document.getElementById('sidebarAvatar');
    var avatarOverlay = document.getElementById('avatarOverlay');
    if (avatar && leftColumn) {
        avatar.addEventListener('click', function() {
            if (leftColumn.classList.contains('collapsed')) {
                setLeft(false);
                if (isDesktop()) {
                    safeSet('sidebar-state', 'open');
                } else {
                    if (overlay) overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            } else if (avatarOverlay) {
                avatarOverlay.classList.add('active');
                avatar.setAttribute('aria-expanded', 'true');
            }
        });
    }
    if (avatar) {
        avatar.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                avatar.click();
            }
        });
    }
    if (avatarOverlay) {
        avatarOverlay.addEventListener('click', function() {
            avatarOverlay.classList.remove('active');
            if (avatar) avatar.setAttribute('aria-expanded', 'false');
        });
    }

    // --- Left toggle click ---
    if (leftToggle && leftColumn) {
        leftToggle.addEventListener('click', function() {
            var wasCollapsed = leftColumn.classList.contains('collapsed');
            setLeft(!wasCollapsed);
            if (isDesktop()) {
                safeSet('sidebar-state', wasCollapsed ? 'open' : 'collapsed');
            } else {
                if (wasCollapsed) {
                    if (overlay) overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    closeMobileSidebars();
                }
            }
        });
    }

    // --- Right toggle click ---
    if (rightToggle && rightColumn) {
        rightToggle.addEventListener('click', function() {
            var wasCollapsed = rightColumn.classList.contains('collapsed');
            setRight(!wasCollapsed);
            if (isDesktop()) {
                safeSet('sidebar-right-state', wasCollapsed ? 'open' : 'collapsed');
            } else {
                if (wasCollapsed) {
                    if (overlay) overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    closeMobileSidebars();
                }
            }
        });
    }

    // --- Overlay click closes both ---
    if (overlay) {
        overlay.addEventListener('click', function() {
            if (leftColumn && !leftColumn.classList.contains('collapsed') && !isDesktop()) {
                setLeft(true);
            }
            if (rightColumn && !rightColumn.classList.contains('collapsed')) {
                setRight(true);
            }
            closeMobileSidebars();
        });
    }

    // --- Escape closes mobile sidebars ---
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !isDesktop()) {
            var changed = false;
            if (leftColumn && !leftColumn.classList.contains('collapsed')) {
                setLeft(true); changed = true;
            }
            if (rightColumn && !rightColumn.classList.contains('collapsed')) {
                setRight(true); changed = true;
            }
            if (changed) closeMobileSidebars();
        }
    });

    // --- Resize: collapse mobile sidebars ---
    window.addEventListener('resize', throttle(function() {
        if (!isDesktop()) {
            var changed = false;
            if (leftColumn && !leftColumn.classList.contains('collapsed')) {
                setLeft(true); changed = true;
            }
            if (rightColumn && !rightColumn.classList.contains('collapsed')) {
                setRight(true); changed = true;
            }
            if (changed) closeMobileSidebars();
        }
    }, 150));
})();

// ── Intersection Observer — Fade In on Scroll ──
var fadeSections = document.querySelectorAll('.fade-section');
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
fadeSections.forEach(function(section) { observer.observe(section); });

// ── Command Palette ──
(function() {
    var overlay = document.getElementById('cmdPalette');
    var input = document.getElementById('cmdInput');
    var results = document.getElementById('cmdResults');
    if (!overlay || !input || !results) return;

    var items = [];
    try {
        var raw = JSON.parse(document.getElementById('site-data').textContent);
        items = [].concat(raw.projects || [], raw.links || [], raw.social || [], raw.posts || [], raw.books || [], raw.bookmarks || [], raw.ideas || [], raw.pages || []);
    } catch(e) { return; }

    var activeIndex = 0;
    var filtered = [];
    var previousFocus = null;

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function open() {
        previousFocus = document.activeElement;
        overlay.hidden = false;
        input.value = '';
        search('');
        input.focus();
        document.body.style.overflow = 'hidden';
    }

    function close() {
        overlay.hidden = true;
        document.body.style.overflow = '';
        if (previousFocus) previousFocus.focus();
    }

    function search(query) {
        var q = query.toLowerCase().trim();
        filtered = q ? items.filter(function(i) { return (i.name && i.name.toLowerCase().includes(q)) || (i.author && i.author.toLowerCase().includes(q)); }) : items;
        activeIndex = 0;
        render();
    }

    var typeLabels = { project: '프로젝트', link: '링크', social: '소셜', post: '블로그', book: '도서', stack: '도구', bookmark: '북마크', idea: '개념', page: '페이지', learn: '공부방' };

    function render() {
        var html = '';
        if (filtered.length === 0) {
            html = '<div class="cmd-empty" role="status">검색 결과가 없습니다</div>';
        } else {
            var lastType = '';
            filtered.forEach(function(item, i) {
                if (item.type !== lastType) {
                    lastType = item.type;
                    html += '<div class="cmd-group-header">' + escapeHtml(typeLabels[item.type] || item.type) + '</div>';
                }
                html += '<a href="' + escapeHtml(item.url || '#') + '" class="cmd-result' + (i === activeIndex ? ' active' : '') + '" data-index="' + i + '" role="option"' + (i === activeIndex ? ' aria-selected="true"' : '') + '>' +
                    '<span class="cmd-result-name">' + escapeHtml(item.name) + '</span>' +
                    '<span class="cmd-result-type">' + escapeHtml(typeLabels[item.type] || item.type) + '</span>' +
                    '</a>';
            });
        }
        results.innerHTML = html;
    }

    function navigate(dir) {
        if (filtered.length === 0) return;
        activeIndex = (activeIndex + dir + filtered.length) % filtered.length;
        render();
        var el = results.querySelector('.active');
        if (el) {
            el.scrollIntoView({ block: 'nearest' });
            el.focus();
        }
    }

    function go() {
        var target = filtered[activeIndex];
        if (target && target.url) {
            window.location.href = target.url;
        }
    }

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            overlay.hidden ? open() : close();
        }
        if (!overlay.hidden) {
            if (e.key === 'Escape') { close(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); navigate(1); }
            if (e.key === 'ArrowUp') { e.preventDefault(); navigate(-1); }
            if (e.key === 'Enter') { e.preventDefault(); go(); }
            if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
        }
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) close();
    });

    input.addEventListener('input', function() { search(input.value); });

    results.addEventListener('mousemove', function(e) {
        var item = e.target.closest('.cmd-result');
        if (item) {
            var newIndex = parseInt(item.dataset.index, 10);
            if (newIndex !== activeIndex) {
                activeIndex = newIndex;
                render();
            }
        }
    });

    // ── Header / Mobile Search Buttons ──
    var headerSearchBtn = document.getElementById('headerSearchBtn');
    if (headerSearchBtn) headerSearchBtn.addEventListener('click', open);
    var mobileSearchBtn = document.getElementById('mobileSearchBtn');
    if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', open);
})();

// ── Project Uptime Ping ──
(function() {
    document.querySelectorAll('.tile-item[data-ping-url]').forEach(function(el) {
        var url = el.dataset.pingUrl;
        var dot = el.querySelector('.status-dot');
        if (!dot || !url) return;
        var controller = new AbortController();
        var timer = setTimeout(function() { controller.abort(); }, 5000);
        fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
            .then(function() {
                clearTimeout(timer);
                dot.classList.add('status-dot-live');
            })
            .catch(function() {
                clearTimeout(timer);
                dot.classList.remove('status-dot-live');
                dot.style.background = 'var(--color-red-500, #ef4444)';
                dot.style.animation = 'none';
            });
    });
})();

// ── Book Grid Shuffle ──
(function() {
    var grid = document.getElementById('bookGrid');
    if (!grid) return;

    var cards = Array.from(grid.children);
    for (var i = cards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cards[i];
        cards[i] = cards[j];
        cards[j] = temp;
    }
    cards.forEach(function(card) { grid.appendChild(card); });
})();

// ── Clock Helper ──
function initClock(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var tz = el.dataset.tz || 'Asia/Seoul';
    function update() {
        try {
            el.textContent = new Date().toLocaleTimeString('en-GB', {
                timeZone: tz, hour: '2-digit', minute: '2-digit'
            });
        } catch(e) {
            el.textContent = new Date().toLocaleTimeString('en-GB', {
                timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit'
            });
        }
    }
    update();
    var timer = setInterval(update, 30000);
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) { clearInterval(timer); }
        else { update(); timer = setInterval(update, 30000); }
    });
}
initClock('sidebarClock');


// ── Mobile Theme Toggle ──
(function() {
    var mobileToggle = document.getElementById('mobileThemeToggle');
    if (!mobileToggle) return;
    mobileToggle.addEventListener('click', toggleTheme);
})();



// ── Hero Nav Anchor Smooth Scroll ──
(function() {
    var heroNav = document.querySelector('.hero-nav');
    if (!heroNav) return;
    heroNav.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            var target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();

// ── Scroll to Top ──
(function() {
    var btn = document.getElementById('scrollTop');
    if (!btn) return;
    window.addEventListener('scroll', throttle(function() {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, 100));
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();


// ── Scroll Progress Bar ──
(function() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', throttle(function() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0';
    }, 50));
})();

// ── Visitor Counter (GoatCounter) ──
(function() {
    var el = document.getElementById('visitorTotal');
    if (!el) return;
    var p = encodeURIComponent(location.pathname);
    var proxy = 'https://gc-proxy.seowondeuk.workers.dev/api/gc/' + p + '.json';
    var direct = 'https://txid.goatcounter.com/counter/' + p + '.json';
    function update(d) { if (d.count_unique || d.count) el.textContent = d.count_unique || d.count; }
    fetch(proxy)
        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
        .then(update)
        .catch(function() {
            fetch(direct)
                .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
                .then(update)
                .catch(function() {});
        });
})();

// ── Quote Rotation ──
(function() {
    var dataEl = document.getElementById('quote-data');
    var textEl = document.getElementById('quoteText');
    var authorEl = document.getElementById('quoteAuthor');
    if (!dataEl || !textEl || !authorEl) return;
    try {
        var quotes = JSON.parse(dataEl.textContent);
        if (quotes.length === 0) return;
        var idx = Math.floor(Math.random() * quotes.length);
        textEl.textContent = quotes[idx].text;
        authorEl.textContent = quotes[idx].author;
    } catch(e) { /* silent */ }
})();

// ── Bitcoin Widget (with 60s localStorage cache) ──
(function() {
    var priceEl = document.getElementById('btcPrice');
    var blockEl = document.getElementById('btcBlock');
    if (!priceEl && !blockEl) return;

    var BTC_KEY = 'cache_btc';
    var BTC_TTL = 60000; // 1 min
    try {
        var c = JSON.parse(localStorage.getItem(BTC_KEY));
        if (c && Date.now() - c.ts < BTC_TTL) {
            if (priceEl && c.price) priceEl.textContent = '$' + c.price.toLocaleString();
            if (blockEl && c.block) blockEl.textContent = parseInt(c.block).toLocaleString();
            return;
        }
    } catch(e){}

    var cached = {};

    if (priceEl) {
        var ctrl1 = new AbortController();
        var t1 = setTimeout(function() { ctrl1.abort(); }, 3000);
        fetch('https://mempool.space/api/v1/prices', { signal: ctrl1.signal })
            .then(function(r) { clearTimeout(t1); if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(function(data) {
                if (data && typeof data.USD === 'number') {
                    priceEl.textContent = '$' + data.USD.toLocaleString();
                    cached.price = data.USD;
                    try { localStorage.setItem(BTC_KEY, JSON.stringify({ts:Date.now(),price:cached.price,block:cached.block})); } catch(e){}
                }
            })
            .catch(function() { clearTimeout(t1); });
    }

    if (blockEl) {
        var ctrl2 = new AbortController();
        var t2 = setTimeout(function() { ctrl2.abort(); }, 3000);
        fetch('https://mempool.space/api/blocks/tip/height', { signal: ctrl2.signal })
            .then(function(r) { clearTimeout(t2); if (!r.ok) throw new Error(r.status); return r.text(); })
            .then(function(height) {
                if (height && !isNaN(height)) {
                    blockEl.textContent = parseInt(height).toLocaleString();
                    cached.block = height;
                    try { localStorage.setItem(BTC_KEY, JSON.stringify({ts:Date.now(),price:cached.price,block:cached.block})); } catch(e){}
                }
            })
            .catch(function() { clearTimeout(t2); });
    }
})();

// ── Idea/Concept Tag Filter ──
(function() {
    var filterContainer = document.getElementById('tagFilter');
    var listContainer = document.getElementById('conceptList');
    if (!filterContainer || !listContainer) return;

    var chips = filterContainer.querySelectorAll('.tag-chip');
    var cards = listContainer.querySelectorAll('.post-card');

    filterContainer.addEventListener('click', function(e) {
        var chip = e.target.closest('.tag-chip');
        if (!chip) return;
        var tag = chip.dataset.tag;
        chips.forEach(function(c) { c.classList.remove('tag-chip-active'); });
        chip.classList.add('tag-chip-active');
        cards.forEach(function(card) {
            if (tag === 'all') {
                card.style.display = '';
                return;
            }
            var cardTags = (card.dataset.tags || '').split(',');
            card.style.display = cardTags.indexOf(tag) !== -1 ? '' : 'none';
        });
    });
})();

// ── Mobile Menu Toggle ──
document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    var backdrop = document.getElementById('mobile-menu-backdrop');
    var iconOpen = document.getElementById('menu-icon-open');
    var iconClose = document.getElementById('menu-icon-close');
    if (!toggle || !menu) return;

    function closeMenu() {
        menu.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
        if (iconOpen) iconOpen.classList.remove('hidden');
        if (iconClose) iconClose.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function openMenu() {
        menu.classList.remove('hidden');
        if (backdrop) backdrop.classList.remove('hidden');
        if (iconOpen) iconOpen.classList.add('hidden');
        if (iconClose) iconClose.classList.remove('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', function() {
        menu.classList.contains('hidden') ? openMenu() : closeMenu();
    });

    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // 메뉴 링크 클릭 시 자동 닫기
    menu.addEventListener('click', function(e) {
        if (e.target.closest('a[href]')) closeMenu();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
            closeMenu();
            toggle.focus();
        }
    });
});

// ── Concept Popover ──
(function() {
    var active = null; // { el, popover }

    function esc(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function close() {
        if (!active) return;
        active.popover.remove();
        active = null;
    }

    function open(link) {
        close();
        var title = link.dataset.conceptTitle;
        var desc = link.dataset.conceptDesc;
        if (!title || !desc) return;

        var pop = document.createElement('div');
        pop.className = 'concept-popover';
        pop.innerHTML =
            '<button class="concept-popover-close" aria-label="닫기">&times;</button>' +
            '<div class="concept-popover-title">' + esc(title) + '</div>' +
            '<div class="concept-popover-desc">' + esc(desc) + '</div>' +
            '<a class="concept-popover-link" href="' + link.href + '" target="_blank" rel="noopener noreferrer">자세히 보기 &rarr;</a>';

        pop.querySelector('.concept-popover-close').addEventListener('click', function(e) {
            e.stopPropagation();
            close();
        });

        document.body.appendChild(pop);

        // 위치 계산
        var rect = link.getBoundingClientRect();
        var scrollY = window.scrollY;
        var scrollX = window.scrollX;
        var top = rect.bottom + scrollY + 6;
        var left = rect.left + scrollX;

        // 오른쪽 넘침 방지
        var popW = pop.offsetWidth;
        if (left + popW > window.innerWidth - 16) {
            left = window.innerWidth - popW - 16 + scrollX;
        }
        if (left < 16) left = 16;

        // 아래쪽 넘침 시 위로 표시
        var popH = pop.offsetHeight;
        if (rect.bottom + popH + 6 > window.innerHeight) {
            top = rect.top + scrollY - popH - 6;
        }

        pop.style.top = top + 'px';
        pop.style.left = left + 'px';

        active = { el: link, popover: pop };
    }

    // 이벤트 위임: data-concept-title 가진 링크 클릭
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[data-concept-title]');
        if (link) {
            e.preventDefault();
            if (active && active.el === link) {
                close();
            } else {
                open(link);
            }
            return;
        }
        // 팝오버 외부 클릭 시 닫기
        if (active && !e.target.closest('.concept-popover')) {
            close();
        }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') close();
    });
})();

// ── Lightning Tip ──────────────────────────────────────
(function(){
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.sidebar-lightning-addr');
    if (!btn) return;
    var addr = btn.getAttribute('data-lightning');
    if (!addr) return;
    navigator.clipboard.writeText(addr).then(function() {
      btn.classList.add('copied');
      setTimeout(function() {
        btn.classList.remove('copied');
      }, 2000);
    });
  });
})();

// ── i18n ──────────────────────────────────────────────
(function(){
  // i18n dictionary loaded from Hugo data (data/i18n_js.json → #i18n-data)
  let DICT = {};
  try {
    const i18nEl = document.getElementById('i18n-data');
    if (i18nEl) DICT = JSON.parse(i18nEl.textContent);
  } catch(e) { /* fallback: empty dict */ }

  // URL에서 현재 언어 감지 (Hugo 다국어 경로 기반)
  function detectLang() {
    const path = window.location.pathname;
    if (path.startsWith('/en/') || path === '/en') return 'en';
    if (path.startsWith('/ja/') || path === '/ja') return 'ja';
    if (path.startsWith('/ko/') || path === '/ko') return 'ko';
    return localStorage.getItem('lang') || 'ko';
  }
  let _lang = detectLang();

  function applyLang(l) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (l === 'ko') {
        el.textContent = key;
      } else {
        const t = DICT[key];
        if (t) el.textContent = t[l] || t.en || key;
      }
    });
    // lang-btn 텍스트
    const btn = document.getElementById('lang-btn');
    if (btn) btn.textContent = {ko:'KO',en:'EN',ja:'JA'}[l] || 'KO';
    // 앱바 span
    document.querySelectorAll('[data-ko]').forEach(el => {
      if (l === 'ko') el.textContent = el.dataset.ko;
      else if (l === 'en') el.textContent = el.dataset.en || el.dataset.ko;
      else el.textContent = el.dataset.ja || el.dataset.en || el.dataset.ko;
    });
  }

  window.setLang = function(l) {
    // lang-menu 닫기
    var langMenu = document.getElementById('lang-menu');
    if (langMenu) langMenu.classList.remove('open');
    var langBtn = document.getElementById('lang-btn');
    if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
    // Hugo 다국어 URL이 있으면 페이지 이동
    if (window.__LANG_URLS__ && window.__LANG_URLS__[l]) {
      try { localStorage.setItem('preferred-lang', l); } catch(e) {}
      window.location.href = window.__LANG_URLS__[l];
      return;
    }
    // fallback: 텍스트만 변환
    _lang = l; localStorage.setItem('lang', l);
    applyLang(l);
  };

  // 초기화 (DOM 준비 후)
  document.addEventListener('DOMContentLoaded', () => applyLang(_lang));
})();

// ── Learning Progress Tracker ──
const LearnProgress = (() => {
  const STORAGE_KEY = 'txid_learn_progress';
  const SYNC_API = 'https://api.txid.uk';
  var syncTimer = null;
  var isSyncing = false;
  var isLoggedIn = false;

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
  }

  function markRead(url) {
    const progress = getProgress();
    if (!progress[url]) {
      progress[url] = { readAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      scheduleSyncToServer();
    }
  }

  function scheduleSyncToServer() {
    if (!isLoggedIn) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(syncToServer, 5000);
  }

  function syncToServer() {
    if (!isLoggedIn || isSyncing) return;
    isSyncing = true;
    fetch(SYNC_API + '/progress', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: getProgress() }),
    })
    .then(function(res) { return res.ok ? res.json() : Promise.reject(); })
    .then(function(data) {
      if (data && data.progress) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.progress));
        updateProgressIndicators();
      }
    })
    .catch(function() {})
    .finally(function() { isSyncing = false; });
  }

  function fetchAndMergeFromServer() {
    if (!isLoggedIn || isSyncing) return;
    isSyncing = true;
    fetch(SYNC_API + '/progress', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: getProgress() }),
    })
    .then(function(res) { return res.ok ? res.json() : Promise.reject(); })
    .then(function(data) {
      if (data && data.progress) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.progress));
        updateProgressIndicators();
      }
    })
    .catch(function() {})
    .finally(function() { isSyncing = false; });
  }

  function initSync() {
    if (!window.txidAuth) {
      if (!initSync._r) initSync._r = 0;
      if (initSync._r++ < 5) setTimeout(initSync, 200);
      return;
    }
    var user = window.txidAuth.getUser();
    if (user) {
      isLoggedIn = true;
      fetchAndMergeFromServer();
    }
    window.txidAuth.onAuthChange(function(u) {
      if (u) {
        isLoggedIn = true;
        fetchAndMergeFromServer();
      } else {
        isLoggedIn = false;
      }
    });

    // Flush pending sync on page unload
    window.addEventListener('beforeunload', function() {
      if (!isLoggedIn || !syncTimer) return;
      clearTimeout(syncTimer);
      syncTimer = null;
      fetch(SYNC_API + '/progress', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: getProgress() }),
        keepalive: true,
      });
    });
  }

  function isRead(url) {
    return !!getProgress()[url];
  }

  function getStats() {
    const progress = getProgress();
    return {
      totalRead: Object.keys(progress).length,
      pages: progress
    };
  }

  // Parse comma-separated step URLs from data attribute
  function getStepURLs(el) {
    const raw = el?.getAttribute('data-steps');
    if (!raw) return [];
    return raw.split(',').filter(Boolean);
  }

  // Count completed steps for a set of URLs
  function countCompleted(urls) {
    const progress = getProgress();
    return urls.filter(function(u) { return !!progress[u]; }).length;
  }

  // Auto-mark current page as read after 30 seconds or scroll to bottom
  function initAutoTrack() {
    var path = window.location.pathname;
    // Track learn, ideas, people, start, blog sections
    if (!/\/(learn|ideas|people|start|blog)\//.test(path)) return;

    var timer = setTimeout(function() {
      markRead(path);
      updateProgressIndicators();
    }, 30000);

    var onScroll = function() {
      var scrolled = window.scrollY + window.innerHeight;
      var docHeight = document.documentElement.scrollHeight;
      if (scrolled >= docHeight - 100) {
        markRead(path);
        updateProgressIndicators();
        window.removeEventListener('scroll', onScroll);
        clearTimeout(timer);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Update all progress indicators on the page
  function updateProgressIndicators() {
    var progress = getProgress();

    // 1. Homepage bento learn cards — show completion count + progress bar
    document.querySelectorAll('.learn-card[data-steps]').forEach(function(card) {
      var urls = getStepURLs(card);
      var total = parseInt(card.getAttribute('data-total')) || urls.length;
      var done = countCompleted(urls);
      var pct = total > 0 ? Math.round(done / total * 100) : 0;

      // Progress text
      var progEl = card.querySelector('.learn-card-progress');
      if (progEl) {
        if (done > 0) {
          progEl.textContent = done + '/' + total + (pct === 100 ? ' \u2713' : '');
          progEl.style.color = pct === 100 ? 'var(--bitcoin, #f7931a)' : '';
        }
      }

      // Mark completed
      if (pct === 100) card.classList.add('learn-complete');
      if (done > 0) card.classList.add('learn-started');
    });

    // 2. Learn path list cards — progress bar
    document.querySelectorAll('.learn-path-card[data-steps]').forEach(function(card) {
      var urls = getStepURLs(card);
      var total = parseInt(card.getAttribute('data-total')) || urls.length;
      var done = countCompleted(urls);
      var pct = total > 0 ? Math.round(done / total * 100) : 0;
      var fill = card.querySelector('.learn-progress-fill');
      if (fill) fill.style.width = pct + '%';
    });

    // 3. Learn path single page — progress bar + step checkmarks
    document.querySelectorAll('.learn-path-progress').forEach(function(el) {
      var pathId = el.getAttribute('data-path-id');
      var total = parseInt(el.getAttribute('data-total')) || 0;
      // Find step URLs from sibling step elements
      var steps = el.closest('.max-w-3xl')?.querySelectorAll('.learn-step[data-step]') || [];
      var done = 0;
      steps.forEach(function(step) {
        var url = step.getAttribute('data-step');
        if (progress[url]) {
          done++;
          step.classList.add('step-done');
          // Swap number for checkmark
          var circle = step.querySelector('.learn-step-circle');
          if (circle) {
            circle.classList.add('bg-bitcoin', 'border-bitcoin');
            circle.classList.remove('bg-gray-900', 'border-bitcoin/50');
          }
          var num = step.querySelector('.learn-step-num');
          var check = step.querySelector('.learn-step-check');
          if (num) num.classList.add('hidden');
          if (check) check.classList.remove('hidden');
        }
      });
      var pct = total > 0 ? Math.round(done / total * 100) : 0;
      var fill = el.querySelector('.learn-progress-fill');
      var countEl = el.querySelector('.learn-progress-count');
      if (fill) fill.style.width = pct + '%';
      if (countEl) countEl.textContent = done + '/' + total;
    });

    // 4. Single page step dots (in path indicator bar)
    var pathDataEl = document.getElementById('learn-path-steps-data');
    if (pathDataEl) {
      try {
        var pathStepURLs = JSON.parse(pathDataEl.textContent);
        var indicator = document.getElementById('learn-path-indicator');
        if (indicator && pathStepURLs) {
          var dots = indicator.querySelectorAll('.learn-step-dots > div');
          dots.forEach(function(dot, i) {
            if (pathStepURLs[i] && progress[pathStepURLs[i]]) {
              dot.className = dot.className.replace(/bg-gray-700|bg-bitcoin\/40/g, '').trim() + ' bg-bitcoin';
            }
          });
        }
      } catch(e) {}
    }

    // 5. Generic link-based read indicators
    document.querySelectorAll('a[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && progress[href]) {
        var parent = link.closest('.tile-item, .sidebar-recent-item');
        if (parent) parent.classList.add('item-read');
      }
    });
  }

  return { getProgress, markRead, isRead, getStats, countCompleted, getStepURLs, initAutoTrack, updateProgressIndicators, initSync };
})();

// ── PWA Install Prompt ──
var _deferredInstallPrompt = null;
var PWA_DISMISS_KEY = 'pwa-banner-dismissed';

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _deferredInstallPrompt = e;
  // Show banner (unless previously dismissed)
  showPwaBanner();
});

function showPwaBanner() {
  if (!_deferredInstallPrompt) return;
  var dismissed = safeGet(PWA_DISMISS_KEY);
  if (dismissed) return; // user clicked "나중에"
  // Don't show if already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) return;

  var existing = document.getElementById('pwa-install-banner');
  if (existing) return;

  var lang = document.documentElement.lang || 'ko';
  var texts = {
    ko: { title: 'TXID 앱 설치', desc: '홈 화면에 추가하면 더 빠르게 접속할 수 있습니다.', install: '설치', later: '나중에' },
    en: { title: 'Install TXID App', desc: 'Add to home screen for faster access.', install: 'Install', later: 'Later' },
    ja: { title: 'TXIDアプリをインストール', desc: 'ホーム画面に追加して素早くアクセス。', install: 'インストール', later: '後で' }
  };
  var t = texts[lang] || texts.ko;

  var banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.className = 'pwa-install-banner';
  banner.innerHTML =
    '<div class="pwa-banner-inner">' +
      '<div class="pwa-banner-icon"><svg width="24" height="24" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" fill="#f7931a"/><rect x="18.5" y="1" width="3" height="38" fill="#0d1117"/><rect x="10" y="18.5" width="29" height="3" fill="#0d1117"/><rect x="1" y="18.5" width="6" height="3" fill="#0d1117"/></svg></div>' +
      '<div class="pwa-banner-text"><strong>' + t.title + '</strong><span>' + t.desc + '</span></div>' +
      '<div class="pwa-banner-actions">' +
        '<button class="pwa-banner-install" id="pwa-banner-install-btn">' + t.install + '</button>' +
        '<button class="pwa-banner-later" id="pwa-banner-later-btn">' + t.later + '</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(banner);
  // Animate in
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { banner.classList.add('pwa-banner-visible'); });
  });

  document.getElementById('pwa-banner-install-btn').addEventListener('click', function() {
    installPWA();
    dismissPwaBanner(true);
  });
  document.getElementById('pwa-banner-later-btn').addEventListener('click', function() {
    dismissPwaBanner(false);
  });
}

function dismissPwaBanner(installed) {
  var banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.remove('pwa-banner-visible');
    setTimeout(function() { banner.remove(); }, 300);
  }
  if (!installed) {
    // Dismiss for 7 days
    safeSet(PWA_DISMISS_KEY, String(Date.now() + 7 * 86400000));
  }
}

// Check if dismiss has expired
(function() {
  var dismissed = safeGet(PWA_DISMISS_KEY);
  if (dismissed && Number(dismissed) < Date.now()) {
    try { localStorage.removeItem(PWA_DISMISS_KEY); } catch(e) {}
  }
})();

window.installPWA = function() {
  if (!_deferredInstallPrompt) return;
  _deferredInstallPrompt.prompt();
  _deferredInstallPrompt.userChoice.then(function() {
    _deferredInstallPrompt = null;
    dismissPwaBanner(true);
  });
};

window.addEventListener('appinstalled', function() {
  _deferredInstallPrompt = null;
  dismissPwaBanner(true);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  LearnProgress.initAutoTrack();
  LearnProgress.updateProgressIndicators();
  LearnProgress.initSync();
});
