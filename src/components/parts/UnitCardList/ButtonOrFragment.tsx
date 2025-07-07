import type { FC, ReactNode } from "react";

type Props = {
  onClick?: () => void;
  children: ReactNode;
};

export const ButtonOrFragment: FC<Props> = ({ onClick, children }) => {
  return onClick ? (
    <button onClick={onClick}>{children}</button>
  ) : (
    <>{children}</>
  );
};
