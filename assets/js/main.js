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
  const carousels = [
    document.querySelector('.service-grid'),
    document.querySelector('.staff-grid')
  ].filter(Boolean);

  function setupCarousel(track) {
    if (track.dataset.carouselReady === 'true') return;
    const items = [...track.children];
    if (items.length < 2) return;

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('aria-label', 'スライドページ');

    const buttons = items.map((item, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `carousel-dot${index === 0 ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `${index + 1}枚目を表示`);
      dot.addEventListener('click', () => {
        track.scrollTo({left: item.offsetLeft - track.offsetLeft, behavior: 'smooth'});
      });
      dots.appendChild(dot);
      return dot;
    });

    track.insertAdjacentElement('afterend', dots);

    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const width = track.clientWidth || 1;
        const index = Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / width)));
        buttons.forEach((button, i) => button.classList.toggle('is-active', i === index));
      });
    }, {passive: true});

    track.dataset.carouselReady = 'true';
  }

  function initCarousels() {
    if (mq.matches) carousels.forEach(setupCarousel);
  }

  initCarousels();
  mq.addEventListener?.('change', initCarousels);
})();
