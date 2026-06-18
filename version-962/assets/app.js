
(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('.hero');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('.hero-dot', hero);
        var prev = hero.querySelector('.hero-control.prev');
        var next = hero.querySelector('.hero-control.next');
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }

        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var cards = selectAll('.movie-card');
        var searchInputs = selectAll('.filter-input, .top-search, .mobile-search');
        var yearSelect = document.querySelector('[data-filter="year"]');
        var regionSelect = document.querySelector('[data-filter="region"]');
        var typeSelect = document.querySelector('[data-filter="type"]');
        var empty = document.querySelector('.empty-state');

        function currentQuery() {
            var input = document.querySelector('.filter-input');
            if (input && input.value.trim()) {
                return input.value.trim().toLowerCase();
            }
            var top = document.querySelector('.top-search');
            if (top && top.value.trim()) {
                return top.value.trim().toLowerCase();
            }
            var mobile = document.querySelector('.mobile-search');
            if (mobile && mobile.value.trim()) {
                return mobile.value.trim().toLowerCase();
            }
            return '';
        }

        function apply() {
            if (!cards.length) {
                var q = currentQuery();
                if (q) {
                    window.location.href = 'categories.html?q=' + encodeURIComponent(q);
                }
                return;
            }
            var query = currentQuery();
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type')
                ].join(' ').toLowerCase();
                var matched = true;
                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    matched = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    matched = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    matched = false;
                }
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', apply);
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    apply();
                }
            });
        });

        [yearSelect, regionSelect, typeSelect].forEach(function (select) {
            if (select) {
                select.addEventListener('change', apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            var filterInput = document.querySelector('.filter-input');
            if (filterInput) {
                filterInput.value = q;
                apply();
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
