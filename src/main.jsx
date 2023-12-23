import React from "react";
import ReactDOM from "react-dom/client";
import ReqAccess from "./requestAccess.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Stream from "./pages/stream/stream.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ReqAccess />,
  },
  {
    path: "stream",
    element: <Stream />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
