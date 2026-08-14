import * as MENUS from 'constants/menus';

import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { Button, Footer, Header, Main, NavigationMenu, SEO } from 'components';
import appConfig from 'app.config';
import { BlogInfoFragment } from 'fragments/GeneralSettings';
import styles from 'styles/pages/_404.module.scss';
import { buildAbsoluteUrl, buildKeywordString } from 'utilities';

export default function Page() {
  const { data: pageData, loading: pageLoading } = useQuery(Page.query, {
    variables: Page.variables(),
  });

  const fallbackSiteTitle =
    appConfig?.seo?.defaultTitle ||
    appConfig?.seo?.siteName ||
    appConfig?.organization?.name ||
    'Page Not Found';
  const fallbackSiteDescription =
    appConfig?.seo?.defaultDescription ||
    'The page you are looking for could not be found. Try heading home or searching the site.';

  const { title: siteTitle, description: siteDescription } =
    pageData?.generalSettings ?? {
      title: fallbackSiteTitle,
      description: fallbackSiteDescription,
    };

  const pageTitle = siteTitle ? `404 - ${siteTitle}` : '404 - Page Not Found';
  const description =
    siteDescription ||
    fallbackSiteDescription;
  const keywords = buildKeywordString({
    title: '404 page not found',
    content: description,
    seedKeywords: ['404', 'page not found', 'site navigation'],
  });

  if (pageLoading || !pageData) {
    return (
      <SEO
        title={pageTitle}
        description={description}
        keywords={keywords}
        url={buildAbsoluteUrl('/404/')}
        noindex
        noarchive
      />
    );
  }

  const primaryMenu = pageData?.headerMenuItems?.nodes ?? [];
  const quickLinks = pageData?.quickFooterMenuItems?.nodes ?? [];
  const aboutLinks = pageData?.aboutFooterMenuItems?.nodes ?? [];
  const navOneMenuItems = pageData?.footerSecondaryMenuItems?.nodes ?? [];
  const navTwoMenuItems = pageData?.footerTertiaryMenuItems?.nodes ?? [];
  const resourcesMenuItems = pageData?.resourcesFooterMenuItems?.nodes ?? [];

  return (
    <>
      <SEO
        title={pageTitle}
        description={description}
        keywords={keywords}
        url={buildAbsoluteUrl('/404/')}
        noindex
        noarchive
      />

      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />

      <Main>
        <section className={styles.page}>
          <div className="container">
            <div className={styles.hero}>
              <div className={styles.panel}>
                <p className={styles.badge}>Page Not Found</p>
                <h1 className={styles.title}>
                  <span className={styles.code}>404</span>
                  We could not find that page.
                </h1>
                <p className={styles.lede}>
                  The link might be outdated, or the page may have moved. Start
                  over with a fresh route below.
                </p>
                <div className={styles.actions}>
                  <Button href="/">Back to home</Button>
                  <Button href="/search" styleType="secondary">
                    Search the site
                  </Button>
                </div>
                <p className={styles.hint}>
                  If you followed a link, let us know and we will fix it.{' '}
                  <Link href="/contact/">Contact us.</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </Main>

      <Footer
        title={siteTitle}
        menuItems={quickLinks}
        navOneMenuItems={navOneMenuItems}
        navTwoMenuItems={navTwoMenuItems}
        resourcesMenuItems={resourcesMenuItems}
        aboutMenuItems={aboutLinks}
      />
    </>
  );
}

Page.variables = () => {
  return {
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
    quickFooterLocation: MENUS.QUICK_FOOTER_LOCATION,
    aboutFooterLocation: MENUS.ABOUT_FOOTER_LOCATION,
    footerSecondaryLocation: MENUS.FOOTER_SECONDARY_LOCATION,
    footerTertiaryLocation: MENUS.FOOTER_TERTIARY_LOCATION,
    resourcesFooterLocation: MENUS.RESOURCES_FOOTER_LOCATION,
  };
};

Page.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  query Get404PageData(
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
    $quickFooterLocation: MenuLocationEnum
    $aboutFooterLocation: MenuLocationEnum
    $footerSecondaryLocation: MenuLocationEnum
    $footerTertiaryLocation: MenuLocationEnum
    $resourcesFooterLocation: MenuLocationEnum
  ) {
    generalSettings {
      ...BlogInfoFragment
    }

    headerMenuItems: menuItems(
      where: { location: $headerLocation }
      first: 100
    ) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }

    footerMenuItems: menuItems(
      where: { location: $footerLocation }
      first: 100
    ) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }

    quickFooterMenuItems: menuItems(
      where: { location: $quickFooterLocation }
      first: 100
    ) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }

    aboutFooterMenuItems: menuItems(
      where: { location: $aboutFooterLocation }
      first: 100
    ) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }

    footerSecondaryMenuItems: menuItems(
      where: { location: $footerSecondaryLocation }
      first: 100
    ) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }

    # Tertiary by LOCATION (preferred)
    footerTertiaryMenuItems: menuItems(
      where: { location: $footerTertiaryLocation }
      first: 100
    ) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }

    resourcesFooterMenuItems: menuItems(
      where: { location: $resourcesFooterLocation }
      first: 100
    ) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
  }
`;
