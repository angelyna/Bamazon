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
        choices: ["Display Products", "Buy Products", "EXIT"]
    }]).then(function (answers) {
        //select user response, launch corresponding function
        switch (answers.action) {
            case 'Display Products':
                displayProducts();
                break;

            case 'Buy Products':
                buyProducts();
                break;

            case 'EXIT':
                connection.end();
                break;
        }
    });
};


function displayProducts() {
    connection.query('SELECT * FROM products', function (error, response) {
        if (error) throw error;
        var myTable = new Table({
            head: ['Product ID', 'Product', 'Department', 'Price', 'Quantity', 'Sales'],
            colWidths: [10, 25, 25, 10, 10, 15]
        });
        for (i = 0; i < response.length; i++) {
            myTable.push(
                [response[i].item_id, response[i].product_name, response[i].department_name, response[i].price, response[i].stock_quantity, response[i].sales]
            );
        }
        console.log(bamazonTextColor(myTable.toString()));
        selectOptions();
    });
}

function buyProducts() {
    //prompt potential buyer(s) to respond abour: (1)the pruduct id; and (2)the quantity. 
    //Update the bamazon Database consistent with the buyer's transaction(s)..
    inquirer
        .prompt([
            {
                name: "ID",
                type: "input",
                message: "Please input the id number of the pruduct you want to buy!"
            },
            {
                name: 'Quantity',
                type: 'input',
                message: "How many units of the product do you want to buy?"
            }
        ])
        .then(function (answer) {
            //collect client input as variables and pass these variables as parameters.
            var yourID = answer.ID;
            var yourQuantity = answer.Quantity;
            yourOrder(yourID, yourQuantity);
        });
};
function yourOrder(ID, Quantity) {
    connection.query("SELECT * FROM products WHERE ?",
        [
            {
                item_id: ID
            }
        ],
        function (error, response) {
            if (error) throw error;
            //if in stock
            if (Quantity <= response[0].stock_quantity) {
                //calculate cost
                var orderCost = response[0].price * Quantity;
                //inform buyer about purchase
                console.log(bamazonTextColor("----------------------------------------------------------------------------------------------"));
                console.log(bamazonTextColor("----------------------------------------------------------------------------------------------"));
                console.log(bamazonTextColor(`Your ORDER of ${Quantity} units of ${response[0].product_name.toUpperCase()} amounts to ${orderCost} dollars. Thank you for your Business!`));
                //update database inventory by deducting the quantity bought from the inventory
                connection.query('UPDATE products SET stock_quantity = stock_quantity - ' + Quantity + ' WHERE item_ID = ' + ID);
                connection.query('UPDATE products SET sales = sales + ' + orderCost + ' WHERE item_ID = ' + ID);
                console.log(bamazonTextColor("----------------------------------------------------------------------------------------------"));
                console.log(bamazonTextColor("----------------------------------------------------------------------------------------------"));
            } else {
                console.log(bamazonTextColor(`Insufient quantity of ${response[0].product_name} to fulfill today your entire order.`));
                console.log(bamazonTextColor("----------------------------------------------------------------------------------------------"));
            };
            selectOptions();
        });
}



