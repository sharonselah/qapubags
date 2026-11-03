const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Announcement bar: rotate messages every 5 seconds
const messages = document.querySelectorAll('#announcements li');
if (messages.length > 1) {
  let current = 0;
  setInterval(() => {
    if (document.hidden) return;
    messages[current].classList.remove('is-active');
    current = (current + 1) % messages.length;
    messages[current].classList.add('is-active');
  }, 5000);
}

// Header: hide when scrolling down, show again when scrolling up
const header = document.querySelector('.header');
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const menuOpen = nav.classList.contains('is-open');
  header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > header.offsetHeight + header.offsetTop);
  lastY = y;
}, { passive: true });

// Mobile menu
const closeMenu = () => {
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', false);
};
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// Hero slideshow: autoplay every 5s, pauses on hover/focus or when the tab is hidden
const slideshow = document.getElementById('slideshow');
if (slideshow) {
  const track = slideshow.querySelector('.slideshow__track');
  const slides = [...slideshow.querySelectorAll('.slide')];
  const dotsWrap = slideshow.querySelector('.slideshow__dots');
  let index = 0;
  let timer;

  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Slide ${i + 1}`);
    b.addEventListener('click', () => { go(i); restart(); });
    dotsWrap.appendChild(b);
    return b;
  });

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((s, n) => { s.inert = n !== index; });
    dots.forEach((d, n) => d.setAttribute('aria-selected', n === index));
    slideshow.classList.toggle('on-dark', slides[index].classList.contains('slide--light-text'));
  }
  const start = () => { if (!reduceMotion) timer = setInterval(() => go(index + 1), 5000); };
  const stop = () => clearInterval(timer);
  const restart = () => { stop(); start(); };

  slideshow.querySelector('.slideshow__arrow--prev').addEventListener('click', () => { go(index - 1); restart(); });
  slideshow.querySelector('.slideshow__arrow--next').addEventListener('click', () => { go(index + 1); restart(); });
  slideshow.addEventListener('mouseenter', stop);
  slideshow.addEventListener('mouseleave', start);
  slideshow.addEventListener('focusin', stop);
  slideshow.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : restart()));

  // Swipe on touch screens
  let touchX = null;
  slideshow.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  slideshow.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    touchX = null;
  });

  go(0);
  start();
}

// Fade sections in as they scroll into view
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
