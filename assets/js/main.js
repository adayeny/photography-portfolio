(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    function onScroll() {
        if (!header) return;
        header.classList.toggle('is-scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && navLinks) {
        toggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Duplicate marquee content once so the CSS loop (-50%) is seamless
    // regardless of how many logo slots are authored in the HTML.
    document.querySelectorAll('.marquee-track').forEach(function (track) {
        var original = track.innerHTML;
        track.innerHTML = original + original;
    });

    // Highlight the current page in the nav.
    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[href]').forEach(function (link) {
        var href = link.getAttribute('href').split('/').pop();
        if (href === current || (current === '' && href === 'index.html')) {
            link.classList.add('is-active');
        }
    });

    // Portfolio category filters.
    var filterButtons = document.querySelectorAll('.filter-btn');
    var portfolioItems = document.querySelectorAll('.portfolio-item');
    filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');
            var category = btn.getAttribute('data-filter');
            portfolioItems.forEach(function (item) {
                var match = category === 'all' || item.getAttribute('data-category') === category;
                item.classList.toggle('is-hidden', !match);
            });
        });
    });

    // Lightbox for portfolio items: shows the real <img> if present,
    // otherwise an enlarged placeholder with the same caption.
    var lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        var lightboxInner = lightbox.querySelector('.lightbox-inner');
        var closeBtn = lightbox.querySelector('.lightbox-close');

        function openLightbox(item) {
            var img = item.querySelector('img');
            var caption = item.getAttribute('data-caption') || '';
            var media = img
                ? '<img src="' + img.getAttribute('src') + '" alt="' + (img.getAttribute('alt') || '') + '">'
                : '<div class="lightbox-placeholder">' + caption + '</div>';
            lightboxInner.innerHTML = media + '<button class="lightbox-close" aria-label="Close">&times;</button>' +
                (caption ? '<p class="lightbox-caption">' + caption + '</p>' : '');
            lightboxInner.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
            lightbox.classList.add('is-open');
        }
        function closeLightbox() { lightbox.classList.remove('is-open'); }

        portfolioItems.forEach(function (item) {
            item.addEventListener('click', function () { openLightbox(item); });
        });
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeLightbox();
        });
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    }

    // Order form: submit via fetch so a successful booking request shows an
    // inline message instead of redirecting to Web3Forms' own page.
    document.querySelectorAll('.order-form').forEach(function (form) {
        var statusEl = form.querySelector('.form-status');
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Honeypot: if this hidden field got filled in, silently drop it.
            var honeypot = form.querySelector('input[name="botcheck"]');
            if (honeypot && honeypot.checked) return;

            var submitBtn = form.querySelector('button[type="submit"]');
            var formData = new FormData(form);
            var payload = {};
            formData.forEach(function (value, key) {
                if (key === 'botcheck') return;
                if (payload[key] !== undefined) {
                    payload[key] = Array.isArray(payload[key]) ? payload[key].concat(value) : [payload[key], value];
                } else {
                    payload[key] = value;
                }
            });
            Object.keys(payload).forEach(function (key) {
                if (Array.isArray(payload[key])) payload[key] = payload[key].join(', ');
            });

            if (submitBtn) submitBtn.disabled = true;
            if (statusEl) { statusEl.textContent = 'Sending...'; statusEl.className = 'form-status'; }

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.success) {
                        form.reset();
                        if (statusEl) {
                            statusEl.textContent = "Thanks — your request is in. We'll confirm shortly.";
                            statusEl.className = 'form-status is-success';
                        }
                    } else {
                        throw new Error(data.message || 'Submission failed');
                    }
                })
                .catch(function () {
                    if (statusEl) {
                        statusEl.textContent = "Something went wrong sending that. Please call or email us directly.";
                        statusEl.className = 'form-status is-error';
                    }
                })
                .finally(function () {
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    });
})();
