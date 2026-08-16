(function (window, document) {
    'use strict';

    const siteData = window.MPK_SITE_DATA || {};
    const siteSettings = siteData.site || {};
    const seoData = siteData.seo || {};
    const heroData = siteData.hero || {};
    const contactData = siteData.contact || {};
    const projectData = siteData.project || {};

    const upsertMeta = (attr, key, value) => {
        if (!value) {
            return;
        }

        let tag = document.querySelector('meta[' + attr + '="' + key + '"]');

        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute(attr, key);
            document.head.appendChild(tag);
        }

        tag.setAttribute('content', value);
    };

    const upsertLink = (rel, href, extra) => {
        if (!href) {
            return;
        }

        let tag = document.querySelector('link[rel="' + rel + '"]');

        if (!tag) {
            tag = document.createElement('link');
            tag.setAttribute('rel', rel);
            document.head.appendChild(tag);
        }

        tag.setAttribute('href', href);

        if (extra) {
            Object.keys(extra).forEach(function (name) {
                tag.setAttribute(name, extra[name]);
            });
        }
    };

    const getSiteOrigin = () => {
        if (siteSettings.siteUrl) {
            return String(siteSettings.siteUrl).replace(/\/$/, '');
        }

        if (window.location.origin && window.location.origin !== 'null') {
            return window.location.origin;
        }

        return '';
    };

    const getCanonicalUrl = () => {
        if (siteSettings.canonicalUrl) {
            return siteSettings.canonicalUrl;
        }

        const origin = getSiteOrigin();
        const path = window.location.pathname.split('/').pop() || siteSettings.urlSlug || 'PraveenKMani.html';

        return origin ? origin + '/' + path : '';
    };

    const toAbsoluteUrl = (path) => {
        const origin = getSiteOrigin();

        if (!path || !origin) {
            return path || '';
        }

        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        return origin + '/' + String(path).replace(/^\//, '');
    };

    const injectSeoMeta = () => {
        const title = seoData.title || document.title;
        const description = seoData.description || '';
        const image = toAbsoluteUrl(seoData.image || (heroData.images && heroData.images.portrait));
        const canonical = getCanonicalUrl();

        if (title) {
            document.title = title;
        }

        upsertMeta('name', 'description', description);
        upsertMeta('name', 'keywords', seoData.keywords || '');
        upsertMeta('name', 'author', heroData.name || 'Praveen K Mani');
        upsertMeta('name', 'robots', 'index, follow');
        upsertMeta('property', 'og:type', 'website');
        upsertMeta('property', 'og:site_name', siteSettings.siteName || title);
        upsertMeta('property', 'og:title', title);
        upsertMeta('property', 'og:description', description);
        upsertMeta('property', 'og:image', image);
        upsertMeta('property', 'og:url', canonical);
        upsertMeta('property', 'og:locale', siteSettings.locale || 'en_IN');
        upsertMeta('name', 'twitter:card', seoData.twitterCard || 'summary_large_image');
        upsertMeta('name', 'twitter:title', title);
        upsertMeta('name', 'twitter:description', description);
        upsertMeta('name', 'twitter:image', image);
        upsertLink('canonical', canonical);
    };

    const injectJsonLd = () => {
        const origin = getSiteOrigin();
        const films = (projectData.projects || []).map(function (project) {
            const film = {
                '@type': 'Movie',
                name: project.title,
                datePublished: project.year,
                description: project.synopsis,
                image: toAbsoluteUrl(project.image),
                url: project.link
            };

            if (project.externalLinks && project.externalLinks.length) {
                film.sameAs = project.externalLinks.map(function (link) {
                    return link.href;
                });
            }

            return film;
        });

        const schema = {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'Person',
                    '@id': origin ? origin + '/#person' : '#person',
                    name: heroData.name || 'Praveen K Mani',
                    jobTitle: heroData.title || 'Film Director',
                    description: seoData.description,
                    image: toAbsoluteUrl(heroData.images && heroData.images.portrait),
                    url: getCanonicalUrl(),
                    email: contactData.email || undefined,
                    address: contactData.location ? {
                        '@type': 'PostalAddress',
                        addressLocality: contactData.location
                    } : undefined,
                    sameAs: (contactData.social || []).map(function (item) {
                        return item.href;
                    })
                },
                {
                    '@type': 'WebSite',
                    '@id': origin ? origin + '/#website' : '#website',
                    name: siteSettings.siteName || seoData.title,
                    url: origin || getCanonicalUrl(),
                    description: seoData.description,
                    inLanguage: siteSettings.locale || 'en'
                },
                {
                    '@type': 'WebPage',
                    '@id': getCanonicalUrl() + '#webpage',
                    url: getCanonicalUrl(),
                    name: seoData.title,
                    description: seoData.description,
                    isPartOf: { '@id': origin ? origin + '/#website' : '#website' },
                    about: { '@id': origin ? origin + '/#person' : '#person' }
                }
            ]
        };

        if (films.length) {
            schema['@graph'].push({
                '@type': 'ItemList',
                name: 'Filmography',
                itemListElement: films.map(function (film, index) {
                    return {
                        '@type': 'ListItem',
                        position: index + 1,
                        item: film
                    };
                })
            });
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    };

    const initAnalytics = () => {
        const analyticsId = siteSettings.analyticsId;

        if (!analyticsId) {
            return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(analyticsId);
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];

        window.gtag = function () {
            window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', analyticsId, { anonymize_ip: true });
    };

    window.initMpkEnhancements = function () {
        injectSeoMeta();
        injectJsonLd();
        initAnalytics();
    };

    if (document.head) {
        window.initMpkEnhancements();
    }
}(window, document));
