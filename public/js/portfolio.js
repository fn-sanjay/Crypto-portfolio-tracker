const entriesPerPage = 5;
let currentPage = 1;
let cryptoData = [];


  



window.onload = function () {
    // Define your data points
    var dataPoints = [
      { y: 26, name: "Bitcoin", color: "#4CAF50" },
      { y: 20, name: "Ethereum", color: "#FF5722" },
      { y: 5, name: "BNB", color: "#FFC107" },
      { y: 3, name: "Chainlink", color: "#9C27B0" },
      { y: 7, name: "Dogecoin", color: "#2196F3" },
      { y: 17, name: "Solana", color: "#FFEB3B" },
      { y: 22, name: "Tether", color: "#673AB7" },
    ];
  
    // Calculate total percentage
    var totalPercentage = dataPoints.reduce((total, point) => total + point.y, 0);
  
    // Check if total percentage equals 100
    if (totalPercentage !== 100) {
      console.error("Error: Total percentage is " + totalPercentage + "%. It should equal 100%.");
    } else {
      // Find the maximum value in the data points and set exploded = true for it
      var maxDataPoint = dataPoints.reduce((max, point) => (point.y > max.y ? point : max), dataPoints[0]);
      maxDataPoint.exploded = true;
  
      var chart = new CanvasJS.Chart("chartContainer", {
        backgroundColor: "transparent",
        exportEnabled: true,
        animationEnabled: true,
        title: {
          text: "Total Market Value based on assets",
          fontColor: "#FFFFFF",
        },
        legend: {
          cursor: "pointer",
          itemclick: explodePie,
          fontColor: "#FFFFFF",
        },
        data: [
          {
            type: "pie",
            showInLegend: true,
            toolTipContent: "{name}: <strong>{y}%</strong>",
            indexLabel: "{name} - {y}%",
            indexLabelFontSize: 16,
            indexLabelFontFamily: "Arial",
            indexLabelFontWeight: "bold",
            indexLabelFontColor: "#FFFFFF",
            dataPoints: dataPoints, // Use the updated dataPoints array
          },
        ],
      });
      chart.render();
    }
  };
  
  // The explodePie function remains unchanged
  function explodePie(e) {
    e.dataSeries.dataPoints.forEach(function (point, index) {
      if (index === e.dataPointIndex) {
        point.exploded = !point.exploded;
      } else {
        point.exploded = false; // Unexplode others
      }
    });
    e.chart.render();
  }
  
  
  // The explodePie function remains unchanged
  function explodePie(e) {
    e.dataSeries.dataPoints.forEach(function (point, index) {
      if (index === e.dataPointIndex) {
        point.exploded = !point.exploded;
      } else {
        point.exploded = false; // Unexplode others
      }
    });
    e.chart.render();
  }
  
function explodePie(e) {
  if (
    typeof e.dataSeries.dataPoints[e.dataPointIndex].exploded === "undefined" ||
    !e.dataSeries.dataPoints[e.dataPointIndex].exploded
  ) {
    e.dataSeries.dataPoints[e.dataPointIndex].exploded = true;
  } else {
    e.dataSeries.dataPoints[e.dataPointIndex].exploded = false;
  }
  e.chart.render();
}

//Fetch prices is dummy function need to implement based on your database. remove the json

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

window.addEventListener("load", function () {
    // Assuming these values are retrieved from your data
    let investedValue = 100000; // 1 Lakh in INR
    let marketedValue = 80000; // 0.8 Lakh in INR, for example
  
    // Update the values in the HTML
    document.getElementById("investedValue").textContent = (investedValue / 100000) + " Lakh"; // Display in Lakhs
    document.getElementById("marketedValue").textContent = (marketedValue / 100000) + " Lakh"; // Display in Lakhs
  
    // Check if marketed value is lower than invested value
    if (marketedValue < investedValue) {
      // Change card class to text-bg-danger
      const absoluteGainCard = document.querySelector(".card.text-bg-success");
      absoluteGainCard.classList.remove("text-bg-success");
      absoluteGainCard.classList.add("text-bg-danger");
  
      // Change header text to "Absolute Loss"
      const absoluteGainHeader = document.getElementById("absoluteGainHeader");
      absoluteGainHeader.textContent = "Absolute Loss"; // Change header text
  
      // Calculate and update the absolute loss
      const absoluteLoss = ((investedValue - marketedValue) / 100000); // Calculate absolute loss in Lakhs
      const absoluteLossPercentage = ((absoluteLoss / (investedValue / 100000)) * 100).toFixed(2); // Calculate loss percentage
      document.getElementById("absoluteGain").textContent = absoluteLoss + " Lakh (" + absoluteLossPercentage + "% Loss)"; // Display absolute loss and percentage
    } else {
      // Calculate and update the absolute gain
      const absoluteGain = ((marketedValue - investedValue) / 100000); // Calculate absolute gain in Lakhs
      const absoluteGainPercentage = ((absoluteGain / (investedValue / 100000)) * 100).toFixed(2); // Calculate gain percentage
      document.getElementById("absoluteGain").textContent = absoluteGain + " Lakh (" + absoluteGainPercentage + "% Gain)"; // Display absolute gain and percentage
    }
  });

  window.addEventListener("load", function () {
    // Select all the cards
    const cards = document.querySelectorAll(".card");

    let maxWidth = 0;
    let maxHeight = 0;

    // Loop through each card to find the maximum width and height
    cards.forEach(function (card) {
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;

        if (cardWidth > maxWidth) {
            maxWidth = cardWidth;
        }

        if (cardHeight > maxHeight) {
            maxHeight = cardHeight;
        }
    });

    // Set all the cards to have the same max width and height
    cards.forEach(function (card) {
        card.style.width = maxWidth + "px";  // Set width to max width
        card.style.height = maxHeight + "px"; // Set height to max height
        card.style.display = "flex"; // Ensures proper flex layout
        card.style.flexDirection = "column"; // Aligns content vertically
        card.style.justifyContent = "center"; // Centers content vertically
        card.style.alignItems = "center"; // Centers content horizontally
        card.style.textAlign = "center"; // Ensures the text is centered
    });
});

  



