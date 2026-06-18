(() => {
    const toggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('#mobileNav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', () => {
            const open = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let index = 0;
        let timer = null;

        const show = (next) => {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        };

        const start = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(() => show(index + 1), 5200);
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                show(i);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    document.querySelectorAll('[data-filter-list]').forEach((list) => {
        const scope = list.closest('main') || document;
        const input = scope.querySelector('[data-filter-input]');
        const yearSelect = scope.querySelector('[data-filter-year]');
        const cards = Array.from(list.children);

        const queryParams = new URLSearchParams(window.location.search);
        const initialQuery = queryParams.get('q') || '';
        const mainSearch = document.querySelector('[data-main-search]');

        if (input && initialQuery) {
            input.value = initialQuery;
        }
        if (mainSearch && initialQuery) {
            mainSearch.value = initialQuery;
        }

        const apply = () => {
            const keyword = normalize(input ? input.value : '');
            const year = yearSelect ? yearSelect.value : '';

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(' '));
                const matchKeyword = !keyword || haystack.includes(keyword);
                const matchYear = !year || card.dataset.year === year;
                card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
            });
        };

        if (input) {
            input.addEventListener('input', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        apply();
    });

    document.querySelectorAll('.movie-player').forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('.player-button');
        const state = player.querySelector('.player-state');
        const source = player.dataset.src;
        let loaded = false;
        let hls = null;

        const setState = (message) => {
            if (state) {
                state.textContent = message || '';
            }
        };

        const load = () => {
            if (!video || loaded || !source) {
                return;
            }
            loaded = true;
            setState('正在加载');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setState('');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => setState(''));
                hls.on(window.Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal) {
                        setState('暂时无法播放，请稍后重试');
                    }
                });
                return;
            }

            setState('暂时无法播放，请稍后重试');
        };

        const play = async () => {
            load();
            try {
                await video.play();
                player.classList.add('is-playing');
                setState('');
            } catch (error) {
                setState('点击视频继续播放');
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', () => {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', () => player.classList.add('is-playing'));
            video.addEventListener('pause', () => player.classList.remove('is-playing'));
            video.addEventListener('ended', () => player.classList.remove('is-playing'));
        }

        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
