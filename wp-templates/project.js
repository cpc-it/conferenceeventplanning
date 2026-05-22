import * as MENUS from 'constants/menus';

import { gql } from '@apollo/client';
import {
  Header,
  EntryHeader,
  Footer,
  ProjectHeader,
  ContentWrapper,
  NavigationMenu,
  FeaturedImage,
  Main,
  SEO,
} from 'components';
import { BlogInfoFragment } from 'fragments/GeneralSettings';
import {
  buildAbsoluteUrl,
  buildBreadcrumbSchema,
  buildKeywordString,
  buildMetaDescription,
  buildWebPageSchema,
} from 'utilities';

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }
  const { title: siteTitle } = props?.data?.generalSettings;
  const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];
  const footerMenu = props?.data?.footerMenuItems?.nodes ?? [];
  const { featuredImage } = props.data.project;
  const { title, summary, contentArea } = props.data.project.projectFields;
  const description = buildMetaDescription({
    title,
    content: `${summary ?? ''} ${contentArea ?? ''}`,
    fallback: `Explore the ${title} project from ${siteTitle}.`,
  });
  const keywords = buildKeywordString({
    title,
    content: `${summary ?? ''} ${contentArea ?? ''}`,
    seedKeywords: ['project', 'conference planning', 'event planning'],
  });
  const canonicalUrl = buildAbsoluteUrl(props?.data?.project?.uri || '/projects/');
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: buildAbsoluteUrl('/') },
    { name: 'Projects', url: buildAbsoluteUrl('/projects') },
    { name: title, url: canonicalUrl },
  ], breadcrumbId);
  const webPageSchema = buildWebPageSchema({
    name: title,
    description,
    url: canonicalUrl,
    type: 'ItemPage',
    breadcrumbId,
  });
  return (
    <>
      <SEO
        title={`${title} - ${props?.data?.generalSettings?.title}`}
        description={description}
        keywords={keywords}
        imageUrl={featuredImage?.node?.sourceUrl}
        imageAlt={featuredImage?.node?.altText}
        url={canonicalUrl}
        structuredData={[webPageSchema, breadcrumbSchema]}
      />

      <Header menuItems={primaryMenu} />

      <Main>
        <EntryHeader title={title} />
        <ProjectHeader
          image={featuredImage?.node}
          summary={summary}
          title={title}
        />
        <div className="container">
          <ContentWrapper content={contentArea} />
        </div>
      </Main>

      <Footer title={siteTitle} menuItems={footerMenu} />
    </>
  );
}

Component.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  query GetPost(
    $databaseId: ID!
    $headerLocation: MenuLocationEnum
    $footerLocation: MenuLocationEnum
    $asPreview: Boolean = false
  ) {
    project(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      uri
      projectFields {
        title: projectTitle
        summary
        contentArea
      }
      ...FeaturedImageFragment
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

Component.variables = ({ databaseId }, ctx) => {
  return {
    databaseId,
    headerLocation: MENUS.PRIMARY_LOCATION,
    footerLocation: MENUS.FOOTER_LOCATION,
    asPreview: ctx?.asPreview,
  };
};
