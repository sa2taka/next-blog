import React, { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  onClick: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onClick }) => {
  return (
    <button className="icon-button" onClick={onClick}>
      {icon}
    </button>
  );
};
