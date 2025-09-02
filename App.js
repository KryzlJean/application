import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Alert, 
  Dimensions, 
  Animated
} from 'react-native';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ConnectionForm from './components/ConnectionForm';
import CameraView from './components/CameraView';
import WifiSetupModal from './components/WifiSetupModal';
import ProfileScreen from './components/ProfileScreen';
import NotificationsScreen from './components/NotificationsScreen';
import DashboardContainer from './components/DashboardContainer';
import ShareDeviceScreen from './components/ShareDeviceScreen';
import NetworkService from './components/NetworkService';
import CameraService from './components/CameraService';
import AuthService from './components/AuthService';
import NavigationBar from './components/NavigationBar';
import * as Network from 'expo-network';

const { width } = Dimensions.get('window');

const App = () => {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [showNotificationsScreen, setShowNotificationsScreen] = useState(false);
  const [showShareDevice, setShowShareDevice] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [serverURL, setServerURL] = useState(NetworkService.DEFAULT_SERVER_URL);
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [cameraLocation, setCameraLocation] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [previewFrames, setPreviewFrames] = useState({});
  const [users, setUsers] = useState([]);

  // Animation refs
  const profileScrollAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const webViewRef = useRef(null);
  const frameQueue = useRef([]);
  const lastFrameTime = useRef(0);
  const frameProcessorTimeout = useRef(null);

  // Test server connectivity and find best server URL
  const testServerConnectivity = async (url) => {
    const isConnected = await NetworkService.testServerConnectivity(url);
    setNetworkStatus(isConnected ? 'connected' : 'disconnected');
    return isConnected;
  };

  // Test server connectivity on app start
  useEffect(() => {
    const testServerOnStart = async () => {
      try {
        const workingUrl = await NetworkService.testServerOnStart();
        
        if (workingUrl) {
          setServerURL(workingUrl);
      } else {
          console.error('❌ No working server found');
          setNetworkStatus('disconnected');
          Alert.alert(
            'Network Error',
            'Cannot connect to the server. Please check your network connection and try again.',
            [
              { text: 'OK' },
              { 
                text: 'Retry', 
                onPress: () => testServerOnStart()
              }
            ]
          );
          }
        } catch (error) {
        console.error('Failed to test server:', error);
        setNetworkStatus('disconnected');
      }
    };
    
    testServerOnStart();
}, []);

  // Load preview frames when cameras change
useEffect(() => {
  const loadPreviews = async () => {
    if (currentUser?.cameras) {
        const frames = await CameraService.loadPreviews(currentUser.cameras);
      setPreviewFrames(frames);
    }
  };

  loadPreviews();
  }, [currentUser?.cameras]);

  // Handle login
  const handleLogin = async (username, password) => {
    const result = await AuthService.handleLogin(username, password, serverURL);

      if (result.success) {
      setCurrentUser(result.user);
        return true;
      } else {
      if (result.error) {
        let message = result.message;
        
        Alert.alert('Network Error', message, [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Retry', 
            onPress: () => {
              testServerConnectivity(serverURL);
            }
          }
        ]);
      } else {
        Alert.alert('Login Failed', result.message);
      }
      return false;
    }
  };

  // Handle registration
  const handleRegister = async (newUser) => {
    const result = await AuthService.handleRegister(newUser, serverURL);

      if (result.success) {
      Alert.alert('Success', result.message);
        setShowLogin(true);
        return true;
      } else {
      if (result.error) {
        let message = result.message;
        
        Alert.alert('Network Error', message, [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Retry', 
            onPress: () => {
              testServerConnectivity(serverURL);
            }
          }
        ]);
      } else {
        Alert.alert('Registration Failed', result.message);
      }
      return false;
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedCamera(null);
    setSelectedCameras([]);
    setIsSelectionMode(false);
    setPreviewFrames({});
  };

  // Handle switching to the registration form
  const handleSwitchToRegister = () => {
    setShowLogin(false);
  };

  // Handle switching to the login form
  const handleSwitchToLogin = () => {
    setShowLogin(true);
  };

  // Handle adding a new camera
const handleAddCamera = async (newCamera) => {
  try {
    const currentCameras = currentUser.cameras || [];
    
    // Check initial camera status
      const initialStatus = await CameraService.checkCameraStatus(newCamera);
    const cameraWithStatus = {
      ...newCamera,
      status: initialStatus
    };

    // Create updated user object with new camera
    const updatedUser = {
      ...currentUser,
      cameras: [...currentCameras, cameraWithStatus],
    };

    // Update current user state
    setCurrentUser(updatedUser);

    // Update users array with new camera
    const updatedUsers = users.map((user) =>
      user.username === currentUser.username ? updatedUser : user
    );
    
    setUsers(updatedUsers);
    
    // Close add camera form
    setShowAddCamera(false);

    // Fetch preview frame for the new camera
    try {
        const frame = await CameraService.fetchPreviewFrame(cameraWithStatus);
      if (frame) {
        setPreviewFrames(prev => ({
          ...prev,
          [cameraWithStatus.ip]: frame
        }));
      }
    } catch (error) {
      console.error('Error fetching preview frame:', error);
    }

  } catch (error) {
    console.error('Error adding camera:', error);
    Alert.alert('Error', 'Failed to save camera. Please try again.');
  }
};

  // Handle selecting/deselecting a camera
  const handleSelectCamera = (camera) => {
    if (isSelectionMode) {
      if (selectedCameras.includes(camera)) {
        setSelectedCameras(selectedCameras.filter((cam) => cam.ip !== camera.ip));
      } else {
        setSelectedCameras([...selectedCameras, camera]);
      }
    } else {
      setSelectedCamera(camera);
    }
  };

  // Handle long press on camera
  const handleLongPressCamera = (camera) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedCameras([camera]);
    }
  };

  // Handle removing selected cameras
  const handleRemoveSelectedCameras = () => {
    Alert.alert(
      'Remove Cameras',
      `Are you sure you want to remove ${selectedCameras.length} camera(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedUser = {
              ...currentUser,
              cameras: currentUser.cameras.filter(
                camera => !selectedCameras.some(selected => selected.ip === camera.ip)
              )
            };
            setCurrentUser(updatedUser);
            setSelectedCameras([]);
            setIsSelectionMode(false);
          },
        },
      ]
    );
  };

  // Handle viewable items changed
  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (currentUser?.cameras) {
        const updatedCameras = await CameraService.refreshCameraStatuses(currentUser.cameras);
        const updatedUser = { ...currentUser, cameras: updatedCameras };
        setCurrentUser(updatedUser);
        
        // Update users array
        const updatedUsers = users.map((user) =>
          user.username === currentUser.username ? updatedUser : user
        );
        setUsers(updatedUsers);
        }
      } catch (error) {
      console.error('Error refreshing cameras:', error);
    } finally {
      setRefreshing(false);
    }
  }, [currentUser, users]);

  // Handle notification press
  const handleNotificationPress = () => {
    setShowNotificationsScreen(true);
  };

  // Handle close notifications
  const handleCloseNotifications = () => {
    setShowNotificationsScreen(false);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'add') {
      setShowAddCamera(true);
    }
  };

  // Handle WiFi setup
  const handleWifiSetup = (wifiConfig) => {
    console.log('WiFi configuration saved:', wifiConfig);
    Alert.alert('Success', 'WiFi configuration saved successfully!');
  };

  // Handle open share device
  const handleOpenShareDevice = () => setShowShareDevice(true);
  const handleCloseShareDevice = () => setShowShareDevice(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {!currentUser ? (
        showLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={handleSwitchToRegister}
            users={users}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={handleSwitchToLogin}
            users={users}
          />
        )
      ) : showNotificationsScreen ? (
          <NotificationsScreen onClose={handleCloseNotifications} />
        ) : showShareDevice ? (
          <ShareDeviceScreen onBack={handleCloseShareDevice} />
      ) : selectedCamera ? (
        <CameraView
          cameraName={selectedCamera.name}
          videoConfig={null}
          handleDisconnect={() => setSelectedCamera(null)}
          webViewRef={webViewRef}
          webViewHTML=""
          frameRate={30}
          setFrameRate={() => {}}
          handleLogout={handleLogout}
          camera={selectedCamera}
        />
      ) : activeTab === 'add' ? (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <ConnectionForm
            visible={true}
            onClose={() => setActiveTab('home')}
            onConnect={handleAddCamera}
          />
          <NavigationBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isSelectionMode={false}
            selectedCameras={[]}
            onRemoveSelected={() => {}}
          />
                  </View>
            ) : activeTab === 'wifi' ? (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <WifiSetupModal
            onClose={() => setActiveTab('home')}
            onSave={handleWifiSetup}
            currentUser={currentUser}
            serverURL={serverURL}
          />
          <NavigationBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isSelectionMode={false}
            selectedCameras={[]}
            onRemoveSelected={() => {}}
          />
                  </View>
      ) : activeTab === 'profile' ? (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
              <Animated.View 
            style={{
              flex: 1,
                    transform: [{
                translateY: profileScrollAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, -20],
                  extrapolate: 'clamp'
                })
              }],
              opacity: profileScrollAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0.8],
                extrapolate: 'clamp'
              })
            }}
          >
            <ProfileScreen 
              currentUser={currentUser}
              onLogout={handleLogout}
              onShareDevice={handleOpenShareDevice}
              onClose={() => setActiveTab('home')}
              onScroll={(event) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                profileScrollAnim.setValue(offsetY);
              }}
                  />
                </Animated.View>
          <NavigationBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isSelectionMode={false}
            selectedCameras={[]}
            onRemoveSelected={() => {}}
          />
                </View>
              ) : (
        <DashboardContainer
          currentUser={currentUser}
          cameraLocation={cameraLocation}
          networkStatus={networkStatus}
          serverURL={serverURL}
          notificationCount={notificationCount}
          cameras={currentUser.cameras || []}
          previewFrames={previewFrames}
          isSelectionMode={isSelectionMode}
          selectedCameras={selectedCameras}
          activeIndex={activeIndex}
          activeTab={activeTab}
          refreshing={refreshing}
          onNetworkPress={async () => {
            setNetworkStatus('checking');
            
            let workingUrl = null;
            for (const url of NetworkService.SERVER_URL_OPTIONS) {
              if (await testServerConnectivity(url)) {
                workingUrl = url;
                break;
              }
            }
            
            if (workingUrl) {
              setServerURL(workingUrl);
              Alert.alert('Success', `Connected to server: ${workingUrl}`);
            } else {
              setNetworkStatus('disconnected');
              Alert.alert('Error', 'No working server found. Please check your network connection.');
            }
          }}
          onNotificationPress={handleNotificationPress}
          onLongPressNetwork={() => {
            Alert.alert(
              'Server Information',
              `Current Server: ${serverURL}\nNetwork Status: ${networkStatus}\n\nTap to refresh connection\nLong press to show this info`,
              [{ text: 'OK' }]
            );
          }}
          onSelectCamera={handleSelectCamera}
          onLongPressCamera={handleLongPressCamera}
          onViewableItemsChanged={handleViewableItemsChanged}
          onRefresh={onRefresh}
          onTabChange={handleTabChange}
          onRemoveSelected={handleRemoveSelectedCameras}
        />
      )}

      {/* Modals */}

            <ConnectionForm
        visible={showAddCamera}
        onClose={() => setShowAddCamera(false)}
        onConnect={handleAddCamera}
      />

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
   },
});

export default App;