-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS sykell_crawler;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'sykell'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON sykell_crawler.* TO 'sykell'@'%';
FLUSH PRIVILEGES;

-- Use the database
USE sykell_crawler;

-- The tables will be created automatically by GORM migrations
-- This file is just to ensure the database and user exist