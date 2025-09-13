const { Wallets } = require('fabric-network');
const path = require('path');
async function testWallet() {
  const walletPath = path.resolve(process.cwd(), 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log('Wallet setup complete');
}
testWallet();
