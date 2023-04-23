import { Button } from '@blog/components/atoms/Button';
import { Tooltip } from '@blog/components/atoms/Tooltip';
import { ThemeContext } from '@blog/components/contexts/theme';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styled } from '@linaria/react';
import React, { useContext } from 'react';

const NoWrapSpan = styled.span`
  white-space: nowrap;
`;

const ToDark: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Tooltip tooltipContent={<NoWrapSpan>ダークモードへ</NoWrapSpan>}>
      <Button icon small aria-label="ダークモードへ" onClick={onClick}>
        <FontAwesomeIcon icon={faSun} />
      </Button>
    </Tooltip>
  );
};

const ToLight: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Tooltip tooltipContent={<NoWrapSpan>ライトモードへ</NoWrapSpan>}>
      <Button icon small aria-label="ライトモードへ" onClick={onClick}>
        <FontAwesomeIcon icon={faMoon} />
      </Button>
    </Tooltip>
  );
};

export const DarkThemeSwitch: React.FC = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  if (theme === 'dark') {
    return <ToLight onClick={() => setTheme('light')} />;
  } else {
    return <ToDark onClick={() => setTheme('dark')} />;
  }
};
