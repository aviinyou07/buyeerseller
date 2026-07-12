-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: buyerseller
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_audit_logs`
--

DROP TABLE IF EXISTS `admin_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_id` bigint DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `entity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_logs`
--

LOCK TABLES `admin_audit_logs` WRITE;
/*!40000 ALTER TABLE `admin_audit_logs` DISABLE KEYS */;
INSERT INTO `admin_audit_logs` VALUES (1,1,'Category Created: Electronics','Category',5,'2026-05-28 05:49:19'),(2,1,'Approved Seller Business: Rajesh Agri-Tools Pvt Ltd','SellerProfile',1,'2026-05-30 05:49:19'),(3,1,'Updated Category: Fertilizers','Category',3,'2026-06-02 05:58:33'),(4,1,'Created Category: asdfghj','Category',207,'2026-06-02 05:59:31'),(5,1,'Created Category: asdfghjk','Category',208,'2026-06-02 05:59:56'),(6,1,'Created Category: 12345678','Category',209,'2026-06-02 06:00:15'),(7,1,'Deactivated Category: asdfghjk','Category',208,'2026-06-02 06:10:12'),(8,1,'Activated Category: asdfghjk','Category',208,'2026-06-02 06:10:13'),(9,1,'Deleted Category: asdfghj','Category',207,'2026-06-02 06:10:18'),(10,1,'Created Category: qwertyuijhgfdcvbnkjhgfdsdfghjk852825','Category',210,'2026-06-02 06:11:29'),(11,1,'Deactivated Category: asdfghjk','Category',208,'2026-06-02 06:12:13'),(12,1,'Deactivated Category: Agriculture','Category',1,'2026-06-02 06:17:47'),(13,1,'Activated Category: Agriculture','Category',1,'2026-06-02 06:17:47'),(14,1,'Deactivated Category: Agriculture','Category',1,'2026-06-02 06:17:48'),(15,1,'Activated Category: Agriculture','Category',1,'2026-06-02 06:17:57'),(16,1,'Deleted Category: asdfghjk','Category',208,'2026-06-02 06:18:14'),(17,1,'Deactivated Category: Agriculture','Category',1,'2026-06-02 06:18:48'),(18,1,'Activated Category: Agriculture','Category',1,'2026-06-02 06:18:55'),(19,1,'Deleted Category: Agriculture','Category',1,'2026-06-02 06:43:57'),(20,1,'Deleted Category: Electronics','Category',5,'2026-06-02 06:43:59'),(21,1,'Deleted Category: Fashion','Category',40,'2026-06-02 06:44:01'),(22,1,'Deleted Category: Home & Kitchen','Category',30,'2026-06-02 06:44:04'),(23,1,'Deleted Category: Vehicles','Category',20,'2026-06-02 06:44:06'),(24,1,'Created Category: jhgdfhj','Category',211,'2026-06-02 06:46:20'),(25,1,'Created Category: jknfjghbnfdjh','Category',212,'2026-06-02 06:46:56'),(26,1,'Deleted Category: jhgdfhj','Category',211,'2026-06-02 06:48:36'),(27,1,'Created Category: asdf','Category',213,'2026-06-02 17:31:46'),(28,1,'Created Category: laptop','Category',214,'2026-06-03 02:54:00'),(29,1,'Created Government Scheme: \'Pradhan Mantri Yojana\'','GovernmentScheme',3,'2026-06-03 03:07:24'),(30,1,'Updated Government Scheme: \'Pradhan Mantri Yojana\'','GovernmentScheme',3,'2026-06-03 03:15:09'),(31,1,'Updated Government Scheme: \'Pradhan Mantri Yojana\'','GovernmentScheme',3,'2026-06-03 03:15:33'),(32,1,'Deleted Category: laptop','Category',214,'2026-06-03 03:17:08'),(33,1,'Deleted Category: asdf','Category',213,'2026-06-03 03:17:21'),(34,1,'Created Category: Agriculture','Category',215,'2026-06-03 03:17:39'),(35,1,'Created Category: Vehicle','Category',216,'2026-06-03 03:24:29'),(36,1,'Created Category: laptop','Category',217,'2026-06-03 03:24:53'),(37,1,'Updated Category: Agriculturehjgu','Category',215,'2026-06-03 04:21:34'),(38,1,'Deleted Category: Agriculturehjgu','Category',215,'2026-06-03 04:27:59'),(39,1,'Deleted Category: Vehicle','Category',216,'2026-06-03 04:28:02'),(40,1,'Created Category: Agriculture','Category',218,'2026-06-03 04:28:12'),(41,1,'Created Category: Vechile','Category',219,'2026-06-03 04:28:59'),(42,1,'Updated Category: Vehcile','Category',219,'2026-06-03 04:29:31'),(43,1,'Deactivated Category: Vehcile','Category',219,'2026-06-03 04:29:35'),(44,1,'Activated Category: Vehcile','Category',219,'2026-06-03 04:29:36'),(45,1,'Updated Category: Vehicle','Category',219,'2026-06-03 04:29:48'),(46,1,'Created Government Scheme: \'Pradhan Mantri Yojana\'','GovernmentScheme',4,'2026-06-03 04:53:47'),(47,1,'Created Category: kjfnkf','Category',220,'2026-06-03 05:01:03'),(48,1,'Updated Category: Kfnkf','Category',220,'2026-06-03 05:01:22'),(49,1,'Created Category: Fashion','Category',221,'2026-06-03 05:03:10'),(50,1,'Deleted Category: Agriculture','Category',218,'2026-06-03 05:04:27'),(51,1,'Deleted Category: Fashion','Category',221,'2026-06-03 05:04:30'),(52,1,'Deleted Category: Kfnkf','Category',220,'2026-06-03 05:04:32'),(53,1,'Deleted Category: Vehicle','Category',219,'2026-06-03 05:04:35'),(54,1,'Created Category: Vehicles','Category',222,'2026-06-03 05:06:53'),(55,1,'Created Category: Car','Category',223,'2026-06-03 05:09:00'),(56,1,'Created Category: Bicycle','Category',224,'2026-06-03 05:09:14'),(57,1,'Created Category: Bike','Category',225,'2026-06-03 05:09:27'),(58,1,'Created Category: Accessories','Category',226,'2026-06-03 05:09:40'),(59,1,'Created Category: Scooter','Category',227,'2026-06-03 05:10:07'),(60,1,'Created Category: Tyre','Category',228,'2026-06-03 05:10:19'),(61,1,'Updated Category: Vehicles','Category',222,'2026-06-03 05:16:50'),(62,1,'Created Category: Electronics','Category',229,'2026-06-03 05:20:53'),(63,1,'Created Category: Mobile','Category',230,'2026-06-03 05:21:23'),(64,1,'Created Category: Tablet','Category',231,'2026-06-03 05:21:36'),(65,1,'Created Category: Camera','Category',232,'2026-06-03 05:21:50'),(66,1,'Created Category: Headphone','Category',233,'2026-06-03 05:22:03'),(67,1,'Created Category: Laptop','Category',234,'2026-06-03 05:22:14'),(68,1,'Created Category: Smart Watch','Category',235,'2026-06-03 05:22:28'),(69,1,'Deleted Category: Electronics','Category',229,'2026-06-03 05:23:29'),(70,1,'Created Form for Category: Bicycle','Form',3,'2026-06-03 08:14:09'),(71,1,'Updated Form for Category: Bicycle','Form',3,'2026-06-03 08:15:17'),(72,1,'Moderated listing \'ygygy\' with action: approved','Listing',6,'2026-06-03 12:48:41'),(73,1,'Updated listing: \'ygygy\'','Listing',6,'2026-06-03 12:55:06'),(74,1,'Created Category: Fashion','Category',236,'2026-06-05 11:12:00'),(75,1,'Updated Category: Fashion','Category',236,'2026-06-05 11:20:15'),(76,1,'Created Category: Bag','Category',237,'2026-06-05 11:26:19'),(77,1,'Created Category: Jewellery','Category',238,'2026-06-05 11:27:27'),(78,1,'Created Category: Shoe','Category',239,'2026-06-05 11:27:41'),(79,1,'Created Category: Glasses','Category',240,'2026-06-05 11:27:58'),(80,1,'Created Category: Watch','Category',241,'2026-06-05 11:28:14'),(81,1,'Updated listing: \'ygygy\'','Listing',6,'2026-06-05 12:27:55'),(82,1,'Updated listing: \'ygygy\'','Listing',6,'2026-06-05 12:28:28'),(83,1,'Created Form for Category: Jewellery','Form',4,'2026-06-05 12:29:19'),(84,1,'Updated Form for Category: Jewellery','Form',4,'2026-06-05 12:30:14'),(85,1,'Moderated listing \'Hdhd\' with action: approved','Listing',7,'2026-06-05 12:34:08'),(86,1,'Updated listing: \'Hdhd\'','Listing',7,'2026-06-05 12:35:00'),(87,1,'Updated Form for Category: Bicycle','Form',3,'2026-06-05 12:41:43'),(88,1,'Created Government Scheme: \'Pradhan Mantri Yojana\'','GovernmentScheme',5,'2026-06-05 12:49:55'),(89,1,'Deleted Government Scheme: \'Pradhan Mantri Yojana\'','GovernmentScheme',5,'2026-06-06 11:52:35'),(90,1,'Created Government Scheme: \'Pradhan Mantri Kisan Yojana\'','GovernmentScheme',6,'2026-06-06 12:03:22'),(91,1,'Created Form for Category: Bag','Form',5,'2026-06-09 04:31:09'),(92,1,'Updated Form for Category: Bag','Form',5,'2026-06-09 04:33:31'),(93,1,'Created listing: \'Scooter\'','Listing',8,'2026-06-09 05:56:37'),(94,1,'Moderated listing \'Scooter\' with action: approved','Listing',8,'2026-06-09 06:27:53'),(95,1,'Updated listing: \'Scooter\'','Listing',8,'2026-06-09 06:30:49'),(96,1,'Updated listing: \'Scooter\'','Listing',8,'2026-06-09 06:44:10'),(97,1,'Updated listing: \'Scooter\'','Listing',8,'2026-06-09 07:55:22'),(98,1,'Updated listing: \'Scooter\'','Listing',8,'2026-06-09 07:56:04'),(99,1,'Created listing: \'Gucci Glasses\'','Listing',9,'2026-06-09 07:59:24'),(100,1,'Featured listing: \'Gucci Glasses\'','Listing',9,'2026-06-09 08:00:19'),(101,1,'Featured listing: \'Scooter\'','Listing',8,'2026-06-09 08:00:21'),(102,1,'Removed Featured tag from listing: \'Gucci Glasses\'','Listing',9,'2026-06-09 08:00:24'),(103,1,'Removed Featured tag from listing: \'Scooter\'','Listing',8,'2026-06-09 08:00:26'),(104,1,'Moderated listing \'QWERTYUI\' with action: approved','Listing',10,'2026-06-09 08:15:45'),(105,1,'Moderated listing \'Gucci Glasses\' with action: approved','Listing',9,'2026-06-09 08:15:49'),(106,1,'Updated listing: \'QWERTYUI\'','Listing',10,'2026-06-09 08:16:19'),(107,1,'Updated listing: \'QWERTYUI\'','Listing',10,'2026-06-09 08:20:50'),(108,1,'Changed account status of user \'Shreya Bansal\' (7691048628) to: blocked','User',11,'2026-06-09 08:21:56'),(109,1,'Changed account status of user \'Amit Sharma\' (+919123456789) to: blocked','User',3,'2026-06-09 08:24:26'),(110,1,'Changed account status of user \'Amit Sharma\' (+919123456789) to: blocked','User',3,'2026-06-09 08:24:32'),(111,1,'Verified business seller: \'Amit Electronics Store\'','SellerProfile',2,'2026-06-09 08:24:36'),(112,1,'Changed account status of user \'Amit Sharma\' (+919123456789) to: active','User',3,'2026-06-09 08:24:36'),(113,1,'Changed account status of user \'Shreya Bansal\' (7691048628) to: active','User',11,'2026-06-09 08:45:20'),(114,1,'Changed account status of user \'Rajesh Kumar\' (+919876543210) to: blocked','User',2,'2026-06-09 09:16:31'),(115,1,'Changed account status of user \'Rajesh Kumar\' (+919876543210) to: active','User',2,'2026-06-09 09:16:33'),(116,1,'Moderated listing \'QWERTYUI\' with action: changes_requested','Listing',10,'2026-06-11 05:56:56'),(117,1,'Moderated listing \'QWERTYUI\' with action: approved','Listing',10,'2026-06-11 05:57:01'),(118,1,'Created Government Scheme: \'Pradhan mantri kisan yojana\'','GovernmentScheme',7,'2026-06-11 09:08:41'),(119,1,'Moderated listing \'ferrari\' with action: approved','Listing',12,'2026-06-11 09:09:24'),(120,1,'Moderated listing \'Goggles\' with action: approved','Listing',11,'2026-06-11 09:09:32'),(121,1,'Deleted Government Scheme: \'Pradhan Mantri Kisan Yojana\'','GovernmentScheme',6,'2026-06-11 09:09:44'),(122,1,'Updated listing: \'ferrari\'','Listing',12,'2026-06-11 09:11:06'),(123,1,'Updated listing: \'Goggles\'','Listing',11,'2026-06-11 09:11:14'),(124,1,'Moderated listing \'apple\' with action: approved','Listing',13,'2026-06-11 10:45:38'),(125,1,'Updated listing: \'apple\'','Listing',13,'2026-06-11 10:45:48'),(126,1,'Deleted Category: Camera','Category',107,'2026-07-02 06:07:09'),(127,1,'Deleted Category: Iron','Category',103,'2026-07-02 06:07:14'),(128,1,'Deleted Category: Fridge','Category',118,'2026-07-02 06:07:35'),(129,1,'Deleted Category: Auto Parts','Category',112,'2026-07-02 06:07:42'),(130,1,'Deleted Category: Women Wear','Category',120,'2026-07-02 06:08:06'),(131,1,'Deleted Category: Chair','Category',116,'2026-07-02 06:08:45'),(132,1,'Deleted Category: Mixer','Category',117,'2026-07-02 06:08:50'),(133,1,'Moderated listing \'My Listing for test\' with action: approved','Listing',8,'2026-07-02 06:34:09'),(134,1,'Moderated listing \'iPhone 14 Pro - 256GB - Space Black\' with action: approved','Listing',1,'2026-07-02 06:34:15'),(135,1,'Moderated listing \'Samsung Galaxy S23 Ultra (Phantom Black)\' with action: approved','Listing',2,'2026-07-02 06:55:29'),(136,1,'Changed account status of user \'Avinash\' (+917027888321) to: blocked','User',69,'2026-07-02 07:22:48'),(137,1,'Changed account status of user \'Avinash\' (+917027888321) to: active','User',69,'2026-07-02 07:22:49'),(138,1,'Moderated listing \'iPhone 14 Pro - 256GB - Space Black\' with action: changes_requested','Listing',1,'2026-07-02 09:14:39'),(139,1,'Moderated listing \'iPhone 14 Pro - 256GB - Space Black\' with action: changes_requested','Listing',1,'2026-07-02 09:14:43'),(140,1,'Moderated listing \'iPhone 14 Pro - 256GB - Space Black\' with action: changes_requested','Listing',1,'2026-07-02 09:14:45'),(141,1,'Changed account status of user \'Avinash\' (+917027888321) to: blocked','User',69,'2026-07-02 10:50:44'),(142,1,'Changed account status of user \'Avinash\' (+917027888321) to: active','User',69,'2026-07-02 10:50:46'),(143,72,'Moderated listing \'samsung s23 fe\' with action: approved','Listing',9,'2026-07-03 06:41:49'),(144,72,'Moderated listing \'OnePlus Nord 5   -256gb\' with action: approved','Listing',10,'2026-07-03 06:41:50'),(145,72,'Moderated listing \'Designer Men Blazer - Slim Fit - Navy Blue\' with action: approved','Listing',7,'2026-07-03 06:43:33'),(146,72,'Moderated listing \'samsung s23 fe\' with action: approved','Listing',9,'2026-07-03 06:44:36'),(147,72,'Moderated listing \'samsung s23 fe\' with action: changes_requested','Listing',9,'2026-07-03 06:45:53'),(148,72,'Moderated listing \'samsung s23 fe\' with action: changes_requested','Listing',9,'2026-07-03 06:45:54'),(149,72,'Moderated listing \'samsung s23 fe\' with action: approved','Listing',9,'2026-07-03 06:46:11'),(150,72,'Moderated listing \'MacBook Air M2 - 8GB/512GB (Midnight)\' with action: approved','Listing',3,'2026-07-03 06:50:59'),(151,72,'Moderated listing \'Honda City i-VTEC V - 2021 model\' with action: approved','Listing',5,'2026-07-03 07:04:10'),(152,72,'Moderated listing \'Premium L-Shaped Leatherette Sofa Set\' with action: approved','Listing',4,'2026-07-03 07:05:03'),(153,72,'Moderated listing \'Fossil Gen 6 Smartwatch (Black)\' with action: approved','Listing',6,'2026-07-03 07:05:05'),(154,72,'Moderated listing \'Iphone 13 PRO\' with action: approved','Listing',11,'2026-07-03 07:06:28'),(155,72,'Updated Category: Vehicles','Category',2,'2026-07-03 07:09:26'),(156,72,'Created Form for Category: Headphones','Form',6,'2026-07-03 07:11:36'),(157,72,'Moderated listing \'samsung galaxy s23 fe\' with action: approved','Listing',12,'2026-07-03 07:25:27'),(158,72,'Moderated listing \'Tshirt\' with action: approved','Listing',13,'2026-07-03 07:26:52'),(159,72,'Moderated listing \'samsung galaxy s23 fe\' with action: approved','Listing',12,'2026-07-03 07:29:40'),(160,72,'Updated Form for Category: Headphones','Form',6,'2026-07-03 08:06:05'),(161,72,'Moderated listing \'Prestige PIC 20 NEO Induction Cooktop\' with action: approved','Listing',14,'2026-07-03 08:24:38'),(162,72,'Moderated listing \'Boat Stone 350 Bluetooth Speaker with 10W RMS Stereo Sound, IPX7 Water Resistance, TWS Feature, Up to 12H Total Playtime, Multi-Compatibility Modes(Black)\' with action: approved','Listing',15,'2026-07-03 08:31:00'),(163,72,'Moderated listing \'apple headphones\' with action: approved','Listing',16,'2026-07-03 08:35:36'),(164,72,'Updated listing: \'OnePlus Nord 5   -256gb\'','Listing',10,'2026-07-03 08:36:15'),(165,72,'Moderated listing \'HP Victus\' with action: approved','Listing',18,'2026-07-03 08:59:31'),(166,72,'Featured listing: \'Boat Stone 350 Bluetooth Speaker with 10W RMS Stereo Sound, IPX7 Water Resistance, TWS Feature, Up to 12H Total Playtime, Multi-Compatibility Modes(Black)\'','Listing',15,'2026-07-03 09:15:36'),(167,72,'Removed Featured tag from listing: \'Boat Stone 350 Bluetooth Speaker with 10W RMS Stereo Sound, IPX7 Water Resistance, TWS Feature, Up to 12H Total Playtime, Multi-Compatibility Modes(Black)\'','Listing',15,'2026-07-03 09:15:37'),(168,72,'Moderated listing \'Kawasaki Ninja ZX-10R\' with action: approved','Listing',17,'2026-07-03 09:15:44'),(169,72,'Updated listing: \'Boat Stone 350 Bluetooth Speaker \'','Listing',15,'2026-07-03 09:17:02'),(170,72,'Moderated listing \'Suzuki Burgman Street 125 [2025]\' with action: approved','Listing',19,'2026-07-03 09:17:14'),(171,72,'Updated listing: \'HP Victus\'','Listing',18,'2026-07-03 09:18:17'),(172,72,'Updated listing: \'Suzuki Burgman Street 125 [2025]\'','Listing',19,'2026-07-03 09:18:25'),(173,72,'Moderated listing \'Hanoi Solid Wood Cane Queen Size Bed With Hydraulic Storage (Amber Walnut Finish, Shitake Beige Colour)\' with action: approved','Listing',20,'2026-07-03 09:22:53'),(174,72,'Moderated listing \'Nike Men Court Vision Low Sneakers (8)\' with action: approved','Listing',21,'2026-07-03 09:29:52'),(175,72,'Deactivated Category: Electronics','Category',1,'2026-07-03 09:51:34'),(176,72,'Activated Category: Electronics','Category',1,'2026-07-03 09:51:36'),(177,72,'Updated Form for Category: Headphones','Form',6,'2026-07-03 11:21:32'),(178,72,'Updated Form for Category: Headphones','Form',6,'2026-07-03 11:22:16'),(179,73,'Changed account status of user \'nishant tiwari\' (+917073896499) to: blocked','User',71,'2026-07-06 05:01:59'),(180,73,'Changed account status of user \'nishant tiwari\' (+917073896499) to: active','User',71,'2026-07-06 05:02:01');
/*!40000 ALTER TABLE `admin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_categories`
--

DROP TABLE IF EXISTS `admin_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `fk_admin_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `admin_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_categories`
--

LOCK TABLES `admin_categories` WRITE;
/*!40000 ALTER TABLE `admin_categories` DISABLE KEYS */;
INSERT INTO `admin_categories` VALUES (1,NULL,'Electronics','electronics',1,'2026-07-02 05:40:41'),(2,NULL,'Vehicles','vehicles',1,'2026-07-02 05:40:41'),(3,NULL,'Home & Kitchen','home-kitchen',1,'2026-07-02 05:40:41'),(4,NULL,'Fashion','fashion',1,'2026-07-02 05:40:41'),(101,1,'Mobile','mobile',1,'2026-07-02 05:40:41'),(102,1,'Laptop','laptop',1,'2026-07-02 05:40:41'),(104,1,'Induction','induction',1,'2026-07-02 05:40:41'),(105,1,'Headphones','headphones',1,'2026-07-02 05:40:41'),(106,1,'Speaker','speaker',1,'2026-07-02 05:40:41'),(108,2,'Car','car',1,'2026-07-02 05:40:41'),(109,2,'Bike','bike',1,'2026-07-02 05:40:41'),(110,2,'Scooter','scooter',1,'2026-07-02 05:40:41'),(111,2,'Cycle','cycle',1,'2026-07-02 05:40:41'),(113,3,'Sofa','sofa',1,'2026-07-02 05:40:41'),(114,3,'Bed','bed',1,'2026-07-02 05:40:41'),(115,3,'Table','table',1,'2026-07-02 05:40:41'),(119,4,'Men Wear','men-wear',1,'2026-07-02 05:40:41'),(121,4,'Shoes','shoes',1,'2026-07-02 05:40:41'),(122,4,'Bags','bags',1,'2026-07-02 05:40:41'),(123,4,'Watches','watches',1,'2026-07-02 05:40:41');
/*!40000 ALTER TABLE `admin_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auction_bids`
--

DROP TABLE IF EXISTS `auction_bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auction_bids` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `auction_id` bigint DEFAULT NULL,
  `bidder_id` bigint DEFAULT NULL,
  `bid_amount` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `auction_id` (`auction_id`),
  CONSTRAINT `auction_bids_ibfk_1` FOREIGN KEY (`auction_id`) REFERENCES `auction_listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auction_bids`
--

LOCK TABLES `auction_bids` WRITE;
/*!40000 ALTER TABLE `auction_bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `auction_bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auction_listings`
--

DROP TABLE IF EXISTS `auction_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auction_listings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `start_price` decimal(12,2) DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `auction_listings_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auction_listings`
--

LOCK TABLES `auction_listings` WRITE;
/*!40000 ALTER TABLE `auction_listings` DISABLE KEYS */;
/*!40000 ALTER TABLE `auction_listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'Mega Agriculture Mela 2026','https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500'),(2,'Get Verified Seller Badge Now','https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accent` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'electronics','Electronics','electronics','Mobiles, laptops, appliances','electronicsDesc','blue','2026-07-02 05:40:41'),(2,'vehicles','Vehicles',NULL,'Cars, bikes, auto accessories','vehiclesDesc','green','2026-07-02 05:40:41'),(3,'home-kitchen','Home & Kitchen','homeKitchen','Sofa, tables, bed, appliances','homeKitchenDesc','orange','2026-07-02 05:40:41'),(4,'fashion','Fashion','fashion','Clothing, bags, shoes, watches','fashionDesc','purple','2026-07-02 05:40:41');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` bigint DEFAULT NULL,
  `sender_id` bigint DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `buyer_id` bigint DEFAULT NULL,
  `seller_id` bigint DEFAULT NULL,
  `listing_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `chat_rooms_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_rooms`
--

LOCK TABLES `chat_rooms` WRITE;
/*!40000 ALTER TABLE `chat_rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_pages`
--

DROP TABLE IF EXISTS `cms_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cms_pages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_pages`
--

LOCK TABLES `cms_pages` WRITE;
/*!40000 ALTER TABLE `cms_pages` DISABLE KEYS */;
INSERT INTO `cms_pages` VALUES (1,'About Us','about-us','We are a premier B2B and B2C marketplace platform built to connect buyers and sellers seamlessly.'),(2,'Terms & Conditions','terms-and-conditions','Please read our platform terms of service policy before making purchase orders.');
/*!40000 ALTER TABLE `cms_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_statistics`
--

DROP TABLE IF EXISTS `daily_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_statistics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `stat_date` date DEFAULT NULL,
  `total_users` int DEFAULT NULL,
  `total_orders` int DEFAULT NULL,
  `total_revenue` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_statistics`
--

LOCK TABLES `daily_statistics` WRITE;
/*!40000 ALTER TABLE `daily_statistics` DISABLE KEYS */;
INSERT INTO `daily_statistics` VALUES (1,'2026-05-21',110,8,12400.00),(2,'2026-05-22',112,9,14500.00),(3,'2026-05-23',115,12,22000.00),(4,'2026-05-24',118,15,35000.00),(5,'2026-05-25',120,11,18000.00),(6,'2026-05-26',125,14,52400.00),(7,'2026-05-27',130,16,520000.00);
/*!40000 ALTER TABLE `daily_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_fields`
--

DROP TABLE IF EXISTS `form_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_fields` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `form_id` bigint NOT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `field_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `options` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  KEY `form_id` (`form_id`),
  CONSTRAINT `form_fields_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_fields`
--

LOCK TABLES `form_fields` WRITE;
/*!40000 ALTER TABLE `form_fields` DISABLE KEYS */;
INSERT INTO `form_fields` VALUES (14,4,'Brand','brand','Text',NULL),(15,4,'Price','price','Number',NULL),(16,4,'Description','description','Text',NULL),(17,3,'ghjbhjbhj','ghjbhjbhj','Text',NULL),(18,3,'Brand','brand','Text',NULL),(19,3,'Price','price','Number',NULL),(22,5,'Color','color','Dropdown','Black , Brown , White'),(23,5,'Discount Price','discount_price','Number',NULL),(24,5,'hjdfdh','hjdfdh','Text',NULL),(30,6,'Brand','brand','Dropdown','Apple, Samsung, OnePlus, Google'),(31,6,'New Field 2','new_field_2','Text',NULL);
/*!40000 ALTER TABLE `form_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `forms_ibfk_1` (`category_id`),
  CONSTRAINT `forms_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `admin_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forms`
--

LOCK TABLES `forms` WRITE;
/*!40000 ALTER TABLE `forms` DISABLE KEYS */;
INSERT INTO `forms` VALUES (3,224,'Bicycle Details','2026-06-03 08:14:09'),(4,238,'Jewellery Details','2026-06-05 12:29:19'),(5,237,'Bag Details','2026-06-09 04:31:08'),(6,105,'Headphones Details','2026-07-03 07:11:35');
/*!40000 ALTER TABLE `forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `government_schemes`
--

DROP TABLE IF EXISTS `government_schemes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `government_schemes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `scheme_type` enum('current','upcoming') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `eligibility` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  KEY `government_schemes_ibfk_1` (`category_id`),
  CONSTRAINT `government_schemes_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `admin_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `government_schemes`
--

LOCK TABLES `government_schemes` WRITE;
/*!40000 ALTER TABLE `government_schemes` DISABLE KEYS */;
INSERT INTO `government_schemes` VALUES (7,225,'Pradhan mantri kisan yojana','[Department: Ministry of Agriculture] kjdhfjhdkjnodnk\n\nLink: https://www.google.com/about/careers/applications/jobs/results?src=Online/Google%20Website/ByF&utm_source=Online%20&location=India&employment_type=INTERN','current','2026-06-11','2026-06-13','kdfkjndkjndkj');
/*!40000 ALTER TABLE `government_schemes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_approval_history`
--

DROP TABLE IF EXISTS `listing_approval_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_approval_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `admin_id` bigint DEFAULT NULL,
  `action` enum('submitted','approved','rejected','resubmitted') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `listing_approval_history_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `listing_approval_history_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_approval_history`
--

LOCK TABLES `listing_approval_history` WRITE;
/*!40000 ALTER TABLE `listing_approval_history` DISABLE KEYS */;
INSERT INTO `listing_approval_history` VALUES (4,6,1,'approved','Approved by Admin','2026-06-03 12:48:40'),(5,7,1,'approved','Approved by Admin','2026-06-05 12:34:08'),(6,8,1,'approved','Moderated from quick action dashboard panel.','2026-06-09 06:27:53'),(7,10,1,'approved','Moderated from quick action dashboard panel.','2026-06-09 08:15:45'),(8,9,1,'approved','Moderated from quick action dashboard panel.','2026-06-09 08:15:48'),(9,10,1,'rejected','Unpublished by Admin','2026-06-11 05:56:55'),(10,10,1,'approved','Published by Admin','2026-06-11 05:57:00'),(11,12,1,'approved','Approved by Admin','2026-06-11 09:09:24'),(12,11,1,'approved','Approved by Admin','2026-06-11 09:09:32'),(13,13,1,'approved','Approved by Admin','2026-06-11 10:45:38'),(14,8,1,'approved','Approved by Admin','2026-07-02 06:34:08'),(15,1,1,'approved','Approved by Admin','2026-07-02 06:34:14'),(16,2,1,'approved','Approved by Admin','2026-07-02 06:55:29'),(17,1,1,'rejected','Unpublished by Admin','2026-07-02 09:14:39'),(18,1,1,'rejected','Unpublished by Admin','2026-07-02 09:14:43'),(19,1,1,'rejected','Unpublished by Admin','2026-07-02 09:14:44'),(20,9,72,'approved','Moderated from quick action dashboard panel.','2026-07-03 06:41:48'),(21,10,72,'approved','Moderated from quick action dashboard panel.','2026-07-03 06:41:50'),(22,7,72,'approved','Approved by Admin','2026-07-03 06:43:32'),(23,9,72,'approved','Moderated from quick action dashboard panel.','2026-07-03 06:44:36'),(24,9,72,'rejected','Unpublished by Admin','2026-07-03 06:45:53'),(25,9,72,'rejected','Unpublished by Admin','2026-07-03 06:45:54'),(26,9,72,'approved','Published by Admin','2026-07-03 06:46:11'),(27,3,72,'approved','Approved by Admin','2026-07-03 06:50:58'),(28,5,72,'approved','Approved by Admin','2026-07-03 07:04:09'),(29,4,72,'approved','Moderated from quick action dashboard panel.','2026-07-03 07:05:02'),(30,6,72,'approved','Moderated from quick action dashboard panel.','2026-07-03 07:05:05'),(31,11,72,'approved','Approved by Admin','2026-07-03 07:06:28'),(32,12,72,'approved','Approved by Admin','2026-07-03 07:25:26'),(33,13,72,'approved','Moderated from quick action dashboard panel.','2026-07-03 07:26:51'),(34,12,72,'approved','Approved by Admin','2026-07-03 07:29:40'),(35,14,72,'approved','Approved by Admin','2026-07-03 08:24:38'),(36,15,72,'approved','Approved by Admin','2026-07-03 08:31:00'),(37,16,72,'approved','Approved by Admin','2026-07-03 08:35:36'),(38,18,72,'approved','Approved by Admin','2026-07-03 08:59:30'),(39,17,72,'approved','Moderated from quick action dashboard panel.','2026-07-03 09:15:44'),(40,19,72,'approved','Approved by Admin','2026-07-03 09:17:14'),(41,20,72,'approved','Approved by Admin','2026-07-03 09:22:52'),(42,21,72,'approved','Approved by Admin','2026-07-03 09:29:52');
/*!40000 ALTER TABLE `listing_approval_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_attributes`
--

DROP TABLE IF EXISTS `listing_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_attributes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `form_field_id` bigint DEFAULT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  KEY `form_field_id` (`form_field_id`),
  CONSTRAINT `listing_attributes_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `listing_attributes_ibfk_2` FOREIGN KEY (`form_field_id`) REFERENCES `form_fields` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_attributes`
--

LOCK TABLES `listing_attributes` WRITE;
/*!40000 ALTER TABLE `listing_attributes` DISABLE KEYS */;
/*!40000 ALTER TABLE `listing_attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_comments`
--

DROP TABLE IF EXISTS `listing_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `parent_comment_id` bigint DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `listing_comments_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_comments`
--

LOCK TABLES `listing_comments` WRITE;
/*!40000 ALTER TABLE `listing_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `listing_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_faqs`
--

DROP TABLE IF EXISTS `listing_faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_faqs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `question` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `listing_faqs_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_faqs`
--

LOCK TABLES `listing_faqs` WRITE;
/*!40000 ALTER TABLE `listing_faqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `listing_faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_images`
--

DROP TABLE IF EXISTS `listing_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint NOT NULL,
  `image_url` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_thumbnail` tinyint(1) DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_images_listing` (`listing_id`),
  KEY `idx_images_thumbnail` (`listing_id`,`is_thumbnail`),
  CONSTRAINT `listing_images_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_images`
--

LOCK TABLES `listing_images` WRITE;
/*!40000 ALTER TABLE `listing_images` DISABLE KEYS */;
INSERT INTO `listing_images` VALUES (1,1,'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700',0,0,'2026-07-02 05:40:41',1),(2,2,'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700',0,0,'2026-07-02 05:40:41',1),(3,3,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700',0,0,'2026-07-02 05:40:41',1),(4,4,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700',0,0,'2026-07-02 05:40:41',1),(5,5,'https://images.unsplash.com/photo-1542362567-b07e54358753?w=700',0,0,'2026-07-02 05:40:41',1),(6,6,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',0,0,'2026-07-02 05:40:41',1),(7,7,'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700',0,0,'2026-07-02 05:40:41',1),(8,8,'/uploads/listings/1782973959661-tdamjv.jpg',1,0,'2026-07-02 06:32:40',1),(9,9,'/uploads/listings/1783060440555-63zkao.jpg',1,0,'2026-07-03 06:34:00',1),(13,11,'/uploads/listings/1783062359945-s2t9m3.jpg',1,0,'2026-07-03 07:06:05',1),(14,12,'/uploads/listings/1783063490140-sgk4ug.jpg',1,0,'2026-07-03 07:24:50',1),(15,13,'/uploads/listings/1783063558283-l5ma4v.jpeg',1,0,'2026-07-03 07:25:58',1),(16,14,'/uploads/listings/1783067052391-37lomy.webp',1,0,'2026-07-03 08:24:12',1),(17,14,'/uploads/listings/1783067052499-mlluwb.webp',0,1,'2026-07-03 08:24:12',0),(21,16,'/uploads/listings/1783067706494-up3se0.jpeg',1,0,'2026-07-03 08:35:06',1),(22,16,'/uploads/listings/1783067706534-k63mn6.jpeg',0,1,'2026-07-03 08:35:06',0),(23,16,'/uploads/listings/1783067706535-09v3hf.jpeg',0,2,'2026-07-03 08:35:06',0),(24,16,'/uploads/listings/1783067706536-3zybj9.jpeg',0,3,'2026-07-03 08:35:06',0),(25,10,'/uploads/listings/1783060800578-qcw5j8.jpeg',0,0,'2026-07-03 08:36:14',1),(26,10,'/uploads/listings/1783060800737-nxvd9m.jpeg',0,0,'2026-07-03 08:36:14',0),(41,17,'/uploads/listings/1783070215140-b3k5fd.webp',1,0,'2026-07-03 09:17:00',1),(42,17,'/uploads/listings/1783070219725-tbgi2o.jpeg',0,1,'2026-07-03 09:17:00',0),(43,17,'/uploads/listings/1783070219948-97cwqb.jpeg',0,2,'2026-07-03 09:17:00',0),(44,17,'/uploads/listings/1783070219948-io3fu6.jpeg',0,3,'2026-07-03 09:17:00',0),(45,15,'/uploads/listings/1783067437060-be6955.jpg',0,0,'2026-07-03 09:17:02',1),(46,15,'/uploads/listings/1783067437122-s3cxkp.jpg',0,0,'2026-07-03 09:17:02',0),(47,18,'/uploads/listings/1783069113448-kbqxuo.jpg',0,0,'2026-07-03 09:18:17',1),(48,18,'/uploads/listings/1783069113558-1h7ncw.jpg',0,0,'2026-07-03 09:18:17',0),(49,19,'/uploads/listings/1783070212515-bnbd9n.avif',0,0,'2026-07-03 09:18:24',1),(50,19,'/uploads/listings/1783070212515-z0m7js.avif',0,0,'2026-07-03 09:18:24',0),(51,20,'/uploads/listings/1783070527419-ulgl23.avif',1,0,'2026-07-03 09:22:08',1),(52,20,'/uploads/listings/1783070527847-23xfup.avif',0,1,'2026-07-03 09:22:08',0),(53,20,'/uploads/listings/1783070527964-pbrd0u.avif',0,2,'2026-07-03 09:22:08',0),(54,21,'/uploads/listings/1783070915632-lykqu6.webp',1,0,'2026-07-03 09:28:36',1),(55,21,'/uploads/listings/1783070915726-7rpga3.webp',0,1,'2026-07-03 09:28:36',0),(56,21,'/uploads/listings/1783070915963-vcbzt3.webp',0,2,'2026-07-03 09:28:36',0);
/*!40000 ALTER TABLE `listing_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_likes`
--

DROP TABLE IF EXISTS `listing_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_likes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unq_listing_user` (`listing_id`,`user_id`),
  CONSTRAINT `listing_likes_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_likes`
--

LOCK TABLES `listing_likes` WRITE;
/*!40000 ALTER TABLE `listing_likes` DISABLE KEYS */;
INSERT INTO `listing_likes` VALUES (64,1,69),(56,1,70),(45,2,69),(50,3,70),(9,6,9),(6,6,10),(2,6,11),(32,6,13),(37,6,16),(18,7,10),(19,7,13),(40,7,17),(10,8,9),(8,8,10),(31,8,13),(57,8,69),(11,9,9),(13,9,10),(39,9,17),(55,9,71),(12,10,9),(33,10,13),(41,10,17),(58,11,69),(36,12,14),(38,12,17),(43,12,18),(60,12,71),(42,13,13),(68,17,71),(67,19,71),(69,21,71);
/*!40000 ALTER TABLE `listing_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_live_viewers`
--

DROP TABLE IF EXISTS `listing_live_viewers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_live_viewers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_seen` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `listing_live_viewers_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_live_viewers`
--

LOCK TABLES `listing_live_viewers` WRITE;
/*!40000 ALTER TABLE `listing_live_viewers` DISABLE KEYS */;
/*!40000 ALTER TABLE `listing_live_viewers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_reports`
--

DROP TABLE IF EXISTS `listing_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `reported_by` bigint DEFAULT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('pending','resolved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `listing_reports_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_reports`
--

LOCK TABLES `listing_reports` WRITE;
/*!40000 ALTER TABLE `listing_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `listing_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_reviews`
--

DROP TABLE IF EXISTS `listing_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `review` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `listing_reviews_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_reviews`
--

LOCK TABLES `listing_reviews` WRITE;
/*!40000 ALTER TABLE `listing_reviews` DISABLE KEYS */;
INSERT INTO `listing_reviews` VALUES (2,6,10,5,'kjkjdrnfkdfjnkj','2026-06-04 08:24:00'),(3,6,11,5,'Very good i want to purchase good experience','2026-06-05 11:19:22'),(4,7,10,2,'Ghhhh','2026-06-05 12:45:35'),(13,6,10,5,'Bhhh','2026-06-06 06:42:47'),(14,8,10,4,'hjkjfkjnk','2026-06-09 06:30:07'),(15,8,9,5,'Good Product','2026-06-09 06:55:00'),(16,9,9,5,'ghjbhjbhj','2026-06-09 07:59:50'),(17,10,9,5,'QWERTYUIOPASDFGHJK WERTYUIO ERTYUIOPWERTYUIO WSERTYUJK WERTYUIO','2026-06-09 08:15:04'),(18,9,10,2,'dddd','2026-06-10 06:28:40'),(19,12,14,4,'good','2026-06-11 09:07:16'),(20,13,13,3,'jhdfkjngdkj','2026-06-11 10:46:32'),(21,12,18,5,'Great car, but it looks surprisingly like an AI tool cheat sheet! Also, if anyone has an extra 874 crores lying around to actually buy this \'ferrari\' in New York City, let me know. Works perfectly for testing the review section though! 5/5 stars for the placeholder data.','2026-06-11 11:14:35'),(22,10,70,5,'Best phone','2026-07-03 07:00:07'),(23,9,71,5,'very good mobile','2026-07-03 07:14:45'),(24,1,71,5,'good condition','2026-07-03 07:17:12'),(25,1,70,5,'nice deal','2026-07-03 07:17:25'),(26,1,69,5,'kjhhtxyugzd liyrzyug luyxyr sdfg','2026-07-03 08:54:31'),(27,14,71,5,'very good','2026-07-03 09:50:06'),(28,18,1,5,'test','2026-07-03 10:19:06'),(29,2,69,5,'lsjcou kwjnc djnc.','2026-07-03 10:23:39'),(30,12,71,5,'very good','2026-07-03 10:55:48');
/*!40000 ALTER TABLE `listing_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing_views`
--

DROP TABLE IF EXISTS `listing_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing_views` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `listing_views_ibfk_1` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=374 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing_views`
--

LOCK TABLES `listing_views` WRITE;
/*!40000 ALTER TABLE `listing_views` DISABLE KEYS */;
INSERT INTO `listing_views` VALUES (1,6,13,'2026-06-10 09:36:30'),(2,6,13,'2026-06-10 09:36:30'),(3,6,13,'2026-06-10 09:36:39'),(4,6,13,'2026-06-10 09:36:39'),(5,6,13,'2026-06-10 09:36:44'),(6,6,13,'2026-06-10 09:36:44'),(7,6,13,'2026-06-10 09:36:50'),(8,6,13,'2026-06-10 09:36:50'),(9,6,13,'2026-06-10 09:45:13'),(10,6,13,'2026-06-10 09:45:17'),(11,6,13,'2026-06-10 09:46:18'),(12,6,13,'2026-06-10 09:46:33'),(13,6,13,'2026-06-10 10:07:35'),(14,6,13,'2026-06-10 10:08:01'),(15,6,13,'2026-06-10 10:08:01'),(16,6,13,'2026-06-10 10:08:03'),(17,7,13,'2026-06-10 10:29:20'),(18,9,NULL,'2026-06-10 10:55:05'),(19,6,NULL,'2026-06-10 11:25:03'),(20,6,NULL,'2026-06-10 11:56:06'),(21,6,NULL,'2026-06-10 12:02:08'),(22,6,13,'2026-06-10 15:53:29'),(23,6,13,'2026-06-10 15:59:23'),(24,6,13,'2026-06-10 16:03:07'),(25,8,13,'2026-06-10 16:17:05'),(26,8,13,'2026-06-10 16:17:21'),(27,8,13,'2026-06-10 16:18:07'),(28,6,13,'2026-06-10 16:18:45'),(29,6,13,'2026-06-10 16:24:25'),(30,6,13,'2026-06-10 16:24:34'),(31,6,13,'2026-06-10 16:29:17'),(32,6,13,'2026-06-10 16:29:17'),(33,6,13,'2026-06-10 16:29:20'),(34,6,13,'2026-06-10 16:29:35'),(35,6,13,'2026-06-10 16:29:35'),(36,6,13,'2026-06-10 16:30:04'),(37,6,13,'2026-06-10 16:30:04'),(38,6,13,'2026-06-10 16:30:14'),(39,6,13,'2026-06-10 16:32:02'),(40,6,13,'2026-06-10 16:32:06'),(41,6,13,'2026-06-10 16:32:31'),(42,6,13,'2026-06-10 16:36:16'),(43,6,13,'2026-06-10 16:39:03'),(44,6,13,'2026-06-10 16:39:48'),(45,6,13,'2026-06-10 16:39:57'),(46,6,13,'2026-06-10 16:39:57'),(47,6,13,'2026-06-10 16:39:59'),(48,6,13,'2026-06-10 16:40:42'),(49,6,13,'2026-06-10 16:43:10'),(50,6,13,'2026-06-10 16:43:25'),(51,6,13,'2026-06-10 16:46:31'),(52,7,13,'2026-06-10 16:47:39'),(53,6,13,'2026-06-10 16:55:23'),(54,6,13,'2026-06-10 16:57:08'),(55,6,13,'2026-06-10 16:57:09'),(56,6,13,'2026-06-10 16:59:34'),(57,6,13,'2026-06-10 17:06:02'),(58,6,13,'2026-06-10 17:06:39'),(59,7,13,'2026-06-11 03:58:56'),(60,6,13,'2026-06-11 04:36:40'),(61,6,13,'2026-06-11 04:36:55'),(62,6,13,'2026-06-11 04:36:55'),(63,6,13,'2026-06-11 04:36:58'),(64,6,13,'2026-06-11 04:38:23'),(65,6,NULL,'2026-06-11 04:58:47'),(66,6,13,'2026-06-11 05:14:07'),(67,6,13,'2026-06-11 05:14:13'),(68,7,13,'2026-06-11 06:19:32'),(69,10,13,'2026-06-11 07:03:43'),(70,6,NULL,'2026-06-11 08:45:08'),(71,6,NULL,'2026-06-11 08:45:14'),(72,6,NULL,'2026-06-11 08:45:44'),(73,6,NULL,'2026-06-11 08:45:44'),(74,6,NULL,'2026-06-11 08:45:48'),(75,7,NULL,'2026-06-11 08:47:12'),(76,11,15,'2026-06-11 09:01:31'),(77,11,15,'2026-06-11 09:01:31'),(78,11,15,'2026-06-11 09:02:16'),(79,11,15,'2026-06-11 09:02:17'),(80,12,14,'2026-06-11 09:03:10'),(81,6,16,'2026-06-11 09:03:43'),(82,6,16,'2026-06-11 09:04:07'),(83,6,16,'2026-06-11 09:04:17'),(84,12,14,'2026-06-11 09:11:41'),(85,6,NULL,'2026-06-11 09:30:39'),(86,9,17,'2026-06-11 09:47:54'),(87,10,NULL,'2026-06-11 09:49:05'),(88,9,17,'2026-06-11 09:51:32'),(89,13,13,'2026-06-11 10:46:23'),(90,13,13,'2026-06-11 10:46:50'),(91,13,13,'2026-06-11 10:46:50'),(92,12,NULL,'2026-06-11 11:11:19'),(93,12,18,'2026-06-11 11:14:29'),(94,13,13,'2026-06-11 15:21:35'),(95,1,NULL,'2026-07-02 05:41:29'),(96,1,NULL,'2026-07-02 05:41:29'),(97,4,69,'2026-07-02 06:15:07'),(99,4,69,'2026-07-02 06:16:23'),(100,4,69,'2026-07-02 06:16:23'),(101,4,69,'2026-07-02 06:16:24'),(102,4,69,'2026-07-02 06:16:24'),(103,1,69,'2026-07-02 06:17:19'),(104,1,69,'2026-07-02 06:17:19'),(105,2,69,'2026-07-02 06:17:31'),(106,2,69,'2026-07-02 06:17:31'),(107,1,69,'2026-07-02 06:23:16'),(108,1,69,'2026-07-02 06:23:16'),(109,1,69,'2026-07-02 06:23:22'),(110,1,69,'2026-07-02 06:23:22'),(111,2,69,'2026-07-02 06:24:07'),(112,2,69,'2026-07-02 06:24:07'),(113,2,69,'2026-07-02 06:25:44'),(114,2,69,'2026-07-02 06:25:44'),(115,7,69,'2026-07-02 06:25:56'),(116,7,69,'2026-07-02 06:25:56'),(117,7,69,'2026-07-02 06:26:09'),(118,7,69,'2026-07-02 06:26:09'),(119,8,69,'2026-07-02 06:33:05'),(120,8,69,'2026-07-02 06:33:05'),(121,8,69,'2026-07-02 06:35:16'),(122,8,69,'2026-07-02 06:35:16'),(123,2,69,'2026-07-02 06:47:15'),(124,2,69,'2026-07-02 06:47:15'),(125,8,69,'2026-07-02 06:51:18'),(126,8,69,'2026-07-02 06:51:18'),(127,1,69,'2026-07-02 06:54:20'),(128,1,69,'2026-07-02 06:54:20'),(129,2,69,'2026-07-02 06:55:09'),(130,2,69,'2026-07-02 06:55:09'),(131,3,69,'2026-07-02 06:55:54'),(132,3,69,'2026-07-02 06:55:54'),(133,1,69,'2026-07-02 09:24:33'),(134,1,69,'2026-07-02 09:24:33'),(135,1,69,'2026-07-02 09:24:37'),(136,1,69,'2026-07-02 09:24:37'),(137,1,69,'2026-07-02 09:31:28'),(138,1,69,'2026-07-02 09:31:28'),(139,1,69,'2026-07-02 09:32:15'),(140,1,69,'2026-07-02 09:32:15'),(141,1,69,'2026-07-02 09:32:25'),(142,1,69,'2026-07-02 09:32:25'),(143,1,69,'2026-07-02 09:55:32'),(144,1,69,'2026-07-02 09:55:32'),(145,1,69,'2026-07-02 10:03:52'),(146,1,69,'2026-07-02 10:03:52'),(147,2,69,'2026-07-02 10:04:00'),(148,2,69,'2026-07-02 10:04:00'),(149,1,69,'2026-07-02 10:05:25'),(150,1,69,'2026-07-02 10:05:25'),(151,8,69,'2026-07-02 10:05:35'),(152,8,69,'2026-07-02 10:05:35'),(153,1,69,'2026-07-02 10:05:43'),(154,1,69,'2026-07-02 10:05:43'),(155,2,70,'2026-07-03 06:24:10'),(156,2,70,'2026-07-03 06:24:10'),(157,2,70,'2026-07-03 06:26:10'),(158,2,70,'2026-07-03 06:26:10'),(159,2,70,'2026-07-03 06:26:23'),(160,2,70,'2026-07-03 06:26:23'),(161,1,70,'2026-07-03 06:27:08'),(162,1,70,'2026-07-03 06:27:08'),(163,1,70,'2026-07-03 06:27:54'),(164,1,70,'2026-07-03 06:27:55'),(165,1,71,'2026-07-03 06:28:29'),(166,1,71,'2026-07-03 06:28:29'),(167,1,70,'2026-07-03 06:28:45'),(168,1,70,'2026-07-03 06:28:46'),(169,2,71,'2026-07-03 06:28:50'),(170,2,71,'2026-07-03 06:28:50'),(171,1,71,'2026-07-03 06:29:03'),(172,1,71,'2026-07-03 06:29:03'),(173,1,70,'2026-07-03 06:29:15'),(174,1,70,'2026-07-03 06:29:16'),(175,3,70,'2026-07-03 06:29:45'),(176,3,70,'2026-07-03 06:29:45'),(177,1,69,'2026-07-03 06:29:47'),(178,1,69,'2026-07-03 06:29:48'),(179,2,70,'2026-07-03 06:30:12'),(180,2,70,'2026-07-03 06:30:12'),(181,9,71,'2026-07-03 06:34:17'),(182,9,71,'2026-07-03 06:34:17'),(183,9,71,'2026-07-03 06:35:14'),(184,9,71,'2026-07-03 06:35:14'),(185,9,71,'2026-07-03 06:36:44'),(186,9,71,'2026-07-03 06:36:44'),(187,1,71,'2026-07-03 06:37:24'),(188,1,71,'2026-07-03 06:37:24'),(189,2,71,'2026-07-03 06:37:37'),(190,2,71,'2026-07-03 06:37:37'),(191,9,71,'2026-07-03 06:37:55'),(192,9,71,'2026-07-03 06:37:56'),(193,9,71,'2026-07-03 06:39:36'),(194,9,71,'2026-07-03 06:39:37'),(195,10,70,'2026-07-03 06:40:09'),(196,10,70,'2026-07-03 06:40:09'),(197,10,70,'2026-07-03 06:40:45'),(198,10,70,'2026-07-03 06:40:45'),(199,10,70,'2026-07-03 06:43:53'),(200,10,70,'2026-07-03 06:43:54'),(201,10,70,'2026-07-03 06:45:37'),(202,10,70,'2026-07-03 06:45:37'),(203,10,70,'2026-07-03 06:45:47'),(204,10,70,'2026-07-03 06:45:48'),(205,10,70,'2026-07-03 06:45:54'),(206,10,70,'2026-07-03 06:45:55'),(207,9,71,'2026-07-03 06:46:43'),(208,9,71,'2026-07-03 06:46:43'),(209,9,71,'2026-07-03 06:48:05'),(210,9,71,'2026-07-03 06:48:05'),(211,10,70,'2026-07-03 06:49:50'),(212,10,70,'2026-07-03 06:49:50'),(213,9,71,'2026-07-03 06:53:11'),(214,9,71,'2026-07-03 06:53:11'),(215,1,71,'2026-07-03 06:53:39'),(216,1,71,'2026-07-03 06:53:39'),(217,10,70,'2026-07-03 06:55:41'),(218,10,70,'2026-07-03 06:55:42'),(219,10,70,'2026-07-03 06:55:48'),(220,10,70,'2026-07-03 06:55:48'),(221,6,70,'2026-07-03 06:58:06'),(222,6,70,'2026-07-03 06:58:06'),(223,1,70,'2026-07-03 06:58:21'),(224,1,70,'2026-07-03 06:58:21'),(225,2,70,'2026-07-03 06:58:53'),(226,2,70,'2026-07-03 06:58:53'),(227,10,70,'2026-07-03 06:58:59'),(228,10,70,'2026-07-03 06:58:59'),(229,2,70,'2026-07-03 07:01:11'),(230,2,70,'2026-07-03 07:01:11'),(231,1,69,'2026-07-03 07:02:07'),(232,1,69,'2026-07-03 07:02:07'),(233,6,70,'2026-07-03 07:02:50'),(234,6,70,'2026-07-03 07:02:50'),(235,9,71,'2026-07-03 07:04:04'),(236,9,71,'2026-07-03 07:04:04'),(237,10,70,'2026-07-03 07:14:57'),(238,10,70,'2026-07-03 07:14:57'),(239,10,70,'2026-07-03 07:15:04'),(240,10,70,'2026-07-03 07:15:04'),(241,9,71,'2026-07-03 07:15:50'),(242,9,71,'2026-07-03 07:15:50'),(243,9,71,'2026-07-03 07:16:06'),(244,9,71,'2026-07-03 07:16:06'),(245,11,70,'2026-07-03 07:16:51'),(246,11,70,'2026-07-03 07:16:51'),(247,1,71,'2026-07-03 07:16:54'),(248,1,71,'2026-07-03 07:16:54'),(249,10,70,'2026-07-03 07:17:02'),(250,10,70,'2026-07-03 07:17:02'),(251,1,70,'2026-07-03 07:17:15'),(252,1,70,'2026-07-03 07:17:15'),(253,1,71,'2026-07-03 07:17:23'),(254,1,71,'2026-07-03 07:17:23'),(255,1,70,'2026-07-03 07:17:46'),(256,1,70,'2026-07-03 07:17:47'),(257,1,71,'2026-07-03 07:18:04'),(258,1,71,'2026-07-03 07:18:04'),(259,9,71,'2026-07-03 07:18:11'),(260,9,71,'2026-07-03 07:18:11'),(261,9,71,'2026-07-03 07:19:08'),(262,9,71,'2026-07-03 07:19:08'),(263,11,69,'2026-07-03 07:19:39'),(264,11,69,'2026-07-03 07:19:39'),(265,9,71,'2026-07-03 07:20:54'),(266,9,71,'2026-07-03 07:20:54'),(267,9,71,'2026-07-03 07:21:01'),(268,9,71,'2026-07-03 07:21:01'),(269,11,69,'2026-07-03 07:22:42'),(270,11,69,'2026-07-03 07:22:42'),(271,13,70,'2026-07-03 07:25:42'),(272,13,70,'2026-07-03 07:25:43'),(273,13,70,'2026-07-03 07:25:47'),(274,13,70,'2026-07-03 07:25:47'),(275,13,70,'2026-07-03 07:26:01'),(276,13,70,'2026-07-03 07:26:01'),(277,12,71,'2026-07-03 07:26:22'),(278,12,71,'2026-07-03 07:26:22'),(279,13,71,'2026-07-03 07:27:12'),(280,13,71,'2026-07-03 07:27:12'),(281,13,70,'2026-07-03 07:27:58'),(282,13,70,'2026-07-03 07:27:58'),(283,11,69,'2026-07-03 07:31:28'),(284,11,69,'2026-07-03 07:31:28'),(285,13,71,'2026-07-03 08:04:12'),(286,13,71,'2026-07-03 08:04:12'),(287,13,70,'2026-07-03 08:06:39'),(288,13,70,'2026-07-03 08:06:40'),(289,1,70,'2026-07-03 08:06:54'),(290,1,70,'2026-07-03 08:06:54'),(291,12,71,'2026-07-03 08:07:25'),(292,12,71,'2026-07-03 08:07:25'),(293,13,70,'2026-07-03 08:07:30'),(294,13,70,'2026-07-03 08:07:30'),(295,11,69,'2026-07-03 08:09:21'),(296,11,69,'2026-07-03 08:09:21'),(297,8,69,'2026-07-03 08:09:35'),(298,8,69,'2026-07-03 08:09:35'),(299,11,69,'2026-07-03 08:09:44'),(300,11,69,'2026-07-03 08:09:45'),(301,1,69,'2026-07-03 08:09:58'),(302,1,69,'2026-07-03 08:09:58'),(303,5,71,'2026-07-03 08:18:24'),(304,5,71,'2026-07-03 08:18:25'),(305,1,69,'2026-07-03 08:21:38'),(306,1,69,'2026-07-03 08:21:38'),(307,14,71,'2026-07-03 08:25:19'),(308,14,71,'2026-07-03 08:25:20'),(309,14,71,'2026-07-03 08:25:48'),(310,14,71,'2026-07-03 08:25:50'),(311,15,71,'2026-07-03 08:31:24'),(312,15,71,'2026-07-03 08:31:24'),(313,15,71,'2026-07-03 08:31:58'),(314,15,71,'2026-07-03 08:31:58'),(315,15,71,'2026-07-03 08:32:01'),(316,15,71,'2026-07-03 08:32:01'),(317,10,71,'2026-07-03 08:36:28'),(318,10,71,'2026-07-03 08:36:28'),(319,16,70,'2026-07-03 08:36:46'),(320,16,70,'2026-07-03 08:36:46'),(321,10,70,'2026-07-03 08:37:55'),(322,10,70,'2026-07-03 08:37:55'),(323,10,70,'2026-07-03 08:37:59'),(324,10,70,'2026-07-03 08:37:59'),(325,10,70,'2026-07-03 08:38:11'),(326,10,70,'2026-07-03 08:38:12'),(327,1,69,'2026-07-03 08:38:16'),(328,1,69,'2026-07-03 08:38:17'),(329,11,70,'2026-07-03 08:39:04'),(330,11,70,'2026-07-03 08:39:04'),(331,16,70,'2026-07-03 08:39:50'),(332,16,70,'2026-07-03 08:39:50'),(333,10,71,'2026-07-03 08:40:16'),(334,10,71,'2026-07-03 08:40:16'),(335,15,71,'2026-07-03 08:40:53'),(336,15,71,'2026-07-03 08:40:53'),(337,15,71,'2026-07-03 08:44:14'),(338,15,71,'2026-07-03 08:44:15'),(339,16,70,'2026-07-03 08:47:59'),(340,16,70,'2026-07-03 08:47:59'),(341,15,71,'2026-07-03 08:49:55'),(342,15,71,'2026-07-03 08:49:55'),(343,1,69,'2026-07-03 08:54:17'),(344,1,69,'2026-07-03 08:54:17'),(345,17,70,'2026-07-03 08:55:20'),(346,17,70,'2026-07-03 08:55:20'),(347,17,70,'2026-07-03 08:55:23'),(348,17,70,'2026-07-03 08:55:23'),(349,17,70,'2026-07-03 08:55:30'),(350,17,70,'2026-07-03 08:55:30'),(351,17,70,'2026-07-03 08:56:51'),(352,17,70,'2026-07-03 08:56:52'),(353,18,69,'2026-07-03 08:58:58'),(354,18,69,'2026-07-03 08:58:58'),(355,18,69,'2026-07-03 09:00:33'),(356,18,69,'2026-07-03 09:00:33'),(357,17,70,'2026-07-03 09:16:05'),(358,17,70,'2026-07-03 09:16:06'),(359,10,70,'2026-07-03 09:20:31'),(360,10,70,'2026-07-03 09:20:31'),(361,9,71,'2026-07-03 09:39:10'),(362,9,71,'2026-07-03 09:39:11'),(363,19,71,'2026-07-03 11:06:36'),(364,17,71,'2026-07-03 11:06:51'),(365,21,71,'2026-07-03 11:09:01'),(366,4,NULL,'2026-07-04 14:03:25'),(367,4,NULL,'2026-07-04 14:03:25'),(368,20,NULL,'2026-07-04 14:03:48'),(369,20,NULL,'2026-07-04 14:03:48'),(370,11,NULL,'2026-07-04 14:04:17'),(371,11,NULL,'2026-07-04 14:04:17'),(372,1,NULL,'2026-07-06 05:01:06'),(373,1,NULL,'2026-07-06 05:01:06');
/*!40000 ALTER TABLE `listing_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listings`
--

DROP TABLE IF EXISTS `listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `seller_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `subcategory_id` bigint DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `price` decimal(12,2) DEFAULT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `listing_status` enum('draft','pending','approved','rejected','sold','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `views_count` bigint DEFAULT '0',
  `likes_count` bigint DEFAULT '0',
  `expires_at` datetime DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `approved_at` datetime DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `visibility` enum('public','private') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'public',
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `shipping_available` tinyint(1) DEFAULT '0',
  `return_policy` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `warranty` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `variants` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `extras` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `brand` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `condition` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Good Condition',
  `used_for` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `offer_badge` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `status` enum('pending','active','sold','inactive','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_listings_seller` (`seller_id`),
  KEY `idx_listings_category` (`category_id`),
  KEY `idx_listings_subcategory` (`subcategory_id`),
  KEY `idx_listings_status` (`listing_status`),
  KEY `idx_listings_slug` (`slug`),
  CONSTRAINT `listings_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `listings_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `admin_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `listings_ibfk_3` FOREIGN KEY (`subcategory_id`) REFERENCES `admin_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `listings_chk_1` CHECK (json_valid(`variants`)),
  CONSTRAINT `listings_chk_2` CHECK (json_valid(`extras`)),
  CONSTRAINT `listings_chk_3` CHECK (json_valid(`meta`))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listings`
--

LOCK TABLES `listings` WRITE;
/*!40000 ALTER TABLE `listings` DISABLE KEYS */;
INSERT INTO `listings` VALUES (1,NULL,64,1,101,'iPhone 14 Pro - 256GB - Space Black',NULL,'Mint condition iPhone 14 Pro, space black, 100% battery health, screen protector since day one. Comes with original invoice and box.',68999.00,NULL,NULL,1,'draft',72,0,NULL,1,NULL,0,'public',NULL,'Sector 18, Noida',0,NULL,'With Warranty',NULL,NULL,'2026-07-02 05:40:41','2026-07-06 05:01:06','Apple','Like New','8 months','','active',NULL),(2,NULL,64,1,101,'Samsung Galaxy S23 Ultra (Phantom Black)',NULL,'Amazing flagship device with 100x Zoom capability. Selling because I got a work phone. Perfect shape.',74999.00,NULL,NULL,1,'approved',28,0,NULL,0,'2026-07-02 12:25:29',0,'public',NULL,'Sector 62, Noida',0,NULL,'No Warranty',NULL,NULL,'2026-07-02 05:40:41','2026-07-03 07:01:11','Samsung','Like New','1 year','','active',NULL),(3,NULL,65,1,102,'MacBook Air M2 - 8GB/512GB (Midnight)',NULL,'Extremely lightweight and fast. Midnight color. Barely used (battery cycle count: 24). Includes original 35W charger.',82500.00,NULL,NULL,1,'approved',4,0,NULL,1,'2026-07-03 12:20:59',0,'public',NULL,'Ghatkopar West, Mumbai',0,NULL,'With Warranty',NULL,NULL,'2026-07-02 05:40:41','2026-07-03 06:50:58','Apple','Like New','6 months','','active',NULL),(4,NULL,65,3,113,'Premium L-Shaped Leatherette Sofa Set',NULL,'Elegant gray L-shaped sofa set. Fits perfectly in any medium/large living room. Selling due to relocation.',18500.00,NULL,NULL,1,'approved',7,0,NULL,0,'2026-07-03 12:35:03',0,'public',NULL,'Bandra West, Mumbai',0,NULL,'No Warranty',NULL,NULL,'2026-07-02 05:40:41','2026-07-04 14:03:25','Furniture World','Good','2 years','','active',NULL),(5,NULL,66,2,108,'Honda City i-VTEC V - 2021 model',NULL,'First owner Honda City in excellent running condition. Fully serviced at authorized dealers only. Zero insurance claims.',895000.00,NULL,NULL,1,'approved',2,0,NULL,0,'2026-07-03 12:34:10',0,'public',NULL,'Mansarovar, Jaipur',0,NULL,'No Warranty',NULL,NULL,'2026-07-02 05:40:41','2026-07-03 08:18:25','Honda','Good','3 years','','active',NULL),(6,NULL,67,4,123,'Fossil Gen 6 Smartwatch (Black)',NULL,'Fully functional Gen 6 smartwatch with heart rate monitoring, SPO2 tracking, and calling features. Glass has zero scratches.',9999.00,NULL,NULL,1,'approved',4,0,NULL,0,'2026-07-03 12:35:05',0,'public',NULL,'Indiranagar, Bengaluru',0,NULL,'With Warranty',NULL,NULL,'2026-07-02 05:40:41','2026-07-03 07:05:05','Fossil','Good','10 months','','active',NULL),(7,NULL,67,4,119,'Designer Men Blazer - Slim Fit - Navy Blue',NULL,'Zara Slim Fit Navy Blazer. Worn exactly once for a wedding. Fits chest size 40. Mint condition.',3499.00,NULL,NULL,1,'approved',4,0,NULL,0,'2026-07-03 12:13:33',0,'public',NULL,'Koramangala, Bengaluru',0,NULL,'No Warranty',NULL,NULL,'2026-07-02 05:40:41','2026-07-03 06:43:32','Zara','Like New','1 month','','active',NULL),(8,NULL,69,1,101,'My Listing for test','my-listing-for-test','sfsdfsdf',8999.00,NULL,NULL,1,'approved',10,0,NULL,0,'2026-07-02 12:04:09',0,'public',NULL,'Jaipur, Rajasthan',0,NULL,NULL,NULL,NULL,'2026-07-02 06:32:39','2026-07-03 08:09:35','Reame',NULL,NULL,'Popular Deal','pending','{\"overviewFields\":[{\"name\":\"custom_1782973931941\",\"label\":\"in Tone\",\"type\":\"number\",\"value\":\"900\"}],\"imageThumbnails\":[\"/uploads/listings/thumbs/1782973959661-tdamjv-thumb.webp\"]}'),(9,NULL,71,1,101,'samsung s23 fe','samsung-s23-fe','samsung s23 fe  8 gb ram and 128 gb storage',20000.00,NULL,NULL,1,'approved',32,0,NULL,0,'2026-07-03 12:16:11',0,'public',NULL,'pratap nagar , jaipur',0,NULL,NULL,NULL,NULL,'2026-07-03 06:34:00','2026-07-03 09:39:11','samsung',NULL,NULL,'Best Price','pending','{\"overviewFields\":[{\"name\":\"custom_1783060421386\",\"label\":\"no\",\"type\":\"text\",\"value\":\"7073896499\"}],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783060440555-63zkao-thumb.webp\"]}'),(10,NULL,70,1,101,'OnePlus Nord 5   -256gb','oneplus-nord-5-256gb','good condition , fully working , no scratch\r\nA OnePlus Nord 5 device with \'Performance mode\' turned on was used to run the benchmark test. Capable of running Call of Duty Mobile natively at 144 FPS, with Battlegrounds Mobile India.\r\n OnePlus Nord 5 (Phantom Grey, 256 GB) features and specifications include 8 GB RAM, 256 GB ROM, 6800 mAh Battery.',36000.00,NULL,NULL,1,'approved',38,0,NULL,0,'2026-07-03 12:11:50',0,'public',NULL,'jaipur',0,NULL,'11',NULL,NULL,'2026-07-03 06:40:00','2026-07-03 09:20:31','oneplus','Good Condition',NULL,'Limited Time Offer','active','{\"overviewFields\":[{\"name\":\"custom_1783061197756\",\"label\":\"Warranty\",\"type\":\"number\",\"value\":\"11\"},{\"name\":\"custom_1783061232060\",\"label\":\"Condition\",\"type\":\"textarea\",\"value\":\"no replace, \"}],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783060800578-qcw5j8-thumb.webp\",\"/uploads/listings/thumbs/1783060800737-nxvd9m-thumb.webp\",\"/uploads/listings/thumbs/1783060800740-p7js48-thumb.webp\"]}'),(11,NULL,69,1,101,'Iphone 13 PRO','iphone-13-pro','jfocowjforwnvo nocv wnvuo nvow owvoi.',300000.00,NULL,NULL,1,'approved',16,0,NULL,0,'2026-07-03 12:36:28',0,'public',NULL,'Jaipur',0,NULL,NULL,NULL,NULL,'2026-07-03 07:06:05','2026-07-04 14:04:17','Apple',NULL,NULL,'Limited Time Offer','active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783062359945-s2t9m3-thumb.webp\"]}'),(12,NULL,71,1,101,'samsung galaxy s23 fe','samsung-galaxy-s23-fe','samsung galaxy s23 fe Display: 6.4-inch FHD+ Dynamic AMOLED 2X, 120Hz adaptive refresh rate.Processor: Qualcomm Snapdragon 8 Gen 1 or Samsung Exynos 2200 (depending on the region/country).RAM & Storage: 8GB LPDDR5 RAM with 128GB or 256GB storage.Camera Setup:Rear: 50MP main (OIS), 12MP Ultra-Wide, and 8MP Telephoto (3x optical zoom, 30x Space Zoom).Front: 10MP selfie camera.Battery & Charging: 4,500 mAh battery supporting 25W wired fast charging, fast wireless charging, and Wireless PowerShare.',20000.00,NULL,NULL,1,'approved',4,0,NULL,0,'2026-07-03 12:59:40',0,'public',NULL,'pratap nagar, jaipur',0,NULL,NULL,NULL,NULL,'2026-07-03 07:24:50','2026-07-03 08:07:25','samsung',NULL,NULL,'Popular Deal','active','{\"overviewFields\":[{\"name\":\"custom_1783063464318\",\"label\":\"condition\",\"type\":\"text\",\"value\":\"very good\"}],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783063490140-sgk4ug-thumb.webp\"]}'),(13,NULL,70,4,119,'Tshirt','tshirt','Unmatched since 1972, the Ralph Lauren Polo shirt is a beloved icon of culture and style. Casual yet sophisticated, polos work as well on the beach with chinos as they do under a blazer for dinner.',500.00,NULL,NULL,1,'approved',16,0,NULL,0,'2026-07-03 12:56:52',0,'public',NULL,'Jaipur,Rajasthan',0,NULL,NULL,NULL,NULL,'2026-07-03 07:25:38','2026-07-03 08:07:30','Polo',NULL,NULL,'Limited Time Offer','active','{\"overviewFields\":[{\"name\":\"custom_1783063489018\",\"label\":\"Condition\",\"type\":\"text\",\"value\":\"No exchange, No return\"}],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783063558283-l5ma4v-thumb.webp\"]}'),(14,NULL,71,1,104,'Prestige PIC 20 NEO Induction Cooktop','prestige-pic-20-neo-induction-cooktop','Indian Menu Options- The Cooktops Comes Ready With Indian Menu Options That Helps You Prepare Authentic Indian Food Like Chapati, Idli And Dosa, At The Touch Of A Button\r\nAnti-Magnetic Wall- To Effectively Block Surplus Magnetic Radiations Influence On The Surrounding, Making It More Efficient\r\nTimer With User Pre-Set; Power Saver Technology\r\nAutomatic Voltage Regulator- The Inbuilt Automatic Voltage Regulator Not Only Takes Care Of Voltage Variance, But Also Ensures That The Load Is Taken By The Appliance Gradually For Durability And Better Performance\r\n1600 Watts; 230V Ac 50Hz',2330.00,NULL,NULL,1,'approved',4,0,NULL,0,'2026-07-03 13:54:38',0,'public',NULL,'jaipur',0,NULL,'1 year',NULL,NULL,'2026-07-03 08:24:12','2026-07-03 08:25:50','prestige','new','daily use','Best Price','active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783067052391-37lomy-thumb.webp\",\"/uploads/listings/thumbs/1783067052499-mlluwb-thumb.webp\"]}'),(15,NULL,71,1,106,'Boat Stone 350 Bluetooth Speaker ','boat-stone-350-bluetooth-speaker-with-10w-rms-stereo-sound-ipx7-water-resistance-tws-feature-up-to-12h-total-playtime-multi-compatibility-modes-black','Power- Get ready to be enthralled by the 10W RMS stereo sound on Stone 350 portable wireless speakers.\r\nIP Rating- With a speaker that offers an IPX7 marked resistance against water and splashes, you can enjoy your playlists across terrains in a carefree way.\r\nPlayback- The speaker offers up to a total of 12 hours of playtime per single charge at 60% volume level.\r\nTrue Wireless- It supports TWS functionality, meaning you can connect two Stone 350s together and simultaneously play music on both of them for twice the impact.\r\nModes- You can enjoy your playlists via multiple connectivity modes namely Bluetooth, AUX and TF Card.\r\nControls- You can control playback and adjust volume levels with ease courtesy easy to access controls.',1399.00,NULL,NULL,1,'approved',12,0,NULL,0,'2026-07-03 14:01:00',0,'public',NULL,'jaipur',0,NULL,'6 months',NULL,NULL,'2026-07-03 08:30:37','2026-07-03 09:17:02','boat','good','relax , party and many function',NULL,'active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783067437060-be6955-thumb.webp\",\"/uploads/listings/thumbs/1783067437122-s3cxkp-thumb.webp\",\"/uploads/listings/thumbs/1783067437123-8l4h6u-thumb.webp\"]}'),(16,NULL,70,1,105,'apple headphones','apple-headphones','Experience premium sound quality with Apple Headphones, designed to deliver crystal-clear audio, deep bass, and immersive listening. Featuring a sleek, lightweight design with soft cushioned ear cups, these headphones provide all-day comfort for music, movies, gaming, and calls.\r\n\r\nEquipped with advanced audio technology, Apple Headphones offer rich, balanced sound and effective noise reduction, allowing you to enjoy every detail without distractions. The built-in microphone ensures clear voice calls, while the intuitive controls let you manage music, adjust volume, and answer calls with ease.\r\n\r\nWith seamless connectivity to Apple devices, long-lasting battery life (for wireless models), and a stylish, modern finish, Apple Headphones are the perfect choice for work, travel, entertainment, and everyday use.',99999.00,NULL,NULL,1,'approved',6,0,NULL,0,'2026-07-03 14:05:36',0,'public',NULL,'apple store Jaipur,Rajasthan',0,NULL,'2',NULL,NULL,'2026-07-03 08:35:06','2026-07-03 08:47:59','Apple','New','Daily use','Limited Time Offer','active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783067706494-up3se0-thumb.webp\",\"/uploads/listings/thumbs/1783067706534-k63mn6-thumb.webp\",\"/uploads/listings/thumbs/1783067706535-09v3hf-thumb.webp\",\"/uploads/listings/thumbs/1783067706536-3zybj9-thumb.webp\"]}'),(17,NULL,70,2,109,'Kawasaki Ninja ZX-10R','kawasaki-ninja-zx-10r','The Kawasaki Ninja ZX-10R is a high-performance superbike designed for riders who demand speed, precision, and advanced technology. Powered by a 998cc liquid-cooled, inline four-cylinder engine, the ZX-10R delivers outstanding power, rapid acceleration, and exceptional handling, making it one of the most competitive motorcycles in the superbike segment.\r\n\r\nInspired by Kawasaki\'s World Superbike racing machines, the Ninja ZX-10R features a lightweight aluminum frame, aerodynamic bodywork with integrated winglets, fully adjustable suspension, Brembo high-performance braking system, and a 6-speed transmission with a quick shifter. Advanced electronic rider aids such as traction control, cornering ABS, launch control, cruise control, multiple riding modes, and a TFT digital instrument display provide both safety and confidence on the road and track.\r\n\r\nWith its aggressive styling, sharp LED headlights, premium build quality, and race-proven engineering, the Kawasaki Ninja ZX-10R offers an exhilarating riding experience. Whether carving through corners on a racetrack or enjoying spirited highway rides, the ZX-10R combines cutting-edge technology, reliability, and world-class performance, making it one of the most respected superbikes in the world.',2078999.00,NULL,NULL,1,'approved',11,0,NULL,0,'2026-07-03 14:45:44',0,'public',NULL,'Jaipur,Rajasthan',0,NULL,'5year',NULL,NULL,'2026-07-03 08:55:14','2026-07-03 11:06:51','Kawasaki Ninja ZX-10R','New','Riding with no limits','Popular Deal','active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783070215140-b3k5fd-thumb.webp\",\"/uploads/listings/thumbs/1783070219725-tbgi2o-thumb.webp\",\"/uploads/listings/thumbs/1783070219948-97cwqb-thumb.webp\",\"/uploads/listings/thumbs/1783070219948-io3fu6-thumb.webp\"]}'),(18,NULL,69,1,102,'HP Victus','hp-victus','icnoure hcwourh  uhg oh h ihge ierh gr iuhreiwgiruhirugihregjahkgiuahg  uhghfs hugalughiu ih gkg kyau sgyusgf yu.',70000.00,NULL,NULL,1,'approved',4,0,NULL,0,'2026-07-03 14:29:31',0,'public',NULL,'Jaipur',0,NULL,'1',NULL,NULL,'2026-07-03 08:58:33','2026-07-03 09:15:10','HP','Good','Professional use','Best Price','active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783069113448-kbqxuo-thumb.webp\",\"/uploads/listings/thumbs/1783069113558-1h7ncw-thumb.webp\",\"/uploads/listings/thumbs/1783069113559-355bat-thumb.webp\",\"/uploads/listings/thumbs/1783069113594-y18kcn-thumb.webp\"]}'),(19,NULL,71,2,110,'Suzuki Burgman Street 125 [2025]','suzuki-burgman-street-125-2025','Price: Suzuki Burgman Street 125 [2025] price for its variant - Burgman Street 125 [2025] EX - OBD 2B starts at Rs. 1,12,337. The mentioned Burgman Street 125 [2025] price is the average ex-showroom.\r\n\r\nSuzuki Burgman Street 125 [2025] is a scooter available in only 1 variant and 3 colours. The Suzuki Burgman Street 125 [2025] is powered by 124cc BS6 engine which develops a power of 8.48 bhp and a torque of 10 Nm. With front disc and rear drum brakes, Suzuki Burgman Street 125 [2025] comes up with combined braking system of both wheels. This Burgman Street 125 [2025] scooter weighs 111 kg and has a fuel tank capacity of 5.5 liters.\r\n\r\nThe Burgman Street is a premium maxi-scooter from Suzuki that rivals the Aprilia SXR 125. It is based on the Suzuki Access 125 but features maxi styling and a foot-forwarding sitting posture. It is available in three variants and multiple colour choices.\r\n\r\n\r\n\r\nThe 2024 Suzuki Burgman Street is powered by a 124cc, single-cylinder, air-cooled, E20-compliant motor that delivers a maximum output of 8.5bhp at 6,750rpm and a peak torque of 10Nm at 5,500rpm. The latest iteration gets an on-board diagnostics system which detects and informs faults in the vehicle system. Furthermore, the scooter can run on E20 petrol, having an ethanol blend of up to 20 per cent.\r\n\r\n\r\n\r\nThe styling remains unchanged, and the 2024 Burgman Street offers sharp design elements such as an apron-mounted headlight, tall fly-screen, wide-footboard, step-up seat, and a side-slung exhaust. Suzuki recently introduced a new Metallic Matte Black No. 2 paint scheme for the scooter.\r\n\r\n\r\n\r\nMeanwhile, telescopic front forks and a single rear spring carry out the suspension duties. All variants come with a front disc and rear drum brake setup, while the safety net includes a combined braking system as standard.',115000.00,NULL,NULL,1,'approved',1,0,NULL,0,'2026-07-03 14:47:14',0,'public',NULL,'jaipur',0,NULL,'none',NULL,NULL,'2026-07-03 09:16:52','2026-07-03 11:06:36','suzuki','good','daily use',NULL,'active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783070212515-bnbd9n-thumb.webp\",\"/uploads/listings/thumbs/1783070212515-z0m7js-thumb.webp\"]}'),(20,NULL,71,3,114,'Hanoi Solid Wood Cane Queen Size Bed With Hydraulic Storage (Amber Walnut Finish, Shitake Beige Colour)','hanoi-solid-wood-cane-queen-size-bed-with-hydraulic-storage-amber-walnut-finish-shitake-beige-colour','From the first light of dawn to the quiet embrace of night, the Hanoi Bed makes every moment magical.\r\n\r\nFramed in solid Mango wood, Hanoi’s silhouette strikes the perfect balance between refinement and warmth. The cane webbing panels on the headboard and footboard introduce an artisanal touch, while a plush, vertically pleated upholstered section at the headboard offers a cocoon of comfort. The result? A bed that’s as soothing to the senses as it is stunning to behold.\r\n\r\nSoft, rounded corners and clean lines ground the design in a timeless yet modern aesthetic. The interplay of wood, cane, and fabric creates a textural symphony, striking the perfect chord between classic charm and contemporary finesse.\r\n\r\nSeek beauty in every detail and comfort in every moment with the Hanoi bed.\r\n\r\nMade from solid Mango wood.\r\nAvailable in two options: Danish Walnut finish with Olive Green fabric and Amber Walnut finish with Shitake Beige fabric.\r\nAvailable in King and Queen size options.\r\nRecommended mattress size for King: 78 x 72 inches; Queen: 78 x 60 inches. Thickness - 4 to 6 inches\r\nAvailable in Non-Storage and Hydraulic Storage options.',65000.00,NULL,NULL,1,'approved',2,0,NULL,0,'2026-07-03 14:52:53',0,'public',NULL,'jaipur',0,NULL,'3 years',NULL,NULL,'2026-07-03 09:22:08','2026-07-04 14:03:48','hanoi','new','daily use',NULL,'active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783070527419-ulgl23-thumb.webp\",\"/uploads/listings/thumbs/1783070527847-23xfup-thumb.webp\",\"/uploads/listings/thumbs/1783070527964-pbrd0u-thumb.webp\"]}'),(21,NULL,71,4,121,'Nike Men Court Vision Low Sneakers (8)','nike-men-court-vision-low-sneakers-8','In love with the classic look of \'80s basketball but have a thing for the fast-paced style of today\'s game? Meet the Nike Court Vision. Crisp leather and suede overlays create an old-school look, while a plush collar keeps the shoe sleek, modern and comfortable.',5675.00,NULL,NULL,1,'approved',1,0,NULL,0,'2026-07-03 14:59:52',0,'public',NULL,'jaipur',0,NULL,'none',NULL,NULL,'2026-07-03 09:28:36','2026-07-03 11:09:01','nike','new','daily use','Popular Deal','active','{\"overviewFields\":[],\"imageThumbnails\":[\"/uploads/listings/thumbs/1783070915632-lykqu6-thumb.webp\",\"/uploads/listings/thumbs/1783070915726-7rpga3-thumb.webp\",\"/uploads/listings/thumbs/1783070915963-vcbzt3-thumb.webp\"]}');
/*!40000 ALTER TABLE `listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `receiver_id` bigint NOT NULL,
  `message_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Listing Approved','Your listing Mahindra Arjun 555 Tractor has been approved by the admin team.',0);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint DEFAULT NULL,
  `listing_id` bigint DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `listing_id` (`listing_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,NULL,1,520000.00),(2,2,NULL,2,1800.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `buyer_id` bigint DEFAULT NULL,
  `seller_id` bigint DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `order_status` enum('pending','confirmed','shipped','delivered','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `order_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `products` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `items_count` int DEFAULT '1',
  `amount` decimal(12,2) DEFAULT '0.00',
  `payment_status` enum('Paid','Unpaid','Refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Paid',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,NULL,65,64,NULL,'delivered','2026-07-02 05:40:41','ORD-9871A',1,'iPhone 14 Pro - 256GB - Space Black',1,68999.00,'Paid'),(2,NULL,67,64,NULL,'confirmed','2026-07-02 05:40:41','ORD-5432B',2,'Samsung Galaxy S23 Ultra (Phantom Black)',1,74999.00,'Paid'),(3,NULL,64,65,NULL,'pending','2026-07-02 05:40:41','ORD-1234C',3,'MacBook Air M2 - 8GB/512GB (Midnight)',1,82500.00,'Unpaid');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_store`
--

DROP TABLE IF EXISTS `otp_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_store` (
  `email` varchar(100) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `purpose` enum('login','register') NOT NULL DEFAULT 'login',
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`,`purpose`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_store`
--

LOCK TABLES `otp_store` WRITE;
/*!40000 ALTER TABLE `otp_store` DISABLE KEYS */;
INSERT INTO `otp_store` VALUES ('joshi.jatin2008@gmail.com','914586','register','2026-06-11 14:40:02','2026-06-11 08:59:20','2026-06-11 09:00:01'),('lokeshkumawat5590@gmail.com','924419','register','2026-06-11 15:09:15','2026-06-11 08:46:06','2026-06-11 09:29:14');
/*!40000 ALTER TABLE `otp_store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `product_photos`
--

DROP TABLE IF EXISTS `product_photos`;
/*!50001 DROP VIEW IF EXISTS `product_photos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `product_photos` AS SELECT 
 1 AS `id`,
 1 AS `product_id`,
 1 AS `image_url`,
 1 AS `is_primary`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `products`
--

DROP TABLE IF EXISTS `products`;
/*!50001 DROP VIEW IF EXISTS `products`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `products` AS SELECT 
 1 AS `id`,
 1 AS `seller_id`,
 1 AS `subcategory_id`,
 1 AS `title`,
 1 AS `brand`,
 1 AS `description`,
 1 AS `price`,
 1 AS `location`,
 1 AS `status`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `condition`,
 1 AS `warranty`,
 1 AS `used_for`,
 1 AS `offer_badge`,
 1 AS `is_featured`,
 1 AS `meta`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `schemes`
--

DROP TABLE IF EXISTS `schemes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schemes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `deadline` date NOT NULL,
  `status` enum('Active','Expiring Soon','Expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schemes`
--

LOCK TABLES `schemes` WRITE;
/*!40000 ALTER TABLE `schemes` DISABLE KEYS */;
INSERT INTO `schemes` VALUES (1,'PM Kisan Samman Nidhi','Ministry of Agriculture','Agriculture','Financial benefit of ₹6,000 per year in three equal installments to all landholding farmer families.','https://pmkisan.gov.in','2026-12-31','Active','2026-07-02 05:40:41'),(2,'Digital India Startup Hub','Ministry of Electronics & IT','Technology','Incubation support, technical mentoring, and prototyping grants up to ₹25 Lakhs for technology startups.','https://www.startupindia.gov.in','2026-06-30','Expiring Soon','2026-07-02 05:40:41'),(3,'MSME Business Growth Loan','Ministry of MSME','Business','Collateral-free credit support up to ₹2 Crores with subsidized interest rates for manufacturing & service sectors.','https://www.udyamregistration.gov.in','2026-09-15','Active','2026-07-02 05:40:41'),(4,'National Apprenticeship Promotion','Ministry of Skill Development','Startups','Financial sharing of stipend up to ₹1,500 per month for apprentice training across Indian industries.','https://www.apprenticeshipindia.gov.in','2026-03-01','Expired','2026-07-02 05:40:41'),(5,'Pradhan Mantri Mudra Yojana','Ministry of Finance','Finance','Provides loans up to ₹10 Lakhs to non-corporate, non-farm small/micro enterprises without collateral.','https://www.mudra.org.in','2026-11-20','Active','2026-07-02 05:40:41');
/*!40000 ALTER TABLE `schemes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_profiles`
--

DROP TABLE IF EXISTS `seller_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `business_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gst_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `seller_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_profiles`
--

LOCK TABLES `seller_profiles` WRITE;
/*!40000 ALTER TABLE `seller_profiles` DISABLE KEYS */;
INSERT INTO `seller_profiles` VALUES (1,64,'Rajesh Agri-Tools Pvt Ltd','07AAAAA1111A1Z1',1,'2026-06-02 05:49:19'),(2,65,'Amit Electronics Store','07BBBBB2222B2Z2',1,'2026-06-02 05:49:19'),(3,66,'Vikram Singh Store',NULL,0,'2026-07-03 10:45:52'),(4,67,'Priya Verma Store',NULL,0,'2026-07-03 10:45:52'),(5,69,'Avinash Store',NULL,0,'2026-07-03 10:45:52'),(6,70,'Prem Trilokani Store',NULL,0,'2026-07-03 10:45:52'),(7,71,'nishant tiwari Store',NULL,0,'2026-07-03 10:45:52');
/*!40000 ALTER TABLE `seller_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategories`
--

DROP TABLE IF EXISTS `subcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `slug` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategories`
--

LOCK TABLES `subcategories` WRITE;
/*!40000 ALTER TABLE `subcategories` DISABLE KEYS */;
INSERT INTO `subcategories` VALUES (101,1,'mobile','Mobile','https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300','2026-07-02 05:40:41'),(102,1,'laptop','Laptop','https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300','2026-07-02 05:40:41'),(104,1,'induction','Induction','https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300','2026-07-02 05:40:41'),(105,1,'headphones','Headphones','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300','2026-07-02 05:40:41'),(106,1,'speaker','Speaker','https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300','2026-07-02 05:40:41'),(108,2,'car','Car','https://images.unsplash.com/photo-1542362567-b07e54358753?w=300','2026-07-02 05:40:41'),(109,2,'bike','Bike','https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300','2026-07-02 05:40:41'),(110,2,'scooter','Scooter','https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300','2026-07-02 05:40:41'),(111,2,'cycle','Cycle','https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300','2026-07-02 05:40:41'),(113,3,'sofa','Sofa','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300','2026-07-02 05:40:41'),(114,3,'bed','Bed','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300','2026-07-02 05:40:41'),(115,3,'table','Table','https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300','2026-07-02 05:40:41'),(119,4,'men-wear','Men Wear','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300','2026-07-02 05:40:41'),(121,4,'shoes','Shoes','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300','2026-07-02 05:40:41'),(122,4,'bags','Bags','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300','2026-07-02 05:40:41'),(123,4,'watches','Watches','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300','2026-07-02 05:40:41');
/*!40000 ALTER TABLE `subcategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint DEFAULT NULL,
  `transaction_id` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_status` enum('pending','success','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,1,'TXN-ABC-12345','success'),(2,2,'TXN-XYZ-98765','pending');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_addresses_ibfk_1` (`user_id`),
  CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_addresses`
--

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES (1,64,'Home Address','Flat 405, Block B, Royal Residency, India',1,'2026-07-02 05:40:41'),(2,64,'Office Address','Corporate Tower, Level 8, Cyber City, India',0,'2026-07-02 05:40:41'),(3,65,'Home Address','Flat 405, Block B, Royal Residency, India',1,'2026-07-02 05:40:41'),(4,65,'Office Address','Corporate Tower, Level 8, Cyber City, India',0,'2026-07-02 05:40:41'),(5,66,'Home Address','Flat 405, Block B, Royal Residency, India',1,'2026-07-02 05:40:41'),(6,66,'Office Address','Corporate Tower, Level 8, Cyber City, India',0,'2026-07-02 05:40:41'),(7,67,'Home Address','Flat 405, Block B, Royal Residency, India',1,'2026-07-02 05:40:41'),(8,67,'Office Address','Corporate Tower, Level 8, Cyber City, India',0,'2026-07-02 05:40:41'),(9,68,'Home Address','Flat 405, Block B, Royal Residency, India',1,'2026-07-02 05:40:41'),(10,68,'Office Address','Corporate Tower, Level 8, Cyber City, India',0,'2026-07-02 05:40:41');
/*!40000 ALTER TABLE `user_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_bank_accounts`
--

DROP TABLE IF EXISTS `user_bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_bank_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_details` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_bank_accounts_ibfk_1` (`user_id`),
  CONSTRAINT `user_bank_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_bank_accounts`
--

LOCK TABLES `user_bank_accounts` WRITE;
/*!40000 ALTER TABLE `user_bank_accounts` DISABLE KEYS */;
INSERT INTO `user_bank_accounts` VALUES (1,64,'State Bank of India','A/C: *******8920 (IFSC: SBIN000420)',1,'2026-07-02 05:40:41'),(2,65,'State Bank of India','A/C: *******8920 (IFSC: SBIN000420)',1,'2026-07-02 05:40:41'),(3,66,'State Bank of India','A/C: *******8920 (IFSC: SBIN000420)',1,'2026-07-02 05:40:41'),(4,67,'State Bank of India','A/C: *******8920 (IFSC: SBIN000420)',1,'2026-07-02 05:40:41'),(5,68,'State Bank of India','A/C: *******8920 (IFSC: SBIN000420)',1,'2026-07-02 05:40:41');
/*!40000 ALTER TABLE `user_bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_payment_methods`
--

DROP TABLE IF EXISTS `user_payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_payment_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `provider` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_payment_methods_ibfk_1` (`user_id`),
  CONSTRAINT `user_payment_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_payment_methods`
--

LOCK TABLES `user_payment_methods` WRITE;
/*!40000 ALTER TABLE `user_payment_methods` DISABLE KEYS */;
INSERT INTO `user_payment_methods` VALUES (1,64,'UPI ID','user@ybl',1,'2026-07-02 05:40:41'),(2,65,'UPI ID','user@ybl',1,'2026-07-02 05:40:41'),(3,66,'UPI ID','user@ybl',1,'2026-07-02 05:40:41'),(4,67,'UPI ID','user@ybl',1,'2026-07-02 05:40:41'),(5,68,'UPI ID','user@ybl',1,'2026-07-02 05:40:41');
/*!40000 ALTER TABLE `user_payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'user',
  `account_status` enum('active','suspended','blocked','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('active','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'active',
  `store_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `store_verified` enum('Yes','No') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'No',
  `email_verified` enum('Yes','No') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Yes',
  `joined_time` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '10:00 AM',
  `rating` decimal(2,1) DEFAULT '4.5',
  `rating_count` int DEFAULT '10',
  `kyc_aadhaar_verified` enum('Yes','No') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'No',
  `kyc_pan_verified` enum('Yes','No') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'No',
  `kyc_bank_verified` enum('Yes','No') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'No',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'cc7c4807-5e46-11f1-9907-e4a8dfe752d4','System Administrator','+919999999999','$2a$10$4z1SKO9P6guO7KxK2UPZguegMcowRciltwiqo3on5ppf8m7.WD/se','admin','active','2026-06-02 05:49:19','2026-06-02 06:05:09','jaipur','System Administrator','admin@gmail.com','$2a$10$4z1SKO9P6guO7KxK2UPZguegMcowRciltwiqo3on5ppf8m7.WD/se','active',NULL,'No','Yes','10:00 AM',4.5,10,'No','No','No'),(64,'90045f0a-75d8-11f1-9d5b-e86a64b02459','Ravi Sharma','9876543210',NULL,'user','active','2026-07-02 05:40:41','2026-07-02 05:40:41','Sector 18, Noida','Ravi Sharma','ravi@gmail.com','$2b$10$R6vU1NEZeuViugWsyLNZdub437X4dLVfnnpabf1fJ9dyExhQe.vx.','active','Ravi Electronics','Yes','Yes','10:15 AM',4.8,42,'Yes','Yes','Yes'),(65,'900509ff-75d8-11f1-9d5b-e86a64b02459','Anita Patel','9812345678',NULL,'user','active','2026-07-02 05:40:41','2026-07-02 05:40:41','Ghatkopar West, Mumbai','Anita Patel','anita@gmail.com','$2b$10$R6vU1NEZeuViugWsyLNZdub437X4dLVfnnpabf1fJ9dyExhQe.vx.','active','Patel Furnitures','Yes','Yes','11:00 AM',4.6,28,'Yes','No','Yes'),(66,'9005d36a-75d8-11f1-9d5b-e86a64b02459','Vikram Singh','9988776655',NULL,'user','active','2026-07-02 05:40:41','2026-07-02 05:40:41','Mansarovar, Jaipur','Vikram Singh','vikram@gmail.com','$2b$10$R6vU1NEZeuViugWsyLNZdub437X4dLVfnnpabf1fJ9dyExhQe.vx.','active','Vikram Auto Dealers','No','Yes','09:30 AM',4.3,15,'No','No','No'),(67,'90066315-75d8-11f1-9d5b-e86a64b02459','Priya Verma','9765432109',NULL,'user','active','2026-07-02 05:40:41','2026-07-02 05:40:41','Indiranagar, Bengaluru','Priya Verma','priya@gmail.com','$2b$10$R6vU1NEZeuViugWsyLNZdub437X4dLVfnnpabf1fJ9dyExhQe.vx.','active','Priya Boutique','Yes','Yes','02:45 PM',4.9,56,'Yes','Yes','No'),(68,'90070344-75d8-11f1-9d5b-e86a64b02459','Deepak Kumar','9554433221',NULL,'user','active','2026-07-02 05:40:41','2026-07-02 05:40:41','Karol Bagh, Delhi','Deepak Kumar','deepak@gmail.com','$2b$10$R6vU1NEZeuViugWsyLNZdub437X4dLVfnnpabf1fJ9dyExhQe.vx.','blocked','Deepak Retail','No','No','12:00 PM',3.8,9,'No','No','No'),(69,'2146ba76-75dd-11f1-9d5b-e86a64b02459','Avinash','+917027888321',NULL,'user','active','2026-07-02 06:13:23','2026-07-02 10:50:46',NULL,'Avinash','aviinyou07@gmail.com',NULL,'active',NULL,'No','Yes','10:00 AM',4.5,10,'No','No','No'),(70,'bb0e5879-76a7-11f1-9d5b-e86a64b02459','Prem Trilokani','+918852069060',NULL,'user','active','2026-07-03 06:23:39','2026-07-03 06:23:39',NULL,'Prem Trilokani','premtrilokani39@gmail.com',NULL,'active',NULL,'No','Yes','10:00 AM',4.5,10,'No','No','No'),(71,'5bbb7e0f-76a8-11f1-9d5b-e86a64b02459','nishant tiwari','+917073896499',NULL,'user','active','2026-07-03 06:28:09','2026-07-06 05:02:00',NULL,'nishant tiwari','nishant1122005@gmail.com',NULL,'active',NULL,'No','Yes','10:00 AM',4.5,10,'No','No','No'),(72,'ec500b19-76a9-11f1-9d5b-e86a64b02459','admin','98989898998','$2b$10$eReQfhHLtXczJvOqpS0deulLWpBAFLo9KC8xxBhle2MCgygRjNnpm','admin','active','2026-07-03 06:39:21','2026-07-03 06:39:21',NULL,NULL,'admin@buyseller.com',NULL,'active',NULL,'No','Yes','10:00 AM',4.5,10,'No','No','No'),(73,'31a38970-77b2-11f1-a4a3-e86a64b02459','kaalu','9090909090','$2b$10$azfp4pXcn9GjKgULSMur4ukaXoz8FxBrN8O5X4ucX0E6UXMngZ9wa','admin','active','2026-07-04 14:11:04','2026-07-04 14:11:04',NULL,NULL,'kaluadmin@buyseller.com',NULL,'active',NULL,'No','Yes','10:00 AM',4.5,10,'No','No','No');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  KEY `wishlists_ibfk_2` (`product_id`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
INSERT INTO `wishlists` VALUES (1,64,3,'2026-07-02 05:40:41'),(2,65,1,'2026-07-02 05:40:41'),(3,69,1,'2026-07-02 06:22:44'),(4,70,2,'2026-07-03 06:24:06');
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'buyerseller'
--

--
-- Final view structure for view `product_photos`
--

/*!50001 DROP VIEW IF EXISTS `product_photos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `product_photos` AS select `listing_images`.`id` AS `id`,`listing_images`.`listing_id` AS `product_id`,`listing_images`.`image_url` AS `image_url`,`listing_images`.`is_primary` AS `is_primary`,`listing_images`.`created_at` AS `created_at` from `listing_images` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `products`
--

/*!50001 DROP VIEW IF EXISTS `products`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp850 */;
/*!50001 SET character_set_results     = cp850 */;
/*!50001 SET collation_connection      = cp850_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `products` AS select `listings`.`id` AS `id`,`listings`.`seller_id` AS `seller_id`,`listings`.`subcategory_id` AS `subcategory_id`,`listings`.`title` AS `title`,`listings`.`brand` AS `brand`,`listings`.`description` AS `description`,`listings`.`price` AS `price`,`listings`.`location` AS `location`,`listings`.`status` AS `status`,`listings`.`created_at` AS `created_at`,`listings`.`updated_at` AS `updated_at`,`listings`.`condition` AS `condition`,`listings`.`warranty` AS `warranty`,`listings`.`used_for` AS `used_for`,`listings`.`offer_badge` AS `offer_badge`,`listings`.`is_featured` AS `is_featured`,`listings`.`meta` AS `meta` from `listings` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07 10:25:26

--
-- Table structure for table `listing_interactions`
--

CREATE TABLE `listing_interactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `listing_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `interaction_type` enum('call','chat') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_interaction` (`listing_id`,`user_id`,`interaction_type`),
  KEY `listing_interactions_listing_id_idx` (`listing_id`),
  KEY `listing_interactions_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
