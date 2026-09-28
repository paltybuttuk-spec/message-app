# Messenger — PWA (GitHub Pages / PWABuilder format)
Same layout as your message-generator repo: `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`.

## Publish
1. Create a GitHub repo (e.g. `messenger`), upload these files to the root, then Settings -> Pages -> Deploy from branch `main` / root.
2. Open `https://<user>.github.io/<repo>/`. On the sign-in screen enter your **server URL** (the Node backend from `messenger-app.zip`, deployed over **HTTPS**), then register/log in.
   The URL is remembered on the device. Paths are relative, so the repo can have any name.

## Make an APK (like MsgGen.apk)
1. Go to pwabuilder.com, enter the Pages URL, choose **Package for stores -> Android**, and download the package.
2. Install the APK. For it to open full-screen (no browser bar) upload the `assetlinks.json` that PWABuilder gives you to
   `https://<user>.github.io/.well-known/assetlinks.json` (i.e. the `<user>.github.io` repo; it can hold entries for several apps).
3. Later UI updates: just push to the repo — the installed app updates itself.

## Offline
Shell is cached by `sw.js` (works offline after the first open); chats and recent messages are cached; unsent messages queue and send on reconnect.

## Same-phone link with MsgGen + notifications
- Host both apps under the same account (`<user>.github.io/message-generator/` and `<user>.github.io/messenger/`). Same origin = shared storage and one notification permission.
- MsgGen's **Send to Messenger app (this phone)** puts the text in a shared inbox and shows a notification; tapping it opens Messenger's "From MsgGen" list where you pick the chat. Works with no internet; delivery to the server happens when back online.
- **Push from the server** (works with the app closed): the backend generates VAPID keys on first run (stored in its database) and pushes every new message to the recipient's subscribed devices. Tap the 🔔 in Messenger once (or any first tap after login) to allow notifications.
- Building the Messenger APK on pwabuilder.com: turn on **Notification delegation** in the Android options (MsgGen already has it).
