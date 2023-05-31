const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8080');
// const provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/qfu3KPP1LckyT991B6o5SM9eK73EY2uu');
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
    alert('Account created successfully.');
    // show address
    addressElement = document.getElementById("address");
    addressElement.textContent = `Address: ${await signer.getAddress()}`;
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
      to,
      value: ethers.utils.parseEther(value),
      gasLimit: ethers.utils.hexlify(21000),
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
  const callData = document.getElementById('call-data');
  const to = toInput.value.trim();
  const value = valueInput.value.trim();
  if (!to || !value) {
    alert('Please enter a recipient address and a value.');
    return;
  }
  try {
    const tx = {
      to,
      value: ethers.utils.parseEther(value),
      data: callData,
      gasLimit: ethers.utils.hexlify(21000),
      nonce: await signer.getTransactionCount(),
    };
    const txResponse = await signer.sendTransaction(tx);
    alert(`Transaction sent successfully. Transaction hash: ${txResponse.hash}`);
  } catch (error) {
    alert(`Transaction failed. Error message: ${error.message}`);
  }
});

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
// updateBalance();
// setInterval(updateBalance, 10000);

// Update transaction list
const updateTransactionList = async () => {
  if (!signer) {
    return;
  }
  const address = signer.getAddress();
  const transactions = await provider.getTra(address);
  console.log(transactions)
  const transactionListElement = document.querySelector('#transaction-list tbody');
  transactionListElement.innerHTML = '';
  transactions.forEach((tx) => {
    const row = document.createElement('tr');
    const fromCell = document.createElement('td');
    fromCell.textContent = tx.from;
    const toCell = document.createElement('td');
    toCell.textContent = tx.to;
    const valueCell = document.createElement('td');
    const valueDisplay = ethers.utils.formatEther(tx.value);
    valueCell.textContent = `${valueDisplay} ETH`;
    row.appendChild(fromCell);
    row.appendChild(toCell);
    row.appendChild(valueCell);
    transactionListElement.appendChild(row);
  });
};
updateTransactionList();
setInterval(updateTransactionList, 10000);