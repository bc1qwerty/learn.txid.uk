/* mermaid-init.js — Mermaid initialization with dark/light theme support */
(function () {
  'use strict';
  var isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  function getThemeVars(dark) {
    return {
      primaryColor: '#f7931a',
      primaryTextColor: dark ? '#e6edf3' : '#111827',
      primaryBorderColor: '#f7931a',
      lineColor: dark ? '#484f58' : '#d1d5db',
      secondaryColor: dark ? '#21262d' : '#f3f4f6',
      tertiaryColor: dark ? '#161b22' : '#ffffff',
      background: dark ? '#0d1117' : '#ffffff',
      mainBkg: dark ? '#161b22' : '#ffffff',
      nodeBorder: '#f7931a',
      clusterBkg: dark ? '#161b22' : '#f9fafb',
      clusterBorder: dark ? '#30363d' : '#d1d5db',
      titleColor: dark ? '#e6edf3' : '#111827',
      edgeLabelBackground: dark ? '#161b22' : '#ffffff',
      nodeTextColor: dark ? '#e6edf3' : '#111827',
    };
  }

  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    themeVariables: getThemeVars(isDark),
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
    sequence: { useMaxWidth: true },
    fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
  });

  /* Re-render on theme change */
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName !== 'data-theme') return;
      var dark = document.documentElement.getAttribute('data-theme') !== 'light';
      var pres = document.querySelectorAll('pre.mermaid');
      pres.forEach(function (pre) {
        /* Restore original source from data attr */
        var src = pre.getAttribute('data-mermaid-src');
        if (src) {
          pre.removeAttribute('data-processed');
          pre.innerHTML = src;
        }
      });
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: getThemeVars(dark),
        flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
        sequence: { useMaxWidth: true },
        fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
      });
      mermaid.run({ nodes: pres });
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* Store original source for re-rendering */
  document.querySelectorAll('pre.mermaid').forEach(function (pre) {
    pre.setAttribute('data-mermaid-src', pre.textContent);
  });
})();
