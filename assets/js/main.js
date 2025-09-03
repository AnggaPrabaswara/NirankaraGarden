// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Smooth scroll for in-page anchors
document.addEventListener('click', (e) => {
  const el = e.target.closest('a[href^="#"]');
  if (!el) return;
  const hash = el.getAttribute('href');
  if (hash.length > 1) {
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// Gallery modal logic (delegated)
const modalOverlay = document.getElementById('modalOverlay');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalClose = document.getElementById('modalClose');

// Reveal on scroll using IntersectionObserver
const observer = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }) : null;

function initReveals() {
  if (!observer) return;
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function openModal(data) {
  if (!modalOverlay) return;
  if (modalImg) modalImg.src = data.image || '';
  if (modalTitle) modalTitle.textContent = data.title || '';
  if (modalDesc) modalDesc.textContent = data.desc || '';
  modalOverlay.classList.add('open');
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
}

if (modalClose && modalOverlay) {
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

document.addEventListener('click', (e) => {
  const item = e.target.closest('[data-gallery-item]');
  if (!item) return;
  const data = {
    image: item.getAttribute('data-image'),
    title: item.getAttribute('data-title'),
    desc: item.getAttribute('data-desc')
  };
  openModal(data);
});

// Filters
const filterContainer = document.getElementById('filters');
if (filterContainer) {
  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    const filter = btn.getAttribute('data-filter');
    const items = document.querySelectorAll('[data-category]');
    btn.parentElement.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    items.forEach((it) => {
      const cat = it.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        it.style.display = '';
      } else {
        it.style.display = 'none';
      }
    });
  });
}

// Contact form → WhatsApp quick message
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.querySelector('input[name="name"]').value.trim();
    const message = contactForm.querySelector('textarea[name="message"]').value.trim();
    if (!name || !message) {
      alert('Mohon lengkapi nama dan pesan.');
      return;
    }

    const WA_NUMBER = '6285173001474';
    const text = `Halo Admin, saya ${name}.%0A%0APesan:%0A${message}`;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${text}`;

    // Try opening in a new tab; fallback to same-tab navigation if blocked
    const win = window.open(waUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = waUrl;
    }

    contactForm.reset();
  });
}

// Order form functionality
const orderModalOverlay = document.getElementById('orderModalOverlay');
const orderModalClose = document.getElementById('orderModalClose');
const orderForm = document.getElementById('orderForm');
const cancelOrderBtn = document.getElementById('cancelOrder');
const pickupLocationSelect = document.getElementById('pickupLocation');
const addressGroup = document.getElementById('addressGroup');
const mobilePickupList = document.getElementById('mobilePickupList');

// Open order modal
function openOrderModal(plantName, plantPrice) {
  if (!orderModalOverlay) return;
  
  const plantNameInput = document.getElementById('plantName');
  if (plantNameInput) {
    plantNameInput.value = plantName;
  }
  const plantPriceInput = document.getElementById('plantPrice');
  if (plantPriceInput) {
    plantPriceInput.value = plantPrice || '';
  }
  
  // Set plant name in form title or add price info
  const modalTitle = orderModalOverlay.querySelector('h3');
  if (modalTitle) {
    modalTitle.textContent = `Form Pemesanan - ${plantName}`;
  }
  
  orderModalOverlay.classList.add('open');
  // initialize reveals when opening modal (for any reveal elements inside)
  initReveals();
}

// Close order modal
function closeOrderModal() {
  if (!orderModalOverlay) return;
  orderModalOverlay.classList.remove('open');
  if (orderForm) {
    orderForm.reset();
  }
  if (addressGroup) {
    addressGroup.style.display = 'none';
  }
  if (mobilePickupList) {
    mobilePickupList.querySelectorAll('input[type="radio"][name="pickupLocationMobile"]').forEach((r) => { r.checked = false; });
  }
}

// Handle pickup location change
if (pickupLocationSelect && addressGroup) {
  pickupLocationSelect.addEventListener('change', (e) => {
    if (e.target.value === '🚚 Pengiriman ke alamat') {
      addressGroup.style.display = 'block';
      document.getElementById('address').required = true;
    } else {
      addressGroup.style.display = 'none';
      document.getElementById('address').required = false;
    }
    if (mobilePickupList) {
      mobilePickupList.querySelectorAll('input[type="radio"][name="pickupLocationMobile"]').forEach((r) => {
        r.checked = (r.value === e.target.value);
      });
    }
  });
}

// Sync mobile radio list with select
if (mobilePickupList && pickupLocationSelect) {
  mobilePickupList.addEventListener('change', (e) => {
    const radio = e.target.closest('input[type="radio"][name="pickupLocationMobile"]');
    if (!radio) return;
    pickupLocationSelect.value = radio.value;
    pickupLocationSelect.dispatchEvent(new Event('change'));
  });
}

// Order form submission
if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(orderForm);
    const plantName = formData.get('plantName');
    const plantPrice = formData.get('plantPrice');
    const customerName = formData.get('customerName');
    const pickupLocation = formData.get('pickupLocation');
    const address = formData.get('address');
    const phone = formData.get('phone');
    
    if (!customerName || !pickupLocation || !phone) {
      alert('Mohon lengkapi semua field yang wajib diisi.');
      return;
    }
    
    if (pickupLocation === '🚚 Pengiriman ke alamat' && !address) {
      alert('Mohon masukkan alamat lengkap untuk pengiriman.');
      return;
    }
    
    // Format phone number (remove non-digits and ensure it starts with 62)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone;
    }
    
    // Create WhatsApp message
    let message = `Halo Admin Nirankara Bali!%0A%0A`;
    message += `Saya ingin memesan tanaman dengan detail sebagai berikut:%0A%0A`;
    message += ` *Nama Tanaman:* ${plantName}%0A`;
    message += ` *Nama Pembeli:* ${customerName}%0A`;
    if (plantPrice) {
      message += ` *Harga:* ${plantPrice}%0A`;
    }
    message += ` *Nomor WhatsApp:* ${phone}%0A`;
    message += ` *Lokasi Pengambilan:* ${pickupLocation}%0A`;
    
    if (pickupLocation === '🚚 Pengiriman ke alamat' && address) {
      message += `🏠 *Alamat Lengkap:* ${address}%0A`;
    }
    
    message += `%0ATerima kasih!`;
    
    const WA_NUMBER = '6285173001474';
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${message}`;
    
    // Try opening in a new tab; fallback to same-tab navigation if blocked
    const win = window.open(waUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = waUrl;
    }
    
    closeOrderModal();
  });
}

// Event listeners for order modal
if (orderModalClose) {
  orderModalClose.addEventListener('click', closeOrderModal);
}

if (cancelOrderBtn) {
  cancelOrderBtn.addEventListener('click', closeOrderModal);
}

if (orderModalOverlay) {
  orderModalOverlay.addEventListener('click', (e) => {
    if (e.target === orderModalOverlay) closeOrderModal();
  });
}

// Handle order button clicks
document.addEventListener('click', (e) => {
  const orderBtn = e.target.closest('.order-btn');
  if (!orderBtn) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const plantName = orderBtn.getAttribute('data-plant');
  const plantPrice = orderBtn.getAttribute('data-price');
  
  if (plantName) {
    openOrderModal(plantName, plantPrice);
  }
});

// Kick off reveals on initial load
window.addEventListener('DOMContentLoaded', initReveals);
