<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Audio } from 'expo-av';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string) => void;
  existingUri?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, existingUri }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(!!existingUri);
  const [recordingUri, setRecordingUri] = useState<string | undefined>(existingUri);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (!permissionGranted) {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      setPermissionGranted(true);
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        setRecordingUri(uri);
        setHasRecording(true);
        onRecordingComplete(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const deleteRecording = () => {
    setRecordingUri(undefined);
    setHasRecording(false);
    onRecordingComplete('');
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };

  if (isRecording) {
    return (
      <View style={styles.container}>
        <Text style={styles.recordingText}>Recording...</Text>
        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasRecording) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Voice Commitment Recorded</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.playButton} onPress={playRecording}>
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={deleteRecording}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Record Your Commitment</Text>
      <Text style={styles.sublabel}>Record a voice note explaining your goal</Text>
      <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
        <Text style={styles.recordButtonText}>Record</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    color: '#342521',
    marginBottom: 10,
    fontWeight: '800',
  },
  sublabel: {
    fontSize: 14,
    color: '#A09088',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: '#FF7F62',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingText: {
    color: '#FF7F62',
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#342521',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  playButton: {
    backgroundColor: '#F4E7DF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playButtonText: {
    color: '#342521',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FFE5E0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  deleteButtonText: {
    color: '#FF7F62',
    fontSize: 16,
    fontWeight: 'bold',
  },
=======
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Audio } from 'expo-av';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string) => void;
  existingUri?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, existingUri }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(!!existingUri);
  const [recordingUri, setRecordingUri] = useState<string | undefined>(existingUri);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (!permissionGranted) {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      setPermissionGranted(true);
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        setRecordingUri(uri);
        setHasRecording(true);
        onRecordingComplete(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const deleteRecording = () => {
    setRecordingUri(undefined);
    setHasRecording(false);
    onRecordingComplete('');
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };

  if (isRecording) {
    return (
      <View style={styles.container}>
        <Text style={styles.recordingText}>Recording...</Text>
        <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasRecording) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Voice Commitment Recorded</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.playButton} onPress={playRecording}>
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={deleteRecording}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Record Your Commitment</Text>
      <Text style={styles.sublabel}>Record a voice note explaining your goal</Text>
      <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
        <Text style={styles.recordButtonText}>Record</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    color: '#342521',
    marginBottom: 10,
    fontWeight: '800',
  },
  sublabel: {
    fontSize: 14,
    color: '#A09088',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: '#FF7F62',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#FF7F62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingText: {
    color: '#FF7F62',
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#342521',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  playButton: {
    backgroundColor: '#F4E7DF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playButtonText: {
    color: '#342521',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FFE5E0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  deleteButtonText: {
    color: '#FF7F62',
    fontSize: 16,
    fontWeight: 'bold',
  },
>>>>>>> origin/main
});