// Process data based on selected max count and job levels
function processData() {
    const jobLevelsInput = document.getElementById("jobLevels").value.trim();
    const jobLevels = jobLevelsInput ? jobLevelsInput.split(",").map(Number) : [];

    const bulkDataInput = document.getElementById("bulkDataInput").value.trim();
    if (!bulkDataInput) {
        alert("Please paste data into the input field.");
        return;
    }

    const data = bulkDataInput.split("\n").map(line => {
        const [company, personID, jobLevel] = line.split("\t").map(item => item.trim());
        return {
            company,
            personID,
            jobLevel: jobLevel ? parseInt(jobLevel) : null
        };
    });

    const maxCount = generateOutputCounts(data); // Prompt user for max count
    if (isNaN(maxCount) || maxCount < 1) {
        alert("Invalid max count selected.");
        return;
    }

    const processedData = processByCompany(data, maxCount, jobLevels);
    displayProcessedData(processedData);
}

// Generate output counts for different max counts
function generateOutputCounts(data) {
    const jobLevelsInput = document.getElementById("jobLevels").value.trim();
    const jobLevels = jobLevelsInput ? jobLevelsInput.split(",").map(Number) : [];
    const outputCounts = {};

    for (let maxCount = 1; maxCount <= 10; maxCount++) {
        const dict = {};
        let count = 0;

        data.forEach(row => {
            const { company, jobLevel } = row;
            if (jobLevels.length && jobLevel !== null && !jobLevels.includes(jobLevel)) {
                return;
            }
            if (!dict[company]) {
                dict[company] = 1;
                count++;
            } else if (dict[company] < maxCount) {
                dict[company]++;
                count++;
            }
        });

        outputCounts[maxCount] = count;
    }

    const userMaxCount = prompt(
        "Output Counts (Max Count 1 to 10):\n" +
        Object.entries(outputCounts)
            .map(([maxCount, count]) => `Max Count ${maxCount}: ${count} Person_ID(s)`)
            .join("\n") +
        "\n\nEnter the Max Count you want:"
    );
    return parseInt(userMaxCount);
}

// Process data grouped by company
function processByCompany(data, maxCount, jobLevels) {
    const companyData = data.reduce((acc, row) => {
        if (!acc[row.company]) acc[row.company] = [];
        acc[row.company].push(row);
        return acc;
    }, {});

    const processedData = [];
    for (const company in companyData) {
        const rows = companyData[company].filter(row => !jobLevels.length || jobLevels.includes(row.jobLevel));
        let count = 0;

        rows.sort((a, b) => a.jobLevel - b.jobLevel);
        for (let i = 0; i < rows.length && count < maxCount; i++) {
            processedData.push(rows[i]);
            count++;
        }
    }

    return processedData;
}

// Display processed data in a table
function displayProcessedData(data) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "";
    const table = document.createElement("table");
    table.innerHTML = `
        <tr>
            <th>Company_ID</th>
            <th>Person_ID</th>
            <th>Job_Level</th>
        </tr>
    `;
    data.forEach(row => {
        const rowElement = document.createElement("tr");
        rowElement.innerHTML = `
            <td>${row.company}</td>
            <td>${row.personID}</td>
            <td>${row.jobLevel !== null ? row.jobLevel : ""}</td>
        `;
        table.appendChild(rowElement);
    });
    outputDiv.appendChild(table);

    // Export to Excel button
    const exportButton = document.createElement("button");
    exportButton.textContent = "Export to Excel";
    exportButton.onclick = () => exportToExcel(data);
    outputDiv.appendChild(exportButton);
}

// Export data to a CSV file
function exportToExcel(data) {
    const rows = [["Company_ID", "Person_ID", "Job_Level"]];
    data.forEach(row => rows.push([row.company, row.personID, row.jobLevel || ""]));
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "processed_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Reset input fields and output
function resetData() {
    document.getElementById("jobLevels").value = "";
    document.getElementById("bulkDataInput").value = "";
    document.getElementById("output").innerHTML = "";
    document.getElementById("splitOutput").innerHTML = "";
}
