# Cheaper Project

Marketplace project designed for challegen ---

# How to build

this code only works on node v14
to build this project first install the node parackages

```npm install .```

then compile contracts with hardhat

```npx hardhat compile```

you can run tests with

```npx hardhat test```

# envs

download .env files from shared drive, you need an .env file for deployment which should be in

```cheaper/.env```

and one .env for scripts in

```cheaper/scripts/.env```

# Deploy

to deploy just run the hardhat tast specifying the network, in this case, alfajores

```npx hardhat --network alfajores deployFactory```

it will print in console the address of the new deployed factory


# Queries example

on a new deploy first you need to run the initExample

```
cd scripts/
node initExample.js
```

then for testing queries you can just run

```
cd scripts/
node queries.js
```

remember to have the .env file updated with the factory address, rpc and accounts
