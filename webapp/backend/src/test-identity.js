const { Wallets } = require('fabric-network');
const path = require('path');

async function testGetIdentity() {
  const walletPath = path.resolve('/home/mito/Documents/checkmate/webapp/backend/wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  console.log('Wallet identities:', await wallet.list());

  const identityLabel = 'User1@org1.example.com';
  const identity = await wallet.get(identityLabel);

  if (!identity) {
    console.error(`Identity ${identityLabel} not found`);
    return;
  }

  console.log('Identity object:', identity);
}

testGetIdentity().catch(console.error);
