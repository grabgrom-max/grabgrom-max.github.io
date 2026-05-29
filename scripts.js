// Функция анимации счётчиков
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 2000;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString('ru-RU');
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString('ru-RU');
  }
  requestAnimationFrame(update);
}

function animateCountersIn(container) {
  container.querySelectorAll('[data-count]').forEach(c => {
    if (c.dataset.animated) return;
    c.dataset.animated = '1';
    animateCounter(c);
  });
}

window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hide');

    const heroStats = document.getElementById('heroStats');
    setTimeout(() => {
      heroStats.classList.add('visible');
      animateCountersIn(heroStats);
    }, 300);
  }, 1800);
});

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('active');
  burger.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    burger.classList.remove('active');
    document.body.style.overflow = '';
  });
});

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const t = document.querySelector(href);
    if (t) {
      const top = t.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animateCountersIn(entry.target);
    }
  });
}, { threshold: .12 });
revealEls.forEach(el => revealObs.observe(el));

document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const active = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('active');
      i.querySelector('.faq-a').style.maxHeight = '0';
    });
    if (!active) {
      item.classList.add('active');
      const a = item.querySelector('.faq-a');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

const phone = document.getElementById('phone');
phone.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 0) {
    if (v[0] === '7' || v[0] === '8') v = v.substring(1);
    let f = '+7';
    if (v.length > 0) f += ' (' + v.substring(0, 3);
    if (v.length >= 3) f += ') ' + v.substring(3, 6);
    if (v.length >= 6) f += '-' + v.substring(6, 8);
    if (v.length >= 8) f += '-' + v.substring(8, 10);
    e.target.value = f;
  }
});

const form = document.getElementById('contactForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  showToast('Заявка принята // Инженер свяжется в течение 30 минут');
  form.reset();
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}