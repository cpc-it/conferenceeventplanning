import className from 'classnames/bind';
import { FeaturedImage, Heading, PostInfo } from 'components';
import { useRouter } from 'next/router';

import styles from './EntryHeader.module.scss';

const cx = className.bind(styles);

export default function EntryHeader({ title, image, date, author, className }) {
  const hasText = title || date || author;
  const { pathname } = useRouter();
  const isHome = pathname === '/';

  return (
    <div className={cx(['entry-header', className])}>
      {image && (
        <div className={cx('image')}>
          {hasText && (
            <div className={cx('text')}>
              {!!title && <Heading className={cx('title', 'container')}>{title}</Heading>}
              <PostInfo className={cx('byline')} author={author} date={date} />
            </div>
          )}

          {isHome && (
            <Heading className={cx('heading-home')} level="h1">
              Let&#8217;s Create Magic Together
            </Heading>
          )}

          <FeaturedImage
            className={cx('featured-image')}
            image={image}
            isHero
            sizes="100vw"
            quality={72}
          />
        </div>
      )}
    </div>
  );
}
