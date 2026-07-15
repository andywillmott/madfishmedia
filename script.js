// Attempt to pull real Vimeo thumbnails client-side (works from a real visitor's
// browser even though server-side fetches get blocked as bot traffic). Falls back
// silently to the existing icon-only card design if this fails for any reason.
document.querySelectorAll('.work-card[data-vimeo]').forEach(card => {
  const id = card.dataset.vimeo;
  const hash = card.dataset.hash;
  const vimeoUrl = `https://vimeo.com/${id}${hash ? '/' + hash : ''}`;
  fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoUrl)}`)
    .then(res => { if (!res.ok) throw new Error('oEmbed request failed'); return res.json(); })
    .then(data => {
      if (!data.thumbnail_url) return;
      const img = document.createElement('img');
      img.src = data.thumbnail_url;
      img.alt = data.title || 'Mad Fish Media video';
      img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0';
      img.onload = () => card.prepend(img);
    })
    .catch(() => { /* Vimeo blocked the request — keep the icon-only card, no visual change needed */ });
});

// Mobile menu toggle
const menu = document.getElementById('mobileMenu');
const burger = document.getElementById('burger');
if (burger) {
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
}

// Scroll reveal
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Inline video play buttons (data-video="VIMEO_ID")
document.querySelectorAll('[data-play]').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.play;
    const screen = btn.closest('.screen');
    screen.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Mad Fish Media video"></iframe>`;
  });
});

// Featured work: category filtering, driven by ?cat= in the URL
const filterButtons = document.querySelectorAll('.filter');
if (filterButtons.length) {
  const applyFilter = (cat) => {
    filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
    document.querySelectorAll('#workGrid .work-card').forEach(c => {
      c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
    });
  };
  filterButtons.forEach(b => b.addEventListener('click', () => {
    applyFilter(b.dataset.filter);
    const url = new URL(location.href);
    if (b.dataset.filter === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', b.dataset.filter);
    history.replaceState(null, '', url);
  }));
  const initialCat = new URLSearchParams(location.search).get('cat') || 'all';
  applyFilter(initialCat);
}

// Lightbox video player (data-vimeo="ID" [data-hash="HASH"])
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxInner = document.getElementById('lightboxInner');
  const lightboxClose = document.getElementById('lightboxClose');
  const openLightbox = (id, hash) => {
    const src = `https://player.vimeo.com/video/${id}?autoplay=1${hash ? '&h=' + hash : ''}`;
    lightboxInner.innerHTML = `<iframe src="${src}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" allowfullscreen title="Mad Fish Media video"></iframe>`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightboxInner.innerHTML = '';
    document.body.style.overflow = '';
  };
  document.querySelectorAll('[data-vimeo]').forEach(el => {
    el.addEventListener('click', () => openLightbox(el.dataset.vimeo, el.dataset.hash));
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// Contact form submission via Formspree — redirects to a dedicated thank-you
// page on success so it has its own trackable URL for Google Ads conversion goals.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    const button = contactForm.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending...';
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        window.location.href = contactForm.dataset.redirect || 'thankyou.html';
        return;
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      status.textContent = 'Something went wrong — please call us instead, or email directly.';
      status.className = 'form-status show err';
      button.textContent = 'Send message';
    }
    button.disabled = false;
  });
}
