import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useState, useRef } from "react";
import { Audio } from "expo-av";

const RecordingStatus = {
  notRecording: "not recording",
  recording: "recording",
};

const AudioStatus = {
  notPlaying: "not playing",
  playing: "playing",
};

export default function App() {
  const [recordingStatus, setRecordingStatus] = useState(
    RecordingStatus.notRecording
  );
  const [audioStatus, setAudioStatus] = useState(AudioStatus.notPlaying);
  const [recording, setRecording] = useState();
  const [audioURI, setAudioURI] = useState();
  const audioRef = useRef();

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setRecordingStatus(RecordingStatus.recording);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setAudioURI(recording.getURI());
    } catch (error) {
      console.error(error);
    }
    setRecordingStatus(RecordingStatus.notRecording);
  };

  const startAudio = async () => {
    try {
      if (!audioURI) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioURI },
        {},
        (status) => {
          if (status.didJustFinish) {
            audioRef.current.unloadAsync();
            setAudioStatus(AudioStatus.notPlaying);
          }
        }
      );

      await sound.playAsync();

      audioRef.current = sound;
      setAudioStatus(AudioStatus.playing);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {recordingStatus === RecordingStatus.notRecording && (
        <View>
          <Text onPress={startRecording} style={styles.startRecordingButton}>
            Start recording
          </Text>
          <Text>Not recording</Text>
        </View>
      )}
      {recordingStatus === RecordingStatus.recording && (
        <View>
          <Text onPress={stopRecording} style={styles.stopRecordingButton}>
            Stop recording
          </Text>
          <Text>Recording...</Text>
        </View>
      )}
      {audioStatus === AudioStatus.notPlaying && (
        <Text
          onPress={startAudio}
          disabled={!audioURI}
          style={StyleSheet.flatten([
            styles.audioButton,
            { backgroundColor: audioURI ? "blue" : "gray" },
          ])}
        >
          Play audio
        </Text>
      )}
      {audioStatus === AudioStatus.playing && (
        <Text style={styles.audioButton}>Playing audio...</Text>
      )}
      <Text>Audio location: {audioURI}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  startRecordingButton: {
    padding: 20,
    backgroundColor: "green",
    color: "white",
  },
  stopRecordingButton: {
    padding: 20,
    backgroundColor: "red",
    color: "white",
  },
  audioButton: {
    padding: 20,
    color: "white",
    backgroundColor: "blue",
  },
});
