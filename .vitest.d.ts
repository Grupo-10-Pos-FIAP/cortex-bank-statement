/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
  }
}
