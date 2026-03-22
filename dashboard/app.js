fetch("data.csv")
  .then(response => response.text())
  .then(csv => {
    // Split CSV into lines
    const lines = csv.split("\n").filter(line => line.trim() !== "");

    if (lines.length < 2) throw new Error("CSV is empty or missing data");

    // Extract headers
    const headers = lines[0]
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) // split by comma outside quotes
      .map(h => h.replace(/"/g, "").trim());   // remove quotes & trim

    // Identify the Value_IN column dynamically
    const valueColIndex = headers.findIndex(h => h.toLowerCase().includes("value_in"));
    if (valueColIndex === -1) throw new Error("Value_IN column not found!");

    // Parse rows
    const transactions = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i]
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(cell => cell.replace(/"/g, "").trim());

      const val = parseFloat(row[valueColIndex]);
      if (!isNaN(val)) {
        transactions.push({ value: val });
      }
    }

    // Total transactions
    const totalTx = transactions.length;
    document.getElementById("count").innerText = totalTx;

    // Total ETH
    const totalEth = transactions.reduce((sum, tx) => sum + tx.value, 0);

    // Dynamic display logic
    let displayValue;
    if (totalEth >= 0.0001) {
      // normal ETH
      displayValue = totalEth.toFixed(6) + " ETH";
    } else if (totalEth >= 0.0000001) {
      // tiny ETH → Gwei
      displayValue = (totalEth * 1e9).toFixed(4) + " Gwei";
    } else {
      // ultra tiny → wei
      displayValue = (totalEth * 1e18).toFixed(0) + " wei";
    }

    document.getElementById("totalEth").innerText = displayValue;

    console.log("Transactions loaded:", transactions);
  })
  .catch(err => {
    console.error("CSV load error:", err);
    document.getElementById("count").innerText = "Error";
    document.getElementById("totalEth").innerText = "Check Console";
  });