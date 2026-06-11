/**
 * Validate required environment variables on startup.
 * Fails fast with clear messages instead of crashing mid-request.
 */

const REQUIRED_VARS = [
    { name: 'MONGODB_URI', description: 'MongoDB connection string' },
    { name: 'GMAIL_USER', description: 'Gmail email for sending emails' },
    { name: 'GMAIL_PASS', description: 'Gmail app password' },
];

const OPTIONAL_VARS = [
    { name: 'PORT', description: 'Server port', defaultVal: '3000' },
    { name: 'HR_KEY', description: 'SuperAdmin HR key' },
    { name: 'CLOUDINARY_CLOUD_NAME', description: 'Cloudinary cloud name' },
    { name: 'CLOUDINARY_API_KEY', description: 'Cloudinary API key' },
    { name: 'CLOUDINARY_API_SECRET', description: 'Cloudinary API secret' },
    { name: 'FIREBASE_SERVICE_ACCOUNT_BASE64', description: 'Base64 encoded Firebase service account JSON' },
    { name: 'FIREBASE_SERVICE_ACCOUNT_JSON', description: 'Firebase service account JSON string' },
    { name: 'NODE_ENV', description: 'Environment mode', defaultVal: 'development' },
];

function validateEnv() {
    const missing = [];

    for (const v of REQUIRED_VARS) {
        if (!process.env[v.name] || process.env[v.name].trim() === '') {
            missing.push(`  ❌ ${v.name} — ${v.description}`);
        }
    }

    if (missing.length > 0) {
        console.error('\n⚠️  Missing required environment variables:');
        missing.forEach(m => console.error(m));
        console.error('\nPlease set these in your .env file and restart.\n');
        process.exit(1);
    }

    // Log optional vars status
    console.log('📋 Environment check:');
    for (const v of OPTIONAL_VARS) {
        const val = process.env[v.name];
        if (val) {
            console.log(`  ✅ ${v.name} = set`);
        } else if (v.defaultVal) {
            console.log(`  ⚠️  ${v.name} — not set, using default: ${v.defaultVal}`);
        } else {
            console.log(`  ⚠️  ${v.name} — not set (optional)`);
        }
    }
}

module.exports = { validateEnv };
