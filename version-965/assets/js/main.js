(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mainNav = document.querySelector("[data-main-nav]");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      mainNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".showcase-slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-slide-dot]"));
    let current = 0;
    let timer = null;

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

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const next = Number(dot.getAttribute("data-slide-dot"));
        showSlide(next);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const input = panel.querySelector("[data-filter-input]");
    const yearSelect = panel.querySelector("[data-year-filter]");
    const scopeSelector = (input || yearSelect || {}).dataset ? (input || yearSelect).dataset.filterScope : "";
    const scope = scopeSelector ? document.querySelector(scopeSelector) : null;
    const cards = scope ? Array.from(scope.querySelectorAll(".movie-card")) : [];
    const emptyState = panel.parentElement ? panel.parentElement.querySelector("[data-empty-state]") : null;

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      const keyword = normalize(input ? input.value : "");
      const year = yearSelect ? yearSelect.value : "";
      let visibleCount = 0;

      cards.forEach(function (card) {
        const search = normalize(card.getAttribute("data-search"));
        const cardYear = card.getAttribute("data-year") || "";
        const matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
        const matchedYear = !year || cardYear === year;
        const visible = matchedKeyword && matchedYear;
        card.style.display = visible ? "" : "none";
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && input) {
      input.value = query;
      applyFilter();
    }
  });
})();

function setupVideoPlayer(videoId, coverId, buttonId, source) {
  const video = document.getElementById(videoId);
  const cover = document.getElementById(coverId);
  const button = document.getElementById(buttonId);

  if (!video || !source) {
    return;
  }

  let loaded = false;
  let hls = null;
  let requestedPlay = false;

  function playVideo() {
    video.controls = true;
    const result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function loadStream() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      if (requestedPlay) {
        playVideo();
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (requestedPlay) {
          playVideo();
        }
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          hls.destroy();
          hls = null;
          video.src = source;
        }
      });
      return;
    }

    video.src = source;
    if (requestedPlay) {
      playVideo();
    }
  }

  function start() {
    requestedPlay = true;
    if (cover) {
      cover.classList.add("is-hidden");
    }
    loadStream();
    if (loaded && video.src) {
      playVideo();
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      start();
    });
  }

  document.querySelectorAll('a[href="#' + videoId + '"]').forEach(function (link) {
    link.addEventListener("click", function () {
      window.setTimeout(start, 80);
    });
  });

  video.addEventListener("click", function () {
    if (!loaded) {
      start();
    }
  });
}
