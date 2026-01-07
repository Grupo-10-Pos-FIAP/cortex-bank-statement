import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./app/root.component";

/**
 * Entry point do microfrontend Statement
 *
 * Funciona tanto em modo federado (Single-SPA) quanto standalone.
 * O webpack-config-single-spa-react-ts cria automaticamente o HTML standalone
 * quando executado com --env standalone.
 */
const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  errorBoundary(_err, _info, _props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
