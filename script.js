/* script.js
   - Чистый JS слайдер (адаптивный)
   - IntersectionObserver для анимаций
   - Mobile nav toggle
   - Подстановка ссылок Telegram (Rusban4k) и контактных данных
*/

(function () {
  // ====== Настройки (замените PHONE/EMAIL если нужно) ======
  const TG_USERNAME = "Rusban4k"; // без @
  const PHONE = "+7 (989) 768-99-21";
  const PHONE_TEL = "+79897689921"; // формат для tel:
  const EMAIL = "rusban4k@gmail.com";

  // ====== DOMContentLoaded ======
  document.addEventListener('DOMContentLoaded', () => {
    // Подставим ссылки
    const tgLink = `tg://resolve?domain=${encodeURIComponent(TG_USERNAME)}`;
    const tgWebLink = `https://t.me/${encodeURIComponent(TG_USERNAME)}`;
    const heroBtn = document.getElementById('heroTelegramBtn');
    const footerBtn = document.getElementById('footerTelegramBtn');

    if (heroBtn) heroBtn.setAttribute('href', tgLink);
    if (footerBtn) footerBtn.setAttribute('href', tgLink);

    // Footer: tel / email
    const telLink = document.getElementById('telLink');
    const emailLink = document.getElementById('emailLink');
    if (telLink) {
      telLink.setAttribute('href', `tel:${PHONE_TEL}`);
      telLink.textContent = PHONE;
    }
    if (emailLink) {
      emailLink.setAttribute('href', `mailto:${EMAIL}`);
      emailLink.textContent = EMAIL;
    }

    // год
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Инициализация слайдера
    initSlider();

    // Анимации появления
    initScrollAnimations();

    // Mobile nav
    initNavToggle();

    // Сделаем клики на карточках ботов открывать web t.me ссылки в новом окне, если нужно
    normalizePortfolioLinks(tgWebLink);
  });

  // ====== Normalize portfolio links for bots (convert tg links to web t.me) ======
  function normalizePortfolioLinks(tgWebLink) {
    // Если карточки уже указывают на tg:// — не всегда удобно в браузере. Меняем только если href содержит "t.me" или "tg://"
    document.querySelectorAll('.slide').forEach(a => {
      try {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('tg://') && tgWebLink) {
          a.setAttribute('href', tgWebLink);
          a.setAttribute('target', '_blank');
        } else if (href.startsWith('https://t.me') || href.startsWith('http://t.me')) {
          // уже ок
        }
      } catch (e) { /* ignore */ }
    });
  }

  // ====== Mobile nav toggle ======
  function initNavToggle() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // ====== IntersectionObserver animations ======
  function initScrollAnimations() {
    const obsOptions = { root: null, rootMargin: '0px', threshold: 0.12 };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, obsOptions);

    document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
  }

  // ====== Slider (чистый JS) ======
  function initSlider() {
    const slider = document.getElementById('portfolioSlider');
    if (!slider) return;
    const track = slider.querySelector('.slider-track');
    const slides = Array.from(track.querySelectorAll('.slide'));
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const dotsWrap = document.getElementById('sliderDots');

    let currentIndex = 0;
    let perView = calcPerView();
    let totalSlides = slides.length;
    let maxIndex = Math.max(0, Math.ceil(totalSlides / perView) - 1);

    // Создаем точки
    function renderDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Перейти к странице ' + (i + 1));
        dot.addEventListener('click', () => {
          goTo(i);
        });
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = Array.from(dotsWrap.children);
      dots.forEach((d, idx) => d.classList.toggle('active', idx === currentIndex));
    }

    function calcPerView() {
      const w = window.innerWidth;
      if (w >= 1100) return 3;
      if (w >= 700) return 2;
      return 1;
    }

    function resizeHandler() {
      const newPer = calcPerView();
      if (newPer !== perView) {
        perView = newPer;
        maxIndex = Math.max(0, Math.ceil(totalSlides / perView) - 1);
        currentIndex = Math.min(currentIndex, maxIndex);
        renderDots();
        update();
      } else {
        update(); // все равно подгоняем позицию
      }
    }

    function update() {
      // вычисляем смещение
      // каждый "страница" это perView слайдов
      const slideWidth = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
      const offset = currentIndex * perView * (slideWidth);
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
      updateButtons();
    }

    function updateButtons() {
      if (prevBtn) prevBtn.disabled = currentIndex <= 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      update();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // touch support
    let startX = 0;
    let isDragging = false;
    let lastTranslate = 0;

    track.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX;
      track.style.transition = 'none';
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      track.style.transform = `translateX(${ -currentIndex * perView * (slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0)) + dx }px)`;
    });

    track.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
      const dx = e.clientX - startX;
      const threshold = 50;
      if (dx > threshold) goTo(currentIndex - 1);
      else if (dx < -threshold) goTo(currentIndex + 1);
      else update();
    });

    // mouse leave as up
    track.addEventListener('pointercancel', () => {
      isDragging = false;
      track.style.transition = '';
      update();
    });

    // init
    renderDots();
    update();

    // resize observer
    window.addEventListener('resize', debounce(resizeHandler, 120));
  }

  // ====== debounce ======
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

})();
