declare module 'color-thief-node' {
  export function getPalette(source: Buffer | string, colorCount?: number, quality?: number): Promise<number[][]>;
}
