-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 07, 2025 at 10:15 AM
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
(10, 'Wenu@9284u979', 3000.00, '2025-03-12', 'Approved'),
(11, 'Wenu@9284u979', 5555.00, '2025-03-12', 'Rejected'),
(12, 'Wenu@9284u979', 3000.00, '2025-03-12', 'Approved'),
(13, 'Wenu@9284u979', 5000.00, '2025-03-21', 'Approved'),
(14, 'Wenu@9284u92', 3000.00, '2025-03-23', 'Approved'),
(15, 'Wenu@9284u92', 50000.00, '2025-03-26', 'Approved'),
(16, 'Wenu@9284u92', 5000.00, '2025-04-06', 'Approved');

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
(5, '0155', '5', '5', '000', NULL, '2025-04-06 11:25:00');

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
(8, 'W000000000002', 4444.00, 55.00, 50.00, 4449.00, '2025-04-06 11:25:25');

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
(1, 'Wenu@9284u979', 'ferWenu@9284u979', 'kabii', 'kamdvjdsb', 'khhhhhhhhhhhbbbbbbbbbbbbbbbbbbbb,diiii', '0776876202', '0776876207', 'ekjvneksnn@gmai.com', '$2b$10$VFyUuyQbOCEi82fMqlj7XurA5UV18oZWtc7foFmCeVLE/AHszbKCa', NULL, NULL, '2025-03-02 15:25:03', 'farmer_vehicle'),
(2, 'Wenu@9284u92', 'ferWenu@9284u92', 'kavi', 'she', 'moraw,sri lanaka', '0776876204', '', 'Kavisha12345@gmail.com', '$2b$10$mz6hg66dFQ5m0NwSuXS/ue0cu0q7XO9Z1MENk2ScNWPQeGX8YLy4O', NULL, NULL, '2025-03-03 05:37:09', 'farmer_vehicle'),
(3, '14529', 'farmer_14529', 'kavi', 'she', 'moraw,sri lanaka', '0776876204', '', 'ekjvnekhhsnn@gmai.com', '$2b$10$T7JPl/Ma1.wlctbIZkLt5OTLSkWpLOEe5GTMAfMG8aZ54izH82evO', NULL, NULL, '2025-03-05 06:56:02', 'farmer_vehicle'),
(4, 'kavi@1000000', 'farmer_kavi@1000000', 'Gamage', 'Prasa', 'Samagi mawatha,Morawak Kanda,Morawaka, Matara,Sri Lanka', '0776876202', '', 'Kavish12345@gmail.com', '$2b$10$y.fmzzZGrsRFTQZmZTE8WOfU7ENn5GUr9pkJjZRQsIA11QXY8Lviu', NULL, NULL, '2025-03-23 06:50:40', 'farmer_vehicle'),
(5, 'W000000001', 'farmer_W000000001', 'Kavisha', 'lioyanp', 'matara sri lanksa', '0775555555', '0702425838', 'ekjvneksnn@gmail.com', '$2b$10$.9hfoVZw0xOIt25c07YuauDfXW0tWrRXZ59zFjlh.Epf31BIDQhAu', NULL, NULL, '2025-03-26 07:27:31', 'farmer_vehicle'),
(6, 'W222222', 'farmer_W222222', 'NAMI', 'JJJJJ', 'matara sri lanksa', '0775555554', '0111111111', 'HHHHH@gmail.com', '$2b$10$o0gibD/U7o4RbSjvO0xvYedU9Av1JTwJExi1gQYA1t5C8cggjFRvu', NULL, NULL, '2025-04-06 04:18:01', 'farmer_vehicle'),
(7, 'W22222211111', 'farmer_W22222211111', 'NAMIAS', 'JJJJJ', 'matara sri lanksa', '0775555554', '', 'HHHHHA@gmail.com', '$2b$10$t/1dGpXetyKLFbhMzZBOO.aJyAdJCP4pNvXz8AmXnwOvsyHbBnjMK', NULL, NULL, '2025-04-06 05:13:54', 'farmer_vehicle'),
(8, 'w111111', 'farmer_w111111', 'h', 'h', 'jh', '0111111111', '', 'gh@gmail.com', '$2b$10$KCx3D9K/MNVVoiRp.a/KRunXnpL55/5PhEw0u.NnQ1t8dlkpJ.SB6', NULL, NULL, '2025-04-06 09:42:35', 'farmer_vehicle'),
(9, 'w11111111', 'farmer_w11111111', 'A', 'B', 'HH', '014', '', '665@gmail.com', '$2b$10$phPTLPqpTQA.ZwbCHElODev38f1CihmQ58ELkZZgf3sPDzw2zq.zK', NULL, NULL, '2025-04-06 11:24:07', 'farmer_vehicle');

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
(2, 'Wenu@9284u92', 100.00, 20.00, 2000.00, 10.00, 10.00, 10.00, 2030.00, 5.00, 5.00, 5.00, 2015.00, '2025-03-05 11:16:05', 'Approved'),
(3, '14529', 100.00, 20.00, 2000.00, 4.00, 10.00, 6.00, 2020.00, 5.00, 5.00, 5.00, 2005.00, '2025-03-05 14:40:14', 'Approved'),
(4, 'Wenu@9284u92', 520.00, 20.00, 10400.00, 444.00, 10.00, 6.00, 10860.00, 5.00, 5.00, 5.00, 10845.00, '2025-03-05 15:11:18', 'Approved'),
(5, 'Wenu@9284u92', 100.00, 20.00, 2000.00, 100.00, 10.00, 10.00, 2120.00, 5.00, 5.00, 5.00, 2105.00, '2025-03-27 10:38:13', 'Pending'),
(6, 'Wenu@9284u979', 100.00, 300.00, 30000.00, 100.00, 10.00, 6.00, 30116.00, 5.00, 5.00, 5.00, 30101.00, '2025-03-27 11:06:22', 'Pending');

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

--
-- Dumping data for table `tea_packet_requests`
--

INSERT INTO `tea_packet_requests` (`request_id`, `userId`, `teaPacketType`, `teaPacketSize`, `amount`, `requestDate`, `status`, `paymentoption`) VALUES
(5, 'Wenu@9284u979', 'Green Tea', '5kg', 10, '2025-03-23', 'Pending', 'cash'),
(6, 'Wenu@9284u92', 'Black Tea', '10kg', 5, '2025-03-22', 'Approved', 'deductpayment'),
(7, 'Wenu@9284u92', 'Herbal Tea', '5kg', 8, '2025-03-21', 'Rejected', 'cash'),
(8, 'Wenu@9284u979', 'White Tea', '2kg', 15, '2025-03-20', 'Pending', 'deductpayment');

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
(1, 'Wenu@9284u979', '2025-03-13', 600.00, 78.00, 0.00, 0.00, 0.00, 0.00, 522.00);

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
-- Indexes for table `tea_packet_requests`
--
ALTER TABLE `tea_packet_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `userId` (`userId`);

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
  MODIFY `advn_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `employeeaccounts`
--
ALTER TABLE `employeeaccounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employee_payments`
--
ALTER TABLE `employee_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `farmeraccounts`
--
ALTER TABLE `farmeraccounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `farmer_payments`
--
ALTER TABLE `farmer_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `fertilizer_prices`
--
ALTER TABLE `fertilizer_prices`
  MODIFY `fertilizer_veriance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fertilizer_requests`
--
ALTER TABLE `fertilizer_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tea_packet_requests`
--
ALTER TABLE `tea_packet_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tea_sack_updates`
--
ALTER TABLE `tea_sack_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
