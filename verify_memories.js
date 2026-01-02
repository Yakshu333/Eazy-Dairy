const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const USERNAME = `test_mem_${Date.now()}`;
const PASSWORD = 'password123';
const EMAIL = `${USERNAME}@example.com`;
const MOBILE = '1122334455';

// Path to an existing image artifact
const IMAGE_PATH = 'C:/Users/yaksh/.gemini/antigravity/brain/4f83f020-c534-4714-a345-ba00d0a39aa2/uploaded_image_1766724415500.png';

async function runTest() {
    try {
        console.log('--- Starting Memories Verification ---');

        // Check file exists
        if (!fs.existsSync(IMAGE_PATH)) {
            console.error('Image file not found for test:', IMAGE_PATH);
            return;
        }

        // 1. Register & Login
        console.log('1. Registering user...');
        await axios.post(`${API_URL}/register`, {
            username: USERNAME,
            password: PASSWORD,
            mobileNumber: MOBILE,
            email: EMAIL
        });

        let res = await axios.post(`${API_URL}/login`, {
            username: USERNAME,
            password: PASSWORD
        });
        const token = res.data.token;
        console.log('   Login successful');

        // 2. Add Memory (Upload)
        console.log('2. Adding Memory (Uploading Image)...');
        const form = new FormData();
        form.append('text', 'This is a test memory');
        form.append('image', fs.createReadStream(IMAGE_PATH));

        res = await axios.post(`${API_URL}/memories`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': token
            }
        });
        const memoryId = res.data._id;
        console.log('   Memory added successfully. ID:', memoryId);

        // 3. Get Memories
        console.log('3. Fetching Memories...');
        res = await axios.get(`${API_URL}/memories`, { headers: { 'Authorization': token } });
        const memories = res.data;
        if (memories.length > 0 && memories[0]._id === memoryId) {
            console.log('   List verified. Found memory:', memories[0].text);
        } else {
            console.error('   FAILED: Memory not found in list');
        }

        // 4. Delete Memory
        console.log('4. Deleting Memory...');
        await axios.delete(`${API_URL}/memories/${memoryId}`, { headers: { 'Authorization': token } });
        console.log('   Memory deleted successfully');

        console.log('--- Verification Completed Successfully ---');

    } catch (e) {
        console.error('Unexpected error:', e.response?.data || e.message);
    }
}

runTest();
