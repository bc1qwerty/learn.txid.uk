/**
 * community.js — SPA for learn.txid.uk/community/
 * Hash-based routing: #free, #free/123, #free/new, #search?q=..., #user/{pubkey}
 * Modular build — concatenated via Hugo Pipes
 */
(function () {
  'use strict';

  const API = 'https://api.txid.uk';
  const app = document.getElementById('community-app');
  if (!app) return;

  const LANG = app.dataset.lang || 'ko';
