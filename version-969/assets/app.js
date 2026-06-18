(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var navLinks = document.querySelector("[data-nav-links]");

        if (menuButton && navLinks) {
            menuButton.addEventListener("click", function () {
                navLinks.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }

                event.preventDefault();
                var query = input.value.trim();
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
            });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            }
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-card-list]");

        if (filterInput && list) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (filterInput.hasAttribute("data-query-input") && query) {
                filterInput.value = query;
            }

            function filterCards() {
                var keyword = normalize(filterInput.value);
                var cards = list.querySelectorAll(".movie-card-link");

                cards.forEach(function (card) {
                    var source = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-keywords"));
                    card.classList.toggle("is-hidden", keyword && source.indexOf(keyword) === -1);
                });
            }

            filterInput.addEventListener("input", filterCards);
            filterCards();
        }
    });
}());
