-- UniPathway Database Schema
-- Run this to create the database manually (optional — Sequelize sync handles it automatically)

CREATE DATABASE IF NOT EXISTS unipathway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unipathway;

-- Users holds ALL account identities. The Admin ORM model (models/Admin.js)
-- maps to this same table scoped to userRole = 'admin' (single-table pattern);
-- the Editor and User roles are likewise values of the userRole enum.
CREATE TABLE IF NOT EXISTS Users (
  userId      INT AUTO_INCREMENT PRIMARY KEY,
  firstName   VARCHAR(100) NOT NULL,
  lastName    VARCHAR(100) NOT NULL,
  userRole    ENUM('admin','editor','user') NOT NULL DEFAULT 'user',
  createDate  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Settings (
  userId        INT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  passwordHash  VARCHAR(255) NOT NULL,
  passwordSalt  VARCHAR(255) NOT NULL,
  theme         ENUM('light','dark') NOT NULL DEFAULT 'light',
  createDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Universities (
  universityId  INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  type          VARCHAR(100) NOT NULL,
  location      VARCHAR(100) NOT NULL,
  logoUrl       TEXT,
  websiteUrl    VARCHAR(255),
  description   TEXT,
  createDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ONE-TO-MANY: Universities → Departments
CREATE TABLE IF NOT EXISTS Departments (
  departmentId  INT AUTO_INCREMENT PRIMARY KEY,
  universityId  INT NOT NULL,
  majorName     VARCHAR(255) NOT NULL,
  degreeType    VARCHAR(50) NOT NULL,
  faculty       VARCHAR(255) NOT NULL,
  description   TEXT,
  createDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (universityId) REFERENCES Universities(universityId) ON DELETE CASCADE
);

-- ONE-TO-MANY: Departments → AdmissionThresholds
CREATE TABLE IF NOT EXISTS AdmissionThresholds (
  thresholdId   INT AUTO_INCREMENT PRIMARY KEY,
  departmentId  INT NOT NULL,
  year          INT NOT NULL,
  sekemType     ENUM('quantitative','verbal','general') NOT NULL,
  sekemWeights  JSON NOT NULL,
  sekemBonuses  JSON NOT NULL,
  minSekem      FLOAT NOT NULL,
  createDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES Departments(departmentId) ON DELETE CASCADE
);

-- MANY-TO-MANY: Users ↔ Departments (junction table)
CREATE TABLE IF NOT EXISTS UserWatchlist (
  watchlistId   INT AUTO_INCREMENT PRIMARY KEY,
  userId        INT NOT NULL,
  departmentId  INT NOT NULL,
  status        ENUM('Interested','Applied','Accepted','Rejected') NOT NULL DEFAULT 'Interested',
  sekemStatus   ENUM('passed-required-acceptance-score','below-required-acceptance-score','no-data') NOT NULL DEFAULT 'no-data',
  userSekem     FLOAT DEFAULT NULL,
  createDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId)       REFERENCES Users(userId)       ON DELETE CASCADE,
  FOREIGN KEY (departmentId) REFERENCES Departments(departmentId) ON DELETE CASCADE
);

-- ONE-TO-ONE: Users → AcademicScores
CREATE TABLE IF NOT EXISTS AcademicScores (
  academicScoresId    INT AUTO_INCREMENT PRIMARY KEY,
  userId              INT NOT NULL UNIQUE,
  psychometricScores  JSON,
  bagrutScores        JSON,
  createDate          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updateDate          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
);

-- Notifications: one row per event (university/department updated)
CREATE TABLE IF NOT EXISTS Notifications (
  notificationId  INT AUTO_INCREMENT PRIMARY KEY,
  type            VARCHAR(50)  NOT NULL,
  action          VARCHAR(50)  NOT NULL,
  title           VARCHAR(255) NOT NULL,
  message         TEXT         NOT NULL,
  resourceId      INT          NOT NULL,
  recipientCount  INT          NOT NULL DEFAULT 0,
  createDate      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MANY-TO-MANY: Users ↔ Notifications (read/unread status per user)
CREATE TABLE IF NOT EXISTS UserNotificationStatus (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  notificationId  INT NOT NULL,
  userId          INT NOT NULL,
  status          ENUM('read','unread') NOT NULL DEFAULT 'unread',
  UNIQUE KEY unique_user_notif (notificationId, userId),
  FOREIGN KEY (notificationId) REFERENCES Notifications(notificationId) ON DELETE CASCADE,
  FOREIGN KEY (userId)         REFERENCES Users(userId)                 ON DELETE CASCADE
);