import { WebPImage } from '@/components/atoms/WebpImage';
import Link from 'next/link';
import React from 'react';
import { styled } from '@linaria/react';
import { AnimationLink } from '@/components/atoms/AnimationLink';
import { css } from '@linaria/core';
import { BothSideBox } from '../../atoms/BothSideBox';
import { sheet } from '@/components/styles/sheet';

const LeftSide: React.FC = () => {
  const TitleText = styled.h1`
    font-size: 1.2em;
    width: 200px;
    margin-left: 8px;
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
  return (
    <Link href="/">
      <a className={title}>
        <WebPImage
          file="/icon.webp"
          altFile="/icon.png"
          altText="logo"
          width={22}
          height={36}
        />
        <TitleText>園児ニアの庭園</TitleText>
      </a>
    </Link>
  );
};

const RightSide: React.FC = () => {
  const margin = css`
    margin: auto 8px;
  `;
  return (
    <nav>
      <AnimationLink href="/" className={margin}>
        Home
      </AnimationLink>
      <AnimationLink href="/category" className={margin}>
        Category
      </AnimationLink>
    </nav>
  );
};

export const Header: React.FC = () => {
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
