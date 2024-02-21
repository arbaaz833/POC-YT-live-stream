import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Stream from "./pages/stream/stream.jsx";
import ReqAccess from "./requestAccess.jsx";
import { ToastContainer } from "react-toastify";
import StreamNative from "./pages/stream/streamNative.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ReqAccess />,
  },
  {
    path: "stream",
    element: <StreamNative />,
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
