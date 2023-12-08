import { useCallback, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import liveStreamService from "./services";
import { CLIENT_ID, REDIRECT_URI } from "./config/config";

function App() {
  const linkRef = useRef();
  const reqAccess = () => {
    // await liveStreamService.requestAccess();
    console.log("SSSSSSSSSS");
    linkRef.current.click();
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <a
          href={`https://accounts.google.com/o/oauth2/v2/auth?
        scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly&
        state=state_parameter_passthrough_value&
        redirect_uri=${REDIRECT_URI}&
        response_type=token&
        client_id=${CLIENT_ID}`}
          target="_blank"
          style={{ display: "none" }}
          ref={linkRef}
        ></a>
        <button onClick={reqAccess}>Grant Access</button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
