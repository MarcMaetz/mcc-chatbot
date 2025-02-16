/**
 * MCC Chatbot Backend - Node.js (TypeScript)
 * Uses Express.js, Firestore (or BigQuery), and Google Cloud Functions
 */

import express from 'express';
import { Request, Response } from 'express';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}
const db = admin.firestore();

const app = express();
app.use(express.json());

// Sample MCC Code Data Structure
interface MCCRule {
    mcc: string;
    category: string;
    allowed: boolean;
    spendingLimit?: number;
}

// Endpoint: Check if MCC is allowed
app.get('/check-mcc', async (req: any, res: any) => {
    try {
        const { mcc } = req.query;
        if (!mcc) {
            return res.status(400).json({ error: 'MCC code is required' });
        }

        // Fetch MCC policy from Firestore
        const doc = await db.collection('mccRules').doc(mcc as string).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'MCC code not found' });
        }

        const mccRule = doc.data() as MCCRule;
        return res.json({
            mcc: mccRule.mcc,
            category: mccRule.category,
            allowed: mccRule.allowed,
            spendingLimit: mccRule.spendingLimit || 'No limit',
        });
    } catch (error) {
        console.error('Error fetching MCC data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server (for local development)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
