require('https').get('https://mediclaim-42woa1ja9-joeharys-projects-c790908a.vercel.app', (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            console.log('Status:', res.statusCode);
            console.log('Headers:', res.headers);
            console.log('Body snippet:', rawData.substring(0, 1000));
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
