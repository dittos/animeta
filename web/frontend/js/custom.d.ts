declare module "*.less" {
  const content: any;
  export default content;
}

declare module "nprogress" {
  export function configure(options: any): void;
  export function start(): void;
  export function done(): void;
}

// TODO
declare var __nuri: any;
