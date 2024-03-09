import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import liveStreamService from "../../services";
import { io } from "socket.io-client";
import { notify } from "../../notifications";
// import breakVideo from "/break.mp4";

export default function Stream() {
  const [stream, setStream] = useState(undefined);
  const [eventId, setEventId] = useState(undefined);
  const [streamId, setStreamId] = useState(undefined);
  const [isBreakAdded, setIsBreakAdded] = useState(false);
  const [isLive, setIsLive] = useState(undefined);
  const breakVid = useRef();
  const [streamName, setStreamName] = useState(undefined);
  const videoElem = useRef();
  const ws = useRef();
  const liveStreamRecorder = useRef();
  const breakRecorder = useRef();
  const WsUrl = import.meta.env.VITE_WSURL;
  const streamUrl = `https://youtube.com/live/${eventId}`;

  const streamUrlParams = `?youtubeUrl=rtmps://x.rtmps.youtube.com/live2/${streamName}`;
  let liveStream;

  useEffect(() => {
    ws.current = io(WsUrl + streamUrlParams);
    console.log(ws.current);
    ws.current.on("connect", () => {
      console.log("WebSocket Open");
    });

    return () => {
      ws.current.close();
    };
  }, [streamName]);

  useEffect(() => {
    if (!navigator || !navigator.mediaDevices) {
      console.log("NO MICROPHONE OR CAMERA DETTECTED");
      return;
    }
    console.log("breakVid", breakVid.current.srcObject);
    console.log("CHECK", import.meta.env.VITE_WSURL);
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        setStream(stream);
        videoElem.current.srcObject = stream;
        // videoElem.current.src = "/break.mp4";
        videoElem.current.play();
      });
  }, []);

  const makeTransition = useCallback(
    async (status) => {
      try {
        const data = {
          broadcastStatus: status,
          id: eventId,
        };
        await liveStreamService.transitionEvent(data);
        if (status === "live") setIsLive(true);
        else if (status === "complete") {
          setIsLive(false);
          ws.current.close();
        }
        notify.success(`Stream is ${status === "live" ? "live" : "ended"}`);
      } catch (e) {
        console.log("e: ", e);
        notify.error("error");
      }
    },
    [eventId, streamId]
  );

  const endBreak = async () => {
    try {
      // videoElem.current.srcObject = stream;
      // videoElem.current.loop = false;
      // liveStreamRecorder.current.resume();
      // breakVid.current.pause();
      // // breakRecorder.current.stop();
      // notify.success("break ended!");
      // setIsBreakAdded(false);
      breakRecorder.current.stop();
    } catch (e) {
      console.log("e: ", e);
      notify.error("error");
    }
  };

  const addBreak = async () => {
    try {
      // const data = {
      //   cueType: "cueTypeAd",
      //   durationSecs: 120,
      //   walltimeMs: Date.now() + 5000,
      // };
      // await liveStreamService.addCuepoint(eventId, data);
      videoElem.current.pause();
      liveStreamRecorder.current.stop();
      // videoElem.current.srcObject = null;
      // videoElem.current.src = "/break.webm";
      // videoElem.current.loop = true;
      breakVid.current.play();
      console.log("breakVid", breakVid.current.captureStream);
      videoElem.current.srcObject = breakVid.current.captureStream(30);
      breakRecorder.current = new MediaRecorder(breakVid.current.captureStream(30));
      videoElem.current.play();
      // liveStreamRecorder.current.resume();
      console.log("STREAM", breakRecorder.current);
      breakRecorder.current.ondataavailable = (e) => {
        ws.current.emit("message", e.data);
        console.log("break data", e.data);
      };
      // console.log("breakRecorder.current: ", breakRecorder.current);
      breakRecorder.current.start(1000);
      notify.success("break added!");
      setIsBreakAdded(true);
    } catch (e) {
      console.log("e: ", e);
      notify.error("error");
    }
  };

  const startStream = useCallback(async () => {
    try {
      const eventData = {
        snippet: {
          title: "Test broadcast",
          scheduledStartTime: new Date(Date.now() + 300000).toISOString(),
          description: "abcd",
        },
        status: {
          privacyStatus: "unlisted",
        },
        contentDetails: {
          recordFromStart: true,
          enableAutoStart: false,
          monitorStream: {
            enableMonitorStream: false,
          },
          latencyPreference: "ultraLow",
        },
      };

      const liveStreamData = {
        snippet: {
          title: "Test stream",
          description: "A description of your video stream",
        },
        cdn: {
          frameRate: "variable",
          ingestionType: "rtmp",
          resolution: "variable",
          format: "",
        },
        contentDetails: {
          isReusable: true,
        },
      };

      const event = await liveStreamService.addBroadcast(eventData);
      const addedliveStream = await liveStreamService.addStream(liveStreamData);
      setEventId(event.id);
      setStreamId(addedliveStream.id);
      setStreamName(addedliveStream.cdn.ingestionInfo.streamName);
      await liveStreamService.bindStreamWithEvent(event.id, addedliveStream.id);
      liveStream = videoElem.current.captureStream(30); // 30 FPS
      liveStreamRecorder.current = new MediaRecorder(liveStream, {
        mimeType: "video/webm;codecs=h264",
        videoBitsPerSecond: 3 * 1024 * 1024,
      });

      liveStreamRecorder.current.ondataavailable = (e) => {
        ws.current.emit("message", e.data);
        console.log("stream data", e.data);
      };
      // Start recording, and dump data every second
      liveStreamRecorder.current.start(1000);
      notify.success("Stream created successfully");
    } catch (e) {
      console.log("e: ", e);
      notify.error("error");
    }
  }, [stream]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {isLive ? <p>{streamUrl}</p> : null}
      <video
        style={{ visibility: "hidden", position: "absolute", zIndex: "-100" }}
        ref={breakVid}
        src="/break.webm"
        loop
        muted
      />

      <video style={{ width: "70vw", height: "70vh" }} ref={videoElem} muted></video>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <button disabled={!stream} onClick={startStream}>
          Start Stream
        </button>
        <button
          disabled={!eventId || !streamId}
          onClick={() => {
            makeTransition("live");
          }}
        >
          GO LIVE
        </button>
        <button disabled={!isLive} onClick={addBreak}>
          ADD BREAK
        </button>
        <button disabled={!isBreakAdded} onClick={endBreak}>
          END BREAK
        </button>
        <button
          disabled={!isLive}
          onClick={() => {
            makeTransition("complete");
          }}
        >
          END STREAM
        </button>
      </div>
    </div>
  );
}
