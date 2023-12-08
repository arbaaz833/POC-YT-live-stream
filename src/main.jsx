import React from "react";
import ReactDOM from "react-dom/client";
import ReqAccess from "./requestAccess.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Confirmed from "./pages/confirmed/confirmed.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ReqAccess />,
  },
  {
    path: "confirmed",
    element: <Confirmed />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
