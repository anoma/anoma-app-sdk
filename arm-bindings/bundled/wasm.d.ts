// wasm-bindgen ships no declaration for the wasm asset; bundlers resolve it to a URL.
declare module "*.wasm" {
  const url: string;
  export default url;
}
