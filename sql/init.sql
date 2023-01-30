/*
 Navicat Premium Data Transfer

 Source Server         : dbox
 Source Server Type    : MySQL
 Source Server Version : 50738
 Source Host           : 192.168.50.2:3306
 Source Schema         : yield

 Target Server Type    : MySQL
 Target Server Version : 50738
 File Encoding         : 65001

 Date: 24/06/2022 14:49:47
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- ----------------------------
-- Table structure for line_protocol_10m
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_10m`;
CREATE TABLE `line_protocol_10m`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `name` varchar(13) NOT NULL COMMENT 'protocol name',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 10m change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 10m change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  PRIMARY KEY (`line_id`, `name`) USING BTREE,
  INDEX `idx_name`(`name`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for line_protocol_stat_10m
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_stat_10m`;
CREATE TABLE `line_protocol_stat_10m`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 10m change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 10m change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  PRIMARY KEY (`line_id`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for line_protocol_category_stat_10m
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_category_stat_10m`;
CREATE TABLE `line_protocol_category_stat_10m`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `category` varchar(13) NOT NULL COMMENT 'protocol category',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 10m change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 10m change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  PRIMARY KEY (`line_id`, `category`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for line_protocol_8h
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_8h`;
CREATE TABLE `line_protocol_8h`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `name` varchar(13) NOT NULL COMMENT 'protocol name',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  PRIMARY KEY (`line_id`, `name`) USING BTREE,
  INDEX `idx_name`(`name`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;


-- ----------------------------
-- Table structure for line_protocol_stat_8h
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_stat_8h`;
CREATE TABLE `line_protocol_stat_8h`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  PRIMARY KEY (`line_id`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for line_protocol_category_stat_8h
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_category_stat_8h`;
CREATE TABLE `line_protocol_category_stat_8h`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `category` varchar(13) NOT NULL COMMENT 'protocol category',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  PRIMARY KEY (`line_id`, `category`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;



-- ----------------------------
-- Table structure for line_protocol_category_stat_day
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_category_stat_day`;
CREATE TABLE `line_protocol_category_stat_day`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `category` varchar(13) NOT NULL COMMENT 'protocol category',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  PRIMARY KEY (`line_id`, `category`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for line_protocol_day
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_day`;
CREATE TABLE `line_protocol_day`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `name` varchar(13) NOT NULL COMMENT 'protocol name',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  PRIMARY KEY (`line_id`, `name`) USING BTREE,
  INDEX `idx_name`(`name`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;


-- ----------------------------
-- Table structure for line_protocol_stat_day
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_stat_day`;
CREATE TABLE `line_protocol_stat_day`  (
  `line_id` bigint(10) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  PRIMARY KEY (`line_id`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for line_protocol_category_stat_week
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_category_stat_week`;
CREATE TABLE `line_protocol_category_stat_week`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `category` varchar(13) NOT NULL COMMENT 'protocol category',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  PRIMARY KEY (`line_id`, `category`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for line_protocol_week
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_week`;
CREATE TABLE `line_protocol_week`  (
  `line_id` bigint(10) NOT NULL COMMENT 'primary key',
  `name` varchar(13) NOT NULL COMMENT 'protocol name',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  PRIMARY KEY (`line_id`, `name`) USING BTREE,
  INDEX `idx_name`(`name`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;


-- ----------------------------
-- Table structure for line_protocol_stat_week
-- ----------------------------
DROP TABLE IF EXISTS `line_protocol_stat_week`;
CREATE TABLE `line_protocol_stat_week`  (
  `line_id` bigint(10) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(eos)',
  `tvl_usd_change` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  PRIMARY KEY (`line_id`) USING BTREE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for protocol
-- ----------------------------
DROP TABLE IF EXISTS `protocol`;
CREATE TABLE `protocol`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `name` varchar(13) NOT NULL COMMENT 'protocol name',
  `metadata_name` varchar(128) NOT NULL COMMENT 'metadata name',
  `category` varchar(32) DEFAULT NULL COMMENT 'category',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl of eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl of usd valuation',
  `tvl_eos_change_day` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(eos)',
  `tvl_usd_change_day` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(usd)',
  `tvl_eos_change_8h` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(eos)',
  `tvl_usd_change_8h` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(usd)',
  `tvl_eos_change_week` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(eos)',
  `tvl_usd_change_week` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(usd)',
  `agg_rewards` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `balance` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'balance available to be claimed',
  `claimed` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'claimed rewards',
  `rewards` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'The reward',
  `period` int(11) DEFAULT '0' COMMENT 'update period',
  `rewards_period` int(11) DEFAULT '0' COMMENT 'rewards period',
  `create_at` int(10) NULL DEFAULT NULL,
  `metadata` json COMMENT 'metadata',
  `contracts` json DEFAULT NULL COMMENT 'additional supporting EOS contracts',
  `evm` json DEFAULT NULL COMMENT 'additional supporting EVM contracts',
  `status` varchar(20) DEFAULT 'pending' COMMENT 'protocol status: pending,active,denied',
  `is_delete` int(1) DEFAULT '0' COMMENT 'delete status 1: deleted 0: not deleted',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_name`(`name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for protocol_category_stat
-- ----------------------------
DROP TABLE IF EXISTS `protocol_category_stat`;
CREATE TABLE `protocol_category_stat`  (
  `id` bigint(10) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `category` varchar(13) NOT NULL COMMENT 'protocol category',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change_day` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(eos)',
  `tvl_usd_change_day` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(usd)',
  `tvl_eos_change_8h` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(eos)',
  `tvl_usd_change_8h` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(usd)',
  `tvl_eos_change_week` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(eos)',
  `tvl_usd_change_week` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(usd)',
  `agg_rewards` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT 0 COMMENT 'aggregate protocol count',
  `claimed` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'claimed rewards',
  `period` int(11) DEFAULT '0' COMMENT 'report period',
  `rewards_period` int(11) DEFAULT '0' COMMENT 'rewards period',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for protocol_stat
-- ----------------------------
DROP TABLE IF EXISTS `protocol_stat`;
CREATE TABLE `protocol_stat`  (
  `id` bigint(10) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `tvl_eos` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl eos valuation',
  `tvl_usd` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl usd valuation',
  `tvl_eos_change_day` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(eos)',
  `tvl_usd_change_day` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 24h change(usd)',
  `tvl_eos_change_8h` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(eos)',
  `tvl_usd_change_8h` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl 8h change(usd)',
  `tvl_eos_change_week` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(eos)',
  `tvl_usd_change_week` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'tvl week change(usd)',
  `agg_rewards` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards',
  `agg_rewards_change` decimal(30, 10) NOT NULL DEFAULT 0.0000000000 COMMENT 'aggregate rewards change',
  `agg_protocol_count` int(10) NOT NULL DEFAULT '0' COMMENT 'aggregate protocol count',
  `claimed` decimal(30,10) NOT NULL DEFAULT 0.0000000000 COMMENT 'claimed rewards',
  `period` int(11) DEFAULT '0' COMMENT 'report period',
  `rewards_period` int(11) DEFAULT '0' COMMENT 'rewards period',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 ROW_FORMAT = DYNAMIC;


-- ----------------------------
-- Table structure for chain_node
-- ----------------------------
DROP TABLE IF EXISTS `chain_node`;
CREATE TABLE `chain_node`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `chain` varchar(20)  NOT NULL COMMENT 'chain',
  `chain_id` varchar(255)  NOT NULL COMMENT 'chain id',
  `url` varchar(255)  NULL DEFAULT NULL COMMENT 'node url',
  `area` varchar(50)  NULL DEFAULT NULL COMMENT '',
  `sort` smallint(2) NULL DEFAULT NULL COMMENT '',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT 'status(0-disable,1-enable)',
  `is_default` tinyint(1) NULL DEFAULT 0 COMMENT 'is_default(0-no, 1-yes)',
  `remark` varchar(255)  NULL DEFAULT NULL COMMENT '',
  `language` varchar(50)  NULL DEFAULT NULL COMMENT 'language en, zh_CN,zh_TW,ko',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_chain`(`chain`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for params
-- ----------------------------
DROP TABLE IF EXISTS `params`;
CREATE TABLE `params`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `key` varchar(128)  NOT NULL DEFAULT '' COMMENT 'key',
  `value` varchar(128)  NULL DEFAULT NULL COMMENT 'value',
  `remark` varchar(1024)  NULL DEFAULT NULL COMMENT 'remark',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_key`(`key`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 ROW_FORMAT = DYNAMIC;


SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO `yield`.`params` (`id`, `key`, `value`, `remark`) VALUES (1, 'history_sync_status', 'start', 'start,stop,processing');

INSERT INTO `yield`.`chain_node` VALUES (1, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://eos.newdex.one', 'Hongkong', 4, 1, 0, NULL, 'zh_TW,zh_CN');
INSERT INTO `yield`.`chain_node` VALUES (2, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://api.eossweden.se', 'Sweden', 5, 1, 0, NULL, NULL);
INSERT INTO `yield`.`chain_node` VALUES (3, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://eos.eosn.io', 'California, US', 6, 0, 0, NULL, NULL);
INSERT INTO `yield`.`chain_node` VALUES (4, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://proxy.eosnode.tools', 'Washington, US', 4, 0, 0, NULL, NULL);
INSERT INTO `yield`.`chain_node` VALUES (5, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://nodes.eos42.io', 'London, UK', 5, 0, 0, NULL, NULL);
INSERT INTO `yield`.`chain_node` VALUES (6, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://eos.greymass.com', 'Canada', 3, 1, 0, NULL, 'en,ko');
INSERT INTO `yield`.`chain_node` VALUES (7, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://api.eosbeijing.one', 'Tokyo, Japan', 7, 0, 0, 'Cross-domain is not supported', NULL);
INSERT INTO `yield`.`chain_node` VALUES (8, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://geo.eosasia.one', 'Tokyo, Japan', 8, 0, 0, NULL, NULL);
INSERT INTO `yield`.`chain_node` VALUES (9, 'eos',  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' ,'https://mainnet.meet.one', 'Taiwan', 5, 0, 0, NULL, '');
INSERT INTO `yield`.`chain_node` VALUES (10, 'eos', 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' , 'https://eospush.tokenpocket.pro', 'Hongkong', 1, 1, 0, 'TP', 'zh_TW,zh_CN');
INSERT INTO `yield`.`chain_node` VALUES (11, 'eos', 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' , 'https://api.redpacketeos.com', 'Cayman Islands', 6, 0, 0, NULL, NULL);
INSERT INTO `yield`.`chain_node` VALUES (12, 'eos', 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' , 'https://api.eosn.io', 'Canada', 7, 1, 0, NULL, NULL);
INSERT INTO `yield`.`chain_node` VALUES (13, 'eos', 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' , 'https://api.eoslaomao.com', 'United States', 8, 1, 0, NULL, '');
INSERT INTO `yield`.`chain_node` VALUES (14, 'eos', 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' , 'https://eos.blockeden.cn', 'China', 2, 0, 0, NULL, '');
INSERT INTO `yield`.`chain_node` VALUES (15, 'eos', 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' , 'https://api-mainnet.starteos.io', 'Hongkong', 23, 1, 0, NULL, 'en,zh_CN,zh_TW,ko');
INSERT INTO `yield`.`chain_node` VALUES (16, 'eos', 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906' , 'https://eos.defibox.xyz', 'Japan', 20, 1, 1, NULL, NULL);

DROP TABLE IF EXISTS `report`;
CREATE TABLE `report` (
  `id` bigint(20) NOT NULL COMMENT 'id',
  `title` varchar(256) NOT NULL DEFAULT '' COMMENT 'report title',
  `url` varchar(1024) NOT NULL COMMENT 'report url',
  `image` varchar(1024) NOT NULL COMMENT 'report image url',
  `remark` varchar(1024) DEFAULT '' COMMENT 'remark',
  `laste_reading` varchar(128) DEFAULT NULL COMMENT 'laste reading',
  `create_at` varchar(128) DEFAULT NULL COMMENT 'date created',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;