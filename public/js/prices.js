// Variables
const entriesPerPage = 25;
let currentPage = 1;

// Fetch prices from the JSON file
async function fetchPrices() {
    try {
        const response = await fetch('prices.json'); // Update this path to your actual prices.json file
        const cryptoData = await response.json();
        renderTable(cryptoData, currentPage); // Render the data
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Render table function
function renderTable(data, page) {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = ""; // Clear the existing table body

    // Calculate start and end index for pagination
    const start = (page - 1) * entriesPerPage;
    const end = Math.min(start + entriesPerPage, data.length);

    // Populate the table body with current page data
    for (let i = start; i < end; i++) {
        const entry = data[i];
        const row = `
            <tr>
                <td>${i + 1}</td>
                <td>
                    <img src="${entry.image}" alt="${entry.name}" style="width:20px; height:20px;"> ${entry.name} (${entry.symbol})
                </td>
                <td>${entry.current_price}</td>
                <td>${entry.high_24h ? entry.high_24h : 'N/A'}</td>
                <td>${entry.low_24h ? entry.low_24h : 'N/A'}</td>
                <td>${entry.total_volume}</td>
                <td>${entry.market_cap ? entry.market_cap : 'N/A'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    }
    renderPagination(data.length); // Update pagination
}

// Render pagination function
function renderPagination(totalEntries) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = ""; // Clear existing pagination

    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    // Create Previous button
    const prevButton = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" aria-label="Previous" onclick="changePage(${currentPage - 1})">
            <span aria-hidden="true">&laquo;</span>
        </a>
    </li>`;
    pagination.innerHTML += prevButton;

    // Create page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = currentPage === i ? 'active' : '';
        pagination.innerHTML += `<li class="page-item ${activeClass}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        </li>`;
    }

    // Create Next button
    const nextButton = `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" aria-label="Next" onclick="changePage(${currentPage + 1})">
            <span aria-hidden="true">&raquo;</span>
        </a>
    </li>`;
    pagination.innerHTML += nextButton;
}

// Change page function
function changePage(page) {
    const totalPages = Math.ceil(data.length / entriesPerPage);
    if (page < 1 || page > totalPages) return; // Validate page number
    currentPage = page;
    renderTable(data, currentPage); // Render the current page data
}

// Initial fetch and render
fetchPrices();
