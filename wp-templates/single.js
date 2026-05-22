import * as MENUS from 'constants/menus';

import { gql } from '@apollo/client';
import {
  Header,
  Footer,
  Main,
  EntryHeader,
  NavigationMenu,
  ContentWrapper,
  FeaturedImage,
  SEO,
  TaxonomyTerms,
} from 'components';
import {
  buildAbsoluteUrl,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildKeywordString,
  buildMetaDescription,
  buildWebPageSchema,
  pageTitle,
  resolveSeoImage,
} from 'utilities';
import { BlogInfoFragment } from 'fragments/GeneralSettings';

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }

  const { title: siteTitle, description: siteDescription } =
    props?.data?.generalSettings;
  const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];
  const footerMenu = props?.data?.footerMenuItems?.nodes ?? [];
  const { title, content, featuredImage, date, modified, author, uri } =
    props.data.post;
  const description = buildMetaDescription({
    title,
    content,
    fallback: siteDescription,
  });
  const keywords = buildKeywordString({
    title,
    content,
    seedKeywords: ['blog', 'conference planning', 'event planning'],
  });
  const canonicalUrl = buildAbsoluteUrl(uri || '/');
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const articleSchema = buildArticleSchema({
    headline: title,
    description,
    url: canonicalUrl,
    image: resolveSeoImage(featuredImage?.node?.sourceUrl),
    datePublished: date,
    dateModified: modified,
    authorName: author?.node?.name,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: buildAbsoluteUrl('/') },
    { name: title, url: canonicalUrl },
  ], breadcrumbId);
  const webPageSchema = buildWebPageSchema({
    name: title,
    description,
    url: canonicalUrl,
    type: 'ArticlePage',
    image: resolveSeoImage(featuredImage?.node?.sourceUrl),
    datePublished: date,
    dateModified: modified,
    breadcrumbId,
  });

  return (
    <>
      <SEO
        title={pageTitle(
          props?.data?.generalSettings,
          title,
          props?.data?.generalSettings?.title
        )}
        description={description}
        keywords={keywords}
        imageUrl={featuredImage?.node?.sourceUrl}
        imageAlt={featuredImage?.node?.altText}
        url={canonicalUrl}
        type="article"
        structuredData={[articleSchema, webPageSchema, breadcrumbSchema]}
      />
      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />
      <Main>
        <>
          <EntryHeader
            title={title}
            image={featuredImage?.node}
            date={date}
            author={author?.node?.name}
          />
          <div className="container">
            <ContentWrapper content={content}>
              <TaxonomyTerms post={props.data.post} taxonomy={'categories'} />
              <TaxonomyTerms post={props.data.post} taxonomy={'tags'} />
            </ContentWrapper>
          </div>
        </>
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
    post(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      uri
      content
      date
      modified
      author {
        node {
          name
        }
      }
      tags {
        edges {
          node {
            name
            uri
          }
        }
      }
      categories {
        edges {
          node {
            name
            uri
          }
        }
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
