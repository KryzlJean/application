import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const SettingsScreen = ({ 
  isVisible, 
  onClose,
  authToken,
  currentUser,
  syncStatus,
  lastSyncTime,
  onManualSync,
  onLogout
}) => {
  const [serverUrl, setServerUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [cameraWebSocketUrl, setCameraWebSocketUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [frameData, setFrameData] = useState(null);
  
  // Load saved server URL on component mount
  useEffect(() => {
    const loadServerUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem('serverURL');
        if (savedUrl) {
          setServerUrl(savedUrl);
        }
      } catch (error) {
        console.error('Error loading server URL:', error);
      }
    };
    
    if (isVisible) {
      loadServerUrl();
    }
  }, [isVisible]);
  
  // Save server URL
  const handleSaveServerUrl = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Server URL cannot be empty');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Validate URL format
      if (!serverUrl.startsWith('http')) {
        Alert.alert('Error', 'Server URL must start with http:// or https://');
        return;
      }
      
      // Remove trailing slash if present
      const normalizedUrl = serverUrl.endsWith('/') 
        ? serverUrl.slice(0, -1) 
        : serverUrl;
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('serverURL', normalizedUrl);
      
      Alert.alert(
        'Settings Saved', 
        'Server URL has been updated. Please restart the app for changes to take effect.'
      );
      
      // Close settings
      onClose();
    } catch (error) {
      console.error('Error saving server URL:', error);
      Alert.alert('Error', 'Failed to save settings: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Connect to camera WebSocket
  const handleConnectCamera = () => {
    if (!cameraWebSocketUrl.trim()) {
      Alert.alert('Error', 'Camera server URL cannot be empty');
      return;
    }

    setIsConnecting(true);
    setPreviewError(null);

    try {
      // Format the URL properly for WebView
      let formattedURL = cameraWebSocketUrl;
      if (!formattedURL.startsWith('http://') && !formattedURL.startsWith('https://')) {
        formattedURL = `http://${formattedURL}`;
      }
      
      setCameraWebSocketUrl(formattedURL);
      setShowCameraPreview(true);
    } catch (error) {
      console.error('Error connecting to camera:', error);
      setPreviewError('Failed to connect to camera server');
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Simple HTML for camera preview
  const getCameraPreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background-color: #000; 
            width: 100%; 
            height: 100%; 
            overflow: hidden;
          }
          #videoElement {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          #status {
            position: absolute;
            bottom: 10px;
            left: 10px;
            color: white;
            background: rgba(0,0,0,0.5);
            padding: 5px;
            border-radius: 5px;
            font-family: Arial;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <img id="videoElement" src="" alt="Camera Stream">
        <div id="status">Connecting...</div>
        
        <script>
          const videoElement = document.getElementById('videoElement');
          const statusElement = document.getElementById('status');
          let frameCount = 0;
          let lastTime = Date.now();
          let fps = 0;
          
          // Connect to WebSocket server
          const socket = new WebSocket('${cameraWebSocketUrl.replace('http://', 'ws://').replace('https://', 'wss://')}' + (${cameraWebSocketUrl.includes('/ws')} ? '' : '/ws'));
          
          socket.onopen = function() {
            statusElement.textContent = 'Connected';
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'connection', status: 'connected'}));
          };
          
          socket.onmessage = function(event) {
            try {
              const message = JSON.parse(event.data);
              
              if (message.type === 'config') {
                statusElement.textContent = 'Stream ready: ' + message.width + 'x' + message.height;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'config',
                  width: message.width,
                  height: message.height,
                  fps: message.fps
                }));
              }
              else if (message.type === 'video') {
                videoElement.src = 'data:image/jpeg;base64,' + message.data;
                
                // Calculate FPS
                frameCount++;
                const now = Date.now();
                if (now - lastTime >= 1000) {
                  fps = frameCount / ((now - lastTime) / 1000);
                  statusElement.textContent = 'FPS: ' + fps.toFixed(1);
                  frameCount = 0;
                  lastTime = now;
                  
                  // Send frame data to React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'frame', 
                    data: message.data,
                    fps: fps
                  }));
                }
              }
            } catch (e) {
              console.error('Error processing message:', e);
              statusElement.textContent = 'Error: ' + e.message;
            }
          };
          
          socket.onerror = function(error) {
            statusElement.textContent = 'Connection error';
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', message: 'Connection error'}));
          };
          
          socket.onclose = function() {
            statusElement.textContent = 'Connection closed';
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'connection', status: 'closed'}));
          };
        </script>
      </body>
      </html>
    `;
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'connection') {
        setIsConnecting(message.status !== 'connected');
      } 
      else if (message.type === 'frame') {
        setFrameData(message.data);
      }
      else if (message.type === 'error') {
        setPreviewError(message.message);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <BlurView style={styles.settingsContainer} intensity={100} tint="dark">
      <View style={styles.settingsContent}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* Account Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          {currentUser ? (
            <View>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{currentUser.username}</Text>
              
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{currentUser.email}</Text>
              
              <Text style={styles.infoLabel}>Cameras</Text>
              <Text style={styles.infoValue}>{currentUser.cameraCount || 0}</Text>
              
              <View style={styles.syncInfo}>
                <Text style={styles.infoLabel}>Sync Status</Text>
                <View style={[
                  styles.syncStatusBadge, 
                  { backgroundColor: syncStatus === 'synced' ? '#4caf50' : 
                                    syncStatus === 'syncing' ? '#ff9800' : '#f44336' }
                ]}>
                  <Text style={styles.syncStatusText}>
                    {syncStatus === 'synced' ? 'Synced' : 
                     syncStatus === 'syncing' ? 'Syncing...' : 'Error'}
                  </Text>
                </View>
              </View>
              
              {lastSyncTime && (
                <View>
                  <Text style={styles.infoLabel}>Last Synced</Text>
                  <Text style={styles.infoValue}>
                    {new Date(lastSyncTime).toLocaleString()}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.syncButton} 
                onPress={onManualSync}
                disabled={syncStatus === 'syncing'}
              >
                <Ionicons name="sync" size={18} color="#fff" />
                <Text style={styles.buttonText}>Sync Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={onLogout}
              >
                <Ionicons name="log-out" size={18} color="#fff" />
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.notLoggedIn}>Not logged in</Text>
          )}
        </View>
        
        {/* Server Configuration Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Server Configuration</Text>
          
          <Text style={styles.infoLabel}>Server URL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.serverUrlInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://your-server.com"
              placeholderTextColor="#999"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSaveServerUrl}
            disabled={isSaving}
          >
            <Ionicons name="save" size={18} color="#fff" />
            <Text style={styles.buttonText}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Camera Server Integration */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Camera Server Integration</Text>
          
          <Text style={styles.infoLabel}>Camera Server URL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.serverUrlInput}
              value={cameraWebSocketUrl}
              onChangeText={setCameraWebSocketUrl}
              placeholder="192.168.1.100:8000"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={styles.connectButton} 
            onPress={handleConnectCamera}
            disabled={isConnecting}
          >
            <Ionicons name="videocam" size={18} color="#fff" />
            <Text style={styles.buttonText}>
              {isConnecting ? 'Connecting...' : 'Connect to Camera Server'}
            </Text>
          </TouchableOpacity>

          {previewError && (
            <Text style={styles.errorText}>{previewError}</Text>
          )}

          {showCameraPreview && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Camera Preview:</Text>
              
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4285f4" />
                  <Text style={styles.loadingText}>Connecting to camera...</Text>
                </View>
              ) : (
                <View style={styles.webViewContainer}>
                  <WebView
                    source={{ html: getCameraPreviewHTML() }}
                    style={styles.webView}
                    onMessage={handleWebViewMessage}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4285f4" />
                      </View>
                    )}
                  />
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* App Info Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  settingsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  settingsContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: '#4285f4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginTop: 15,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginTop: 15,
  },
  connectButton: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginTop: 5,
  },
  serverUrlInput: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  notLoggedIn: {
    fontStyle: 'italic',
    color: '#999',
  },
  previewContainer: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  webViewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorText: {
    color: '#f44336',
    marginTop: 10,
    fontStyle: 'italic',
  }
});

export default SettingsScreen; 