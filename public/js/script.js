// Your Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const mainContent = document.getElementById('main-content');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const welcomeMessage = document.getElementById('welcome-message');
const contentDiv = document.getElementById('content');
const addNewBtn = document.getElementById('add-new-btn');
const formContainer = document.getElementById('form-container');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Form Inputs
const titleInput = document.getElementById('title');
const dataInput = document.getElementById('data');
const editIdInput = document.getElementById('edit-id');

// --- Authentication ---

// Check user state
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        mainContent.style.display = 'block';
        welcomeMessage.textContent = `Welcome, ${user.email}`;
        loadContent();
    } else {
        // User is signed out
        loginSection.style.display = 'block';
        registerSection.style.display = 'none'; // Default to login view
        mainContent.style.display = 'none';
        contentDiv.innerHTML = ''; // Clear content on logout
    }
});

// Login
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
});

// Register
registerBtn.addEventListener('click', () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Switch between login and register forms
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});


// --- Database (Realtime Database) ---

function loadContent() {
    const contentRef = database.ref('content');
    contentRef.on('value', (snapshot) => {
        contentDiv.innerHTML = '';
        const data = snapshot.val();
        if (data) {
            for (let id in data) {
                const item = data[id];
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.innerHTML = `
                    <h3>${item.title}</h3>
                    <pre>${escapeHtml(item.data)}</pre>
                    <div class="actions">
                        <button onclick="editContent('${id}', '${item.title}', \`${escapeForJS(item.data)}\`)">Edit</button>
                        <button onclick="deleteContent('${id}')">Delete</button>
                    </div>
                `;
                contentDiv.appendChild(itemDiv);
            }
        }
    });
}

function showForm(isEditing = false) {
    formContainer.style.display = 'block';
    addNewBtn.style.display = 'none';
    if (!isEditing) {
        titleInput.value = '';
        dataInput.value = '';
        editIdInput.value = '';
    }
}

function hideForm() {
    formContainer.style.display = 'none';
    addNewBtn.style.display = 'block';
}

// Add New button
addNewBtn.addEventListener('click', () => {
    showForm();
});

// Cancel button
cancelBtn.addEventListener('click', () => {
    hideForm();
});

// Save (Add/Update)
saveBtn.addEventListener('click', () => {
    const title = titleInput.value;
    const data = dataInput.value;
    const id = editIdInput.value;

    if (!title || !data) {
        alert('Title and data cannot be empty.');
        return;
    }

    if (id) {
        // Update existing
        database.ref('content/' + id).update({ title, data })
            .then(() => hideForm())
            .catch(error => alert(error.message));
    } else {
        // Add new
        database.ref('content').push({ title, data })
            .then(() => hideForm())
            .catch(error => alert(error.message));
    }
});

// Edit
window.editContent = function(id, title, data) {
    titleInput.value = title;
    dataInput.value = data;
    editIdInput.value = id;
    showForm(true);
}

// Delete
window.deleteContent = function(id) {
    if (confirm('Are you sure you want to delete this?')) {
        database.ref('content/' + id).remove()
            .catch(error => alert(error.message));
    }
}


// --- Utility Functions ---
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function escapeForJS(str) {
    return str.replace(/`/g, '\\`').replace(/\${/g, '\\${');
}
