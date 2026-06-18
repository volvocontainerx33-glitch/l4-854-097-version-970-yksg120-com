(function () {
  var video = document.getElementById("movieVideo");
  var trigger = document.querySelector("[data-play-trigger]");
  var scrollPlay = document.querySelector("[data-scroll-play]");
  var hlsInstance = null;
  var started = false;

  if (!video) {
    return;
  }

  var playUrl = video.getAttribute("data-play") || "";

  function requestPlay() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (trigger) {
          trigger.classList.remove("is-hidden");
        }
      });
    }
  }

  function attachDirect() {
    video.src = playUrl;
    video.controls = true;
    requestPlay();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    script.async = true;
    script.onload = callback;
    script.onerror = attachDirect;
    document.head.appendChild(script);
  }

  function start() {
    if (!playUrl) {
      return;
    }

    if (trigger) {
      trigger.classList.add("is-hidden");
    }

    if (started) {
      if (video.paused) {
        requestPlay();
      }
      return;
    }

    started = true;
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      attachDirect();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hlsInstance.destroy();
            hlsInstance = null;
            attachDirect();
          }
        });
      } else {
        attachDirect();
      }
    });
  }

  if (trigger) {
    trigger.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });

  if (scrollPlay) {
    scrollPlay.addEventListener("click", function () {
      window.setTimeout(start, 120);
    });
  }
})();
