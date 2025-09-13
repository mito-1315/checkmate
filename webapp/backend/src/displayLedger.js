import { Gateway, Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';

async function displayLedger() {
    let gateway;
    try {
        // Initialize wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if identity exists in wallet
        const identity = await wallet.get('User1@org1.example.com');
        if (!identity) {
            throw new Error('Identity not found in wallet. Run import-identity.js first.');
        }

        // Load connection profile
        const ccpPath = path.resolve(
            '/home/mito/Documents/checkmate/fabric-samples/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
        );
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create gateway
        gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'User1@org1.example.com',
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get network and contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('basic');

        console.log('\n' + '🔗'.repeat(30));
        console.log('📊 HYPERLEDGER FABRIC LEDGER DISPLAY');
        console.log('🔗'.repeat(30) + '\n');

        // Display World State (Current Assets)
        await displayWorldState(contract);
        
        // Display Transaction History
        await displayTransactionHistory(contract);

    } catch (error) {
        console.error('❌ Failed to display ledger:', error.message);
    } finally {
        if (gateway) {
            await gateway.disconnect();
        }
    }
}

async function displayWorldState(contract) {
    try {
        console.log('🌍 CURRENT WORLD STATE (All Assets)');
        console.log('='.repeat(50));

        // Get all assets from the ledger
        const result = await contract.evaluateTransaction('GetAllAssets');
        const assets = JSON.parse(result.toString());

        if (assets.length === 0) {
            console.log('📝 No assets found in the ledger.\n');
            return;
        }

        assets.forEach((asset, index) => {
            console.log(`\n📋 Asset ${index + 1}:`);
            console.log(`   🆔 ID: ${asset.ID || 'N/A'}`);
            console.log(`   🏷️  Type: ${asset.Color === 'student' ? 'Student Record' : asset.Color || 'N/A'}`);
            console.log(`   📈 GPA: ${asset.AppraisedValue || 'N/A'}`);
            console.log(`   👑 Owner: ${asset.Owner || 'N/A'}`);
            console.log(`   📏 Size: ${asset.Size || 'N/A'}`);
            console.log(`   ⏰ Record Key: ${asset.Record || asset.Key || 'N/A'}`);
        });

        console.log(`\n✅ Total Assets: ${assets.length}`);
        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.log('❌ Error retrieving world state:', error.message);
        console.log('💡 This might be because GetAllAssets function is not available in the chaincode.\n');
    }
}

// Function to display ledger info summary
async function displayLedgerInfo() {
    let gateway;
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const identity = await wallet.get('User1@org1.example.com');
        
        if (!identity) {
            throw new Error('Identity not found in wallet.');
        }

        const ccpPath = path.resolve(
            '/home/mito/Documents/checkmate/fabric-samples/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
        );
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'User1@org1.example.com',
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork('mychannel');
        
        console.log('\n' + '📊'.repeat(20));
        console.log('📊 LEDGER INFORMATION');
        console.log('📊'.repeat(20));
        console.log(`🌐 Network: mychannel`); // Fixed: directly use channel name
        console.log(`🔗 Channel: mychannel`);
        console.log(`🏢 Organization: org1.example.com`);
        console.log(`👤 Identity: User1@org1.example.com`);
        console.log('📊'.repeat(20) + '\n');

    } catch (error) {
        console.error('❌ Failed to get ledger info:', error.message);
    } finally {
        if (gateway) {
            await gateway.disconnect();
        }
    }
}

async function displayTransactionHistory(contract) {
    try {
        console.log('📜 TRANSACTION HISTORY');
        console.log('='.repeat(50));

        // Check if GetAssetHistory function exists by trying it once
        console.log('🔍 Checking for transaction history capability...\n');
        
        const allAssetsResult = await contract.evaluateTransaction('GetAllAssets');
        const assets = JSON.parse(allAssetsResult.toString());

        if (assets.length === 0) {
            console.log('📝 No transaction history available.\n');
            return;
        }

        // Test with first asset to see if GetAssetHistory is available
        let historyAvailable = false;
        try {
            await contract.evaluateTransaction('GetAssetHistory', assets[0].ID);
            historyAvailable = true;
        } catch (error) {
            if (error.message.includes('does not exist: GetAssetHistory')) {
                console.log('💡 Transaction history feature not available in current chaincode.');
                console.log('💡 The chaincode needs to implement GetAssetHistory function for historical data.');
                console.log('📝 Only current world state is available.\n');
                return;
            }
        }

        if (historyAvailable) {
            let transactionCount = 0;

            for (const asset of assets) {
                try {
                    console.log(`\n🔍 Transaction History for Asset: ${asset.ID}`);
                    console.log('-'.repeat(40));

                    const historyResult = await contract.evaluateTransaction('GetAssetHistory', asset.ID);
                    const history = JSON.parse(historyResult.toString());

                    if (history && history.length > 0) {
                        history.forEach((record, index) => {
                            console.log(`\n   📅 Transaction ${index + 1}:`);
                            console.log(`      🆔 TX ID: ${record.txId || 'N/A'}`);
                            console.log(`      ⏰ Timestamp: ${record.timestamp ? new Date(record.timestamp).toISOString() : 'N/A'}`);
                            console.log(`      🔄 Is Delete: ${record.isDelete ? 'Yes' : 'No'}`);
                            
                            if (record.asset && record.asset !== null) {
                                console.log(`      💾 Asset Data:`);
                                console.log(`         📋 ID: ${record.asset.ID || 'N/A'}`);
                                console.log(`         � GPA: ${record.asset.AppraisedValue || 'N/A'}`);
                                console.log(`         🏷️  Type: ${record.asset.Color || 'N/A'}`);
                                console.log(`         � Owner: ${record.asset.Owner || 'N/A'}`);
                                console.log(`         📏 Size: ${record.asset.Size || 'N/A'}`);
                            } else if (!record.isDelete) {
                                console.log(`      💾 Asset Data: Not available`);
                            }
                            transactionCount++;
                        });
                    } else {
                        console.log('   📝 No history found for this asset.');
                    }

                } catch (error) {
                    console.log(`   ❌ Error getting history for ${asset.ID}: ${error.message}`);
                }
            }

            console.log(`\n✅ Total Transactions Found: ${transactionCount}`);
        }

        console.log('='.repeat(50) + '\n');

    } catch (error) {
        console.log('❌ Error retrieving transaction history:', error.message);
        console.log('💡 Transaction history functionality may not be available.\n');
    }
}

// Main execution function
async function main() {
    await displayLedgerInfo();
    await displayLedger();
}

// Export functions for use in other modules
export { displayLedger, displayWorldState, displayTransactionHistory, displayLedgerInfo };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
