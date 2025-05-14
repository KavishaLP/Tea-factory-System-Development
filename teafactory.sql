-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2025 at 09:10 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `teafactory`
--

-- --------------------------------------------------------

--
-- Table structure for table `adminaccounts`
--

CREATE TABLE `adminaccounts` (
  `ID` int(11) NOT NULL DEFAULT 0,
  `USERNAME` varchar(150) NOT NULL,
  `PASSWORD` varchar(150) NOT NULL,
  `F_NAME` varchar(150) NOT NULL,
  `L_NAME` varchar(150) NOT NULL,
  `ADMINMAIL` varchar(150) NOT NULL,
  `RESET_CODE` varchar(6) DEFAULT NULL,
  `RESET_EXPIRY` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `adminaccounts`
--

INSERT INTO `adminaccounts` (`ID`, `USERNAME`, `PASSWORD`, `F_NAME`, `L_NAME`, `ADMINMAIL`, `RESET_CODE`, `RESET_EXPIRY`) VALUES
(1, 'Kavisha12345', '$2b$10$Qvw0eau0M3xWMjTNgpgSbOO5.Q7gr4CQRyNV8j5UqMieBq/MswjSS', '', '', 'kskavisha2001@gmail.com', '160826', '2025-03-21 17:04:37');

-- --------------------------------------------------------

--
-- Table structure for table `advance_payment`
--

CREATE TABLE `advance_payment` (
  `advn_id` int(11) NOT NULL,
  `userId` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `action` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `advance_payment`
--

INSERT INTO `advance_payment` (`advn_id`, `userId`, `amount`, `date`, `action`) VALUES
(26, 'namal', 30000.00, '2025-04-27', 'Rejected'),
(27, 'namal', 20000.00, '2025-04-27', 'Approved'),
(28, 'namal', 5000.00, '2025-04-28', 'Approved'),
(29, 'namal', 5.00, '2025-04-28', 'Pending'),
(30, 'namal', 10.00, '2025-04-28', 'Pending'),
(31, 'namal', 50000.00, '2025-04-29', 'Pending'),
(32, 'namal', 6000.00, '2025-04-29', 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `employeeaccounts`
--

CREATE TABLE `employeeaccounts` (
  `id` int(11) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `mobile1` varchar(20) NOT NULL,
  `mobile2` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employeeaccounts`
--

INSERT INTO `employeeaccounts` (`id`, `userId`, `firstName`, `lastName`, `mobile1`, `mobile2`, `created_at`) VALUES
(1, 'Wenu@9284u979', 'venuja', 'gamage', '0776876202', '', '2025-03-05 16:04:00'),
(2, 'W000000000002', 'KKKKKKKKKK', 'EEEEEEEEEE', '04447255225', '', '2025-03-26 07:29:21'),
(3, 'W000000000005', 'KKKKKKKKKK', 'EEEEEEEEEE', '04447255225', '', '2025-04-06 07:18:16'),
(4, '01', '5', '5', '000', '00000', '2025-04-06 09:44:28'),
(5, '0155', '5', '5', '000', NULL, '2025-04-06 11:25:00'),
(6, 'namal', 'namal', 'kamal', '0703881642', NULL, '2025-04-07 09:09:41'),
(7, 'namal2222', 'namal', 'kamal', '0703881642', NULL, '2025-04-09 07:15:07'),
(8, 'Wenu@9284u979g', 'tyy', 'u', '0775555555', NULL, '2025-04-24 06:56:02'),
(9, 'Wenu@9284u979gi', 'tyy', 'u', '077555566666555', NULL, '2025-04-24 06:56:29'),
(10, 'Wenu@9284u97955555', 'hh', 'kk', '01111111111111', NULL, '2025-04-25 15:41:28'),
(11, 'w0000000010', 'j', 'kmmmmm', '011111111', NULL, '2025-04-26 06:42:09'),
(12, 'namal7777', 'KAVISHaaaa', 'LIYANAPATHIRANAhh', '0776876202', '0775555555', '2025-04-29 09:54:46');

-- --------------------------------------------------------

--
-- Table structure for table `employee_payments`
--

CREATE TABLE `employee_payments` (
  `id` int(11) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `salaryAmount` decimal(10,2) NOT NULL,
  `additionalPayments` decimal(10,2) DEFAULT 0.00,
  `deductions` decimal(10,2) DEFAULT 0.00,
  `finalPayment` decimal(10,2) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_payments`
--

INSERT INTO `employee_payments` (`id`, `userId`, `salaryAmount`, `additionalPayments`, `deductions`, `finalPayment`, `createdAt`) VALUES
(1, 'Wenu@9284u979', 1000.00, 100.00, 50.00, 1050.00, '2025-03-05 17:12:47'),
(2, 'Wenu@9284u979', 1000.00, 100.00, 50.00, 1050.00, '2025-03-05 17:12:56'),
(3, 'Wenu@9284u979', 1000.00, 100.00, 50.00, 1050.00, '2025-03-05 17:13:19'),
(4, 'Wenu@9284u979', 1000.00, 100.00, 50.00, 1050.00, '2025-03-05 17:14:53'),
(5, 'Wenu@9284u979', 1000.00, 100.00, 50.00, 1050.00, '2025-03-05 17:20:31'),
(6, 'W000000000002', 4444.00, 55.00, 50.00, 4449.00, '2025-03-26 07:46:34'),
(7, 'W000000000002', 4444.00, 55.00, 50.00, 4449.00, '2025-04-06 07:18:53'),
(8, 'W000000000002', 4444.00, 55.00, 50.00, 4449.00, '2025-04-06 11:25:25'),
(9, 'namal', 4444.00, 55.00, 50.00, 4449.00, '2025-04-07 09:10:35'),
(10, 'namal2222', 4444.00, 55.00, 50.00, 4449.00, '2025-04-09 07:16:16'),
(13, 'namal2222', 3.00, 5.00, 1.00, 7.00, '2025-04-09 07:17:05'),
(14, 'Wenu@9284u979', 4500000.00, 52000.00, 2.00, 4551998.00, '2025-04-25 15:42:05'),
(15, 'namal2222', 400000.00, 11.00, 40000.00, 360011.00, '2025-04-29 09:56:35');

-- --------------------------------------------------------

--
-- Table structure for table `farmeraccounts`
--

CREATE TABLE `farmeraccounts` (
  `id` int(11) NOT NULL,
  `userId` varchar(100) NOT NULL,
  `userName` varchar(100) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `mobile1` varchar(15) NOT NULL,
  `mobile2` varchar(15) DEFAULT NULL,
  `gmail` varchar(150) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `RESET_CODE` varchar(6) DEFAULT NULL,
  `RESET_EXPIRY` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `tea_delivery_method` enum('farmer_vehicle','factory_vehicle') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `farmeraccounts`
--

INSERT INTO `farmeraccounts` (`id`, `userId`, `userName`, `firstName`, `lastName`, `address`, `mobile1`, `mobile2`, `gmail`, `password`, `RESET_CODE`, `RESET_EXPIRY`, `createdAt`, `tea_delivery_method`) VALUES
(10, 'namal', 'farmer_namal', 'namalk', 'namal', 'namal , namal, namal', '0111111111', '0703881642', 'kskavisha2001@gmail.com', '$2b$10$yuS1Xdn0DlaolqcjQzDh4Ol8M1Kz16B9yduNxBdW.UUby45hgNP.2', NULL, NULL, '2025-04-07 09:35:11', 'farmer_vehicle'),
(18, 'saman', 'farmer_saman', 'saman ', 'kumara', 'saman saman', '0703881642', '0703881642', 'Kavisha12345@gmail.com', '$2b$10$nBjWMU2IBWwF9iQsu5tWMON94BBVnmR9GuSoLkJHhI04MsVAsOMoC', NULL, NULL, '2025-04-27 09:32:39', 'farmer_vehicle'),
(19, 'nawein', 'farmer_nawein', 'navinj', 'lk', 'navin navin', '0111111111', '0111111111', 'HHHHH@gmail.com', '$2b$10$p5N79/9NH6Nn0eyFS4APROozNskMdsdINwXNvN1rIlsXhrGuXLp6q', NULL, NULL, '2025-04-27 09:33:15', 'farmer_vehicle');

-- --------------------------------------------------------

--
-- Table structure for table `farmer_payments`
--

CREATE TABLE `farmer_payments` (
  `id` int(11) NOT NULL,
  `userId` varchar(100) DEFAULT NULL,
  `paymentPerKilo` decimal(10,2) NOT NULL,
  `finalTeaKilos` decimal(10,2) NOT NULL,
  `paymentForFinalTeaKilos` decimal(10,2) NOT NULL,
  `additionalPayments` decimal(10,2) DEFAULT 0.00,
  `transport` decimal(10,2) DEFAULT 0.00,
  `directPayments` decimal(10,2) DEFAULT 0.00,
  `finalAmount` decimal(10,2) NOT NULL,
  `advances` decimal(10,2) DEFAULT 0.00,
  `teaPackets` decimal(10,2) DEFAULT 0.00,
  `fertilizer` decimal(10,2) DEFAULT 0.00,
  `finalPayment` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('Pending','Approved') NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `farmer_payments`
--

INSERT INTO `farmer_payments` (`id`, `userId`, `paymentPerKilo`, `finalTeaKilos`, `paymentForFinalTeaKilos`, `additionalPayments`, `transport`, `directPayments`, `finalAmount`, `advances`, `teaPackets`, `fertilizer`, `finalPayment`, `created_at`, `status`) VALUES
(8, 'nawein', 0.00, 600.00, 2.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1200.00, '2025-04-27 10:06:50', 'Approved'),
(9, 'saman', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-04-27 10:06:50', 'Approved'),
(10, 'namal', 0.00, 80.00, 40000.00, 0.00, 960.00, 0.00, 40960.00, 31000.00, 0.00, 0.00, 20960.00, '2025-04-27 14:19:09', 'Pending'),
(11, 'namal', 0.00, 48.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2001-01-01 18:30:00', 'Pending');

-- --------------------------------------------------------

--
-- Table structure for table `fertilizer_prices`
--

CREATE TABLE `fertilizer_prices` (
  `fertilizer_veriance_id` int(11) NOT NULL,
  `fertilizerType` varchar(50) NOT NULL,
  `packetType` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fertilizer_prices`
--

INSERT INTO `fertilizer_prices` (`fertilizer_veriance_id`, `fertilizerType`, `packetType`, `price`) VALUES
(1, 'Urea', '25kg Bag', 23.00),
(2, 'Urea', '50kg Bag', 45.50),
(3, 'Urea', '5kg Packet', 5.00),
(4, 'DAP', '10kg Bag', 12.00),
(5, 'DAP', '25kg Bag', 29.00),
(6, 'DAP', '50kg Bag', 55.00),
(7, 'MOP', '5kg Packet', 6.50),
(8, 'MOP', '10kg Packet', 12.75),
(9, 'MOP', '25kg Bag', 30.00),
(10, 'Compost', '2kg Packet', 3.50),
(11, 'Compost', '5kg Packet', 8.25),
(12, 'Compost', '10kg Bag', 15.00);

-- --------------------------------------------------------

--
-- Table structure for table `fertilizer_requests`
--

CREATE TABLE `fertilizer_requests` (
  `request_id` int(11) NOT NULL,
  `userId` varchar(100) NOT NULL,
  `fertilizer_veriance_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `requestDate` date NOT NULL,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `paymentoption` enum('cash','deductpayment') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fertilizer_requests`
--

INSERT INTO `fertilizer_requests` (`request_id`, `userId`, `fertilizer_veriance_id`, `amount`, `requestDate`, `status`, `paymentoption`) VALUES
(29, 'namal', 4, 2, '2025-04-27', 'Approved', 'cash'),
(30, 'namal', 2, 2, '2025-04-27', 'Approved', 'cash'),
(31, 'namal', 3, 1, '2025-04-27', 'Approved', 'cash'),
(32, 'namal', 6, 1, '2025-04-27', 'Rejected', 'deductpayment'),
(33, 'namal', 8, 2, '2025-04-27', 'Rejected', 'deductpayment'),
(34, 'namal', 4, 3, '2025-04-27', 'Approved', 'deductpayment'),
(35, 'namal', 5, 4, '2025-04-27', 'Approved', 'deductpayment'),
(36, 'namal', 5, 1, '2025-04-27', 'Approved', 'deductpayment'),
(37, 'namal', 6, 5, '2025-04-27', 'Approved', 'deductpayment'),
(38, 'namal', 4, 22, '2025-04-29', 'Approved', 'cash'),
(39, 'namal', 4, 5, '2025-04-29', 'Approved', 'cash'),
(40, 'namal', 1, 5, '2025-04-29', 'Approved', 'cash'),
(41, 'namal', 1, 3, '2025-04-29', 'Rejected', 'deductpayment');

-- --------------------------------------------------------

--
-- Table structure for table `manageraccounts`
--

CREATE TABLE `manageraccounts` (
  `ID` int(11) NOT NULL DEFAULT 0,
  `USERNAME` varchar(150) NOT NULL,
  `PASSWORD` varchar(150) NOT NULL,
  `F_NAME` varchar(150) NOT NULL,
  `L_NAME` varchar(150) NOT NULL,
  `ADMINMAIL` varchar(150) NOT NULL,
  `RESET_CODE` varchar(6) DEFAULT NULL,
  `RESET_EXPIRY` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `manageraccounts`
--

INSERT INTO `manageraccounts` (`ID`, `USERNAME`, `PASSWORD`, `F_NAME`, `L_NAME`, `ADMINMAIL`, `RESET_CODE`, `RESET_EXPIRY`) VALUES
(1, 'Kavisha12345', '$2b$10$Qvw0eau0M3xWMjTNgpgSbOO5.Q7gr4CQRyNV8j5UqMieBq/MswjSS', '', '', 'kskavisha2001@gmail.com', '160826', '2025-03-21 17:04:37');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `receiver_type` enum('admin','manager','user') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tea_inventory`
--

CREATE TABLE `tea_inventory` (
  `id` int(11) NOT NULL,
  `tea_type` varchar(50) NOT NULL,
  `packet_size` varchar(10) NOT NULL,
  `packet_count` int(11) NOT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tea_inventory`
--

INSERT INTO `tea_inventory` (`id`, `tea_type`, `packet_size`, `packet_count`, `last_updated`) VALUES
(1, 'Black Tea', '100g', 178, '2025-04-29 11:31:18'),
(2, 'Green Tea', '250g', 140, '2025-04-26 08:40:34'),
(3, 'Earl Grey', '500g', 107, '2025-04-29 11:31:29'),
(4, 'Chamomile', '100g', 95, '2025-04-29 09:40:43'),
(5, 'Oolong Tea', '250g', 60, '2025-04-26 08:40:34'),
(6, 'Black Tea', '500g', 178, '2025-04-29 11:31:26'),
(7, 'Green Tea', '100g', 90, '2025-04-26 08:40:34'),
(8, 'Chamomile', '250g', 75, '2025-04-26 08:40:34'),
(9, 'Earl Grey', '100g', 110, '2025-04-26 08:40:34'),
(10, 'Oolong Tea', '500g', 40, '2025-04-26 08:40:34');

-- --------------------------------------------------------

--
-- Table structure for table `tea_packet_requests`
--

CREATE TABLE `tea_packet_requests` (
  `request_id` int(11) NOT NULL,
  `userId` varchar(100) NOT NULL,
  `teaPacketType` varchar(50) NOT NULL,
  `teaPacketSize` varchar(50) NOT NULL,
  `amount` int(11) NOT NULL,
  `requestDate` date NOT NULL,
  `status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `paymentoption` enum('cash','deductpayment') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tea_price_per_kilo`
--

CREATE TABLE `tea_price_per_kilo` (
  `id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `month_year` varchar(7) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tea_price_per_kilo`
--

INSERT INTO `tea_price_per_kilo` (`id`, `price`, `month_year`, `created_at`, `updated_at`) VALUES
(1, 140.00, '2024-10', '2025-04-28 09:27:10', '2025-04-28 09:27:10'),
(2, 142.00, '2024-11', '2025-04-28 09:27:10', '2025-04-28 09:27:10'),
(3, 143.50, '2024-12', '2025-04-28 09:27:10', '2025-04-28 09:27:10'),
(4, 145.00, '2025-01', '2025-04-28 09:27:10', '2025-04-28 09:27:10'),
(5, 147.00, '2025-02', '2025-04-28 09:27:10', '2025-04-28 09:27:10'),
(6, 149.00, '2025-03', '2025-04-28 09:27:10', '2025-04-28 09:27:10'),
(7, 300.00, '2025-04', '2025-04-28 09:27:10', '2025-04-28 09:51:12');

-- --------------------------------------------------------

--
-- Table structure for table `tea_sack_updates`
--

CREATE TABLE `tea_sack_updates` (
  `id` int(11) NOT NULL,
  `userId` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `tea_sack_weight` decimal(10,2) NOT NULL,
  `deduction_water` decimal(10,2) DEFAULT 0.00,
  `deduction_damage_tea` decimal(10,2) DEFAULT 0.00,
  `deduction_sack_weight` decimal(10,2) DEFAULT 0.00,
  `deduction_sharped_tea` decimal(10,2) DEFAULT 0.00,
  `deduction_other` decimal(10,2) DEFAULT 0.00,
  `final_tea_sack_weight` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tea_sack_updates`
--

INSERT INTO `tea_sack_updates` (`id`, `userId`, `date`, `tea_sack_weight`, `deduction_water`, `deduction_damage_tea`, `deduction_sack_weight`, `deduction_sharped_tea`, `deduction_other`, `final_tea_sack_weight`) VALUES
(8, 'namal', '2025-04-27', 60.00, 10.00, 5.00, 5.00, 5.00, 5.00, 30.00),
(9, 'namal', '2025-04-26', 50.00, 0.00, 0.00, 0.00, 0.00, 0.00, 50.00),
(10, 'namal', '2001-01-02', 55.00, 4.00, 3.00, 0.00, 0.00, 0.00, 48.00);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `ID` int(11) NOT NULL,
  `USERNAME` varchar(150) NOT NULL,
  `PASSWORD` varchar(150) NOT NULL,
  `F_NAME` varchar(150) NOT NULL,
  `L_NAME` varchar(150) NOT NULL,
  `ADMINMAIL` varchar(150) NOT NULL,
  `RESET_CODE` varchar(6) DEFAULT NULL,
  `RESET_EXPIRY` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`ID`, `USERNAME`, `PASSWORD`, `F_NAME`, `L_NAME`, `ADMINMAIL`, `RESET_CODE`, `RESET_EXPIRY`) VALUES
(1, 'Kavisha12345', '$2b$10$Qvw0eau0M3xWMjTNgpgSbOO5.Q7gr4CQRyNV8j5UqMieBq/MswjSS', '', '', 'kskavisha2001@gmail.com', '160826', '2025-03-21 17:04:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `advance_payment`
--
ALTER TABLE `advance_payment`
  ADD PRIMARY KEY (`advn_id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `employeeaccounts`
--
ALTER TABLE `employeeaccounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `employee_payments`
--
ALTER TABLE `employee_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `farmeraccounts`
--
ALTER TABLE `farmeraccounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `farmer_payments`
--
ALTER TABLE `farmer_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `fertilizer_prices`
--
ALTER TABLE `fertilizer_prices`
  ADD PRIMARY KEY (`fertilizer_veriance_id`);

--
-- Indexes for table `fertilizer_requests`
--
ALTER TABLE `fertilizer_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `fertilizer_veriance_id` (`fertilizer_veriance_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receiver_id` (`receiver_id`,`receiver_type`),
  ADD KEY `is_read` (`is_read`);

--
-- Indexes for table `tea_inventory`
--
ALTER TABLE `tea_inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tea_type` (`tea_type`,`packet_size`);

--
-- Indexes for table `tea_packet_requests`
--
ALTER TABLE `tea_packet_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tea_price_per_kilo`
--
ALTER TABLE `tea_price_per_kilo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `month_year` (`month_year`);

--
-- Indexes for table `tea_sack_updates`
--
ALTER TABLE `tea_sack_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `advance_payment`
--
ALTER TABLE `advance_payment`
  MODIFY `advn_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `employeeaccounts`
--
ALTER TABLE `employeeaccounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `employee_payments`
--
ALTER TABLE `employee_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `farmeraccounts`
--
ALTER TABLE `farmeraccounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `farmer_payments`
--
ALTER TABLE `farmer_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `fertilizer_prices`
--
ALTER TABLE `fertilizer_prices`
  MODIFY `fertilizer_veriance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
z
--
-- AUTO_INCREMENT for table `fertilizer_requests`
--
ALTER TABLE `fertilizer_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tea_inventory`
--
ALTER TABLE `tea_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tea_packet_requests`
--
ALTER TABLE `tea_packet_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tea_price_per_kilo`
--
ALTER TABLE `tea_price_per_kilo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tea_sack_updates`
--
ALTER TABLE `tea_sack_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `advance_payment`
--
ALTER TABLE `advance_payment`
  ADD CONSTRAINT `advance_payment_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `farmeraccounts` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `employee_payments`
--
ALTER TABLE `employee_payments`
  ADD CONSTRAINT `employee_payments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `employeeaccounts` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `farmer_payments`
--
ALTER TABLE `farmer_payments`
  ADD CONSTRAINT `farmer_payments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `farmeraccounts` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `fertilizer_requests`
--
ALTER TABLE `fertilizer_requests`
  ADD CONSTRAINT `fertilizer_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `farmeraccounts` (`userId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fertilizer_requests_ibfk_2` FOREIGN KEY (`fertilizer_veriance_id`) REFERENCES `fertilizer_prices` (`fertilizer_veriance_id`) ON DELETE CASCADE;

--
-- Constraints for table `tea_packet_requests`
--
ALTER TABLE `tea_packet_requests`
  ADD CONSTRAINT `tea_packet_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `farmeraccounts` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `tea_sack_updates`
--
ALTER TABLE `tea_sack_updates`
  ADD CONSTRAINT `tea_sack_updates_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `farmeraccounts` (`userId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
