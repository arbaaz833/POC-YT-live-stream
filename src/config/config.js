export const CLIENT_ID = "280248088197-k4ur0tnbi4tdug6v2ivnofkb55vjebq5.apps.googleusercontent.com";
export const REDIRECT_URI = "https://poc-yt-live-stream.vercel.app";
// export const REDIRECT_URI = "http://127.0.0.1:5173";
export const AUTHURL = `https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.force-ssl%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutubepartner%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.channel-memberships.creator&response_type=token&state=redirect&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&client_id=${encodeURIComponent(CLIENT_ID)}`;
