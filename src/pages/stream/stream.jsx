import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import liveStreamService from "../../services";
import { io } from "socket.io-client";

export default function Stream() {
  const [stream, setStream] = useState(undefined);
  const [streamName, setStreamName] = useState(undefined);
  const videoElem = useRef();
  const ws = useRef();
  const WsUrl = "https://8c4e-175-107-214-32.ngrok-free.app";
  const youtubeUrl = "rtmps://x.rtmps.youtube.com/live2/svuj-f9xq-ycgx-bjzj-ef9y";

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

  const startStream = useCallback(async () => {
    try {
      const eventData = {
        snippet: {
          title: "Test broadcast",
          scheduledStartTime: new Date(Date.now() + 300000).toISOString(),
        },
        status: {
          privacyStatus: "unlisted",
          selfDeclaredMadeForKids: false,
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
      liveStreamRecorder.start(200);
    } catch (e) {
      console.log("e: ", e);
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
        gap: "20px",
      }}
    >
      <video style={{ width: "70vw", height: "70vh" }} ref={videoElem} muted></video>

      <button disabled={!stream} onClick={startStream}>
        Start Stream
      </button>
    </div>
  );
}
