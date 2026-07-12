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

// Contact form submission via Formspree
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
        status.textContent = "Thanks — we've got your message and will be in touch shortly.";
        status.className = 'form-status show ok';
        contactForm.reset();
        button.textContent = 'Send message';
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
