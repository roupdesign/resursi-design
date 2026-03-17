/**
 * Design Course Hub — script.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *  1. Set the current year in the footer.
 *  2. Mobile navigation drawer toggle.
 *  3. Password-gated download modal:
 *       - Open on "Download" button click (captures the card's URL + password).
 *       - Each card has its OWN password via data-password="..." in the HTML.
 *       - On success → open the file URL in a new tab.
 *       - On failure → display an inline error message.
 *       - Close via the × button, clicking the backdrop, or pressing Escape.
 *
 * ── HOW TO ADD A NEW MATERIAL CARD ───────────────────────────────────────────
 * In index.html, copy any <article class="card"> block and set:
 *   data-url="https://your-drive-link"
 *   data-label="Week 05 Project Brief"
 *   data-password="yourpassword"
 * No changes to this file are needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */


// ── DOM REFERENCES ─────────────────────────────────────────────
const overlay       = document.getElementById('modal-overlay');
const modal         = document.getElementById('modal');
const closeBtn      = document.getElementById('modal-close');
const submitBtn     = document.getElementById('modal-submit');
const passwordInput = document.getElementById('modal-password');
const errorMsg      = document.getElementById('modal-error');
const itemNameEl    = document.getElementById('modal-item-name');
const yearEl        = document.getElementById('year');
const navToggle     = document.querySelector('.nav-toggle');
const navDrawer     = document.querySelector('.nav-drawer');


// ── 1. FOOTER YEAR ─────────────────────────────────────────────
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


// ── 2. MOBILE NAV ──────────────────────────────────────────────
if (navToggle && navDrawer) {

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isExpanded));
    navDrawer.classList.toggle('is-open');
    navDrawer.setAttribute('aria-hidden', String(isExpanded));
  });

  // Close drawer when any nav link inside it is clicked
  navDrawer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navDrawer.classList.remove('is-open');
      navDrawer.setAttribute('aria-hidden', 'true');
    });
  });

}


// ── 3. MODAL STATE ─────────────────────────────────────────────
// These hold the context for whichever card triggered the modal.
let pendingUrl        = '';   // download/redirect URL for this card
let pendingPassword   = '';   // correct password for this specific card
let lastFocusedButton = null; // restored on modal close for accessibility


// ── MODAL HELPERS ──────────────────────────────────────────────

/**
 * Opens the modal for a specific material card.
 * @param {string} url      - The download/redirect URL for this material.
 * @param {string} label    - Human-readable name shown inside the modal.
 * @param {string} password - The correct password for this specific card.
 */
function openModal(url, label, password) {
  pendingUrl      = url;
  pendingPassword = password;
  itemNameEl.textContent = label;

  // Clear any leftover state from a previous open
  passwordInput.value = '';
  passwordInput.classList.remove('has-error');
  errorMsg.textContent = '';
  errorMsg.classList.remove('is-visible');

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');

  // Focus the input after the CSS transition completes
  setTimeout(() => passwordInput.focus(), 200);

  // Prevent the page behind from scrolling while modal is open
  document.body.style.overflow = 'hidden';
}


/**
 * Closes the modal and resets all state.
 */
function closeModal() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Clear pending state
  pendingUrl      = '';
  pendingPassword = '';

  // Return focus to the button that opened the modal
  if (lastFocusedButton) {
    lastFocusedButton.focus();
    lastFocusedButton = null;
  }
}


/**
 * Displays an inline error message inside the modal.
 * @param {string} message - The error string to display.
 */
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('is-visible');
  passwordInput.classList.add('has-error');
  passwordInput.focus();
}


/**
 * Clears any displayed error state inside the modal.
 */
function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('is-visible');
  passwordInput.classList.remove('has-error');
}


// ── DOWNLOAD BUTTONS ──────────────────────────────────────────
/**
 * Attach click handlers to every download button.
 * Reads data-url, data-label, and data-password from the parent <article>.
 * Adding new cards to the HTML requires no changes here.
 */
document.querySelectorAll('.btn-download').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('[data-url]');

    const url      = card?.dataset.url      || '#';
    const label    = card?.dataset.label    || 'this file';
    const password = card?.dataset.password || '';

    lastFocusedButton = button;
    openModal(url, label, password);
  });
});


// ── MODAL SUBMIT ──────────────────────────────────────────────
/**
 * Validates the entered password against this card's specific password,
 * then either redirects to the file or shows an error.
 */
function handleSubmit() {
  const entered = passwordInput.value.trim();

  if (!entered) {
    showError('Molimo vas unesite lozinku.');
    return;
  }

  if (entered === pendingPassword) {
    // ✅ Correct — open the resource in a new tab
    window.open(pendingUrl, '_blank', 'noopener,noreferrer');
    closeModal();
  } else {
    // ❌ Wrong password — show error and clear the field
    showError('Pogrešna lozinka. Pokušaj ponovno.');
    passwordInput.value = '';
  }
}

submitBtn.addEventListener('click', handleSubmit);

// Submit on Enter key
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
});

// Clear the error as soon as the user starts typing again
passwordInput.addEventListener('input', clearError);


// ── MODAL CLOSE TRIGGERS ──────────────────────────────────────

// × button
closeBtn.addEventListener('click', closeModal);

// Click outside the modal box (on the backdrop)
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

// Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
    closeModal();
  }
});
