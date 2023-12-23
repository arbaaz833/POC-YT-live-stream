import axios from "../config/axios";
import { CLIENT_ID, REDIRECT_URI } from "../config/config";

const liveStreamService = {
  addBroadcast: async (data) => {
    try {
      let event = await axios({ method: "POST", data: data, url: "/youtube/v3/liveBroadcasts?part=id,snippet" });
      console.log("EVENT", event.data);
      return event.data;
    } catch (e) {
      console.log("e: ", e);
    }
  },
  addStream: async (data) => {
    try {
      let stream = await axios({
        method: "POST",
        data: data,
        url: "/youtube/v3/liveStreams?part=id,snippet,cdn,contentDetails",
      });
      console.log("STREAM", stream.data);
      return stream.data;
    } catch (e) {
      console.log("e: ", e);
    }
  },
  bindStreamWithEvent: async (eventId, streamId) => {
    try {
      let event = await axios({
        method: "POST",
        url: `/youtube/v3/liveBroadcasts/bind?part=id,snippet,contentDetails,status&id=${eventId}&streamId=${streamId}`,
      });
      return event.data;
    } catch (e) {
      console.log("e: ", e);
    }
  },
};

export default liveStreamService;
