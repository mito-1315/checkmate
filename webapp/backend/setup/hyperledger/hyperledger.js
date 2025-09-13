import { Gateway, Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatTransactionResult, formatError } from '../../utils/resultFormatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hyperledger Fabric integration functions

async function addMarkToFabric(id, gpa) {
    try {
        // Initialize wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if identity exists in wallet
        const identity = await wallet.get('User1@org1.example.com');
        if (!identity) {
            throw new Error('Identity not found in wallet. Run import-identity.js first.');
        }

        // Load connection profile - updated to match import-identity.js path
        const ccpPath = path.resolve(
            '/home/mito/Documents/checkmate/fabric-samples/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
        );
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'User1@org1.example.com',
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get network and contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic'); // Use your chaincode name here
        
        // Create transaction payload
        const markData = {
            id: id,
            gpa: gpa,
            timestamp: new Date().toISOString(),
            transactionId: generateTransactionId()
        };
        
        console.log(`🚀 Submitting transaction for Student ID: ${id}, GPA: ${gpa}`);
        
        // Submit transaction to fabric network - provide 5 parameters as expected
        const result = await contract.submitTransaction(
            'CreateAsset', 
            id,                           // Parameter 1: Asset ID
            'student',                    // Parameter 2: Color (using 'student' as color/type)
            50,                           // Parameter 3: Size (as number)
            '50',                         // Parameter 4: Owner (placeholder)
            parseFloat(gpa)               // Parameter 5: AppraisedValue (GPA as float)
        );
        
        // Update transaction table in database
        await updateTransactionTable(markData.transactionId, 'addMark', markData);
        
        // Format and display the result
        formatTransactionResult(result.toString(), 'Add Student Mark', {
            transactionId: markData.transactionId,
            id: id,
            gpa: gpa
        });
        
        console.log(`Mark added successfully for ID: ${id}, GPA: ${gpa}`);
        
        // Disconnect from gateway
        await gateway.disconnect();
        
        return {
            transactionId: markData.transactionId,
            id: id,
            gpa: gpa,
            status: 'committed',
            result: result.toString()
        };
        
    } catch (error) {
        formatError(error, 'Add Student Mark');
        throw new Error(`Failed to add mark to fabric: ${error.message}`);
    }
}

function generateTransactionId() {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Implement transaction table update function
async function updateTransactionTable(transactionId, operation, data) {
    try {
        // For now, log to file - replace with actual database logic
        const logData = {
            transactionId,
            operation,
            data,
            timestamp: new Date().toISOString()
        };
        
        const logPath = path.join(process.cwd(), 'transactions.log');
        fs.appendFileSync(logPath, JSON.stringify(logData) + '\n');
        
        console.log(`Transaction ${transactionId} recorded for operation: ${operation}`);
    } catch (error) {
        console.error('Failed to update transaction table:', error);
    }
}

// Helper function to initialize identity (similar to import-identity.js)
async function initializeIdentity() {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if identity already exists
        const identity = await wallet.get('User1@org1.example.com');
        if (identity) {
            console.log('Identity already exists in wallet');
            return;
        }

        // Paths to crypto materials - already updated to match import-identity.js
        const credPath = path.resolve(
            '/home/mito/Documents/checkmate/fabric-samples/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp'
        );
        
        const certPath = path.join(credPath, 'signcerts', 'cert.pem');
        const keyDir = path.join(credPath, 'keystore');
        
        if (!fs.existsSync(certPath) || !fs.existsSync(keyDir)) {
            throw new Error('Crypto materials not found. Make sure the test network is running.');
        }
        
        const keyPath = fs.readdirSync(keyDir)[0]; // get first key file

        const certificate = fs.readFileSync(certPath).toString();
        const privateKey = fs.readFileSync(path.join(keyDir, keyPath)).toString();

        const identityData = {
            credentials: {
                certificate,
                privateKey,
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        // Import identity into wallet
        await wallet.put('User1@org1.example.com', identityData);
        console.log('Identity imported into wallet');
    } catch (error) {
        console.error('Failed to initialize identity:', error);
        throw error;
    }
}

export { addMarkToFabric, initializeIdentity };
