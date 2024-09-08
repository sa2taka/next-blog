import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './index.module.css';

interface Props {
  tooltipContent: ReactNode;
  children: ReactNode;
}

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
    <div className={styles.tooltipRoot}>
      <div onMouseOver={on} onMouseLeave={off}>
        {children}
      </div>

      <div
        className={`${styles.tooltipContent} ${display ? styles.display : ''}`}
        ref={contentRef}
      >
        {tooltipContent}
      </div>
    </div>
  );
};
