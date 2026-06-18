document.addEventListener("DOMContentLoaded", function () {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("q") || "";

  document.querySelectorAll("[data-global-search]").forEach(function (input) {
    if (initialQuery && window.location.pathname.endsWith("all.html")) {
      input.value = initialQuery;
    }
  });

  document.querySelectorAll("[data-catalog]").forEach(function (catalog) {
    const input = catalog.querySelector("[data-search-input]");
    const chips = Array.from(catalog.querySelectorAll("[data-filter-value]"));
    const cards = Array.from(catalog.querySelectorAll(".movie-card"));

    if (input && initialQuery && window.location.pathname.endsWith("all.html")) {
      input.value = initialQuery;
    }

    function applyFilter() {
      const query = input ? input.value.trim().toLowerCase() : "";
      const activeChip = chips.find(function (chip) {
        return chip.classList.contains("is-active");
      });
      const activeValue = activeChip ? activeChip.getAttribute("data-filter-value") : "all";

      cards.forEach(function (card) {
        const text = (card.getAttribute("data-title") || "").toLowerCase();
        const type = card.getAttribute("data-type") || "";
        const region = card.getAttribute("data-region") || "";
        const year = card.getAttribute("data-year") || "";
        const genre = card.getAttribute("data-genre") || "";
        const keywordMatch = !query || text.indexOf(query) !== -1;
        const filterMatch = activeValue === "all" || type === activeValue || region === activeValue || year === activeValue || genre.indexOf(activeValue) !== -1 || text.indexOf(activeValue.toLowerCase()) !== -1;
        card.classList.toggle("is-hidden", !(keywordMatch && filterMatch));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        applyFilter();
      });
    });

    applyFilter();
  });

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5000);
    }
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    const video = player.querySelector("video");
    const button = player.querySelector(".play-trigger");

    if (!video) {
      return;
    }

    const sourceNode = video.querySelector("source");
    const streamUrl = video.getAttribute("data-hls-url") || (sourceNode ? sourceNode.getAttribute("src") : "");
    let isReady = false;

    function prepareVideo() {
      if (isReady || !streamUrl) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsPlayer = hls;
      } else {
        video.setAttribute("src", streamUrl);
      }

      isReady = true;
    }

    function startVideo() {
      prepareVideo();
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    if (button) {
      button.addEventListener("click", startVideo);
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });

    video.addEventListener("loadedmetadata", function () {
      player.classList.add("is-loaded");
    });
  });
});
