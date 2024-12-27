const form = document.getElementById("transactionForm");
const transactionsTable = document.querySelector(
  "#transactionsTable tbody"
);
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");

let incomeTotal = 0;
let expenseTotal = 0;

// Check if user is logged in
const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = 'login-and-signup.html'; 
}

// Logout functionality
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('userId'); // Clear user ID from local storage
        window.location.href = 'login-and-signup.html'; // Redirect to login page
    });
}

// Fetch transactions for the logged-in user and calculate totals
const fetchTransactions = async () => {
    try {
        const response = await fetch(`http://localhost:3000/transactions/${userId}`);
        if (response.ok) {
            const transactions = await response.json();
            transactions.forEach(transaction => {
                const amount = Number(transaction.amount); // Ensure amount is a number
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${transaction.type}</td>
                    <td>${transaction.category}</td>
                    <td>$${amount.toFixed(2)}</td>
                    <td>
                        <button id="delete" onclick="deleteTransaction(this, '${transaction.type}', ${amount}, '${transaction.transaction_id}')">Delete</button>
                    </td>
                `;
                transactionsTable.appendChild(row);

                // Update totals based on transaction type (case insensitive)
                if (transaction.type.toLowerCase() === "income") {
                    incomeTotal += amount; // Add to income total
                } else if (transaction.type.toLowerCase() === "expense") {
                    expenseTotal += amount; // Add to expense total
                }
            });
            // Update the displayed totals
            totalIncome.textContent = `$${incomeTotal.toFixed(2)}`;
            totalExpense.textContent = `$${expenseTotal.toFixed(2)}`;
        } else {
            console.error('Error fetching transactions:', await response.json());
        }
    } catch (error) {
        console.error('Error during fetching transactions:', error);
    }
};

// Call fetchTransactions on page load
fetchTransactions();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (isNaN(amount) || amount <= 0 || !userId) return; // Ensure user ID is present

    // Create a new transaction object
    const transaction = {
        user_id: userId,
        amount: amount,
        category: category,
        type: type,
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    };

    try {
        const response = await fetch('http://localhost:3000/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transaction),
        });

        if (response.ok) {
            // Optionally, you can log the response or do something with it
            console.log('Transaction added successfully!');

            // Reload the page to reflect the new transaction
            location.reload();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error during transaction submission:', error);
        alert('An error occurred while submitting the transaction. Please try again.');
    }
});

let isDeleting = false; // Flag to prevent multiple clicks

const deleteTransaction = async (button, type, amount, transactionId) => {
    console.log(`Attempting to delete transaction ID: ${transactionId}`); // Log transaction ID
    try {
        const response = await fetch(`http://localhost:3000/transactions/${transactionId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            // If deletion is successful, remove the row from the table
            const row = button.parentElement.parentElement; // Get the row to be removed
            row.remove(); // Remove the row from the table

            // Update totals based on transaction type
            if (type.toLowerCase() === "income") {
                incomeTotal -= amount; // Subtract from income total
                totalIncome.textContent = `$${incomeTotal.toFixed(2)}`; // Update displayed total
            } else if (type.toLowerCase() === "expense") {
                expenseTotal -= amount; // Subtract from expense total
                totalExpense.textContent = `$${expenseTotal.toFixed(2)}`; // Update displayed total
            }
        } else {
            const errorData = await response.json();
            alert(`Error deleting transaction: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error during transaction deletion:', error);
        alert('An error occurred while deleting the transaction. Please try again.');
    } 
};

const clearForm = () => {
  form.reset();
};