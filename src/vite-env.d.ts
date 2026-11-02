/// <reference types="vite/client" />

declare namespace React.JSX {
  interface IntrinsicElements {
    marquee: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        behavior?: string;
        direction?: string;
        scrollamount?: string | number;
      },
      HTMLElement
    >;
  }
}
