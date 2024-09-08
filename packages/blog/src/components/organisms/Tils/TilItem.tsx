import { MarkdownBody } from '@blog/components/molecules/MarkdownBody';
import { TilWithRawHtml } from '@blog/types/entry';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { formatDate, formatDateForMachine } from '../../../libs/formatDate';
import styles from './TilItem.module.css';

interface Props {
  til: TilWithRawHtml;
}

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
    <li className={styles.tilLi}>
      <div className={styles.tilCategoryArea}>
        <time className={styles.createdAt} dateTime={formattedDateForDateTag}>
          {formattedDate}
        </time>

        <span>{til.category}</span>
      </div>

      <h2>
        <Link href={tilHref} className={styles.titleLink}>
          {til.title}
        </Link>
      </h2>

      <MarkdownBody rawHtml={til.rawHtml} />
    </li>
  );
};
