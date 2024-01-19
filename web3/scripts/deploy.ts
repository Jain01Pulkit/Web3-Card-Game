import { ethers } from "hardhat";
import console from "console";
import dotenv from "dotenv";

dotenv.config();

const _metadataUri = `https://gateway.pinata.cloud/ipfs/https://gateway.pinata.cloud/ipfs/${process.env.IPFS_API_KEY}`;

async function deploy(name: string, ...params: [string]) {
  const contractFactory = await ethers.getContractFactory(name);

  return await contractFactory.deploy(...params).then((f) => f.deployed());
}

async function main() {
  const [admin] = await ethers.getSigners();

  console.log(`Deploying a smart contract...`);

  const AVAXGods = (await deploy("AVAXGods", _metadataUri)).connect(admin);

  console.log({ AVAXGods: AVAXGods.address });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
