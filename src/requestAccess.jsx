import { useCallback, useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./_App.css";
import liveStreamService from "./services";
import { AUTHURL, CLIENT_ID, REDIRECT_URI } from "./config/config";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetAccess } from "./hooks/useGetAccess";

function ReqAccess() {
  const linkRef = useRef();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const getAuth = useGetAccess();

  useEffect(() => {
    const params = new URLSearchParams("?" + hash.slice(1));
    if (params.get("access_token")) {
      // localStorage.setItem("token", params.get("access_token"));
      console.log("HERE");
      if (window.opener) {
        console.log("window.opener: ", window.opener);
        localStorage.setItem("token", params.get("access_token"));
        if (params.get("state") === "redirect") window.opener.postMessage("redirect");
        window.close();
      }
      // navigate("/stream");
    }
  }, []);

  const reqAccess = () => {
    linkRef.current.click();
  };

  return (
    <>
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> */}
      <h1>Live stream POC</h1>
      <div className="card">
        <a
          href={`https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.force-ssl%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutubepartner%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.channel-memberships.creator&response_type=token&state=state_parameter_passthrough_value&redirect_uri=${encodeURIComponent(
            REDIRECT_URI
          )}&client_id=${encodeURIComponent(CLIENT_ID)}`}
          style={{ display: "none" }}
          ref={linkRef}
        ></a>
        <button
          onClick={() => {
            getAuth(AUTHURL + "&state=redirect");
          }}
        >
          Grant Access
        </button>
        {/* <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p> */}
      </div>
      {/* <p className="read-the-docs">Click on the Vite and React logos to learn more</p> */}
    </>
  );
}

export default ReqAccess;
