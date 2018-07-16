DROP DATABASE IF EXISTS bamazon;

/* create database*/
CREATE DATABASE bamazon;
USE bamazon;

/*create a table called 'products' inside the database, with item_id as primary key*/
CREATE TABLE products(
item_id INT NOT NULL  AUTO_INCREMENT,
product_name VARCHAR (100) NOT NULL,
department_name VARCHAR (50) NOT NULL,
price decimal (5,2) NOT NULL,
stock_quantity INTEGER (4) DEFAULT NULL,
sales decimal (6,2) NOT NULL,
PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity, sales)
VALUES 
	("Roses", "Flowers", 6.50, 100,0),
	("Cosmos", "Flowers", 3.50, 200,0),
    ("Crown Imperiale", "Flowers", 5.50, 150,0),
	("Strawberries", "Fruits", 3.50, 300,0),
	("Peaches", "Fruits", 2.50, 125,0),
	("Icecream", "Sweets", 1.50, 400,0),
	("Honey", "Sweets", 7.50, 250,0);

/*create a table called 'departments' inside the database, with department_id as primary key*/

CREATE TABLE departments(
department_id INT NOT NULL AUTO_INCREMENT,
department_name VARCHAR (50) NOT NULL,
overhead_costs  decimal (8,2) NOT NULL,
PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, overhead_costs)
VALUES 
	("Flowers", 1000),
	("Fruits", 3000),
	("Sweets", 2500);
    