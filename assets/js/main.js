(() => {
  const menuButton = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

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

