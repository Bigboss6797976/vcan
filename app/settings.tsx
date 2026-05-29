import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function SettingsScreen() {
  const [storageUsed, setStorageUsed] = useState('0 KB');
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => { calculateStorageUsage(); }, []);

  const calculateStorageUsage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      setVideoCount(keys.filter(k => k.includes('video')).length);
      const allData = await AsyncStorage.multiGet(keys);
      const totalSize = allData.reduce((acc, [, v]) => acc + (v ? new Blob([v]).size : 0), 0);
      if (totalSize < 1024) setStorageUsed(`${totalSize} B`);
      else if (totalSize < 1024 * 1024) setStorageUsed(`${(totalSize / 1024).toFixed(2)} KB`);
      else setStorageUsed(`${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    } catch (e) { console.error('计算存储使用失败:', e); }
  };

  const clearAllData = () => {
    Alert.alert('清除所有数据', '这将删除所有已保存的视频和设置，确定要继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除', style: 'destructive',
        onPress: async () => {
          try { await AsyncStorage.clear(); setStorageUsed('0 KB'); setVideoCount(0); Alert.alert('成功', '所有数据已清除'); }
          catch (e) { Alert.alert('错误', '清除数据失败'); }
        },
      },
    ]);
  };

  const openHelp = () => {
    Alert.alert('使用帮助',
      '1. 点击"选择视频"导入MP4文件\n' +
      '2. 启用功能开关来激活相应特性\n' +
      '3. 三色注入用于活体检测对抗\n' +
      '4. 在控制页面可调整图像参数\n' +
      '5. 点击"还原相机"恢复真实摄像头',
      [{ text: '知道了' }]
    );
  };

  const about = () => {
    Alert.alert('关于应用',
      '相机替换工具\n版本: 1.0.0\n\n用于替换系统摄像头画面的专业工具。',
      [{ text: '确定' }]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, danger = false }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          <Ionicons name={icon} size={22} color={danger ? '#FF3B30' : '#007AFF'} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Ionicons name="settings" size={28} color="#007AFF" />
        <Text style={styles.headerTitle}>设置</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}><Text style={styles.sectionTitle}>存储信息</Text></View>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>已用存储</Text>
            <Text style={styles.infoValue}>{storageUsed}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>视频文件</Text>
            <Text style={styles.infoValue}>{videoCount} 个</Text>
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>数据管理</Text></View>
        <View style={styles.section}>
          <SettingItem icon="download-outline" title="导出设置" subtitle="备份当前配置" onPress={() => Alert.alert('提示', '功能开发中...')} />
          <SettingItem icon="trash-outline" title="清除所有数据" subtitle="删除所有视频和设置" onPress={clearAllData} danger />
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>关于</Text></View>
        <View style={styles.section}>
          <SettingItem icon="help-circle-outline" title="使用帮助" subtitle="查看使用说明" onPress={openHelp} />
          <SettingItem icon="information-circle-outline" title="关于应用" subtitle="版本 1.0.0" onPress={about} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>相机替换工具</Text>
          <Text style={styles.footerSubtext}>专业相机画面替换解决方案</Text>
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
  section: { backgroundColor: '#fff', marginTop: 12, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#666', textTransform: 'uppercase', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#F5F5F5', marginHorizontal: -16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: 15, color: '#000' },
  infoValue: { fontSize: 15, color: '#666', fontWeight: '500' },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F4FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconContainerDanger: { backgroundColor: '#FFE5E5' },
  settingTextContainer: { flex: 1 },
  settingTitle: { fontSize: 15, color: '#000', fontWeight: '500' },
  settingTitleDanger: { color: '#FF3B30' },
  settingSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  footer: { alignItems: 'center', paddingVertical: 32 },
  footerText: { fontSize: 15, fontWeight: '600', color: '#000' },
  footerSubtext: { fontSize: 13, color: '#666', marginTop: 4 },
});
