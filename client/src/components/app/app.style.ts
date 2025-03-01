import { createGlobalStyle } from "styled-components";

export const Reset = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
    text-rendering: inherit;
  }

  html {
    font-size: 100%;
    font-family: system-ui, sans-serif;
    line-height: normal;
    text-rendering: geometricPrecision;
    color-scheme: light dark;
  }

  body {
    overscroll-behavior: none;
  }
`;
