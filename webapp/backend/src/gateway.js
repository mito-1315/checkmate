const { connect, signers } = require('@hyperledger/fabric-gateway');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const os = require('os');
const grpc = require('@grpc/grpc-js');
const crypto = require('crypto');

// Returns a signing implementation for the user's privateKeyPEM string.
async function newSigner(wallet, identityLabel) {
  const identity = await wallet.get(identityLabel);
  if (!identity || !identity.credentials || !identity.credentials.privateKey) {
    throw new Error(`No private key found for identity: ${identityLabel}`);
  }
  const privateKeyPEM = identity.credentials.privateKey;
  const privateKey = crypto.createPrivateKey(privateKeyPEM);
  
  // Use the fabric-gateway signer
  return signers.newPrivateKeySigner(privateKey);
}

async function connectGateway() {
  // Setup wallet and identity
  const walletPath = path.resolve('/home/mito/Documents/checkmate/webapp/backend/wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  
  console.log('Wallet path:', walletPath);
  const identities = await wallet.list();
  console.log('Wallet identities:', identities);

  const identityLabel = 'User1@org1.example.com'; // Use the identity enrolled in your wallet
  const identity = await wallet.get(identityLabel);

  if (!identity) {
    throw new Error(`Identity ${identityLabel} not found in wallet`);
  }
  
  console.log('Identity retrieved from wallet:', identity);
  
  // Generate signer from wallet identity
  const signer = await newSigner(wallet, identityLabel);

  // TLS root cert path
  const tlsCertPath = path.resolve(
    os.homedir(),
    'Documents',
    'checkmate',
    'fabric-samples',
    'fabric-samples',
    'test-network',
    'organizations',
    'peerOrganizations',
    'org1.example.com',
    'tlsca',
    'tlsca.org1.example.com-cert.pem'
  );

  // gRPC client connection setup
  const peerEndpoint = 'localhost:7051';
  const peerHostAlias = 'peer0.org1.example.com';

  const tlsCert = fs.readFileSync(tlsCertPath);

  const client = new grpc.Client(
    peerEndpoint,
    grpc.credentials.createSsl(tlsCert),
    {
      'grpc.ssl_target_name_override': peerHostAlias,
    }
  );

  console.log('Connecting with identity:', identity);
  console.log('Signer:', signer ? 'Signer function exists' : 'No signer');

  // Connect to gateway passing client, identity, and signer
  const gateway = connect({
    client,
    identity: {
      mspId: identity.mspId,
      credentials: Buffer.from(identity.credentials.certificate, 'utf8')
    },
    signer
  });

  return gateway;
}

module.exports = { connectGateway };
