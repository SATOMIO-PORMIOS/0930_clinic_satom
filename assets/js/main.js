(() => {
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
      const marker = window.innerHeight * 0.35;
      let active = sectionLinks[0];
      sectionLinks.forEach((item) => {
        if (item.section.getBoundingClientRect().top <= marker) active = item;
      });
      sectionLinks.forEach(({ link, section }) => {
        const selected = link === active.link;
        link.classList.toggle('is-active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
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
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', weekday: 'short' }).format(new Date());
    const weekdayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(weekday) + 1;
    heroHours.querySelectorAll('tr').forEach((row) => {
      row.children[weekdayIndex]?.classList.add('is-today');
    });

    const heading = document.querySelector('#hero-hours-title');
    if (heading) {
      let status = heading.querySelector('.hero-hours__status');
      if (!status) {
        status = document.createElement('span');
        status.className = 'hero-hours__status';
        heading.append(status);
      }
      const updateStatus = () => {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).formatToParts(new Date());
        const hour = Number(parts.find((part) => part.type === 'hour').value);
        const minute = Number(parts.find((part) => part.type === 'minute').value);
        const time = hour * 60 + minute;
        const morningOpen = time >= 9 * 60 && time < 12 * 60;
        const afternoonOpen = time >= 13 * 60 && time < 18 * 60;
        const openToday = weekdayIndex !== 4 && weekdayIndex !== 7 && !(weekdayIndex === 6 && afternoonOpen);
        const isOpen = openToday && (morningOpen || afternoonOpen);
        status.textContent = isOpen
          ? '\u73fe\u5728\uff1a\u8a3a\u7642\u6642\u9593\u5185\u3067\u3059'
          : '\u73fe\u5728\uff1a\u8a3a\u7642\u6642\u9593\u5916\u3067\u3059';
        status.classList.toggle('is-closed', !isOpen);
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
