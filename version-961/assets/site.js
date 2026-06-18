(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var gridId = panel.getAttribute('data-filter-panel');
      var grid = document.getElementById(gridId);
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var textInput = panel.querySelector('[data-filter-text]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var resetButton = panel.querySelector('[data-filter-reset]');
      var count = panel.querySelector('[data-filter-count]');

      function applyFilter() {
        var query = normalize(textInput && textInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var blob = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));
          var ok = true;
          if (query && blob.indexOf(query) === -1) {
            ok = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            ok = false;
          }
          if (type && normalize(card.getAttribute('data-type')) !== type) {
            ok = false;
          }
          if (region && normalize(card.getAttribute('data-region')) !== region) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible + ' 部';
        }
      }

      [textInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
      if (resetButton) {
        resetButton.addEventListener('click', function () {
          if (textInput) {
            textInput.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          applyFilter();
        });
      }
      applyFilter();
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      return new Promise(function (resolve, reject) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
      });
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-overlay');
      var status = shell.querySelector('.player-status');
      var source = shell.getAttribute('data-video-src');
      if (!video || !button || !source) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function playVideo() {
        button.classList.add('hidden');
        setStatus('正在加载播放源...');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {
            setStatus('请再次点击播放器开始播放。');
          });
          return;
        }
        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              setStatus('');
              video.play().catch(function () {
                setStatus('请再次点击播放器开始播放。');
              });
            });
            hls.on(Hls.Events.ERROR, function () {
              setStatus('播放源加载异常，请刷新后重试。');
            });
          } else {
            video.src = source;
            video.play().catch(function () {
              setStatus('当前浏览器可能不支持 m3u8 播放。');
            });
          }
        }).catch(function () {
          video.src = source;
          video.play().catch(function () {
            setStatus('HLS 组件加载失败，请检查网络后重试。');
          });
        });
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        button.classList.add('hidden');
        setStatus('');
      });
    });
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function buildSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card" href="' + escapeHtml(item.url) + '">',
      '  <div class="card-poster">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="card-category">' + escapeHtml(item.category) + '</span>',
      '    <span class="card-duration">' + escapeHtml(item.duration) + '</span>',
      '    <span class="card-play">▶</span>',
      '  </div>',
      '  <div class="card-body">',
      '    <h3>' + escapeHtml(item.title) + '</h3>',
      '    <p>' + escapeHtml(item.description) + '</p>',
      '    <div class="card-meta-row">',
      '      <span>★ ' + escapeHtml(item.rating) + '</span>',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '    </div>',
      '    <div class="card-tags">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!results || !summary || !window.SEARCH_DATA) {
      return;
    }
    var query = normalize(getQuery());
    var formInput = document.querySelector('.search-page-form input[name="q"]');
    if (formInput && query) {
      formInput.value = getQuery();
    }
    if (!query) {
      var suggestions = window.SEARCH_DATA.slice(0, 12);
      results.innerHTML = suggestions.map(buildSearchCard).join('');
      summary.textContent = '展示片库精选内容，可输入关键词搜索全部影片。';
      return;
    }
    var matches = window.SEARCH_DATA.filter(function (item) {
      var blob = normalize([
        item.title,
        item.description,
        item.category,
        item.region,
        item.type,
        item.genre,
        item.year,
        (item.tags || []).join(' ')
      ].join(' '));
      return blob.indexOf(query) !== -1;
    });
    results.innerHTML = matches.map(buildSearchCard).join('');
    summary.textContent = '“' + getQuery() + '” 找到 ' + matches.length + ' 部影片。';
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initPlayers();
    initSearchPage();
  });
}());
