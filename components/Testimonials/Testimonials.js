import { gql } from '@apollo/client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import className from 'classnames/bind';
import { Carousel } from 'react-responsive-carousel';

import TestimonialItem from '../TestimonialItem';

import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styles from './Testimonials.module.scss';
const cx = className.bind(styles);

const PREVIEW_LEN = 125;
const MOBILE_MAX = 640;

const windows = (arr, size) => {
  if (!arr?.length) return [];
  if (arr.length <= size) return [arr];
  return Array.from({ length: arr.length - size + 1 }, (_, i) => arr.slice(i, i + size));
};

const htmlToText = (html) => (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const tKey = (t, fallback) =>
  t?.databaseId?.toString?.() || t?.id || `${t?.testimonialFields?.testimonialAuthor || 'anon'}-${fallback}`;

export default function Testimonials({ testimonials = [] }) {
  const router = useRouter();
  const isHome = router.pathname === '/';
  const singlePerSlide = !isHome; // off-home: show 1 at a time (but keep ALL items)

  // responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Build slides without trimming the dataset
  const slides = useMemo(
    () => windows(testimonials, singlePerSlide ? 1 : (isMobile ? 1 : 3)),
    [testimonials, singlePerSlide, isMobile]
  );

  // Show arrows if there is more than one slide to navigate
  const showNav = slides.length > 1;

  const [expanded, setExpanded] = useState({});
  const toggle = (key) => setExpanded((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className={cx('container')}>
      <Carousel
        showIndicators={false}
        showThumbs={false}
        showStatus={false}
        showArrows={showNav}
        infiniteLoop={showNav}
        renderArrowPrev={
          showNav
            ? (click, hasPrev) => (
                <button
                  type="button"
                  className={cx('arrow')}
                  onClick={click}
                  aria-label="Previous testimonials"
                  disabled={!hasPrev}
                >
                  <FaChevronLeft aria-hidden="true" focusable="false" />
                </button>
              )
            : undefined
        }
        renderArrowNext={
          showNav
            ? (click, hasNext) => (
                <button
                  type="button"
                  className={cx('arrow')}
                  onClick={click}
                  aria-label="Next testimonials"
                  disabled={!hasNext}
                >
                  <FaChevronRight aria-hidden="true" focusable="false" />
                </button>
              )
            : undefined
        }
      >
        {slides.map((group, slideIdx) => (
          <div key={`slide-${slideIdx}`} className={cx('slideGroup', { mobile: isMobile || singlePerSlide })}>
            {group.map((t, idx) => {
              const key = tKey(t, `s${slideIdx}-i${idx}`);
              const fullHtml = t?.testimonialFields?.testimonialContent || '';
              const preview = htmlToText(fullHtml);
              const needsToggle = !singlePerSlide && preview.length > PREVIEW_LEN; // disable Read more off-home
              const isOpen = !!expanded[key];

              const img = t?.featuredImage?.node;
              const title = t?.title || t?.testimonialFields?.testimonialAuthor || '';

              return (
                <div key={key} className={cx('card')}>
                  <TestimonialItem
                    author={t?.testimonialFields?.testimonialAuthor}
                    job={t?.testimonialFields?.testimonialJob}
                  >
                    {/* Image */}
                    {img?.sourceUrl && (
                      <div className={cx('imageWrap')}>
                        <Image
                          src={img.sourceUrl}
                          alt={img?.altText || title || 'Testimonial image'}
                          width={(img?.mediaDetails && img.mediaDetails.width) || 800}
                          height={(img?.mediaDetails && img.mediaDetails.height) || 600}
                          className={cx('image')}
                          unoptimized
                        />
                      </div>
                    )}

                    {/* Title */}
                    {title && <h3 className={cx('title')}>{title}</h3>}

                    <Image
                      src="/five-stars.png"
                      alt="Five Stars"
                      width={102}
                      height={16}
                      className={cx('stars')}
                    />

                    {/* Content */}
                    {singlePerSlide ? (
                      // Off-home: always show full content, no buttons
                      <div
                        id={`t-body-${key}`}
                        className={cx('slideContent container')}
                        dangerouslySetInnerHTML={{ __html: fullHtml }}
                      />
                    ) : !isOpen ? (
                      <>
                        <p className={cx('slideContent')}>
                          {needsToggle ? `${preview.slice(0, PREVIEW_LEN)}…` : preview}
                        </p>
                        {needsToggle && (
                          <button
                            type="button"
                            className={cx('readMore')}
                            onClick={() => toggle(key)}
                            aria-expanded="false"
                            aria-controls={`t-body-${key}`}
                          >
                            Read more
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div
                          id={`t-body-${key}`}
                          className={cx('slideContent')}
                          dangerouslySetInnerHTML={{ __html: fullHtml }}
                        />
                        <button
                          type="button"
                          className={cx('readLess')}
                          onClick={() => toggle(key)}
                          aria-expanded="true"
                          aria-controls={`t-body-${key}`}
                        >
                          Show less
                        </button>
                      </>
                    )}
                  </TestimonialItem>
                </div>
              );
            })}
          </div>
        ))}
      </Carousel>
    </div>
  );
}

Testimonials.fragments = {
  entry: gql`
    fragment TestimonialsFragment on Testimonial {
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
  `,
};
