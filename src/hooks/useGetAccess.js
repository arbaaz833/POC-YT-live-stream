import { useNavigate } from "react-router-dom";
import { CLIENT_ID, REDIRECT_URI } from "../config/config";

export const useGetAccess = () => {
  const navigate = useNavigate();

  const reAuth = (url) => {
    const authPopup = window.open(url, "popup", "popup=true");
    window.addEventListener("message", (event) => {
      console.log("event: ", event);
      if (event.data === "redirect") {
        navigate("/stream");
      }
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
