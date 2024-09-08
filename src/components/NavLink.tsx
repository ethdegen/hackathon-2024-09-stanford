"use client";

import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";

interface Props extends Omit<LinkProps, "className"> {
  children: ReactNode;
}

const NavLink: FC<Props> = ({ ...props }) => {
  const currentPath = usePathname();

  const cx = clsx({
    "transition-all ease-in": true,
    "text-primary": currentPath === props.href,
    "text-gray-400 hover:text-gray-500": currentPath !== props.href,
  });

  return <Link {...props} className={cx} />;
};

export default NavLink;
