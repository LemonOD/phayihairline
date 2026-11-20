/** Tiny shimmer SVG used as a blur placeholder (remote images have no precomputed blur hash). */
const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10" viewBox="0 0 8 10">',
  '<defs><linearGradient id="g"><stop stop-color="#e7dfd3" offset="0"/><stop stop-color="#f3eee6" offset="1"/></linearGradient></defs>',
  '<rect width="8" height="10" fill="url(#g)"/>',
  "</svg>",
].join("")

export const blurDataURL = `data:image/svg+xml;base64,${btoa(svg)}`
