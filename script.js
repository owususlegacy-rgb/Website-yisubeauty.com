/* ============================================
   TOAST
   ============================================ */

function showToast(message) {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

/* ============================================
   SCROLL REVEAL
   Elements with .reveal fade up as they enter view.
   Cards in a grid stagger so they cascade in.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length === 0) return;

  // Stagger cards within the salon grid.
  const gridCards = document.querySelectorAll('.salon-grid .reveal');
  gridCards.forEach(function (card, i) {
    card.style.transitionDelay = (i * 80) + 'ms';
  });

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
});

/* ============================================
   SEARCH + LOCATION FILTER
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchInput');
  const locationFilter = document.getElementById('locationFilter');
  const salonGrid = document.getElementById('salonGrid');

  if (!searchInput || !locationFilter || !salonGrid) return;

  function filterSalons() {
    const query = searchInput.value.toLowerCase().trim();
    const location = locationFilter.value;
    const cards = salonGrid.querySelectorAll('.salon-card:not(.coming-soon)');

    cards.forEach(function (card) {
      const nameEl = card.querySelector('.salon-name');
      const name = nameEl ? nameEl.textContent.toLowerCase() : '';
      const cardLocation = card.getAttribute('data-location');
      const matchesSearch = name.includes(query);
      const matchesLocation = location === 'all' || cardLocation === location;
      card.style.display = (matchesSearch && matchesLocation) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterSalons);
  locationFilter.addEventListener('change', filterSalons);
});

/* ============================================
   LIGHTBOX
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  const galleryImages = document.querySelectorAll('.gallery-item img, .service-detail-images img');
  if (galleryImages.length === 0) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <img src="" alt="">
    <p class="lightbox-caption"></p>
  `;
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector('img');
  const overlayCaption = overlay.querySelector('.lightbox-caption');
  const closeBtn = overlay.querySelector('.lightbox-close');

  function openLightbox(img) {
    overlayImg.src = img.src;
    overlayImg.alt = img.alt;
    const caption = img.closest('.gallery-item')?.querySelector('.gallery-caption');
    overlayCaption.textContent = caption ? caption.textContent : img.alt;
    overlay.classList.add('show');
  }

  function closeLightbox() {
    overlay.classList.remove('show');
  }

  galleryImages.forEach(function (img) {
    img.addEventListener('click', function () {
      openLightbox(img);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
});

/* ============================================
   SERVICE / PRODUCT DROPDOWNS
   ============================================ */

function toggleDropdown(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.classList.toggle('open');
}

/* ============================================
   BOOKING CART
   Each booking page declares window.BOOKING_CONFIG
   with its salon name and available services.
   ============================================ */

function initBookingCart() {
  const config = window.BOOKING_CONFIG;
  const list = document.getElementById('serviceList');
  if (!config || !list) return;

  const selected = new Map();

  // Build the selectable rows
  config.services.forEach(function (service) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'select-row';
    row.setAttribute('data-service', service.name);
    row.setAttribute('aria-pressed', 'false');
    row.innerHTML =
      '<span class="select-mark" aria-hidden="true"></span>' +
      '<span class="select-body">' +
        '<span class="select-name">' + service.name + '</span>' +
        '<span class="select-desc">' + service.desc + '</span>' +
      '</span>' +
      '<span class="select-fee">R' + service.fee + '</span>';

    row.addEventListener('click', function () {
      if (selected.has(service.name)) {
        selected.delete(service.name);
        row.classList.remove('is-selected');
        row.setAttribute('aria-pressed', 'false');
      } else {
        selected.set(service.name, service.fee);
        row.classList.add('is-selected');
        row.setAttribute('aria-pressed', 'true');
      }
      updateCart();
    });

    list.appendChild(row);
  });

  const bar = document.getElementById('cartBar');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  const continueBtn = document.getElementById('cartContinue');

  function updateCart() {
    let total = 0;
    selected.forEach(fee => total += fee);
    const count = selected.size;

    countEl.textContent = count === 0
      ? 'No services selected'
      : count + (count === 1 ? ' service' : ' services');
    totalEl.textContent = 'R' + total;

    if (count > 0) {
      bar.classList.add('is-active');
      continueBtn.disabled = false;
    } else {
      bar.classList.remove('is-active');
      continueBtn.disabled = true;
    }
  }

  continueBtn.addEventListener('click', function () {
    if (selected.size === 0) return;
    const items = [];
    selected.forEach(function (fee, name) {
      items.push(name + ':' + fee);
    });
    const params = new URLSearchParams({
      salon: config.salonName,
      back: config.backLink,
      items: items.join(',')
    });
    window.location.href = 'booking-payment.html?' + params.toString();
  });

  updateCart();
}

document.addEventListener('DOMContentLoaded', initBookingCart);

/* ============================================
   PAYMENT SUMMARY
   Reads the cart from the URL on the payment page.
   ============================================ */

function initPaymentSummary() {
  const summaryList = document.getElementById('summaryList');
  if (!summaryList) return;

  const params = new URLSearchParams(window.location.search);
  const salon = params.get('salon');
  const back = params.get('back');
  const items = params.get('items');

  const salonEl = document.getElementById('summarySalon');
  if (salon && salonEl) salonEl.textContent = salon;

  const backEl = document.getElementById('backLink');
  if (back && backEl) backEl.setAttribute('href', back);

  if (!items) return;

  let total = 0;
  items.split(',').forEach(function (pair) {
    const parts = pair.split(':');
    const name = parts[0];
    const fee = parseInt(parts[1], 10) || 0;
    total += fee;

    const row = document.createElement('div');
    row.className = 'summary-row';
    row.innerHTML =
      '<span class="summary-name">' + name + '</span>' +
      '<span class="summary-fee">R' + fee + '</span>';
    summaryList.appendChild(row);
  });

  const totalEl = document.getElementById('summaryTotal');
  if (totalEl) totalEl.textContent = 'R' + total;
}

document.addEventListener('DOMContentLoaded', initPaymentSummary);