import { sheet } from '@/components/styles/sheet';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import React from 'react';
import { AnimationLink } from '../atoms/AnimationLink';

export const Footer: React.FC = () => {
  const Footer = styled.footer`
    align-items: center;
    justify-content: center;
    display: flex;
    flex: 0 1 auto !important;
    flex-wrap: wrap;
    padding: 6px 16px;
    position: relative;
    transition-duration: 0.2s;
    transition-property: background-color, left, right;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 32px;
    margin-top: 16px;
    padding-bottom: 32px;
  `;
  const Center = styled.div`
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  `;
  const footerLink = css`
    margin: 8px 12px;
    text-decoration: none;
    display: flex;
    align-items: center;
  `;
  return (
    <Footer className={sheet}>
      <Center>
        <AnimationLink
          href="https://twitter.com/t0p_l1ght"
          className={footerLink}
        >
          <FontAwesomeIcon
            icon={faTwitter}
            color="#1DA1F2"
            width={16}
            // detail style
            style={{ paddingBottom: '3px' }}
          />
          <span>筆者Twitterアカウント</span>
        </AnimationLink>
        <AnimationLink href="/guide" className={footerLink}>
          <span>当サイト利用について</span>
        </AnimationLink>
      </Center>
    </Footer>
  );
};
