// Variables
const entriesPerPage = 25;
let currentPage = 1;
let cryptoData = []; // Declare a variable to hold the fetched data

// Fetch prices from the JSON file
async function fetchPrices() {
    try {
        const response = await fetch('/prices/prices.json'); // Adjust to your actual path
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        cryptoData = await response.json(); // Store the fetched data in the global variable

        // Sort the data by market cap in descending order
        cryptoData.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));

        renderTable(cryptoData, currentPage); // Render the data for the initial page
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Filter table function
function filterTable(event) {
    const searchTerm = event.target.value.toLowerCase(); // Get the search term
    const filteredData = cryptoData.filter(entry => 
        entry.name.toLowerCase().includes(searchTerm) || 
        entry.symbol.toLowerCase().includes(searchTerm)
    ); // Filter the data based on search term

    // Sort the filtered data
    filteredData.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        // Check if nameA starts with the search term
        const startsWithA = nameA.startsWith(searchTerm);
        const startsWithB = nameB.startsWith(searchTerm);
        
        // Sort by starting with search term first
        if (startsWithA && !startsWithB) {
            return -1; // A comes before B
        } else if (!startsWithA && startsWithB) {
            return 1; // B comes before A
        }

        // If both or neither start with the search term, sort by market cap
        if (a.market_cap !== b.market_cap) {
            return b.market_cap - a.market_cap; // Sort by market cap in descending order
        }

        // If market caps are equal, sort alphabetically
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });

    currentPage = 1; // Reset to the first page after filtering
    renderTable(filteredData, currentPage); // Render the filtered data
}

// Render table function
function renderTable(data, page) {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = ""; // Clear the existing table body

    // Calculate start and end index for pagination
    const start = (page - 1) * entriesPerPage; // Start index for the current page
    const end = Math.min(start + entriesPerPage, data.length); // End index for the current page

    // Populate the table body with current page data
    for (let i = start; i < end; i++) {
        const entry = data[i];
        const row = `
            <tr>
                <td>${i + 1}</td>
                <td>
                     <a href="details.html?id=${entry.id}" class="text-black">
                        <img src="${entry.image}" alt="${entry.name}" style="width:20px; height:20px;"> ${entry.name} (${entry.symbol})
            </a>
                </td>
                <td>₹ ${entry.current_price}</td>
                <td>₹ ${entry.high_24h ? entry.high_24h : 'N/A'}</td>
                <td>₹ ${entry.low_24h ? entry.low_24h : 'N/A'}</td>
                <td>₹ ${entry.total_volume}</td>
                <td>₹ ${entry.market_cap ? entry.market_cap : 'N/A'}</td>
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
    const prevButton = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Previous" onclick="changePage(${currentPage - 1})">
                &laquo; Previous
            </a>
        </li>
    `;
    pagination.innerHTML += prevButton;

    // Create page number buttons
    const visiblePages = 5; // Number of visible pages
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    // Adjust the start page if we are near the end
    if (endPage - startPage < visiblePages - 1) {
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    // Add "First Page" button
    const firstPageButton = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(1)">1</a>
        </li>
    `;
    pagination.innerHTML += firstPageButton;

    // Add dots before the first page if needed
    if (startPage > 2) {
        pagination.innerHTML += `<li class="page-item"><span class="page-link">...</span></li>`;
    }

    // Create page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = currentPage === i ? 'active' : '';
        pagination.innerHTML += `
            <li class="page-item ${activeClass}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    // Add dots after the last page if needed
    if (endPage < totalPages - 1) {
        pagination.innerHTML += `<li class="page-item"><span class="page-link">...</span></li>`;
    }

    // Add "Last Page" button
    if (totalPages > 1) {
        const lastPageButton = `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>
            </li>
        `;
        pagination.innerHTML += lastPageButton;
    }

    // Create Next button
    const nextButton = `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Next" onclick="changePage(${currentPage + 1})">
                Next &raquo;
            </a>
        </li>
    `;
    pagination.innerHTML += nextButton;
}

// Change page function
function changePage(page) {
    const totalPages = Math.ceil(cryptoData.length / entriesPerPage); // Calculate total pages based on fetched data
    if (page < 1 || page > totalPages) return; // Validate page number
    currentPage = page; // Update current page
    renderTable(cryptoData, currentPage); // Render the current page data
}

// Initial fetch and render
fetchPrices();


