import { gql } from '@apollo/client';
import Link from 'next/link';
import { forwardRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const INTERNAL_HOSTNAMES = new Set([
  'calpolyconferences.org',
  'www.calpolyconferences.org',
]);

function normalizeMenuPath(path = '') {
  if (!path) {
    return '';
  }

  if (!/^https?:\/\//i.test(path)) {
    return path;
  }

  try {
    const parsedUrl = new URL(path);

    if (!INTERNAL_HOSTNAMES.has(parsedUrl.hostname.toLowerCase())) {
      return path;
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}` || '/';
  } catch {
    return path;
  }
}

const NavigationMenu = forwardRef(function NavigationMenu(
  {
    menuItems,
    className,
    children,
    id,
    isMobile = false,
    onNavigate,
    mobileHeader,
  },
  ref
) {
  const [openItems, setOpenItems] = useState({});

  if (!menuItems) {
    return null;
  }

  const buildMenuTree = (items) => {
    const map = {};
    const roots = [];

    items.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    items.forEach((item) => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  const toggleItem = (itemId) => {
    setOpenItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  };

  const renderMenuItems = (items, depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children?.length > 0;
      const isOpen = !!openItems[item.id];
      const submenuId = `submenu-${item.id}`;
      const useMobileToggle = isMobile && hasChildren;
      const normalizedPath = normalizeMenuPath(item.path);

      return (
        <li
          key={item.id ?? ''}
          className={[
            'menu-item',
            hasChildren ? 'hasChildren' : '',
            isOpen ? 'submenuOpen' : '',
            depth > 0 ? 'isNested' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="menuLinkWrap">
            {useMobileToggle ? (
              <button
                type="button"
                className="menuLink menuToggleLink"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={submenuId}
              >
                {item.label ?? ''}
              </button>
            ) : (
              <Link legacyBehavior href={normalizedPath} passHref>
                <a className="menuLink" onClick={() => onNavigate?.()}>
                  {item.label ?? ''}
                </a>
              </Link>
            )}
            {useMobileToggle ? (
              <button
                type="button"
                className="submenuToggle"
                aria-expanded={isOpen}
                aria-controls={submenuId}
                aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${
                  item.label ?? 'submenu'
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <FaChevronDown aria-hidden="true" focusable="false" />
              </button>
            ) : null}
          </div>
          {hasChildren ? (
            <ul
              id={submenuId}
              className="subMenu"
              hidden={isMobile ? !isOpen : undefined}
            >
              {renderMenuItems(item.children, depth + 1)}
            </ul>
          ) : null}
        </li>
      );
    });
  };

  const menuTree = buildMenuTree(menuItems);

  return (
    <nav
      id={id}
      ref={ref}
      className={className}
      role="navigation"
      aria-label={`${menuItems[0]?.menu?.node?.name ?? 'Main'} menu`}
    >
      {isMobile && mobileHeader ? mobileHeader : null}
      <ul className="menu">
        {renderMenuItems(menuTree)}
        {children}
      </ul>
    </nav>
  );
});

export default NavigationMenu;

NavigationMenu.fragments = {
  entry: gql`
    fragment NavigationMenuItemFragment on MenuItem {
      id
      path
      label
      parentId
      cssClasses
      menu {
        node {
          name
        }
      }
    }
  `,
};
