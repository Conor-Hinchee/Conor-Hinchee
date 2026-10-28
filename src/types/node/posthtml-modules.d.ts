declare module "posthtml-modules" {
  import type { Plugin } from "posthtml";

  interface Options {
    root?: string;
    from?: string;
    initial?: boolean;
    attribute?: string;
    tag?: string;
  }

  export default function posthtmlModules(options?: Options): Plugin<unknown>;
}
