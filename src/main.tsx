import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./app/router";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>,
);