--
-- Database: `u345343285_akifb`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `displayName` varchar(100) NOT NULL,
  `role` enum('user','checker','driver','warehouse_supervisor','admin') NOT NULL DEFAULT 'user',
  `status` enum('active','inactive','blocked') NOT NULL DEFAULT 'inactive',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `contactPerson` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `type` enum('Shipper','Consignee','Both') NOT NULL DEFAULT 'Shipper',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_files`
--

CREATE TABLE `job_files` (
  `jfn` varchar(100) NOT NULL,
  `d` date DEFAULT NULL,
  `po` varchar(100) DEFAULT NULL,
  `cl` text DEFAULT NULL,
  `pt` text DEFAULT NULL,
  `in` varchar(100) DEFAULT NULL,
  `bd` date DEFAULT NULL,
  `sm` varchar(150) DEFAULT NULL,
  `sh` varchar(255) DEFAULT NULL,
  `co` varchar(255) DEFAULT NULL,
  `mawb` varchar(100) DEFAULT NULL,
  `hawb` varchar(100) DEFAULT NULL,
  `ts` varchar(100) DEFAULT NULL,
  `or` varchar(100) DEFAULT NULL,
  `pc` varchar(50) DEFAULT NULL,
  `gw` varchar(50) DEFAULT NULL,
  `de` varchar(100) DEFAULT NULL,
  `vw` varchar(50) DEFAULT NULL,
  `dsc` text DEFAULT NULL,
  `ca` varchar(255) DEFAULT NULL,
  `tn` varchar(100) DEFAULT NULL,
  `vn` varchar(100) DEFAULT NULL,
  `fv` varchar(100) DEFAULT NULL,
  `cn` varchar(100) DEFAULT NULL,
  `ch` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ch`)),
  `re` text DEFAULT NULL,
  `pb` varchar(150) DEFAULT NULL,
  `totalCost` decimal(10,3) DEFAULT 0.000,
  `totalSelling` decimal(10,3) DEFAULT 0.000,
  `totalProfit` decimal(10,3) DEFAULT 0.000,
  `status` enum('pending','checked','approved','rejected') NOT NULL DEFAULT 'pending',
  `createdBy` varchar(150) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedBy` varchar(150) DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `checkedBy` varchar(150) DEFAULT NULL,
  `checkedAt` datetime DEFAULT NULL,
  `approvedBy` varchar(150) DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `rejectedBy` varchar(150) DEFAULT NULL,
  `rejectedAt` datetime DEFAULT NULL,
  `rejectionReason` text DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deletedBy` varchar(150) DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`jfn`),
  UNIQUE KEY `in` (`in`),
  UNIQUE KEY `mawb` (`mawb`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------

--
-- Table structure for table `deleted_job_files`
--
-- This is a simple copy of job_files for recycle bin functionality.
-- You can also just use a flag in the main table.

CREATE TABLE `deleted_job_files` LIKE `job_files`;

-- --------------------------------------------------------

--
-- Composer vendor directory
-- You'll need to run `composer install` on your server
-- This creates the `vendor` folder.
-- Make sure to upload the `composer.json` and `composer.lock` if it exists.
--

--
-- Add a first admin user if you want to.
-- Replace 'admin@example.com' and 'your_strong_password'
-- The password will be hashed.
--
-- INSERT INTO `users` (`email`, `password_hash`, `displayName`, `role`, `status`) VALUES
-- ('admin@example.com', '$2y$10$YourHashedPasswordHere...', 'Admin User', 'admin', 'active');
--

