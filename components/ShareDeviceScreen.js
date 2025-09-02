import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const ShareDeviceScreen = ({ onBack }) => {
  const [cameraLocation, setCameraLocation] = useState('');
  const [sharedUsers, setSharedUsers] = useState([
    { id: '1', email: 'Rei***as@gmail.com', label: 'Registered User' }
  ]);
  const [requests, setRequests] = useState([
    { id: '2', email: 'Rei***as', label: 'Registered user' }
  ]);

  const handleAccept = (req) => {
    setSharedUsers([...sharedUsers, { id: req.id, email: req.email, label: 'Registered User' }]);
    setRequests(requests.filter(r => r.id !== req.id));
  };

  const handleReject = (req) => {
    setRequests(requests.filter(r => r.id !== req.id));
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share the device</Text>
          <View style={{ width: 26 }} />
        </View>
      </BlurView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.inputRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="play" size={14} color="#0b0b0b" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter Camera Location"
            placeholderTextColor="#cbd5e1"
            value={cameraLocation}
            onChangeText={setCameraLocation}
          />
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {sharedUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={20} color="#0b0b0b" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userLabel}>{user.label}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add new sharing</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeading}>Requesting devices:</Text>

        {requests.map(req => (
          <View key={req.id} style={styles.requestRow}>
            <View style={styles.requestCard}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={18} color="#0b0b0b" />
              </View>
              <View style={styles.requestInfo}>
                <Text style={styles.requestEmail}>{req.email}</Text>
                <Text style={styles.requestLabel}>{req.label}</Text>
              </View>
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity onPress={() => handleAccept(req)} style={styles.acceptBtn}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReject(req)} style={styles.rejectBtn}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220'
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 10,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 35
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700'
  },
  content: {
    flex: 1,
    paddingTop: 110,
    paddingHorizontal: 16
  },
  contentContainer: {
    paddingBottom: 120
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  input: {
    flex: 1,
    color: '#e6e9ef',
    fontSize: 13
  },
  menuButton: {
    padding: 6
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,149,255,0.5)',
    padding: 12,
    marginBottom: 16
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  userInfo: {
    flex: 1
  },
  userEmail: {
    color: '#e6e9ef',
    fontWeight: '700'
  },
  userLabel: {
    color: '#9aa5b1',
    fontSize: 12
  },
  primaryButton: {
    backgroundColor: '#4B6BFB',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    minWidth: 220,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  sectionHeading: {
    color: '#e6e9ef',
    marginBottom: 10,
    fontWeight: '700'
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginRight: 10
  },
  requestInfo: {
    marginLeft: 10
  },
  requestEmail: {
    color: '#e6e9ef',
    fontWeight: '700'
  },
  requestLabel: {
    color: '#9aa5b1',
    fontSize: 12
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  acceptBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  rejectBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default ShareDeviceScreen;
