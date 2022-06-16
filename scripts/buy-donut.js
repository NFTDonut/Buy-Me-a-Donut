// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// Returns balance (in ETH) of given address
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from donut purchases
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

async function main() {
  // Get example accounts
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get contract to deploy and deploy
  const BuyMeADonut = await hre.ethers.getContractFactory("BuyMeADonut");
  const buyMeADonut = await BuyMeADonut.deploy();
  await buyMeADonut.deployed();
  console.log("BuyMeADonut deployed to ", buyMeADonut.address);

  // Check balances before donut purchase
  const addresses = [owner.address, tipper.address, buyMeADonut.address];
  console.log("== start ==");
  await printBalances(addresses);

  // Buy owner donuts
  const tip = {value: hre.ethers.utils.parseEther("1")};
  await buyMeADonut.connect(tipper).buyDonut("Bob", "I hope you like donuts!", tip);
  await buyMeADonut.connect(tipper2).buyDonut("Sarah", "Enjoy the donut!", tip);
  await buyMeADonut.connect(tipper3).buyDonut("Joe", "These donuts are expensive!", tip);

  // Check balances after donut purchase
  console.log("== bought donut ==");
  await printBalances(addresses);

  // Withdraw funds
  await buyMeADonut.connect(owner).withdrawTips();

  // Check balance after withdraw
  console.log("withdraw tips");
  await printBalances(addresses);

  // Read all memos left for the owner
  console.log("== memos ==");
  const memos = await buyMeADonut.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
