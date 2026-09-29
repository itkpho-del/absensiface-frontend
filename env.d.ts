/// <reference types="vite/client" />

// 🟢 Perbaikan untuk file .vue (Error TS7016)
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 🟢 Perbaikan untuk file .css / assets (Error TS2882)

//declare module "*.css" {
//  const content: Record<string, string>;
//  export default content;
//}

declare module "*.css" {
  const content: any;
  export default content;
}
