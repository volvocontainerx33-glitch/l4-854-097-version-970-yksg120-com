(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll(".cinema-player").forEach(function (root) {
            var video = root.querySelector("video");
            var trigger = root.querySelector(".player-poster");
            var stream = root.getAttribute("data-stream");
            var hlsInstance = null;

            function attachStream() {
                if (!video || !stream || video.getAttribute("data-ready") === "1") {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.load();
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    video.hlsInstance = hlsInstance;
                } else {
                    video.src = stream;
                    video.load();
                }

                video.setAttribute("data-ready", "1");
            }

            function playVideo() {
                attachStream();
                root.classList.add("is-playing");
                video.setAttribute("controls", "controls");
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        video.setAttribute("controls", "controls");
                    });
                }
            }

            if (trigger && video) {
                trigger.addEventListener("click", playVideo);
            }

            if (video) {
                video.addEventListener("play", function () {
                    root.classList.add("is-playing");
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
}());
