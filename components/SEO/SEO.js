import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import {
  buildAbsoluteUrl,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildRobotsDirectives,
  buildWebsiteSchema,
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

  if (!title && !description && !keywords && !imageUrl && !url) {
    return null;
  }
  const typekitHref = 'https://use.typekit.net/mfv5sni.css';
  const googleFontsHref =
    'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@200;300;400;500;600;700&display=swap';
  const siteUrl = getSiteUrl();
  const canonicalUrl =
    url || buildAbsoluteUrl(canonicalPath || router?.asPath || '/');
  const shouldRenderCanonical = Boolean(canonicalUrl) && !noindex;
  const resolvedImageUrl = resolveSeoImage(imageUrl);
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
        <meta
          property="og:site_name"
          content="Cal Poly Conference and Event Planning"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta name="twitter:domain" content={siteUrl.replace(/^https?:\/\//, '')} />

        {title && (
          <>
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta property="og:title" content={title} />
            <meta property="twitter:title" content={title} />
          </>
        )}

        {description && (
          <>
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
            <meta property="twitter:description" content={description} />
          </>
        )}

        {keywords && <meta name="keywords" content={keywords} />}

        {imageUrl && (
          <>
            <meta property="og:image" content={resolvedImageUrl} />
            <meta property="twitter:image" content={resolvedImageUrl} />
            {imageAlt ? (
              <>
                <meta property="og:image:alt" content={imageAlt} />
                <meta property="twitter:image:alt" content={imageAlt} />
              </>
            ) : null}
          </>
        )}

        {shouldRenderCanonical && (
          <>
            <meta property="og:url" content={canonicalUrl} />
            <meta property="twitter:url" content={canonicalUrl} />
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
