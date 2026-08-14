// Footer.js
import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, gql } from '@apollo/client';

// ⬇ Import directly to avoid circular deps with the barrel
import GetStarted from '../GetStarted';
import Testimonials from '../Testimonials';
import { NavigationMenu } from '../';

import styles from './Footer.module.scss';
const cx = classNames.bind(styles);

// ⬇ Inline a fragment so we don't depend on Testimonials.fragments
const FOOTER_TESTIMONIALS_FRAGMENT = gql`
  fragment FooterTestimonialsFragment on Testimonial {
    databaseId
    title
    featuredImage {
      node {
        sourceUrl
        altText
        mediaDetails { width height }
      }
    }
    testimonialFields {
      testimonialContent
      testimonialJob
      testimonialAuthor
    }
  }
`;

const FOOTER_TESTIMONIALS_QUERY = gql`
  ${FOOTER_TESTIMONIALS_FRAGMENT}
  query FooterTestimonials {
    testimonials {
      nodes {
        ...FooterTestimonialsFragment
      }
    }
  }
`;

export default function Footer({
  siteTitle,
  title,
  menuItems,
  navOneMenuItems,
  navTwoMenuItems,
  resourcesMenuItems,
  aboutMenuItems,
}) {
  const router = useRouter();
  const isHome = router.pathname === '/';

  // Only fetch when NOT on homepage
  const { data: tdata } = useQuery(FOOTER_TESTIMONIALS_QUERY, { skip: isHome });
  const tnodes = tdata?.testimonials?.nodes ?? [];

  return (
    <>
      {!isHome && tnodes.length > 0 && (
         <div className="container">
          <Testimonials testimonials={tnodes} />
        </div>
      )}

      <GetStarted />
      <footer className={cx('footer')}>
        <div className={cx('container', styles.footerWrap)}>
          <div className={cx('footer-nav-contact-info')}>


          <div className={cx('about')}>
            <h3>About</h3>
            <NavigationMenu className={cx('quick')} menuItems={aboutMenuItems} />
          </div>

          <div className={cx('resources')}>
            <h3>Resources</h3>
            <NavigationMenu className={cx('quick')} menuItems={resourcesMenuItems} />
          </div>
            
            <div className={cx('footer-nav')}>
              <h3>Quick Links</h3>
              <NavigationMenu className={cx('quick')} menuItems={menuItems} />
            </div>

            <div className={cx('contact-info')}>
              <Link href="/" legacyBehavior>
                <a className={cx('cppText')}>{title ?? 'Cal Poly Partners'}</a>
              </Link>
              <a href="tel:8057567600" className={cx('phone')}>(805) 756-7600</a>
              <a href="mailto:cep@calpoly.edu" className={cx('phone')}>cep@calpoly.edu</a>
            </div>
          </div>

          <div className={cx('logo-address')}>
            <div className={cx('logo')}>
              <Link legacyBehavior href="/">
                <a title="Home">
                  <Image
                    src="/logo.png"
                    width={400}
                    height={80}
                    alt="Cal Poly University logo"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </a>
              </Link>
            </div>

            <p>1 Grand Avenue, San Luis Obispo, CA 93407</p>
            <a href="tel:8057561111" className={cx('phone')}>(805) 756-1111</a>
          </div>

          <div className={cx('nav-one')}>
            <NavigationMenu className={cx('nav')} menuItems={navOneMenuItems} />
          </div>

          <div className={cx('nav-two')}>
            <NavigationMenu className={cx('nav')} menuItems={navTwoMenuItems} />
          </div>

          <div className={cx('copyright')}>
            &copy; {new Date().getFullYear()} {siteTitle ?? 'Cal Poly Partners'}
          </div>
        </div>
      </footer>
    </>
  );
}
