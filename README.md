# Cheaper Project

Marketplace project designed for challegen ---

# How to build

to build this project first install the node parackages

```npm install .```

then compile contracts with hardhat

```npx hardhat compile```

you can run tests with

```npx hardhat test```

# Deploy

to deploy just run the hardhat tast specifying the network, for example, to deploy on demoDober we run

```npx hardhat --network demoDober deployFactory```

it will print in console the address of the new deployed factory


# Queries example

to run the queries examples you must export and environment variable named `ACCOUNT_TEST` which containes your test accounts privatekeys in a single string, where each private key is separated by a single colon, no spaces.


then you can run the script by

```
cd scripts/
node queries.js
```

inside the script there are optional functions to deploy a token, which may helps to see some date on new deploys.
