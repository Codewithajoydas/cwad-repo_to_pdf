import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import { HealthPage } from "@/pages/HealthPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/health",
    element: <HealthPage />,
  },
]);