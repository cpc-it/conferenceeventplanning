import Link from 'next/link';
import { FormatDate, LoadingSearchResult } from 'components';
import { FaSearch } from 'react-icons/fa';

import styles from './SearchResults.module.scss';

/**
 * Renders the search results list.
 *
 * @param {Props} props The props object.
 * @param {object[]} props.searchResults The search results list.
 * @param {boolean} props.isLoading Whether the search results are loading.
 * @returns {React.ReactElement} The SearchResults component.
 */
export default function SearchResults({ searchResults, isLoading }) {
  // If there are no results, or are loading, return null.
  if (!isLoading && searchResults === undefined) {
    return null;
  }

  // If there are no results, return a message.
  if (!isLoading && !searchResults?.length) {
    return (
      <div className={styles['no-results']}>
        <FaSearch className={styles['no-results-icon']} aria-hidden="true" focusable="false" />
        <div className={styles['no-results-text']}>No results</div>
      </div>
    );
  }

  return (
    <>
      {searchResults?.map((node) => (
        <div key={node.databaseId} className={styles.result}>
          {node.uri ? (
            <Link legacyBehavior href={node.uri}>
              <a>
                <h2 className={styles.title}>{node.title || 'Untitled result'}</h2>
              </a>
            </Link>
          ) : (
            <h2 className={styles.title}>{node.title || 'Untitled result'}</h2>
          )}
          {node.date ? (
            <div className={styles.meta}>
              <time className={styles.date} dateTime={node.date}>
                <FormatDate date={node.date} />
              </time>
            </div>
          ) : null}
          {node.excerpt ? (
            <div
              dangerouslySetInnerHTML={{
                __html: node.excerpt,
              }}
            ></div>
          ) : null}
        </div>
      ))}

      {isLoading === true && (
        <>
          <LoadingSearchResult />
          <LoadingSearchResult />
          <LoadingSearchResult />
        </>
      )}
    </>
  );
}
