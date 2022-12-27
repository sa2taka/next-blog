import { WebPImage } from '@/components/atoms/WebpImage';
import Link from 'next/link';
import React from 'react';
import { styled } from '@linaria/react';
import { AnimationLink } from '@/components/atoms/AnimationLink';
import { css } from '@linaria/core';
import { BothSideBox } from '../../atoms/BothSideBox';
import { sheet } from '@/components/styles/sheet';
import { DarkThemeSwitch } from '@/components/molecules/DarkThemeSwitch';

const TitleText = styled.h1`
  font-size: 1.2em;
  width: 230px;
  margin-left: 8px;

  @media screen and (max-width: 640px) {
    & {
      display: none;
    }
  }
`;
const title = css`
  display: flex;
  align-items: center;
  text-decoration: none;

  .theme--dark & {
    color: #ddd;
  }

  .theme--light & {
    color: #222;
  }
`;
const LeftSide: React.FC = () => {
  return (
    <Link href="/" className={title}>
      <WebPImage
        file="/icon.webp"
        altFile="/icon.png"
        altText="logo"
        width={20.88}
        height={36}
      />
      <TitleText>言葉の向こうに世界を見る</TitleText>
    </Link>
  );
};

const rightSideLink = css`
  margin: auto 8px;
  display: flex;
  align-items: center;
`;
const RightSideNav = styled.nav`
  display: flex;
  margin-right: 12px;
`;

const RightSideRoot = styled.div`
  display: flex;
  justify-content: center;
`;
const RightSide: React.FC = () => {
  return (
    <RightSideRoot>
      <RightSideNav>
        <AnimationLink href="/" className={rightSideLink}>
          Home
        </AnimationLink>
        <AnimationLink href="/category" className={rightSideLink}>
          Category
        </AnimationLink>
      </RightSideNav>
      <DarkThemeSwitch />
    </RightSideRoot>
  );
};

const AppBar = styled.header`
  height: 64px;
  margin-top: 0px;
  transform: translateY(0px);
  left: 0px;
  right: 0px;
  position: absolute;
  align-items: center;
  display: flex;
  z-index: 0;
  padding: 4px 16px;
`;

const fullWidth = css`
  width: 100%;
`;
const alignCenter = css`
  align-items: center;
`;
export const Header: React.FC = () => {
  return (
    <AppBar className={sheet}>
      <BothSideBox
        className={`${fullWidth} ${alignCenter}`}
        start={<LeftSide />}
        end={<RightSide />}
      />
    </AppBar>
  );
};
