/**
 * main.js — Application entry point
 * Wires UI events → game.js logic → ui.js rendering.
 * Contains no business logic — delegates everything.
 */

import enStrings from './i18n/en.js';
import thStrings from './i18n/th.js';
import jpStrings from './i18n/jp.js';

import { loadSettings, setSetting } from './settings.js';
import { unlockAudio, syncMusic, startMusic, stopMusic } from './audio.js';

import {
  registerStrings,
  applyLang,
  refreshSettingsUI,
  showPage,
  showSection,
  openConfirm,
  closeConfirm,
  playStartAnimation,
  showSaveBtn,
} from './ui.js';

import {
  setupGame,
  initSelectScreen,
  initPlayScreen,
  selectRandom,
  undoFlips,
  lockFlipped,
  resetBoard,
  toggleAnswer,
  fullReset,
  getSelectedIdx,
} from './game.js';

// ─────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────
registerStrings(enStrings, thStrings, jpStrings);
applyLang();
refreshSettingsUI();

// Unlock audio on first interaction (required for iOS)
document.addEventListener('touchstart', () => unlockAudio(), { once: true });
document.addEventListener('click',      () => unlockAudio(), { once: true });

// ─────────────────────────────────────────────
// SETTINGS PANEL
// ─────────────────────────────────────────────
const settingsOverlay = document.getElementById('settings-overlay');

document.getElementById('settings-btn').addEventListener('click', () => {
  refreshSettingsUI();
  settingsOverlay.classList.add('open');
});

document.getElementById('settings-close').addEventListener('click', () => {
  settingsOverlay.classList.remove('open');
});

settingsOverlay.addEventListener('click', e => {
  if (e.target === settingsOverlay) settingsOverlay.classList.remove('open');
});

document.getElementById('toggle-sound').addEventListener('change', e => {
  setSetting('sound', e.target.checked);
});

document.getElementById('toggle-music').addEventListener('change', e => {
  setSetting('music', e.target.checked);
  syncMusic();
});

document.querySelectorAll('#lang-seg .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setSetting('language', btn.dataset.val);
    refreshSettingsUI();
    applyLang();
  });
});

document.querySelectorAll('#anim-seg .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setSetting('discardAnim', btn.dataset.val);
    refreshSettingsUI();
  });
});

// ─────────────────────────────────────────────
// SETUP PAGE — segmented button groups
// ─────────────────────────────────────────────
['size-seg', 'amount-seg', 'cat-seg'].forEach(groupId => {
  document.querySelectorAll(`#${groupId} .setup-seg-btn`).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(`#${groupId} .setup-seg-btn`)
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

function getSetupVal(groupId) {
  return document.querySelector(`#${groupId} .setup-seg-btn.active`)?.dataset.val;
}

// ─────────────────────────────────────────────
// PAGE 1 → 2: MAIN MENU → BOARD SETUP
// ─────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  unlockAudio();
  showPage('setup');
});

// ─────────────────────────────────────────────
// PAGE 2 → 3: BOARD SETUP → CHARACTER SELECT
// ─────────────────────────────────────────────
document.getElementById('continue-btn').addEventListener('click', () => {
  const layout   = getSetupVal('size-seg');
  const amount   = getSetupVal('amount-seg');
  const category = getSetupVal('cat-seg');

  setupGame(layout, amount, category);
  showPage('game');
  showSection('select');
  initSelectScreen();
});

// ─────────────────────────────────────────────
// CHARACTER SELECT — Random & Save
// ─────────────────────────────────────────────
document.getElementById('random-btn').addEventListener('click', () => {
  selectRandom();
  // Auto-trigger save after brief highlight
  setTimeout(() => {
    if (getSelectedIdx() !== null) {
      document.getElementById('save-btn').click();
    }
  }, 500);
});

document.getElementById('save-btn').addEventListener('click', () => {
  if (getSelectedIdx() === null) return;

  playStartAnimation(() => {
    showSection('play');
    initPlayScreen();
    startMusic();
  });
});

// ─────────────────────────────────────────────
// GAME PLAY — Controls
// ─────────────────────────────────────────────
document.getElementById('undo-btn').addEventListener('click', undoFlips);

document.getElementById('lock-btn').addEventListener('click', lockFlipped);

document.getElementById('refresh-btn').addEventListener('click', openConfirm);

document.getElementById('game-answer-box').addEventListener('click', toggleAnswer);

// ─────────────────────────────────────────────
// CONFIRM POPUP
// ─────────────────────────────────────────────
document.getElementById('confirm-yes').addEventListener('click', () => {
  resetBoard();
  closeConfirm();
});

document.getElementById('confirm-no').addEventListener('click', closeConfirm);

// ─────────────────────────────────────────────
// HOME BUTTON → back to setup
// ─────────────────────────────────────────────
document.getElementById('home-btn').addEventListener('click', () => {
  stopMusic();
  fullReset();
  showSection('none');   // hides both sections + home btn
  showPage('setup');
});
