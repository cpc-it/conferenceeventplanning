import { gql } from '@apollo/client';
import Image from 'next/image';

import styles from './FeaturedImage.module.scss';

export default function FeaturedImage({
  className = '',
  image,
  width,
  height,
  isHero = false,
  ...props
}) {
  const src =
    typeof image?.sourceUrl === 'function' ? image.sourceUrl() : image?.sourceUrl;
  const alt = image?.altText || '';

  const w = Number(width ?? image?.mediaDetails?.width);
  const h = Number(height ?? image?.mediaDetails?.height);
  const blurDataURL = image?.blurDataURL;
  const shouldPrioritize = Boolean(isHero || props?.priority);

  if (!src || !w || !h) return null;

  return (
    <figure className={[styles['featured-image'], className].filter(Boolean).join(' ')}>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        quality={80}
        priority={shouldPrioritize}
        fetchPriority={shouldPrioritize ? 'high' : undefined}
        loading={shouldPrioritize ? 'eager' : 'lazy'}
        placeholder={blurDataURL ? 'blur' : undefined}
        blurDataURL={blurDataURL}
        sizes="100vw"
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        {...props}
      />
    </figure>
  );
}

FeaturedImage.fragments = {
  entry: gql`
    fragment FeaturedImageFragment on NodeWithFeaturedImage {
      featuredImage {
        node {
          id
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
    }
  `,
};
