// pages/search.js
import * as MENUS from 'constants/menus';

import { gql, useQuery } from '@apollo/client';
import { getNextStaticProps } from '@faustwp/core';
import { useRouter } from 'next/router';
import { useDeferredValue, useEffect, useState } from 'react';
import {
  Button,
  Header,
  Main,
  Footer,
  NavigationMenu,
  SearchInput,
  SearchResults,
  SEO,
} from 'components';
import { BlogInfoFragment } from 'fragments/GeneralSettings';
import { GetSearchResults } from 'queries/GetSearchResults';
import styles from 'styles/pages/_Search.module.scss';
import appConfig from 'app.config';
import { buildAbsoluteUrl, buildKeywordString } from 'utilities';

export default function Page() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const nextQuery =
      typeof router.query.q === 'string' ? router.query.q : '';

    setSearchQuery((currentValue) =>
      currentValue === nextQuery ? currentValue : nextQuery
    );
  }, [router.isReady, router.query.q]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const currentQuery =
      typeof router.query.q === 'string' ? router.query.q : '';
    const nextQuery = deferredSearchQuery;

    if (currentQuery === nextQuery) {
      return;
    }

    router.replace(
      {
        pathname: '/search',
        query: nextQuery ? { q: nextQuery } : {},
      },
      undefined,
      { shallow: true }
    );
  }, [deferredSearchQuery, router, router.isReady, router.query.q]);

  const { data: pageData, loading: pageLoading } = useQuery(Page.query, {
    variables: Page.variables(),
  });

  const {
    data: searchResultsData,
    loading: searchResultsLoading,
    error: searchResultsError,
    fetchMore: fetchMoreSearchResults,
  } = useQuery(GetSearchResults, {
    variables: {
      first: appConfig.postsPerPage,
      after: '',
      search: deferredSearchQuery,
    },
    skip: deferredSearchQuery === '',
    fetchPolicy: 'network-only',
  });

  if (pageLoading || !pageData) return null;

  const { title: siteTitle, description: siteDescription } =
    pageData?.generalSettings ?? {};

  const primaryMenu = pageData?.headerMenuItems?.nodes ?? [];
  const quickLinks = pageData?.quickFooterMenuItems?.nodes ?? [];
  const aboutLinks = pageData?.aboutFooterMenuItems?.nodes ?? [];
  const navOneMenuItems = pageData?.footerSecondaryMenuItems?.nodes ?? [];
  const navTwoMenuItems = pageData?.footerTertiaryMenuItems?.nodes ?? [];
  const resourcesMenuItems = pageData?.resourcesFooterMenuItems?.nodes ?? [];

  // 🔎 Filter out anything where the leading slug segment is "testimonial"
  const searchResults =
    searchResultsData?.contentNodes?.edges
      ?.map(({ node }) => node)
      ?.filter((node) => {
        if (!node?.uri) return true;

        // normalize: "/testimonial/a-great-summer-partnership/" → "testimonial"
        const firstSegment = node.uri.split('/').filter(Boolean)[0];
        return firstSegment?.toLowerCase() !== 'testimonial';
      }) ?? [];
  const searchDescription = searchQuery
    ? `Search results for "${searchQuery}" across conference event planning content.`
    : 'Search the site for conference planning services, projects, and resources.';
  const searchKeywords = buildKeywordString({
    title: 'Search',
    content: `${searchDescription} ${searchQuery}`,
    seedKeywords: ['site search', 'conference event planning'],
  });

  return (
    <>
      <SEO
        title={
          searchQuery
            ? `${searchQuery} Search | ${siteTitle}`
            : `Search | ${siteTitle}`
        }
        description={searchDescription || siteDescription}
        keywords={searchKeywords}
        url={buildAbsoluteUrl('/search')}
        noindex
      />

      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />

      <Main>
        <div className={styles['search-header-pane']}>
          <div className="container small">
            <h1 className={styles['search-header-text']}>
              {searchQuery && !searchResultsLoading
                ? `Showing results for "${searchQuery}"`
                : `Search`}
            </h1>
            <SearchInput
              value={searchQuery}
              onChange={(newValue) => setSearchQuery(newValue)}
            />
          </div>
        </div>

        <div className="container small">
          {searchResultsError && (
            <div className="alert-error">
              An error has occurred. Please refresh and try again.
            </div>
          )}

          <SearchResults
            searchResults={searchResults}
            isLoading={searchResultsLoading}
          />

          {searchResultsData?.contentNodes?.pageInfo?.hasNextPage && (
            <div className={styles['load-more']}>
              <Button
                onClick={() => {
                  fetchMoreSearchResults({
                    variables: {
                      after:
                        searchResultsData?.contentNodes?.pageInfo?.endCursor,
                      search: deferredSearchQuery,
                    },
                  });
                }}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
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
  query GetPageData(
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

export function getStaticProps(ctx) {
  return getNextStaticProps(ctx, { Page });
}
