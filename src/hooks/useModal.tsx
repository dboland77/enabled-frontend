import { useState } from 'react';

export const useModal = (initialValue: boolean) => {
  const [isShowing, setIsShowing] = useState(initialValue);

  const toggle = () => {
    setIsShowing(!isShowing);
  };

  return [isShowing, toggle] as const;
};
