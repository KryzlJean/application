-- Database: SmokeDetectiondb
CREATE DATABASE IF NOT EXISTS SmokeDetectiondb;
USE SmokeDetectiondb;

-- =========================
-- User Table
-- =========================
CREATE TABLE User (
    user_id INT NOT NULL AUTO_INCREMENT,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    PRIMARY KEY (user_id)
) ENGINE=InnoDB;

-- =========================
-- WiFi Setup Table
-- =========================
CREATE TABLE WiFiSetup (
    wifi_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    share_id INT NOT NULL,
    wifi_name VARCHAR(500) NOT NULL,
    wifi_password VARCHAR(500) NOT NULL,
    PRIMARY KEY (wifi_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
) ENGINE=InnoDB;

-- =========================
-- Camera Table
-- =========================
CREATE TABLE Camera (
    camera_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    wifi_id INT NOT NULL,
    location VARCHAR(255),
    ip_address VARCHAR(100),
    add_camera BOOLEAN,
    camera_name VARCHAR(255),
    PRIMARY KEY (camera_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
    -- wifi_id FK will be added later
) ENGINE=InnoDB;

-- =========================
-- ShareDevice Table
-- =========================
CREATE TABLE ShareDevice (
    share_id INT NOT NULL AUTO_INCREMENT,
    share_device VARCHAR(255) NOT NULL,
    cam_id INT NOT NULL,
    other_location VARCHAR(255),
    add_new_sharing BOOLEAN,
    request_access BOOLEAN,
    PRIMARY KEY (share_id),
    FOREIGN KEY (cam_id) REFERENCES Camera(camera_id)
) ENGINE=InnoDB;

-- =========================
-- Recording Table
-- =========================
CREATE TABLE Recording (
    recording_id INT NOT NULL AUTO_INCREMENT,
    camera_id INT NOT NULL,
    recording_name VARCHAR(255),
    time_stamp DATETIME,
    frame_url VARCHAR(255),
    PRIMARY KEY (recording_id),
    FOREIGN KEY (camera_id) REFERENCES Camera(camera_id)
) ENGINE=InnoDB;

-- =========================
-- Detection Table
-- =========================
CREATE TABLE Detection (
    detection_id INT NOT NULL AUTO_INCREMENT,
    camera_id INT NOT NULL,
    recording_id INT NOT NULL,
    smoke_level BOOLEAN,
    detection_time DATETIME,
    PRIMARY KEY (detection_id),
    FOREIGN KEY (camera_id) REFERENCES Camera(camera_id),
    FOREIGN KEY (recording_id) REFERENCES Recording(recording_id)
) ENGINE=InnoDB;

-- =========================
-- Add circular foreign keys
-- =========================
ALTER TABLE WiFiSetup
ADD CONSTRAINT fk_wifi_share FOREIGN KEY (share_id) REFERENCES ShareDevice(share_id);

ALTER TABLE Camera
ADD CONSTRAINT fk_camera_wifi FOREIGN KEY (wifi_id) REFERENCES WiFiSetup(wifi_id);
