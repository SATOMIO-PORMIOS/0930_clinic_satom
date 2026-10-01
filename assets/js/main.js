(() => {
  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const answer = document.getElementById(question.getAttribute('aria-controls'));
      if (!answer) return;
      const open = question.getAttribute('aria-expanded') !== 'true';
      question.setAttribute('aria-expanded', String(open));
      answer.hidden = !open;
    });
  });
  const menuButton = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  const hero = document.querySelector('.hero');
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!window.confirm('電話をかけますか？')) event.preventDefault();
    });
  });
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const updateBackToTop = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }
  const sectionLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')].map((link) => ({
    link,
    section: document.querySelector(link.getAttribute('href'))
  })).filter((item) => item.section) : [];

  if (sectionLinks.length) {
    const updateActiveSection = () => {
      const navBottom = nav.classList.contains('is-fixed') ? nav.getBoundingClientRect().bottom : 0;
      const marker = Math.max(navBottom + 1, window.innerHeight * 0.35);
      let active = null;
      let nearestTop = -Infinity;
      sectionLinks.forEach((item) => {
        const top = item.section.getBoundingClientRect().top;
        if (top <= marker && top > nearestTop) {
          active = item;
          nearestTop = top;
        }
      });
      sectionLinks.forEach(({ link }) => {
        const selected = link === active?.link;
        link.classList.toggle('is-active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    if (nav && hero) {
      const updateAfterStickyNav = () => requestAnimationFrame(updateActiveSection);
      window.addEventListener('scroll', updateAfterStickyNav, { passive: true });
      window.addEventListener('resize', updateAfterStickyNav);
    }
    updateActiveSection();
  }

  if (nav && hero) {
    const updateStickyNav = () => {
      nav.classList.toggle('is-fixed', hero.getBoundingClientRect().bottom <= 0);
    };
    window.addEventListener('scroll', updateStickyNav, { passive: true });
    window.addEventListener('resize', updateStickyNav);
    updateStickyNav();
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'メニューを開く');
      });
    });
  }

  const heroHours = document.querySelector('.hours-table--hero');
  if (heroHours) {
    const heading = document.querySelector('#hero-hours-title');
    if (heading) {
      let status = heading.querySelector('.hero-hours__status');
      if (!status) {
        status = document.createElement('span');
        status.className = 'hero-hours__status';
        heading.append(status);
      }
      const reservationPrompt = document.createElement('a');
      reservationPrompt.className = 'hero-hours__status-link';
      reservationPrompt.href = document.querySelector('.hero-reserve--web')?.getAttribute('href') || '#contact';
      reservationPrompt.textContent = 'Web予約をご利用ください';
      const tokyoClock = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      });
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const updateStatus = () => {
        const parts = tokyoClock.formatToParts(new Date());
        const weekday = parts.find((part) => part.type === 'weekday').value;
        const weekdayIndex = weekdays.indexOf(weekday);
        const hour = Number(parts.find((part) => part.type === 'hour').value);
        const minute = Number(parts.find((part) => part.type === 'minute').value);
        const time = hour * 60 + minute;
        heroHours.querySelectorAll('tr').forEach((row) => {
          [...row.children].forEach((cell) => cell.classList.remove('is-today'));
          row.children[weekdayIndex + 1]?.classList.add('is-today');
        });

        const closedToday = weekday === 'Thu' || weekday === 'Sun' || (weekday === 'Sat' && time >= 12 * 60);
        const receptionOpen = (time >= 8 * 60 && time < 11 * 60) || (time >= 12 * 60 && time < 17 * 60);
        const clinicOpen = (time >= 9 * 60 && time < 12 * 60) || (time >= 13 * 60 && time < 18 * 60);
        const afternoonBreak = weekday !== 'Sat' && time >= 12 * 60 && time < 13 * 60;
        let message;
        let isClosed = false;
        let shouldPromptReservation = false;

        if (closedToday) {
          message = '\u672c\u65e5\u306f\u4f11\u8a3a\u65e5\u3067\u3059';
          isClosed = true;
          shouldPromptReservation = true;
        } else if (afternoonBreak) {
          message = '\u5348\u5f8c\u306f13:00\u304b\u3089\u3067\u3059';
        } else if (receptionOpen) {
          message = '\u73fe\u5728\uff1a\u8a3a\u7642\u4e2d\u3067\u3059\uff08\u53d7\u4ed8\u4e2d\uff09';
        } else if (clinicOpen) {
          message = '\u8a3a\u7642\u4e2d\u3067\u3059\u304c\u53d7\u4ed8\u306f\u7d42\u4e86\u3057\u307e\u3057\u305f';
          isClosed = true;
          shouldPromptReservation = true;
        } else {
          message = '\u8a3a\u7642\u6642\u9593\u5916\u3067\u3059';
          isClosed = true;
          shouldPromptReservation = true;
        }

        status.textContent = message;
        if (shouldPromptReservation) status.append(' ', reservationPrompt);
        status.classList.toggle('is-closed', isClosed);
      };
      updateStatus();
      window.setInterval(updateStatus, 60000);
    }
  }
  const mq = window.matchMedia('(max-width: 480px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tracks = [
    document.querySelector('.service-grid'),
    document.querySelector('.staff-grid')
  ].filter(Boolean);

  function setupCarousel(track) {
    if (track.dataset.carouselReady === 'true') return;
    const items = [...track.children];
    if (items.length < 2) return;
    if (!track.id) track.id = track.classList.contains('service-grid') ? 'services-carousel' : 'staff-carousel';

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', `${track.closest('#services, #staff')?.querySelector('.section-title h2')?.textContent || 'カード'}のページ切り替え`);
    const status = document.createElement('span');
    status.className = 'visually-hidden';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    dots.append(status);

    const buttons = items.map((item, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `${index + 1}枚目を表示`);
      dot.setAttribute('aria-controls', track.id);
      dot.addEventListener('click', () => {
        const left = item.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
        track.scrollTo({ left, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      });
      dots.append(dot);
      return dot;
    });
    track.insertAdjacentElement('afterend', dots);

    let activeIndex = -1;
    const update = () => {
      const trackLeft = track.getBoundingClientRect().left;
      let closest = 0;
      items.forEach((item, index) => {
        const distance = Math.abs(item.getBoundingClientRect().left - trackLeft);
        if (distance < Math.abs(items[closest].getBoundingClientRect().left - trackLeft)) closest = index;
      });
      if (closest === activeIndex) return;
      activeIndex = closest;
      buttons.forEach((button, index) => {
        const active = index === activeIndex;
        button.classList.toggle('is-active', active);
        if (active) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      status.textContent = `${activeIndex + 1}枚目 / ${items.length}枚`;
    };

    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
    track.__updateCarousel = update;
    track.dataset.carouselReady = 'true';
    update();
  }

  function syncCarousels() {
    tracks.forEach((track) => {
      if (mq.matches) {
        setupCarousel(track);
        track.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        track.scrollTo({ left: 0, behavior: 'auto' });
        track.__updateCarousel?.();
      }
    });
  }

  syncCarousels();
  if (mq.addEventListener) mq.addEventListener('change', syncCarousels);
  else mq.addListener(syncCarousels);
})();
