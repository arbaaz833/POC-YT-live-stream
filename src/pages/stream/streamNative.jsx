import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import liveStreamService from "../../services";
import { io } from "socket.io-client";
import { notify } from "../../notifications";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function StreamNative() {
  const ffmpegRef = useRef(new FFmpeg());
  const [loaded, setLoaded] = useState(false);
  const [stream, setStream] = useState(undefined);
  const [eventId, setEventId] = useState(undefined);
  const [streamId, setStreamId] = useState(undefined);
  const [isLive, setIsLive] = useState(undefined);
  const [streamName, setStreamName] = useState(undefined);
  const videoElem = useRef();
  const ws = useRef();
  const WsUrl = "wss://0.tcp.in.ngrok.io:14847";
  const streamUrl = `https://youtube.com/live/${eventId}`;

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
  };

  const streamUrlParams = `?youtubeUrl=rtmps://x.rtmps.youtube.com/live2/${streamName}`;
  let liveStream;
  let liveStreamRecorder;
  const youtubeUrl = WsUrl + streamUrlParams;

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    ws.current = io(youtubeUrl);

    console.log(ws.current);

    ws.current.on("connect", () => {
      console.log("WebSocket Open");
    });

    ffmpegRef.current
      .exec([
        //input settings
        "-i",
        "-",
        "-v",
        "error",

        // video codec config: low latency, adaptive bitrate
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-tune",
        "zerolatency",
        "-g:v",
        "60",

        // audio codec config: sampling frequency (11025, 22050, 44100), bitrate 64 kbits
        "-c:a",
        "aac",
        "-strict",
        "-2",
        "-ar",
        "44100",
        "-b:a",
        "64k",

        //force to overwrite
        "-y",

        // used for audio sync
        "-use_wallclock_as_timestamps",
        "1",
        "-async",
        "1",
        "-f",
        "flv",
      ])
      .then(console.log);

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
        ffmpegRef.current.write(youtubeUrl, e.data);
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
      {isLive ? <p>{streamUrl}</p> : null}

      <video
        style={{ width: "70vw", height: "70vh" }}
        ref={videoElem}
        muted
      ></video>

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
