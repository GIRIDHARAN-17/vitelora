document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Authentication
    const user = JSON.parse(localStorage.getItem('vitalora_user'));

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Setup UI based on Role
    const userGreeting = document.getElementById('user-greeting');
    const userRoleDisplay = document.getElementById('user-role');
    const logoutBtn = document.getElementById('logout-btn');

    userGreeting.textContent = `Welcome, ${user.name}`;
    userRoleDisplay.textContent = `${user.role} Dashboard`;

    // Logout Logic
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('vitalora_user');
        window.location.href = '../index.html';
    });

    // 3. Render Views
    if (user.role.toLowerCase() === 'doctor') {
        renderDoctorView();
    } else if (user.role.toLowerCase() === 'admin') {
        renderAdminView();
    }
});

// Mock Data
const patients = [
    { id: 'P-1001', name: 'Sarah Connor', room: 'ICU-03', doctor: 'Dr. Silberman', condition: 'Critical - Viral Load High', date: '2026-02-09' },
    { id: 'P-1024', name: 'John Rambo', room: 'Ward-B2', doctor: 'Dr. Trautman', condition: 'Stable - Recovering', date: '2026-02-08' },
    { id: 'P-2049', name: 'Rick Deckard', room: 'Iso-01', doctor: 'Dr. Wallace', condition: 'Observation - Unknown Pathogen', date: '2026-02-10' },
    { id: 'P-3000', name: 'Ellen Ripley', room: 'Hypersleep-A', doctor: 'Dr. Ash', condition: 'Stable - Quarantine', date: '2026-02-01' },
];

const doctors = [
    { id: 'D-101', name: 'Dr. Silberman', spec: 'General Analysis', email: 'silberman@vitalora.com' },
    { id: 'D-102', name: 'Dr. Trautman', spec: 'Trauma Specialist', email: 'trautman@vitalora.com' },
    { id: 'D-103', name: 'Dr. Wallace', spec: 'Virology', email: 'wallace@vitalora.com' },
];

function renderDoctorView() {
    const container = document.getElementById('doctor-view');
    container.classList.add('active');

    patients.forEach(p => {
        const card = document.createElement('div');
        card.className = 'patient-card';

        // Apply status class
        const conditionLower = p.condition.toLowerCase();
        if (conditionLower.includes('critical')) {
            card.classList.add('status-critical');
        } else if (conditionLower.includes('observation') || conditionLower.includes('unknown')) {
            card.classList.add('status-observation');
        } else if (conditionLower.includes('stable')) {
            card.classList.add('status-stable');
        }

        card.innerHTML = `
            <div class="patient-id">ID: ${p.id}</div>
            <div class="patient-name">${p.name}</div>
            <div class="patient-meta">
                <span>Room: ${p.room}</span>
                <span>${p.condition.split(' - ')[0]}</span>
            </div>
        `;

        card.addEventListener('click', () => openPatientModal(p));
        container.appendChild(card);
    });
}

function renderAdminView() {
    const container = document.getElementById('admin-view');
    container.classList.add('active');

    renderDoctorList();

    // Form Submissions
    document.getElementById('add-doctor-form').addEventListener('submit', async (e) => {

    e.preventDefault();

    const full_name = document.getElementById('doc-name').value;
    const email = document.getElementById('doc-email').value;
    const password = document.getElementById('doc-password').value;
    const role = document.getElementById('doc-role').value;
    const specialization = role === 'doctor'
        ? document.getElementById('doc-spec').value
        : null;

    try {

        const res = await axios.post(
            "http://127.0.0.1:8000/admin_add_user",
            {
                full_name,
                email,
                password,
                role,
                specialization
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        alert(res.data.message);
        e.target.reset();

    } catch (err) {
        alert(err.response?.data?.detail || "Doctor creation failed");
    }
});


   document.getElementById('add-patient-form').addEventListener('submit', async (e) => {

    e.preventDefault();

    const full_name = e.target[0].value;
    const patient_id = e.target[1].value || 'P-' + Math.floor(Math.random()*10000);
    const room_no = e.target[2].value;
    const condition = e.target[3].value;
    const doctor_name = document.getElementById('patient-doc-name').value;
    const doctor_email = document.getElementById('patient-doc-email').value;

    try {

        const res = await axios.post(
            "http://127.0.0.1:8000/create_patient",
            {
                full_name,
                patient_id,
                room_no,
                condition,
                doctor_name,
                doctor_email
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        alert(res.data.message);
        e.target.reset();

    } catch (err) {
        alert(err.response?.data?.detail || "Patient creation failed");
    }
});


function renderDoctorList() {
    const list = document.getElementById('doctor-list');
    list.innerHTML = '';
    doctors.forEach(d => {
        const item = document.createElement('div');
        item.className = 'doctor-item';
        item.innerHTML = `
            <div style="width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                    <div style="font-weight: 600; font-size: 1.1rem;">${d.name}</div>
                    <div style="font-family: monospace; color: var(--accent); opacity: 0.8;">${d.id}</div>
                </div>
                <div style="font-size: 0.9rem; color: var(--primary); margin-bottom: 0.2rem;">${d.spec}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">${d.email}</div>
            </div>
        `;
        list.appendChild(item);
    });
}

window.showAdminSection = function(sectionId) {

    document.getElementById('admin-view').classList.remove('active');

    if (sectionId === 'add-user') {
        document.getElementById('admin-add-user').classList.add('active');
    } else if (sectionId === 'add-patient') {
        document.getElementById('admin-add-patient').classList.add('active');
    }
}

window.showAdminMenu = function() {
    document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
    document.getElementById('admin-view').classList.add('active');
}

// Modal Logic
function openPatientModal(patient) {
    document.getElementById('modal-p-name').textContent = patient.name;
    document.getElementById('modal-p-id').textContent = `ID: #${patient.id}`;
    document.getElementById('modal-p-room').textContent = patient.room;
    document.getElementById('modal-p-condition').textContent = patient.condition;
    document.getElementById('modal-p-doc').textContent = patient.doctor;
    document.getElementById('modal-p-date').textContent = patient.date;

    const modal = document.getElementById('patient-modal');
    modal.classList.add('active');
    modal.style.display = 'flex'; // Ensure flex for centering
}

window.closeModal = function() {
    const modal = document.getElementById('patient-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        if (!modal.classList.contains('active')) modal.style.display = '';
    }, 300); // Wait for transition
}

// Close modal on outside click
document.getElementById('patient-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('patient-modal')) {
        closeModal();
    }
});
}
