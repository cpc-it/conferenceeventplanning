import * as MENUS from 'constants/menus';

import { gql } from '@apollo/client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BlogInfoFragment } from 'fragments/GeneralSettings';
import {
  buildAbsoluteUrl,
  buildBreadcrumbItemsFromPath,
  buildBreadcrumbSchema,
  buildKeywordString,
  buildMetaDescription,
  buildWebPageSchema,
  pageTitle,
} from 'utilities';

import {
  Header,
  Footer,
  Main,
  ContentWrapper,
  EntryHeader,
  NavigationMenu,
  FeaturedImage,
  SEO,
} from '../components';

// Client-only form to avoid SSR/client mismatch
const ContactForm = dynamic(() => import('components/ContactForm'), {
  ssr: false,
});

const TOKEN = '<!-- FORMSPREE_CONTACT -->';
const SLOT_HTML = '<div id="contact-form-slot"></div>';

// Portals the ContactForm into the placeholder div after mount.
function ContactFormIntoSlot() {
  const [slot, setSlot] = useState(null);
  useEffect(() => {
    setSlot(document.getElementById('contact-form-slot'));
  }, []);
  if (!slot) return null;
  return createPortal(<ContactForm />, slot);
}

export default function Component(props) {
  // Loading state for previews
  if (props.loading) {
    return <>Loading...</>;
  }

  const { title: siteTitle, description: siteDescription } =
    props?.data?.generalSettings;
  const primaryMenu = props?.data?.headerMenuItems?.nodes ?? [];

  const quickLinks = props?.data?.quickFooterMenuItems?.nodes ?? [];
  const aboutLinks = props?.data?.aboutFooterMenuItems?.nodes ?? [];
  const navOne = props?.data?.footerSecondaryMenuItems?.nodes ?? [];
  const navTwo = props?.data?.footerTertiaryMenuItems?.nodes ?? [];
  const resources = props?.data?.resourcesFooterMenuItems?.nodes ?? [];

  const { title, content, featuredImage, uri } = props?.data?.page ?? {
    title: '',
  };
  const description = buildMetaDescription({
    title,
    content,
    fallback: siteDescription,
  });
  const keywords = buildKeywordString({
    title,
    content,
    seedKeywords: ['conference planning', 'event planning'],
  });
  const canonicalUrl = buildAbsoluteUrl(uri || '/');
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const breadcrumbSchema = buildBreadcrumbSchema(
    buildBreadcrumbItemsFromPath(uri || '/', title),
    breadcrumbId
  );
  const webPageSchema = buildWebPageSchema({
    name: title,
    description,
    url: canonicalUrl,
    breadcrumbId,
  });

  // Replace the marker with a stable placeholder DIV for SSR
  const htmlWithSlot = (content ?? '').split(TOKEN).join(SLOT_HTML);

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
        structuredData={[webPageSchema, breadcrumbSchema]}
      />
      <Header
        title={siteTitle}
        description={siteDescription}
        menuItems={primaryMenu}
      />
      <Main>
        <>
          <EntryHeader title={title} image={featuredImage?.node} />
          <div className="container">
            {/* Server and client markup match here */}
            <ContentWrapper content={htmlWithSlot} />
            {/* After hydration, portal the interactive form into the slot */}
            <ContactFormIntoSlot />
          </div>
        </>
      </Main>
      <Footer
        title={siteTitle}
        menuItems={quickLinks} // left column: Quick Footer
        navOneMenuItems={navOne} // middle: Footer Secondary
        navTwoMenuItems={navTwo} // right: Footer Tertiary
        resourcesMenuItems={resources} // new Resources block
        aboutMenuItems={aboutLinks}
      />
    </>
  );
}

Component.variables = ({ databaseId }, ctx) => {
  return {
    databaseId,
    headerLocation: MENUS.PRIMARY_LOCATION,
    // was FOOTER_LOCATION — stop using it
    footerLocation: MENUS.FOOTER_LOCATION,
    quickFooterLocation: MENUS.QUICK_FOOTER_LOCATION,
    aboutFooterLocation: MENUS.ABOUT_FOOTER_LOCATION,
    footerSecondaryLocation: MENUS.FOOTER_SECONDARY_LOCATION,
    footerTertiaryLocation: MENUS.FOOTER_TERTIARY_LOCATION,
    resourcesFooterLocation: MENUS.RESOURCES_FOOTER_LOCATION,
    asPreview: ctx?.asPreview,
  };
};

Component.query = gql`
  ${BlogInfoFragment}
  ${NavigationMenu.fragments.entry}
  ${FeaturedImage.fragments.entry}
  query GetPageData(
    $databaseId: ID!
    $headerLocation: MenuLocationEnum
    $quickFooterLocation: MenuLocationEnum
    $aboutFooterLocation: MenuLocationEnum
    $footerSecondaryLocation: MenuLocationEnum
    $footerTertiaryLocation: MenuLocationEnum
    $resourcesFooterLocation: MenuLocationEnum
    $asPreview: Boolean = false
  ) {
    page(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      uri
      content
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
