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
    //prompt user with options to select from
    inquirer.prompt([{
        name: "action",
        type: "list",
        message: "Select an Option",
        choices: ["View Product Sales by Department", 'View Existing Departments', "Create New Department", "EXIT"]
    }]).then(function (answers) {
        switch (answers.action) {

            case 'View Product Sales by Department':
                displayProductByDepartment();
                break;

            case 'View Existing Departments':
                displayDepartments();
                break;


            case 'Create New Department':
                newDepartment();
                break;

            case 'EXIT':
                connection.end();
                break;
        }
    });
};

function displayProductByDepartment() {
    connection.query('SELECT DISTINCT department_id, departments.department_name, overhead_costs, sales, (sales - overhead_costs) AS total_profit FROM departments, products WHERE departments.department_name=products.department_name ORDER BY total_profit DESC', function (err, res) {
        if (err) throw err;
        var myTable = new Table({
            head: ['department_id', 'department_name', 'overhead_costs', 'sales', 'total_profit'],
            colWidths: [10, 30, 20, 20, 20]
        });
        if (res.length > 0) {
            for (var i = 0; i < res.length; i++) {
                myTable.push(
                    [res[i].department_id, res[i].department_name, res[i].overhead_costs, res[i].sales, res[i].total_profit]);
            }
        }
        console.log(myTable.toString());
        selectOptions();
    });
}

function newDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "Please input the New Department name: ",
            name: "department_name",
            validate: function (value) {
                if ((value == "") === false) {
                    return true;
                }
                return false;
            }
        },
        {
            type: "input",
            message: "Please imput the Overhead Costs associated with the New Department: ",
            name: "overhead_costs",
            validate: function (value) {
                if ((value == "") === false && isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            type: "confirm",
            message: "Please confirm that the information entered is correct.",
            name: "confirm",
            default: true
        }
    ]).then(function (answer) {
        if (answer.confirm) {
            if (answer.department_name !== "" || answer.overhead_costs !== "") {
                createDepartment(answer.department_name, answer.overhead_costs);
            }
            else {
                console.log("Invalid values, please correct.");
                newDepartment();
            }
        }
        else {
            selectOptions();
        }
    });
}

function createDepartment(department_name, overhead_costs) {

    connection.query('INSERT INTO `departments` SET ?',
        {
            department_name: department_name,
            overhead_costs: overhead_costs
        }
        , function (error, results, fields) {
            if (error) throw error;
            console.log(results.affectedRows + " new department, " + department_name + " added!\n");
            displayDepartments();
        });
}

function displayDepartments() {
    connection.query('SELECT * FROM departments', function (error, response) {
        if (error) throw error;
        var myTable = new Table({
            head: ['Department ID', 'Department Name', 'Overhead Costs'],
            //set widths to scale
            colWidths: [10, 25, 20]
        });
        //for each row of the loop
        for (i = 0; i < response.length; i++) {
            //push data to table
            myTable.push(
                [response[i].department_id, response[i].department_name, response[i].overhead_costs]
            );
        }
        //log the 'Departments' table to console
        console.log(myTable.toString());
        selectOptions();
    });

}