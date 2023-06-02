const rpcUrl = 'https://agg-rpc-evm.web3-idea.xyz';
// const rpcUrl = 'http://127.0.0.1:8080';
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
let signer;

// Create account
const createAccountButton = document.getElementById('import-account');
createAccountButton.addEventListener('click', async () => {
  const privateKeyInput = document.getElementById('private-key');
  const privateKey = privateKeyInput.value.trim();
  if (!privateKey) {
    alert('Please import a private key.');
    return;
  }
  try {
    signer = new ethers.Wallet(privateKey, provider);
    // show address
    addressElement = document.getElementById("address");
    addressElement.textContent = `Address: ${await signer.getAddress()}`;
    // flush tx
    await updateTransactionList();
    alert('Account imported successfully.');
    createAccountButton.textContent = "Refresh Page";
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = `Please wait for a while, the data is loading...`;
    await updateBalance();
  } catch (error) {
    alert('Invalid private key.');
  }
});

// Send transaction
const sendTransactionButton = document.getElementById('send-transaction');
sendTransactionButton.addEventListener('click', async () => {
  if (!signer) {
    alert('Please import an account first.');
    return;
  }
  const toInput = document.getElementById('agg-to');
  const valueInput = document.getElementById('agg-value');
  const to = toInput.value.trim();
  const value = valueInput.value.trim();
  if (!to || !value) {
    alert('Please enter a recipient address and a value.');
    return;
  }
  try {
    const tx = {
      from: await signer.getAddress(),
      to: to,
      value: ethers.utils.parseEther(value),
      gasLimit: ethers.utils.hexlify(21000),
      gasPrice: await provider.getGasPrice(),
      nonce: await signer.getTransactionCount(),
    };
    const txResponse = await signer.sendTransaction(tx);
    alert(`Transaction sent successfully. Transaction hash: ${txResponse.hash}`);
  } catch (error) {
    alert(`Transaction failed. Error message: ${error.message}`);
  }
});

// Send contract transaction
const sendContractTransactionButton = document.getElementById('send-contract-transaction');
sendContractTransactionButton.addEventListener('click', async () => {
  if (!signer) {
    alert('Please import an account first.');
    return;
  }
  const toInput = document.getElementById('contract-to');
  const valueInput = document.getElementById('contract-value');
  const callDataInput = document.getElementById('call-data');
  const gasLimitInput = document.getElementById('gas-limit');
  const to = toInput.value.trim();
  const value = valueInput.value.trim();
  const callData = callDataInput.value.trim();
  const gasLimit = gasLimitInput.value.trim();
  if (!to || !value) {
    alert('Please enter a recipient address and a value.');
    return;
  }
  try {
    const tx = {
      from: await signer.getAddress(),
      to: to,
      value: ethers.utils.parseEther(value),
      data: callData,
      gasLimit: ethers.utils.hexlify(parseInt(gasLimit, 10)),
      gasPrice: await provider.getGasPrice(),
      nonce: await signer.getTransactionCount(),
    };
    const txResponse = await signer.sendTransaction(tx);
    alert(`Contract transaction sent successfully. Contract transaction hash: ${txResponse.hash}`);
  } catch (error) {
    alert(`Contract transaction failed. Error message: ${error.message}`);
  }
})

// Update balance
const updateBalance = async () => {
  if (!signer) {
    return;
  }
  const balance = await provider.getBalance(signer.getAddress());
  const balanceDisplay = ethers.utils.formatEther(balance);
  const balanceElement = document.getElementById('balance');
  balanceElement.textContent = `Balance: ${balanceDisplay} AGG`;
};
updateBalance();
setInterval(updateBalance, 10000);

// Update transaction list
let offset = 0;

const updateTransactionList = async () => {
  if (!signer) {
    return;
  }
  const address = await signer.getAddress();
  console.log(address);
  const data = {
    jsonrpc: "2.0",
    id: 1,
    method: "agg_getTx",
    params: [address, offset.toString(), "10"],
  };

  const transactionListElement = document.querySelector('#transaction-list tbody');
  transactionListElement.innerHTML = '';
  fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(response => response.json()).then(data => {
        console.log(data);
        data.result.forEach(e => {
          const row = document.createElement('tr');
          const evmTxHashCell = document.createElement('td');
          evmTxHashCell.textContent = e.tx_hash.substring(0,5)+"..."+e.tx_hash.substring(e.tx_hash.length-5,e.tx_hash.length);
          const fromCell = document.createElement('td');
          fromCell.textContent = e.tx_from;
          const toCell = document.createElement('td');
          toCell.textContent = e.tx_to;
          const valueCell = document.createElement('td');
          const valueDisplay = ethers.utils.formatEther(e.tx_value);
          valueCell.textContent = `${valueDisplay}`;
          const rawDataCell = document.createElement('td');
          rawDataCell.textContent = e.raw_data;
          row.appendChild(evmTxHashCell);
          row.appendChild(fromCell);
          row.appendChild(toCell);
          row.appendChild(valueCell);
          // row.appendChild(rawDataCell);
          transactionListElement.appendChild(row);
        })
      }
  ).catch(error => console.error(error));
};
