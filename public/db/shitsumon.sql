-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 11, 2026 at 03:36 PM
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
-- Database: `shitsumon`
--

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `inventory_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `obtained_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `item_id` int(11) NOT NULL,
  `item_name` varchar(50) NOT NULL,
  `item_description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `rarity` varchar(50) DEFAULT 'Common'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`item_id`, `item_name`, `item_description`, `price`, `image_url`, `rarity`) VALUES
(1, 'Elite Satoru Figure', 'An exceptionally detailed premium action figure with custom lighting aura.', 2500.00, '/images/anime_merch_figure.png', 'Legendary'),
(2, 'Phantom Troupe Hoodie', 'Premium quality embroidered streetwear. Extremely comfortable.', 1500.00, '/images/anime_merch_hoodie.png', 'Exclusive'),
(3, 'Master Sword Replica', '1:1 scale metallic replica. Glows in the dark.', 3000.00, '/images/anime_merch_sword.png', 'Mythic'),
(4, 'Nezuko Bamboo Muzzle', 'Authentic cosplay prop made from real polished bamboo.', 500.00, '/images/anime_merch_muzzle.png', 'Rare'),
(5, 'Dragon Ball Set', 'All 7 magical orbs. Grants one wish (results may vary).', 5000.00, '/images/anime_merch_dragonballs.png', 'God-Tier'),
(6, 'Straw Hat', 'A simple straw hat. Carries the will of D.', 800.00, '/images/anime_merch_strawhat.png', 'Epic');

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `player_id` int(11) NOT NULL,
  `player_name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `yen` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(20) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`player_id`, `player_name`, `email`, `password`, `yen`, `created_at`, `role`) VALUES
(5, 'tester123', 'tester123@example.com', '$2y$10$sQ/GBTjc9YnUdKDBu4mRKORddH4E1WDjKl8xFUhzKp5Aagm0HKk2O', 0, '2026-05-01 21:03:57', 'user'),
(6, 'tester', 'tester@example.com', '$2y$10$OnFEMYWx3yDEALguJBaynuHxMoOUv6hPAcgWzz8A6hOgW4f2qr9iS', 1250, '2026-05-01 21:05:54', 'user'),
(7, 'tester_new', 'tester_new@example.com', '$2y$10$acELoFwPLAxvd78ptAbnyub47ZiiyASqRvNtP0wXOs08S68fMG3FO', 0, '2026-05-01 21:08:58', 'user'),
(8, 'jomari', 'jomari@gmail.com', '$2y$10$.f4Peedxvn.Xi3v1Oj7toOc./0YrkKq67jyYmJgcgTvrp21tbz7xa', 0, '2026-05-01 21:11:59', 'user'),
(9, 'harvy', 'harvy@gmail.com', '$2y$10$ZKR1X/Krz0KWLbpUVcwy9O.s042ypGwt1rG5ZelTAhI8Kyt546K6C', 0, '2026-05-09 17:05:39', 'user'),
(10, 'mahalmona?', 'mahalmona@gmail.com', '$2y$10$xBGWGrjn4W/KshUJ96iHSOgZ0hYRzUKwhhJTDoc7USPWYfejahLh2', 1440, '2026-05-10 01:35:37', 'user'),
(11, 'admin', 'admin@example.com', '$2y$10$vXkE0bWJ/YUs.VEgcZbWU.CaZypM.CaXMT08BBGlqtEDCCduwPjdC', 0, '2026-05-10 01:45:11', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `player_quests`
--

CREATE TABLE `player_quests` (
  `quest_record_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `quest_id` varchar(50) NOT NULL,
  `last_claimed` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `player_quests`
--

INSERT INTO `player_quests` (`quest_record_id`, `player_id`, `quest_id`, `last_claimed`) VALUES
(1, 10, 'hourly_1', '2026-05-09 19:35:48'),
(2, 10, 'hourly_2', '2026-05-09 19:37:30'),
(3, 10, 'weekly_1', '2026-05-09 19:38:27'),
(4, 10, 'daily_1', '2026-05-09 19:38:30'),
(5, 10, 'hourly_5', '2026-05-09 20:05:33'),
(6, 6, 'hourly_1', '2026-05-11 07:28:48'),
(7, 6, 'daily_1', '2026-05-11 07:28:58'),
(8, 6, 'weekly_1', '2026-05-11 07:29:08');

-- --------------------------------------------------------

--
-- Table structure for table `shop`
--

CREATE TABLE `shop` (
  `shop_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `item_name` varchar(50) NOT NULL,
  `item_description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `sold_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `statistics`
--

CREATE TABLE `statistics` (
  `stat_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `difficulty` varchar(20) DEFAULT NULL,
  `score` int(11) NOT NULL,
  `yen` int(11) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statistics`
--

INSERT INTO `statistics` (`stat_id`, `player_id`, `category_id`, `difficulty`, `score`, `yen`, `updated_at`) VALUES
(1, 10, 31, NULL, 3, 30, '2026-05-10 01:37:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`);

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`player_id`);

--
-- Indexes for table `player_quests`
--
ALTER TABLE `player_quests`
  ADD PRIMARY KEY (`quest_record_id`),
  ADD UNIQUE KEY `unique_quest_player` (`player_id`,`quest_id`);

--
-- Indexes for table `shop`
--
ALTER TABLE `shop`
  ADD PRIMARY KEY (`shop_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `statistics`
--
ALTER TABLE `statistics`
  ADD PRIMARY KEY (`stat_id`),
  ADD KEY `player_id` (`player_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `player_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `player_quests`
--
ALTER TABLE `player_quests`
  MODIFY `quest_record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `shop`
--
ALTER TABLE `shop`
  MODIFY `shop_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `statistics`
--
ALTER TABLE `statistics`
  MODIFY `stat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON UPDATE CASCADE;

--
-- Constraints for table `player_quests`
--
ALTER TABLE `player_quests`
  ADD CONSTRAINT `player_quests_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE;

--
-- Constraints for table `shop`
--
ALTER TABLE `shop`
  ADD CONSTRAINT `shop_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON UPDATE CASCADE;

--
-- Constraints for table `statistics`
--
ALTER TABLE `statistics`
  ADD CONSTRAINT `statistics_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
