// --- GLOBAL STATE ---
// This variable captures the role from the button click and shares it with the login function
let currentSelectedRole = ''; 

document.addEventListener('DOMContentLoaded', () => {
    console.log("Vitalora Scripts Initialized");

    // --- 1. MODAL & ROLE SELECTION LOGIC ---
    const roleModal = document.getElementById('role-modal');
    const authTriggers = document.querySelectorAll('.auth-trigger');

    // Trigger Modal when "Login" is clicked in the navbar
    authTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Login clicked - Opening Role Modal");
            if (roleModal) {
                roleModal.classList.add('active');
            } else {
                console.error("Critical: #role-modal not found in HTML!");
            }
        });
    });

    // Handle Role Button clicks inside the modal
    document.querySelectorAll('.btn-role').forEach(btn => {
        btn.addEventListener('click', () => {
            currentSelectedRole = btn.dataset.role; 
            console.log("Role Selected:", currentSelectedRole);
            
            // Redirect to the login page and pass the role in the URL
            window.location.href = `pages/login.html?role=${currentSelectedRole}`;
        });
    });

    // Close modal when clicking outside of the content box
    if (roleModal) {
        roleModal.addEventListener('click', (e) => {
            if (e.target === roleModal) {
                roleModal.classList.remove('active');
            }
        });
    }

    // --- 2. LOGIN PAGE INITIALIZATION ---
    // If the user is already on the login page, we grab the role from the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('role')) {
        currentSelectedRole = urlParams.get('role');
        console.log("Login Page Active for Role:", currentSelectedRole);
    }

    // Attach handleLogin to the login button if it exists on this page
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // --- 3. SCROLL & UI ANIMATIONS ---
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate').forEach(el => observer.observe(el));

    const header = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(10, 10, 15, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        } else {
            header.style.background = 'rgba(10, 10, 15, 0.8)';
            header.style.boxShadow = 'none';
        }
    });
});

// --- 4. BACKEND INTEGRATION (AXIOS) ---
async function handleLogin() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');

    const email = emailField ? emailField.value : '';
    const password = passwordField ? passwordField.value : '';

    // Validation
    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    if (!currentSelectedRole) {
        alert("Session error: Please go back and select a role (Doctor/Admin).");
        return;
    }

    // UI Feedback
    loginBtn.innerText = "Authenticating...";
    loginBtn.disabled = true;

    try {
        console.log("Attempting login for:", email, "with role:", currentSelectedRole);

        // API Call to FastAPI
        const response = await axios.post('http://127.0.0.1:8000/auth/login', {
            email: email,
            password: password,
            role: currentSelectedRole 
        });

        // 1. Save token for authenticated requests
        localStorage.setItem('token', response.data.access_token);
        
        // 2. Save user profile for UI display
        localStorage.setItem('vitalora_user', JSON.stringify({
            email: email,
            role: response.data.role
        }));

        // 3. Redirect based on response from backend
        if (response.data.role.toLowerCase() === 'admin') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }

    } catch (error) {
        console.error("Login failed:", error);
        const message = error.response?.data?.detail || "Could not connect to the authentication server.";
        alert("Login Error: " + message);
    } finally {
        loginBtn.innerText = "Login";
        loginBtn.disabled = false;
    }
}

// --- 5. PATTERN ANALYSIS UI ---
function showAnalysis(type, cardElement) {
    document.querySelectorAll('.pattern-grid .card').forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');
    
    const display = document.getElementById('analysis-display');
    if (!display) return;

    let content = '';
    if (type === 'linear') {
        content = `<h3>Linear Analysis</h3><p>Steady growth pattern detected in population clusters.</p>`;
    } else if (type === 'exponential') {
        content = `<h3>Critical Alert</h3><p>Exponential growth detected. Immediate intervention suggested.</p>`;
    } else if (type === 'seasonal') {
        content = `<h3>Seasonal Model</h3><p>Historical pattern match: Expected peak in 12 days.</p>`;
    }

    display.innerHTML = content;
    display.classList.add('active');
}