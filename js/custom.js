(function ($, window, document) {
    'use strict';

    const siteData = window.MPK_SITE_DATA || {};
    const navigationData = siteData.navigation || [];
    const heroData = siteData.hero || {};
    const aboutData = siteData.about || {};
    const careerData = siteData.career || {};
    const projectData = siteData.project || {};
    const awardsData = siteData.awards || {};
    const galleryData = siteData.gallery || {};
    const productionData = siteData.production || {};
    const contactData = siteData.contact || {};
    const footerData = siteData.footer || {};
    const testimonialsData = siteData.testimonials || {};
    const siteSettings = siteData.site || {};
    const urlSlug = siteSettings.urlSlug || 'PraveenKMani.html';
    const scrollOffset = 84;
    const preloaderMinDuration = siteSettings.preloaderDuration || 1800;
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

    const renderMpkLogoInnerMarkup = () => {
        return [
            '<span class="mpkLogo__frame">',
            '  <span class="mpkLogo__clapper" aria-hidden="true"></span>',
            '  <span class="mpkLogo__perfs" aria-hidden="true"></span>',
            '  <span class="mpkLogo__letters" aria-hidden="true">',
            '    <span class="mpkLogo__char">M</span>',
            '    <span class="mpkLogo__char mpkLogo__char--p">P</span>',
            '    <span class="mpkLogo__char">K</span>',
            '  </span>',
            '</span>'
        ].join('');
    };

    const renderMpkLogoMarkup = (href, extraClass) => {
        const classes = ['mpkLogo'];

        if (extraClass) {
            classes.push(extraClass);
        }

        return [
            '<a class="' + escapeHtml(classes.join(' ')) + '" href="' + escapeHtml(href) + '" aria-label="MPK Home">',
            renderMpkLogoInnerMarkup(),
            '</a>'
        ].join('');
    };

    const initScrollToTop = () => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        window.scrollTo(0, 0);

        window.addEventListener('pageshow', function (event) {
            if (event.persisted) {
                window.scrollTo(0, 0);
            }
        });
    };

    const mountPreloaderLogo = () => {
        const loader = document.querySelector('#preloader .loader');

        if (!loader || loader.querySelector('.preloaderLogo')) {
            return;
        }

        loader.insertAdjacentHTML('afterbegin', [
            '<div class="preloaderLogo" aria-hidden="true">',
            '  <span class="mpkLogo mpkLogo--preloader">',
            renderMpkLogoInnerMarkup(),
            '  </span>',
            '</div>'
        ].join(''));
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
            '<div class="flip-card reveal-on-scroll" tabindex="0" aria-label="Film card for ' + escapeHtml(card.title) + '">',
            '  <button type="button" class="careerFlipBtn" aria-label="Open poster for ' + escapeHtml(card.title) + '">Open</button>',
            '  <div class="flip-card-inner">',
            '    <div class="flip-card-front">',
            '      <h1>' + escapeHtml(card.title) + '</h1>',
            '      <div class="careerField">',
            '        <strong class="careerFieldLabel">Year:</strong>',
            '        <span class="careerFieldValue">' + escapeHtml(card.year) + '</span>',
            '      </div>',
            '      <div class="careerField">',
            '        <strong class="careerFieldLabel">Synopsis:</strong>',
            '        <span class="careerFieldValue">' + escapeHtml(card.synopsis) + '</span>',
            '      </div>',
            '      <div class="careerField">',
            '        <strong class="careerFieldLabel">Starring:</strong>',
            '        <span class="careerFieldValue">' + escapeHtml(card.starring) + '</span>',
            '      </div>',
            '      <div class="careerField">',
            '        <strong class="careerFieldLabel">Production:</strong>',
            '        <span class="careerFieldValue">' + escapeHtml(card.production) + '</span>',
            '      </div>',
            '    </div>',
            '    <div class="flip-card-back" role="button" tabindex="-1" aria-label="Tap to return to film details">',
            '      <img src="' + escapeHtml(card.image) + '" alt="' + escapeHtml(card.title) + ' poster" loading="lazy" decoding="async">',
            '      <span class="careerFlipBackHint">Tap image to go back</span>',
            '    </div>',
            '  </div>',
            '  <a href="' + escapeHtml(card.link) + '" target="_blank" rel="noopener" class="careerBtn careerWatchBar"><span class="careerWatchLabel">Watch Film</span></a>',
            '</div>'
        ].join('');
    };

    const renderGalleryItem = (item, index) => {
        const sizeClasses = ['size-sm', 'size-sm', 'size-md', 'size-sm'];
        const sizeClass = sizeClasses[index % sizeClasses.length];

        return [
            '<button type="button" class="mix ' + sizeClass + ' ' + escapeHtml(item.category) + '" data-category="' + escapeHtml(item.category) + '" data-gallery-index="' + index + '" data-full-src="' + escapeHtml(item.src) + '" aria-label="View full image: ' + escapeHtml(item.alt) + '">',
            '  <span class="mixMedia">',
            '    <img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy" decoding="async">',
            '    <span class="mixOverlay" aria-hidden="true"><i class="fa fa-search-plus"></i></span>',
            '  </span>',
            '</button>'
        ].join('');
    };

    const renderProjectLinks = (card) => {
        if (!card.externalLinks || !card.externalLinks.length) {
            return '';
        }

        const linksHtml = card.externalLinks.map(function (link) {
            return '<a href="' + escapeHtml(link.href) + '" target="_blank" rel="noopener" class="projectExternalLink">' + escapeHtml(link.label) + '</a>';
        }).join('');

        return '<div class="projectExternalLinks">' + linksHtml + '</div>';
    };

    const renderProjectCard = (card, options) => {
        const opts = options || {};
        const watchClass = ' projectWatchCta' + (opts.trailerModal ? ' projectWatchBtn' : '');
        const watchAttrs = opts.trailerModal
            ? ' href="#" data-trailer="' + escapeHtml(card.link) + '" data-title="' + escapeHtml(card.title) + '"'
            : ' href="' + escapeHtml(card.link) + '" target="_blank" rel="noopener"';

        return [
            '<article class="projectCard reveal-on-scroll" data-format="' + escapeHtml(getProjectFilterKey(card)) + '" data-status="' + escapeHtml(String(card.status || '').toLowerCase()) + '">',
            '  <div class="projectCardMedia">',
            '    <img src="' + escapeHtml(card.image) + '" alt="' + escapeHtml(card.title) + '" loading="lazy" decoding="async">',
            '  </div>',
            '  <div class="projectCardBody">',
            '    <div class="projectCardMeta">',
            '      <span>' + escapeHtml(card.year) + '</span>',
            '      <span>' + escapeHtml(card.format) + '</span>',
            '      <span>' + escapeHtml(card.status) + '</span>',
            '    </div>',
            '    <h3>' + escapeHtml(card.title) + '</h3>',
            '    <p>' + escapeHtml(card.synopsis) + '</p>',
            renderProjectLinks(card),
            '    <div class="projectCardFooter">',
            '      <strong>' + escapeHtml(card.role) + '</strong>',
            '    </div>',
            '    <a class="projectWatchLink projectCardWatch' + watchClass + '"' + watchAttrs + '><span class="projectWatchLabel">Watch</span></a>',
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

        if (window.innerWidth < 576) {
            return 2;
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

    const applyBannerImages = () => {
        const heroImages = heroData.images || {};
        const aboutImages = aboutData.images || {};
        const root = document.documentElement;
        const header = document.querySelector('.main-header');

        if (heroImages.background) {
            const bgValue = "url('" + heroImages.background + "')";

            root.style.setProperty('--mpk-banner-bg', bgValue);

            if (header) {
                header.style.backgroundImage = bgValue;
                header.style.backgroundRepeat = 'no-repeat';
                header.style.backgroundSize = 'cover';
                header.style.backgroundPosition = 'center top';
            }
        }

        if (heroImages.portrait) {
            root.style.setProperty('--mpk-banner-portrait', "url('" + heroImages.portrait + "')");

            const portraitImg = document.getElementById('portfolioImg');

            if (portraitImg) {
                portraitImg.setAttribute('src', heroImages.portrait);
            }
        }

        if (aboutImages.portrait) {
            root.style.setProperty('--mpk-about-portrait', "url('" + aboutImages.portrait + "')");

            const aboutImg = document.querySelector('.bulletLeftImgData');

            if (aboutImg) {
                aboutImg.setAttribute('src', aboutImages.portrait);
            }
        }
    };

    const renderHero = () => {
        const $heroMount = $('.bannerInnerContent');

        if (!$heroMount.length || !heroData.name) {
            return;
        }

        const portraitSrc = (heroData.images && heroData.images.portrait) || 'assets/images/banner/mpk1.jpg';
        const showreel = heroData.showreel || {};
        const ctaSecondary = heroData.ctaSecondary || {};
        const showreelHtml = showreel.href
            ? '<a class="heroCta heroCta--primary" href="' + escapeHtml(showreel.href) + '" target="_blank" rel="noopener"><i class="fa fa-play" aria-hidden="true"></i> ' + escapeHtml(showreel.label || 'Watch Showreel') + '</a>'
            : '';
        const secondaryHtml = ctaSecondary.href
            ? '<a class="heroCta heroCta--secondary" href="' + escapeHtml(ctaSecondary.href) + '">' + escapeHtml(ctaSecondary.label || 'View Projects') + '</a>'
            : '';
        const heroActionsHtml = (showreelHtml || secondaryHtml)
            ? '<div class="heroActions">' + showreelHtml + secondaryHtml + '</div>'
            : '';

        $heroMount.html([
            '<div class="heroStage">',
            '  <div class="banner_innerImg heroPortrait">',
            '    <span class="heroPortraitFrame" aria-hidden="true"></span>',
            '    <img id="portfolioImg" src="' + escapeHtml(portraitSrc) + '" alt="' + escapeHtml(heroData.imageAlt) + '" decoding="async" fetchpriority="high">',
            '  </div>',
            '  <div class="banner_innerText heroCopy">',
            '    <p class="heroEyebrow">' + escapeHtml(heroData.eyebrow) + '<span class="icon" aria-hidden="true">→</span></p>',
            '    <h4 class="heroName">' + escapeHtml(heroData.name) + '</h4>',
            '    <p class="heroTitle">' + escapeHtml(heroData.title) + '</p>',
            '    <p class="profileLine">"' + escapeHtml(heroData.quote) + '"</p>',
            heroActionsHtml,
            '  </div>',
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

        const aboutPortrait = (aboutData.images && aboutData.images.portrait) || 'assets/images/banner/mpk2.jpg';

        $aboutMount.html([
            '<div class="aboutSection contentSection reveal-on-scroll">',
            '  <div class="aboutContent">',
            '    <div class="aboutWrapper">',
            '      <h2>' + escapeHtml(aboutData.title) + '</h2>',
            '      <p class="sectionIntro">' + escapeHtml(aboutData.intro) + '</p>',
            '      <p class="sectionIntro aboutSecondary">' + escapeHtml(aboutData.secondary) + '</p>',
            '    </div>',
            '    <div class="aboutBulletContainer">',
            '      <div class="bulletLeftImg hide-on-mobile">',
            '        <img class="bulletLeftImgData" src="' + escapeHtml(aboutPortrait) + '" alt="Praveen K Mani portrait" decoding="async">',
            '      </div>',
            '      <div class="aboutDetailCard">',
            '        <div class="bulletRightList">',
            '          <div class="bulletRightListData">',
            '            <h3><span class="underline">' + escapeHtml(aboutData.heading) + '</span></h3>',
            '            <p>' + escapeHtml(aboutData.body) + '</p>',
            '            <ul>' + bulletItems + '</ul>',
            '          </div>',
            '        </div>',
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
            '<div class="careerSection contentSection">',
            '  <h2 class="reveal-on-scroll">' + escapeHtml(careerData.title) + '</h2>',
            '  <p class="careerIntro sectionIntro reveal-on-scroll">' + escapeHtml(careerData.intro) + '</p>',
            '  <div class="careerCardGrid">',
            '    <div class="careerDataInnerWrapper">' + cardsHtml + '</div>',
            '  </div>',
            '</div>'
        ].join(''));
    };

    const renderAwardList = (items) => {
        return (items || []).map(function (item) {
            return [
                '<div class="awardEntry">',
                '  <span class="awardEntryDot" aria-hidden="true"></span>',
                '  <div class="awardEntryContent">',
                '    <strong class="awardEntryTitle">' + escapeHtml(item.title) + '</strong>',
                '    <p class="awardEntryDesc">' + escapeHtml(item.description) + '</p>',
                '  </div>',
                '</div>'
            ].join('');
        }).join('');
    };

    const renderAboutList = (items) => {
        return (items || []).map(function (item) {
            return [
                '<div class="awardEntry awardEntry--about">',
                '  <span class="awardEntryDot" aria-hidden="true"></span>',
                '  <div class="awardEntryContent">',
                '    <strong class="awardEntryTitle">' + escapeHtml(item.label) + '</strong>',
                '    <p class="awardEntryDesc">' + escapeHtml(item.text) + '</p>',
                '  </div>',
                '</div>'
            ].join('');
        }).join('');
    };

    const renderAwardGroup = (title, iconClass, contentHtml) => {
        return [
            '<div class="awardGroup">',
            '  <div class="awardGroupHead">',
            '    <span class="awardGroupIconWrap"><i class="fa ' + iconClass + '" aria-hidden="true"></i></span>',
            '    <h4 class="awardGroupTitle">' + escapeHtml(title) + '</h4>',
            '  </div>',
            '  <div class="awardEntryGrid">' + contentHtml + '</div>',
            '</div>'
        ].join('');
    };

    const renderAwards = () => {
        const $mount = $('#awards');

        if (!$mount.length || !awardsData.films || !awardsData.films.length) {
            return;
        }

        const filmsHtml = awardsData.films.map(function (film, index) {
            const festivalsHtml = film.festivals
                ? renderAwardGroup(
                    film.festivalsTitle || 'Major Festival Selections & Forums',
                    'fa-film',
                    renderAwardList(film.festivals)
                )
                : '';

            const aboutHtml = film.about
                ? renderAwardGroup(
                    film.aboutTitle || 'About the Project',
                    'fa-info-circle',
                    renderAboutList(film.about)
                )
                : '';

            const statHtml = film.stat
                ? '<p class="awardFilmStat"><i class="fa fa-trophy" aria-hidden="true"></i><span>' + escapeHtml(film.stat) + '</span></p>'
                : '';

            const indexLabel = String(index + 1).padStart(2, '0');

            return [
                '<article class="awardFilmCard">',
                '  <div class="awardFilmHeader">',
                '    <span class="awardFilmIndex" aria-hidden="true">' + indexLabel + '</span>',
                '    <div class="awardFilmHeaderMain">',
                '      <span class="awardFilmBadge">' + escapeHtml(film.type) + '<span class="awardFilmBadgeSep">·</span>' + escapeHtml(film.year) + '</span>',
                '      <h3>' + escapeHtml(film.title) + '</h3>',
                statHtml,
                '    </div>',
                '  </div>',
                '  <div class="awardFilmIntroWrap">',
                '    <p class="awardFilmIntro">' + escapeHtml(film.intro) + '</p>',
                '  </div>',
                '  <div class="awardFilmBody">',
                renderAwardGroup(
                    film.awardCategoriesTitle || 'Festival Awards & Recognitions',
                    'fa-trophy',
                    renderAwardList(film.awardCategories)
                ),
                festivalsHtml,
                aboutHtml,
                '  </div>',
                '</article>'
            ].join('');
        }).join('');

        $mount.html([
            '<div class="awardsSection sectionShell mpkPolishSection">',
            '  <div class="awardsSectionDecor" aria-hidden="true"></div>',
            '  <div class="awardsSectionHead mpkPolishSectionHead">',
            '    <p class="sectionEyebrow">' + escapeHtml(awardsData.eyebrow || 'Recognition') + '</p>',
            '    <h2 class="reveal-on-scroll">' + escapeHtml(awardsData.title) + '</h2>',
            '    <p class="sectionIntro reveal-on-scroll">' + escapeHtml(awardsData.intro) + '</p>',
            '  </div>',
            '  <div class="awardsFilms">' + filmsHtml + '</div>',
            '</div>'
        ].join(''));
    };

    const renderTestimonials = () => {
        const $mount = $('#testimonials');

        if (!$mount.length || !testimonialsData.items || !testimonialsData.items.length) {
            return;
        }

        const itemsHtml = testimonialsData.items.map(function (item) {
            return [
                '<blockquote class="testimonialCard reveal-on-scroll">',
                '  <span class="testimonialMark" aria-hidden="true"><i class="fa fa-quote-left"></i></span>',
                '  <p class="testimonialQuote">' + escapeHtml(item.quote) + '</p>',
                '  <cite class="testimonialSource">' + escapeHtml(item.source) + '</cite>',
                '</blockquote>'
            ].join('');
        }).join('');

        $mount.html([
            '<div class="testimonialsSection sectionShell mpkPolishSection">',
            '  <div class="mpkPolishSectionHead">',
            '  <p class="sectionEyebrow">' + escapeHtml(testimonialsData.eyebrow || 'Recognition') + '</p>',
            '  <h2 class="reveal-on-scroll">' + escapeHtml(testimonialsData.title) + '</h2>',
            '  <p class="sectionIntro reveal-on-scroll">' + escapeHtml(testimonialsData.intro) + '</p>',
            '  </div>',
            '  <div class="testimonialsGrid">' + itemsHtml + '</div>',
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

            const imageHtml = credit.image
                ? [
                    '  <div class="productionCardMedia">',
                    '    <img src="' + escapeHtml(credit.image) + '" alt="' + escapeHtml(credit.company) + '">',
                    '  </div>'
                ].join('')
                : '';

            return [
                '<article class="productionCard reveal-on-scroll">',
                imageHtml,
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
            '<div class="productionSection sectionShell mpkPolishSection reveal-on-scroll">',
            '  <div class="mpkPolishSectionHead">',
            '  <p class="sectionEyebrow">Behind the camera</p>',
            '  <h2>' + escapeHtml(productionData.title) + '</h2>',
            '  <p class="sectionIntro">' + escapeHtml(productionData.intro) + '</p>',
            '  </div>',
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

        const pressKit = contactData.pressKit || {};
        const pressKitHtml = pressKit.enabled && pressKit.href
            ? '<a class="pressKitLink" href="' + escapeHtml(pressKit.href) + '" download><i class="fa fa-download" aria-hidden="true"></i> ' + escapeHtml(pressKit.label || 'Download Press Kit') + '</a>'
            : '';

        const buildContactTile = (icon, label, value, href, external) => {
            const content = [
                '<span class="contactLinkTile__icon" aria-hidden="true"><i class="fa fa-' + escapeHtml(icon) + '"></i></span>',
                '<span class="contactLinkTile__text">',
                '  <strong>' + escapeHtml(label) + '</strong>',
                '  <span>' + escapeHtml(value) + '</span>',
                '</span>'
            ].join('');

            if (href) {
                const externalAttrs = external ? ' target="_blank" rel="noopener"' : '';
                return '<a class="contactLinkTile" href="' + escapeHtml(href) + '"' + externalAttrs + '>' + content + '</a>';
            }

            return '<div class="contactLinkTile contactLinkTile--static">' + content + '</div>';
        };

        const contactTilesHtml = [
            buildContactTile('envelope', 'Email', contactData.email, 'mailto:' + contactData.email, false),
            contactData.phone
                ? buildContactTile('phone', 'Phone', contactData.phone, 'tel:' + String(contactData.phone).replace(/\s/g, ''), false)
                : '',
            buildContactTile('map-marker', 'Location', contactData.location, '', false)
        ].join('');

        const socialTilesHtml = (contactData.social || []).map(function (item) {
            const tileLabel = item.icon === 'youtube'
                ? 'YouTube'
                : (item.icon === 'instagram' ? 'Instagram' : item.label);

            return buildContactTile(item.icon, tileLabel, item.label, item.href, true);
        }).join('');

        $mount.html([
            '<div class="contactSection sectionShell mpkPolishSection reveal-on-scroll">',
            '  <div class="contactSectionHeader mpkPolishSectionHead">',
            '    <p class="sectionEyebrow">Get in touch</p>',
            '    <h2>' + escapeHtml(contactData.title) + '</h2>',
            '    <p class="sectionIntro">' + escapeHtml(contactData.intro) + '</p>',
            pressKitHtml,
            '  </div>',
            '  <div class="contactPanel">',
            '    <div class="contactPanel__grid">',
            '      <div class="contactPanel__form">',
            '        <form class="contactForm contactForm--embedded" id="contactForm" novalidate>',
            '          <h3>Send a message</h3>',
            '          <div class="contactForm__row">',
            '            <div class="contactForm__field">',
            '              <label for="contactName">Name</label>',
            '              <input type="text" id="contactName" name="name" required autocomplete="name" placeholder="Your name">',
            '            </div>',
            '            <div class="contactForm__field">',
            '              <label for="contactEmail">Email</label>',
            '              <input type="email" id="contactEmail" name="email" required autocomplete="email" placeholder="you@example.com">',
            '            </div>',
            '          </div>',
            '          <div class="contactForm__field">',
            '            <label for="contactMessage">Message</label>',
            '            <textarea id="contactMessage" name="message" rows="3" required placeholder="Tell me about your project..."></textarea>',
            '          </div>',
            '          <button type="submit">Send Message</button>',
            '          <p class="contactFormNote" id="contactFormNote" role="status" aria-live="polite"></p>',
            '        </form>',
            '      </div>',
            '      <aside class="contactPanel__aside" aria-label="Contact information">',
            '        <h3>Reach directly</h3>',
            '        <p class="contactPanel__lead">Collaborations, screenings, festivals &amp; press.</p>',
            '        <div class="contactLinkGrid">' + contactTilesHtml + socialTilesHtml + '</div>',
            '      </aside>',
            '    </div>',
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
            '    <p class="hide-on-mobile">' + escapeHtml(footerData.tagline || '') + '</p>',
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

        if (storedTarget && document.querySelector(storedTarget)) {
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

    const mountMobileOverlay = () => {
        const overlay = document.getElementById('overlay');

        if (!overlay || overlay.dataset.mounted === 'true') {
            return;
        }

        document.body.appendChild(overlay);
        overlay.dataset.mounted = 'true';
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
        mountMobileOverlay();

        $(document).on('click', '#toggle', function (event) {
            event.preventDefault();
            event.stopPropagation();
            const isOpen = !$('#overlay').hasClass('open');
            setOverlayOpen(isOpen);
        });

        $(document).on('click', '#overlay', function (event) {
            if (event.target === this) {
                setOverlayOpen(false);
            }
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

        mountPreloaderLogo();
        window.scrollTo(0, 0);
        document.body.classList.remove('loaded');

        const steps = Array.prototype.slice.call(preloader.querySelectorAll('.loaderWords p'));
        const wordDelay = prefersReducedMotion ? 0 : 850;
        const holdAfterSequence = prefersReducedMotion ? 0 : 550;
        let sequenceComplete = false;
        let pageLoaded = document.readyState === 'complete';

        const runWordSequence = (callback) => {
            if (!steps.length || prefersReducedMotion) {
                callback();
                return;
            }

            let activeIndex = 0;

            const setActive = (index) => {
                steps.forEach(function (step, stepIndex) {
                    step.classList.toggle('is-active', stepIndex <= index);
                });
            };

            setActive(0);

            const advance = () => {
                activeIndex += 1;
                if (activeIndex < steps.length) {
                    setActive(activeIndex);
                    window.setTimeout(advance, wordDelay);
                } else {
                    window.setTimeout(callback, holdAfterSequence);
                }
            };

            if (steps.length > 1) {
                window.setTimeout(advance, wordDelay);
            } else {
                window.setTimeout(callback, holdAfterSequence);
            }
        };

        const hidePreloader = () => {
            preloader.style.transition = 'opacity 0.5s ease';
            preloader.style.opacity = '0';
            window.setTimeout(function () {
                preloader.style.display = 'none';
                document.body.classList.add('loaded');
                window.scrollTo(0, 0);
            }, prefersReducedMotion ? 0 : 500);
        };

        const tryFinish = () => {
            if (!sequenceComplete || !pageLoaded) {
                return;
            }

            const minDuration = prefersReducedMotion ? 0 : preloaderMinDuration;
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDuration - elapsed);

            window.setTimeout(hidePreloader, prefersReducedMotion ? 0 : remaining);
        };

        const startTime = Date.now();

        runWordSequence(function () {
            sequenceComplete = true;
            tryFinish();
        });

        if (!pageLoaded) {
            window.addEventListener('load', function () {
                pageLoaded = true;
                tryFinish();
            });
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
        const setCareerCardFlipped = ($card, isFlipped) => {
            $card.toggleClass('is-flipped', isFlipped);

            const $btn = $card.find('.careerFlipBtn');

            if (!$btn.length) {
                return;
            }

            $btn.text(isFlipped ? 'Back' : 'Open');
            $btn.attr('aria-label', isFlipped
                ? 'Back to film details for ' + $card.find('.flip-card-front h1').text()
                : 'Open poster for ' + $card.find('.flip-card-front h1').text());
        };

        $(document).on('click', '.careerFlipBtn', function (event) {
            event.preventDefault();
            event.stopPropagation();

            const $card = $(this).closest('.flip-card');
            const isFlipped = !$card.hasClass('is-flipped');

            setCareerCardFlipped($card, isFlipped);
        });

        $(document).on('click', '.careerCardGrid .flip-card-back, .careerCardGrid .flip-card-back img, .careerCardGrid .careerFlipBackHint', function (event) {
            event.preventDefault();
            event.stopPropagation();

            const $card = $(this).closest('.flip-card');

            setCareerCardFlipped($card, false);
        });

        $(document).on('click', '.flip-card', function (event) {
            if ($(event.target).closest('.careerBtn, .careerFlipBtn, .flip-card-back, .careerFlipBackHint').length) {
                return;
            }

            if (window.matchMedia('(hover: none)').matches) {
                return;
            }
        });

        $(document).on('keydown', '.flip-card', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                if ($(event.target).closest('.careerBtn').length) {
                    return;
                }

                event.preventDefault();

                if ($(event.target).closest('.careerFlipBtn').length) {
                    $(event.target).trigger('click');
                    return;
                }

                const $card = $(this);
                const isFlipped = !$card.hasClass('is-flipped');

                setCareerCardFlipped($card, isFlipped);
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
            const formEndpoint = contactData.formEndpoint;

            if (!name || !email || !message) {
                note.textContent = 'Please fill in all fields.';
                return;
            }

            if (formEndpoint) {
                note.textContent = 'Sending message...';

                fetch(formEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        message: message,
                        _subject: 'Portfolio inquiry from ' + name
                    })
                }).then(function (response) {
                    if (!response.ok) {
                        throw new Error('Request failed');
                    }

                    form.reset();
                    note.textContent = 'Thank you! Your message has been sent.';
                }).catch(function () {
                    note.textContent = 'Unable to send right now. Please email directly.';
                });

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

    const initDeviceMode = () => {
        const setDevice = () => {
            const width = window.innerWidth;
            let device = 'desktop';

            if (width <= 767) {
                device = 'mobile';
            } else if (width <= 991) {
                device = 'tablet';
            }

            document.documentElement.setAttribute('data-device', device);
            document.body.classList.toggle('is-mobile', device === 'mobile');
            document.body.classList.toggle('is-tablet', device === 'tablet');
        };

        setDevice();
        window.addEventListener('resize', function () {
            setDevice();

            if (document.getElementById('portfolio')) {
                window.clearTimeout(initDeviceMode._timer);
                initDeviceMode._timer = window.setTimeout(function () {
                    layoutMasonry(false);
                }, 150);
            }
        });
        window.addEventListener('orientationchange', setDevice);
    };

    const initIndexPage = () => {
        initScrollToTop();
        initDeviceMode();
        renderNavigation('.navbar-nav');
        renderHero();
        applyBannerImages();
        renderAbout();
        renderCareer();
        renderProjects();
        renderAwards();
        renderGallery();
        renderProduction();
        renderTestimonials();
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
        initScrollToTop();
        initDeviceMode();
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

    initScrollToTop();

    $(init);

})(jQuery, window, document);
