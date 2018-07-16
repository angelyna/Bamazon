// define node.js variables 
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var clc = require('cli-color');
var bamazonTextColor = clc.cyanBright;
var figlet = require('figlet');

//create connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

console.log(bamazonTextColor("----------------------------------------------------------------------------------------------------------------------------------------------------"));

//Display 'Theme text characters' to drawings using figlet npm package.
figlet("                  WELCOME  TO  BAMAZON", function (err, data) {
	if (err) throw err;
	console.log(data);
	console.log(bamazonTextColor("----------------------------------------------------------------------------------------------------------------------------------------------------"));

connection.connect(function (err) {
    if (err) throw err;
    console.log(bamazonTextColor("Quote of the Day: YOU LIVE ON A BLUE PLANET THAT CIRCLES AROUND A BALL OF FIRE NEXT TO A MOON THAT MOVES THE SEA, AND YOU DON'T BELIEVE IN MIRACLES?"));
    console.log(bamazonTextColor("----------------------------------------------------------------------------------------------------------------------------------------------------"));
    selectOptions();
});
})

function selectOptions() {
    //inquire for input
    inquirer.prompt([{
        name: "action",
        type: "list",
        message: "Select an Option",
        choices: ["View Products for Sale", "View Low Inventory (below 5 units)", "Add to Inventory", "Add New Product", "EXIT"]
    }]).then(function (answers) {
        //select user response, launch corresponding function
        switch (answers.action) {
            case 'View Products for Sale':
                displayInventory();
                break;

            case 'View Low Inventory (below 5 units)':
                lowInventory();
                break;

            case 'Add to Inventory':
                addInventory();
                break;

            case 'Add New Product':
                newInventory();
                break;

            case 'EXIT':
                connection.end();
                break;
        }
    });
}; 


function displayInventory() {
    connection.query('SELECT * FROM products', function (error, response) {
        if (error) throw error;
        var myTable = new Table({
            //declare the table headers
            head: ['Product ID', 'Product', 'Department', 'Price', 'Quantity'],
            //set widths to scale
            colWidths: [10, 25, 25, 10, 10]
        });
        //for each row of the loop
        for (i = 0; i < response.length; i++) {
            //push data to table
            myTable.push(
                [response[i].item_id, response[i].product_name, response[i].department_name, response[i].price, response[i].stock_quantity]
            );
        }
        //log the 'Invemtory' table to console
        console.log(myTable.toString());
        selectOptions();
    });
}


function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, response) {
        if (err) throw err;
        if (response.length >= 1) {
            var myTable = new Table({
                head: ['Product ID', 'Product', 'Department', 'Price', 'Quantity'],
                colWidths: [10, 25, 25, 10, 10]
            });
            for (i = 0; i < response.length; i++) {
                myTable.push(
                    [response[i].item_id, response[i].product_name, response[i].department_name, response[i].price, response[i].stock_quantity]
                );
            }
            console.log(myTable.toString());

            console.log("--------------------------------------------------------------------------------")
            console.log(`Currently, you have ${response.length} product(s) with LOW inventory in stock. Upgrade inventory!`);
            console.log("--------------------------------------------------------------------------------");
        }
        else if (response.length < 1) {
            // selectOptions();
            console.log("----------------------------------------------------------------");
            console.log("Currently, there are no products with LOW inventory in stock!!!");
            console.log("----------------------------------------------------------------");
        }
        selectOptions();
    });
};

function addInventory() {
    // prompt for info about the inventory product being updated
    // function to let the manager "add more" of any item currently in the store.
    inquirer
        .prompt([
            {
                name: "ID",
                type: "input",
                message: "The stock update is allowed exclusively for existent incentory IDs. \n? Input the ID number of the in-stock-product to update: ",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Input the inventory quantity to be added to existing stock: "
            }
        ]).then(function (answer) {
            // when finished prompting, update the inventory into the db with that quantity information
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [{
                    item_id: answer.ID
                },
                {
                    stock_quantity: answer.quantity
                }],
                function (err, res) {
                    if (err) throw err;
                    connection.query('SELECT * FROM products WHERE item_id= ' + answer.ID, function (error, response) {

                        if (error) throw error;
                        if (response.length !== 0) {
                            connection.query('UPDATE products SET stock_quantity = stock_quantity + ' + answer.quantity + ' WHERE item_id = ' + answer.ID);
                            console.log("-----------------------------------------------");
                            console.log('Inventory successfully updated in database!');
                            console.log("-----------------------------------------------");
                        } else {
                            console.log("-------------------------------------------------------------------------------------");
                            console.log('This ID does not exist in databse! You can only make updates for existing inventory!');
                            console.log("-------------------------------------------------------------------------------------");
                        }
                        //re-prompt the menu of option
                        selectOptions();
                    })
                })
        })
}

function newInventory() {
    //function to add a completely new product to the existing database.
    //Update the bamazon Database accordingly.
    inquirer
        .prompt([
            {
                name: "product_name",
                type: "input",
                message: "Please, input the name of the new inventory!"
            },
            {
                name: 'department_name',
                type: 'input',
                message: "Please, input the category of the new inventory?"
            },
            {
                name: "price",
                type: "input",
                message: "Please, input the price of the new inventory!"
            },
            {
                name: 'stock_quantity',
                type: 'input',
                message: "Please, input the quantity of new inventory?"
            }
        ])
        .then(function (answer) {
            //collect client input as variables and pass variables as parameters.
            var newName = answer.product_name;
            var newDepartment = answer.department_name;
            var newPrice = answer.price;
            var newStock = answer.stock_quantity;
            var newSales = 0.00;
            addNewInventory(newName, newDepartment, newPrice, newStock, newSales);
        });
};


function addNewInventory(newName, newDepartment, newPrice, newStock, newSales) {
    //query database, insert new item
    connection.query(
        'INSERT INTO products (product_name, department_name, price, stock_quantity, sales) VALUES("' + newName + '","' + newDepartment + '","' + newPrice + '","' + newStock + '","' + newSales + '")');
    //display updated db
    displayInventory();
};//end buildNewItem

