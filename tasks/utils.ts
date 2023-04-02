// import { Contract, Signer } from "ethers"

// return: Promise<Contract>
// hre: Hardhat Runtime Environment (HRE)
// signer: Signer
export async function deployerContract(hre: any, nameContract: string, libraries = {},
    upgradable: boolean = false, upgradeOptions = {}, deployArgs: any[] = [], signer: any) {
    var contract;  // Contract
    var factoryOptions: object = {};
    if (signer === undefined) {
        factoryOptions = { libraries: libraries }
    } else {
        factoryOptions = { libraries: libraries, signer: signer };
    }
    const ContracT = await hre.ethers.getContractFactory(
        nameContract, factoryOptions);
    if (upgradable) {
        contract = await hre.upgrades.deployProxy(ContracT, upgradeOptions);
    } else {
        contract = await ContracT.deploy(...deployArgs);
    }

    await contract.deployed();

    return contract;
}

// accountCreator: Signer
// hre: Hardhat Runtime Environment (HRE)
export async function deployNew(hre: any, contractName: string, 
    deployArgs: any[] = [], signer: any) {
    let deployed = await deployerContract(hre, contractName, {}, false, {}, deployArgs,
        signer);
    return deployed ;
}