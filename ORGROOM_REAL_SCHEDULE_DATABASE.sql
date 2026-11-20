-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- ORGROOM updated role/account-management SQL generated from the supplied current database snapshot
-- MariaDB 10.4+ / MySQL-compatible syntax
-- Source snapshot generation: Oct 05, 2026 at 08:38 AM
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
-- Database: `orgroom_db`
--
CREATE DATABASE IF NOT EXISTS `orgroom_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `orgroom_db`;


-- --------------------------------------------------------

--
-- Table structure for table `auth_sessions`
--

CREATE TABLE `auth_sessions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_seen_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_sessions`
--

INSERT INTO `auth_sessions` (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`, `last_seen_at`) VALUES
(3, 1, '2ea92912925ebb1a86adc64d688ea57458aef7bd6a697d085f0f366921fcd5fd', '2026-10-06 02:34:09', '2026-10-05 14:34:09', '2026-10-05 14:38:25');

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

CREATE TABLE `facilities` (
  `id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `building` varchar(255) NOT NULL,
  `building_code` varchar(100) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `type` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'AVAILABLE',
  `amenities` text NOT NULL DEFAULT '[]',
  `source_label` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`id`, `name`, `building`, `building_code`, `capacity`, `type`, `description`, `status`, `amenities`, `source_label`) VALUES
(1, 'BDO Building Room 1', 'BDO Building', 'BDO', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'BDO Building Room 1'),
(2, 'Building A Room 1', 'Building A', 'A', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'Building A Room 1'),
(3, 'Building B Room 1', 'Building B', 'B', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'Building B Room 1'),
(4, 'Computer Laboratory BDO Building Near Library', 'BDO Building', 'BDO-CL', NULL, 'Computer Laboratory', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'Computer Laboratory BDO Building Near Library'),
(5, 'Computer Laboratory CBS', 'CBS', 'CBS-CL', NULL, 'Computer Laboratory', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'Computer Laboratory CBS'),
(6, 'Computer Laboratory Room 11', 'School Building', 'SCH-CL', NULL, 'Computer Laboratory', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'Computer Laboratory Room 11'),
(7, 'SHS Campus Room 1', 'SHS Campus', 'SHS', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'SHS Campus Room 1'),
(8, 'SHS Campus Room 2', 'SHS Campus', 'SHS', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'SHS Campus Room 2'),
(9, 'SHS Campus Room 3', 'SHS Campus', 'SHS', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'SHS Campus Room 3'),
(10, 'SHS Campus Room 4', 'SHS Campus', 'SHS', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'SHS Campus Room 4'),
(11, 'SHS Campus Room 5', 'SHS Campus', 'SHS', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'SHS Campus Room 5'),
(12, 'SHS Campus Room 6', 'SHS Campus', 'SHS', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'SHS Campus Room 6'),
(13, 'SHS Computer Laboratory', 'SHS Campus', 'SHS', NULL, 'Computer Laboratory', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'SHS Computer Laboratory'),
(14, 'School Building Activity Area', 'School Building', 'SCH', NULL, 'Activity Area', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Activity Area'),
(15, 'School Building Chemistry Laboratory', 'School Building', 'SCH', NULL, 'Laboratory', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Chemistry Laboratory'),
(16, 'School Building Room 1', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 1'),
(17, 'School Building Room 10', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 10'),
(18, 'School Building Room 11', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 11'),
(19, 'School Building Room 14', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 14'),
(20, 'School Building Room 15', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 15'),
(21, 'School Building Room 2', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 2'),
(22, 'School Building Room 3', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 3'),
(23, 'School Building Room 4', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 4'),
(24, 'School Building Room 5', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 5'),
(25, 'School Building Room 6', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 6'),
(26, 'School Building Room 7', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 7'),
(27, 'School Building Room 8', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 8'),
(28, 'School Building Room 9', 'School Building', 'SCH', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'School Building Room 9'),
(29, 'TECHVOC Building Room 1', 'TECHVOC Building', 'TECHVOC', NULL, 'Classroom', 'Facility listed in FL_1st-Sem-AY-2026-2027-FINAL.xlsx.', 'AVAILABLE', '[]', 'TECHVOC Building Room 1');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `recipient_user_id` int(11) NOT NULL,
  `notification_type` varchar(60) NOT NULL,
  `reservation_id` int(11) DEFAULT NULL,
  `event_key` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_user_id`, `notification_type`, `reservation_id`, `event_key`, `title`, `message`, `is_read`, `read_at`, `created_at`) VALUES
(1, 1, 'NEW_RESERVATION_REQUEST', 1, 'reservation:1:NEW_RESERVATION_REQUEST:2026-10-05_13:50:52:admin:1', 'New reservation request', 'ORGROOM Teacher (teacher@cmdi.edu.ph) submitted School Building — School Building Room 1 for 2026-10-05 · 06:00 PM - 07:00 PM. Purpose: cxfv xzfgbvfbg f', 0, NULL, '2026-10-05 13:50:52'),
(2, 2, 'NEW_RESERVATION_REQUEST', 1, 'reservation:1:NEW_RESERVATION_REQUEST:2026-10-05_13:50:52:user:2', 'Reservation request submitted', 'Your request for School Building — School Building Room 1 on 2026-10-05 · 06:00 PM - 07:00 PM is now pending admin review.', 0, NULL, '2026-10-05 13:50:58'),
(3, 1, 'NEW_RESERVATION_REQUEST', 2, 'reservation:2:NEW_RESERVATION_REQUEST:2026-10-05_13:52:25:admin:1', 'New reservation request', 'ORGROOM Teacher (teacher@cmdi.edu.ph) submitted BDO Building — BDO Building Room 1 for 2026-10-05 · 07:00 PM - 08:00 PM. Purpose: ds', 0, NULL, '2026-10-05 13:52:25'),
(4, 2, 'NEW_RESERVATION_REQUEST', 2, 'reservation:2:NEW_RESERVATION_REQUEST:2026-10-05_13:52:25:user:2', 'Reservation request submitted', 'Your request for BDO Building — BDO Building Room 1 on 2026-10-05 · 07:00 PM - 08:00 PM is now pending admin review.', 0, NULL, '2026-10-05 13:52:39'),
(5, 1, 'NEW_RESERVATION_REQUEST', 3, 'reservation:3:NEW_RESERVATION_REQUEST:2026-10-05_14:15:07:user:1', 'Reservation request submitted', 'Your request for School Building — School Building Room 1 on 2026-10-05 · 07:00 PM - 08:00 PM is now pending admin review.', 0, NULL, '2026-10-05 14:15:07');

-- --------------------------------------------------------

--
-- Table structure for table `notification_email_deliveries`
--

CREATE TABLE `notification_email_deliveries` (
  `id` bigint(20) NOT NULL,
  `notification_id` bigint(20) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `delivery_status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `attempts` int(11) NOT NULL DEFAULT 0,
  `sent_at` datetime DEFAULT NULL,
  `error_message` varchar(1000) DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_email_deliveries`
--

INSERT INTO `notification_email_deliveries` (`id`, `notification_id`, `recipient_email`, `delivery_status`, `attempts`, `sent_at`, `error_message`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin@cmdi.edu.ph', 'SENT', 1, '2026-10-05 13:50:58', '', '2026-10-05 13:50:52', '2026-10-05 13:50:58'),
(2, 2, 'teacher@cmdi.edu.ph', 'SENT', 1, '2026-10-05 13:51:04', '', '2026-10-05 13:50:58', '2026-10-05 13:51:04'),
(3, 3, 'admin@cmdi.edu.ph', 'SENT', 1, '2026-10-05 13:52:39', '', '2026-10-05 13:52:25', '2026-10-05 13:52:39'),
(4, 4, 'teacher@cmdi.edu.ph', 'SENT', 1, '2026-10-05 13:52:58', '', '2026-10-05 13:52:39', '2026-10-05 13:52:58'),
(5, 5, 'admin@cmdi.edu.ph', 'SENT', 1, '2026-10-05 14:15:12', '', '2026-10-05 14:15:07', '2026-10-05 14:15:12');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_role` varchar(30) NOT NULL DEFAULT 'TEACHER',
  `organization_name` varchar(255) DEFAULT '',
  `facility_id` int(11) DEFAULT NULL,
  `room_name` varchar(255) NOT NULL,
  `building` varchar(255) NOT NULL,
  `reservation_date` date NOT NULL,
  `time_slot` varchar(50) NOT NULL,
  `attendees` int(11) NOT NULL DEFAULT 0,
  `purpose` varchar(500) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `admin_notes` text DEFAULT NULL,
  `decision_by_user_id` int(11) DEFAULT NULL,
  `decision_at` datetime DEFAULT NULL,
  `priority` tinyint(1) NOT NULL DEFAULT 0,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `user_id`, `user_name`, `user_email`, `user_role`, `organization_name`, `facility_id`, `room_name`, `building`, `reservation_date`, `time_slot`, `attendees`, `purpose`, `event_type`, `status`, `admin_notes`, `decision_by_user_id`, `decision_at`, `priority`, `submitted_at`, `updated_at`) VALUES
(1, 2, 'ORGROOM Teacher', 'teacher@cmdi.edu.ph', 'teacher', 'Academic Faculty', 16, 'School Building Room 1', 'School Building', '2026-10-05', '06:00 PM - 07:00 PM', 30, 'cxfv xzfgbvfbg f', 'Academic Lecture', 'PENDING', '', NULL, NULL, 1, '2026-10-05 13:50:52', '2026-10-05 13:50:52'),
(2, 2, 'ORGROOM Teacher', 'teacher@cmdi.edu.ph', 'teacher', 'Academic Faculty', 1, 'BDO Building Room 1', 'BDO Building', '2026-10-05', '07:00 PM - 08:00 PM', 30, 'ds', 'Academic Lecture', 'PENDING', '', NULL, NULL, 1, '2026-10-05 13:52:25', '2026-10-05 13:52:25'),
(3, 1, 'ORGROOM Administrator', 'admin@cmdi.edu.ph', 'admin', 'MB', 16, 'School Building Room 1', 'School Building', '2026-10-05', '07:00 PM - 08:00 PM', 30, 'KN LJ', 'Academic Lecture', 'PENDING', '', NULL, NULL, 0, '2026-10-05 14:15:07', '2026-10-05 14:15:07');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_reminders`
--

CREATE TABLE `reservation_reminders` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `reminder_type` varchar(20) NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `sent_at` datetime DEFAULT NULL,
  `delivery_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  `error_message` varchar(1000) DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_usage_checks`
--

CREATE TABLE `room_usage_checks` (
  `id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `checked_by_user_id` int(11) DEFAULT NULL,
  `usage_status` varchar(30) NOT NULL DEFAULT 'NOT_CHECKED',
  `checked_at` datetime DEFAULT NULL,
  `note` varchar(1000) DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(30) NOT NULL DEFAULT 'TEACHER',
  `organization` varchar(255) DEFAULT '',
  `department` varchar(255) DEFAULT '',
  `position` varchar(255) DEFAULT '',
  `is_verified` tinyint(1) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  CONSTRAINT `chk_users_role` CHECK (`role` IN ('TEACHER','ADMIN','SUPER_ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `organization`, `department`, `position`, `is_verified`, `is_active`, `created_at`) VALUES
(1, 'ORGROOM Administrator', 'admin@cmdi.edu.ph', '$2a$12$Cdo.5dSWoEVdS9NPsUlTsuQ4na0btWwDUQD9j2pnq36fXVh188b.u', 'ADMIN', '', '', 'Administrator', 1, 1, '2026-09-30 08:22:34'),
(2, 'ORGROOM Teacher', 'teacher@cmdi.edu.ph', '$2a$12$Qxs8LBbAWgxmX5f3.EPZEuMkLi5WubnTeTxkx2HBR8C1ydV0HA7dK', 'TEACHER', 'Academic Faculty', 'Academic Faculty', 'teacher', 1, 1, '2026-10-05 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `verification_codes`
--

CREATE TABLE `verification_codes` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `purpose` varchar(30) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `attempts` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_room_schedule`
-- (See below for the actual view)
--
CREATE TABLE `v_room_schedule` (
`id` int(11)
,`room_name` varchar(255)
,`building` varchar(255)
,`day_of_week` varchar(10)
,`start_time` time
,`end_time` time
,`course_code` varchar(80)
,`course_title` varchar(255)
,`program` varchar(255)
,`year_block` varchar(255)
,`instructor` varchar(255)
,`term_start` date
,`term_end` date
,`term_dates_text` varchar(255)
);

-- --------------------------------------------------------

--
-- Table structure for table `weekly_room_schedules`
--

CREATE TABLE `weekly_room_schedules` (
  `id` int(11) NOT NULL,
  `facility_id` int(11) NOT NULL,
  `day_of_week` varchar(10) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `activity_name` varchar(255) NOT NULL DEFAULT '',
  `course_code` varchar(80) DEFAULT '',
  `course_title` varchar(255) DEFAULT '',
  `program` varchar(255) DEFAULT '',
  `year_block` varchar(255) DEFAULT '',
  `instructor` varchar(255) DEFAULT '',
  `term_start` date DEFAULT NULL,
  `term_end` date DEFAULT NULL,
  `term_dates_text` varchar(255) DEFAULT '',
  `source_sheet` varchar(255) DEFAULT '',
  `source_header` varchar(255) DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `weekly_room_schedules`
--

INSERT INTO `weekly_room_schedules` (`id`, `facility_id`, `day_of_week`, `start_time`, `end_time`, `activity_name`, `course_code`, `course_title`, `program`, `year_block`, `instructor`, `term_start`, `term_end`, `term_dates_text`, `source_sheet`, `source_header`, `is_active`) VALUES
(1, 16, 'Monday', '09:00:00', '12:00:00', 'Microfinance Metrics', 'GE 213', 'Microfinance Metrics', 'BS Entrep', '2nd Year Block 2', 'Mr. Rodilito Esguerra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(2, 16, 'Monday', '13:00:00', '16:00:00', 'Entrepreneurial Mind', 'GE 211', 'Entrepreneurial Mind', 'BS Entrep', '2nd Year Block 2', 'Ms.Siera Belardo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(3, 16, 'Monday', '16:00:00', '18:00:00', 'Individual Sports', 'PE 213', 'Individual Sports', 'BS Entrep', '2nd Year Block 2', 'Mr. Lowell E. Escultura', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(4, 16, 'Tuesday', '09:00:00', '12:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Entrep', '2nd Year Block 1', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(5, 16, 'Tuesday', '13:00:00', '16:00:00', 'Microfinance Metrics', 'GE 213', 'Microfinance Metrics', 'BS Entrep', '2nd Year Block 1', 'Mr. Rodilito Esguerra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(6, 16, 'Tuesday', '16:00:00', '18:00:00', 'Individual Sports', 'PE 213', 'Individual Sports', 'BS Entrep', '2nd Year Block 1', 'Mr. Lowell E. Escultura', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(7, 16, 'Wednesday', '08:00:00', '11:00:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BS Entrep', '2nd Year Block 1', 'Mr. Julius Caesar Lita', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(8, 16, 'Wednesday', '11:00:00', '12:30:00', 'Organization and Management Concepts', 'DM 1 211', 'Organization and Management Concepts', 'BSIS', '2nd Year Block 1', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(9, 16, 'Wednesday', '13:00:00', '16:00:00', 'Market Research and Consumer Behavior', 'ENTREP 6', 'Market Research and Consumer Behavior', 'BS Entrep', '2nd Year Block 1', 'Mr.Johnny Tepase', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(10, 16, 'Wednesday', '16:00:00', '19:00:00', 'Art Appreciation', 'GE 214', 'Art Appreciation', 'BS Entrep', '2nd Year Block 1', 'Mr. Jayson Del Mundo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(11, 16, 'Thursday', '08:00:00', '11:00:00', 'Rizal\'s Life and Works', 'GE 219', 'Rizal\'s Life and Works', 'BSTM', '3rd Year Block 3', 'Ms. Bhea Sarvancia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(12, 16, 'Thursday', '12:00:00', '15:00:00', 'Tour Guiding', 'TMPE 5', 'Tour Guiding', 'BSTM', '3rd Year Block 3', 'Mr.Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(13, 16, 'Thursday', '15:00:00', '18:00:00', 'Operations Mgt. in Tourism and Hospitality Industry', 'CBMEC 1', 'Operations Mgt. in Tourism and Hospitality Industry', 'BSTM', '3rd Year Block 3', 'Ms. Irish Reene C. Franco', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(14, 16, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 0),
(15, 16, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(16, 16, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(17, 16, 'Friday', '09:00:00', '12:00:00', 'Purposive Communication', 'GE 114', 'Purposive Communication', 'BS Criminology', '1st Year Block 2', 'Ms. Mayrriell T. Ursolino', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(18, 16, 'Friday', '13:00:00', '16:00:00', 'Introduction to Criminology', 'CRIM 1', 'Introduction to Criminology', 'BS Criminology', '1st Year Block 2', 'Ms.Julianita Palma', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(19, 16, 'Saturday', '08:00:00', '11:00:00', 'International Business and Trade', 'ENTREP 11', 'International Business and Trade', 'BS Entrep', '3rd Year Block 1', 'Ms. Rossana Cacha', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(20, 16, 'Saturday', '12:00:00', '15:00:00', 'Elective 1 - Microinsurance', 'ELE 1', 'Elective 1 - Microinsurance', 'BS Entrep', '3rd Year Block 1', 'Mr. Edison Tuico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 1', 1),
(21, 21, 'Monday', '08:00:00', '11:00:00', 'Human Rights Education', 'CIJ 2', 'Human Rights Education', 'BS Criminology', '2nd Year Block 1', 'Ms. Ana Liza Magsico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(22, 21, 'Monday', '12:00:00', '15:00:00', 'Institutional Corrections', 'CA 1', 'Institutional Corrections', 'BS Criminology', '2nd Year Block 1', 'Ms. Gemamee Sebullen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(23, 21, 'Monday', '15:00:00', '19:00:00', 'Law Enforcement Organization and Administration', 'LEA 1', 'Law Enforcement Organization and Administration', 'BS Criminology', '2nd Year Block 1', 'Ms. Ana Liza Magsico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(24, 21, 'Tuesday', '09:00:00', '12:00:00', 'Entrepreneurial Behavior', 'ENTREP 1', 'Entrepreneurial Behavior', 'BS Entrep', '1st Year Block 2', 'Ms. Hydie Moralde', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(25, 21, 'Tuesday', '13:00:00', '16:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Entrep', '1st Year Block 2', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(26, 21, 'Tuesday', '16:00:00', '19:00:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BS Entrep', '1st Year Block 2', 'Mr. Jhunel Capuno', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(27, 21, 'Wednesday', '08:00:00', '11:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Entrep', '1st Year Block 3', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(28, 21, 'Wednesday', '12:00:00', '15:00:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BS Entrep', '1st Year Block 3', 'Ms. Glenda C. Castronuevo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(29, 21, 'Wednesday', '15:00:00', '18:00:00', 'Entrepreneurial Behavior', 'ENTREP 1', 'Entrepreneurial Behavior', 'BS Entrep', '1st Year Block 3', 'Ms. Hydie Moralde', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(30, 21, 'Thursday', '08:00:00', '11:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Entrep', '1st Year Block 1', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(31, 21, 'Thursday', '12:00:00', '15:00:00', 'Entrepreneurial Behavior', 'ENTREP 1', 'Entrepreneurial Behavior', 'BS Entrep', '1st Year Block 1', 'Ms. Hydie Moralde', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(32, 21, 'Thursday', '15:00:00', '18:00:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BS Entrep', '1st Year Block 1', 'Mr. Jhunel Capuno', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(33, 21, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 0),
(34, 21, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(35, 21, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(36, 21, 'Friday', '08:00:00', '11:00:00', 'National Service Training Program I/CWTS 1', 'NSTP 111', 'National Service Training Program I/CWTS 1', 'BS Entrep', '1st Year Block 1', 'Ms. Hydie Moralde', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(37, 21, 'Friday', '12:00:00', '15:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BS Entrep', '1st Year Block 1', 'Mr.John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(38, 21, 'Friday', '15:00:00', '18:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BS Entrep', '1st Year Block 1', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(39, 21, 'Saturday', '08:00:00', '11:00:00', 'Elective 1 - Microinsurance', 'ELE 1', 'Elective 1 - Microinsurance', 'BS Entrep', '3rd Year Block 2', 'Mr. Edison Tuico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(40, 21, 'Saturday', '12:00:00', '15:00:00', 'International Business and Trade', 'ENTREP 11', 'International Business and Trade', 'BS Entrep', '3rd Year Block 2', 'Ms. Rossana Cacha', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 2', 1),
(41, 22, 'Monday', '08:00:00', '09:30:00', 'Professional Issues in Information System', 'IS 2 212', 'Professional Issues in Information System', 'BSIS', '2nd Year Block 1', 'Mr. Joshua Boone', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(42, 22, 'Monday', '09:30:00', '11:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BSIS', '2nd Year Block 1', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(43, 22, 'Monday', '11:00:00', '12:30:00', 'Organization and Management Concepts', 'DM 1 211', 'Organization and Management Concepts', 'BSIS', '2nd Year Block 1', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(44, 22, 'Tuesday', '08:00:00', '11:00:00', 'Product Testing and Packaging', 'TRACK 2', 'Product Testing and Packaging', 'BS Entrep', '3rd Year Block 1', 'Mr.Johnny Tepase', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(45, 22, 'Tuesday', '12:00:00', '15:00:00', 'Elective 2 - Microfinance Innovations', 'ELE 2', 'Elective 2 - Microfinance Innovations', 'BS Entrep', '3rd Year Year Block 1', 'Mr.John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(46, 22, 'Tuesday', '15:00:00', '18:00:00', 'Rizal\'s Life and Works', 'GEE 319', 'Rizal\'s Life and Works', 'BS Entrep', '3rd Year Block 1', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(47, 22, 'Wednesday', '08:00:00', '11:00:00', 'Business Simulation 2', 'TRACK 4', 'Business Simulation 2', 'BS Entrep', '4th Year Block 1', 'Mr. Rodilito Esguerra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(48, 22, 'Wednesday', '12:00:00', '15:00:00', 'Programs and Policies on Enterprise Development', 'ENTREP 16', 'Programs and Policies on Enterprise Development', 'BS Entrep', '4th Year Block 1', 'Ms. Hydie Moralde', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(49, 22, 'Thursday', '08:00:00', '11:00:00', 'Human Resources Management', 'ENTREP 12', 'Human Resources Management', 'BS Entrep', '2nd Year Block 2', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(50, 22, 'Thursday', '12:00:00', '15:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Entrep', '2nd Year Block 2', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(51, 22, 'Thursday', '15:00:00', '18:00:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BS Entrep', '2nd Year Block 2', 'Mr. Julius Caesar Lita', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(52, 22, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 0),
(53, 22, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(54, 22, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(55, 22, 'Friday', '08:00:00', '11:00:00', 'National Service Training Program I/CWTS 1', 'NSTP 111', 'National Service Training Program I/CWTS 1', 'BS Entrep', '1st Year Block 3', 'Ms. Gemamee Sebullen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(56, 22, 'Friday', '12:00:00', '15:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BS Entrep', '1st Year Block 3', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(57, 22, 'Friday', '15:00:00', '18:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BS Entrep', '1st Year Block 3', 'Mr.John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(58, 22, 'Saturday', '07:30:00', '10:30:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BS Entrep', '1st Year Block 4', 'Ms. Jolette Stevens', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(59, 22, 'Saturday', '10:30:00', '12:30:00', 'PATHFit 1', 'PE 111', 'PATHFit 1', 'BS Entrep', '1st Year Block 4', 'Mr. Jerome Pacia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 3', 1),
(60, 23, 'Monday', '09:00:00', '12:00:00', 'Microfinance Models', 'MF 312', 'Microfinance Models', 'BSA', '3rd Year Block 1', 'Mr. John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(61, 23, 'Monday', '13:30:00', '16:30:00', 'Gender and Society', 'GE 219', 'Gender and Society', 'BSA', '3rd Year Block 1', 'Ms. Denise Grace', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(62, 23, 'Tuesday', '08:00:00', '09:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', '3rd Year Block 2', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(63, 23, 'Tuesday', '09:30:00', '11:00:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', '3rd Year Block 2', 'Ms. Thelma Magampon', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(64, 23, 'Tuesday', '12:00:00', '15:00:00', 'Rizal\'s Life and Works', 'GEE 319', 'Rizal\'s Life and Works', 'BS Entrep', '3rd Year Block 1', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(65, 23, 'Tuesday', '15:00:00', '16:30:00', 'Elective 2 - Microfinance Innovations', 'ELE 2', 'Elective 2 - Microfinance Innovations', 'BS Entrep', '3rd Year Year Block 2', 'Mr.John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(66, 23, 'Tuesday', '16:30:00', '19:00:00', 'Product Testing and Packaging', 'TRACK 2', 'Product Testing and Packaging', 'BS Entrep', '3rd Year Block 2', 'Mr.Johnny Tepase', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(67, 23, 'Wednesday', '09:00:00', '11:00:00', 'Product Testing and Packaging', 'TRACK 2', 'Product Testing and Packaging', 'BS Entrep', '3rd Year Block 1', 'Mr.Johnny Tepase', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(68, 23, 'Wednesday', '12:00:00', '15:00:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', '3rd Year Block 1', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(69, 23, 'Wednesday', '15:00:00', '18:00:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', '3rd Year Block 1', 'Ms. Thelma Magampon', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(70, 23, 'Thursday', '13:30:00', '16:30:00', 'Rizal\'s Life and Works', 'GE 319', 'Rizal\'s Life and Works', 'BSIS', '3rd Year Block 2', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(71, 23, 'Thursday', '16:30:00', '19:30:00', 'Business Process Management', 'DM 3 313', 'Business Process Management', 'BSIS', '3rd Year Block 1', 'Mr. Hensonn Palomado', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(72, 23, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 0),
(73, 23, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(74, 23, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(75, 23, 'Friday', '09:00:00', '12:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BS Entrep', '1st Year Block 4', 'Mr.Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(76, 23, 'Friday', '13:00:00', '16:00:00', 'Entrepreneurial Behavior', 'ENTREP 1', 'Entrepreneurial Behavior', 'BS Entrep', '1st Year Block 4', 'Ms. Hydie Moralde', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(77, 23, 'Friday', '16:00:00', '19:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Entrep', '1st Year Block 4', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(78, 23, 'Friday', '25:30:00', '26:00:00', 'FIRST SEMESTER / AY 2026-2027', 'FIRST SEMESTER / AY 2026-2027', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 0),
(79, 23, 'Friday', '26:00:00', '26:30:00', 'CLASS SCHEDULE', 'CLASS SCHEDULE', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 0),
(80, 23, 'Saturday', '09:30:00', '12:30:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BS Entrep', '1st Year Block 2', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(81, 23, 'Saturday', '13:30:00', '16:30:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BS Entrep', '1st Year Block 2', 'Dr. Raymond Christopher Paran', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 4', 1),
(82, 24, 'Monday', '31:30:00', '35:00:00', 'Professional Issues in Information System', 'IS 212', 'Professional Issues in Information System', 'BS Information Systems', 'CMS Batch 1 &2', 'Mr. Joshua Boone', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(83, 24, 'Monday', '45:30:00', '46:00:00', 'MONDAY', 'MONDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(84, 24, 'Monday', '47:00:00', '51:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(85, 24, 'Monday', '52:30:00', '57:00:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Thelma Magampon', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(86, 24, 'Tuesday', '12:30:00', '16:00:00', 'Accounting Information System Research Methods', 'AE 6', 'Accounting Information System Research Methods', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Ms. Rein Romari Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(87, 24, 'Tuesday', '31:30:00', '35:00:00', 'Professional Issues in Information System', 'IS 212', 'Professional Issues in Information System', 'BS Information Systems', 'CMS Batch 1 &2', 'Mr. Joshua Boone', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(88, 24, 'Tuesday', '45:30:00', '46:00:00', 'TUESDAY', 'TUESDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(89, 24, 'Tuesday', '47:00:00', '51:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(90, 24, 'Tuesday', '52:30:00', '57:00:00', 'Team Sports', 'PE 224', 'Team Sports', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Kayela Menise Guevarra', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(91, 24, 'Wednesday', '31:30:00', '35:00:00', 'Professional Issues in Information System', 'IS 212', 'Professional Issues in Information System', 'BS Information Systems', 'CMS Batch 1 &2', 'Mr. Joshua Boone', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(92, 24, 'Wednesday', '45:30:00', '46:00:00', 'WEDNESDAY', 'WEDNESDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(93, 24, 'Wednesday', '47:00:00', '51:30:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Thelma Magampon', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(94, 24, 'Wednesday', '52:30:00', '59:00:00', 'Elective 2: Microfinance Innovations', 'ELE 2', 'Elective 2: Microfinance Innovations', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. John Leo Dominguez', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(95, 24, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(96, 24, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(97, 24, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(98, 24, 'Thursday', '31:30:00', '35:00:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(99, 24, 'Thursday', '45:30:00', '46:00:00', 'THURSDAY', 'THURSDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(100, 24, 'Thursday', '52:30:00', '59:30:00', 'Elective 2: Microfinance Innovations', 'ELE 2', 'Elective 2: Microfinance Innovations', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. John Leo Dominguez', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(101, 24, 'Friday', '25:30:00', '26:00:00', 'FRIDAY', 'FRIDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(102, 24, 'Friday', '45:30:00', '46:00:00', 'FRIDAY', 'FRIDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(103, 24, 'Friday', '47:00:00', '51:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(104, 24, 'Friday', '52:30:00', '57:00:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Thelma Magampon', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(105, 24, 'Saturday', '25:30:00', '26:00:00', 'SATURDAY', 'SATURDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(106, 24, 'Saturday', '27:00:00', '30:30:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(107, 24, 'Saturday', '31:30:00', '35:00:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(108, 24, 'Saturday', '45:30:00', '46:00:00', 'SATURDAY', 'SATURDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(109, 24, 'Saturday', '47:00:00', '51:30:00', 'Team Sports', 'PE 224', 'Team Sports', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Kayela Menise Guevarra', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(110, 25, 'Monday', '08:00:00', '11:30:00', 'Social Entrepreneurship', 'ENTREP 15', 'Social Entrepreneurship', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Siera B. Belardo', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(111, 25, 'Monday', '12:30:00', '16:00:00', 'Art Appreciation', 'GE 214', 'Art Appreciation', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. Jerome Biñas', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(112, 25, 'Tuesday', '08:00:00', '11:30:00', 'Art Appreciation', 'GE 214', 'Art Appreciation', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. Jerome Biñas', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(113, 25, 'Tuesday', '12:30:00', '17:30:00', 'Product Research and Development', 'TRACK 1', 'Product Research and Development', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. Arol Shervanne Sarino', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(114, 25, 'Wednesday', '08:00:00', '12:00:00', 'Product Research and Development', 'TRACK 1', 'Product Research and Development', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. Arol Shervanne Sarino', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(115, 25, 'Wednesday', '13:00:00', '16:30:00', 'Social Entrepreneurship', 'ENTREP 15', 'Social Entrepreneurship', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Siera B. Belardo', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(116, 25, 'Thursday', '08:00:00', '11:30:00', 'Social Entrepreneurship', 'ENTREP 15', 'Social Entrepreneurship', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Siera B. Belardo', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(117, 25, 'Thursday', '12:30:00', '17:30:00', 'Product Research and Development', 'TRACK 1', 'Product Research and Development', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. Arol Shervanne Sarino', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(118, 25, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 0),
(119, 25, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(120, 25, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(121, 25, 'Friday', '08:00:00', '12:00:00', 'Product Research and Development', 'TRACK 1', 'Product Research and Development', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. Arol Shervanne Sarino', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(122, 25, 'Friday', '13:00:00', '16:30:00', 'Art Appreciation', 'GE 214', 'Art Appreciation', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. Jerome Biñas', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(123, 25, 'Saturday', '25:00:00', '25:30:00', 'FIRST SEMESTER / AY 2026-2027', 'FIRST SEMESTER / AY 2026-2027', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 0),
(124, 25, 'Saturday', '25:30:00', '26:00:00', 'CLASS SCHEDULE', 'CLASS SCHEDULE', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 0),
(125, 26, 'Monday', '08:00:00', '11:30:00', 'Data Warehouse and Management', 'PrE 7', 'Data Warehouse and Management', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(126, 26, 'Monday', '12:30:00', '16:00:00', 'Professional Electives 1 - Business Analytics', 'ELE 1', 'Professional Electives 1 - Business Analytics', 'BS Accounting Information Systems', 'CMS Batch 1 Block 2', 'Mr. Julius Lita', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(127, 26, 'Monday', '27:00:00', '30:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(128, 26, 'Monday', '31:30:00', '35:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(129, 26, 'Monday', '45:30:00', '46:00:00', 'MONDAY', 'MONDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(130, 26, 'Monday', '47:00:00', '51:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(131, 26, 'Monday', '52:30:00', '57:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(132, 26, 'Monday', '66:30:00', '67:00:00', 'MONDAY', 'MONDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(133, 26, 'Monday', '68:00:00', '72:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(134, 26, 'Tuesday', '08:00:00', '11:30:00', 'Professional Electives 1 - Business Analytics', 'ELE 1', 'Professional Electives 1 - Business Analytics', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Julius Lita', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(135, 26, 'Tuesday', '31:30:00', '37:00:00', 'Rhythmic Activities', 'PE 122', 'Rhythmic Activities', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(136, 26, 'Tuesday', '45:30:00', '46:00:00', 'TUESDAY', 'TUESDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(137, 26, 'Tuesday', '47:00:00', '51:30:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Mr. Hensonn Palomado', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(138, 26, 'Tuesday', '52:30:00', '57:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(139, 26, 'Tuesday', '66:30:00', '67:00:00', 'TUESDAY', 'TUESDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(140, 26, 'Tuesday', '68:00:00', '72:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(141, 26, 'Tuesday', '78:00:00', '80:00:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(142, 26, 'Wednesday', '08:00:00', '11:30:00', 'Data Warehouse and Management', 'PrE 7', 'Data Warehouse and Management', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(143, 26, 'Wednesday', '27:00:00', '30:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(144, 26, 'Wednesday', '31:30:00', '35:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(145, 26, 'Wednesday', '45:30:00', '46:00:00', 'WEDNESDAY', 'WEDNESDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(146, 26, 'Wednesday', '47:00:00', '51:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(147, 26, 'Wednesday', '52:30:00', '57:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(148, 26, 'Wednesday', '57:00:00', '59:00:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(149, 26, 'Wednesday', '66:30:00', '67:00:00', 'WEDNESDAY', 'WEDNESDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(150, 26, 'Wednesday', '68:00:00', '72:30:00', 'Conceptual Framework and Accounting Standards', 'AE 13', 'Conceptual Framework and Accounting Standards', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Clark Hannah Baloncio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(151, 26, 'Wednesday', '73:30:00', '80:00:00', 'Microfinance Models', 'MF 122', 'Microfinance Models', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Mr. John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(152, 26, 'Thursday', '08:00:00', '11:30:00', 'Professional Electives 1 - Business Analytics', 'ELE 1', 'Professional Electives 1 - Business Analytics', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Julius Lita', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(153, 26, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(154, 26, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(155, 26, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(156, 26, 'Thursday', '35:30:00', '37:30:00', 'Rhythmic Activities', 'PE 122', 'Rhythmic Activities', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(157, 26, 'Thursday', '45:30:00', '46:00:00', 'THURSDAY', 'THURSDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(158, 26, 'Thursday', '47:00:00', '51:30:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Mr. Hensonn Palomado', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(159, 26, 'Thursday', '56:00:00', '58:30:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(160, 26, 'Thursday', '66:30:00', '67:00:00', 'THURSDAY', 'THURSDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(161, 26, 'Thursday', '68:00:00', '72:30:00', 'Conceptual Framework and Accounting Standards', 'AE 13', 'Conceptual Framework and Accounting Standards', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Clark Hannah Baloncio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(162, 26, 'Thursday', '73:30:00', '80:30:00', 'Microfinance Models', 'MF 122', 'Microfinance Models', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Mr. John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(163, 26, 'Friday', '08:00:00', '11:30:00', 'Data Warehouse and Management', 'PrE 7', 'Data Warehouse and Management', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(164, 26, 'Friday', '27:00:00', '30:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(165, 26, 'Friday', '31:30:00', '35:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(166, 26, 'Friday', '45:30:00', '46:00:00', 'FRIDAY', 'FRIDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(167, 26, 'Friday', '47:00:00', '51:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(168, 26, 'Friday', '52:30:00', '57:00:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Mr. Hensonn Palomado', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(169, 26, 'Friday', '66:30:00', '67:00:00', 'FRIDAY', 'FRIDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(170, 26, 'Friday', '68:00:00', '72:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(171, 26, 'Friday', '73:30:00', '78:00:00', 'Conceptual Framework and Accounting Standards', 'AE 13', 'Conceptual Framework and Accounting Standards', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Clark Hannah Baloncio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(172, 26, 'Friday', '78:00:00', '80:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(173, 26, 'Saturday', '25:30:00', '26:00:00', 'SATURDAY', 'SATURDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(174, 26, 'Saturday', '45:30:00', '46:00:00', 'SATURDAY', 'SATURDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(175, 26, 'Saturday', '47:00:00', '51:30:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Atty.Samuel John Domjoe Abarcar', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0);
INSERT INTO `weekly_room_schedules` (`id`, `facility_id`, `day_of_week`, `start_time`, `end_time`, `activity_name`, `course_code`, `course_title`, `program`, `year_block`, `instructor`, `term_start`, `term_end`, `term_dates_text`, `source_sheet`, `source_header`, `is_active`) VALUES
(176, 26, 'Saturday', '52:30:00', '57:00:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Atty.Samuel John Domjoe Abarcar', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(177, 26, 'Saturday', '66:30:00', '67:00:00', 'SATURDAY', 'SATURDAY', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(178, 26, 'Saturday', '68:00:00', '72:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Atty.Samuel John Domjoe Abarcar', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(179, 26, 'Saturday', '73:30:00', '78:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Atty.Samuel John Domjoe Abarcar', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(180, 26, 'Monday', '08:00:00', '11:30:00', 'Data Warehouse and Management', 'PrE 7', 'Data Warehouse and Management', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(181, 26, 'Monday', '12:30:00', '16:00:00', 'Professional Electives 1 - Business Analytics', 'ELE 1', 'Professional Electives 1 - Business Analytics', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Julius Lita', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(182, 26, 'Monday', '25:30:00', '26:00:00', 'MONDAY', 'MONDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(183, 26, 'Monday', '27:00:00', '30:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(184, 26, 'Monday', '31:30:00', '35:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Rosemarie Catapang', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(185, 26, 'Monday', '45:30:00', '46:00:00', 'MONDAY', 'MONDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(186, 26, 'Monday', '47:00:00', '51:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(187, 26, 'Monday', '52:30:00', '57:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(188, 26, 'Monday', '66:30:00', '67:00:00', 'MONDAY', 'MONDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(189, 26, 'Tuesday', '08:00:00', '11:30:00', 'Professional Electives 1 - Business Analytics', 'ELE 1', 'Professional Electives 1 - Business Analytics', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Julius Lita', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(190, 26, 'Tuesday', '12:30:00', '16:00:00', 'Accounting Information System Research Methods', 'AE 6', 'Accounting Information System Research Methods', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Ms. Rein Romari Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(191, 26, 'Tuesday', '25:30:00', '26:00:00', 'TUESDAY', 'TUESDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(192, 26, 'Tuesday', '27:00:00', '30:30:00', 'International Business and Trade', 'AE 5', 'International Business and Trade', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Leo Flores', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(193, 26, 'Tuesday', '31:30:00', '36:00:00', 'Team Sports', 'PE 224', 'Team Sports', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Kayela Menise Guevarra', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(194, 26, 'Tuesday', '45:30:00', '46:00:00', 'TUESDAY', 'TUESDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(195, 26, 'Tuesday', '47:00:00', '51:30:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Mr. Hensonn Palomado', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(196, 26, 'Tuesday', '52:30:00', '57:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(197, 26, 'Tuesday', '66:30:00', '67:00:00', 'TUESDAY', 'TUESDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(198, 26, 'Tuesday', '78:00:00', '80:00:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(199, 26, 'Wednesday', '08:00:00', '11:30:00', 'Data Warehouse and Management', 'PrE 7', 'Data Warehouse and Management', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(200, 26, 'Wednesday', '25:30:00', '26:00:00', 'WEDNESDAY', 'WEDNESDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(201, 26, 'Wednesday', '27:00:00', '30:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(202, 26, 'Wednesday', '31:30:00', '35:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Rosemarie Catapang', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(203, 26, 'Wednesday', '45:30:00', '46:00:00', 'WEDNESDAY', 'WEDNESDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(204, 26, 'Wednesday', '47:00:00', '51:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(205, 26, 'Wednesday', '52:30:00', '57:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(206, 26, 'Wednesday', '57:00:00', '59:00:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(207, 26, 'Wednesday', '66:30:00', '67:00:00', 'WEDNESDAY', 'WEDNESDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(208, 26, 'Wednesday', '73:30:00', '80:00:00', 'Microfinance Models', 'MF 122', 'Microfinance Models', 'BS Accounting Information Systems', 'CMS Batch 3', 'Mr. John Leo Dominguez', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(209, 26, 'Thursday', '08:00:00', '11:30:00', 'Professional Electives 1 - Business Analytics', 'ELE 1', 'Professional Electives 1 - Business Analytics', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Julius Lita', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(210, 26, 'Thursday', '12:30:00', '18:30:00', 'Accounting Information System Research Methods', 'AE 6', 'Accounting Information System Research Methods', 'BS Accounting Information Systems', 'CMS Batch 1 Block 2', 'Ms. Rein Romari Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(211, 26, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(212, 26, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(213, 26, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(214, 26, 'Thursday', '25:30:00', '26:00:00', 'THURSDAY', 'THURSDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(215, 26, 'Thursday', '27:00:00', '30:30:00', 'International Business and Trade', 'AE 5', 'International Business and Trade', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Leo Flores', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(216, 26, 'Thursday', '31:30:00', '35:00:00', 'International Business and Trade', 'AE 5', 'International Business and Trade', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Leo Flores', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(217, 26, 'Thursday', '45:30:00', '46:00:00', 'THURSDAY', 'THURSDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(218, 26, 'Thursday', '47:00:00', '51:30:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Mr. Hensonn Palomado', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(219, 26, 'Thursday', '56:00:00', '58:30:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(220, 26, 'Thursday', '66:30:00', '67:00:00', 'THURSDAY', 'THURSDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(221, 26, 'Thursday', '73:30:00', '80:30:00', 'Microfinance Models', 'MF 122', 'Microfinance Models', 'BS Accounting Information Systems', 'CMS Batch 3', 'Mr. John Leo Dominguez', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(222, 26, 'Friday', '08:00:00', '11:30:00', 'Data Warehouse and Management', 'PrE 7', 'Data Warehouse and Management', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(223, 26, 'Friday', '13:30:00', '19:00:00', 'Accounting Information System Research Methods', 'AE 6', 'Accounting Information System Research Methods', 'BS Accounting Information Systems', 'CMS Batch 1 Block 2', 'Ms. Rein Romari Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(224, 26, 'Friday', '25:30:00', '26:00:00', 'FRIDAY', 'FRIDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(225, 26, 'Friday', '27:00:00', '30:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(226, 26, 'Friday', '31:30:00', '35:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Rosemarie Catapang', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(227, 26, 'Friday', '45:30:00', '46:00:00', 'FRIDAY', 'FRIDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(228, 26, 'Friday', '47:00:00', '51:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Ryan Lapitan', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(229, 26, 'Friday', '52:30:00', '57:00:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Mr. Hensonn Palomado', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(230, 26, 'Friday', '66:30:00', '67:00:00', 'FRIDAY', 'FRIDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(231, 26, 'Friday', '78:00:00', '80:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(232, 26, 'Saturday', '08:00:00', '12:00:00', 'Accounting Information System Research Methods', 'AE 6', 'Accounting Information System Research Methods', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Ms. Rein Romari Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(233, 26, 'Saturday', '13:00:00', '17:30:00', 'Accounting Information System Research Methods', 'AE 6', 'Accounting Information System Research Methods', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Ms. Rein Romari Malabana', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(234, 26, 'Saturday', '25:30:00', '26:00:00', 'SATURDAY', 'SATURDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(235, 26, 'Saturday', '27:00:00', '31:30:00', 'Team Sports', 'PE 224', 'Team Sports', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Kayela Menise Guevarra', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(236, 26, 'Saturday', '45:30:00', '46:00:00', 'SATURDAY', 'SATURDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(237, 26, 'Saturday', '47:00:00', '51:30:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Atty.Samuel John Domjoe Abarcar', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(238, 26, 'Saturday', '52:30:00', '57:00:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Atty.Samuel John Domjoe Abarcar', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(239, 26, 'Saturday', '66:30:00', '67:00:00', 'SATURDAY', 'SATURDAY', '', '', '', '', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(240, 26, 'Saturday', '68:00:00', '72:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Atty.Samuel John Domjoe Abarcar', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(241, 26, 'Saturday', '73:30:00', '78:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Atty.Samuel John Domjoe Abarcar', '2026-08-03', '2026-09-05', 'August 3 2026 -September 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(242, 27, 'Monday', '08:00:00', '11:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BS Criminology', '1st Year Block 1', 'Sch. Bldg. Rm 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(243, 27, 'Monday', '08:00:00', '11:00:00', 'Mathematics in the Modern World', 'GE 113', 'Mathematics in the Modern World', 'BS Criminology', '1st Year Block 1', 'Sch. Bldg. Rm 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(244, 27, 'Monday', '12:00:00', '15:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BS Criminology', '1st Year Block 1', 'Sch. Bldg. Rm 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(245, 27, 'Monday', '12:00:00', '15:00:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BS Criminology', '1st Year Block 2', 'Sch. Bldg. Rm 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(246, 27, 'Monday', '15:00:00', '18:00:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BS Criminology', '1st Year Block 1', 'Sch. Bldg. Rm 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(247, 27, 'Monday', '15:00:00', '18:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BS Criminology', '1st Year Block 2', 'Sch. Bldg. Rm 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(248, 27, 'Tuesday', '08:00:00', '12:00:00', 'Fundamentals of Criminal Investigation and Intelligence', 'CDI 1', 'Fundamentals of Criminal Investigation and Intelligence', 'BS Criminology', '2nd Year Block 1', 'Ms. Ana Liza Magsico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(249, 27, 'Tuesday', '13:00:00', '16:00:00', 'Introduction to Criminology', 'CRIM 1', 'Introduction to Criminology', 'BS Criminology', '1st Year Block 1', 'Ms. Julianita Palma', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(250, 27, 'Wednesday', '09:30:00', '11:00:00', 'First Aid and Water Safety', 'PE 213', 'First Aid and Water Safety', 'BS Criminology', '2nd Year Block 2', 'Sch. Bldg. Rm. 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(251, 27, 'Wednesday', '12:00:00', '15:00:00', 'Philippine Popular Culture', 'GEE 212', 'Philippine Popular Culture', 'BS Criminology', '2nd Year Block 1', 'Sch. Bldg. Rm. 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(252, 27, 'Wednesday', '12:00:00', '15:00:00', 'Rizal\'s Life and Works', 'GEE 219', 'Rizal\'s Life and Works', 'BS Criminology', '2nd Year Block 2', 'Sch. Bldg. Rm. 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(253, 27, 'Wednesday', '15:00:00', '18:00:00', 'Rizal\'s Life and Works', 'GEE 219', 'Rizal\'s Life and Works', 'BS Criminology', '2nd Year Block 1', 'Sch. Bldg. Rm. 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(254, 27, 'Wednesday', '15:00:00', '18:00:00', 'Philippine Popular Culture', 'GEE 212', 'Philippine Popular Culture', 'BS Criminology', '2nd Year Block 2', 'Sch. Bldg. Rm. 8', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(255, 27, 'Thursday', '09:00:00', '12:00:00', 'National Service Training Program I/CWTS 1', 'NSTP 111', 'National Service Training Program I/CWTS 1', 'BSIS', '1st Year Block 1', 'Ms. Gemamee Sebullen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(256, 27, 'Thursday', '13:00:00', '16:00:00', 'Entrepreneurial Mind', 'GE 211', 'Entrepreneurial Mind', 'BS Entrep', '2nd Year Block 1', 'Ms.Siera Belardo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(257, 27, 'Thursday', '16:00:00', '19:00:00', 'Human Resources Management', 'ENTREP 12', 'Human Resources Management', 'BS Entrep', '2nd Year Block 1', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(258, 27, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 0),
(259, 27, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(260, 27, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(261, 27, 'Friday', '08:00:00', '11:00:00', 'Mathematics in the Modern World', 'GE 113', 'Mathematics in the Modern World', 'BS Criminology', '1st Year Block 1', 'Mr. Julius Lita', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(262, 27, 'Friday', '12:00:00', '15:00:00', 'Purposive Communication', 'GE 114', 'Purposive Communication', 'BS Criminology', '1st Year Block 1', 'Ms. Mayrriell T. Ursolino', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(263, 27, 'Saturday', '09:30:00', '12:30:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BS Entrep', '1st Year Block 1', 'Dr. Raymond Christopher Paran', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(264, 27, 'Saturday', '13:30:00', '15:30:00', 'PATHFit 1', 'PE 111', 'PATHFit 1', 'BS Entrep', '1st Year Block 1', 'Mr. Jerome Pacia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 8', 1),
(265, 28, 'Monday', '08:00:00', '11:00:00', 'Rizal\'s Life and Works', 'GE 219', 'Rizal\'s Life and Works', 'BSTM', '3rd Year Block 2', 'Ms. Bhea Sarvancia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(266, 28, 'Monday', '12:00:00', '15:00:00', 'Operations Mgt. in Tourism and Hospitality Industry', 'CBMEC 1', 'Operations Mgt. in Tourism and Hospitality Industry', 'BSTM', '3rd Year Block 2', 'Ms. Irish Reene C. Franco', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(267, 28, 'Monday', '15:00:00', '16:30:00', 'Tour Guiding', 'TMPE 5', 'Tour Guiding', 'BSTM', '3rd Year Block 2', 'Mr.Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(268, 28, 'Monday', '16:30:00', '19:30:00', 'Gender and Society', 'GE 313', 'Gender and Society', 'BSTM', '3rd Year Block 2', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(269, 28, 'Tuesday', '09:00:00', '12:00:00', 'Strategic Management', 'CBME 4', 'Strategic Management', 'BS Entrep', '4th Year Block 1', 'Mr. Rodilito Esguerra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(270, 28, 'Tuesday', '13:00:00', '16:00:00', 'Social Entrepreneurship', 'ENTREP 15', 'Social Entrepreneurship', 'BS Entrep', '4th Year Block 1', 'Ms. Siera Belardo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(271, 28, 'Tuesday', '16:00:00', '18:00:00', 'Business Simulation 2', 'TRACK 4', 'Business Simulation 2', 'BS Entrep', '4th Year Block 1', 'Mr. Rodilito Esguerra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(272, 28, 'Wednesday', '08:00:00', '11:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BS Entrep', '1st Year Block 4', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(273, 28, 'Wednesday', '12:00:00', '15:00:00', 'National Service Training Program I/CWTS 1', 'NSTP 111', 'National Service Training Program I/CWTS 1', 'BS Entrep', '1st Year Block 4', 'Ms. Gemamee Sebullen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(274, 28, 'Wednesday', '15:00:00', '18:00:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BS Entrep', '1st Year Block 4', 'Ms. Glenda C. Castronuevo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(275, 28, 'Thursday', '08:00:00', '11:00:00', 'Programs and Policies on Enterprise Development', 'ENTREP 16', 'Programs and Policies on Enterprise Development', 'BS Entrep', '4th Year Block 2', 'Ms. Hydie Moralde', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(276, 28, 'Thursday', '12:30:00', '14:30:00', 'Business Simulation 2', 'TRACK 4', 'Business Simulation 2', 'BS Entrep', '4th Year Block 2', 'Mr.Johnny Tepase', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(277, 28, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 0),
(278, 28, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(279, 28, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(280, 28, 'Friday', '08:30:00', '11:30:00', 'Social Entrepreneurship', 'ENTREP 15', 'Social Entrepreneurship', 'BS Entrep', '4th Year Block 2', 'Ms. Siera Belardo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(281, 28, 'Friday', '12:30:00', '15:30:00', 'Business Simulation 2', 'TRACK 4', 'Business Simulation 2', 'BS Entrep', '4th Year Block 2', 'Mr.Johnny Tepase', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(282, 28, 'Friday', '15:30:00', '18:30:00', 'Strategic Management', 'CBME 4', 'Strategic Management', 'BS Entrep', '4th Year Block 2', 'Mr. Rodilito Esguerra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(283, 28, 'Saturday', '08:30:00', '10:30:00', 'PATHFit 1', 'PE 111', 'PATHFit 1', 'BS Entrep', '1st Year Block 3', 'Mr. Jerome Pacia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(284, 28, 'Saturday', '11:30:00', '14:30:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BS Entrep', '1st Year Block 3', 'Ms. Jolette Stevens', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 9', 1),
(285, 17, 'Monday', '13:00:00', '16:00:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSIS', '1st Year Block 2', 'Ms.Marion Punzalan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(286, 17, 'Monday', '16:00:00', '19:00:00', 'Microfinance Development', 'MF 111', 'Microfinance Development', 'BSIS', '1st Year Block 2', 'Ms. Siera Belardo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(287, 17, 'Tuesday', '08:00:00', '11:00:00', 'Strategic Management', 'CBME 2', 'Strategic Management', 'BSA', '4th Year Block 1', 'Mr. Demetrio Asacta', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(288, 17, 'Tuesday', '12:30:00', '15:30:00', 'Strategic Business Analysis', 'AE 26', 'Strategic Business Analysis', 'BSA', '4th Year Block 1', 'Mr. Leoncio Flores', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(289, 17, 'Tuesday', '16:30:00', '19:30:00', 'Microfinance Development', 'MF 111', 'Microfinance Development', 'BSA/BSAIS', '1st Year Block 2', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(290, 17, 'Wednesday', '09:30:00', '11:00:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSA/BSAIS', '1st Year Block 3', 'Ms.Charlene Mae Belo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(291, 17, 'Wednesday', '12:00:00', '13:30:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSA/BSAIS', '1st Year Block 3', 'Ms.Charlene Mae Belo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(292, 17, 'Wednesday', '13:30:00', '16:30:00', 'Financial Accounting and Reporting', 'AE 15', 'Financial Accounting and Reporting', 'BSA/BSAIS', '1st Year Block 3', 'Ms. Clark Hannah Baloncio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(293, 17, 'Wednesday', '16:30:00', '18:30:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSA/BSAIS', '1st Year Block 3', 'Ms. Rhegin Napod', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(294, 17, 'Thursday', '08:00:00', '11:00:00', 'Auditing in a CIS Environment', 'PrE 5', 'Auditing in a CIS Environment', 'BSA', '4th Year Block 1', 'Ms. Rein Romari Malabana', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(295, 17, 'Thursday', '12:00:00', '15:00:00', 'Accountancy Research', 'AE 8', 'Accountancy Research', 'BSA/BSAIS', '4th Year Block 1', 'Ms. Thelma Magampon', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(296, 17, 'Thursday', '15:00:00', '18:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BSA/BSAIS', '1st Year Block 1', 'Ms. Bhea Sarvancia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(297, 17, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 0),
(298, 17, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(299, 17, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(300, 17, 'Friday', '08:00:00', '11:00:00', 'Managerial Economics', 'AE 11', 'Managerial Economics', 'BSA/BSAIS', '1st Year Block 3', 'Ms. Thelma Magampon', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(301, 17, 'Friday', '12:00:00', '15:00:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BSA/BSAIS', '1st Year Block 3', 'Mr. Julius Lita', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(302, 17, 'Friday', '15:00:00', '18:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BSA/BSAIS', '1st Year Block 3', 'Ms. Bhea Sarvancia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(303, 17, 'Saturday', '08:00:00', '11:00:00', 'Accounting for Government and Non-Profit Organizations', 'PrE 8', 'Accounting for Government and Non-Profit Organizations', 'BSA', '4th Year Block 1', 'Mr. John Benvers Malabanan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(304, 17, 'Saturday', '12:00:00', '15:00:00', 'Accounting for Special Transactions', 'PrE 6', 'Accounting for Special Transactions', 'BSA', '3rd Year Block 1', 'Mr. John Benvers Malabanan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 10', 1),
(305, 18, 'Tuesday', '09:30:00', '12:30:00', 'Financial Accounting and Reporting', 'AE 15', 'Financial Accounting and Reporting', 'BSA/BSAIS', '1st Year Block 2', 'Ms. Clark Hannah Baloncio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 11', 1),
(306, 18, 'Tuesday', '13:30:00', '16:30:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSA/BSAIS', '1st Year Block 2', 'Ms.Charlene Mae Belo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 11', 1),
(307, 18, 'Tuesday', '16:30:00', '19:30:00', 'Microfinance Development', 'MF 111', 'Microfinance Development', 'BSA/BSAIS', '1st Year Block 2', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 11', 1),
(308, 18, 'Wednesday', '13:00:00', '16:00:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSIS', '1st Year Block 1', 'Ms.Marion Punzalan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 1),
(309, 18, 'Thursday', '09:00:00', '11:00:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSA/BSAIS', '1st Year Block 1', 'Ms. Rhegin Napod', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 1),
(310, 18, 'Thursday', '12:00:00', '15:00:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSA/BSAIS', '1st Year Block 1', 'Ms. Myael Ursolino', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 1),
(311, 18, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 0),
(312, 18, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 1),
(313, 18, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 1),
(314, 18, 'Friday', '08:00:00', '09:30:00', 'Global Culture and Tourism Geogrpahy', 'TPC 9', 'Global Culture and Tourism Geogrpahy', 'BSTM', '4th Year Block 2', 'Mr. Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 1),
(315, 18, 'Friday', '09:30:00', '12:30:00', 'Introduction to MICE', 'TPC 11', 'Introduction to MICE', 'BSTM', '4th Year Block 2', 'Ms.Irish Reene Franco', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 1),
(316, 19, 'Monday', '09:00:00', '12:00:00', 'National Service Training Program I/CWTS 1', 'NSTP 111', 'National Service Training Program I/CWTS 1', 'BS Entrep', '1st Year Block 2', 'Ms. Hydie Moralde', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(317, 19, 'Monday', '13:00:00', '16:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BS Entrep', '1st Year Block 2', 'Mr.John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(318, 19, 'Monday', '16:00:00', '18:00:00', 'PATHFit 1', 'PE 111', 'PATHFit 1', 'BS Entrep', '1st Year Block 2', 'Mr. Jerome Pacia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(319, 19, 'Tuesday', '08:00:00', '11:00:00', 'Cost Accounting and Control', 'AE 24', 'Cost Accounting and Control', 'BSA/BSAIS', '2nd Year Block 1', 'Mr. Demetrio Asacta', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(320, 19, 'Tuesday', '12:00:00', '15:00:00', 'Income Taxation', 'AE 28', 'Income Taxation', 'BSA/BSAIS', '2nd Year Block 1', 'Ms. Rein Romari Malabana', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(321, 19, 'Tuesday', '16:00:00', '19:00:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSIS', '1st Year Block 2', 'Ms.Marion Punzalan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(322, 19, 'Tuesday', '24:30:00', '27:30:00', 'Cost Accounting and Control', 'AE 24', 'Cost Accounting and Control', 'BSA/BSAIS', '2nd Year Block 1', 'Mr. Demetrio Asacta', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 0),
(323, 19, 'Wednesday', '08:00:00', '09:30:00', 'Professional Issues in Information System', 'IS 2 212', 'Professional Issues in Information System', 'BSIS', '2nd Year Block 1', 'Dr. Pilar Fandino', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(324, 19, 'Wednesday', '09:30:00', '12:30:00', 'Entrepreneurial Mind', 'GE 211', 'Entrepreneurial Mind', 'BSIS', '2nd Year Block 1', 'Ms.Siera Belardo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(325, 19, 'Wednesday', '13:30:00', '16:30:00', 'Financial Management', 'AE 21', 'Financial Management', 'BSA/BSAIS', '2nd Year Block 1', 'Ms. Rein Romari Malabana', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(326, 19, 'Wednesday', '16:30:00', '19:30:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BSA/BSAIS', '2nd Year Block 1', 'Mr. Ken Jarvie Juinio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(327, 19, 'Thursday', '08:00:00', '11:00:00', 'Intermediate Accounting 2', 'AE 18', 'Intermediate Accounting 2', 'BSA/BSAIS', '2nd Year Block 1', 'Mr. Fracis Mateos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(328, 19, 'Thursday', '12:00:00', '13:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BSA/BSAIS', '2nd Year Block 1', 'Mr. Ryan Lapitan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(329, 19, 'Thursday', '13:30:00', '15:30:00', 'Individual Sports', 'PE 213', 'Individual Sports', 'BSA/BSAIS', '2nd Year Block 1', 'Ms. Kayela Menise Guevarra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(330, 19, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 0),
(331, 19, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(332, 19, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(333, 19, 'Friday', '08:00:00', '11:00:00', 'Financial Accounting and Reporting', 'AE 15', 'Financial Accounting and Reporting', 'BSA/BSAIS', '1st Year Block 1', 'Ms. Clark Hannah Baloncio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(334, 19, 'Friday', '12:00:00', '15:00:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BSA/BSAIS', '1st Year Block 1', 'Mr. Micky Kalaw', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(335, 19, 'Friday', '15:00:00', '18:00:00', 'Microfinance Development', 'MF 111', 'Microfinance Development', 'BSA/BSAIS', '1st Year Block 1', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(336, 19, 'Saturday', '08:00:00', '11:00:00', 'Purposive Communication', 'GE 115', 'Purposive Communication', 'BSA/BSAIS', '2nd Year Block 1', 'Ms. Altheya Polly Comia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(337, 19, 'Saturday', '12:00:00', '15:00:00', 'Business Laws and Regulations', 'AE 2', 'Business Laws and Regulations', 'BSA/BSAIS', '2nd Year Block 1', 'Atty. Peter Gian Marc Reyes', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 14', 1),
(338, 20, 'Monday', '08:00:00', '11:00:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BSTM', '1st Year Block 3', 'Ms. Charlene Mae T. Belo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(339, 20, 'Monday', '12:00:00', '15:00:00', 'National Service Training Program I/CWTS 1', 'NSTP 111', 'National Service Training Program I/CWTS 1', 'BSTM', '1st Year Block 3', 'Ms. Ana Liza Magsico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(340, 20, 'Monday', '16:00:00', '18:00:00', 'Individual Sports', 'PE 213', 'Individual Sports', 'BSIS', '2nd Year Block 1', 'Mr. Danelle Fajot', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(341, 20, 'Tuesday', '08:00:00', '11:00:00', 'Auditing and Assurance Principles', 'PrE 1', 'Auditing and Assurance Principles', 'BSA', '3rd Year Block 1', 'Mr. Jesus Rene Belen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(342, 20, 'Tuesday', '12:00:00', '15:00:00', 'Auditing and Assurance: Concepts and Applications 1', 'PrE 2', 'Auditing and Assurance: Concepts and Applications 1', 'BSA', '3rd Year Block 1', 'Mr. Jesus Rene Belen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(343, 20, 'Tuesday', '15:30:00', '18:30:00', 'Comparative Models in Policing', 'LEA 2', 'Comparative Models in Policing', 'BS Criminology', '2nd Year Block 1', 'Ms. Gemamee Sebullen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(344, 20, 'Wednesday', '08:00:00', '11:00:00', 'Gender and Society', 'GE 219', 'Gender and Society', 'BSA', '3rd Year Block 1', 'Ms. Denise Grace', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(345, 20, 'Wednesday', '12:00:00', '15:00:00', 'Statistical Analysis with Software Application', 'AE 9', 'Statistical Analysis with Software Application', 'BSA', '3rd Year Block 1', 'Mr. Julius Caesar Lita', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(346, 20, 'Wednesday', '16:30:00', '19:30:00', 'Ecotourism Management', 'TMPE 4', 'Ecotourism Management', 'BSTM', '3rd Year Block 1', 'Mr.Jaireh Barbosa', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(347, 20, 'Thursday', '09:30:00', '12:30:00', 'Microfinance Models', 'MF 312', 'Microfinance Models', 'BSA', '3rd Year Block 1', 'Mr. John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(348, 20, 'Thursday', '14:00:00', '17:00:00', 'Rizal\'s Life and Works', 'GE 319', 'Rizal\'s Life and Works', 'BSA', '3rd Year Block 1', 'Mr. Rommel Leron', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(349, 20, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 0);
INSERT INTO `weekly_room_schedules` (`id`, `facility_id`, `day_of_week`, `start_time`, `end_time`, `activity_name`, `course_code`, `course_title`, `program`, `year_block`, `instructor`, `term_start`, `term_end`, `term_dates_text`, `source_sheet`, `source_header`, `is_active`) VALUES
(350, 20, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(351, 20, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(352, 20, 'Friday', '12:00:00', '15:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BSIS', '1st Year Block 2', 'Ms. Laila Dioso', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(353, 20, 'Friday', '15:00:00', '18:00:00', 'Microfinance Development', 'MF 111', 'Microfinance Development', 'BSIS', '1st Year Block 2', 'Ms. Siera Belardo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(354, 20, 'Saturday', '08:00:00', '11:00:00', 'Professional Electives 2 - Valuation Concepts', 'ELE 2', 'Professional Electives 2 - Valuation Concepts', 'BSA', '3rd Year Block 1', 'Ms. Clark Hannah Baloncio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(355, 20, 'Saturday', '12:00:00', '15:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BSA/BSAIS', '1st Year Block 1', 'Ms. Altheya Polly Comia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 15', 1),
(356, 1, 'Monday', '09:30:00', '12:30:00', 'Managerial Economics', 'AE 11', 'Managerial Economics', 'BSA/BSAIS', '1st Year Block 2', 'Ms. Thelma Magampon', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(357, 1, 'Monday', '13:30:00', '15:30:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSA/BSAIS', '1st Year Block 2', 'Ms. Rhegin Napod', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(358, 1, 'Monday', '16:00:00', '19:00:00', 'Introduction to MICE', 'TPC 11', 'Introduction to MICE', 'BSTM', '4th Year Block 1', 'Ms.Irish Reene Franco', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(359, 1, 'Tuesday', '08:00:00', '11:00:00', 'Microfinance Development', 'MF 111', 'Microfinance Development', 'BSA/BSAIS', '1st Year Block 3', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(360, 1, 'Tuesday', '11:00:00', '12:30:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSA/BSAIS', '1st Year Block 3', 'Ms.Charlene Mae Belo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(361, 1, 'Tuesday', '13:00:00', '16:00:00', 'Market Research and Consumer Behavior', 'ENTREP 6', 'Market Research and Consumer Behavior', 'BS Entrep', '2nd Year Block 2', 'Mr.Johnny Tepase', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(362, 1, 'Tuesday', '16:00:00', '19:00:00', 'Art Appreciation', 'GE 214', 'Art Appreciation', 'BS Entrep', '2nd Year Block 2', 'Mr. Jayson Del Mundo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(363, 1, 'Wednesday', '12:00:00', '13:30:00', 'Elective 2 - Microfinance Innovations', 'ELE 2', 'Elective 2 - Microfinance Innovations', 'BS Entrep', '3rd Year Year Block 2', 'Mr.John Leo Dominguez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(364, 1, 'Wednesday', '13:30:00', '15:00:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', '3rd Year Block 2', 'Ms. Thelma Magampon', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(365, 1, 'Wednesday', '15:00:00', '16:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', '3rd Year Block 2', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(366, 1, 'Wednesday', '16:30:00', '19:00:00', 'Product Testing and Packaging', 'TRACK 2', 'Product Testing and Packaging', 'BS Entrep', '3rd Year Block 2', 'Mr.Johnny Tepase', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(367, 1, 'Thursday', '12:00:00', '15:00:00', 'Human Rights Education', 'CIJ 2', 'Human Rights Education', 'BS Criminology', '2nd Year Block 2', 'Ms. Ana Liza Magsico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(368, 1, 'Thursday', '15:00:00', '18:00:00', 'Institutional Corrections', 'CA 1', 'Institutional Corrections', 'BS Criminology', '2nd Year Block 2', 'Ms. Gemamee Sebullen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(369, 1, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 0),
(370, 1, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(371, 1, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(372, 1, 'Friday', '12:00:00', '15:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BSA/BSAIS', '1st Year Block 2', 'Ms. Bhea Sarvancia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(373, 1, 'Friday', '15:00:00', '18:00:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BSA/BSAIS', '1st Year Block 2', 'Mr. Micky Kalaw', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(374, 1, 'Saturday', '08:00:00', '12:00:00', 'Fundamentals of Criminal Investigation and Intelligence', 'CDI 1', 'Fundamentals of Criminal Investigation and Intelligence', 'BS Criminology', '2nd Year Block 2', 'Mr. Deolito Valdemar', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(375, 1, 'Saturday', '12:00:00', '15:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BSIS', '1st Year Block 1', 'Mr. Christler Tandang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BDO BUILDING ROOM 1', 1),
(376, 2, 'Monday', '08:00:00', '09:30:00', 'Global Culture and Tourism Geogrpahy', 'TPC 9', 'Global Culture and Tourism Geogrpahy', 'BSTM', '4th Year Block 2', 'Mr. Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(377, 2, 'Monday', '09:30:00', '12:30:00', 'Environmental Conservation in Tourism', 'TMPE 7', 'Environmental Conservation in Tourism', 'BSTM', '4th Year Block 2', 'Mr. Jaireh Barbosa', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(378, 2, 'Monday', '13:00:00', '16:00:00', 'Macro Perspective of Tourism & Hospitality', 'THC 1', 'Macro Perspective of Tourism & Hospitality', 'BSTM', '1st Year Block 4', 'Ms. Jeancel G. Dalisay', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(379, 2, 'Monday', '16:00:00', '18:00:00', 'Physical Fitness', 'PE 111', 'Physical Fitness', 'BSTM', '1st Year Block 4', 'Ms. Rhegin S. Napod', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(380, 2, 'Tuesday', '09:00:00', '12:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BSTM', '1st Year Block 3', 'Mr. Marvis Vista', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(381, 2, 'Tuesday', '13:00:00', '16:00:00', 'Macro Perspective of Tourism & Hospitality', 'THC 1', 'Macro Perspective of Tourism & Hospitality', 'BSTM', '1st Year Block 3', 'Ms. Jeancel G. Dalisay', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(382, 2, 'Wednesday', '09:00:00', '11:00:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSTM', '1st Year Block 3', 'Ms. Rhegin S. Napod', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(383, 2, 'Wednesday', '12:00:00', '15:00:00', 'Risk Mngt. as Applied to Safety, Security & Sanitation', 'THC 2', 'Risk Mngt. as Applied to Safety, Security & Sanitation', 'BSTM', '1st Year Block 3', 'Ms. Irish Reene C. Franco', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(384, 2, 'Thursday', '09:00:00', '12:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BSTM', '1st Year Block 4', 'Mr. Marvis Vista', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(385, 2, 'Thursday', '13:30:00', '16:30:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BSTM', '1st Year Block 4', 'Ms. Charlene Mae T. Belo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(386, 2, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 0),
(387, 2, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(388, 2, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(389, 2, 'Friday', '08:00:00', '11:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BSIS', '1st Year Block 1', 'Ms. Laila Dioso', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(390, 2, 'Friday', '12:00:00', '15:00:00', 'Microfinance Development', 'MF 111', 'Microfinance Development', 'BSIS', '1st Year Block 1', 'Ms. Siera Belardo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(391, 2, 'Saturday', '08:00:00', '11:00:00', 'Readings in Philippine History', 'GE 112', 'Readings in Philippine History', 'BSIS', '1st Year Block 1', 'Mr. Christler Tandang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(392, 2, 'Saturday', '12:00:00', '14:00:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSIS', '1st Year Block 2', 'Mr. Danelle Fajot', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Building A Room 1', 1),
(393, 3, 'Monday', '09:00:00', '12:00:00', 'Cruise Tourism', 'TMPE 6', 'Cruise Tourism', 'BSTM', '4th Year Block 1', 'Mr. Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(394, 3, 'Monday', '13:00:00', '16:00:00', 'Strategic Management in Tourism and Hospitality', 'CBMEC 2', 'Strategic Management in Tourism and Hospitality', 'BSTM', '4th Year Block 1', 'Mr.Jaireh Barbosa', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(395, 3, 'Tuesday', '13:00:00', '16:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BSTM', '1st Year Block 1', 'Mr. Marvis Vista', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(396, 3, 'Tuesday', '16:00:00', '19:00:00', 'Macro Perspective of Tourism & Hospitality', 'THC 1', 'Macro Perspective of Tourism & Hospitality', 'BSTM', '1st Year Block 1', 'Ms. Jeancel G. Dalisay', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(397, 3, 'Wednesday', '08:00:00', '09:30:00', 'Operations Mgt. in Tourism and Hospitality Industry', 'CBMEC 1', 'Operations Mgt. in Tourism and Hospitality Industry', 'BSTM', '3rd Year Block 1', 'Ms. Irish Reene C. Franco', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(398, 3, 'Wednesday', '09:30:00', '12:30:00', 'Prof. Development & Applied Ethics', 'THC 6', 'Prof. Development & Applied Ethics', 'BSTM', '3rd Year Block 1', 'Ms. Jeancel Dalisay', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(399, 3, 'Wednesday', '13:30:00', '16:30:00', 'Tour Guiding', 'TMPE 5', 'Tour Guiding', 'BSTM', '3rd Year Block 1', 'Mr.Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(400, 3, 'Thursday', '13:00:00', '16:00:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BS Criminology', '1st Year Block 2', 'Mr. Melvin Agnote', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(401, 3, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 0),
(402, 3, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(403, 3, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(404, 3, 'Friday', '08:30:00', '10:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BSIS', '2nd Year Block 1', 'Ms. Rosemarie Catapang', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(405, 3, 'Friday', '10:00:00', '12:00:00', 'Law Enforcement Organization and Administration', 'LEA 1', 'Law Enforcement Organization and Administration', 'BS Criminology', '2nd Year Block 2', 'Ms. Ana Liza Magsico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(406, 3, 'Friday', '13:00:00', '15:00:00', 'Law Enforcement Organization and Administration', 'LEA 1', 'Law Enforcement Organization and Administration', 'BS Criminology', '2nd Year Block 2', 'Ms. Ana Liza Magsico', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(407, 3, 'Friday', '15:00:00', '18:00:00', 'Comparative Models in Policing', 'LEA 2', 'Comparative Models in Policing', 'BS Criminology', '2nd Year Block 2', 'Ms. Gemamee Sebullen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(408, 3, 'Saturday', '09:00:00', '11:00:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSIS', '1st Year Block 1', 'Mr. Danelle Fajot', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'BUILDING B ROOM 1', 1),
(409, 18, 'Tuesday', '13:00:00', '16:00:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSA/BSAIS', '1st Year Block 2', 'Ms.Charlene Mae Belo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'Sch. Bldg.Rm.11', 1),
(410, 29, 'Tuesday', '09:30:00', '12:30:00', 'Strategic Management in Tourism and Hospitality', 'CBMEC 2', 'Strategic Management in Tourism and Hospitality', 'BSTM', '4th Year Block 2', 'TECHVOC Building Room 1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(411, 29, 'Tuesday', '09:30:00', '12:30:00', 'Managing Information and Technology', 'PrE 3', 'Managing Information and Technology', 'BSA/BSAIS', '3rd Year Block 1', 'TECHVOC BUILDING Rm.1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(412, 29, 'Tuesday', '13:30:00', '16:30:00', 'Tourism and Hospitality Marketing', 'THC 10', 'Tourism and Hospitality Marketing', 'BSTM', '4th Year Block 2', 'TECHVOC Building Rm.1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(413, 29, 'Tuesday', '13:30:00', '16:30:00', 'Rizal\'s Life and Works', 'GE 319', 'Rizal\'s Life and Works', 'BSA', '3rd Year Block 1', 'TECHVOC BUILDING Rm.1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(414, 29, 'Tuesday', '16:30:00', '19:30:00', 'Cruise Tourism', 'TMPE 6', 'Cruise Tourism', 'BSTM', '4th Year Block 2', 'TECHVOC Building Room 1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(415, 29, 'Tuesday', '16:30:00', '19:30:00', 'Statistical Analysis with Software Application', 'AE 9', 'Statistical Analysis with Software Application', 'BSAIS', '3rd Year Block 1', 'TECHVOC BUILDING Rm.1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(416, 29, 'Wednesday', '08:00:00', '11:00:00', 'Ecotourism Management', 'TMPE 4', 'Ecotourism Management', 'BSTM', '3rd Year Block 3', 'Mr.Jaireh Barbosa', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(417, 29, 'Wednesday', '12:30:00', '15:30:00', 'Gender and Society', 'GE 313', 'Gender and Society', 'BSTM', '3rd Year Block 3', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(418, 29, 'Wednesday', '15:30:00', '18:30:00', 'Prof. Development & Applied Ethics', 'THC 6', 'Prof. Development & Applied Ethics', 'BSTM', '3rd Year Block 3', 'Ms. Jeancel Dalisay', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(419, 29, 'Thursday', '08:30:00', '10:00:00', 'Operations Mgt. in Tourism and Hospitality Industry', 'CBMEC 1', 'Operations Mgt. in Tourism and Hospitality Industry', 'BSTM', '3rd Year Block 1', 'Ms. Irish Reene C. Franco', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(420, 29, 'Thursday', '10:00:00', '11:30:00', 'Foreign', 'TPC 4', 'Foreign', 'Language 1', 'BSTM', 'Ms. Rina Revel Mendoza', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(421, 29, 'Thursday', '12:30:00', '14:00:00', 'Foreign', 'TPC 4', 'Foreign', 'Language 1', 'BSTM', 'Ms. Rina Revel Mendoza', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(422, 29, 'Thursday', '14:00:00', '17:00:00', 'Foreign Language 1', 'TPC 4', 'Foreign Language 1', 'BSTM', '3rd Year Block 1', 'Ms. Rina Revel Mendoza', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(423, 29, 'Thursday', '17:00:00', '18:30:00', 'Tour Guiding', 'TMPE 5', 'Tour Guiding', 'BSTM', '3rd Year Block 2', 'Mr.Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(424, 29, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 0),
(425, 29, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(426, 29, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(427, 29, 'Friday', '09:00:00', '12:00:00', 'Environmental Conservation in Tourism', 'TMPE 7', 'Environmental Conservation in Tourism', 'BSTM', '4th Year Block 1', 'Mr. Jaireh Barbosa', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(428, 29, 'Friday', '13:00:00', '16:00:00', 'Global Culture and Tourism Geogrpahy', 'TPC 9', 'Global Culture and Tourism Geogrpahy', 'BSTM', '4th Year Block 1', 'Mr. Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(429, 29, 'Friday', '16:00:00', '19:00:00', 'Tourism and Hospitality Marketing', 'THC 10', 'Tourism and Hospitality Marketing', 'BSTM', '4th Year Block 1', 'Ms. Mara Shaira Matanguihan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'TECHVOC BUILDING ROOM 1', 1),
(430, 7, 'Tuesday', '13:30:00', '16:30:00', 'Art Appreciation', 'GE 219', 'Art Appreciation', 'BSTM', '2nd Year Block 1', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(431, 7, 'Tuesday', '16:30:00', '19:30:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BSTM', '2nd Year Block 1', 'Mr. Ken Jarvie Juinio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(432, 7, 'Wednesday', '08:00:00', '11:00:00', 'National Service Training Program I/CWTS 1', 'NSTP 111', 'National Service Training Program I/CWTS 1', 'BSIS', '1st Year Block 2', 'Ms. Gemamee Sebullen', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(433, 7, 'Wednesday', '11:00:00', '12:30:00', 'Introduction to Computing', 'CC1 111', 'Introduction to Computing', 'BSIS', '1st Year Block 2', 'Ms. Alfin Delgado', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(434, 7, 'Wednesday', '13:30:00', '16:30:00', 'Understanding the', 'GE 111', 'Understanding the', 'Self', 'BSTM', 'SHS Campus Room 1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(435, 7, 'Wednesday', '13:30:00', '16:30:00', 'National Service Training Program 1', 'NSTP 111', 'National Service Training Program 1', 'BSTM', '1st Year Block 2', 'SHS Campus Room 1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(436, 7, 'Wednesday', '16:30:00', '19:30:00', 'National Service Training Program 1', 'NSTP 111', 'National Service Training Program 1', 'BSTM', '1st Year Block 1', 'Room 1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(437, 7, 'Wednesday', '16:30:00', '19:30:00', 'Understanding the Self', 'GE 111', 'Understanding the Self', 'BS Entrep', '1st Year Block 2', 'Room 1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(438, 7, 'Thursday', '13:30:00', '16:30:00', 'Microfinance and Development', 'MF 111', 'Microfinance and Development', 'BSTM', '1st Year Block 2', 'SHS Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(439, 7, 'Thursday', '16:30:00', '19:30:00', 'Macro Perspective of Tourism & Hospitality', 'THC 1', 'Macro Perspective of Tourism & Hospitality', 'BSTM', '1st Year Block 2', 'SHS Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(440, 7, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 0),
(441, 7, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(442, 7, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(443, 7, 'Friday', '14:00:00', '16:00:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSTM', '1st Year Block 2', 'SHS Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(444, 7, 'Friday', '16:00:00', '19:00:00', 'Risk Mngt. as Applied to Safety, Security & Sanitation', 'THC 2', 'Risk Mngt. as Applied to Safety, Security & Sanitation', 'BSTM', '1st Year Block 2', 'Ms. Irish Reene C. Franco', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(445, 7, 'Saturday', '08:00:00', '11:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BSA/BSAIS', '1st Year Block 2', 'SHS Bay Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(446, 7, 'Saturday', '12:30:00', '15:30:00', 'Financial Accounting and Reporting', 'AE 15', 'Financial Accounting and Reporting', 'BSA/BSAIS', '1st Year Block 2', 'SHS Bay Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 1', 1),
(447, 8, 'Wednesday', '13:30:00', '16:30:00', 'Applied Business Tools and Technologies in Tourism', 'TPC 1', 'Applied Business Tools and Technologies in Tourism', 'BSTM', '2nd Year Block 1', 'SHS Campus Rm.2', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(448, 8, 'Wednesday', '13:30:00', '16:30:00', 'Entrepreneurial Minda', 'GEE 211', 'Entrepreneurial Minda', 'BSTM', '2nd Year Block 2', 'SHS Campus Rm.2', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(449, 8, 'Wednesday', '16:30:00', '19:30:00', 'Entrepreneurial Minda', 'GEE 211', 'Entrepreneurial Minda', 'BSTM', '2nd Year Block 1', 'SHS Campus Rm.2', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(450, 8, 'Wednesday', '16:30:00', '19:30:00', 'Applied Business Tools and Technologies in Tourism', 'TPC 1', 'Applied Business Tools and Technologies in Tourism', 'BSTM', '2nd Year Block 2', 'SHS Campus Rm.2', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(451, 8, 'Thursday', '13:30:00', '16:30:00', 'Art Appreciation', 'GE 219', 'Art Appreciation', 'BSTM', '2nd Year Block 2', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(452, 8, 'Thursday', '16:30:00', '19:30:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BSTM', '2nd Year Block 2', 'Mr. Ken Jarvie Juinio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(453, 8, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 0),
(454, 8, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(455, 8, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(456, 8, 'Friday', '13:00:00', '16:00:00', 'Risk Mngt. as Applied to Safety, Security & Sanitation', 'THC 2', 'Risk Mngt. as Applied to Safety, Security & Sanitation', 'BSTM', '1st Year Block 1', 'SHS Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(457, 8, 'Friday', '16:00:00', '18:00:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSTM', '1st Year Block 1', 'SHS Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(458, 8, 'Saturday', '12:00:00', '15:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BSA/BSAIS', '1st Year Block 3', 'SHS Bay Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(459, 8, 'Saturday', '15:30:00', '18:30:00', 'Financial Accounting and Reporting', 'AE 15', 'Financial Accounting and Reporting', 'BSA/BSAIS', '1st Year Block 3', 'SHS Bay Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 2', 1),
(460, 9, 'Wednesday', '13:00:00', '16:00:00', 'National Service Training Program I/CWTS 1', 'NSTP 111', 'National Service Training Program I/CWTS 1', 'BSTM', '1st Year Block 4', 'SHS Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(461, 9, 'Wednesday', '16:00:00', '19:00:00', 'Risk Mngt. as Applied to Safety, Security & Sanitation', 'THC 2', 'Risk Mngt. as Applied to Safety, Security & Sanitation', 'BSTM', '1st Year Block 4', 'SHS Campus', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(462, 9, 'Thursday', '13:30:00', '16:30:00', 'Tour and Travel Management', 'TPC 2', 'Tour and Travel Management', 'BSTM', '2nd Year Block 3', 'Ms. Jeancel Dalisay', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(463, 9, 'Thursday', '16:30:00', '19:30:00', 'Art Appreciation', 'GE 219', 'Art Appreciation', 'BSTM', '2nd Year Block 3', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(464, 9, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 0),
(465, 9, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(466, 9, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(467, 9, 'Friday', '13:30:00', '16:30:00', 'Entrepreneurial Minda', 'GEE 211', 'Entrepreneurial Minda', 'BSTM', '2nd Year Block 3', 'Mr.Arol Shervanne Sarino', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(468, 9, 'Friday', '16:30:00', '19:30:00', 'Mathematics in the Modern World', 'GE 215', 'Mathematics in the Modern World', 'BSTM', '2nd Year Block 3', 'Mr. Ken Jarvie Juinio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(469, 9, 'Saturday', '09:00:00', '12:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BSTM', '2nd Year Block 1', 'Ms. Mary Ann Omerez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(470, 9, 'Saturday', '14:00:00', '16:00:00', 'Individual Sports', 'PE 213', 'Individual Sports', 'BSTM', '2nd Year Block 1', 'Ms. Kayela Guevarra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(471, 9, 'Saturday', '16:00:00', '19:00:00', 'Tour and Travel Management', 'TPC 2', 'Tour and Travel Management', 'BSTM', '2nd Year Block 1', 'Ms. Mara Shaira Matanguihan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 3', 1),
(472, 10, 'Tuesday', '13:30:00', '16:30:00', 'Rizal\'s Life and Works', 'GE 219', 'Rizal\'s Life and Works', 'BSTM', '3rd Year Block 1', 'Ms. Bhea Sarvancia', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 4', 1),
(473, 10, 'Tuesday', '16:30:00', '19:30:00', 'Gender and Society', 'GE 313', 'Gender and Society', 'BSTM', '3rd Year Block 1', 'Ms. Denise Grace Balogo', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 4', 1),
(474, 10, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 4', 0),
(475, 10, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 4', 1),
(476, 10, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 4', 1),
(477, 10, 'Saturday', '09:00:00', '12:00:00', 'Tour and Travel Management', 'TPC 2', 'Tour and Travel Management', 'BSTM', '2nd Year Block 2', 'Ms. Mara Shaira Matanguihan', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 4', 1),
(478, 10, 'Saturday', '13:00:00', '16:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BSTM', '2nd Year Block 2', 'Ms. Mary Ann Omerez', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 4', 1),
(479, 10, 'Saturday', '16:00:00', '18:00:00', 'Individual Sports', 'PE 213', 'Individual Sports', 'BSTM', '2nd Year Block 2', 'Ms. Kayela Guevarra', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 4', 1),
(480, 11, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 5', 0),
(481, 11, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 5', 1),
(482, 11, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 5', 1),
(483, 11, 'Friday', '13:00:00', '16:00:00', 'Prof. Development & Applied Ethics', 'THC 6', 'Prof. Development & Applied Ethics', 'BSTM', '3rd Year Block 2', 'Ms. Jeancel Dalisay', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 5', 1),
(484, 11, 'Friday', '16:00:00', '19:00:00', 'Ecotourism Management', 'TMPE 4', 'Ecotourism Management', 'BSTM', '3rd Year Block 2', 'Mr.Jaireh Barbosa', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 5', 1),
(485, 11, 'Saturday', '08:00:00', '11:00:00', 'Foreign Language 1', 'TPC 4', 'Foreign Language 1', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 5', 1),
(486, 11, 'Saturday', '12:00:00', '15:00:00', 'Tour and Travel Management', 'TPC 2', 'Tour and Travel Management', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 5', 1),
(487, 11, 'Saturday', '15:00:00', '18:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BSTM', '2nd Year Block 1', 'Ms. Mayrriell Ursolino', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 5', 1),
(488, 12, 'Tuesday', '13:00:00', '16:00:00', 'Managerial Economics', 'AE 11', 'Managerial Economics', 'BSA/BSAIS', '1st Year Block 1', 'Ms. Thelma Magampon', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 6', 1),
(489, 12, 'Tuesday', '16:00:00', '19:00:00', 'Financial Accounting and Reporting', 'AE 15', 'Financial Accounting and Reporting', 'BSA/BSAIS', '1st Year Block 1', 'Ms. Clark Hannah Baloncio', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 6', 1),
(490, 12, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 6', 0),
(491, 12, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 6', 1),
(492, 12, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'SHS BAY 2 BUILDING ROOM 6', 1),
(493, 14, 'Tuesday', '13:30:00', '15:30:00', 'First Aid and Water Safety', 'PE 213', 'First Aid and Water Safety', 'BS Criminology', '2nd Year Block 1', 'Mr. Christian Santos', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'ACTIVITY AREA', 1),
(494, 14, 'Tuesday', '16:00:00', '18:00:00', 'Fundamentals of Martial Arts', 'PE 111', 'Fundamentals of Martial Arts', 'BS Criminology', '1st Year Block 1', 'Mr. Jaireh Barbosa', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'ACTIVITY AREA', 1),
(495, 14, 'Thursday', '16:00:00', '18:00:00', 'Fundamentals of Martial Arts', 'PE 111', 'Fundamentals of Martial Arts', 'BS Criminology', '1st Year Block 2', 'Mr. Jaireh Barbosa', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'ACTIVITY AREA', 1),
(496, 14, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'ACTIVITY AREA', 0),
(497, 14, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'ACTIVITY AREA', 1),
(498, 14, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'CLASSROOMS FINALIZATION', 'ACTIVITY AREA', 1),
(499, 26, 'Monday', '08:00:00', '11:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2', 'Mr. Ryan Lapitan', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(500, 26, 'Monday', '12:30:00', '16:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2', 'Ms. Rosemarie Catapang', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(501, 26, 'Tuesday', '08:00:00', '11:30:00', 'International Business and Trade', 'AE 5', 'International Business and Trade', 'BS Accounting Information Systems', 'CMS Batch 2', 'Mr. Leoncio Flores', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(502, 26, 'Tuesday', '12:30:00', '17:00:00', 'Team Sports', 'PE 224', 'Team Sports', 'BS Entrep', 'CMS Batch 2', 'Ms. Kayela Menise Guevarra', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(503, 26, 'Wednesday', '08:00:00', '11:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2', 'Mr. Ryan Lapitan', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(504, 26, 'Wednesday', '12:30:00', '16:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2', 'Ms. Rosemarie Catapang', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(505, 26, 'Thursday', '08:00:00', '11:30:00', 'International Business and Trade', 'AE 5', 'International Business and Trade', 'BS Accounting Information Systems', 'CMS Batch 2', 'Mr. Leoncio Flores', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(506, 26, 'Thursday', '12:30:00', '16:00:00', 'International Business and Trade', 'AE 5', 'International Business and Trade', 'BS Accounting Information Systems', 'CMS Batch 2', 'Mr. Leoncio Flores', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(507, 26, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(508, 26, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(509, 26, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(510, 26, 'Friday', '08:00:00', '11:30:00', 'IT Application Tools in Business', 'AE 23', 'IT Application Tools in Business', 'BS Accounting Information Systems', 'CMS Batch 2', 'Mr. Ryan Lapitan', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(511, 26, 'Friday', '12:30:00', '16:00:00', 'Purposive Communication', 'GE 216', 'Purposive Communication', 'BS Accounting Information Systems', 'CMS Batch 2', 'Ms. Rosemarie Catapang', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(512, 26, 'Saturday', '08:00:00', '12:30:00', 'Team Sports', 'PE 224', 'Team Sports', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Kayela Menise Guevarra', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(513, 24, 'Tuesday', '12:30:00', '18:00:00', 'Rhythmic Activities', 'PE 122', 'Rhythmic Activities', 'BS Accounting Information Systems', 'CMS Batch 3 Block 1', 'Ms.Rhegin S.Napod', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(514, 24, 'Thursday', '12:30:00', '16:00:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(515, 24, 'Thursday', '16:30:00', '18:30:00', 'Rhythmic Activities', 'PE 122', 'Rhythmic Activities', 'BSAccounting Inforrmation Systems', 'CMS Batch 3', 'Ms.Rhegin S.Napod', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(516, 24, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 0),
(517, 24, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(518, 24, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(519, 24, 'Saturday', '08:00:00', '11:30:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(520, 24, 'Saturday', '12:30:00', '16:00:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 5', 1),
(521, 15, 'Monday', '07:30:00', '12:00:00', 'Market Research and Consumer Behavior', 'ENTREP 6', 'Market Research and Consumer Behavior', 'BS Entrep', 'CMS Batch 3', 'Mr. Johnny Tepase', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(522, 15, 'Monday', '13:00:00', '16:30:00', 'Art Appreciation', 'GE 214', 'Art Appreciation', 'BS Entrep', 'CMS Batch 3', 'Mr. Jerome Biñas', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(523, 15, 'Tuesday', '08:00:00', '11:30:00', 'Art Appreciation', 'GE 214', 'Art Appreciation', 'BS Entrep', 'CMS Batch 3', 'Mr. Jerome Biñas', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(524, 15, 'Tuesday', '13:00:00', '18:30:00', 'Rhythmic Activities', 'PE 122', 'Rhythmic Activities', 'BS Entrep', 'CMS Batch 3', 'Ms.Rhegin S.Napod', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(525, 15, 'Wednesday', '08:00:00', '11:30:00', 'Opportunity Seeking', 'ENTREP 2', 'Opportunity Seeking', 'BS Entrep', 'CMS Batch 3', 'Mr. Arol Shervanne Sarino', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(526, 15, 'Wednesday', '12:30:00', '19:30:00', 'Microfinance Metrics', 'MF213', 'Microfinance Metrics', 'BS Entrep', 'CMS Batch 3', 'Mr. Rodilito Esguerra', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1);
INSERT INTO `weekly_room_schedules` (`id`, `facility_id`, `day_of_week`, `start_time`, `end_time`, `activity_name`, `course_code`, `course_title`, `program`, `year_block`, `instructor`, `term_start`, `term_end`, `term_dates_text`, `source_sheet`, `source_header`, `is_active`) VALUES
(527, 15, 'Thursday', '08:00:00', '11:30:00', 'Market Research and Consumer Behavior', 'ENTREP 6', 'Market Research and Consumer Behavior', 'BS Entrep', 'CMS Batch 3', 'Mr. Johnny Tepase', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(528, 15, 'Thursday', '13:00:00', '16:30:00', 'Opportunity Seeking', 'ENTREP 2', 'Opportunity Seeking', 'BS Entrep', 'CMS Batch 3', 'Mr. Arol Shervanne Sarino', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(529, 15, 'Thursday', '16:30:00', '18:30:00', 'Rhythmic Activities', 'PE 122', 'Rhythmic Activities', 'BS Entrep', 'CMS Batch 3 Block 1', 'Ms.Rhegin S.Napod', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(530, 15, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 0),
(531, 15, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(532, 15, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(533, 15, 'Friday', '08:00:00', '11:30:00', 'Microfinance Metrics', 'MF213', 'Microfinance Metrics', 'BS Entrep', 'CMS Batch 3', 'Mr. Rodilito Esguerra', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(534, 15, 'Friday', '13:00:00', '16:30:00', 'Art Appreciation', 'GE 214', 'Art Appreciation', 'BS Entrep', 'CMS Batch 3', 'Mr. Jerome Biñas', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(535, 15, 'Friday', '16:30:00', '19:00:00', 'Market Research and Consumer Behavior', 'ENTREP 6', 'Market Research and Consumer Behavior', 'BS Entrep', 'CMS Batch 3', 'Mr. Johnny Tepase', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(536, 15, 'Saturday', '08:00:00', '11:30:00', 'Opportunity Seeking', 'ENTREP 2', 'Opportunity Seeking', 'BS Entrep', 'CMS Batch 3', 'Mr. Arol Shervanne Sarino', '2026-09-07', '2026-10-10', 'September 7-October 10, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(537, 25, 'Monday', '08:00:00', '12:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(538, 25, 'Monday', '13:30:00', '18:00:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Thelma Magampon', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(539, 25, 'Tuesday', '08:00:00', '12:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(540, 25, 'Tuesday', '13:30:00', '18:00:00', 'Team Sports', 'PE 224', 'Team Sports', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Kayela Menise Guevarra', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(541, 25, 'Wednesday', '08:00:00', '12:30:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Thelma Magampon', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(542, 25, 'Wednesday', '13:30:00', '20:00:00', 'Elective 2: Microfinance Innovations', 'ELE 2', 'Elective 2: Microfinance Innovations', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. John Leo Dominguez', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(543, 25, 'Thursday', '13:30:00', '20:30:00', 'Elective 2: Microfinance Innovations', 'ELE 2', 'Elective 2: Microfinance Innovations', 'BS Entrep', 'CMS Batch 2 Block 1', 'Mr. John Leo Dominguez', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(544, 25, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 0),
(545, 25, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(546, 25, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(547, 25, 'Friday', '08:00:00', '12:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(548, 25, 'Friday', '13:30:00', '18:00:00', 'Financial Management (Financial Analysis for Decision Making)', 'ENTREP 10', 'Financial Management (Financial Analysis for Decision Making)', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Thelma Magampon', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(549, 25, 'Saturday', '08:00:00', '12:30:00', 'Team Sports', 'PE 224', 'Team Sports', 'BS Entrep', 'CMS Batch 2 Block 1', 'Ms. Kayela Menise Guevarra', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 6', 1),
(550, 26, 'Monday', '08:00:00', '12:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(551, 26, 'Monday', '13:30:00', '18:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(552, 26, 'Tuesday', '08:00:00', '12:30:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Mr. Hensonn Palomado', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(553, 26, 'Tuesday', '13:30:00', '18:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(554, 26, 'Wednesday', '08:00:00', '12:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(555, 26, 'Wednesday', '13:30:00', '18:00:00', 'Information Systems Operations and Maintenance', 'PrE 4', 'Information Systems Operations and Maintenance', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1 &2', 'Mr. Joshua Boone', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(556, 26, 'Wednesday', '18:00:00', '20:00:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(557, 26, 'Thursday', '08:00:00', '12:30:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Hensonn Palomado', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(558, 26, 'Thursday', '13:30:00', '15:00:00', 'Accounting Information System Research Methods', 'AE 6', 'Accounting Information System Research Methods', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Ms. Rein Romari Malabana', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(559, 26, 'Thursday', '15:00:00', '16:30:00', 'Accounting Information System Research Methods', 'AE 6', 'Accounting Information System Research Methods', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Ms. Rein Romari Malabana', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(560, 26, 'Thursday', '17:00:00', '19:30:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(561, 26, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(562, 26, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(563, 26, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(564, 26, 'Friday', '08:00:00', '12:30:00', 'Management Information System', 'PrE 8', 'Management Information System', 'BS Accounting Information Systems', 'CMS Batch 1', 'Mr. Ryan Lapitan', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(565, 26, 'Friday', '13:30:00', '18:00:00', 'Professional Electives 2', 'ELE 2', 'Professional Electives 2', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Mr. Hensonn Palomado', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(566, 26, 'Saturday', '08:00:00', '12:30:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', 'BS Accounting Information Systems', 'CMS Batch 1', 'Atty.Samuel John Domjoe Abarcar', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(567, 26, 'Saturday', '13:30:00', '18:00:00', 'Regulatory Framework and Legal Issues in Business', 'AE 3', 'Regulatory Framework and Legal Issues in Business', 'BS Accounting Information Systems', 'CMS Batch 1 Block 1', 'Atty.Samuel John Domjoe Abarcar', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(568, 15, 'Monday', '13:30:00', '18:00:00', 'Organization and Management Concepts', 'DM 211', 'Organization and Management Concepts', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr.Melvin Agnote', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(569, 15, 'Tuesday', '08:00:00', '12:30:00', 'Rizal\'s Life and Work', 'GE 319', 'Rizal\'s Life and Work', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr.Benigno Edrada', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(570, 15, 'Wednesday', '13:30:00', '18:00:00', 'Organization and Management Concepts', 'DM 211', 'Organization and Management Concepts', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr.Melvin Agnote', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(571, 15, 'Thursday', '08:00:00', '12:30:00', 'Rizal\'s Life and Work', 'GE 319', 'Rizal\'s Life and Work', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr.Benigno Edrada', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(572, 15, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 0),
(573, 15, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(574, 15, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(575, 15, 'Friday', '08:00:00', '12:30:00', 'Organization and Management Concepts', 'DM 211', 'Organization and Management Concepts', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr.Melvin Agnote', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(576, 15, 'Friday', '13:30:00', '18:00:00', 'Rizal\'s Life and Work', 'GE 319', 'Rizal\'s Life and Work', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr.Benigno Edrada', '2026-10-12', '2026-11-07', 'October 12-November 7, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(577, 26, 'Monday', '08:00:00', '12:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(578, 26, 'Tuesday', '08:00:00', '12:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(579, 26, 'Tuesday', '18:00:00', '20:00:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', '', '', '', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(580, 26, 'Wednesday', '08:00:00', '12:30:00', 'Conceptual Framework and Accounting Standards', 'AE 13', 'Conceptual Framework and Accounting Standards', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Clark Hannah Baloncio', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(581, 26, 'Wednesday', '13:30:00', '20:00:00', 'Microfinance Models', 'MF 122', 'Microfinance Models', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Mr. John Leo Dominguez', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(582, 26, 'Thursday', '08:00:00', '12:30:00', 'Conceptual Framework and Accounting Standards', 'AE 13', 'Conceptual Framework and Accounting Standards', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Clark Hannah Baloncio', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(583, 26, 'Thursday', '13:30:00', '20:30:00', 'Microfinance Models', 'MF 122', 'Microfinance Models', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Mr. John Leo Dominguez', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(584, 26, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 0),
(585, 26, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(586, 26, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(587, 26, 'Friday', '08:00:00', '12:30:00', 'Gender and Society', 'GEE 313', 'Gender and Society', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Denise Grace Balogo', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(588, 26, 'Friday', '13:30:00', '18:00:00', 'Conceptual Framework and Accounting Standards', 'AE 13', 'Conceptual Framework and Accounting Standards', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1', 'Ms. Clark Hannah Baloncio', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(589, 26, 'Friday', '18:00:00', '20:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', '', '', '', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(590, 26, 'Saturday', '08:00:00', '12:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Atty.Samuel John Domjoe Abarcar', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(591, 26, 'Saturday', '13:30:00', '18:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', 'BS Accounting Information Systems', 'CMS Batch 2 Block 1&3', 'Atty.Samuel John Domjoe Abarcar', '2026-11-09', '2026-12-05', 'November 9-December 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING ROOM 7', 1),
(592, 15, 'Monday', '13:30:00', '18:00:00', 'Management Science', 'AE 4', 'Management Science', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Lorenz Nicole Duna', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(593, 15, 'Tuesday', '08:00:00', '12:30:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(594, 15, 'Tuesday', '13:30:00', '18:00:00', 'Management Science', 'AE 4', 'Management Science', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Lorenz Nicole Duna', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(595, 15, 'Tuesday', '18:00:00', '20:00:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', '', '', '', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(596, 15, 'Wednesday', '08:00:00', '12:30:00', 'Management Science', 'AE 4', 'Management Science', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Lorenz Nicole Duna', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(597, 15, 'Wednesday', '13:30:00', '20:00:00', 'Microfinance Models', 'MF 122', 'Microfinance Models', 'BS Accounting Information Systems', 'CMS Batch 3', 'Mr. John Leo Dominguez', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(598, 15, 'Thursday', '13:30:00', '20:30:00', 'Microfinance Models', 'MF 122', 'Microfinance Models', 'BS Accounting Information Systems', 'CMS Batch 3', 'Mr. John Leo Dominguez', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(599, 15, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 0),
(600, 15, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(601, 15, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(602, 15, 'Friday', '08:00:00', '12:30:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(603, 15, 'Friday', '13:30:00', '18:00:00', 'Fundamentals of Accounting 1', 'AE 13', 'Fundamentals of Accounting 1', 'BS Accounting Information Systems', 'CMS Batch 3', 'Ms. Rein Malabana', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(604, 15, 'Friday', '18:00:00', '20:30:00', 'Law on Obligation and Contracts', 'AE 1', 'Law on Obligation and Contracts', '', '', '', '2026-11-09', '2026-12-05', 'Nov. 9-Dec. 5, 2026', 'CLASSROOMS FINALIZATION', 'SCHOOL BUILDING CHEMISTRY LABORATORY', 1),
(605, 4, 'Monday', '07:30:00', '12:30:00', 'Elective 4- Supply Chain Management', 'ELE 4 414', 'Elective 4- Supply Chain Management', 'BSIS', '4th Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(606, 4, 'Monday', '13:30:00', '16:30:00', 'Strategy Management and Aquisition', 'IS 7 417', 'Strategy Management and Aquisition', 'BSIS', '4th Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(607, 4, 'Tuesday', '07:30:00', '12:30:00', 'IT Infrastructure & Network Technologies', 'IS 3 213', 'IT Infrastructure & Network Technologies', 'BSIS', '2nd Year Block 2', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(608, 4, 'Tuesday', '14:00:00', '16:00:00', 'PATHFIT', 'PE 111', 'PATHFIT', 'BSIS', '1st Year Block 2', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(609, 4, 'Tuesday', '16:00:00', '19:00:00', 'Understanding the Self', 'GEE 111', 'Understanding the Self', 'BSIS', '1st Year Block 2', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(610, 4, 'Wednesday', '07:30:00', '12:30:00', 'Elective 2- Data Mining', 'ELE 2 312', 'Elective 2- Data Mining', 'BSIS', '3rd Year Block 2', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(611, 4, 'Wednesday', '13:30:00', '18:30:00', 'Data Structures and Algorithm', 'CC 4 214', 'Data Structures and Algorithm', 'BSIS', '2nd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(612, 4, 'Thursday', '07:30:00', '12:30:00', 'Data Structures and Algorithm', 'CC 4 214', 'Data Structures and Algorithm', 'BSIS', '2nd Year Block 2', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(613, 4, 'Thursday', '13:00:00', '18:00:00', 'Introduction to Computing', 'CC1 111', 'Introduction to Computing', 'BSIS', '1st Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(614, 4, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 0),
(615, 4, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(616, 4, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(617, 4, 'Friday', '09:00:00', '12:30:00', 'IT Infrastructure & Network Technologies', 'IS 3 213', 'IT Infrastructure & Network Technologies', 'BSIS', '2nd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(618, 4, 'Friday', '13:30:00', '15:00:00', 'IT Infrastructure & Network Technologies', 'IS 3 213', 'IT Infrastructure & Network Technologies', 'BSIS', '2nd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(619, 4, 'Friday', '15:00:00', '16:30:00', 'Professional Issues in Information System', 'IS 2 212', 'Professional Issues in Information System', 'BSIS', '2nd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(620, 4, 'Friday', '16:30:00', '18:30:00', 'Individual Sports', 'PE 213', 'Individual Sports', 'BSIS', '2nd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(621, 4, 'Saturday', '08:00:00', '11:00:00', 'Project Management', 'PrE 1', 'Project Management', 'BSAIS', '3rd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(622, 4, 'Saturday', '12:00:00', '17:00:00', 'Information Systems Analysis and Design', 'PrE 2', 'Information Systems Analysis and Design', 'BSAIS', '3rd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY BDO BUILDING NEAR LIBRARY', 1),
(623, 5, 'Monday', '07:30:00', '12:30:00', 'System Analysis, Design and Development', 'IS 4 314', 'System Analysis, Design and Development', 'BSIS', '3rd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(624, 5, 'Monday', '13:30:00', '18:30:00', 'Elective 2- Data Mining', 'ELE 2 312', 'Elective 2- Data Mining', 'BSIS', '3rd Year Block 1', 'Mr. Hensonn Palomado', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(625, 5, 'Tuesday', '07:30:00', '12:30:00', 'Enterprise Architechture', 'IS 5 315', 'Enterprise Architechture', 'BSIS', '3rd Year Block 2', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(626, 5, 'Tuesday', '13:30:00', '18:30:00', 'System Analysis, Design and Development', 'IS 4 314', 'System Analysis, Design and Development', 'BSIS', '3rd Year Block 2', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(627, 5, 'Wednesday', '09:00:00', '12:00:00', 'Computer Programming 1 (Fundamentals of Programming)', 'CC2 112', 'Computer Programming 1 (Fundamentals of Programming)', 'BSIS', '1st Year Block 1', 'Mr. Joshua Boone', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(628, 5, 'Wednesday', '13:30:00', '16:30:00', 'Elective 2- Data Mining', 'ELE 2 312', 'Elective 2- Data Mining', 'BSIS', '3rd Year Block 1', 'Mr. Hensonn Palomado', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(629, 5, 'Wednesday', '16:30:00', '19:30:00', 'Rizal\'s Life and Works', 'GE 319', 'Rizal\'s Life and Works', 'BSIS', '3rd Year Block 1', 'Mr. Eric Saragina', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(630, 5, 'Thursday', '07:30:00', '12:30:00', 'Enterprise Architechture', 'IS 5 315', 'Enterprise Architechture', 'BSIS', '3rd Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(631, 5, 'Thursday', '13:00:00', '18:00:00', 'Computer Programming 1 (Fundamentals of Programming)', 'CC2 112', 'Computer Programming 1 (Fundamentals of Programming)', 'BSIS', '1st Year Block 2', 'Mr. Joshua Boone', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(632, 5, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 0),
(633, 5, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(634, 5, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(635, 5, 'Friday', '07:30:00', '12:30:00', 'Application Development and Emerging Technologies', 'CC 6 416', 'Application Development and Emerging Technologies', 'BSIS', '4th Year Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(636, 5, 'Friday', '15:00:00', '17:00:00', 'Computer Programming 1 (Fundamentals of Programming)', 'CC2 112', 'Computer Programming 1 (Fundamentals of Programming)', 'BSIS', '1st Year Block 1', 'Mr. Joshua Boone', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(637, 5, 'Saturday', '08:00:00', '13:00:00', 'Multi-Media', 'FREE ELE 413', 'Multi-Media', 'BSIS', '', '4th Year Block 1', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'COMPUTER LABORATORY CBS', 1),
(638, 6, 'Monday', '07:00:00', '12:30:00', 'IT Infrastructure and Network Technologies', 'IS 3 213', 'IT Infrastructure and Network Technologies', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr. Lloyd Dacles', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(639, 6, 'Monday', '07:00:00', '12:30:00', 'Data Structures and Algorithms', 'CC 4 214', 'Data Structures and Algorithms', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr. Lloyd Dacles', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(640, 6, 'Tuesday', '08:00:00', '12:30:00', 'Data Mining', 'ELE 2', 'Data Mining', 'BS Information Systems', 'CMS Batch 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(641, 6, 'Wednesday', '07:00:00', '12:30:00', 'IT Infrastructure and Network Technologies', 'IS 3 213', 'IT Infrastructure and Network Technologies', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Mr. Lloyd Dacles', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(642, 6, 'Wednesday', '07:00:00', '12:30:00', 'Data Structures and Algorithms', 'CC 4 214', 'Data Structures and Algorithms', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(643, 6, 'Thursday', '08:00:00', '12:30:00', 'Data Mining', 'ELE 2', 'Data Mining', 'BS Information Systems', 'CMS Batch 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(644, 6, 'Thursday', '13:30:00', '20:30:00', 'IT Infrastructure and Network Technologies', 'IS 3 213', 'IT Infrastructure and Network Technologies', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(645, 6, 'Thursday', '13:30:00', '20:30:00', 'Data Structures and Algorithms', 'CC 4 214', 'Data Structures and Algorithms', 'BS Information Systems', 'CMS Batch 1 Block 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(646, 6, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 0),
(647, 6, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(648, 6, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(649, 6, 'Friday', '08:00:00', '12:30:00', 'Data Mining', 'ELE 2', 'Data Mining', 'BS Information Systems', 'CMS Batch 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(650, 6, 'Friday', '13:30:00', '18:00:00', 'Data Mining', 'ELE 2', 'Data Mining', 'BS Information Systems', 'CMS Batch 1', 'Computer Laboratory', '2026-08-10', '2026-12-12', 'August 10, 2026 - December 12, 2026', 'Computer Laboratory', 'SCHOOL BUILDING LABORATORY - ROOM 11', 1),
(651, 13, 'Monday', '07:30:00', '12:30:00', 'Elective 4- Supply Chain Management', 'ELE 4 414', 'Elective 4- Supply Chain Management', 'BSIS', '', 'Mr. Joshua M. Boone', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(652, 13, 'Wednesday', '07:30:00', '12:30:00', 'Elective 2- Data Mining', 'ELE 2 312', 'Elective 2- Data Mining', 'BSIS', '3rd Year Block 2', 'Mr. Hensonn Palomado', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(653, 13, 'Wednesday', '13:30:00', '17:00:00', 'Introduction to Computing', 'CC1 111', 'Introduction to Computing', 'BSIS', '1st Year Block 2', 'Ms. Alfin Delgado', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(654, 13, 'Thursday', '13:00:00', '18:00:00', 'Introduction to Computing', 'CC1 111', 'Introduction to Computing', 'BSIS', '1st Year Block 1', 'Ms. Alfin Delgado', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(655, 13, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 0),
(656, 13, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(657, 13, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(658, 13, 'Saturday', '08:00:00', '11:00:00', 'Applied Business Tools and Technologies in Tourism', 'TPC 1', 'Applied Business Tools and Technologies in Tourism', 'BSTM', '2nd Year Block 2', 'Ms. Mara Shaira Matanguihan', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(659, 13, 'Saturday', '12:00:00', '15:00:00', 'Applied Business Tools and Technologies in Tourism', 'TPC 1', 'Applied Business Tools and Technologies in Tourism', 'BSTM', '2nd Year Block 3', 'Ms. Mara Shaira Matanguihan', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(660, 13, 'Saturday', '15:00:00', '18:00:00', 'Applied Business Tools and Technologies in Tourism', 'TPC 1', 'Applied Business Tools and Technologies in Tourism', 'BSTM', '2nd Year Block 1', 'Ms. Mara Shaira Matanguihan', '2026-08-24', '2026-09-05', 'August 24, 2026 - September 5, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(661, 13, 'Monday', '07:30:00', '13:00:00', 'Data Structures and Algorithms', 'CC 4 214', 'Data Structures and Algorithms', 'BS Information Systems', '', 'Mr. Lloyd Dacles', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(662, 13, 'Wednesday', '07:30:00', '13:00:00', 'Data Structures and Algorithms', 'CC 4 214', 'Data Structures and Algorithms', 'BS Information Systems', '', 'Mr. Lloyd Dacles', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(663, 13, 'Wednesday', '13:30:00', '17:00:00', 'Introduction to Computing', 'CC1 111', 'Introduction to Computing', 'BSIS', '1st Year Block 2', 'Ms. Alfin Delgado', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(664, 13, 'Thursday', '13:00:00', '19:30:00', 'Data Structures and Algorithms', 'CC 4 214', 'Data Structures and Algorithms', 'BS Information Systems', '', 'Mr. Lloyd Dacles', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(665, 13, 'Thursday', '21:30:00', '22:00:00', 'Approved By:', 'Approved By:', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 0),
(666, 13, 'Thursday', '22:00:00', '22:30:00', 'Dr. Glenda M. Lagarile', 'Dr. Glenda M. Lagarile', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(667, 13, 'Thursday', '22:30:00', '23:00:00', 'Vice President for Academic Affairs', 'Vice President for Academic Affairs', '', '', '', '', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(668, 13, 'Saturday', '08:00:00', '11:00:00', 'Applied Business Tools and Technologies in Tourism', 'TPC 1', 'Applied Business Tools and Technologies in Tourism', 'BSTM', '2nd Year Block 2', 'Ms. Mara Shaira Matanguihan', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(669, 13, 'Saturday', '12:00:00', '15:00:00', 'Applied Business Tools and Technologies in Tourism', 'TPC 1', 'Applied Business Tools and Technologies in Tourism', 'BSTM', '2nd Year Block 3', 'Ms. Mara Shaira Matanguihan', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1),
(670, 13, 'Saturday', '15:00:00', '18:00:00', 'Applied Business Tools and Technologies in Tourism', 'TPC 1', 'Applied Business Tools and Technologies in Tourism', 'BSTM', '2nd Year Block 1', 'Ms. Mara Shaira Matanguihan', '2026-10-12', '2026-11-07', 'October 12,2026-Novemeber 7, 2026', 'Computer Laboratory', 'SHS COMPUTER LABORATORY', 1);

-- --------------------------------------------------------

--
-- Structure for view `v_room_schedule`
--
DROP TABLE IF EXISTS `v_room_schedule`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_room_schedule`  AS SELECT `w`.`id` AS `id`, `f`.`name` AS `room_name`, `f`.`building` AS `building`, `w`.`day_of_week` AS `day_of_week`, `w`.`start_time` AS `start_time`, `w`.`end_time` AS `end_time`, `w`.`course_code` AS `course_code`, `w`.`course_title` AS `course_title`, `w`.`program` AS `program`, `w`.`year_block` AS `year_block`, `w`.`instructor` AS `instructor`, `w`.`term_start` AS `term_start`, `w`.`term_end` AS `term_end`, `w`.`term_dates_text` AS `term_dates_text` FROM (`weekly_room_schedules` `w` join `facilities` `f` on(`f`.`id` = `w`.`facility_id`)) WHERE `w`.`is_active` = 1 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_auth_session_token` (`token_hash`),
  ADD KEY `idx_auth_session_user` (`user_id`,`expires_at`),
  ADD KEY `idx_auth_session_expiry` (`expires_at`);

--
-- Indexes for table `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_facilities_name` (`name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_notification_recipient_event` (`recipient_user_id`,`event_key`),
  ADD KEY `idx_notifications_recipient_created` (`recipient_user_id`,`is_read`,`created_at`),
  ADD KEY `idx_notifications_reservation` (`reservation_id`);

--
-- Indexes for table `notification_email_deliveries`
--
ALTER TABLE `notification_email_deliveries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_notification_email` (`notification_id`),
  ADD KEY `idx_notification_email_status` (`delivery_status`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reservation_user` (`user_id`),
  ADD KEY `fk_reservation_decision_by` (`decision_by_user_id`),
  ADD KEY `idx_res_fac_date` (`facility_id`,`reservation_date`,`status`),
  ADD KEY `idx_res_date` (`reservation_date`,`status`);

--
-- Indexes for table `reservation_reminders`
--
ALTER TABLE `reservation_reminders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_reservation_reminder` (`reservation_id`,`reminder_type`),
  ADD KEY `idx_reminder_status` (`delivery_status`,`sent_at`);

--
-- Indexes for table `room_usage_checks`
--
ALTER TABLE `room_usage_checks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usage_reservation` (`reservation_id`),
  ADD KEY `idx_usage_status` (`usage_status`),
  ADD KEY `idx_usage_checked_at` (`checked_at`),
  ADD KEY `fk_usage_checker` (`checked_by_user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- Indexes for table `verification_codes`
--
ALTER TABLE `verification_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_verification_email_purpose` (`email`,`purpose`);

--
-- Indexes for table `weekly_room_schedules`
--
ALTER TABLE `weekly_room_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_weekly_facility_day` (`facility_id`,`day_of_week`,`start_time`,`end_time`),
  ADD KEY `idx_weekly_term` (`term_start`,`term_end`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notification_email_deliveries`
--
ALTER TABLE `notification_email_deliveries`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reservation_reminders`
--
ALTER TABLE `reservation_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `room_usage_checks`
--
ALTER TABLE `room_usage_checks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `verification_codes`
--
ALTER TABLE `verification_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weekly_room_schedules`
--
ALTER TABLE `weekly_room_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=671;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  ADD CONSTRAINT `fk_auth_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_recipient` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notification_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notification_email_deliveries`
--
ALTER TABLE `notification_email_deliveries`
  ADD CONSTRAINT `fk_notification_email_notification` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_reservation_decision_by` FOREIGN KEY (`decision_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reservation_facility` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reservation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reservation_reminders`
--
ALTER TABLE `reservation_reminders`
  ADD CONSTRAINT `fk_reminder_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_usage_checks`
--
ALTER TABLE `room_usage_checks`
  ADD CONSTRAINT `fk_usage_checker` FOREIGN KEY (`checked_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_usage_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `weekly_room_schedules`
--
ALTER TABLE `weekly_room_schedules`
  ADD CONSTRAINT `fk_weekly_facility` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
