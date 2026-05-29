import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const PREVIEW_HEIGHT = 360;

export default function HomeScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('未设置MP4视频文件');
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [resolution, setResolution] = useState('640x480');

  const [floatingWindow, setFloatingWindow] = useState(false);
  const [imageCorrection, setImageCorrection] = useState(false);
  const [loopPlayback, setLoopPlayback] = useState(true);
  const [colorInjection, setColorInjection] = useState(false);
  const [injectionMode, setInjectionMode] = useState<1 | 2>(1);

  const videoRef = useRef<Video>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const savedVideo = await AsyncStorage.getItem('selectedVideo');
      const savedVideoName = await AsyncStorage.getItem('videoName');
      const savedSettings = await AsyncStorage.getItem('settings');

      if (savedVideo) { setVideoUri(savedVideo); setIsVideoMode(true); }
      if (savedVideoName) setVideoName(savedVideoName);
      if (savedSettings) {
        const s = JSON.parse(savedSettings);
        setFloatingWindow(s.floatingWindow || false);
        setImageCorrection(s.imageCorrection || false);
        setLoopPlayback(s.loopPlayback !== undefined ? s.loopPlayback : true);
        setColorInjection(s.colorInjection || false);
        setInjectionMode(s.injectionMode || 1);
      }
    } catch (e) { console.error('加载设置失败:', e); }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify({
        floatingWindow, imageCorrection, loopPlayback, colorInjection, injectionMode,
      }));
    } catch (e) { console.error('保存设置失败:', e); }
  };

  useEffect(() => { saveSettings(); }, [floatingWindow, imageCorrection, loopPlayback, colorInjection, injectionMode]);

  const selectVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setVideoUri(asset.uri);
        setVideoName(asset.name || '已选择视频');
        setIsVideoMode(true);
        await AsyncStorage.setItem('selectedVideo', asset.uri);
        await AsyncStorage.setItem('videoName', asset.name || '已选择视频');
        Alert.alert('成功', '视频文件已设置');
      }
    } catch (e) {
      console.error('选择视频失败:', e);
      Alert.alert('错误', '选择视频文件失败');
    }
  };

  const restoreCamera = async () => {
    Alert.alert('还原相机', '确定要还原为真实相机吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          setIsVideoMode(false); setVideoUri(null);
          setVideoName('未设置MP4视频文件');
          await AsyncStorage.removeItem('selectedVideo');
          await AsyncStorage.removeItem('videoName');
          Alert.alert('成功', '已还原为真实相机');
        },
      },
    ]);
  };

  const toggleCamera = () => setCameraType(c => c === 'back' ? 'front' : 'back');

  const requestPermissions = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      return result.granted;
    }
    return true;
  };

  useEffect(() => { requestPermissions(); }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Ionicons name="videocam" size={28} color="#007AFF" />
        <Text style={styles.headerTitle}>相机替换工具</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.fileInfoContainer}>
            <Ionicons name="document" size={20} color="#666" />
            <Text style={styles.fileInfoText} numberOfLines={1}>{videoName}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={selectVideo}>
              <Ionicons name="folder-open" size={18} color="#fff" />
              <Text style={styles.buttonText}>选择视频</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={restoreCamera}>
              <Ionicons name="camera-reverse" size={18} color="#007AFF" />
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>还原相机</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.previewHeader}>
            <Text style={styles.sectionTitle}>
              {isVideoMode ? '视频预览' : `${cameraType === 'front' ? '前置' : '后置'}摄像头预览`}
            </Text>
            <TouchableOpacity onPress={toggleCamera} style={styles.toggleButton}>
              <Ionicons name="camera-reverse-outline" size={20} color="#007AFF" />
              <Text style={styles.toggleText}>切换</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.previewContainer}>
            {isVideoMode && videoUri ? (
              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                style={styles.preview}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={loopPlayback}
              />
            ) : (
              cameraPermission?.granted ? (
                <CameraView ref={cameraRef} style={styles.preview} facing={cameraType} />
              ) : (
                <View style={[styles.preview, styles.permissionView]}>
                  <Ionicons name="camera" size={48} color="#ccc" />
                  <Text style={styles.permissionText}>需要相机权限</Text>
                  <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
                    <Text style={styles.buttonText}>授予权限</Text>
                  </TouchableOpacity>
                </View>
              )
            )}

            {colorInjection && (
              <View style={styles.colorOverlay} pointerEvents="none">
                <View style={[styles.colorBar, { backgroundColor: 'rgba(255, 0, 0, 0.2)' }]} />
                <View style={[styles.colorBar, { backgroundColor: 'rgba(0, 255, 0, 0.2)' }]} />
                <View style={[styles.colorBar, { backgroundColor: 'rgba(0, 0, 255, 0.2)' }]} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>功能控制</Text>

          {[
            { icon: 'layers-outline', label: '悬浮窗口', value: floatingWindow, set: setFloatingWindow },
            { icon: 'crop-outline', label: '画面纠正', value: imageCorrection, set: setImageCorrection },
            { icon: 'repeat-outline', label: '循环播放', value: loopPlayback, set: setLoopPlayback },
            { icon: 'color-palette-outline', label: '三色注入', value: colorInjection, set: setColorInjection },
          ].map((item, i) => (
            <View key={i} style={styles.switchItem}>
              <View style={styles.switchLeft}>
                <Ionicons name={item.icon as any} size={20} color="#666" />
                <Text style={styles.switchLabel}>{item.label}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.set}
                trackColor={{ false: '#E5E5E5', true: '#34C759' }}
                thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
              />
            </View>
          ))}

          {colorInjection && (
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[styles.modeButton, injectionMode === 1 && styles.modeButtonActive]}
                onPress={() => setInjectionMode(1)}
              >
                <Text style={[styles.modeButtonText, injectionMode === 1 && styles.modeButtonTextActive]}>模式1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, injectionMode === 2 && styles.modeButtonActive]}
                onPress={() => setInjectionMode(2)}
              >
                <Text style={[styles.modeButtonText, injectionMode === 2 && styles.modeButtonTextActive]}>模式2</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.resolutionContainer}>
            <Ionicons name="expand-outline" size={20} color="#666" />
            <Text style={styles.resolutionText}>图像分辨率: {resolution}</Text>
          </View>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 50, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#000', marginLeft: 8 },
  content: { flex: 1 },
  section: { backgroundColor: '#fff', marginTop: 12, paddingHorizontal: 16, paddingVertical: 16 },
  fileInfoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', padding: 12, borderRadius: 8, marginBottom: 12 },
  fileInfoText: { flex: 1, fontSize: 14, color: '#666', marginLeft: 8 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, gap: 6 },
  buttonSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#007AFF' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  buttonTextSecondary: { color: '#007AFF' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  toggleButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggleText: { fontSize: 14, color: '#007AFF' },
  previewContainer: { width: '100%', height: PREVIEW_HEIGHT, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', position: 'relative' },
  preview: { width: '100%', height: '100%' },
  permissionView: { backgroundColor: '#F8F8F8', alignItems: 'center', justifyContent: 'center' },
  permissionText: { fontSize: 14, color: '#999', marginTop: 12, marginBottom: 16 },
  permissionButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6 },
  colorOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  colorBar: { flex: 1 },
  switchItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel: { fontSize: 15, color: '#000' },
  modeSelector: { flexDirection: 'row', gap: 12, marginTop: 12 },
  modeButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, backgroundColor: '#F0F0F0', alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#007AFF' },
  modeButtonText: { fontSize: 14, color: '#666', fontWeight: '500' },
  modeButtonTextActive: { color: '#fff' },
  resolutionContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resolutionText: { fontSize: 15, color: '#000' },
});
