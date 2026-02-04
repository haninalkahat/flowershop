const fs = require('fs');
const { execSync } = require('child_process');

try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/^DATABASE_URL=(.*)$/m);

    if (match) {
        let dbUrl = match[1].trim();
        // Remove quotes if they exist
        if ((dbUrl.startsWith('"') && dbUrl.endsWith('"')) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
            dbUrl = dbUrl.slice(1, -1);
        }

        console.log('Removing existing DATABASE_URL from production...');
        try {
            execSync('npx vercel env rm DATABASE_URL production -y', { stdio: 'inherit' });
        } catch (e) {
            console.log('Could not remove (maybe it did not exist).');
        }

        console.log('Adding DATABASE_URL to production...');
        // Pass value via input option which writes to stdin
        execSync('npx vercel env add DATABASE_URL production', { input: dbUrl, stdio: ['pipe', 'inherit', 'inherit'] });
        console.log('Successfully updated DATABASE_URL.');
    } else {
        console.error('DATABASE_URL not found in .env');
        process.exit(1);
    }
} catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
}
