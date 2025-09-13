const { connectGateway } = require('./gateway');

async function testGateway() {
  try {
    console.log('Testing gateway connection...');
    const gateway = await connectGateway();
    console.log('Gateway connected successfully!');
    
    console.log('Getting network...');
    const network = gateway.getNetwork('mychannel');
    console.log('Network obtained:', network ? 'Success' : 'Failed');
    
    console.log('Getting contract...');
    const contract = network.getContract('basic');
    console.log('Contract obtained:', contract ? 'Success' : 'Failed');
    
    console.log('Evaluating transaction...');
    const result = await contract.evaluateTransaction('GetAllAssets');
    const resultString = new TextDecoder().decode(result);
    console.log('Transaction result:', JSON.parse(resultString));
    
    
    gateway.close();
    console.log('Gateway closed successfully');
  } catch (error) {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  }
}

testGateway();