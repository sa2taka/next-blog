import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface Props {
  tooltipContent: ReactNode;
  children: ReactNode;
}

const TooltipRoot = styled.div`
  position: relative;
`;

const TooltipContent = styled.div`
  position: absolute;
  padding: 0.2em 0.4em;
  opacity: 0;
  background: rgba(97, 97, 97, 0.9);
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  line-height: 22px;
  text-transform: none;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;

  &.display {
    opacity: 1;
  }
`;

const MARGIN = 4;

export const Tooltip: React.FC<Props> = ({ tooltipContent, children }) => {
  const [display, setDisplay] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const on = useCallback(() => {
    setTimeout(() => setDisplay(true), 500);
  }, []);

  const off = useCallback(() => {
    setTimeout(() => setDisplay(false), 500);
  }, []);

  const onWindowSizeChange = useCallback(() => {
    if (!contentRef.current) {
      return;
    }
    const position = contentRef.current.getBoundingClientRect();
    const width = contentRef.current.clientWidth;
    const locationX = window.pageXOffset + position.left;
    if (window.innerWidth < width + locationX + MARGIN) {
      contentRef.current.setAttribute('style', `right: ${MARGIN}px`);
    }
  }, []);

  useEffect(() => {
    onWindowSizeChange();

    window.addEventListener('resize', onWindowSizeChange);
    return () => window.removeEventListener('resize', onWindowSizeChange);
  }, [onWindowSizeChange]);

  return (
    <TooltipRoot>
      <div onMouseOver={on} onMouseLeave={off}>
        {children}
      </div>

      <TooltipContent className={display ? 'display' : ''} ref={contentRef}>
        {tooltipContent}
      </TooltipContent>
    </TooltipRoot>
  );
};
