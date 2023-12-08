import axios from "axios";
import { CLIENT_ID, REDIRECT_URI } from "../config/config";

const liveStreamService = {
  requestAccess: async () => {
    try {
      await axios({
        method: "GET",
        url: `https://accounts.google.com/o/oauth2/v2/auth?
        scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly&
        state=state_parameter_passthrough_value&
        redirect_uri=${REDIRECT_URI}&
        response_type=token&
        client_id=${CLIENT_ID}`,
      });
    } catch (e) {
      console.log("e: ", e);
    }
  },
};

export default liveStreamService;
