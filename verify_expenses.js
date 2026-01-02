const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const USERNAME = `test_exp_${Date.now()}`;
const PASSWORD = 'password123';
const EMAIL = `${USERNAME}@example.com`;
const MOBILE = '1234567890';

async function runTest() {
    try {
        console.log('--- Starting Expenditure Verification ---');

        // 1. Register & Login
        console.log('1. Registering user...');
        await axios.post(`${API_URL}/register`, {
            username: USERNAME,
            password: PASSWORD,
            mobileNumber: MOBILE,
            email: EMAIL
        });

        const loginRes = await axios.post(`${API_URL}/login`, {
            username: USERNAME,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log('   Login successful');

        // 2. Add Expense
        console.log('2. Adding Expense...');
        const expenseData = {
            title: 'Test Feed',
            amount: 50,
            category: 'Feed',
            date: new Date()
        };

        const addRes = await axios.post(`${API_URL}/expenditures`, expenseData, {
            headers: { 'Authorization': token }
        });
        const expenseId = addRes.data._id;
        console.log('   Expense added. ID:', expenseId);

        // 3. Get Expenses
        console.log('3. Fetching Expenses...');
        const getRes = await axios.get(`${API_URL}/expenditures`, { headers: { 'Authorization': token } });
        const expenses = getRes.data;
        if (expenses.length > 0 && expenses[0]._id === expenseId) {
            console.log('   List verified. Found expense:', expenses[0].title);
        } else {
            console.error('   FAILED: Expense not found in list');
        }

        // 4. Delete Expense
        console.log('4. Deleting Expense...');
        await axios.delete(`${API_URL}/expenditures/${expenseId}`, { headers: { 'Authorization': token } });
        console.log('   Expense deleted successfully');

        console.log('--- Verification Completed Successfully ---');

    } catch (e) {
        console.error('Unexpected error:', e.response?.data || e.message);
    }
}

runTest();
