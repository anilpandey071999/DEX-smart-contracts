# Kyoto Swap Farms and Pools

<img alt="Solidity" src="https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black"/> <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>


This repo includes Farm and Pool Smart Contracts

## Prerequisites

-   git
-   npm
-   hardhat

## Getting started

-   Clone the repository

```sh
git clone https://gitlab.com/anil.p6/kyoto-smart-contracts.git
```

-   Navigate to `farm-pool` directory

```sh
cd farm-pool
```
### Configure project

-   Configure the .env

```sh
cp .example.env .env
```
-   Install dependencies

```sh
npm install
```

### Deploy to Blockchain Network

```sh
1. npx hardhat run --network <network-defined-in-hardhat.config> scripts/1_deployKSwapTokenAndMasterChefV1.ts
```
   * Copy the MasterChefV1 and KSWAP address from deployment and paste in .env
```sh
2. npx hardhat run --network <network-defined-in-hardhat.config> scripts/2_deployMasterChefV2.ts
```
   * Copy the MASTERCHEF_DUMMY_TOKEN and MasterChefV2 address from deployment and paste in .env
```sh
3. npx hardhat run --network <network-defined-in-hardhat.config> scripts/3_masterChefV2INIT.ts
```
   * Copy the DUMMY_KSWAP_POOL address from deployment and paste in .env
```sh
4. npx hardhat run --network <network-defined-in-hardhat.config> scripts/4_deployKSwapPool.ts
```

## Verify smart contracts

```sh
npx hardhat verify --network <network-name-in-hardhat-config> DEPLOYED_CONTRACT_ADDRESS "Constructor arguments"
```

## Run tests

```sh
npm test
```