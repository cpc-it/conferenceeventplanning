import * as MENUS from 'constants/menus';

import { gql, useQuery } from '@apollo/client';
import React from 'react';
import {
  FeaturedImage,
  Footer,
  Header,
  EntryHeader,
  LoadMore,
  Main,
  Projects,
  SEO,
  NavigationMenu,
} from 'components';
import { getNextStaticProps } from '@faustwp/core';
import {
  buildAbsoluteUrl,
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildKeywordString,
  buildWebPageSchema,
  pageTitle,
} from 'utilities';
import { BlogInfoFragment } from 'fragments/GeneralSettings';
import appConfig from 'app.config';

export default function Page() {
  const { data, loading, fetchMore } = useQuery(Page.query, {
    variables: Page.variables(),
  });

  if (loading) {
    return <></>;
  }

  const { title: siteTitle } = data?.generalSettings;
  const primaryMenu = data?.headerMenuItems?.nodes ?? [];
  const footerMenu = data?.footerMenuItems?.nodes ?? [];
  const projectList = data?.projects?.nodes ?? [];
  const description =
    'Browse conference and event planning projects, activations, and guest experience work.';
  const keywords = buildKeywordString({
    title: 'Projects',
    content: description,
    seedKeywords: [
      'event planning projects',
      'conference projects',
      'event portfolio',
    ],
  });
  const canonicalUrl = buildAbsoluteUrl('/projects/');
  const collectionSchema = buildCollectionPageSchema({
    name: 'Projects',
    description,
    url: canonicalUrl,
  });
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: buildAbsoluteUrl('/') },
    { name: 'Projects', url: canonicalUrl },
  ], breadcrumbId);
  const webPageSchema = buildWebPageSchema({
    name: 'Projects',
    description,
    url: canonicalUrl,
    type: 'CollectionPage',
    breadcrumbId,
  });
  return (
    <>
      <SEO
        title={pageTitle(data?.generalSettings, 'Projects')}
        description={description}
        keywords={keywords}
        url={canonicalUrl}
        structuredData={[collectionSchema, webPageSchema, breadcrumbSchema]}
      />

      <Header menuItems={primaryMenu} />

      <Main>
        <EntryHeader title="Projects" />
        <div className="container">
          <Projects projects={projectList} id="project-list" />
          <LoadMore
            className="text-center"
            hasNextPage={data.projects.pageInfo.hasNextPage}
            endCursor={data.projects.pageInfo.endCursor}
            isLoading={loading}
            fetchMore={fetchMore}
          />
        </div>
      </Main>

      <Footer
        title={siteTitle}
        menuItems={footerMenu}
        navOneMenuItems={data?.footerSecondaryMenuItems?.nodes ?? []}
        quickLinksMenuItems={data?.footerTertiaryMenuItems?.nodes ?? []}
      />
    </>
  );
}

Page.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  ${Projects.fragments.entry}
  query GetProjectsPage(
    $first: Int!
    $after: String!
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
  ) {
    projects(first: $first, after: $after) {
      nodes {
        ...ProjectsFragment
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
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
    footerMenuItems: menuItems(where: { location: $footerLocation }) {
      nodes {
        ...NavigationMenuItemFragment
      }
    }
  }
`;

Page.variables = () => {
  return {
    first: appConfig.projectsPerPage,
    after: '',
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
  };
};

export async function getStaticProps(context) {
  return getNextStaticProps(context, {
    Page,
  });
}
