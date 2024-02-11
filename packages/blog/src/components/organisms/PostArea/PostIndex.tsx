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
  margin-top: -12px;
  margin-bottom: 16px;
  counter-reset: number;
  padding-left: 32px;
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
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const SubIndexOl = styled.ol`
  counter-reset: number;
  position: relative;
`;

const SecondIndex = styled.li`
  margin-top: 8px;
  margin-bottom: 8px;
  list-style: none;
  position: relative;
  font-weight: 400;
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

            {level1.child.length !== 0 && (
              <SubIndexOl>
                {level1.child.map((level2) => (
                  <SecondIndex key={`${level2.level}-${level2.title}`}>
                    <IndexLink href={`#${level2.title}`}>
                      {level2.title}
                    </IndexLink>
                  </SecondIndex>
                ))}
              </SubIndexOl>
            )}
          </FirstIndex>
        ))}
      </PostIndexOl>
    </PostIndexNav>
  );
};
