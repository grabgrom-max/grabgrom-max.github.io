document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const allModals = document.querySelectorAll('.modal');

    burger.addEventListener('click', () => nav.classList.toggle('active'));

    // ===================== PHONE MASK =====================
    function phoneMask(value) {
        let digits = value.replace(/\D/g, '');
        if (digits.length === 0) return '';
        if (digits[0] === '8') digits = '7' + digits.slice(1);
        if (digits[0] !== '7') digits = '7' + digits;
        let result = '+7';
        if (digits.length > 1) result += ' (' + digits.slice(1, 4);
        if (digits.length >= 4) result += ') ';
        if (digits.length > 4) result += digits.slice(4, 7);
        if (digits.length > 7) result += '-' + digits.slice(7, 9);
        if (digits.length > 9) result += '-' + digits.slice(9, 11);
        return result;
    }

    document.querySelectorAll('[data-mask="phone"]').forEach(input => {
        input.addEventListener('input', () => {
            const pos = input.selectionStart;
            const oldLen = input.value.length;
            input.value = phoneMask(input.value);
            const newLen = input.value.length;
            input.setSelectionRange(pos + (newLen - oldLen), pos + (newLen - oldLen));
        });
        input.addEventListener('focus', () => {
            if (!input.value) input.value = '+7';
        });
        input.addEventListener('blur', () => {
            if (input.value === '+7') input.value = '';
        });
    });

    // ===================== VALIDATION =====================
    const validators = {
        name(value) {
            value = value.trim();
            if (!value) return 'Введите имя';
            if (value.length < 2) return 'Имя слишком короткое';
            return '';
        },
        phone(value) {
            const digits = value.replace(/\D/g, '');
            if (!digits) return 'Введите телефон';
            if (digits.length < 11) return 'Введите полный номер';
            return '';
        }
    };

    function validateField(input) {
        const type = input.getAttribute('data-validate');
        if (!type || !validators[type]) return true;
        const error = validators[type](input.value);
        const field = input.closest('.form__field');
        const errorEl = field ? field.querySelector('.form__error') : null;
        if (error) {
            if (field) field.classList.add('error');
            if (errorEl) errorEl.textContent = error;
            return false;
        } else {
            if (field) field.classList.remove('error');
            if (errorEl) errorEl.textContent = '';
            return true;
        }
    }

    document.querySelectorAll('[data-validate]').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            const field = input.closest('.form__field');
            if (field && field.classList.contains('error')) validateField(input);
        });
    });

    function validateForm(form) {
        let valid = true;
        form.querySelectorAll('[data-validate]').forEach(input => {
            if (!validateField(input)) valid = false;
        });
        const consent = form.querySelector('[name="consent"]');
        if (consent && !consent.checked) {
            consent.closest('.form__check').style.outline = '2px solid #dc2626';
            consent.closest('.form__check').style.borderRadius = '4px';
            valid = false;
            setTimeout(() => {
                consent.closest('.form__check').style.outline = '';
            }, 2000);
        }
        return valid;
    }

    // ===================== AJAX FORM SUBMIT =====================
    function submitForm(form, onSuccess) {
        if (!validateForm(form)) return;
        const btn = form.querySelector('[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Отправка...';
        form.classList.add('form--sending');

        const data = new FormData(form);

        fetch(form.getAttribute('action') || 'send.php', {
            method: 'POST',
            body: data
        })
        .then(r => r.json())
        .then(res => {
            form.classList.remove('form--sending');
            btn.innerHTML = originalText;
            if (res.ok) {
                if (onSuccess) onSuccess(res.message);
                form.reset();
            } else {
                alert(res.error || 'Ошибка отправки');
            }
        })
        .catch(() => {
            form.classList.remove('form--sending');
            btn.innerHTML = originalText;
            alert('Ошибка сети. Попробуйте позвонить нам.');
        });
    }

    // Contact form
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        submitForm(contactForm, msg => {
            alert(msg || 'Спасибо за заявку! Мы свяжемся с вами.');
        });
    });

    // Callback modal form
    const callbackForm = document.getElementById('callbackForm');
    callbackForm.addEventListener('submit', e => {
        e.preventDefault();
        submitForm(callbackForm, msg => {
            alert(msg || 'Спасибо! Мы перезвоним вам в ближайшее время.');
            closeAllModals();
        });
    });

    // ===================== MODALS =====================
    document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const name = btn.getAttribute('data-modal');
            let m;
            if (name === 'privacy') {
                m = document.getElementById('modalPrivacy');
            } else {
                m = document.getElementById('modal');
            }
            if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
        });
    });

    function closeAllModals() {
        allModals.forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
    }

    allModals.forEach(m => {
        m.querySelector('.modal__backdrop').addEventListener('click', closeAllModals);
        m.querySelector('.modal__close').addEventListener('click', closeAllModals);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAllModals();
    });

    // ===================== HEADER SCROLL =====================
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        header.style.borderBottomColor = window.pageYOffset > 50
            ? 'rgba(22,163,74,0.2)' : 'var(--border)';
    });

    // ===================== FAQ =====================
    document.querySelectorAll('.faq__q').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq__item');
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq__item.active').forEach(i => i.classList.remove('active'));
            if (!wasActive) item.classList.add('active');
        });
    });

    // ===================== SCROLL ANIMATIONS =====================
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.svc, .portfolio__item, .test, .about__feature, .faq__item, .contacts__item, .process__step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)';
        observer.observe(el);
    });

    // ===================== SMOOTH SCROLL =====================
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            if (this.hasAttribute('data-modal')) return;
            e.preventDefault();
            const t = document.querySelector(this.getAttribute('href'));
            if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); nav.classList.remove('active'); }
        });
    });

    // ===================== COOKIE =====================
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieAccept = document.getElementById('cookieAccept');
    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => cookieBanner.classList.add('active'), 1000);
    }
    cookieAccept.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.remove('active');
    });
});

// Spin animation for loader
const style = document.createElement('style');
style.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
document.head.appendChild(style);