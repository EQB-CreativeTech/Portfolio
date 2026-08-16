(function ($, window, document) {
    'use strict';

    const siteData = window.MPK_SITE_DATA || {};
    const navigationData = siteData.navigation || [];
    const heroData = siteData.hero || {};
    const aboutData = siteData.about || {};
    const careerData = siteData.career || {};
    const projectData = siteData.project || {};
    const galleryData = siteData.gallery || {};
    const productionData = siteData.production || {};
    const contactData = siteData.contact || {};
    const footerData = siteData.footer || {};
    const siteSettings = siteData.site || {};
    const urlSlug = siteSettings.urlSlug || 'mpk-portfolio.html';
    const scrollOffset = 84;
    const preloaderMinDuration = 1200;
    const pageType = document.body.getAttribute('data-page') || 'index';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let galleryLightboxIndex = 0;
    let galleryVisibleItems = [];

    const escapeHtml = (value) => String(value || '').replace(/[&<>"]/g, function (character) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        })[character];
    });

    const renderMpkLogoMarkup = (href, extraClass) => {
        const classes = ['mpkLogo'];

        if (extraClass) {
            classes.push(extraClass);
        }

        return [
            '<a class="' + escapeHtml(classes.join(' ')) + '" href="' + escapeHtml(href) + '" aria-label="MPK Home">',
            '  <span class="mpkLogo__frame">',
            '    <span class="mpkLogo__clapper" aria-hidden="true"></span>',
            '    <span class="mpkLogo__perfs" aria-hidden="true"></span>',
            '    <span class="mpkLogo__letters" aria-hidden="true">',
            '      <span class="mpkLogo__char">M</span>',
            '      <span class="mpkLogo__char mpkLogo__char--p">P</span>',
            '      <span class="mpkLogo__char">K</span>',
            '    </span>',
            '  </span>',
            '</a>'
        ].join('');
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) {
            return '';
        }

        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);

        return match ? 'https://www.youtube.com/embed/' + match[1] + '?autoplay=1' : url;
    };

    const getProjectFilterKey = (card) => {
        const format = String(card.format || '').toLowerCase();
        const status = String(card.status || '').toLowerCase();

        if (format.indexOf('feature') !== -1) {
            return 'feature';
        }

        if (format.indexOf('short') !== -1) {
            return 'short';
        }

        if (status.indexOf('released') !== -1) {
            return 'released';
        }

        return 'all';
    };

    const renderCareerCard = (card) => {
        return [
            '<div class="flip-card reveal-on-scroll" tabindex="0" role="button" aria-label="Flip card for ' + escapeHtml(card.title) + '">',
            '  <div class="flip-card-inner">',
            '    <div class="flip-card-front">',
            '      <h1>' + escapeHtml(card.title) + '</h1>',
            '      <p> <strong>Year:</strong><br> ' + escapeHtml(card.year) + '</p>',
            '      <p> <strong>Synopsis:</strong><br>' + escapeHtml(card.synopsis) + '</p>',
            '      <p><strong>Starring:</strong><br> ' + escapeHtml(card.starring) + '</p>',
            '      <p><strong>Production:</strong><br> ' + escapeHtml(card.production) + '</p>',
            '    </div>',
            '    <div class="flip-card-back">',
            '      <img src="' + escapeHtml(card.image) + '" alt="' + escapeHtml(card.title) + '">',
            '    </div>',
            '  </div>',
            '  <a href="' + escapeHtml(card.link) + '" target="_blank" rel="noopener" class="careerBtn">Watch Film</a>',
            '</div>'
        ].join('');
    };

    const renderGalleryItem = (item, index) => {
        const sizeClasses = ['size-sm', 'size-sm', 'size-md', 'size-sm'];
        const sizeClass = sizeClasses[index % sizeClasses.length];

        return [
            '<button type="button" class="mix ' + sizeClass + ' ' + escapeHtml(item.category) + '" data-category="' + escapeHtml(item.category) + '" data-gallery-index="' + index + '" data-full-src="' + escapeHtml(item.src) + '" aria-label="View full image: ' + escapeHtml(item.alt) + '">',
            '  <span class="mixMedia">',
            '    <img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy">',
            '    <span class="mixOverlay" aria-hidden="true"><i class="fa fa-search-plus"></i></span>',
            '  </span>',
            '</button>'
        ].join('');
    };

    const renderProjectCard = (card, options) => {
        const opts = options || {};
        const watchClass = opts.trailerModal ? ' projectWatchBtn' : '';
        const watchAttrs = opts.trailerModal
            ? ' href="#" data-trailer="' + escapeHtml(card.link) + '" data-title="' + escapeHtml(card.title) + '"'
            : ' href="' + escapeHtml(card.link) + '" target="_blank" rel="noopener"';

        return [
            '<article class="projectCard reveal-on-scroll" data-format="' + escapeHtml(getProjectFilterKey(card)) + '" data-status="' + escapeHtml(String(card.status || '').toLowerCase()) + '">',
            '  <div class="projectCardMedia">',
            '    <img src="' + escapeHtml(card.image) + '" alt="' + escapeHtml(card.title) + '">',
            '  </div>',
            '  <div class="projectCardBody">',
            '    <div class="projectCardMeta">',
            '      <span>' + escapeHtml(card.year) + '</span>',
            '      <span>' + escapeHtml(card.format) + '</span>',
            '      <span>' + escapeHtml(card.status) + '</span>',
            '    </div>',
            '    <h3>' + escapeHtml(card.title) + '</h3>',
            '    <p>' + escapeHtml(card.synopsis) + '</p>',
            '    <div class="projectCardFooter">',
            '      <strong>' + escapeHtml(card.role) + '</strong>',
            '      <a class="projectWatchLink' + watchClass + '"' + watchAttrs + '>Watch</a>',
            '    </div>',
            '  </div>',
            '</article>'
        ].join('');
    };

    const MASONRY_GAP = 14;
    const MASONRY_THUMB_MAX = 165;
    let masonryResizeTimer = null;
    let currentGalleryFilter = 'all';

    const getMasonryColumns = () => {
        const container = document.getElementById('portfolio');
        const containerWidth = container ? container.clientWidth : window.innerWidth;
        const idealWidth = MASONRY_THUMB_MAX + MASONRY_GAP;
        let columns = Math.floor(containerWidth / idealWidth);

        if (window.innerWidth < 480) {
            return Math.max(2, columns);
        }

        if (window.innerWidth < 768) {
            return Math.max(3, columns);
        }

        return Math.max(4, Math.min(columns, 6));
    };

    const layoutMasonry = (animate) => {
        const container = document.getElementById('portfolio');

        if (!container) {
            return;
        }

        const items = Array.from(container.querySelectorAll('.mix'));
        const columns = getMasonryColumns();
        const containerWidth = container.clientWidth;
        const columnWidth = (containerWidth - (MASONRY_GAP * (columns - 1))) / columns;
        const columnHeights = new Array(columns).fill(0);

        items.forEach(function (item) {
            const isFiltered = item.classList.contains('is-filtered-out');

            if (isFiltered) {
                item.style.display = 'none';
                item.style.opacity = '0';
                item.style.pointerEvents = 'none';
                return;
            }

            item.style.display = 'block';
            item.style.width = columnWidth + 'px';
            item.style.pointerEvents = 'auto';

            const minColumn = columnHeights.indexOf(Math.min.apply(null, columnHeights));
            const x = minColumn * (columnWidth + MASONRY_GAP);
            const y = columnHeights[minColumn];

            if (animate && !prefersReducedMotion) {
                item.style.transition = 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease, width 0.55s ease';
            } else {
                item.style.transition = 'none';
            }

            item.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
            item.style.opacity = '1';

            columnHeights[minColumn] += item.offsetHeight + MASONRY_GAP;
        });

        container.style.height = Math.max.apply(null, columnHeights.concat([0])) + 'px';
    };

    const waitForGalleryImages = () => {
        const images = Array.from(document.querySelectorAll('#portfolio .mix img'));

        return Promise.all(images.map(function (img) {
            if (img.complete) {
                return Promise.resolve();
            }

            return new Promise(function (resolve) {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        }));
    };

    const applyGalleryFilter = (filter) => {
        const $filters = $('#filters .filter');
        const items = document.querySelectorAll('#portfolio .mix');

        if (!$filters.length || !items.length) {
            return;
        }

        currentGalleryFilter = filter;

        $filters.removeClass('active');
        $filters.filter('[data-filter="' + filter + '"]').addClass('active');

        items.forEach(function (item) {
            const category = item.getAttribute('data-category');
            const matches = filter === 'all' || category === filter.replace('.', '');

            if (matches) {
                item.classList.remove('is-filtered-out');
            } else {
                item.classList.add('is-filtered-out');
            }
        });

        window.requestAnimationFrame(function () {
            layoutMasonry(true);
        });
    };

    const initMasonryGallery = () => {
        const container = document.getElementById('portfolio');
        const scrollArea = document.querySelector('.galleryWrapper');

        if (!container) {
            return;
        }

        container.classList.add('masonry-grid');

        waitForGalleryImages().then(function () {
            applyGalleryFilter(currentGalleryFilter);
            layoutMasonry(false);
        });

        window.addEventListener('resize', function () {
            window.clearTimeout(masonryResizeTimer);
            masonryResizeTimer = window.setTimeout(function () {
                layoutMasonry(false);
            }, 150);
        });

        if (scrollArea) {
            scrollArea.addEventListener('scroll', function () {
                window.clearTimeout(masonryResizeTimer);
                masonryResizeTimer = window.setTimeout(function () {
                    layoutMasonry(false);
                }, 100);
            }, { passive: true });
        }

        const gallerySection = document.getElementById('gallery');

        if (gallerySection && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        layoutMasonry(false);
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(gallerySection);
        }
    };

    const applyProjectFilter = (filter) => {
        const $filters = $('#projectFilters .projectFilter');
        const $cards = $('#project .projectCard');

        if (!$filters.length || !$cards.length) {
            return;
        }

        $filters.removeClass('active');
        $filters.filter('[data-filter="' + filter + '"]').addClass('active');

        if (filter === 'all') {
            $cards.show();
            return;
        }

        $cards.each(function () {
            const $card = $(this);
            const format = String($card.data('format') || '');
            const status = String($card.data('status') || '');
            const matches = format === filter || status === filter;

            $card.toggle(matches);
        });
    };

    const renderNavigation = (selector) => {
        const navItemsHtml = navigationData.map(function (item) {
            return '<li><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.label) + '</a></li>';
        }).join('');

        $(selector || '.navbar-nav').html(navItemsHtml);
        $('.overlay-menu ul').html(navItemsHtml);
    };

    const renderHero = () => {
        const $heroMount = $('.bannerInnerContent');

        if (!$heroMount.length || !heroData.name) {
            return;
        }

        $heroMount.html([
            '<p class="profileText">' + escapeHtml(heroData.eyebrow) + ' <span class="icon" aria-hidden="true">→</span></p>',
            '<div class="banner_innerImg">',
            '  <div id="portfolioImg" role="img" aria-label="' + escapeHtml(heroData.imageAlt) + '"></div>',
            '</div>',
            '<div class="banner_innerText">',
            '  <h4>' + escapeHtml(heroData.name) + '</h4>',
            '  <p>' + escapeHtml(heroData.title) + '</p>',
            '  <p class="profileLine">"' + escapeHtml(heroData.quote) + '"</p>',
            '</div>'
        ].join('\n'));
    };

    const renderAbout = () => {
        const $aboutMount = $('#about');

        if (!$aboutMount.length || !aboutData.title) {
            return;
        }

        const bulletItems = (aboutData.bullets || []).map(function (bullet) {
            return '<li>' + escapeHtml(bullet) + '</li>';
        }).join('');

        $aboutMount.html([
            '<div class="aboutContent reveal-on-scroll">',
            '  <div class="aboutWrapper">',
            '    <h2>' + escapeHtml(aboutData.title) + '</h2>',
            '    <p>' + escapeHtml(aboutData.intro) + '</p>',
            '    <p>' + escapeHtml(aboutData.secondary) + '</p>',
            '  </div>',
            '  <div class="aboutBulletContainer">',
            '    <div class="bulletLeftImg">',
            '      <div class="bulletLeftImgData"></div>',
            '    </div>',
            '    <div class="bulletRightList">',
            '      <div class="bulletRightListData">',
            '        <h3><span class="underline">' + escapeHtml(aboutData.heading) + '</span></h3>',
            '        <p>' + escapeHtml(aboutData.body) + '</p>',
            '        <ul>' + bulletItems + '</ul>',
            '      </div>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('\n'));
    };

    const renderCareer = () => {
        const $careerMount = $('#career');

        if (!$careerMount.length || !careerData.projects || !careerData.projects.length) {
            return;
        }

        const cardsHtml = careerData.projects.map(renderCareerCard).join('');

        $careerMount.html([
            '<div class="careerSection">',
            '  <h2 class="reveal-on-scroll">' + escapeHtml(careerData.title) + '</h2>',
            '  <p class="careerIntro reveal-on-scroll">' + escapeHtml(careerData.intro) + '</p>',
            '  <div class="careerDataWrapper">',
            '    <div class="careerDataInnerWrapper">' + cardsHtml + '</div>',
            '  </div>',
            '</div>'
        ].join(''));
    };

    const renderGallery = () => {
        const $galleryMount = $('#gallery');

        if (!$galleryMount.length || !galleryData.items || !galleryData.items.length) {
            return;
        }

        const filtersHtml = galleryData.filters.map(function (filter) {
            return '<button type="button" class="filter' + (filter.value === 'all' ? ' active' : '') + '" data-filter="' + escapeHtml(filter.value) + '" aria-label="Filter gallery: ' + escapeHtml(filter.label) + '">' + escapeHtml(filter.label) + '</button>';
        }).join('');

        const itemsHtml = galleryData.items.map(renderGalleryItem).join('');

        $galleryMount.html([
            '<div class="galleryShell">',
            '  <div class="galleryHeader">',
            '    <div class="galleryTitle">',
            '      <h1>' + escapeHtml(galleryData.title) + '</h1>',
            '    </div>',
            '    <div id="filters">' + filtersHtml + '</div>',
            '  </div>',
            '  <div class="galleryWrapper">',
            '    <div id="portfolio">' + itemsHtml + '</div>',
            '  </div>',
            '</div>'
        ].join(''));
    };

    const renderProjects = (options) => {
        const opts = options || {};
        const $projectMount = $('#project');

        if (!$projectMount.length || !projectData.projects || !projectData.projects.length) {
            return;
        }

        const cardsHtml = projectData.projects.map(function (card) {
            return renderProjectCard(card, { trailerModal: !!opts.trailerModal });
        }).join('');

        const title = opts.workPage ? (projectData.workPageTitle || projectData.title) : projectData.title;
        const filtersHtml = opts.workPage && projectData.filters
            ? projectData.filters.map(function (filter) {
                return '<button type="button" class="projectFilter' + (filter.value === 'all' ? ' active' : '') + '" data-filter="' + escapeHtml(filter.value) + '">' + escapeHtml(filter.label) + '</button>';
            }).join('')
            : '';

        const viewAllLink = !opts.workPage
            ? '<p class="projectViewAll"><a href="project.html">View all work →</a></p>'
            : '';

        $projectMount.html([
            '<div class="projectSection' + (opts.workPage ? ' projectSection--workPage' : '') + '">',
            opts.workPage ? '<div class="workPageHero reveal-on-scroll"><p class="workPageEyebrow">Filmography</p><h1>' + escapeHtml(title) + '</h1><p class="projectIntro">' + escapeHtml(projectData.intro) + '</p></div>' : '',
            opts.workPage ? '' : '  <h2 class="reveal-on-scroll">' + escapeHtml(title) + '</h2>',
            opts.workPage ? '' : '  <p class="projectIntro reveal-on-scroll">' + escapeHtml(projectData.intro) + '</p>',
            filtersHtml ? '<div id="projectFilters" class="reveal-on-scroll">' + filtersHtml + '</div>' : '',
            '  <div class="projectGrid">' + cardsHtml + '</div>',
            viewAllLink,
            '</div>'
        ].join(''));
    };

    const renderProduction = () => {
        const $mount = $('#production');

        if (!$mount.length || !productionData.title) {
            return;
        }

        const creditsHtml = (productionData.credits || []).map(function (credit) {
            const chips = (credit.projects || []).map(function (project) {
                return '<span class="productionChip">' + escapeHtml(project) + '</span>';
            }).join('');

            return [
                '<article class="productionCard reveal-on-scroll">',
                '  <h3>' + escapeHtml(credit.company) + '</h3>',
                '  <span class="productionRole">' + escapeHtml(credit.role) + '</span>',
                '  <div class="productionChips">' + chips + '</div>',
                '</article>'
            ].join('');
        }).join('');

        const highlightsHtml = (productionData.highlights || []).map(function (item) {
            return '<li>' + escapeHtml(item) + '</li>';
        }).join('');

        $mount.html([
            '<div class="productionSection sectionShell reveal-on-scroll">',
            '  <p class="sectionEyebrow">Behind the camera</p>',
            '  <h2>' + escapeHtml(productionData.title) + '</h2>',
            '  <p class="sectionIntro">' + escapeHtml(productionData.intro) + '</p>',
            '  <div class="productionGrid">' + creditsHtml + '</div>',
            '  <ul class="productionHighlights">' + highlightsHtml + '</ul>',
            '</div>'
        ].join(''));
    };

    const renderContact = () => {
        const $mount = $('#contact');

        if (!$mount.length || !contactData.title) {
            return;
        }

        const socialHtml = (contactData.social || []).map(function (item) {
            return '<a href="' + escapeHtml(item.href) + '" target="_blank" rel="noopener" class="contactSocialLink" aria-label="' + escapeHtml(item.label) + ' on ' + escapeHtml(item.icon) + '"><i class="fa fa-' + escapeHtml(item.icon) + '"></i> ' + escapeHtml(item.label) + '</a>';
        }).join('');

        $mount.html([
            '<div class="contactSection sectionShell reveal-on-scroll">',
            '  <div class="contactSectionHeader">',
            '    <p class="sectionEyebrow">Get in touch</p>',
            '    <h2>' + escapeHtml(contactData.title) + '</h2>',
            '    <p class="sectionIntro">' + escapeHtml(contactData.intro) + '</p>',
            '  </div>',
            '  <div class="contactLayout">',
            '    <div class="contactInfo">',
            '      <div class="contactCards">',
            '        <div class="contactCard"><strong>Email</strong><a href="mailto:' + escapeHtml(contactData.email) + '">' + escapeHtml(contactData.email) + '</a></div>',
            '        <div class="contactCard"><strong>Phone</strong><span>' + escapeHtml(contactData.phone) + '</span></div>',
            '        <div class="contactCard"><strong>Location</strong><span>' + escapeHtml(contactData.location) + '</span></div>',
            '      </div>',
            '      <div class="contactSocial">' + socialHtml + '</div>',
            '    </div>',
            '    <form class="contactForm" id="contactForm" novalidate>',
            '      <h3>Send a message</h3>',
            '      <label for="contactName">Name</label>',
            '      <input type="text" id="contactName" name="name" required autocomplete="name" placeholder="Your full name">',
            '      <label for="contactEmail">Email</label>',
            '      <input type="email" id="contactEmail" name="email" required autocomplete="email" placeholder="you@example.com">',
            '      <label for="contactMessage">Message</label>',
            '      <textarea id="contactMessage" name="message" rows="5" required placeholder="Write your message here..."></textarea>',
            '      <button type="submit">Send Message</button>',
            '      <p class="contactFormNote" id="contactFormNote" role="status" aria-live="polite"></p>',
            '    </form>',
            '  </div>',
            '</div>'
        ].join(''));
    };

    const renderFooter = () => {
        const $mount = $('#footer');

        if (!$mount.length) {
            return;
        }

        const socialHtml = (contactData.social || []).map(function (item) {
            return '<a href="' + escapeHtml(item.href) + '" target="_blank" rel="noopener" aria-label="' + escapeHtml(item.label) + '"><i class="fa fa-' + escapeHtml(item.icon) + '"></i></a>';
        }).join('');

        $mount.html([
            '<div class="footerInner">',
            '  <div class="footer-copyright">',
            '    <h5>' + escapeHtml(footerData.copyright || '') + '</h5>',
            '    <p>' + escapeHtml(footerData.tagline || '') + '</p>',
            '  </div>',
            '  <div class="footer-social">' + socialHtml + '</div>',
            '</div>'
        ].join(''));
    };

    const renderWorkPageHeader = () => {
        const $header = $('.workPageHeader');

        if (!$header.length) {
            return;
        }

        $header.html([
            '<nav class="workPageNav">',
            '  ' + renderMpkLogoMarkup(urlSlug, 'mpkLogo--workPage'),
            '  <a class="workPageBack" href="' + escapeHtml(urlSlug) + '" data-scroll-target="#project">← Back to portfolio</a>',
            '</nav>'
        ].join(''));
    };

    const ensureModals = () => {
        if (!document.getElementById('galleryLightbox')) {
            document.body.insertAdjacentHTML('beforeend', [
                '<div id="galleryLightbox" class="mpkModal galleryLightbox" hidden>',
                '  <div class="mpkModalBackdrop" data-close-modal></div>',
                '  <div class="mpkModalContent galleryModalContent" role="dialog" aria-modal="true" aria-label="Gallery image viewer">',
                '    <button type="button" class="mpkModalClose" data-close-modal aria-label="Close gallery">&times;</button>',
                '    <button type="button" class="galleryNav galleryNavPrev" aria-label="Previous image">&#8249;</button>',
                '    <div class="galleryLightboxBody">',
                '      <div class="galleryLightboxImageWrap">',
                '        <img src="" alt="" id="galleryLightboxImage">',
                '      </div>',
                '      <p id="galleryLightboxCaption"></p>',
                '    </div>',
                '    <button type="button" class="galleryNav galleryNavNext" aria-label="Next image">&#8250;</button>',
                '  </div>',
                '</div>'
            ].join(''));
        }

        if (!document.getElementById('trailerModal')) {
            document.body.insertAdjacentHTML('beforeend', [
                '<div id="trailerModal" class="mpkModal" hidden>',
                '  <div class="mpkModalBackdrop" data-close-modal></div>',
                '  <div class="mpkModalContent trailerModalContent" role="dialog" aria-modal="true" aria-label="Film trailer">',
                '    <button type="button" class="mpkModalClose" data-close-modal aria-label="Close trailer">&times;</button>',
                '    <h3 id="trailerModalTitle"></h3>',
                '    <div class="trailerEmbedWrap"><iframe id="trailerIframe" src="" title="Film trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>',
                '  </div>',
                '</div>'
            ].join(''));
        }
    };

    const getCleanUrlPath = () => {
        const parts = window.location.pathname.split('/');

        if (!parts.length) {
            return '/' + urlSlug;
        }

        parts[parts.length - 1] = urlSlug;

        return parts.join('/');
    };

    const setCleanUrl = () => {
        if (pageType !== 'index') {
            return;
        }

        history.replaceState({ mpk: true }, document.title, getCleanUrlPath());
    };

    const navigateToSection = (href) => {
        if (!href || href.charAt(0) !== '#') {
            return false;
        }

        const target = document.querySelector(href);

        if (!target) {
            return false;
        }

        updateActiveNavigation(href);
        smoothScrollToTarget(href);
        setOverlayOpen(false);
        setCleanUrl();

        if (href === '#gallery') {
            window.setTimeout(function () {
                layoutMasonry(true);
            }, prefersReducedMotion ? 50 : 650);
        }

        return true;
    };

    const initCleanUrl = () => {
        if (pageType !== 'index') {
            return;
        }

        const pathname = window.location.pathname;
        const fileName = pathname.split('/').pop() || '';
        const hash = window.location.hash;
        const storedTarget = sessionStorage.getItem('mpkScrollTarget');
        let scrollTarget = null;

        if (hash && document.querySelector(hash)) {
            scrollTarget = hash;
        } else if (storedTarget && document.querySelector(storedTarget)) {
            scrollTarget = storedTarget;
            sessionStorage.removeItem('mpkScrollTarget');
        }

        if (fileName === 'index.html' || fileName === '') {
            window.location.replace(getCleanUrlPath());
            return;
        }

        if (fileName !== urlSlug) {
            setCleanUrl();
        }

        if (scrollTarget) {
            window.setTimeout(function () {
                navigateToSection(scrollTarget);
            }, prefersReducedMotion ? 0 : 120);
            return;
        }

        setCleanUrl();
    };

    const bindGlobalFocusStyles = () => {
        $(document).on('click', 'a, button, input, textarea, select, [tabindex]', function () {
            const el = this;

            if (el.blur && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT') {
                window.setTimeout(function () {
                    el.blur();
                }, 0);
            }
        });
    };

    const updateActiveNavigation = (href) => {
        $('.navbar-nav li, .overlay-menu li').removeClass('active');

        if (!href) {
            return;
        }

        $('.navbar-nav li a[href="' + href + '"], .overlay-menu a[href="' + href + '"]').closest('li').addClass('active');
    };

    const smoothScrollToTarget = (targetId) => {
        const targetElement = document.querySelector(targetId);

        if (!targetElement) {
            return;
        }

        const top = window.pageYOffset + targetElement.getBoundingClientRect().top - scrollOffset;
        window.scrollTo({ top: Math.max(top, 0), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    const setOverlayOpen = (isOpen) => {
        const toggle = document.getElementById('toggle');
        const overlay = document.getElementById('overlay');

        if (!toggle || !overlay) {
            return;
        }

        toggle.classList.toggle('active', isOpen);
        overlay.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        document.body.classList.toggle('overlay-open', isOpen);
    };

    const bindNavigation = () => {
        $(document).on('click', '.navbar-nav li a, .overlay-menu a, .mpkLogo, .skip-link', function (event) {
            const href = $(this).attr('href');

            if (!href || href.charAt(0) !== '#') {
                return;
            }

            event.preventDefault();
            navigateToSection(href);
        });
    };

    const bindOverlay = () => {
        $(document).on('click', '#toggle', function () {
            const isOpen = !$('#overlay').hasClass('open');
            setOverlayOpen(isOpen);
        });

        $(document).on('keydown', function (event) {
            if (event.key === 'Escape' && $('#overlay').hasClass('open')) {
                setOverlayOpen(false);
                document.getElementById('toggle').focus();
            }
        });
    };

    const bindNavbarCollapse = () => {
        const toggleCollapse = () => {
            const navbar = document.querySelector('.navbar-default');

            if (!navbar) {
                return;
            }

            const top = navbar.getBoundingClientRect().top + window.pageYOffset;

            if (top > 50) {
                $('.navbar-fixed-top').addClass('top-nav-collapse');
            } else {
                $('.navbar-fixed-top').removeClass('top-nav-collapse');
            }
        };

        $(window).on('scroll', toggleCollapse);
        toggleCollapse();
    };

    const bindPreloader = () => {
        const preloader = document.getElementById('preloader');

        if (!preloader || pageType === 'project') {
            document.body.classList.add('loaded');
            return;
        }

        const startTime = Date.now();

        const hidePreloader = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, preloaderMinDuration - elapsed);

            window.setTimeout(function () {
                preloader.style.transition = 'opacity 0.5s ease';
                preloader.style.opacity = '0';
                window.setTimeout(function () {
                    preloader.style.display = 'none';
                    document.body.classList.add('loaded');
                }, prefersReducedMotion ? 0 : 500);
            }, prefersReducedMotion ? 0 : remaining);
        };

        if (document.readyState === 'complete') {
            hidePreloader();
        } else {
            window.addEventListener('load', hidePreloader);
        }
    };

    const initGalleryFilters = () => {
        $(document).on('click', '#filters .filter', function () {
            applyGalleryFilter($(this).data('filter'));
        });

        initMasonryGallery();
    };

    const initProjectFilters = () => {
        $(document).on('click', '#projectFilters .projectFilter', function () {
            applyProjectFilter($(this).data('filter'));
        });
    };

    const refreshGalleryVisibleItems = () => {
        galleryVisibleItems = [];

        $('#portfolio .mix').not('.is-filtered-out').each(function () {
            const $item = $(this);
            const img = $item.find('img').get(0);

            if (!img || $item.css('opacity') === '0') {
                return;
            }

            galleryVisibleItems.push({
                src: $item.attr('data-full-src') || img.getAttribute('src') || '',
                alt: img.getAttribute('alt') || ''
            });
        });
    };

    const openGalleryLightbox = (index) => {
        refreshGalleryVisibleItems();

        if (!galleryVisibleItems.length) {
            return;
        }

        const clickedItem = document.querySelector('#portfolio .mix[data-gallery-index="' + index + '"]');
        const visibleItems = Array.from(document.querySelectorAll('#portfolio .mix')).filter(function (item) {
            return !item.classList.contains('is-filtered-out') && item.style.display !== 'none';
        });
        galleryLightboxIndex = Math.max(visibleItems.indexOf(clickedItem), 0);

        updateGalleryLightbox();
        const modal = document.getElementById('galleryLightbox');
        modal.hidden = false;
        document.body.classList.add('modal-open');
        modal.querySelector('.mpkModalClose').focus();
    };

    const updateGalleryLightbox = () => {
        const item = galleryVisibleItems[galleryLightboxIndex];
        const image = document.getElementById('galleryLightboxImage');
        const caption = document.getElementById('galleryLightboxCaption');

        if (!item || !image) {
            return;
        }

        image.src = item.src;
        image.alt = item.alt;
        caption.textContent = item.alt + ' (' + (galleryLightboxIndex + 1) + ' / ' + galleryVisibleItems.length + ')';
    };

    const closeModal = (modalId) => {
        const modal = document.getElementById(modalId);

        if (!modal) {
            return;
        }

        modal.hidden = true;

        if (!document.querySelector('.mpkModal:not([hidden])')) {
            document.body.classList.remove('modal-open');
        }

        if (modalId === 'trailerModal') {
            document.getElementById('trailerIframe').src = '';
        }
    };

    const bindGalleryLightbox = () => {
        $(document).on('click', '#portfolio .mix', function () {
            refreshGalleryVisibleItems();
            const visibleIndex = $('#portfolio .mix:visible').index(this);
            openGalleryLightbox(Math.max(visibleIndex, 0));
        });

        $(document).on('click', '.galleryNavPrev', function () {
            galleryLightboxIndex = (galleryLightboxIndex - 1 + galleryVisibleItems.length) % galleryVisibleItems.length;
            updateGalleryLightbox();
        });

        $(document).on('click', '.galleryNavNext', function () {
            galleryLightboxIndex = (galleryLightboxIndex + 1) % galleryVisibleItems.length;
            updateGalleryLightbox();
        });
    };

    const bindTrailerModal = () => {
        $(document).on('click', '.projectWatchBtn', function (event) {
            event.preventDefault();
            const title = $(this).data('title');
            const trailer = $(this).data('trailer');
            const modal = document.getElementById('trailerModal');

            document.getElementById('trailerModalTitle').textContent = title;
            document.getElementById('trailerIframe').src = getYouTubeEmbedUrl(trailer);
            modal.hidden = false;
            document.body.classList.add('modal-open');
            modal.querySelector('.mpkModalClose').focus();
        });
    };

    const bindModalClose = () => {
        $(document).on('click', '[data-close-modal]', function () {
            closeModal($(this).closest('.mpkModal').attr('id'));
        });

        $(document).on('keydown', function (event) {
            if (event.key !== 'Escape') {
                return;
            }

            document.querySelectorAll('.mpkModal:not([hidden])').forEach(function (modal) {
                closeModal(modal.id);
            });
            setOverlayOpen(false);
        });
    };

    const bindCareerFlipTouch = () => {
        $(document).on('click', '.flip-card', function (event) {
            if ($(event.target).closest('.careerBtn').length) {
                return;
            }

            if (window.matchMedia('(hover: none)').matches) {
                $(this).toggleClass('is-flipped');
            }
        });

        $(document).on('keydown', '.flip-card', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                $(this).toggleClass('is-flipped');
            }
        });
    };

    const bindContactForm = () => {
        $(document).on('submit', '#contactForm', function (event) {
            event.preventDefault();
            const form = event.target;
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const message = form.message.value.trim();
            const note = document.getElementById('contactFormNote');

            if (!name || !email || !message) {
                note.textContent = 'Please fill in all fields.';
                return;
            }

            const subject = encodeURIComponent('Portfolio inquiry from ' + name);
            const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
            window.location.href = 'mailto:' + encodeURIComponent(contactData.email) + '?subject=' + subject + '&body=' + body;
            note.textContent = 'Opening your email client...';
        });
    };

    const initScrollReveal = () => {
        if (prefersReducedMotion) {
            document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
                el.classList.add('reveal-visible');
            });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
            observer.observe(el);
        });
    };

    const initScrollSpy = () => {
        const sectionIds = navigationData
            .map(function (item) { return item.href; })
            .filter(function (href) { return href && href.charAt(0) === '#'; });

        const sections = sectionIds
            .map(function (id) { return document.querySelector(id); })
            .filter(Boolean);

        if (!sections.length) {
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    updateActiveNavigation('#' + entry.target.id);
                }
            });
        }, { rootMargin: '-40% 0px -45% 0px', threshold: 0 });

        sections.forEach(function (section) {
            observer.observe(section);
        });
    };

    const initIndexPage = () => {
        renderNavigation('.navbar-nav');
        renderHero();
        renderAbout();
        renderCareer();
        renderProjects();
        renderGallery();
        renderProduction();
        renderContact();
        renderFooter();
        bindNavigation();
        bindOverlay();
        bindNavbarCollapse();
        bindPreloader();
        bindGlobalFocusStyles();
        initCleanUrl();
        initGalleryFilters();
        bindGalleryLightbox();
        bindCareerFlipTouch();
        bindContactForm();
        ensureModals();
        bindModalClose();
        initScrollReveal();
        initScrollSpy();
    };

    const bindWorkPageLinks = () => {
        $(document).on('click', '.workPageBack[data-scroll-target]', function () {
            sessionStorage.setItem('mpkScrollTarget', $(this).data('scroll-target'));
        });
    };

    const initProjectPage = () => {
        renderWorkPageHeader();
        renderProjects({ workPage: true, trailerModal: true });
        initProjectFilters();
        ensureModals();
        bindTrailerModal();
        bindModalClose();
        bindGlobalFocusStyles();
        bindWorkPageLinks();
        initScrollReveal();
        document.body.classList.add('loaded');
    };

    const init = () => {
        if (pageType === 'project') {
            initProjectPage();
            return;
        }

        initIndexPage();
    };

    $(init);

})(jQuery, window, document);
