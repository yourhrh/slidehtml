/// <reference types="vite/client" />

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          allowpopups?: string
          disablewebsecurity?: string
          nodeintegration?: string
          preload?: string
          httpreferrer?: string
          useragent?: string
          webpreferences?: string
          partition?: string
        },
        HTMLElement
      >
    }
  }
}
