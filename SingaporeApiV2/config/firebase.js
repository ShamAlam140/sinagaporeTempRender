const admin = require('firebase-admin');

function normalizeServiceAccount(serviceAccount) {
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    return serviceAccount;
}

function parseServiceAccount() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const decoded = Buffer.from(
            process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
            'base64'
        ).toString('utf8');

        return normalizeServiceAccount(JSON.parse(decoded));
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return normalizeServiceAccount(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
    }

    return null;
}

function initializeFirebase() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const serviceAccount = parseServiceAccount();

    if (!serviceAccount) {
        console.warn('⚠️ Firebase service account not set. Firebase Admin is disabled.');
        return null;
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin initialized');
    return admin.app();
}

module.exports = {
    admin,
    initializeFirebase,
};
