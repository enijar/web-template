import { createGlobalStyle } from "styled-components/macro";
import { fluidRange } from "polished";
import vars from "./vars";

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
  }

  html {
    ${fluidRange(
      {
        prop: "font-size",
        fromSize: `${vars.rootSize * 0.8}px`,
        toSize: `${vars.rootSize}px`,
      },
      `${vars.responsiveMin}px`,
      `${vars.responsiveMax}px`
    )};
    font-family: ${vars.fontBody};
    font-weight: normal;
    line-height: 1.2;
  }
`;
