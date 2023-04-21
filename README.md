# Marketplace

This is the opensource marketplace contract developed by and used for [Kollection](https://kollection.app) NFT marketplace on Koinos.

## How does it work?

The tl;dr:

A user who wants to sell an NFT will first sign and broadcast an approval operation - this allows the marketplace contract to later execute a transfer on a particular NFT. After making the approval, a user will create a marketplace listing to sell their NFT for a specific amount of Koin. The marketplace listing can either have an expiration time or be unlimited. Another user can then purchase the NFT from the marketplace for the amount specified in the order. Upon executing a buy order the marketplace will take a set percentage fee and send that amount to a specified treasury account. If royalties are specified for the NFT collection then the marketplace will also take those fees and send them to the account specified as the recipient for royalties (up to a max of 10%). The remaining Koin goes to the user who made the sell order and the marketplace will transfer the NFT token to the buyer.

## Build
```sh
# build the debug version
yarn build:debug
# or
yarn exec koinos-sdk-as-cli build-all debug marketplace.proto 

# build the release version
yarn build:release
# or
yarn exec koinos-sdk-as-cli build-all release marketplace.proto 
```

## Test
```sh
yarn test
# or
yarn exec koinos-sdk-as-cli run-tests
```