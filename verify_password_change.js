const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const USERNAME = `test_pwd_${Date.now()}`;
const OLD_PASSWORD = 'password123';
const NEW_PASSWORD = 'newpassword456';
const EMAIL = `${USERNAME}@example.com`;
const MOBILE = '1122334455';

async function runTest() {
    try {
        console.log('--- Starting Password Change Verification ---');

        // 1. Register & Login
        console.log('1. Registering user...');
        await axios.post(`${API_URL}/register`, {
            username: USERNAME,
            password: OLD_PASSWORD,
            mobileNumber: MOBILE,
            email: EMAIL
        });

        console.log('2. Logging in with old password...');
        let res = await axios.post(`${API_URL}/login`, {
            username: USERNAME,
            password: OLD_PASSWORD
        });
        const token = res.data.token;
        console.log('   Login successful');

        const authHeader = { headers: { 'Authorization': token } };

        // 3. Try changing with WRONG old password
        console.log('3. Testing WRONG old password...');
        try {
            await axios.put(`${API_URL}/change-password`, {
                oldPassword: 'wrongpassword',
                newPassword: NEW_PASSWORD
            }, authHeader);
            console.error('   FAILED: Should have rejected wrong password');
        } catch (e) {
            if (e.response && e.response.status === 400) {
                console.log('   SUCCESS: Correctly rejected wrong password');
            } else {
                console.error('   FAILED: Unexpected error', e.message);
            }
        }

        // 4. Change with CORRECT old password
        console.log('4. Changing password...');
        await axios.put(`${API_URL}/change-password`, {
            oldPassword: OLD_PASSWORD,
            newPassword: NEW_PASSWORD
        }, authHeader);
        console.log('   Password change successful');

        // 5. Login with NEW password
        console.log('5. Verifying login with NEW password...');
        res = await axios.post(`${API_URL}/login`, {
            username: USERNAME,
            password: NEW_PASSWORD
        });
        if (res.data.token) {
            console.log('   SUCCESS: Login with new password worked');
        }

        console.log('--- Verification Completed Successfully ---');

    } catch (e) {
        console.error('Unexpected error:', e.response?.data || e.message);
    }
}

runTest();
