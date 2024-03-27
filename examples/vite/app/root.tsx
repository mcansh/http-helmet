import { useNonce } from "@mcansh/http-helmet/react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import rootStyleHref from "./root.css?url";
import { LinksFunction } from "@remix-run/node";

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: rootStyleHref },
    { rel: "preload", as: "style", href: rootStyleHref },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  let nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
