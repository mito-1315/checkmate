const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
  const walletPath = path.join(process.cwd(), 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // Paths to crypto materials
  const credPath = path.resolve(
    '/home/mito/Documents/checkmate/fabric-samples/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp'
  );
  const certPath = path.join(credPath, 'signcerts', 'cert.pem');
  const keyDir = path.join(credPath, 'keystore');
  const keyPath = fs.readdirSync(keyDir)[0]; // get first key file

  const certificate = fs.readFileSync(certPath).toString();
  const privateKey = fs.readFileSync(path.join(keyDir, keyPath)).toString();

  const identity = {
    credentials: {
      certificate,
      privateKey,
    },
    mspId: 'Org1MSP',
    type: 'X.509',
  };

  // Import identity into wallet
  await wallet.put('User1@org1.example.com', identity);
  console.log('Identity imported into wallet');
}

main().catch(console.error);
