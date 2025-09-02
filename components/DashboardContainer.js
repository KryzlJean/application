import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './Header';
import CameraList from './CameraList';
import NavigationBar from './NavigationBar';
import ProfileScreen from './ProfileScreen';

const DashboardContainer = ({
  currentUser,
  cameraLocation,
  networkStatus,
  serverURL,
  notificationCount,
  cameras,
  previewFrames,
  isSelectionMode,
  selectedCameras,
  activeIndex,
  activeTab,
  refreshing,
  onNetworkPress,
  onNotificationPress,
  onLongPressNetwork,
  onSelectCamera,
  onLongPressCamera,
  onViewableItemsChanged,
  onRefresh,
  onTabChange,
  onRemoveSelected
}) => {
  return (
    <View style={styles.dashboardContainer}>
      {/* Header */}
      <Header
        currentUser={currentUser}
        cameraLocation={cameraLocation}
        networkStatus={networkStatus}
        serverURL={serverURL}
        notificationCount={notificationCount}
        onNetworkPress={onNetworkPress || (() => {})}
        onNotificationPress={onNotificationPress || (() => {})}
        onLongPressNetwork={onLongPressNetwork || (() => {})}
      />

      {/* Camera Section */}
      <View style={styles.cameraSection}>
        <CameraList
          cameras={cameras || []}
          previewFrames={previewFrames || {}}
          isSelectionMode={!!isSelectionMode}
          selectedCameras={selectedCameras || []}
          activeIndex={activeIndex || 0}
          onSelectCamera={onSelectCamera || (() => {})}
          onLongPressCamera={onLongPressCamera || (() => {})}
          onViewableItemsChanged={onViewableItemsChanged || (() => {})}
          onRefresh={onRefresh || (() => {})}
          refreshing={!!refreshing}
        />
      </View>

      {/* Navigation Bar */}
      <NavigationBar
        activeTab={activeTab || 'home'}
        onTabChange={onTabChange || (() => {})}
        isSelectionMode={!!isSelectionMode}
        selectedCameras={selectedCameras || []}
        onRemoveSelected={onRemoveSelected || (() => {})}
      />
      
      
    </View>

    

   
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraSection: {
    flex: 1,
    marginTop: 120, // Account for header height
    marginBottom: 100, // Account for navigation bar height
  },
});

export default DashboardContainer;
