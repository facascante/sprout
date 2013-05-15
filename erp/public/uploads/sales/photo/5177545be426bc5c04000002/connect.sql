SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `connect` ;
CREATE SCHEMA IF NOT EXISTS `connect` DEFAULT CHARACTER SET latin1 ;
USE `connect` ;

-- -----------------------------------------------------
-- Table `connect`.`account`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `connect`.`account` ;

CREATE  TABLE IF NOT EXISTS `connect`.`account` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `fet_no` VARCHAR(15) NOT NULL ,
  `pin` VARCHAR(45) NULL DEFAULT NULL ,
  `salt` VARCHAR(100) NOT NULL ,
  `password` VARCHAR(200) NOT NULL ,
  `connect_min` VARCHAR(45) NULL DEFAULT NULL ,
  `nvs_credential` VARCHAR(45) NULL DEFAULT NULL ,
  `mbal` FLOAT NULL DEFAULT NULL ,
  `text_alloc` FLOAT NULL DEFAULT NULL ,
  `text_expiry` TIMESTAMP NULL DEFAULT NULL ,
  `call_alloc` FLOAT NULL DEFAULT NULL ,
  `call_expiry` TIMESTAMP NULL DEFAULT NULL ,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ,
  `last_login` TIMESTAMP NULL DEFAULT NULL ,
  `status` VARCHAR(45) NULL DEFAULT 'active' ,
  PRIMARY KEY (`id`, `fet_no`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `connect`.`batch_salt`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `connect`.`batch_salt` ;

CREATE  TABLE IF NOT EXISTS `connect`.`batch_salt` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `salt` VARCHAR(100) NOT NULL ,
  `batch` VARCHAR(45) NOT NULL ,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ,
  PRIMARY KEY (`id`, `salt`, `batch`) ,
  UNIQUE INDEX `salt_UNIQUE` (`salt` ASC) ,
  UNIQUE INDEX `batch_UNIQUE` (`batch` ASC) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `connect`.`min_prov`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `connect`.`min_prov` ;

CREATE  TABLE IF NOT EXISTS `connect`.`min_prov` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `nvs_username` VARCHAR(15) NOT NULL ,
  `nvs_credential` VARCHAR(20) NOT NULL ,
  `sim_status` VARCHAR(45) NULL DEFAULT 'available' ,
  PRIMARY KEY (`id`, `nvs_username`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `connect`.`pin_prov`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `connect`.`pin_prov` ;

CREATE  TABLE IF NOT EXISTS `connect`.`pin_prov` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `pin` VARCHAR(45) NOT NULL ,
  `skucode` VARCHAR(45) NULL DEFAULT NULL ,
  `validity` VARCHAR(45) NULL DEFAULT NULL ,
  `pin_status` VARCHAR(45) NULL DEFAULT NULL ,
  `hashpin` VARCHAR(100) NULL DEFAULT NULL ,
  `batch` VARCHAR(45) NULL DEFAULT NULL ,
  `prefix` VARCHAR(45) NULL DEFAULT NULL ,
  PRIMARY KEY (`id`, `pin`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;


-- -----------------------------------------------------
-- Table `connect`.`product`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `connect`.`product` ;

CREATE  TABLE IF NOT EXISTS `connect`.`product` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `skucode` VARCHAR(45) NULL DEFAULT NULL ,
  `call_alloc` VARCHAR(45) NULL ,
  `text_alloc` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;

USE `connect` ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
