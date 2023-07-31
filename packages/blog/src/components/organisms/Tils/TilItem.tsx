import { MarkdownBody } from '@blog/components/molecules/MarkdownBody';
import { TilWithRawHtml } from '@blog/types/entry';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { formatDate, formatDateForMachine } from '../../../libs/formatDate';

interface Props {
  til: TilWithRawHtml;
}

const TilLi = styled.li`
  list-style: none;
  display: flex;
  flex-flow: column;
`;

const TilCategoryArea = styled.span`
  display: flex;
  align-items: center;
  column-gap: 0.6rem;
`

const titleLink = css`
  font-size: 1.1em;
  font-weight: 600;
  word-break: break-all;
  margin: 8px 0;
  text-decoration: none;
  line-height: 1.4em;

  .theme--dark & {
    color: #ddd;
  }

  .theme--light & {
    color: rgba(0, 0, 0, 0.87);
  }

  /* animation */
  position: relative;
  cursor: pointer;

  &::before {
    position: absolute;
    bottom: 0;
    left: 0;
    content: '';
    width: 0;
    height: 1px;
    background-color: #009688;
    transition: 0.3s;
  }

  &:hover::before {
    width: 80px;
  }
`;

const CreatedAt = styled.time`
  font-size: 0.9em;

  .theme--dark & {
    color: #aaa;
  }

  .theme--light & {
    color: #444;
  }
`;

export const TilItem: React.FC<Props> = ({ til }) => {
  const tilHref = useMemo(() => `/til/${til.slug}`, [til]);

  const formattedDate = useMemo(() => {
    const target = new Date(til.createdAt);
    return formatDate(target);
  }, [til.createdAt]);
  const formattedDateForDateTag = useMemo(() => {
    const target = new Date(til.createdAt);
    return formatDateForMachine(target);
  }, [til]);

  return (
    <TilLi>
      <TilCategoryArea>
        <CreatedAt dateTime={formattedDateForDateTag}>
          {formattedDate}
        </CreatedAt>

        <span>
          {til.category}
        </span>
      </TilCategoryArea>

      <h2>
        <Link href={tilHref} className={titleLink}>
          {til.title}
        </Link>
      </h2>
      
      <MarkdownBody rawHtml={til.rawHtml} />
    </TilLi>
  );
};
