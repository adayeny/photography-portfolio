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
})();
