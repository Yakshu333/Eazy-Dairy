const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const message = document.getElementById('message');

const API_URL = 'http://localhost:3000/api';

function togglePassword(fieldId, iconId) {
    const input = document.getElementById(fieldId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } else {
                message.textContent = data.message;
            }
        } catch (error) {
            message.textContent = 'An error occurred';
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const mobileNumber = document.getElementById('mobileNumber').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            message.textContent = 'Passwords do not match';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, mobileNumber, email })
            });
            const data = await res.json();

            if (res.ok) {
                message.style.color = 'green';
                message.textContent = 'Registration successful! Redirecting to login...';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                message.textContent = data.message;
            }
        } catch (error) {
            message.textContent = 'An error occurred';
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Check auth
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    } else {
        fetch(`${API_URL}/dashboard`, {
            headers: { 'Authorization': token }
        })
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    // User is authenticated
                } else {
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            });
    }

    // Goals Sub-menu Logic
    const goalsBtn = document.getElementById('goalsBtn');
    const backToGoalsBtn = document.getElementById('backToGoalsBtn');
    const mainDashboard = document.getElementById('mainDashboard');
    const goalsView = document.getElementById('goalsView');

    // Goal Actions Logic
    const goalActionsView = document.getElementById('goalActionsView');
    const goalActionTitle = document.getElementById('goalActionTitle');
    const backToGoalTypesBtn = document.getElementById('backToGoalTypesBtn');
    const dailyGoalBtn = document.getElementById('dailyGoalBtn');
    const weeklyGoalBtn = document.getElementById('weeklyGoalBtn');
    const monthlyGoalBtn = document.getElementById('monthlyGoalBtn');
    const yearlyGoalBtn = document.getElementById('yearlyGoalBtn');


    if (goalsBtn && backToGoalsBtn && mainDashboard && goalsView) {
        goalsBtn.addEventListener('click', () => {
            mainDashboard.classList.add('hidden');
            goalsView.classList.remove('hidden');
        });

        backToGoalsBtn.addEventListener('click', () => {
            goalsView.classList.add('hidden');
            mainDashboard.classList.remove('hidden');
        });
    }

    // Notification Logic
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationList = document.getElementById('notificationList');

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            notificationDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                notificationDropdown.classList.add('hidden');
            }
        });
    }

    if (goalActionsView && backToGoalTypesBtn) {
        let currentGoalType = '';
        const addGoalBtn = document.getElementById('addGoalBtn');
        const goalDateDisplay = document.getElementById('goalDateDisplay');
        const goalInput = document.getElementById('goalInput');
        const goalsList = document.getElementById('goalsList');

        // Date Calculation Logic
        const getGoalDateString = (type) => {
            const now = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };

            if (type === 'daily') {
                return now.toLocaleDateString('en-US', options);
            } else if (type === 'weekly') {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const monday = new Date(now.setDate(diff));
                const sunday = new Date(now.setDate(monday.getDate() + 6));
                return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            } else if (type === 'monthly') {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                return `${firstDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
            } else if (type === 'yearly') {
                const firstDay = new Date(now.getFullYear(), 0, 1);
                const lastDay = new Date(now.getFullYear(), 11, 31);
                return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }
            return '';
        };

        const renderGoal = (goal) => {
            const createdDate = new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const goalItem = document.createElement('div');
            goalItem.className = 'goal-item';
            goalItem.dataset.id = goal._id;

            goalItem.innerHTML = `
                <div class="goal-date">${createdDate}</div>
                <div class="goal-content" style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" class="goal-checkbox" ${goal.isCompleted ? 'checked' : ''}>
                    <div class="goal-text"></div>
                    <div class="goal-actions" style="display: flex; gap: 5px;">
                        <button class="edit-goal-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-goal-btn"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
            goalsList.appendChild(goalItem);

            const checkbox = goalItem.querySelector('.goal-checkbox');
            const goalTextDiv = goalItem.querySelector('.goal-text');
            const editBtn = goalItem.querySelector('.edit-goal-btn');
            const deleteBtn = goalItem.querySelector('.delete-goal-btn');
            let originalText = goal.text;

            const updateGoalUI = (text, isCompleted, completedAt) => {
                if (isCompleted) {
                    const date = new Date(completedAt || Date.now());
                    const timeString = date.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    goalTextDiv.innerHTML = `${text} <span style="font-size: 0.8em; color: gray;">(Completed at ${timeString})</span>`;
                    goalTextDiv.style.color = '#2ecc71';
                    editBtn.style.display = 'none';
                } else {
                    goalTextDiv.textContent = text;
                    goalTextDiv.style.color = '#333';
                    editBtn.style.display = 'inline-block';
                }
            };

            updateGoalUI(originalText, goal.isCompleted, goal.completedAt);

            checkbox.addEventListener('change', async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/goals/${goal._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify({ isCompleted: checkbox.checked })
                    });
                    if (res.ok) {
                        const updated = await res.json();
                        updateGoalUI(updated.text, updated.isCompleted, updated.completedAt);
                    } else {
                        checkbox.checked = !checkbox.checked;
                    }
                } catch (e) { console.error(e); checkbox.checked = !checkbox.checked; }
            });

            editBtn.addEventListener('click', async () => {
                if (editBtn.innerHTML.includes('fa-edit')) {
                    // Edit Mode
                    const currentText = originalText;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentText;
                    input.className = 'edit-goal-input';
                    input.style.width = '100%';
                    input.style.padding = '5px';
                    input.style.borderRadius = '4px';
                    input.style.border = '1px solid #ccc';

                    goalTextDiv.textContent = '';
                    goalTextDiv.appendChild(input);
                    input.focus();

                    editBtn.innerHTML = '<i class="fas fa-save"></i>';
                    editBtn.style.color = '#2ecc71';

                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') editBtn.click();
                    });
                } else {
                    // Save Changes
                    const input = goalTextDiv.querySelector('input');
                    if (input && input.value.trim() !== '') {
                        const newText = input.value.trim();
                        try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_URL}/goals/${goal._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                                body: JSON.stringify({ text: newText })
                            });

                            if (res.ok) {
                                const updated = await res.json();
                                originalText = updated.text;
                                updateGoalUI(originalText, updated.isCompleted, updated.completedAt);
                                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                                editBtn.style.removeProperty('color');
                            }
                        } catch (e) { console.error(e); }
                    }
                }
            });

            deleteBtn.addEventListener('click', async () => {
                if (confirm('Delete this goal?')) {
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API_URL}/goals/${goal._id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': token }
                        });
                        if (res.ok) {
                            goalItem.remove();
                        }
                    } catch (e) { console.error(e); }
                }
            });
        };

        const fetchGoals = async (type) => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await fetch(`${API_URL}/goals`, {
                    headers: { 'Authorization': token }
                });
                if (res.ok) {
                    const allGoals = await res.json();
                    const filteredGoals = allGoals.filter(g => g.type === type);
                    goalsList.innerHTML = '';
                    filteredGoals.forEach(renderGoal);
                }
            } catch (err) { console.error(err); }
        };

        const showGoalActions = (title, type) => {
            goalActionTitle.textContent = title;
            currentGoalType = type;
            goalsView.classList.add('hidden');
            goalActionsView.classList.remove('hidden');

            const dateString = getGoalDateString(currentGoalType);
            goalDateDisplay.textContent = dateString;

            goalInput.value = '';
            fetchGoals(type);
        };

        if (dailyGoalBtn) dailyGoalBtn.addEventListener('click', () => showGoalActions('Daily Goals', 'daily'));
        if (weeklyGoalBtn) weeklyGoalBtn.addEventListener('click', () => showGoalActions('Weekly Goals', 'weekly'));
        if (monthlyGoalBtn) monthlyGoalBtn.addEventListener('click', () => showGoalActions('Monthly Goals', 'monthly'));
        if (yearlyGoalBtn) yearlyGoalBtn.addEventListener('click', () => showGoalActions('Yearly Goals', 'yearly'));

        backToGoalTypesBtn.addEventListener('click', () => {
            goalActionsView.classList.add('hidden');
            goalsView.classList.remove('hidden');
        });

        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', async () => {
                const text = goalInput.value.trim();
                if (text) {
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API_URL}/goals`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': token },
                            body: JSON.stringify({ text, type: currentGoalType })
                        });

                        if (res.ok) {
                            const newGoal = await res.json();
                            renderGoal(newGoal);
                            goalInput.value = '';
                        }
                    } catch (e) { console.error(e); }
                }
            });
        }
    }

    // Calendar Logic
    const calendarBtn = document.getElementById('calendarBtn');
    const calendarView = document.getElementById('calendarView');
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const backToDashboardFromCalendar = document.getElementById('backToDashboardFromCalendar');

    let currentDate = new Date();
    let birthdays = [];
    let holidays = [];

    if (calendarBtn && calendarView) {
        calendarBtn.addEventListener('click', () => {
            mainDashboard.classList.add('hidden');
            calendarView.classList.remove('hidden');
            loadCalendarData();
        });

        backToDashboardFromCalendar.addEventListener('click', () => {
            calendarView.classList.add('hidden');
            mainDashboard.classList.remove('hidden');
        });

        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    const loadCalendarData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [holidaysRes, birthdaysRes] = await Promise.all([
                fetch(`${API_URL}/holidays`),
                fetch(`${API_URL}/birthdays`, { headers: { 'Authorization': token } })
            ]);

            if (holidaysRes.ok) holidays = await holidaysRes.json();
            if (birthdaysRes.ok) birthdays = await birthdaysRes.json();

            renderCalendar();
        } catch (error) {
            console.error('Error loading calendar data:', error);
        }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        currentMonthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Clear existing days (keep headers)
        const headers = calendarGrid.querySelectorAll('.weekday');
        calendarGrid.innerHTML = '';
        headers.forEach(header => calendarGrid.appendChild(header));

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const prevMonthLastDay = new Date(year, month, 0).getDate();

        // Previous month filler days
        for (let i = 0; i < startingDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day', 'other-month');
            dayDiv.innerHTML = `<span class="day-number">${prevMonthLastDay - startingDay + 1 + i}</span>`;
            calendarGrid.appendChild(dayDiv);
        }

        // Current month days
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dayDiv.classList.add('today');
            }

            // Check for events
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            // Check Holidays (ignoring year for recurring if functionality added, currently fixed year in server)
            const dayHolidays = holidays.filter(h => h.date === dateStr);

            // Check Birthdays (match month and day)
            const dayBirthdays = birthdays.filter(b => {
                const bDate = new Date(b.date);
                return bDate.getDate() === i && bDate.getMonth() === month;
            });

            let eventsHtml = '';
            dayHolidays.forEach(h => {
                dayDiv.title = h.name; // Tooltip
                eventsHtml += `<div class="event-marker holiday-marker"><i class="fas fa-flag"></i></div>`;
            });
            dayBirthdays.forEach(b => {
                dayDiv.title = dayDiv.title ? `${dayDiv.title}, ${b.name}'s B-day` : `${b.name}'s B-day`;
                eventsHtml += `<div class="event-marker birthday-marker" data-id="${b._id}" data-name="${b.name}"><i class="fas fa-birthday-cake"></i></div>`;
            });

            dayDiv.innerHTML = `<span class="day-number">${i}</span>${eventsHtml}`;

            // Open Day Details on Click
            dayDiv.addEventListener('click', () => {
                openDayDetails(dateStr, dayHolidays, dayBirthdays);
            });

            calendarGrid.appendChild(dayDiv);
        }
    };

    // Modal Logic
    const dayDetailsModal = document.getElementById('dayDetailsModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalDateTitle = document.getElementById('modalDateTitle');
    const modalContent = document.getElementById('modalContent');
    const modalInputContainer = document.getElementById('modalInputContainer');
    const modalInput = document.getElementById('modalInput');
    const modalAddBtn = document.getElementById('modalAddBtn');
    // const modalEditBtn = document.getElementById('modalEditBtn'); // Legacy
    // const modalDeleteBtn = document.getElementById('modalDeleteBtn'); // Legacy
    const modalBackBtn = document.getElementById('modalBackBtn');
    const modalSaveBtn = document.getElementById('modalSaveBtn');

    let selectedDateForModal = null;
    let isDeleteMode = false;
    let isEditMode = false;

    const openDayDetails = (dateStr, hList, bList) => {
        selectedDateForModal = dateStr;
        modalDateTitle.textContent = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        renderModalContent(hList, bList);
        dayDetailsModal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
        resetModalState();
    };

    const renderModalContent = (hList, bList) => {
        modalContent.innerHTML = '';
        if (hList.length === 0 && bList.length === 0) {
            modalContent.innerHTML = '<p style="text-align:center; color:#999; padding: 10px;">No events for this day.</p>';
        } else {
            hList.forEach(h => {
                const div = document.createElement('div');
                div.className = 'modal-item holiday';
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #eee';
                div.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><i class="fas fa-flag" style="color:#e74c3c;"></i> <span style="font-weight:500;">${h.name}</span></div>`;
                modalContent.appendChild(div);
            });
            bList.forEach(b => {
                const div = document.createElement('div');
                div.className = 'modal-item birthday';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #eee';

                div.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-birthday-cake" style="color:#f1c40f;"></i> 
                        <span style="font-weight:500; color:#333;">${b.name}</span>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button class="edit-birthday-btn" data-id="${b._id}" data-name="${b.name}" style="background:#f1c40f; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-birthday-btn" data-id="${b._id}" data-name="${b.name}" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                `;
                modalContent.appendChild(div);
            });

            // Attach listeners
            document.querySelectorAll('.edit-birthday-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    const name = btn.getAttribute('data-name');
                    editBirthday(id, name);
                });
            });

            document.querySelectorAll('.delete-birthday-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    deleteBirthday(id);
                });
            });
        }
    };

    // Edit Event Modal Logic
    const editEventModal = document.getElementById('editEventModal');
    const editEventName = document.getElementById('editEventName');
    const saveEditEventBtn = document.getElementById('saveEditEventBtn');
    const cancelEditEventBtn = document.getElementById('cancelEditEventBtn');

    let editingEventId = null;
    let editingEventDate = null;

    if (saveEditEventBtn) {
        saveEditEventBtn.replaceWith(saveEditEventBtn.cloneNode(true)); // remove old listeners if any by cloning
        const newSaveBtn = document.getElementById('saveEditEventBtn');

        newSaveBtn.addEventListener('click', async () => {
            const newName = editEventName.value.trim();
            if (!newName) {
                alert('Name cannot be empty');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                // Workaround: Delete old and add new since no PUT endpoint
                await fetch(`${API_URL}/birthdays/${editingEventId}`, { method: 'DELETE', headers: { 'Authorization': token } });

                const res = await fetch(`${API_URL}/birthdays`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({ name: newName, date: editingEventDate }) // date needed to recreate properly
                });

                if (res.ok) {
                    const newB = await res.json();
                    birthdays = birthdays.filter(b => b._id !== editingEventId);
                    birthdays.push(newB);
                    editEventModal.classList.add('hidden');
                    refreshModal();
                    renderCalendar();
                }
            } catch (e) {
                console.error('Error editing birthday:', e);
                alert('Failed to edit birthday');
            }
        });
    }

    if (cancelEditEventBtn) {
        cancelEditEventBtn.addEventListener('click', () => {
            editEventModal.classList.add('hidden');
        });
    }

    const editBirthday = (id, currentName) => {
        editingEventId = id;
        // Find date for this event from birthdays array or assume modal context
        // We need the date to re-create it. We can get it from the item in birthdays array.
        const originalItem = birthdays.find(b => b._id === id);
        if (originalItem) {
            editingEventDate = originalItem.date;
        } else {
            // Fallback if not found (shouldn't happen in this flow)
            editingEventDate = selectedDateForModal;
        }

        editEventName.value = currentName;
        editEventModal.classList.remove('hidden');
    };

    const deleteBirthday = async (id) => {
        if (confirm('Are you sure you want to delete this birthday?')) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/birthdays/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': token }
                });

                if (res.ok) {
                    birthdays = birthdays.filter(b => b._id !== id);
                    refreshModal();
                    renderCalendar();
                }
            } catch (e) {
                console.error('Error deleting birthday:', e);
                alert('Failed to delete birthday');
            }
        }
    };

    const refreshModal = () => {
        const sDate = new Date(selectedDateForModal);
        const updatedBirthdays = birthdays.filter(b => {
            const bDate = new Date(b.date);
            return bDate.getDate() === sDate.getDate() && bDate.getMonth() === sDate.getMonth();
        });
        const updatedHolidays = holidays.filter(h => h.date === selectedDateForModal);
        renderModalContent(updatedHolidays, updatedBirthdays);
    };

    const resetModalState = () => {
        isDeleteMode = false;
        isEditMode = false;
        modalInputContainer.classList.add('hidden');
        modalSaveBtn.classList.add('hidden');
        modalContent.classList.remove('delete-mode'); // CSS class?
    };

    if (modalBackBtn) modalBackBtn.addEventListener('click', () => {
        dayDetailsModal.classList.add('hidden');
        modalOverlay.classList.add('hidden');
    });

    if (modalAddBtn) modalAddBtn.addEventListener('click', () => {
        resetModalState();
        modalInputContainer.classList.remove('hidden');
        modalInput.value = '';
        modalInput.focus();
        modalSaveBtn.classList.remove('hidden');
    });

    if (modalSaveBtn) modalSaveBtn.addEventListener('click', async () => {
        const name = modalInput.value.trim();
        if (name && selectedDateForModal) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/birthdays`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({ name, date: selectedDateForModal })
                });
                if (res.ok) {
                    const newB = await res.json();
                    birthdays.push(newB);
                    modalInput.value = '';
                    modalInputContainer.classList.add('hidden');
                    modalSaveBtn.classList.add('hidden');
                    refreshModal();
                    renderCalendar();
                }
            } catch (e) { console.error(e); }
        }
    });

    if (modalDeleteBtn) modalDeleteBtn.addEventListener('click', () => {
        resetModalState();
        isDeleteMode = true;
        alert('Click on a birthday in the list to delete it.');
    });

    if (modalEditBtn) modalEditBtn.addEventListener('click', () => {
        resetModalState();
        isEditMode = true;
        alert('Click on a birthday in the list to edit it.');
    });

    // Profile Logic
    const profileBtn = document.getElementById('calendarBtn').parentElement.querySelector('button:nth-child(6)'); // Targeting by structure since ID wasn't on button originally, but let's check if I added ID.
    // Wait, dashboard.html line 44: <button class="dashboard-btn">...<span>Profile</span></button> -> It has NO ID.
    // I need to add an ID to the profile button in dashboard.html first or select it carefully.
    // Let's select by text content or add ID. Adding ID is cleaner. 
    // Actually, I can select it by `button:last-child` in `.dashboard-grid` or by text.
    // Better: Add ID in dashboard.html. But I just edited it and didn't add ID.
    // I will select it via `selectProfileBtn` helper or just querySelector.
    // The profile button is the 6th button in #mainDashboard.

    // Correct approach: Let's assume I will select it by finding the button with "Profile" text or adding ID.
    // I'll add the ID "profileBtn" to dashboard.html first to be safe, OR just use robust selection.
    // Let's use robust selection for now to avoid another file edit if possible, or edit dashboard.html.
    // dashboard.html line 42: <button class="dashboard-btn"> ... Profile ... </button>

    // Actually, I can use: const profileBtn = Array.from(document.querySelectorAll('.dashboard-btn')).find(b => b.innerText.includes('Profile'));

    const profileView = document.getElementById('profileView');
    const backToDashboardFromProfile = document.getElementById('backToDashboardFromProfile');
    const profileUsername = document.getElementById('profileUsername');
    const profileEmail = document.getElementById('profileEmail');
    const profileMobile = document.getElementById('profileMobile');

    const profileButton = Array.from(document.querySelectorAll('.dashboard-btn')).find(b => b.textContent.trim().includes('Profile'));

    if (profileButton && profileView) {
        profileButton.addEventListener('click', async () => {
            mainDashboard.classList.add('hidden');
            profileView.classList.remove('hidden');

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/dashboard`, {
                    headers: { 'Authorization': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        profileUsername.textContent = data.user.username;
                        profileEmail.textContent = data.user.email;
                        profileMobile.textContent = data.user.mobileNumber;
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        });

        const updatePasswordBtn = document.getElementById('updatePasswordBtn');
        if (updatePasswordBtn) {
            // Toggle Logic for Change Password Fields
            const toggleOld = document.getElementById('toggleOldPassword');
            const toggleNew = document.getElementById('toggleNewPassword');

            if (toggleOld) {
                toggleOld.addEventListener('click', () => togglePassword('oldPassword', 'toggleOldPassword'));
            }
            if (toggleNew) {
                toggleNew.addEventListener('click', () => togglePassword('newPassword', 'toggleNewPassword'));
            }

            updatePasswordBtn.addEventListener('click', async () => {
                const oldPassword = document.getElementById('oldPassword').value;
                const newPassword = document.getElementById('newPassword').value;

                if (!oldPassword || !newPassword) {
                    alert('Please enter both current and new passwords.');
                    return;
                }

                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/change-password`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': token },
                        body: JSON.stringify({ oldPassword, newPassword })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        alert('Password updated successfully!');
                        document.getElementById('oldPassword').value = '';
                        document.getElementById('newPassword').value = '';
                    } else {
                        alert(data.message || 'Failed to update password');
                    }
                } catch (error) {
                    console.error('Error changing password:', error);
                    alert('An error occurred. Please try again.');
                }
            });
        }

        if (backToDashboardFromProfile) {
            backToDashboardFromProfile.addEventListener('click', () => {
                profileView.classList.add('hidden');
                mainDashboard.classList.remove('hidden');
            });
        }
    }

    // Memories Logic
    const memoriesBtn = Array.from(document.querySelectorAll('.dashboard-btn')).find(b => b.textContent.trim().includes('Memories'));
    const memoriesView = document.getElementById('memoriesView');
    const memoriesList = document.getElementById('memoriesList');
    const backToDashboardFromMemories = document.getElementById('backToDashboardFromMemories');
    const addMemoryBtn = document.getElementById('addMemoryBtn');

    // Form Modal
    const memoryFormModal = document.getElementById('memoryFormModal');
    const memoryText = document.getElementById('memoryText');
    const memoryImage = document.getElementById('memoryImage');
    const saveMemoryBtn = document.getElementById('saveMemoryBtn');
    const cancelMemoryBtn = document.getElementById('cancelMemoryBtn');
    const memoryFormTitle = document.getElementById('memoryFormTitle');

    // Detail Modal
    const memoryDetailModal = document.getElementById('memoryDetailModal');
    const detailImage = document.getElementById('detailImage');
    const detailText = document.getElementById('detailText');
    const editMemoryDetailBtn = document.getElementById('editMemoryDetailBtn');
    const deleteMemoryBtn = document.getElementById('deleteMemoryBtn');
    const closeDetailBtn = document.getElementById('closeDetailBtn');

    let currentMemories = [];
    let selectedMemory = null;
    let isEditingMemory = false;

    if (memoriesBtn && memoriesView) {
        memoriesBtn.addEventListener('click', () => {
            mainDashboard.classList.add('hidden');
            memoriesView.classList.remove('hidden');
            loadMemories();
        });

        backToDashboardFromMemories.addEventListener('click', () => {
            memoriesView.classList.add('hidden');
            mainDashboard.classList.remove('hidden');
        });

        addMemoryBtn.addEventListener('click', () => {
            openMemoryForm();
        });

        cancelMemoryBtn.addEventListener('click', () => {
            closeMemoryForm();
        });

        closeDetailBtn.addEventListener('click', () => {
            memoryDetailModal.classList.add('hidden');
            selectedMemory = null;
        });

        saveMemoryBtn.addEventListener('click', async () => {
            const text = memoryText.value.trim();
            const file = memoryImage.files[0];

            if (!text) {
                alert('Please write something about this memory.');
                return;
            }

            if (!isEditingMemory && memoryImage.files.length === 0) {
                alert('Please select at least one file.');
                return;
            }

            const formData = new FormData();
            formData.append('text', text);

            for (let i = 0; i < memoryImage.files.length; i++) {
                formData.append('media', memoryImage.files[i]);
            }

            try {
                const token = localStorage.getItem('token');
                let url = `${API_URL}/memories`;
                let method = 'POST';

                if (isEditingMemory && selectedMemory) {
                    url = `${API_URL}/memories/${selectedMemory._id}`;
                    method = 'PUT';
                }

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Authorization': token }, // FormData doesn't need Content-Type header manually set
                    body: formData
                });

                if (res.ok) {
                    closeMemoryForm();
                    loadMemories();
                    if (isEditingMemory) {
                        // If we were editing from detail view, close detail view or update it?
                        // Let's close detail view to be simple, or user goes back to list.
                        memoryDetailModal.classList.add('hidden');
                    }
                } else {
                    const data = await res.json();
                    alert(data.message || 'Error saving memory');
                }
            } catch (error) {
                console.error('Error saving memory:', error);
            }
        });

        deleteMemoryBtn.addEventListener('click', async () => {
            if (selectedMemory && confirm('Are you sure you want to delete this memory?')) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/memories/${selectedMemory._id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': token }
                    });

                    if (res.ok) {
                        memoryDetailModal.classList.add('hidden');
                        selectedMemory = null;
                        loadMemories();
                    }
                } catch (error) {
                    console.error('Error deleting memory:', error);
                }
            }
        });

        editMemoryDetailBtn.addEventListener('click', () => {
            if (selectedMemory) {
                memoryDetailModal.classList.add('hidden'); // Close detail
                openMemoryForm(selectedMemory); // Open form in edit mode
            }
        });
    }

    const loadMemories = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/memories`, {
                headers: { 'Authorization': token }
            });
            if (res.ok) {
                currentMemories = await res.json();
                renderMemories();
            }
        } catch (error) {
            console.error('Error loading memories:', error);
        }
    };

    const renderMemories = () => {
        memoriesList.innerHTML = '';
        if (currentMemories.length === 0) {
            memoriesList.innerHTML = '<p style="grid-column: span 2; text-align: center; color: #999;">No memories yet. Add one!</p>';
            return;
        }

        currentMemories.forEach(mem => {
            const memDiv = document.createElement('div');
            memDiv.style.background = 'white';
            memDiv.style.borderRadius = '8px';
            memDiv.style.overflow = 'hidden';
            memDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            memDiv.style.cursor = 'pointer';

            // Image/Video Thumbnail
            // Use first media item or legacy image
            const mediaSource = (mem.media && mem.media.length > 0) ? mem.media[0] : mem.image;
            if (!mediaSource) return; // Should not happen with validation

            const fileExt = mediaSource.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(fileExt);

            let mediaElement;
            if (isVideo) {
                mediaElement = document.createElement('video');
                mediaElement.src = mediaSource;
                mediaElement.style.width = '100%';
                mediaElement.style.height = '120px';
                mediaElement.style.objectFit = 'cover';
                mediaElement.muted = true;
            } else {
                mediaElement = document.createElement('img');
                mediaElement.src = mediaSource;
                mediaElement.style.width = '100%';
                mediaElement.style.height = '120px';
                mediaElement.style.objectFit = 'cover';
            }

            // Indicator for multiple items
            if (mem.media && mem.media.length > 1) {
                const badge = document.createElement('div');
                badge.textContent = `+${mem.media.length - 1}`;
                badge.style.position = 'absolute';
                badge.style.top = '5px';
                badge.style.right = '5px';
                badge.style.background = 'rgba(0,0,0,0.6)';
                badge.style.color = 'white';
                badge.style.borderRadius = '50%';
                badge.style.width = '24px';
                badge.style.height = '24px';
                badge.style.display = 'flex';
                badge.style.alignItems = 'center';
                badge.style.justifyContent = 'center';
                badge.style.fontSize = '0.8rem';
                memDiv.style.position = 'relative'; // Ensure relative positioning for badge
                memDiv.appendChild(badge);
            }

            // Text Snippet

            // Text Snippet
            const p = document.createElement('div');
            p.textContent = mem.text;
            p.style.padding = '10px';
            p.style.fontSize = '0.9rem';
            p.style.color = '#333';
            p.style.whiteSpace = 'nowrap';
            p.style.overflow = 'hidden';
            p.style.textOverflow = 'ellipsis';

            memDiv.appendChild(mediaElement);
            memDiv.appendChild(p);

            memDiv.onclick = () => openMemoryDetail(mem);
            memoriesList.appendChild(memDiv);
        });
    };

    const openMemoryForm = (memory = null) => {
        memoryFormModal.classList.remove('hidden');
        memoryImage.value = ''; // Clear file input
        if (memory) {
            isEditingMemory = true;
            selectedMemory = memory;
            memoryFormTitle.textContent = 'Edit Memory';
            memoryText.value = memory.text;
            // Can't set file input value, user must re-upload if they want to change image
        } else {
            isEditingMemory = false;
            selectedMemory = null;
            memoryFormTitle.textContent = 'Add Memory';
            memoryText.value = '';
        }
    };

    const closeMemoryForm = () => {
        memoryFormModal.classList.add('hidden');
        isEditingMemory = false;
        selectedMemory = null;
    };

    const openMemoryDetail = (memory) => {
        selectedMemory = memory;

        // Remove existing media
        const container = document.querySelector('#memoryDetailModal div[style*="position: relative"]'); // The container for media - we need to clear it or use a specific container
        // Better: Clear the container's content entirely and rebuild
        // The HTML structure in dashboard.html is:
        // <div ...> <div style="position: relative; margin-bottom: 10px;"> ...img... </div> <p id="detailText">...
        // Let's target that wrapper div.

        // Actually, let's just empty that container and append all items.
        // Wait, dashboard.html has:
        // <div style="position: relative; margin-bottom: 10px;">
        //    <img id="detailImage" ...>
        // </div>
        // I need to clear that div.

        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.maxHeight = '400px';
        container.style.overflowY = 'auto';

        const mediaList = (memory.media && memory.media.length > 0) ? memory.media : [memory.image];

        mediaList.forEach(src => {
            if (!src) return;
            const fileExt = src.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(fileExt);

            if (isVideo) {
                const video = document.createElement('video');
                video.src = src;
                video.controls = true;
                video.style.width = '100%';
                video.style.borderRadius = '8px';
                container.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = src;
                img.style.width = '100%';
                img.style.borderRadius = '8px';
                img.style.objectFit = 'contain'; // Contain so full image is seen if stacked
                container.appendChild(img);
            }
        });

        detailText.textContent = memory.text;
        memoryDetailModal.classList.remove('hidden');
    };

    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const formattedDateTime = now.toLocaleDateString('en-US', options);
        const dateTimeDisplay = document.getElementById('dateTimeDisplay');
        if (dateTimeDisplay) {
            dateTimeDisplay.textContent = formattedDateTime;
        }
    }

    // --- EXPENDITURE LOGIC ---
    const expenditureBtn = document.getElementById('expenditureBtn');
    const expenditureView = document.getElementById('expenditureView');
    const backToDashboardFromExpenditure = document.getElementById('backToDashboardFromExpenditure');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const expenseFormModal = document.getElementById('expenseFormModal');
    const saveExpenseBtn = document.getElementById('saveExpenseBtn');
    const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');
    const expenseTitle = document.getElementById('expenseTitle');
    const expenseAmount = document.getElementById('expenseAmount');
    const expenseCategory = document.getElementById('expenseCategory');
    let isEditingExpense = false;
    let editingExpenseId = null;
    let editingExpenseDate = null;


    // Chart instances
    let dailyChart, monthlyChart, yearlyChart;



    if (expenditureBtn && expenditureView) {
        expenditureBtn.addEventListener('click', () => {
            mainDashboard.classList.add('hidden');
            expenditureView.classList.remove('hidden');
            loadExpenditures();
        });

        backToDashboardFromExpenditure.addEventListener('click', () => {
            expenditureView.classList.add('hidden');
            mainDashboard.classList.remove('hidden');
        });

        addExpenseBtn.addEventListener('click', () => {
            expenseFormModal.classList.remove('hidden');
            expenseTitle.value = '';
            expenseAmount.value = '';
            expenseCategory.value = 'Food';
            isEditingExpense = false;
            editingExpenseId = null;
            document.querySelector('#expenseFormModal h3').textContent = 'Add Expense';
        });


        cancelExpenseBtn.addEventListener('click', () => {
            expenseFormModal.classList.add('hidden');
        });

        saveExpenseBtn.addEventListener('click', async () => {
            const title = expenseTitle.value.trim();
            const amount = parseFloat(expenseAmount.value);
            const category = expenseCategory.value;

            if (!title || isNaN(amount) || amount <= 0) {
                alert('Please enter valid title and amount');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                let url = `${API_URL}/expenditures`;
                let method = 'POST';
                const body = { title, amount, category };

                if (isEditingExpense && editingExpenseId) {
                    url = `${API_URL}/expenditures/${editingExpenseId}`;
                    method = 'PUT';
                    body.date = editingExpenseDate; // Preserve original date
                }

                const res = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    expenseFormModal.classList.add('hidden');
                    loadExpenditures(); // Reload charts
                } else {
                    alert('Error saving expense');
                }
            } catch (error) {
                console.error('Error saving expense:', error);
            }

        });
    }

    const loadExpenditures = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/expenditures`, {
                headers: { 'Authorization': token }
            });
            if (res.ok) {
                const expenses = await res.json();
                renderCharts(expenses);
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    };

    const renderCharts = (expenses) => {
        // Prepare Data
        const today = new Date();
        const currentYear = today.getFullYear();

        // 0. Today's Expenditure: Breakdown by Category
        const todayCategories = { 'Food': 0, 'Travel': 0, 'Grocery': 0, 'Maintenance': 0, 'Others': 0 };
        expenses.forEach(e => {
            const eDate = new Date(e.date);
            if (eDate.getDate() === today.getDate() &&
                eDate.getMonth() === today.getMonth() &&
                eDate.getFullYear() === today.getFullYear()) {
                todayCategories[e.category] = (todayCategories[e.category] || 0) + e.amount;
            }
        });
        const todayCategoryLabels = Object.keys(todayCategories);
        const todayCategoryData = Object.values(todayCategories);


        // 1. Daily: Last 7 Days
        const last7Days = [];
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

            // Filter expenses for this day
            const dailyTotal = expenses
                .filter(e => {
                    const eDate = new Date(e.date);
                    return eDate.getDate() === d.getDate() &&
                        eDate.getMonth() === d.getMonth() &&
                        eDate.getFullYear() === d.getFullYear();
                })
                .reduce((sum, e) => sum + e.amount, 0);
            dailyData.push(dailyTotal);
        }

        // 3. Monthly: All months of current year
        const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = new Array(12).fill(0);
        expenses.forEach(e => {
            const eDate = new Date(e.date);
            if (eDate.getFullYear() === currentYear) {
                monthlyData[eDate.getMonth()] += e.amount;
            }
        });

        // 4. Yearly: Category Distribution
        const categories = { 'Food': 0, 'Travel': 0, 'Grocery': 0, 'Maintenance': 0, 'Others': 0 };
        expenses.forEach(e => {
            const eDate = new Date(e.date);
            if (eDate.getFullYear() === currentYear) {
                categories[e.category] = (categories[e.category] || 0) + e.amount;
            }
        });
        const categoryLabels = Object.keys(categories);
        const categoryData = Object.values(categories);

        // Render instances (destroy old ones)
        if (dailyChart) dailyChart.destroy();
        if (monthlyChart) monthlyChart.destroy();
        if (yearlyChart) yearlyChart.destroy();

        // Color Mapping
        const categoryColors = {
            'Travel': '#2ecc71', // Green for Travelling/Travel
            'Food': '#3498db',   // Blue for Food
            'Others': '#e74c3c', // Red for Others
            'Grocery': '#9b59b6', // Violet for Grocery
            'Maintenance': '#8d6e63' // Brown for Maintenance
        };

        const todayBackgroundColors = todayCategoryLabels.map(cat => categoryColors[cat] || '#95a5a6');

        // Populate Today Breakdown

        const todayBreakdown = document.getElementById('todayBreakdown');
        if (todayBreakdown) {
            todayBreakdown.innerHTML = '';
            todayCategoryLabels.forEach((cat, index) => {
                const amount = todayCategoryData[index];
                const color = todayBackgroundColors[index];

                // Filter individual expenses for this category for today
                const categoryExpenses = expenses.filter(e => {
                    const eDate = new Date(e.date);
                    return e.category === cat &&
                        eDate.getDate() === today.getDate() &&
                        eDate.getMonth() === today.getMonth() &&
                        eDate.getFullYear() === today.getFullYear();
                });

                // Container for the whole item (header + sublist)
                const container = document.createElement('div');
                container.style.borderBottom = '1px solid #f0f0f0';

                // Main Row (Header)
                const header = document.createElement('div');
                header.style.display = 'flex';
                header.style.alignItems = 'center';
                header.style.justifyContent = 'space-between';
                header.style.padding = '15px 10px'; // Matching user design spacing
                header.style.cursor = 'pointer';
                header.style.transition = 'background-color 0.2s';

                header.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color};"></div>
                        <span style="font-size: 1rem; color: #555; font-weight: 500;">${cat}</span>
                        ${categoryExpenses.length > 0 ? '<i class="fas fa-chevron-down" style="font-size: 0.8rem; color: #aaa; transition: transform 0.3s;"></i>' : ''}
                    </div>
                    <span style="font-weight: 700; color: #333; font-size: 1rem;">₹${amount}</span>
                `;

                // Sub-list (Hidden by default)
                const subList = document.createElement('div');
                subList.style.display = 'none';
                subList.style.backgroundColor = '#fafafa';
                subList.style.padding = '0 10px 10px 37px'; // Indent to align with text

                if (categoryExpenses.length > 0) {
                    categoryExpenses.forEach(exp => {
                        const row = document.createElement('div');
                        row.style.display = 'flex';
                        row.style.justifyContent = 'space-between';
                        row.style.padding = '8px 0';
                        row.style.borderBottom = '1px dashed #eee';
                        row.style.fontSize = '0.9rem';
                        row.style.color = '#666';

                        row.innerHTML = `
                            <span>${exp.title}</span>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span>₹${exp.amount}</span>
                                <i class="fas fa-edit edit-expense-btn" data-id="${exp._id}" style="color:#f1c40f; cursor:pointer;" title="Edit"></i>
                            </div>
                        `;
                        // row.innerHTML = `
                        //     <span>${exp.title}</span>
                        //     <span>₹${exp.amount}</span>
                        // `;
                        subList.appendChild(row);

                        // Attach listener to this specific edit button
                        const editBtn = row.querySelector('.edit-expense-btn');
                        editBtn.addEventListener('click', (e) => {
                            e.stopPropagation(); // Prevent accordion toggle
                            expenseFormModal.classList.remove('hidden');
                            expenseTitle.value = exp.title;
                            expenseAmount.value = exp.amount;
                            expenseCategory.value = exp.category;
                            isEditingExpense = true;
                            editingExpenseId = exp._id;
                            editingExpenseDate = exp.date;
                            document.querySelector('#expenseFormModal h3').textContent = 'Edit Expense';
                        });

                    });
                } else {
                    subList.innerHTML = '<div style="padding:8px 0; color:#999; font-size:0.85rem;">No items</div>';
                }

                // Toggle Logic
                header.addEventListener('click', () => {
                    const icon = header.querySelector('.fa-chevron-down');
                    if (subList.style.display === 'none') {
                        subList.style.display = 'block';
                        header.style.backgroundColor = '#f9f9f9';
                        if (icon) icon.style.transform = 'rotate(180deg)';
                    } else {
                        subList.style.display = 'none';
                        header.style.backgroundColor = 'transparent';
                        if (icon) icon.style.transform = 'rotate(0deg)';
                    }
                });

                container.appendChild(header);
                container.appendChild(subList);
                todayBreakdown.appendChild(container);
            });

            // Add Total Row
            const todayTotal = todayCategoryData.reduce((sum, val) => sum + val, 0);
            const totalItem = document.createElement('div');
            totalItem.style.display = 'flex';
            totalItem.style.alignItems = 'center';
            totalItem.style.justifyContent = 'space-between';
            totalItem.style.padding = '15px 10px';
            totalItem.style.borderTop = '2px solid #e0e0e0'; // Separator
            totalItem.style.marginTop = '10px';

            totalItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                     <span style="font-size: 1.1rem; color: #333; font-weight: 600;">Total</span>
                </div>
                <span style="font-weight: 700; color: #764ba2; font-size: 1.1rem;">₹${todayTotal}</span>
            `;
            todayBreakdown.appendChild(totalItem);
        }




        // Daily Chart
        const ctxDaily = document.getElementById('dailyChart').getContext('2d');
        dailyChart = new Chart(ctxDaily, {
            type: 'bar',
            data: {
                labels: last7Days,
                datasets: [{ label: 'Daily (₹)', data: dailyData, backgroundColor: '#3498db' }]
            }
        });

        // Calculate and Display Average
        const totalLast7Days = dailyData.reduce((a, b) => a + b, 0);
        const averageLast7Days = totalLast7Days / 7;
        const dailyAverageElement = document.getElementById('dailyAverage');
        if (dailyAverageElement) {
            dailyAverageElement.textContent = `Average this week: ₹${averageLast7Days.toFixed(2)}`;
        }



        // Monthly Chart
        const ctxMonthly = document.getElementById('monthlyChart').getContext('2d');
        monthlyChart = new Chart(ctxMonthly, {
            type: 'bar',
            data: {
                labels: monthlyLabels,
                datasets: [{ label: 'Monthly (₹)', data: monthlyData, backgroundColor: '#9b59b6' }]
            }
        });

        // Calculate and Display Monthly Average (for current month)
        // Average = Total Spend in Current Month / Current Day of Month
        const currentMonthTotal = monthlyData[today.getMonth()];
        const currentDayOfMonth = today.getDate(); // e.g., 1 to 31

        let averageMonthly = 0;
        if (currentDayOfMonth > 0) {
            averageMonthly = currentMonthTotal / currentDayOfMonth;
        }

        const monthlyAverageElement = document.getElementById('monthlyAverage');
        if (monthlyAverageElement) {
            monthlyAverageElement.textContent = `Average this month: ₹${averageMonthly.toFixed(2)}`;
        }


        // Yearly Chart
        const ctxYearly = document.getElementById('yearlyChart').getContext('2d');
        const yearlyBackgroundColors = categoryLabels.map(cat => categoryColors[cat] || '#95a5a6'); // Default gray


        yearlyChart = new Chart(ctxYearly, {
            type: 'pie',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: yearlyBackgroundColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Hide default legend as we have custom list
                    }
                }
            }
        });

        // Populate Yearly Breakdown
        const yearlyBreakdown = document.getElementById('yearlyBreakdown');
        if (yearlyBreakdown) {
            yearlyBreakdown.innerHTML = '';
            categoryLabels.forEach((cat, index) => {
                const amount = categoryData[index];
                const color = yearlyBackgroundColors[index];

                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.justifyContent = 'space-between';
                item.style.padding = '8px';
                item.style.borderBottom = '1px solid #f0f0f0';

                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color};"></div>
                        <span style="font-size: 0.9rem; color: #555;">${cat}</span>
                    </div>
                    <span style="font-weight: 600; color: #333; font-size: 0.9rem;">₹${amount}</span>
                `;
                yearlyBreakdown.appendChild(item);
            });
        }
    };

}

// --- DIARY LOGIC ---
const diaryBtn = document.getElementById('diaryBtn');
const diaryView = document.getElementById('diaryView');
const backToDashboardFromDiary = document.getElementById('backToDashboardFromDiary');
const saveDiaryBtn = document.getElementById('saveDiaryBtn');
const diaryInput = document.getElementById('diaryInput');
const diaryList = document.getElementById('diaryList');

if (diaryBtn && diaryView) {
    diaryBtn.addEventListener('click', () => {
        mainDashboard.classList.add('hidden');
        diaryView.classList.remove('hidden');
        loadDiary();
    });

    if (backToDashboardFromDiary) {
        backToDashboardFromDiary.addEventListener('click', () => {
            diaryView.classList.add('hidden');
            mainDashboard.classList.remove('hidden');
        });
    }

    if (saveDiaryBtn) {
        saveDiaryBtn.addEventListener('click', async () => {
            const text = diaryInput.value.trim();
            if (!text) {
                alert('Please write something!');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/diary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': token },
                    body: JSON.stringify({ text })
                });

                if (res.ok) {
                    diaryInput.value = '';
                    loadDiary(); // Refresh list
                } else {
                    alert('Failed to save entry');
                }
            } catch (error) {
                console.error(error);
                alert('Error saving entry');
            }
        });
    }

    const loadDiary = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/diary`, {
                headers: { 'Authorization': token }
            });

            if (res.ok) {
                const entries = await res.json();
                renderDiaryEntries(entries);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const renderDiaryEntries = (entries) => {
        diaryList.innerHTML = '';
        const today = new Date().toDateString();

        if (entries.length === 0) {
            diaryList.innerHTML = '<p style="text-align: center; color: #999;">No entries yet.</p>';
            return;
        }

        entries.forEach(entry => {
            const entryDate = new Date(entry.date).toDateString();
            const isToday = entryDate === today;
            const fullDate = new Date(entry.date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            const div = document.createElement('div');
            div.style.background = 'white';
            div.style.padding = '15px';
            div.style.borderRadius = '10px';
            div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
            div.style.borderLeft = '4px solid #764ba2';
            div.dataset.id = entry._id; // Store ID for reference

            let actionsHtml = '';
            if (isToday) {
                actionsHtml = `
                    <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="edit-diary-btn" style="background: none; border: none; color: #f1c40f; cursor: pointer; font-size: 1rem;"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-diary-btn" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 1rem;"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                `;
            }

            div.innerHTML = `
                <div style="font-size: 0.85rem; color: #888; margin-bottom: 5px;">${fullDate}</div>
                <div class="diary-text" style="font-size: 1rem; color: #333; white-space: pre-wrap;">${entry.text}</div>
                ${actionsHtml}
            `;

            diaryList.appendChild(div);

            // Attach Listeners if editable
            if (isToday) {
                const editBtn = div.querySelector('.edit-diary-btn');
                const deleteBtn = div.querySelector('.delete-diary-btn');
                const textDiv = div.querySelector('.diary-text');

                // Edit Logic
                editBtn.addEventListener('click', () => {
                    if (editBtn.textContent.includes('Edit')) {
                        // Switch to Edit Mode
                        const currentText = textDiv.textContent;
                        const textarea = document.createElement('textarea');
                        textarea.value = currentText;
                        textarea.style.width = '100%';
                        textarea.style.minHeight = '60px';
                        textarea.style.padding = '8px';
                        textarea.style.borderRadius = '8px';
                        textarea.style.border = '1px solid #ddd';
                        textarea.style.fontFamily = 'Poppins, sans-serif';

                        textDiv.innerHTML = '';
                        textDiv.appendChild(textarea);
                        textarea.focus();

                        editBtn.innerHTML = '<i class="fas fa-save"></i> Save';
                        editBtn.style.color = '#2ecc71';
                    } else {
                        // Save Changes
                        const textarea = textDiv.querySelector('textarea');
                        const newText = textarea.value.trim();
                        if (newText) {
                            updateDiaryEntry(entry._id, newText).then(success => {
                                if (success) {
                                    textDiv.textContent = newText;
                                    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
                                    editBtn.style.color = '#f1c40f';
                                }
                            });
                        }
                    }
                });

                // Delete Logic
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Delete this entry?')) {
                        deleteDiaryEntry(entry._id).then(success => {
                            if (success) div.remove();
                        });
                    }
                });
            }
        });
    };

    const updateDiaryEntry = async (id, text) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/diary/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ text })
            });
            if (res.ok) return true;
            else {
                alert('Failed to update. Maybe it is not from today?');
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const deleteDiaryEntry = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/diary/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });
            if (res.ok) return true;
            else {
                alert('Failed to delete. Maybe it is not from today?');
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };
}
