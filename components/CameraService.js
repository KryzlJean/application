class CameraService {
  // Check camera status
  static async checkCameraStatus(camera) {
    try {
      // Format IP properly for WebSocket URL
      let formattedIP = camera.ip;
      
      // If it doesn't start with ws://, add it
      if (!formattedIP.startsWith('ws://')) {
        formattedIP = `ws://${formattedIP}`;
      }
      
      // Make sure the path ends with /ws if not already present
      if (!formattedIP.endsWith('/ws')) {
        if (formattedIP.includes('/') && !formattedIP.endsWith('/')) {
          formattedIP = `${formattedIP}/ws`;
        } else {
          formattedIP = `${formattedIP}/ws`;
        }
      }
      
      console.log('🔍 Attempting WebSocket connection to:', formattedIP);
      
      const ws = new WebSocket(formattedIP);
      
      return new Promise((resolve, reject) => {
        let statusReceived = false;
        
        ws.onopen = () => {
          console.log('Status WebSocket opened for:', camera.name);
          ws.send(JSON.stringify({ command: 'getStatus' }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'status' && !statusReceived) {
              statusReceived = true;
              ws.close();
              resolve(message.status || 'Online');
            }
          } catch (error) {
            console.error('Status parse error:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('❌ Status WebSocket error for', camera.name, ':', error.message || error);
          reject(new Error(`Camera ${camera.name} unreachable: ${error.message || 'Connection failed'}`));
        };

        // Timeout after 3 seconds
        setTimeout(() => {
          if (!statusReceived) {
            ws.close();
            reject(new Error(`Camera ${camera.name} timeout: No response in 3 seconds`));
          }
        }, 3000);
      });
    } catch (error) {
      console.error('Failed to check camera status:', error);
      return 'Offline';
    }
  }

  // Fetch preview frame
  static async fetchPreviewFrame(camera) {
    if (camera.status !== 'Online') return null;
    
    try {
      // Format IP properly for WebSocket URL
      let formattedIP = camera.ip;
      
      // If it doesn't start with ws://, add it
      if (!formattedIP.startsWith('ws://')) {
        formattedIP = `ws://${formattedIP}`;
      }
      
      // Make sure the path ends with /ws if not already present
      if (!formattedIP.endsWith('/ws')) {
        if (formattedIP.includes('/') && !formattedIP.endsWith('/')) {
          formattedIP = `${formattedIP}/ws`;
        } else {
          formattedIP = `${formattedIP}/ws`;
        }
      }
      
      const ws = new WebSocket(formattedIP);
      
      return new Promise((resolve, reject) => {
        let frameReceived = false;
        
        ws.onopen = () => {
          console.log('Preview WebSocket opened for:', camera.name);
          ws.send(JSON.stringify({ command: 'getFrame' }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'video' && !frameReceived) {
              frameReceived = true;
              ws.close();
              resolve(message.data);
            }
          } catch (error) {
            console.error('Preview frame parse error:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('Preview WebSocket error:', error);
          reject(error);
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!frameReceived) {
            ws.close();
            reject(new Error('Preview frame timeout'));
          }
        }, 5000);
      });
    } catch (error) {
      console.error('Failed to fetch preview frame:', error);
      return null;
    }
  }

  // Refresh all camera statuses
  static async refreshCameraStatuses(cameras) {
    const updatedCameras = [];
    
    for (const camera of cameras) {
      try {
        const status = await this.checkCameraStatus(camera);
        updatedCameras.push({ ...camera, status });
      } catch (error) {
        console.error(`Failed to refresh status for ${camera.name}:`, error);
        updatedCameras.push({ ...camera, status: 'Offline' });
      }
    }
    
    return updatedCameras;
  }

  // Load preview frames for all cameras
  static async loadPreviews(cameras) {
    const frames = {};
    
    for (const camera of cameras) {
      try {
        const frame = await this.fetchPreviewFrame(camera);
        if (frame) {
          frames[camera.ip] = frame;
        }
      } catch (error) {
        console.error('Error loading preview for camera:', camera.name, error);
      }
    }
    
    return frames;
  }
}

export default CameraService;
