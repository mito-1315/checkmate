const express = require('express');
const router = express.Router();
const { connectGateway } = require('./gateway');

router.get('/assets', async (req, res) => {
  try {
    const gateway = await connectGateway();
    const network = gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');
    const result = await contract.evaluateTransaction('GetAllAssets');
    gateway.close();
    
    // Properly decode the result from the new fabric-gateway
    const resultString = new TextDecoder().decode(result);
    const assets = JSON.parse(resultString);
    
    res.json(assets);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

module.exports = router;
