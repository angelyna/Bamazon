DROP DATABASE IF EXISTS bamazon;

/* create database*/
CREATE DATABASE bamazon;
USE bamazon;

/*create a table called 'departments' inside the database, with department_id as primary key*/

CREATE TABLE departments(
department_id INT NOT NULL AUTO_INCREMENT,
department_name VARCHAR (50) NOT NULL,
overhead_costs  decimal (5,2) NOT NULL,
PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, overhead_costs)
VALUES 
	("Flowers", 1000),
	("Fruits", 3000),
	("Sweets", 2500);