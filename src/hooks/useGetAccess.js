import { useNavigate } from "react-router-dom";
import { CLIENT_ID, REDIRECT_URI } from "../config/config";

const authURL = `https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.force-ssl%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutubepartner%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.channel-memberships.creator&response_type=token&state=state_parameter_passthrough_value&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&client_id=${encodeURIComponent(CLIENT_ID)}`;

export const useGetAccess = (redirect = false) => {
  const navigate = useNavigate();

  const reAuth = () => {
    const authPopup = window.open(authURL, "popup", "popup=true");
    window.addEventListener("message", (event) => {
      console.log("event: ", event);
    });

    // const checkPopup = setInterval(() => {
    //   if (authPopup.location.href.includes("access_token")) {
    //     console.log("HERE");
    //     const hash = authPopup.location.hash;
    //     const params = URLSearchParams("?" + hash.slice(1));
    //     localStorage.setItem("token", params.get("access_token"));
    //     if (redirect) navigate("/stream");
    //     authPopup.close();
    //   }
    //   if (!authPopup || !authPopup.closed) return;
    //   clearInterval(checkPopup);
    // }, 1000);
  };

  return reAuth;
};
