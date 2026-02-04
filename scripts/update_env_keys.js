const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const localEnvPath = path.join(process.cwd(), '.env.local');

const newVars = `
GOOGLE_CLIENT_ID="49079127610-d15c14e7no2spfvo8vjn5f9msqq8m2ll.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;

function appendVars(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Check if vars exist to avoid dupes (simple check)
        if (!content.includes('GOOGLE_CLIENT_ID')) {
            fs.appendFileSync(filePath, newVars);
            console.log(`Appended to ${filePath}`);
        } else {
            console.log(`Vars already in ${filePath}`);
        }
    } else {
        fs.writeFileSync(filePath, newVars);
        console.log(`Created ${filePath}`);
    }
}

appendVars(envPath);
appendVars(localEnvPath);
