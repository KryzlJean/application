<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$host = 'localhost';
$dbname = 'smokedetectiondb';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

    // Create WiFi configurations table if it doesn't exist
    try {
        $sql = "CREATE TABLE IF NOT EXISTS `wifi_configurations` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user_id` int(11) NOT NULL,
            `ssid` varchar(255) NOT NULL,
            `password` varchar(255) NOT NULL,
            `is_active` tinyint(1) DEFAULT 1,
            `is_auto_detected` tinyint(1) DEFAULT 0,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `user_id` (`user_id`),
            KEY `ssid` (`ssid`)
        )";
        $conn->exec($sql);
        
        // Add is_auto_detected column if it doesn't exist (for existing tables)
        try {
            $alterSql = "ALTER TABLE `wifi_configurations` ADD COLUMN `is_auto_detected` tinyint(1) DEFAULT 0";
            $conn->exec($alterSql);
        } catch(PDOException $e) {
            // Column already exists, ignore error
        }
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Table creation failed: ' . $e->getMessage()]);
        exit;
    }

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        // Save new WiFi configuration
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id']) || !isset($input['ssid']) || !isset($input['password'])) {
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            exit;
        }
        
        try {
            // Check if configuration already exists for this user and SSID
            $checkStmt = $conn->prepare("SELECT id FROM wifi_configurations WHERE user_id = ? AND ssid = ?");
            $checkStmt->execute([$input['user_id'], $input['ssid']]);
            
            if ($checkStmt->rowCount() > 0) {
                // Update existing configuration
                $stmt = $conn->prepare("UPDATE wifi_configurations SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND ssid = ?");
                $stmt->execute([$input['password'], $input['user_id'], $input['ssid']]);
                $message = 'WiFi configuration updated successfully';
            } else {
                // Insert new configuration
                $stmt = $conn->prepare("INSERT INTO wifi_configurations (user_id, ssid, password) VALUES (?, ?, ?)");
                $stmt->execute([$input['user_id'], $input['ssid'], $input['password']]);
                $message = 'WiFi configuration saved successfully';
            }
            
            echo json_encode([
                'success' => true, 
                'message' => $message,
                'data' => [
                    'user_id' => $input['user_id'],
                    'ssid' => $input['ssid'],
                    'is_active' => 1
                ]
            ]);
            
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Database operation failed: ' . $e->getMessage()]);
        }
        break;
        
    case 'GET':
        // Get saved WiFi configurations for a user
        if (isset($_GET['user_id'])) {
            try {
                $stmt = $conn->prepare("SELECT id, ssid, is_active, created_at, updated_at FROM wifi_configurations WHERE user_id = ? ORDER BY created_at DESC");
                $stmt->execute([$_GET['user_id']]);
                $configurations = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'data' => $configurations
                ]);
                
            } catch(PDOException $e) {
                echo json_encode(['success' => false, 'error' => 'Failed to retrieve configurations: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'User ID required']);
        }
        break;
        
    case 'PUT':
        // Update WiFi configuration status
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !isset($input['is_active'])) {
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            exit;
        }
        
        try {
            $stmt = $conn->prepare("UPDATE wifi_configurations SET is_active = ? WHERE id = ?");
            $stmt->execute([$input['is_active'], $input['id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Configuration status updated successfully'
            ]);
            
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Update failed: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Delete WiFi configuration
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id'])) {
            echo json_encode(['success' => false, 'error' => 'Configuration ID required']);
            exit;
        }
        
        try {
            $stmt = $conn->prepare("DELETE FROM wifi_configurations WHERE id = ?");
            $stmt->execute([$input['id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Configuration deleted successfully'
            ]);
            
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Delete failed: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
?>
