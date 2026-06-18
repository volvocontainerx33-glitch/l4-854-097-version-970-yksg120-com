(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var form = scope.querySelector("[data-filter-form]");
    var grid = scope.querySelector("[data-card-grid]");
    var empty = scope.querySelector("[data-empty-state]");

    if (!form || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-filter-card]"));

    function value(name) {
      var field = form.elements[name];
      return field ? normalize(field.value) : "";
    }

    function searchableText(card) {
      return normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year
      ].join(" "));
    }

    function applySort(cardsToSort, sortMode) {
      if (sortMode === "year-desc") {
        cardsToSort.sort(function (a, b) {
          return parseInt(b.dataset.year || "0", 10) - parseInt(a.dataset.year || "0", 10);
        });
      }

      if (sortMode === "rating-desc") {
        cardsToSort.sort(function (a, b) {
          var ra = parseFloat((a.querySelector(".movie-meta span") || {}).textContent?.replace("★", "") || "0");
          var rb = parseFloat((b.querySelector(".movie-meta span") || {}).textContent?.replace("★", "") || "0");
          return rb - ra;
        });
      }

      if (sortMode === "title-asc") {
        cardsToSort.sort(function (a, b) {
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), "zh-Hans-CN");
        });
      }

      if (sortMode !== "default") {
        cardsToSort.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    function filter() {
      var q = value("q");
      var category = value("category");
      var sortMode = value("sort") || "default";
      var visible = [];

      cards.forEach(function (card) {
        var matchText = !q || searchableText(card).indexOf(q) !== -1;
        var matchCategory = !category || normalize(card.dataset.category) === category;
        var shouldShow = matchText && matchCategory;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible.push(card);
        }
      });

      applySort(visible, sortMode);

      if (empty) {
        empty.classList.toggle("is-visible", visible.length === 0);
      }
    }

    form.addEventListener("input", filter);
    form.addEventListener("change", filter);
    filter();
  });
})();
