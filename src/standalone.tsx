import React from "react";
import ReactDOMClient from "react-dom/client";
import "./styles/tokens.css";
import Root from "./app/root.component";

// Aguardar DOM estar completamente pronto
let retryCount = 0;
const MAX_RETRIES = 10;

function init() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    retryCount++;
    if (retryCount >= MAX_RETRIES) {
      return;
    }
    // Tentar novamente após um pequeno delay se não encontrar
    setTimeout(init, 100);
    return;
  }

  try {
    const root = ReactDOMClient.createRoot(rootElement);
    root.render(<Root />);
  } catch (error) {
    throw error;
  }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === "complete" || document.readyState === "interactive") {
  // DOM já está pronto ou quase pronto
  setTimeout(init, 1);
} else {
  // Aguardar DOMContentLoaded
  document.addEventListener("DOMContentLoaded", init);
}
