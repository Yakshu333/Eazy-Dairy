const http = require('http');

function request(path, method, data, callback) {
    const postData = JSON.stringify(data);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api' + path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => callback(res.statusCode, JSON.parse(body)));
    });

    req.on('error', (e) => console.error(e));
    req.write(postData);
    req.end();
}

const mobileNumber = '9876543210';
const username = 'otpuser';
const password = 'password123';

console.log('1. Sending OTP...');
request('/send-otp', 'POST', { mobileNumber }, (status, data) => {
    console.log(`Status: ${status}, Message: ${data.message}`);

    // In a real scenario, we'd get the OTP from SMS. Here we need to cheat or assume a fixed OTP if we mocked it, 
    // but since we can't easily read the server logs from here to get the random OTP, 
    // we will rely on the fact that the server logs it.
    // However, for this automated test, we can't easily get the OTP. 
    // So we will just verify the send-otp endpoint works.
    // To fully verify register, we would need to know the OTP.
    // Let's just verify the send-otp response for now.
});
