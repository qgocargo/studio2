-- Q'Go Cargo Job File Management System
-- Database Schema for MySQL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `displayName` VARCHAR(100),
  `role` ENUM('user', 'checker', 'admin', 'driver', 'warehouse_supervisor') NOT NULL DEFAULT 'user',
  `status` ENUM('inactive', 'active', 'blocked') NOT NULL DEFAULT 'inactive',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Seed the first admin user (IMPORTANT: Change password after first login)
-- Default password is "password"
--

INSERT INTO `users` (`email`, `password_hash`, `displayName`, `role`, `status`) VALUES
('admin@qgocargo.com', '$2y$10$3s.g3y/gQG1c8g1K4j.m.eC/jB.oF.Z.I.oE.Y.Z.eR.gH.iG.oF6', 'Admin', 'admin', 'active');


-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `address` TEXT,
  `contactPerson` VARCHAR(255),
  `phone` VARCHAR(50),
  `type` ENUM('Shipper', 'Consignee', 'Both') NOT NULL DEFAULT 'Shipper',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `job_files`
--

CREATE TABLE `job_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `jfn` VARCHAR(100) NOT NULL UNIQUE,
  `d` DATE COMMENT 'Date',
  `po` VARCHAR(100) COMMENT 'P.O. #',
  `cl` JSON COMMENT 'Clearance Checkboxes',
  `pt` JSON COMMENT 'Product Type Checkboxes',
  `in` VARCHAR(100) COMMENT 'Invoice No.',
  `bd` DATE COMMENT 'Billing Date',
  `sm` VARCHAR(100) COMMENT 'Salesman',
  `sh` VARCHAR(255) COMMENT 'Shipper Name',
  `co` VARCHAR(255) COMMENT 'Consignee Name',
  `mawb` VARCHAR(100) COMMENT 'MAWB/OBL/TCN No.',
  `hawb` VARCHAR(100) COMMENT 'HAWB/HBL',
  `ts` VARCHAR(100) COMMENT 'Teams of Shipping',
  `or` VARCHAR(100) COMMENT 'Origin',
  `pc` VARCHAR(100) COMMENT 'No. of Pieces',
  `gw` VARCHAR(100) COMMENT 'Gross Weight',
  `de` VARCHAR(100) COMMENT 'Destination',
  `vw` VARCHAR(100) COMMENT 'Volume Weight',
  `dsc` TEXT COMMENT 'Description',
  `ca` VARCHAR(100) COMMENT 'Carrier/Shipping Line/Trucking Co',
  `tn` VARCHAR(100) COMMENT 'Truck No./Driver''s Name',
  `vn` VARCHAR(100) COMMENT 'Vessel''s Name',
  `fv` VARCHAR(100) COMMENT 'Flight/Voyage No.',
  `cn` VARCHAR(100) COMMENT 'Container No.',
  `ch` JSON COMMENT 'Charges Table',
  `re` TEXT COMMENT 'Remarks',
  `pb` VARCHAR(100) COMMENT 'Prepared By',
  `totalCost` DECIMAL(12, 3),
  `totalSelling` DECIMAL(12, 3),
  `totalProfit` DECIMAL(12, 3),
  `createdBy` VARCHAR(100),
  `lastUpdatedBy` VARCHAR(100),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'checked', 'approved', 'rejected', 'Out for Delivery') DEFAULT 'pending',
  `checkedBy` VARCHAR(100),
  `checkedAt` DATETIME,
  `approvedBy` VARCHAR(100),
  `approvedAt` DATETIME,
  `rejectedBy` VARCHAR(100),
  `rejectedAt` DATETIME,
  `rejectionReason` TEXT,
  `is_deleted` TINYINT(1) DEFAULT 0,
  `deletedAt` DATETIME,
  `deletedBy` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `charge_descriptions`
--

CREATE TABLE `charge_descriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `description` (`description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Inserting default data for `charge_descriptions`
--

INSERT INTO `charge_descriptions` (`description`) VALUES
('Ex-works Charges:'),
('Land/Air / Sea Freight:'),
('Fuell Security / War Surcharge:'),
('Formalities:'),
('Delivery Order Fee:'),
('Transportation Charges:'),
('Inspection / Computer Print Charges:'),
('Handling Charges:'),
('Labor / Forklift Charges:'),
('Documentation Charges:'),
('Clearance Charges:'),
('Customs Duty:'),
('Terminal Handling Charges:'),
('Legalization Charges:'),
('Demurrage Charges:'),
('Loading / Offloading Charges:'),
('Destination Clearance Charges:'),
('Packing Charges:'),
('Port Charges:'),
('Other Charges:'),
('PAI Approval :'),
('Insurance Fee :'),
('EPA Charges :');

COMMIT;
