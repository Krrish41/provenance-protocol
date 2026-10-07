import hre from "hardhat";

async function main() {
  console.log("Deploying NFTMarketplace to SCAI network...");

  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();

  await marketplace.waitForDeployment();

  console.log(
    `NFTMarketplace deployed to: ${await marketplace.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
