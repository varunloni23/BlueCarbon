const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;
  
  if (!privateKey || !rpcUrl) {
    console.error("Missing PRIVATE_KEY or RPC_URL in .env file");
    return;
  }
  
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("Wallet address from PRIVATE_KEY:", wallet.address);
  
  const balance = await wallet.getBalance();
  console.log("Current balance:", ethers.utils.formatEther(balance), "MATIC");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.log("⚠️  Low balance! Need more MATIC for transactions");
    console.log("🚿 Get test MATIC from: https://faucet.polygon.technology/");
    console.log("📋 Use this address in faucet:", wallet.address);
  } else {
    console.log("✅ Sufficient balance for transactions");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });