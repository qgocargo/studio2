// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// DOM Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const toggleAuthLink = document.getElementById('toggle-auth');
const authTitle = document.getElementById('auth-title');
const logoutBtn = document.getElementById('logout-btn');
const whmcsForm = document.getElementById('whmcs-form');
const userList = document.getElementById('user-list');
const dataTable = document.getElementById('data-table');
const searchBar = document.getElementById('search-bar');
const activeUsersList = document.getElementById('active-users-list');

// State variables
let currentUid = null;
let currentWhmcsConfig = {};
let allUsers = {};
let allTableData = [];
let selectedUserId = null;


// --- AUTHENTICATION ---
toggleAuthLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        authTitle.textContent = 'Login';
        toggleAuthLink.textContent = 'Don\'t have an account? Sign Up';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authTitle.textContent = 'Sign Up';
        toggleAuthLink.textContent = 'Have an account? Login';
    }
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('Signed up:', userCredential.user);
            // You can add default data for the new user here
            db.ref('users/' + userCredential.user.uid).set({
                email: email,
                last_login: Date.now()
            });
        })
        .catch(error => {
            alert(error.message);
        });
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log('Logged in:', userCredential.user);
        })
        .catch(error => {
            alert(error.message);
        });
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

auth.onAuthStateChanged(user => {
    if (user) {
        currentUid = user.uid;
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        db.ref('users/' + currentUid + '/last_login').set(firebase.database.ServerValue.TIMESTAMP);
        loadInitialData();
    } else {
        currentUid = null;
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
    }
});

// --- DATA HANDLING ---
function loadInitialData() {
    // Load WHMCS config for the current user
    db.ref('users/'' + currentUid + '/whmcs').on('value', (snapshot) => {
        const config = snapshot.val();
        if (config) {
            currentWhmcsConfig = config;
            document.getElementById('whmcs-identifier').value = config.identifier || '';
            document.getElementById('whmcs-secret').value = config.secret || '';
            document.getElementById('whmcs-url').value = config.url || '';
            document.getElementById('whmcs-api-url').value = config.apiUrl || '';
        }
    });

    // Load all users for the sidebar
    db.ref('users').on('value', (snapshot) => {
        allUsers = snapshot.val() || {};
        renderUserList();
        renderActiveUsers();
    });

    // Initial load for selected user (first user by default)
    if (selectedUserId) {
        loadDataForUser(selectedUserId);
    }
}

whmcsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('whmcs-identifier').value;
    const secret = document.getElementById('whmcs-secret').value;
    const url = document.getElementById('whmcs-url').value;
    const apiUrl = document.getElementById('whmcs-api-url').value;
    
    const config = { identifier, secret, url, apiUrl };

    if(selectedUserId) {
         db.ref('users/' + selectedUserId + '/whmcs').set(config)
        .then(() => alert('WHMCS Config saved for selected user!'))
        .catch(error => alert(error.message));
    } else {
        alert("Please select a user first.");
    }
});


function loadDataForUser(uid) {
    selectedUserId = uid;
    renderUserList(); // To highlight the selected user
    
    // Load WHMCS config for the selected user
    const userWhmcsRef = db.ref('users/' + uid + '/whmcs');
    userWhmcsRef.once('value', (snapshot) => {
        const config = snapshot.val();
        document.getElementById('whmcs-identifier').value = config?.identifier || '';
        document.getElementById('whmcs-secret').value = config?.secret || '';
        document.getElementById('whmcs-url').value = config?.url || '';
        document.getElementById('whmcs-api-url').value = config?.apiUrl || '';
    });

    // Load table data for the user
    const userTableDataRef = db.ref('tableData/' + uid);
    userTableDataRef.on('value', (snapshot) => {
        allTableData = snapshot.val() ? Object.values(snapshot.val()) : [];
        renderTable(allTableData);
    });
}

function deleteUser(uid) {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        // This is complex. Deleting from Firebase Auth requires admin privileges,
        // which you can't do securely from the client-side.
        // For now, we'll just delete their data from the Realtime Database.
        db.ref('users/' + uid).remove();
        db.ref('tableData/' + uid).remove();
        alert('User data deleted from database.');
        // If the deleted user was the selected one, clear selection
        if (selectedUserId === uid) {
            selectedUserId = null;
            renderTable([]);
        }
    }
}


// --- UI RENDERING ---

function renderUserList() {
    userList.innerHTML = '<h2>Users</h2>';
    for (const uid in allUsers) {
        const user = allUsers[uid];
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        if(uid === selectedUserId) {
            userDiv.classList.add('selected');
        }
        userDiv.innerHTML = `
            <span>${user.email}</span>
            <button class="delete-user-btn" data-uid="${uid}">X</button>
        `;
        
        userDiv.addEventListener('click', (e) => {
             if (e.target.classList.contains('delete-user-btn')) {
                deleteUser(uid);
            } else {
                loadDataForUser(uid);
            }
        });
        userList.appendChild(userDiv);
    }
}

function renderTable(data) {
    const tableHead = dataTable.querySelector('thead');
    const tableBody = dataTable.querySelector('tbody');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100%">No data available.</td></tr>';
        return;
    }

    // Create headers from the keys of the first object
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Create rows
    data.forEach(item => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = item[header] || '';
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    });
}

function renderActiveUsers() {
    activeUsersList.innerHTML = '';
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const uid in allUsers) {
        const user = allUsers[uid];
        if (user.last_login > oneHourAgo) {
            const avatar = document.createElement('div');
            avatar.className = 'user-avatar';
            avatar.textContent = user.email.substring(0, 1).toUpperCase();
            avatar.innerHTML += `<span class="tooltip">${user.email}</span>`;
            activeUsersList.appendChild(avatar);
        }
    }
}

// --- SEARCH / FILTER ---
searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if(!searchTerm) {
        renderTable(allTableData);
        return;
    }

    const filteredData = allTableData.filter(item => {
        return Object.values(item).some(val => 
            String(val).toLowerCase().includes(searchTerm)
        );
    });
    renderTable(filteredData);
});
