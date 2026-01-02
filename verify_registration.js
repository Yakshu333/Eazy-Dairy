const http = require('http');

function register(data) {
    const postData = JSON.stringify(data);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        res.on('data', (d) => process.stdout.write(d));
    });

    req.on('error', (e) => console.error(e));
    req.write(postData);
    req.end();
}

console.log('Testing valid registration...');
register({
    username: 'newuser',
    password: 'password123',
    mobileNumber: '1234567890'
});
