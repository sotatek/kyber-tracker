const _ = require('lodash');

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io', 9000));

const abiDecoder = require('abi-decoder');
const kyberABI = require('../../config/abi/kyber');
const burnedFeeABI = require('../../config/abi/burned_fee');
abiDecoder.addABI(kyberABI);
abiDecoder.addABI(burnedFeeABI);

const network = require('../../config/network');
const tokens = network.tokens;
const contractAddresses = network.contractAddresses;
const tokensByAddress = _.keyBy(_.values(tokens), 'address');

module.exports = {

  getKyberABIDecoder: function() {
    return abiDecoder;
  },

  getWeb3Instance: function() {
    return web3;
  },

  getTokenFromAddress: function(address) {
    return tokensByAddress[address.toLowerCase()] || null;
  },

  getStringExp10: function(decimal) {
    return '1' + '0'.repeat(decimal);
  },

  getExchangeTopicHash: function() {
    return network.logTopics.exchange;
  },

  getFeeToWalletTopicHash: function() {
    return network.logTopics.feeToWallet;
  },

  getBurnFeesTopicHash: function() {
    return network.logTopics.burnFee;
  },

  getERC20TransferTopicHash: function () {
    return network.logTopics.erc20Transfer;
  },

  getKyberNetworkContractAddress: function() {
    return network.contractAddresses.network;
  },

  getKNCTokenAddress: function() {
    return network.tokens.KNC.address;
  },

  isBurnerContractAddress: function (addr) {
    if (!addr) {
      return false;
    }

    addr = addr.toLowerCase();

    return addr === contractAddresses.feeBurner1 || addr === contractAddresses.feeBurner2;
  },

};
