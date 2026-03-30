export const hasTouchScreen = () => navigator.maxTouchPoints > 0;

export const isMobileDevice = () =>
  window.matchMedia("(pointer: coarse)").matches ||
  window.matchMedia("(hover: none)").matches;

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  // deprecated but required for iPadOS detection
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Source: https://www.npmjs.com/package/@binance/w3w-utils?activeTab=code
export const getBinanceDeepLink = (url: string, chainId = 1) => {
  const base = "bnc://app.binance.com/mp/app";
  const appId = "yFK5FCqYprrXDiVFbhyRx7";
  const startPagePath = window.btoa("/pages/browser/index");
  const startPageQuery = window.btoa(`url=${url}&defaultChainId=${chainId}`);
  const deeplink = `${base}?appId=${appId}&startPagePath=${startPagePath}&startPageQuery=${startPageQuery}`;
  const dp = window.btoa(deeplink);
  const http = `https://app.binance.com/en/download?_dp=${dp}`;
  return { http, bnc: deeplink };
};
