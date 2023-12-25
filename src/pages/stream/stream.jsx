import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import liveStreamService from "../../services";
import { io } from "socket.io-client";
import { notify } from "../../notifications";

export default function Stream() {
  const [stream, setStream] = useState(undefined);
  const [eventId, setEventId] = useState(undefined);
  const [streamId, setStreamId] = useState(undefined);
  const [isLive, setIsLive] = useState(undefined);
  const [streamName, setStreamName] = useState(undefined);
  const videoElem = useRef();
  const ws = useRef();
  const WsUrl = "https://dd2e-175-107-214-32.ngrok-free.app";
  const streamUrl = `https://youtube.com/live/${eventId}`;

  const streamUrlParams = `?youtubeUrl=rtmps://x.rtmps.youtube.com/live2/${streamName}`;
  let liveStream;
  let liveStreamRecorder;

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
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        setStream(stream);
        videoElem.current.srcObject = stream;
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
      }
    },
    [eventId, streamId]
  );

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
      liveStreamRecorder = new MediaRecorder(liveStream, {
        mimeType: "video/webm;codecs=h264",
        videoBitsPerSecond: 3 * 1024 * 1024,
      });

      liveStreamRecorder.ondataavailable = (e) => {
        ws.current.emit("message", e.data);
        console.log("send data", e.data);
      };
      // Start recording, and dump data every second
      liveStreamRecorder.start(1000);
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
      {isLive ? <button>{streamUrl}</button> : null}

      <video style={{ width: "70vw", height: "70vh" }} ref={videoElem} muted></video>

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
      <button
        disabled={!isLive}
        onClick={() => {
          makeTransition("complete");
        }}
      >
        END STREAM
      </button>
    </div>
  );
}
