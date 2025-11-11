import { twMerge } from "tailwind-merge";
import clsx, { type ClassValue } from "clsx";
import {
  TokenIcon,
  WalletIcon,
  ExchangeIcon,
  NetworkIcon,
  type IconComponentProps,
} from "@web3icons/react";
import type { ReactElement } from "react";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const shortenAddress = (address: string, head = 6, tail = 4) => {
  return `${address.slice(0, 2 + head)}…${address.slice(-tail)}`;
};

export const checkForWeb3Icons = (
  el: ReactElement
): el is ReactElement<IconComponentProps> => {
  if (!el || typeof el !== "object") return false;
  return (
    el.type === TokenIcon ||
    el.type === NetworkIcon ||
    el.type === WalletIcon ||
    el.type === ExchangeIcon
  );
};
