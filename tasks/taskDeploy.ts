import chalk from 'chalk';
import { task } from 'hardhat/config';
import type { TaskArguments } from 'hardhat/types';

task('task:deployERC20').setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();
  const erc20Factory = await ethers.getContractFactory('EncryptedERC20');
  const encryptedERC20 = await erc20Factory.connect(signers[0]).deploy();
  await encryptedERC20.waitForDeployment();
  console.log('EncryptedERC20 deployed to: ', await encryptedERC20.getAddress());
});

task('task:deployIdentity').setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await ethers.getSigners();

  const identityRegistryFactory = await ethers.getContractFactory('IdentityRegistry');
  const identityRegistry = await identityRegistryFactory.connect(signers[0]).deploy();

  const erc20RulesFactory = await ethers.getContractFactory('ERC20Rules');
  const erc20Rules = await erc20RulesFactory.connect(signers[0]).deploy();
  await identityRegistry.waitForDeployment();
  await erc20Rules.waitForDeployment();

  const compliantERC20Factory = await ethers.getContractFactory('CompliantERC20');
  const compliantERC20 = await compliantERC20Factory
    .connect(signers[0])
    .deploy(await identityRegistry.getAddress(), await erc20Rules.getAddress());
  await compliantERC20.waitForDeployment();

  // const erc20RulesAddress = await await erc20Rules.getAddress();
  const registryAddress = await identityRegistry.getAddress();
  const erc20Address = await compliantERC20.getAddress();
  console.log(chalk.bold('Available methods:'));
  console.log(`npx hardhat task:identity:initRegistry --registry ${registryAddress}`);
  console.log(`npx hardhat task:identity:grantAccess --registry ${registryAddress} --erc20 ${erc20Address}`);
  console.log(`npx hardhat task:identity:mint --erc20 ${erc20Address}`);
  console.log(`npx hardhat task:identity:transfer --erc20 ${erc20Address} --from carol --to dave --amount 2000`);
  console.log(`npx hardhat task:identity:balanceOf --erc20 ${erc20Address} --user alice`);
});
