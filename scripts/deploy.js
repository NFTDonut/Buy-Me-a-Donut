const hre = require("hardhat");

async function main() {
    // Get contract to deploy and deploy
    const BuyMeADonut = await hre.ethers.getContractFactory("BuyMeADonut");
    const buyMeADonut = await BuyMeADonut.deploy();
    await buyMeADonut.deployed();
    console.log("BuyMeADonut deployed to ", buyMeADonut.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });