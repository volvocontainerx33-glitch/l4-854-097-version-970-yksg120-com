
(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initNav() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var links = document.querySelector('[data-nav-links]');
        if (toggle && links) {
            toggle.addEventListener('click', function () {
                links.classList.toggle('is-open');
            });
        }
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                play();
            });
        });
        show(0);
        play();
    }

    function initFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
        lists.forEach(function (list) {
            var section = list.closest('section') || document;
            var input = section.querySelector('[data-filter-input]');
            var year = section.querySelector('[data-year-filter]');
            var type = section.querySelector('[data-type-filter]');
            var empty = section.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : '';
                var y = year ? year.value : '';
                var t = type ? type.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && card.getAttribute('data-year') !== y) {
                        ok = false;
                    }
                    if (t && (card.getAttribute('data-type') || '').indexOf(t) === -1) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initSearchPage() {
        var page = document.querySelector('[data-search-page]');
        if (!page || !window.SEARCH_ITEMS) {
            return;
        }
        var input = page.querySelector('[data-search-page-input]');
        var results = page.querySelector('[data-search-page-results]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (input) {
            input.value = q;
        }

        function render() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var items = window.SEARCH_ITEMS.filter(function (item) {
                var text = [item.title, item.year, item.region, item.type, item.genre, item.line].join(' ').toLowerCase();
                return !term || text.indexOf(term) !== -1;
            }).slice(0, 80);
            if (!results) {
                return;
            }
            if (!items.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
                return;
            }
            results.innerHTML = items.map(function (item) {
                return '<a class="search-result" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                    '<span><strong>' + escapeHtml(item.title) + '</strong>' +
                    '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.genre) + '</span>' +
                    '<span>' + escapeHtml(item.line) + '</span></span></a>';
            }).join('');
        }

        if (input) {
            input.addEventListener('input', render);
        }
        render();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var cover = player.querySelector('.player-cover');
            if (!video || !cover) {
                return;
            }
            var streamUrl = video.getAttribute('data-src');
            var started = false;

            function bind() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function start() {
                bind();
                cover.classList.add('is-hidden');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            cover.addEventListener('click', start);
            video.addEventListener('click', function () {
                if (!started) {
                    start();
                }
            });
        });
    }

    ready(function () {
        initNav();
        initHero();
        initFilters();
        initSearchPage();
        initPlayers();
    });
})();
