import { formatPostIndex } from '@blog/components/organisms/PostArea/formatPostIndex';
import { styled } from '@linaria/react';
import React, { useMemo } from 'react';
import { PostIndexItem } from '../../../types/postIndex';

interface Props {
  index: PostIndexItem[];
}

const PostIndexTitle = styled.span`
  display: flex;
  align-items: center;
  position: relative;
  top: -0.65em;
  left: 10%;
  width: 10%;
  text-align: center;
  z-index: 1;
  justify-content: center;

  .theme--dark & {
    background: #121212;
  }

  .theme--light & {
    background: #fff;
  }
`;

const PostIndexNav = styled.nav`
  margin-top: 40px;
  padding-bottom: 24px;

  position: relative;

  &::before,
  &::after {
    width: 100%;
    border-top: 1px solid;
    content: '';
    position: absolute;
  }
`;

const PostIndexOl = styled.ol`
  margin-top: 16px;
  margin-bottom: 16px;
  list-style-type: none !important;
  counter-reset: number;
  position: relative;
`;

const IndexLink = styled.a`
  text-decoration: none;

  .theme--dark & {
    color: white;
  }

  .theme--light & {
    color: black;
  }
`;

const FirstIndex = styled.li`
  position: relative;
  margin-top: 1rem;
  margin-bottom: 0.5rem;

  &::before {
    counter-increment: number;
    content: counter(number);
    color: var(--primary-color);
    font-weight: 600;
  }

  &::after {
    position: absolute;
    content: '' !important;
    top: 0px;
    right: auto;
    left: 18px;
    bottom: auto;
    height: 1.5em;
    width: 2px;
    border-radius: 1px;
    background-color: var(--primary-color);
  }

  & > ${IndexLink} {
    margin-left: 18px;
  }
`;

export const PostIndex: React.FC<Props> = ({ index }) => {
  const formattedPostIndex = useMemo(() => formatPostIndex(index), [index]);
  return (
    <PostIndexNav>
      <PostIndexTitle>目次</PostIndexTitle>
      <PostIndexOl>
        {formattedPostIndex.map((level1) => (
          <FirstIndex key={`${level1.level}-${level1.title}`}>
            <IndexLink href={`#${level1.title}`}>{level1.title}</IndexLink>
          </FirstIndex>
        ))}
      </PostIndexOl>
    </PostIndexNav>
  );
};
