import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Stream from "./pages/stream/stream.jsx";
import ReqAccess from "./requestAccess.jsx";
import { ToastContainer } from "react-toastify";
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

export default function App() {
  return (
    <div>
      <RouterProvider router={router} />
      <ToastContainer />
    </div>
  );
}
