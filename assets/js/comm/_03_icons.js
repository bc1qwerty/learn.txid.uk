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

  var svgLock = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-1px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>';

  // ─── SVG Icons ───
  const svgUp = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  const svgDown = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
  const svgComment = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-1px"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  const svgSearch = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-2px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  const svgBookmark = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-2px"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>';
