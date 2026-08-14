import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import appConfig from 'app.config';
import {
  buildAbsoluteUrl,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildRobotsDirectives,
  buildWebsiteSchema,
  decodeHtmlEntities,
  getSiteUrl,
  resolveSeoImage,
} from 'utilities';

/**
 * Provide SEO related meta tags to a page.
 *
 * @param {Props} props The props object.
 * @param {string} props.title Used for the page title, og:title, twitter:title, etc.
 * @param {string} props.description Used for the meta description, og:description, twitter:description, etc.
 * @param {string} props.keywords Used for the legacy meta keywords tag.
 * @param {string} props.imageUrl Used for the og:image and twitter:image.
 * @param {string} props.imageAlt Used for the og:image:alt and twitter:image:alt.
 * @param {string} props.url Used for the og:url and twitter:url.
 * @param {string} props.canonicalPath Used to define a canonical when url is omitted.
 * @param {string} props.type Used for the og:type tag.
 * @param {boolean} props.noindex When true, blocks indexing.
 * @param {boolean} props.nofollow When true, blocks link following.
 * @param {boolean} props.noarchive When true, blocks search result caching.
 * @param {Array<object>|object} props.structuredData Structured data objects to emit.
 *
 * @returns {React.ReactElement} The SEO component
 */
export default function SEO({
  title,
  description,
  keywords,
  imageUrl,
  imageAlt,
  url,
  canonicalPath,
  type = 'website',
  noindex = false,
  nofollow = false,
  noarchive = false,
  structuredData,
}) {
  const router = useRouter();
  const seoDefaults = appConfig?.seo || {};
  const normalizeSeoText = (value = '') => decodeHtmlEntities(`${value ?? ''}`)
    .replace(/\s+/g, ' ')
    .trim();
  const siteName = seoDefaults.siteName || appConfig?.organization?.name || 'Site';
  const fallbackTitle = normalizeSeoText(
    title || seoDefaults.defaultTitle || siteName
  );
  const defaultDescription = normalizeSeoText(
    seoDefaults.defaultDescription || appConfig?.organization?.name
  );
  const requestedDescription = normalizeSeoText(description);
  const genericDescriptionValues = new Set(['home', 'homepage', 'page']);
  const requestedDescriptionLower = requestedDescription.toLowerCase();
  const isThinRequestedDescription =
    !requestedDescription
    || requestedDescription.length < 50
    || requestedDescriptionLower === fallbackTitle.toLowerCase()
    || genericDescriptionValues.has(requestedDescriptionLower);
  const fallbackDescription = normalizeSeoText(
    (isThinRequestedDescription
      ? defaultDescription || requestedDescription || fallbackTitle
      : requestedDescription)
  );
  const socialImageUrl = imageUrl || seoDefaults.defaultSocialImage;
  const socialImageAlt = normalizeSeoText(
    imageAlt || seoDefaults.defaultImageAlt || siteName
  );

  if (!fallbackTitle && !fallbackDescription && !keywords && !socialImageUrl && !url) {
    return null;
  }
  const typekitHref = 'https://use.typekit.net/mfv5sni.css';
  const googleFontsHref =
    'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@200;300;400;500;600;700&display=swap';
  const siteUrl = getSiteUrl();
  const canonicalUrl =
    url || buildAbsoluteUrl(canonicalPath || router?.asPath || '/');
  const shouldRenderCanonical = Boolean(canonicalUrl) && !noindex;
  const shouldRenderSocialUrl = Boolean(canonicalUrl);
  const resolvedImageUrl = resolveSeoImage(socialImageUrl);
  const robots = buildRobotsDirectives({ noindex, nofollow, noarchive });
  const schemaItems = [
    buildOrganizationSchema(),
    !noindex ? buildLocalBusinessSchema() : null,
    !noindex ? buildWebsiteSchema() : null,
    ...(Array.isArray(structuredData)
      ? structuredData
      : structuredData
        ? [structuredData]
        : []),
  ].filter(Boolean);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        {/* Load external font stylesheets without blocking initial render. */}
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="preconnect" href="https://p.typekit.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <noscript>
          <link rel="stylesheet" href={typekitHref} />
          <link rel="stylesheet" href={googleFontsHref} />
        </noscript>
        {shouldRenderCanonical && (
          <link rel="canonical" href={canonicalUrl} />
        )}
        <meta name="robots" content={robots} />
        <meta name="googlebot" content={robots} />
        <meta name="theme-color" content="#0f5c4d" />
        <meta name="format-detection" content="telephone=yes" />

        <meta property="og:type" content={type} />
        <meta property="og:site_name" content={siteName} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={seoDefaults.twitterHandle || '@site'} />
        <meta name="twitter:domain" content={siteUrl.replace(/^https?:\/\//, '')} />

        <title>{fallbackTitle}</title>
        <meta name="title" content={fallbackTitle} />
        <meta property="og:title" content={fallbackTitle} />
        <meta name="twitter:title" content={fallbackTitle} />

        <meta name="description" content={fallbackDescription} />
        <meta property="og:description" content={fallbackDescription} />
        <meta name="twitter:description" content={fallbackDescription} />

        {keywords && <meta name="keywords" content={keywords} />}

        {resolvedImageUrl && (
          <>
            <meta property="og:image" content={resolvedImageUrl} />
            <meta name="twitter:image" content={resolvedImageUrl} />
            <meta property="og:image:alt" content={socialImageAlt} />
            <meta name="twitter:image:alt" content={socialImageAlt} />
          </>
        )}

        {shouldRenderSocialUrl && (
          <>
            <meta property="og:url" content={canonicalUrl} />
            <meta name="twitter:url" content={canonicalUrl} />
          </>
        )}
        {schemaItems.map((schema, index) => (
          <script
            key={`seo-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema),
            }}
          />
        ))}
      </Head>
      <Script
        id="defer-external-font-styles"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var head = document.head;
              if (!head) return;
              var hrefs = ${JSON.stringify([typekitHref, googleFontsHref])};

              hrefs.forEach(function(href) {
                if (head.querySelector('link[data-font-href="' + href + '"]')) return;

                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.setAttribute('data-font-href', href);
                head.appendChild(link);
              });
            })();
          `,
        }}
      />
    </>
  );
}
