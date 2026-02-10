document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate').forEach(el => {
        observer.observe(el);
    });

    // Header Blur Effect on Scroll
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

    // Modal Logic
    const modal = document.getElementById('role-modal');
    const authButtons = document.querySelectorAll('.auth-trigger'); // Add this class to Login/Signup links
    let targetPage = '';

    authButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            targetPage = btn.dataset.target; // 'login' or 'signup'
            modal.classList.add('active');
        });
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Role Selection
    document.querySelectorAll('.btn-role').forEach(btn => {
        btn.addEventListener('click', () => {
            const role = btn.dataset.role;
            const page = targetPage === 'signup' ? 'pages/signup.html' : 'pages/login.html';
            window.location.href = `${page}?role=${role}`;
        });
    });
});

// Pattern Analysis Logic
function showAnalysis(type, cardElement) {
    // 1. Update Active State
    document.querySelectorAll('.pattern-grid .card').forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');

    // 2. Get Display Container
    const display = document.getElementById('analysis-display');

    // 3. Define Content based on type
    let content = '';

    if (type === 'linear') {
        content = `
            <div class="analysis-header">
                <h3>Linear Progression Analysis</h3>
                <span class="risk-badge bg-high" style="background: rgba(0, 242, 255, 0.1); color: var(--primary);">Steady Growth</span>
            </div>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">
                Data indicates a consistent R0 of 1.1 in suburban zones. Projected saturation in 14 days without intervention.
            </p>
            <div class="visual-container vis-linear">
                <div class="bar" style="height: 10%"></div>
                <div class="bar" style="height: 15%"></div>
                <div class="bar" style="height: 20%"></div>
                <div class="bar" style="height: 25%"></div>
                <div class="bar" style="height: 30%"></div>
                <div class="bar" style="height: 35%"></div>
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 45%"></div>
                <div class="bar" style="height: 50%"></div>
                <div class="bar" style="height: 55%"></div>
            </div>
        `;
    } else if (type === 'exponential') {
        content = `
            <div class="analysis-header">
                <h3>Exponential Spike Detection</h3>
                <span class="risk-badge bg-high">CRITICAL ALERT</span>
            </div>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">
                Anomaly detected in Sector 4. Viral vector load has tripled in 24 hours. Immediate containment recommended.
            </p>
            <div class="visual-container vis-exponential">
                <div class="bar" style="height: 5%"></div>
                <div class="bar" style="height: 7%"></div>
                <div class="bar" style="height: 6%"></div>
                <div class="bar" style="height: 8%"></div>
                <div class="bar" style="height: 12%"></div>
                <div class="bar" style="height: 15%"></div>
                <div class="bar" style="height: 35%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 85%"></div>
                <div class="bar" style="height: 98%"></div>
            </div>
        `;
    } else if (type === 'seasonal') {
        content = `
            <div class="analysis-header">
                <h3>Seasonal Cyclicity Model</h3>
                <span class="risk-badge bg-high" style="background: rgba(112, 0, 255, 0.1); color: var(--secondary);">Recurring Pattern</span>
            </div>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">
                Matching historical flu season patterns from 2023. Expecting peak transmission window in late November.
            </p>
            <div class="visual-container vis-seasonal">
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 30%"></div>
                <div class="bar" style="height: 20%"></div>
                <div class="bar" style="height: 50%"></div>
                <div class="bar" style="height: 75%"></div>
                <div class="bar" style="height: 90%"></div>
                <div class="bar" style="height: 65%"></div>
            </div>
        `;
    }

    // 4. Update DOM
    display.innerHTML = content;
    display.classList.add('active');
}
