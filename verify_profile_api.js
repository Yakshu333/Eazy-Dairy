const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const USERNAME = `test_profile_${Date.now()}`;
const PASSWORD = 'password123';
const EMAIL = `${USERNAME}@example.com`;
const MOBILE = '9876543210';

async function runTest() {
    try {
        console.log('--- Starting Profile API Verification ---');

        // 1. Register & Login
        console.log(`1. Authenticating user: ${USERNAME}`);
        try {
            await axios.post(`${API_URL}/register`, {
                username: USERNAME,
                password: PASSWORD,
                mobileNumber: MOBILE,
                email: EMAIL
            });
            const res = await axios.post(`${API_URL}/login`, {
                username: USERNAME,
                password: PASSWORD
            });
            const token = res.data.token;
            console.log('   Authentication successful');

            const authHeader = { headers: { 'Authorization': token } };

            // 2. Fetch Dashboard/Profile Data
            console.log('2. Fetching Profile Data');
            const dashRes = await axios.get(`${API_URL}/dashboard`, authHeader);
            const user = dashRes.data.user;

            if (user && user.username === USERNAME && user.email === EMAIL && user.mobileNumber === MOBILE) {
                console.log('   Profile data matched successfully:');
                console.log(`   - Username: ${user.username}`);
                console.log(`   - Email: ${user.email}`);
                console.log(`   - Mobile: ${user.mobileNumber}`);
            } else {
                console.error('   Profile data Mismatch:', user);
            }

        } catch (e) {
            console.error('   Test failed:', e.response?.data || e.message);
            return;
        }

        console.log('--- Profile Verification Completed Successfully ---');

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

runTest();
