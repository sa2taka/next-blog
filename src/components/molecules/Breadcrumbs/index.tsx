import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@linaria/react';
import Link from 'next/link';
import React from 'react';
import { BreadcrumbsList } from '../../../libs/breadcrumbsGenerator';
import { css } from '@linaria/core';

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

const BreadcrumbsLink = styled.a`
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

export const Breadcrumbs: React.FC<Props> = ({ list }) => {
  return (
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
              <Link href={item.href}>
                <BreadcrumbsLink className={item.disabled ? disabledStyle : ''}>
                  {item.text}
                </BreadcrumbsLink>
              </Link>
            </BreadcrumbsItem>
          );
        })}
      </BreadcrumbsUl>
    </BreadcrumbsNav>
  );
};
