// test-upload-validation.js
const fs = require('fs');
const testUploadValidation = async () => {
    // Create a mock generic text file
    fs.writeFileSync('mock_resume.txt', 'John Doe\nExperienced Software Engineer looking for a new role. Skills: React, Node.js.\nWork History: Acme Corp 2020-2023');

    const fileBuffer = fs.readFileSync('mock_resume.txt');
    const blob = new Blob([fileBuffer], { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', blob, 'mock_resume.txt');

    console.log("--- Starting AI Document Validation Test ---\n");
    console.log("Attempting to upload a Software Engineering Resume to the Medical Claims Ingest API...\n");

    try {
        const response = await fetch("http://localhost:3000/api/ingest", {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        
        console.log(`Status Code: ${response.status}`);
        console.log(`Response Data:`, data);
        console.log("\n--------------------------------------------------\n");
    } catch(e) {
        console.error("Test failed:", e);
    }
    
    // Cleanup
    fs.unlinkSync('mock_resume.txt');
};

testUploadValidation();
