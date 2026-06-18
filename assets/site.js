(function () {
  function onReady(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!form || !cards.length) {
      return;
    }
    var input = form.querySelector("[data-search-input]");
    var typeFilter = form.querySelector("[data-type-filter]");
    var yearFilter = form.querySelector("[data-year-filter]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function filterCards() {
      var query = normalize(input ? input.value : "");
      var type = normalize(typeFilter ? typeFilter.value : "");
      var year = normalize(yearFilter ? yearFilter.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search-text"));
        var cardType = normalize(card.getAttribute("data-type") + " " + card.getAttribute("data-genre"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var queryMatch = !query || searchText.indexOf(query) !== -1;
        var typeMatch = !type || cardType.indexOf(type) !== -1;
        var yearMatch = !year || cardYear === year;
        var match = queryMatch && typeMatch && yearMatch;
        card.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    form.addEventListener("submit", function (event) {
      if (cards.length > 0) {
        event.preventDefault();
        filterCards();
      }
    });

    [input, typeFilter, yearFilter].forEach(function (field) {
      if (field) {
        field.addEventListener("input", filterCards);
        field.addEventListener("change", filterCards);
      }
    });

    filterCards();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-player='movie']");
    var button = document.querySelector("[data-play-button]");
    if (!video || !streamUrl) {
      return;
    }
    var hlsInstance = null;
    var attached = false;

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      video.controls = true;
      if (button) {
        button.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
