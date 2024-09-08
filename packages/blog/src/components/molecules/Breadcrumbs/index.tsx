import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import React from 'react';
import { BreadcrumbsList } from '../../../libs/breadcrumbsGenerator';
import { BASE_URL } from '@blog/libs/const';
import Head from 'next/head';
import styles from './index.module.css';

interface Props {
  list: BreadcrumbsList;
}

const getSeoStructureData = (list: BreadcrumbsList) => {
  const items = list.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@id': item.href,
      '@type': 'ListItem',
      name: item.text,
      item: `${BASE_URL}${item.href}`,
    },
  }));
  return {
    '@context': 'http://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
};

export const Breadcrumbs: React.FC<Props> = ({ list }) => {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSeoStructureData(list)),
          }}
        />
      </Head>
      <nav className={styles.breadcrumbsNav}>
        <ul className={styles.breadcrumbsUl}>
          {list.map((item, index) => {
            return (
              <li key={item.href} className={styles.breadcrumbsItem}>
                <span className={styles.breadCrumbsSeparator}>
                  {index !== 0 && (
                    <FontAwesomeIcon
                      icon={faChevronCircleRight}
                      className={styles.arrowMargin}
                      style={{ marginTop: '1px' }}
                      height={16}
                    />
                  )}
                </span>
                <Link href={item.href} className={styles.breadcrumbsLink}>
                  {item.text}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
