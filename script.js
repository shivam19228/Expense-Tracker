// --- Data Initialization ---
let transactions = JSON.parse(localStorage.getItem('expenses')) || [];

const form = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');

// --- Core Functions ---

function updateDashboard() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = income - expense;

    document.getElementById('totalIncome').innerText = `₹${income.toFixed(2)}`;
    document.getElementById('totalExpense').innerText = `₹${expense.toFixed(2)}`;
    document.getElementById('totalBalance').innerText = `₹${balance.toFixed(2)}`;
}

function renderTransactions() {
    const filter = document.getElementById('filterType').value;
    transactionList.innerHTML = '';

    const filtered = transactions.filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    filtered.forEach(t => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><small>${t.date}</small></td>
            <td>${t.title}</td>
            <td><span class="badge bg-secondary opacity-75">${t.category}</span></td>
            <td class="${t.type === 'income' ? 'income-text' : 'expense-text'}">
                ${t.type === 'income' ? '+' : '-'}₹${parseFloat(t.amount).toFixed(2)}
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm btn-sm-icon" onclick="editTransaction('${t.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm btn-sm-icon" onclick="deleteTransaction('${t.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        transactionList.appendChild(row);
    });

    if (filtered.length === 0) {
        transactionList.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No transactions found</td></tr>`;
    }

    updateDashboard();
}

// --- CRUD Operations ---

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value || Date.now().toString();
    const newTransaction = {
        id: id,
        title: document.getElementById('title').value,
        amount: document.getElementById('amount').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    const editIndex = transactions.findIndex(t => t.id === id);

    if (editIndex > -1) {
        transactions[editIndex] = newTransaction;
    } else {
        transactions.push(newTransaction);
    }

    localStorage.setItem('expenses', JSON.stringify(transactions));
    resetForm();
    renderTransactions();
});

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('expenses', JSON.stringify(transactions));
        renderTransactions();
    }
}

function editTransaction(id) {
    const t = transactions.find(t => t.id === id);
    document.getElementById('editId').value = t.id;
    document.getElementById('title').value = t.title;
    document.getElementById('amount').value = t.amount;
    document.getElementById('type').value = t.type;
    document.getElementById('category').value = t.category;
    document.getElementById('date').value = t.date;

    document.getElementById('formTitle').innerText = "Edit Transaction";
    document.getElementById('saveBtn').innerText = "Update Transaction";
    document.getElementById('cancelBtn').classList.remove('d-none');
}

function resetForm() {
    form.reset();
    document.getElementById('editId').value = "";
    document.getElementById('formTitle').innerText = "Add Transaction";
    document.getElementById('saveBtn').innerText = "Save Transaction";
    document.getElementById('cancelBtn').classList.add('d-none');
}

// --- Export Functionality (Blob API) ---

function exportToCSV() {
    if (transactions.length === 0) return alert("No data to export!");

    let csvContent = "Date,Title,Category,Type,Amount\n";
    
    transactions.forEach(t => {
        csvContent += `${t.date},${t.title},${t.category},${t.type},${t.amount}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'expense_report.csv');
    a.click();
}

// --- Dark Mode ---

const themeBtn = document.getElementById('darkModeToggle');
themeBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.body.removeAttribute('data-theme');
        themeBtn.innerHTML = '<i class="bi bi-moon-stars"></i>';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeBtn.innerHTML = '<i class="bi bi-sun"></i>';
    }
});

// Initial Load
renderTransactions();