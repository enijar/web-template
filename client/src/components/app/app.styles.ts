import { createGlobalStyle } from "styled-components";

export const AppReset = createGlobalStyle`
  :root {
    --root-scale: 3;
    --root-size: calc(var(--root-scale) * 1vh);
    --root-min: 16px;
    --root-max: 20px;
  }

  @media (orientation: portrait) {
    --root-size: calc(var(--root-scale) * 1vw);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    color: inherit;
  }

  html,
  body,
  #root,
  main {
    width: 100%;
    height: 100%;
  }

  html {
    font-size: clamp(var(--root-min), var(--root-size), var(--root-max));
    font-family: system-ui, sans-serif;
    font-weight: normal;
    line-height: 1em;
    text-rendering: geometricPrecision;
    background-color: #1e1e1e;
    color: #fefefe;
  }

  main {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
`;
