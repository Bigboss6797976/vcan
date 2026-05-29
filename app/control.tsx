import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

interface ControlSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  playbackSpeed: number;
}

export default function ControlScreen() {
  const [settings, setSettings] = useState<ControlSettings>({
    brightness: 100, contrast: 100, saturation: 100, playbackSpeed: 1.0,
  });

  useEffect(() => { loadControlSettings(); }, []);

  const loadControlSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('controlSettings');
      if (saved) setSettings(JSON.parse(saved));
    } catch (e) { console.error('加载控制设置失败:', e); }
  };

  const saveControlSettings = async (newSettings: ControlSettings) => {
    try {
      await AsyncStorage.setItem('controlSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (e) { console.error('保存控制设置失败:', e); }
  };

  const updateSetting = (key: keyof ControlSettings, value: number) => {
    saveControlSettings({ ...settings, [key]: value });
  };

  const resetSettings = () => {
    Alert.alert('重置设置', '确定要重置所有控制参数吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '重置', style: 'destructive',
        onPress: () => {
          saveControlSettings({ brightness: 100, contrast: 100, saturation: 100, playbackSpeed: 1.0 });
          Alert.alert('成功', '控制参数已重置');
        },
      },
    ]);
  };

  const renderSlider = (
    title: string, icon: string, key: keyof ControlSettings,
    min: number, max: number, step: number, unit: string
  ) => {
    const value = settings[key];
    const percentage = ((value - min) / (max - min)) * 100;
    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderHeader}>
          <View style={styles.sliderTitleRow}>
            <Ionicons name={icon as any} size={20} color="#666" />
            <Text style={styles.sliderTitle}>{title}</Text>
          </View>
          <Text style={styles.sliderValue}>{value}{unit}</Text>
        </View>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
          <View style={[styles.sliderThumb, { left: `${percentage}%` }]} />
        </View>
        <View style={styles.sliderControls}>
          <TouchableOpacity style={styles.sliderButton} onPress={() => updateSetting(key, Math.max(min, value - step))}>
            <Ionicons name="remove" size={20} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.sliderButtons}>
            <TouchableOpacity style={styles.quickButton} onPress={() => updateSetting(key, min)}>
              <Text style={styles.quickButtonText}>最小</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickButton} onPress={() => updateSetting(key, (min + max) / 2)}>
              <Text style={styles.quickButtonText}>默认</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickButton} onPress={() => updateSetting(key, max)}>
              <Text style={styles.quickButtonText}>最大</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sliderButton} onPress={() => updateSetting(key, Math.min(max, value + step))}>
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Ionicons name="options" size={28} color="#007AFF" />
        <Text style={styles.headerTitle}>高级控制</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>图像调整</Text>
          <Text style={styles.sectionDescription}>调整视频播放的视觉效果参数</Text>
        </View>
        <View style={styles.section}>{renderSlider('亮度', 'sunny-outline', 'brightness', 0, 200, 5, '%')}</View>
        <View style={styles.section}>{renderSlider('对比度', 'contrast-outline', 'contrast', 0, 200, 5, '%')}</View>
        <View style={styles.section}>{renderSlider('饱和度', 'color-palette-outline', 'saturation', 0, 200, 5, '%')}</View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放控制</Text>
          <Text style={styles.sectionDescription}>调整视频播放速度</Text>
        </View>
        <View style={styles.section}>{renderSlider('播放速度', 'speedometer-outline', 'playbackSpeed', 0.25, 2.0, 0.25, 'x')}</View>
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Ionicons name="refresh" size={20} color="#FF3B30" />
            <Text style={styles.resetButtonText}>重置所有设置</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.infoText}>这些设置会实时应用到视频播放中。重置后将恢复默认值。</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  sectionDescription: { fontSize: 13, color: '#666' },
  sliderContainer: { width: '100%' },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sliderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderTitle: { fontSize: 15, fontWeight: '500', color: '#000' },
  sliderValue: { fontSize: 15, fontWeight: '600', color: '#007AFF' },
  sliderTrack: { height: 4, backgroundColor: '#E5E5E5', borderRadius: 2, position: 'relative', marginBottom: 16 },
  sliderFill: { height: '100%', backgroundColor: '#007AFF', borderRadius: 2 },
  sliderThumb: { position: 'absolute', top: -6, width: 16, height: 16, backgroundColor: '#007AFF', borderRadius: 8, marginLeft: -8, borderWidth: 2, borderColor: '#fff' },
  sliderControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sliderButton: { width: 36, height: 36, backgroundColor: '#F0F0F0', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sliderButtons: { flex: 1, flexDirection: 'row', gap: 8 },
  quickButton: { flex: 1, paddingVertical: 8, backgroundColor: '#F0F0F0', borderRadius: 6, alignItems: 'center' },
  quickButtonText: { fontSize: 13, color: '#007AFF', fontWeight: '500' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: '#FFE5E5', borderRadius: 8 },
  resetButtonText: { fontSize: 15, fontWeight: '600', color: '#FF3B30' },
  infoBox: { flexDirection: 'row', backgroundColor: '#E8F4FF', marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 8, gap: 8 },
  infoText: { flex: 1, fontSize: 13, color: '#007AFF', lineHeight: 18 },
});
