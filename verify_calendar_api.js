const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const USERNAME = `testuser_cal_${Date.now()}`;
const PASSWORD = 'password123';
let TOKEN = '';
let BIRTHDAY_ID = '';

async function runTest() {
    try {
        console.log('--- Starting Calendar API Verification ---');

        // 1. Register & Login
        console.log(`1. Authenticating user: ${USERNAME}`);
        try {
            await axios.post(`${API_URL}/register`, {
                username: USERNAME,
                password: PASSWORD,
                mobileNumber: '1234567890',
                email: `${USERNAME}@example.com`
            });
            const res = await axios.post(`${API_URL}/login`, {
                username: USERNAME,
                password: PASSWORD
            });
            TOKEN = res.data.token;
            console.log('   Authentication successful');
        } catch (e) {
            console.error('   Auth failed:', e.response?.data || e.message);
            return;
        }

        const authHeader = { headers: { 'Authorization': TOKEN } };

        // 2. Fetch Holidays
        console.log('2. Fetching Holidays');
        try {
            const res = await axios.get(`${API_URL}/holidays`);
            const holidays = res.data;
            if (holidays.some(h => h.name === 'Republic Day' && h.date === '2025-01-26')) {
                console.log(`   Holidays fetched successfully. Count: ${holidays.length}`);
            } else {
                console.error('   Holidays mismatch or empty');
            }
        } catch (e) {
            console.error('   Fetch Holidays failed:', e.response?.data || e.message);
            return;
        }

        // 3. Add Birthday
        console.log('3. Adding Birthday');
        try {
            const res = await axios.post(`${API_URL}/birthdays`, {
                name: 'Test Friend',
                date: '2025-05-20'
            }, authHeader);
            BIRTHDAY_ID = res.data._id;
            console.log('   Birthday added with ID:', BIRTHDAY_ID);
        } catch (e) {
            console.error('   Add Birthday failed:', e.response?.data || e.message);
            return;
        }

        // 4. Fetch Birthdays to Verify Persistence
        console.log('4. Fetching Birthdays');
        try {
            const res = await axios.get(`${API_URL}/birthdays`, authHeader);
            const birthday = res.data.find(b => b._id === BIRTHDAY_ID);
            if (birthday && birthday.name === 'Test Friend') {
                console.log('   Birthday persisted and fetched successfully');
            } else {
                console.error('   Birthday not found');
            }
        } catch (e) {
            console.error('   Fetch Birthdays failed:', e.response?.data || e.message);
            return;
        }

        // 5. Delete Birthday
        console.log('5. Deleting Birthday');
        try {
            await axios.delete(`${API_URL}/birthdays/${BIRTHDAY_ID}`, authHeader);
            console.log('   Birthday deleted');
        } catch (e) {
            console.error('   Delete Birthday failed:', e.response?.data || e.message);
            return;
        }

        // 6. Verify Deletion
        console.log('6. Verifying Deletion');
        try {
            const res = await axios.get(`${API_URL}/birthdays`, authHeader);
            const birthday = res.data.find(b => b._id === BIRTHDAY_ID);
            if (!birthday) {
                console.log('   Birthday deletion verified');
            } else {
                console.error('   Birthday still exists');
            }
        } catch (e) {
            console.error('   Verify Deletion failed:', e.response?.data || e.message);
            return;
        }

        console.log('--- Calendar Verification Completed Successfully ---');

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

runTest();
