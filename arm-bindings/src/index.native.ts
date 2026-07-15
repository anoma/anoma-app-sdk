// Metro (Expo native iOS and Android) resolves this over index.ts via platform extensions.

export * from '../generated/index.native';
export { default } from '../generated/index.native';

export async function initSdk() {
  // NOOP 
  // The sdk is intialized automatically.
  // Check the function uniffiInitAsync on generated/index.native
}

