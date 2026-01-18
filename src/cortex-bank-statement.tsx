import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./app/root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  errorBoundary(_err, _info, _props) {
    return null;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
