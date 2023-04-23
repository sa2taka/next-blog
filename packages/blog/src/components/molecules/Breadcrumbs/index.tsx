import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@linaria/react';
import Link from 'next/link';
import React from 'react';
import { BreadcrumbsList } from '../../../libs/breadcrumbsGenerator';
import { css } from '@linaria/core';
import { BASE_URL } from '@blog/libs/const';
import Head from 'next/head';

interface Props {
  list: BreadcrumbsList;
}

const BreadcrumbsNav = styled.nav`
  width: 100%;

  @media screen and (max-width: 768px) {
    & {
      display: none;
    }
  }
`;

const BreadcrumbsUl = styled.ul`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  flex: 0 1 auto;
  list-style-type: none;
  margin: 0;
  padding: 18px 12px;
  column-gap: 4px;
`;

const BreadcrumbsItem = styled.li`
  display: inline-flex;
  font-size: 14px;
  height: 20px;
  align-items: center;
`;

const breadcrumbsLink = css`
  text-decoration: none;
  cursor: pointer;

  .theme--dark & {
    color: #ccc;
  }

  .theme--light & {
    color: #444;
  }
`;

const arrowMargin = css`
  margin: 0 12px 4px;
`;

const disabledStyle = css`
  pointer-events: none;
`;

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
      <BreadcrumbsNav>
        <BreadcrumbsUl>
          {list.map((item, index) => {
            return (
              <BreadcrumbsItem key={item.href}>
                {index !== 0 && (
                  <FontAwesomeIcon
                    icon={faChevronCircleRight}
                    className={arrowMargin}
                    style={{ marginTop: '1px' }}
                    height={16}
                  />
                )}
                <Link href={item.href} className={breadcrumbsLink}>
                  {item.text}
                </Link>
              </BreadcrumbsItem>
            );
          })}
        </BreadcrumbsUl>
      </BreadcrumbsNav>
    </>
  );
};
