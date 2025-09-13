export function formatTransactionResult(result, operation, additionalData = {}) {
    const timestamp = new Date().toISOString();
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 TRANSACTION COMPLETED SUCCESSFULLY`);
    console.log('='.repeat(60));
    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`🔧 Operation: ${operation}`);
    
    if (additionalData.transactionId) {
        console.log(`🆔 Transaction ID: ${additionalData.transactionId}`);
    }
    
    // Parse and format the blockchain result
    let parsedResult;
    try {
        parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
    } catch (error) {
        parsedResult = result;
    }
    
    console.log('\n📊 BLOCKCHAIN ASSET DETAILS:');
    console.log('-'.repeat(40));
    
    if (parsedResult && typeof parsedResult === 'object') {
        if (parsedResult.ID) {
            console.log(`👤 Student ID: ${parsedResult.ID}`);
        }
        if (parsedResult.AppraisedValue) {
            console.log(`📈 GPA: ${parsedResult.AppraisedValue}`);
        }
        if (parsedResult.Color && parsedResult.Color !== 'student') {
            console.log(`🏷️  Type: ${parsedResult.Color}`);
        } else if (parsedResult.Color === 'student') {
            console.log(`🏷️  Asset Type: Student Record`);
        }
        if (parsedResult.Owner && parsedResult.Owner !== '50') {
            console.log(`👑 Owner: ${parsedResult.Owner}`);
        }
        if (parsedResult.Size && parsedResult.Size !== null) {
            console.log(`📏 Size: ${parsedResult.Size}`);
        }
    } else {
        console.log(`📄 Raw Result: ${result}`);
    }
    
    if (additionalData.id && additionalData.gpa) {
        console.log('\n✅ OPERATION SUMMARY:');
        console.log('-'.repeat(40));
        console.log(`Student ${additionalData.id} with GPA ${additionalData.gpa} has been successfully recorded on the blockchain.`);
    }
    
    console.log('\n🎉 Transaction has been committed to the ledger!');
    console.log('='.repeat(60) + '\n');
}

export function formatError(error, operation) {
    const timestamp = new Date().toISOString();
    
    console.log('\n' + '❌'.repeat(20));
    console.log(`🚨 TRANSACTION FAILED`);
    console.log('❌'.repeat(20));
    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`🔧 Operation: ${operation}`);
    console.log(`💥 Error: ${error.message}`);
    console.log('❌'.repeat(20) + '\n');
}
