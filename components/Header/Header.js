import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

import { NavigationMenu, SkipNavigationLink } from '../';

import styles from './Header.module.scss';
let cx = classNames.bind(styles);

export default function Header({ className, menuItems, title }) {
  const [isNavShown, setIsNavShown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const siteTitle = title || 'Conference and Event Planning';

  // Classes with scroll-aware styles
  const headerClasses = cx('header', className, { scrolled: isScrolled });
  const logoWrapClasses = cx('logo-wrap', { scrolled: isScrolled });
  const headerContentClasses = cx('container', 'header-content', {
    scrolled: isScrolled,
  });

  const navClasses = cx(
    'primary-navigation',
    isNavShown ? cx('show') : undefined
  );

  const closeNavigation = () => setIsNavShown(false);
  const toggleNavigation = () => setIsNavShown((current) => !current);

  useEffect(() => {
    const handleScroll = () => {
      const nextIsScrolled = window.scrollY > 0;
      setIsScrolled((currentValue) =>
        currentValue === nextIsScrolled ? currentValue : nextIsScrolled
      );
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = (event) => {
      const matches =
        typeof event?.matches === 'boolean'
          ? event.matches
          : mediaQuery.matches;
      setIsMobileView(matches);

      if (!matches) {
        setIsNavShown(false);
      }
    };

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobileView) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = isNavShown ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileView, isNavShown]);

  useEffect(() => {
    if (!isNavShown) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeNavigation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNavShown]);

  return (
    <header className={headerClasses}>
      <div className={logoWrapClasses}>
        <div className="container">
          <div className={cx('logo')}>
            <Link legacyBehavior href="/" passHref>
              <a title={`${siteTitle} Home`}>
                <Image
                  src="/logo.png"
                  width={400}
                  height={80}
                  alt={`${siteTitle} logo`}
                  layout="responsive"
                />
              </a>
            </Link>
          </div>
        </div>
      </div>

      <SkipNavigationLink />

      <div className={headerContentClasses}>
        <div className={cx('bar')}>
          <Link legacyBehavior href="/" passHref>
            <a className={cx('titleName')}>{siteTitle}</a>
          </Link>

          <button
            type="button"
            className={cx('nav-toggle')}
            onClick={toggleNavigation}
            aria-label={isNavShown ? 'Close navigation' : 'Open navigation'}
            aria-controls="primary-navigation"
            aria-expanded={isNavShown}
          >
            {isNavShown ? <FaTimes aria-hidden="true" focusable="false" /> : <FaBars aria-hidden="true" focusable="false" />}
          </button>

          <NavigationMenu
            id="primary-navigation"
            className={navClasses}
            menuItems={menuItems}
            isMobile={isMobileView}
            onNavigate={closeNavigation}
          >
            <li className="menu-item menu-item-search">
              <Link legacyBehavior href="/search" passHref>
                <a className="menuLink" aria-label="Search" onClick={closeNavigation}>
                  <FaSearch aria-hidden="true" focusable="false" />
                </a>
              </Link>
            </li>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}
