import React from "react";
import { useLocation } from "react-router-dom";

export default function Confirmed() {
  const { hash } = useLocation();

  return <div>{hash}</div>;
}
