const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const USERNAME = `testuser_${Date.now()}`;
const PASSWORD = 'password123';
let TOKEN = '';
let GOAL_ID = '';

async function runTest() {
    try {
        console.log('--- Starting API Verification ---');

        // 1. Register
        console.log(`1. Registering user: ${USERNAME}`);
        try {
            await axios.post(`${API_URL}/register`, {
                username: USERNAME,
                password: PASSWORD,
                mobileNumber: '1234567890',
                email: `${USERNAME}@example.com`
            });
            console.log('   Registration successful');
        } catch (e) {
            console.error('   Registration failed:', e.response?.data || e.message);
            return;
        }

        // 2. Login
        console.log('2. Logging in');
        try {
            const res = await axios.post(`${API_URL}/login`, {
                username: USERNAME,
                password: PASSWORD
            });
            TOKEN = res.data.token;
            console.log('   Login successful, token obtained');
        } catch (e) {
            console.error('   Login failed:', e.response?.data || e.message);
            return;
        }

        const authHeader = { headers: { 'Authorization': TOKEN } };

        // 3. Create Goal
        console.log('3. Creating Goal');
        try {
            const res = await axios.post(`${API_URL}/goals`, {
                text: 'Test Goal',
                type: 'daily'
            }, authHeader);
            GOAL_ID = res.data._id;
            console.log('   Goal created with ID:', GOAL_ID);
        } catch (e) {
            console.error('   Create Goal failed:', e.response?.data || e.message);
            return;
        }

        // 4. Fetch Goals (Verify Persistence)
        console.log('4. Fetching Goals');
        try {
            const res = await axios.get(`${API_URL}/goals`, authHeader);
            const goal = res.data.find(g => g._id === GOAL_ID);
            if (goal && goal.text === 'Test Goal') {
                console.log('   Goal persisted and fetched successfully');
            } else {
                console.error('   Goal not found or text mismatch');
            }
        } catch (e) {
            console.error('   Fetch Goals failed:', e.response?.data || e.message);
            return;
        }

        // 5. Update Goal
        console.log('5. Updating Goal');
        try {
            await axios.put(`${API_URL}/goals/${GOAL_ID}`, {
                text: 'Updated Test Goal',
                isCompleted: true
            }, authHeader);
            console.log('   Goal updated');
        } catch (e) {
            console.error('   Update Goal failed:', e.response?.data || e.message);
            return;
        }

        // 6. Verify Update
        console.log('6. Verifying Update');
        try {
            const res = await axios.get(`${API_URL}/goals`, authHeader);
            const goal = res.data.find(g => g._id === GOAL_ID);
            if (goal && goal.text === 'Updated Test Goal' && goal.isCompleted === true) {
                console.log('   Goal update persisted successfully');
            } else {
                console.error('   Goal update verification failed');
            }
        } catch (e) {
            console.error('   Verify Update failed:', e.response?.data || e.message);
            return;
        }

        // 7. Delete Goal
        console.log('7. Deleting Goal');
        try {
            await axios.delete(`${API_URL}/goals/${GOAL_ID}`, authHeader);
            console.log('   Goal deleted');
        } catch (e) {
            console.error('   Delete Goal failed:', e.response?.data || e.message);
            return;
        }

        // 8. Verify Deletion
        console.log('8. Verifying Deletion');
        try {
            const res = await axios.get(`${API_URL}/goals`, authHeader);
            const goal = res.data.find(g => g._id === GOAL_ID);
            if (!goal) {
                console.log('   Goal deletion verified');
            } else {
                console.error('   Goal still exists after deletion');
            }
        } catch (e) {
            console.error('   Verify Deletion failed:', e.response?.data || e.message);
            return;
        }

        console.log('--- API Verification Completed Successfully ---');

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

runTest();
