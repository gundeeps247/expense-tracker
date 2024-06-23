document.addEventListener("DOMContentLoaded", () => {
    window.showAuthOptions = showAuthOptions;
    window.showRegister = showRegister;
    window.showLogin = showLogin;
    window.register = register;
    window.login = login;
    window.addExpense = addExpense;
    window.loadExpensesAndRenderChart = loadExpensesAndRenderChart;
    window.loadExpenses = loadExpenses;
    window.showEditExpense = showEditExpense;
    window.editExpense = editExpense;
    window.deleteExpense = deleteExpense;
});

const apiUrl = "http://localhost:5000/api"; // Updated base URL

let chart = null; // Global variable to hold the chart instance

function showAuthOptions() {
    document.getElementById("auth-options").style.display = "block";
    document.getElementById("register").style.display = "none";
    document.getElementById("login").style.display = "none";
}

function showRegister() {
    document.getElementById("auth-options").style.display = "none";
    document.getElementById("register").style.display = "block";
}

function showLogin() {
    document.getElementById("auth-options").style.display = "none";
    document.getElementById("login").style.display = "block";
}

async function register() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const registerMsg = document.getElementById("register-msg");

    const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.status === 201) {
        registerMsg.textContent = "Registration successful!";
        document.getElementById("register").style.display = "none";
        document.getElementById("login").style.display = "block";
    } else {
        registerMsg.textContent = await response.text();
    }
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const loginMsg = document.getElementById("login-msg");

    const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.status === 200) {
        const data = await response.json();
        sessionStorage.setItem("token", data.token); // Store token
        loginMsg.textContent = "Login successful!";
        document.getElementById("login").style.display = "none";
        document.getElementById("tracker").style.display = "block";
        sessionStorage.setItem("currentUser", username);
        loadExpensesAndRenderChart(); // Load expenses and render chart on successful login
        loadExpenses(); // Also load expense list
    } else {
        loginMsg.textContent = await response.text();
    }
}

async function addExpense() {
    const name = document.getElementById("expense-name").value;
    const category = document.getElementById("expense-category").value;
    const date = document.getElementById("expense-date").value;
    const amount = document.getElementById("expense-amount").value;

    const token = sessionStorage.getItem("token"); // Get token
    const response = await fetch(`${apiUrl}/expenses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Include token
        },
        body: JSON.stringify({ name, category, date, amount }),
    });

    if (response.status === 201) {
        loadExpensesAndRenderChart(); // Reload chart after adding expense
        loadExpenses(); // Also reload expense list
    } else {
        alert(await response.text());
    }
}

async function loadExpensesAndRenderChart() {
    const username = sessionStorage.getItem("currentUser");
    const token = sessionStorage.getItem("token");

    try {
        const response = await fetch(`${apiUrl}/expenses?username=${username}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            console.log("Unauthorized access. Please log in again.");
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch expenses: ${response.status}`);
        }

        const expenses = await response.json();

        const categories = [];
        const amounts = [];

        expenses.forEach((expense) => {
            categories.push(expense.category);
            amounts.push(expense.amount);
        });

        const canvas = document.getElementById('expense-chart');
        if (!canvas) {
            throw new Error("Canvas element with ID 'expense-chart' not found.");
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Cannot get canvas context. Canvas element not found or getContext() method not supported.");
        }

        // Destroy the previous chart if it exists
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Expenses',
                    data: amounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error loading expenses and rendering chart:", error.message);
    }
}

async function loadExpenses() {
    const token = sessionStorage.getItem("token"); // Get token
    const response = await fetch(`${apiUrl}/expenses`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}` // Include token
        }
    });

    if (response.status === 200) {
        const expenses = await response.json();
        const expenseList = document.getElementById("expense-list");
        expenseList.innerHTML = "";

        expenses.forEach((expense) => {
            const li = document.createElement("li");
            li.textContent = `Name: ${expense.name}, Category: ${expense.category}, Date: ${expense.date}, Amount: ${expense.amount}`;
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = () => showEditExpense(expense);
            li.appendChild(editButton);
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteExpense(expense._id);
            li.appendChild(deleteButton);
            expenseList.appendChild(li);
        });
    } else {
        alert("Failed to load expenses: " + await response.text());
    }
}

function showEditExpense(expense) {
    document.getElementById("expense-id").value = expense._id;
    document.getElementById("expense-name").value = expense.name;
    document.getElementById("expense-category").value = expense.category;
    document.getElementById("expense-date").value = new Date(expense.date).toISOString().substring(0, 10);
    document.getElementById("expense-amount").value = expense.amount;
    document.getElementById("add-expense-btn").style.display = "none";
    document.getElementById("edit-expense-btn").style.display = "block";
}

async function editExpense() {
    const id = document.getElementById("expense-id").value;
    const name = document.getElementById("expense-name").value;
    const category = document.getElementById("expense-category").value;
    const date = document.getElementById("expense-date").value;
    const amount = document.getElementById("expense-amount").value;

    const token = sessionStorage.getItem("token"); // Get token
    const response = await fetch(`${apiUrl}/expenses/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Include token
        },
        body: JSON.stringify({ name, category, date, amount }),
    });

    if (response.status === 200) {
        loadExpenses(); // Reload expense list after editing
        loadExpensesAndRenderChart(); // Reload chart after editing
        document.getElementById("add-expense-btn").style.display = "block";
        document.getElementById("edit-expense-btn").style.display = "none";

        document.getElementById("expense-form").reset();
    } else {
        alert(await response.text());
    }
}

async function deleteExpense(id) {
    const token = sessionStorage.getItem("token"); // Get token
    const response = await fetch(`${apiUrl}/expenses/${id}`, { // Updated endpoint
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}` // Include token
        }
    });

    if (response.status === 200) {
        loadExpenses(); // Reload expense list after deletion
        loadExpensesAndRenderChart(); // Reload chart after deletion
    } else {
        console.error("Failed to delete expense:", await response.text());
        alert("Failed to delete expense. Please try again.");
    }
}
