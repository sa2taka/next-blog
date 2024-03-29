import { sheet } from '@blog/components/styles/sheet';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import React from 'react';
import { AnimationLink } from '../../atoms/AnimationLink';

const FooterRoot = styled.footer`
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

export const Footer: React.FC = () => {
  return (
    <FooterRoot className={sheet}>
      <Center>
        <AnimationLink
          href="https://twitter.com/t0p_l1ght"
          className={footerLink}
        >
          <FontAwesomeIcon
            icon={faXTwitter}
            color="#fff"
            width={18}
            // detail style
            style={{ paddingRight: '3px' }}
          />
          <span>筆者Xアカウント</span>
        </AnimationLink>
        <AnimationLink href="/guide" className={footerLink}>
          <span>当サイト利用について</span>
        </AnimationLink>
      </Center>
    </FooterRoot>
  );
};
