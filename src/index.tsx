import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./app/root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  errorBoundary(err, _info, _props) {
    return (
      <div style={{ padding: "20px", color: "#d32f2f", fontFamily: "system-ui" }}>
        <h2 style={{ marginBottom: "10px" }}>Erro ao carregar aplicação</h2>
        <p style={{ marginBottom: "5px" }}>{err?.message || "Erro desconhecido"}</p>
        {process.env.NODE_ENV === "development" && (
          <details style={{ marginTop: "10px" }}>
            <summary style={{ cursor: "pointer" }}>Detalhes do erro</summary>
            <pre
              style={{
                marginTop: "10px",
                padding: "10px",
                background: "#f5f5f5",
                overflow: "auto",
              }}
            >
              {err?.stack || JSON.stringify(err, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  },
});

export const { bootstrap, mount, unmount } = lifecycles;

export default lifecycles;
