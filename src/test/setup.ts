import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

vi.mock("@grupo10-pos-fiap/design-system", () => {
  const CardSection = ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("div", { "data-testid": "card-section", ...props }, children);

  CardSection.displayName = "Card.Section";

  const CardComponent = ({
    children,
    title,
    ...props
  }: {
    children: React.ReactNode;
    title?: string;
    [key: string]: unknown;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "card", ...props },
      title && React.createElement("h3", null, title),
      children
    );

  CardComponent.Section = CardSection;
  CardComponent.displayName = "Card";

  const Text = ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement("div", { "data-testid": "text", ...props }, children);
  Text.displayName = "Text";

  const Loading = ({ text, ...props }: { text: string; [key: string]: unknown }) =>
    React.createElement("div", { "data-testid": "loading", ...props }, text);
  Loading.displayName = "Loading";

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement("input", { "data-testid": "input", ...props });
  Input.displayName = "Input";

  const Button = ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement("button", { "data-testid": "button", ...props }, children);
  Button.displayName = "Button";

  const IconButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    React.createElement("button", { "data-testid": "icon-button", ...props });
  IconButton.displayName = "IconButton";

  const Icon = ({ name, ...props }: { name: string; [key: string]: unknown }) =>
    React.createElement("span", { "data-testid": "icon", "data-icon-name": name, ...props });
  Icon.displayName = "Icon";

  const Dropdown = ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("select", { "data-testid": "dropdown", ...props }, children);
  Dropdown.displayName = "Dropdown";

  return {
    Text,
    Loading,
    Card: CardComponent,
    Input,
    Button,
    IconButton,
    Icon,
    Dropdown,
  };
});

afterEach(() => {
  cleanup();
});
