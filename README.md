# Expo AV Android Recording In Background Muted After 1 Minute

Issue URL: https://github.com/expo/expo/issues/25977

## Expected behaviour

_The user uses an Android phone._

- The user clicks on the "Start recording" button to start the recording.
- The user locks his phone for more than a minute.
- The user unlocks his phone and clicks on "Stop recording" to stop the recording.

=> The user can listen to the whole recording from begining to end by clicking on the "Play audio" button.

## Actual behaviour

When the user user clicks on the "Play audio" button, the audio recorded between 1 minute after the phone has been locked and the moment the phone is unlocked is muted.

<img src="./assets/demo-1.gif" width="240"/>

**Wait for at least 1 minute**

<img src="./assets/demo-2.gif" width="240"/>

## Environment

```
expo-env-info 1.0.5 environment info:
    System:
      OS: macOS 13.4.1
      Shell: 5.9 - /bin/zsh
    Binaries:
      Node: 20.3.1 - ~/.nvm/versions/node/v20.3.1/bin/node
      Yarn: 1.22.19 - /opt/homebrew/bin/yarn
      npm: 9.6.7 - ~/.nvm/versions/node/v20.3.1/bin/npm
      Watchman: 2023.10.09.00 - /opt/homebrew/bin/watchman
    Managers:
      CocoaPods: 1.12.0 - /Users/rildev/.rvm/gems/ruby-3.0.0/bin/pod
    SDKs:
      iOS SDK:
        Platforms: DriverKit 22.4, iOS 16.4, macOS 13.3, tvOS 16.4, watchOS 9.4
      Android SDK:
        API Levels: 30, 33, 33
        Build Tools: 30.0.3, 33.0.0, 33.0.2, 34.0.0
        System Images: android-28 | Google ARM64-V8a Play ARM 64 v8a, android-33 | Google Play ARM 64 v8a, android-UpsideDownCake | Google APIs ARM 64 v8a, android-UpsideDownCake | Google Play ARM 64 v8a
    IDEs:
      Android Studio: 2022.1 AI-221.6008.13.2211.9619390
      Xcode: 14.3.1/14E300c - /usr/bin/xcodebuild
    npmPackages:
      expo: ~49.0.15 => 49.0.21
      react: 18.2.0 => 18.2.0
      react-native: 0.72.6 => 0.72.6
    npmGlobalPackages:
      eas-cli: 5.4.0
    Expo Workflow: managed
```

## Fix

The technique here is to add a [Foreground Service](https://developer.android.com/develop/background-work/services/foreground-services) to prevent the app from being [dozed off](https://developer.android.com/training/monitoring-device-state/doze-standby) by Android.

In this POC, I'm using [Notifee](https://notifee.app/), but feel free to use whatever package suits you.

### Setup

- Install Notifee with `expo install @notifee/react-native`. ⚠️ at the time of this writting, Notifee's documentation website is at least 8 months being the [documentation on their Github](https://github.com/invertase/notifee/blob/main/docs-react-native/react-native/docs/overview.md). Check it out for the most up-to-date instructions!
- [Create a development build in Expo](https://docs.expo.dev/develop/development-builds/create-a-build/) with `eas build --profile development --platform android`.
- Run your custom Expo build with `npx expo start --dev-client`.

### How does it work?

1. Register the foreground service at your application's root, outside of any React components.

```
notifee.registerForegroundService(() => {
  return new Promise(() => {
    // Long running task...
  });
});
```

2. Start the foreground service by adding this code to a function inside your React component. In this POC, when the recording starts.

```
const channelId = await notifee.createChannel({
  id: "recording",
  name: "Recording",
});

notifee.displayNotification({
  title: "Android audio background recording",
  body: "recording...",
  android: {
    channelId,
    asForegroundService: true,
  },
});
```

3. Stop the foreground service when you don't need it anymore. In the POC, when the recording stops.

```
await notifee.stopForegroundService();
```

<img src="./assets/demo-3.jpg" width="240"/>

⚠️ The notification will not appear the first time you start recording after opening the application. But it will work fine afterwards.

## Miscellaneous

### Expo

- What is a development build?: https://docs.expo.dev/develop/development-builds/introduction/
- Create a development build: https://docs.expo.dev/develop/development-builds/create-a-build/

### Notifee

- Most up-to-date documentation: https://github.com/invertase/notifee/blob/main/docs-react-native/react-native/docs/overview.md
- Foreground Service: https://notifee.app/react-native/docs/android/foreground-service
