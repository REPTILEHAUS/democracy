// Test harness that relies on a fresh ganache running on 8555
// and keys saved to keys/ganache.test.json

assert = require('assert')
fs = require('fs')
Web3 = require('web3')
web3 = new Web3()

// Re-enable when you figure out what's wrong with programmatic
// ganache
//ganachelib = require('ganache-cli')
//KEYS_PATH="./keys/ganache.test.json"
//ganache = ganachelib.provider({account_keys_path: KEYS_PATH})
//web3.setProvider(ganache)

class TestHarness {
  constructor(contractName, network='test') {
    this.contractName = contractName;
    console.log(`CONTRACT NAME ${contractName}`)

    var output = JSON.parse(fs.readFileSync(`outputs/${contractName}.json`).toString())
    assert(output.code && output.abi)
    this.code = '0x' + output.code
    this.abi = output.abi
    //console.log(`ABI ${JSON.stringify(this.abi)}`)

    this.web3 = web3
    var config = require('config')[network]
    var endpoint = config['endpoint']
    this.gasLimit = config['gasLimit']
    this.gasPrice = config['gasPrice']
    web3.setProvider(new web3.providers.HttpProvider(endpoint))

    var keys = JSON.parse(fs.readFileSync(`keys/ganache.test.json`).toString()).addresses

    this.accounts = []
    //keys = ganache.manager.state.accounts

    for (var key in keys) {
      this.accounts.push(key)
    }
    this.coinbase = this.accounts[0]
    console.log(`First test key found (coinbase): ${this.coinbase}`);

  }

  // Takes a partial function that depends on a map of options
  // and we also add a callback that accepts (err, result) Node.js style
  runFunc(partial_func) {
    return new Promise((resolve, reject) => {
      partial_func({from: this.coinbase, gas: this.gasLimit, gasPrice: this.gasPrice},
        (err, result) => {
          if (err) { reject(err); }
          else {
            this.result = result
            resolve(this);
          } // keep passing the harness object
        });
      }
    );
  }

  deployPromise() {
    return new Promise((resolve, reject) => {
      web3.eth.contract(this.abi).new({data: this.code, from: this.coinbase, gas: this.gasLimit, gasPrice: this.gasPrice},
        (err, contract) => {
          if (err) {
            console.error("Error " + err);
            reject(err);
          } else if (contract.address) {
            console.log(`Contract ${this.contractName} deployed at ${contract.address}`)
            this.address = contract.address
            this.instance = web3.eth.contract(this.abi).at(this.address)
            resolve(this);
          }
        });
    });
  }

}

module.exports = TestHarness
