//section 1
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const coinId = params.get("id");

  if (coinId) {
    // Fetch and store all market chart data at once
    const coinDetailsUrl = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    const marketChartUrls = {
      "7d": `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=inr&days=7`,
      "1m": `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=inr&days=30`,
      "3m": `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=inr&days=90`,
      "1yr": `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=inr&days=365`,
    };

    try {
      // Fetch all market chart data
      const marketChartPromises = Object.entries(marketChartUrls).map(([key, url]) =>
        fetch(url).then(response => response.json().then(data => localStorage.setItem(`${coinId}_marketChart_${key}`, JSON.stringify(data))))
      );

      await Promise.all(marketChartPromises);
      console.log("All market chart data stored in local storage.");

      // Fetch coin details and store in local storage
      const coinDetailsResponse = await fetch(coinDetailsUrl);
      const coinDetails = await coinDetailsResponse.json();
      localStorage.setItem(`${coinId}_details`, JSON.stringify(coinDetails));

      // Call drawGraph with the default timeframe (7d)
      drawGraph(coinId, '7d'); // Default to 7 days

      // Handle cryptocurrency description
      const storedDescription = localStorage.getItem(`${coinId}_description`);
      if (!storedDescription) {
        const descriptionResponse = await fetch(coinDetailsUrl);
        const descriptionData = await descriptionResponse.json();
        localStorage.setItem(`${coinId}_description`, JSON.stringify(descriptionData));
        document.getElementById("coin-description").innerHTML = descriptionData.description.en || "Description not available.";
      } else {
        const descriptionData = JSON.parse(storedDescription);
        document.getElementById("coin-description").innerHTML = descriptionData.description.en || "Description not available.";
      }
      
      // Set up button click events
      document.querySelectorAll('.btn-success').forEach(button => {
        button.addEventListener('click', () => {
          const timeframe = button.textContent.toLowerCase(); // Get button text (7d, 1m, 3m, 1yr)
          drawGraph(coinId, timeframe); // Update the graph based on the button clicked
        });
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
});

async function drawGraph(coinId,timeframe) {
  const svg = d3.select("#price-graph");
  const width = 770;
  const height = 400;
  const padding = 40;

  svg.selectAll("*").remove();

  console.log(`Coin ID passed to drawGraph: ${coinId}`);

  // Fetch market chart data from local storage
  const storedMarketChart = localStorage.getItem(`${coinId}_marketChart_${timeframe}`);
  console.log(`Stored market chart data for ${coinId}:`, storedMarketChart);

  if (!storedMarketChart) {
    console.error(`No market chart data found in local storage for ${coinId} with timeframe ${timeframe}`);
    return;
  }

  const marketChartData = JSON.parse(storedMarketChart);

  const pricesData = marketChartData.prices.map((d) => ({
    time: d[0] / 1000,
    price: d[1],
  }));

  const volumesData = marketChartData.total_volumes.map((d) => ({
    time: d[0] / 1000,
    volume: d[1],
  }));

  const data = pricesData.map((pricePoint, i) => ({
    ...pricePoint,
    volume: volumesData[i]?.volume || 0,
  }));

  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error("Invalid data passed to drawGraph");
    return;
  }

  // Calculate min and max prices for y-axis directly from data
  const minPrice = d3.min(data, (d) => d.price);
  const maxPrice = d3.max(data, (d) => d.price);

  console.log("Minimum Price:", minPrice);
  console.log("Maximum Price:", maxPrice);

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.time * 1000)))
    .range([padding, width - padding]);

  const uniqueDates = Array.from(
    new Set(data.map((d) => d3.timeFormat("%b %d")(new Date(d.time * 1000))))
  );

  // Set tick count based on unique dates
  const tickCount = Math.min(uniqueDates.length, 12);

  // Calculate the interval for y-axis scale
  const yRange = maxPrice - minPrice;
  const interval = yRange / 7; // Divide by 7 for 8 intervals between min and max

  // Generate yTicks with values below min and above max
  const yTicks = Array.from({ length: 8 }, (_, i) =>
    (minPrice + interval * i).toFixed(4)
  );
  yTicks.unshift((minPrice - interval).toFixed(4)); // Value below min
  yTicks.push((maxPrice + interval).toFixed(4)); // Value above max

  const yScale = d3
    .scaleLinear()
    .domain([parseFloat(yTicks[0]), parseFloat(yTicks[yTicks.length - 1])])
    .range([height - padding, padding]);

  svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "price-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%") // Vertical gradient
    .selectAll("stop")
    .data([
      { offset: "0%", color: "green", opacity: 0.5 },
      { offset: "100%", color: "green", opacity: 0 },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color)
    .attr("stop-opacity", (d) => d.opacity);

  const xAxis = d3
    .axisBottom(xScale)
    .ticks(tickCount)
    .tickFormat(d3.timeFormat("%b %d")); // Use detailed format

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis)
    .selectAll("text")
    .style("fill", "white");

  const yAxis = d3
    .axisRight(yScale)
    .tickValues(yTicks.map(parseFloat)) // Use our custom yTicks values
    .tickFormat((d) => d.toFixed(4)); // Format ticks to 4 decimal places

  svg
    .append("g")
    .attr("transform", `translate(${width - padding}, 0)`)
    .call(yAxis)
    .selectAll("text")
    .style("fill", "white");

  const line = d3
    .line()
    .x((d) => xScale(new Date(d.time * 1000)))
    .y((d) => yScale(d.price));

  // Draw the gradient-filled area under the line
  svg
    .append("path")
    .datum(data)
    .attr("fill", "url(#price-gradient)")
    .attr(
      "d",
      d3
        .area()
        .x((d) => xScale(new Date(d.time * 1000)))
        .y0(height - padding)
        .y1((d) => yScale(d.price))
    );

  // Draw the line
  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Tooltip logic
  const tooltipLine = svg
    .append("line")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("y1", padding)
    .attr("y2", height - padding)
    .style("opacity", 0);

  const tooltipBox = svg
    .append("foreignObject")
    .attr("width", 150)
    .attr("height", 100)
    .style("opacity", 0);

  const tooltipDiv = tooltipBox
    .append("xhtml:div")
    .style("background-color", "#333")
    .style("border-radius", "8px")
    .style("padding", "8px")
    .style("color", "white")
    .style("font-size", "12px")
    .style("pointer-events", "none");

  const pointerCircle = svg
    .append("circle")
    .attr("r", 5)
    .attr("fill", "lightblue")
    .style("opacity", 0);

  svg.on("mousemove", (event) => {
    const [x] = d3.pointer(event);
    const xTime = xScale.invert(x);

    const closestData = data.reduce((a, b) =>
      Math.abs(b.time - xTime.getTime() / 1000) <
      Math.abs(a.time - xTime.getTime() / 1000)
        ? b
        : a
    );

    const hoverX = xScale(new Date(closestData.time * 1000));
    const hoverY = yScale(closestData.price);

    tooltipLine.attr("x1", hoverX).attr("x2", hoverX).style("opacity", 1);
    pointerCircle.attr("cx", hoverX).attr("cy", hoverY).style("opacity", 1);

    tooltipBox
      .attr("x", hoverX + 10)
      .attr("y", hoverY - 40)
      .style("opacity", 1);

    tooltipDiv.html(`
      <div><strong>Time:</strong> ${d3.timeFormat("%b %d, %Y %H:%M")(
        new Date(closestData.time * 1000)
      )}</div>
      <div><strong>Price:</strong> ₹${closestData.price.toFixed(5)}</div>
      <div><strong>Volume:</strong> ₹${closestData.volume.toFixed(2)}</div>
    `);
  });

  svg.on("mouseleave", () => {
    tooltipLine.style("opacity", 0);
    tooltipBox.style("opacity", 0);
    pointerCircle.style("opacity", 0);
  });
}



//Section 2

// Get the coin ID from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const coinId = urlParams.get("id");

// Fetch coin data based on the ID
async function fetchCoinDetails() {
  try {
    const response = await fetch("/prices/prices.json"); // Adjust to your actual path
    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.statusText);
    }
    const cryptoData = await response.json(); // Fetch all cryptocurrency data

    // Find the coin details based on the ID
    const coinDetails = cryptoData.find((coin) => coin.id === coinId);

    // Display the coin details
    if (coinDetails) {
      document.getElementById("coin-name").textContent = coinDetails.name;
      document.getElementById("coin-image").src = coinDetails.image;
      document.addEventListener("DOMContentLoaded", () => {
        // Function to fetch and display cryptocurrency description
        function fetchDescription() {
          // Get the coin ID from the URL
          const urlParams = new URLSearchParams(window.location.search);
          const coinId = urlParams.get("id"); // Assuming the URL is like 'details.html?id=bitcoin'

          // Fetch description from local storage
          const storedDescription = localStorage.getItem(`${coinId}_details`);
          console.log(
            `Stored description data for ${coinId}:`,
            storedDescription
          );

          if (!storedDescription) {
            console.error(
              `No description found in local storage for ${coinId}`
            );
            document.getElementById("coin-description").innerText =
              "Description not available.";
            return;
          }

          const descriptionData = JSON.parse(storedDescription);

          // Extract the English description (you can change this to any language you prefer)
          const description =
            descriptionData.description.en || "Description not available.";

          // Display the description in the HTML
          document.getElementById("coin-description").innerHTML = description;
        }

        // Call the function to fetch and display the description
        fetchDescription();
      });
      
      document.getElementById(
        "coin-symbol"
      ).textContent = `Symbol: ${coinDetails.symbol}`;
      document.getElementById("coin-price").textContent = `Price: ${
        coinDetails.current_price ? `₹${coinDetails.current_price}` : "N/A"
      }`;
    } else {
      document.getElementById("coin-name").textContent = "Coin not found";
    }
  } catch (error) {
    console.error("Error fetching coin details:", error);
  }
}

// Call the function to fetch coin details
fetchCoinDetails();

async function fetchCryptoDetails() {
  try {
    const response = await fetch("/prices/prices.json"); // Adjust the path as necessary
    if (!response.ok) throw new Error("Network response was not ok");

    // const data = await response.json();
    // const coinDetails = cryptoData.find(coin => coin.id === coinId);
    const cryptoData = await response.json(); // Fetch all cryptocurrency data

    // Find the coin details based on the ID
    const coinDetails = cryptoData.find((coin) => coin.id === coinId);

    // Populate Section 2 with name, price, and symbol
    // document.getElementById("coin-name").innerText = data.name;
    // document.getElementById("current-price").innerText = `₹${data.current_price.toFixed(2)}`; // Assuming the price is in INR
    // document.getElementById("coin-symbol").innerText = data.symbol.toUpperCase();

    // Populate Section 3 with additional details
    document.getElementById("market_cap").innerText = `₹${
      coinDetails.market_cap ? coinDetails.market_cap.toFixed(4) : "N/A"
    }`;
    document.getElementById("market_cap_rank").innerText =
      coinDetails.market_cap_rank ? coinDetails.market_cap_rank : "N/A";
    document.getElementById("fully_diluted_valuation").innerText = `₹${
      coinDetails.fully_diluted_valuation
        ? coinDetails.fully_diluted_valuation.toFixed(4)
        : "N/A"
    }`;
    document.getElementById("total_volume").innerText = `₹${
      coinDetails.total_volume ? coinDetails.total_volume.toFixed(4) : "N/A"
    }`;
    document.addEventListener("DOMContentLoaded", () => {
      // Function to fetch and display cryptocurrency description
      function fetchDescription() {
        // Get the coin ID from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const coinId = urlParams.get("id"); // Assuming the URL is like 'details.html?id=bitcoin'

        // Fetch description from local storage
        const storedDescription = localStorage.getItem(`${coinId}_details`);
        console.log(
          `Stored description data for ${coinId}:`,
          storedDescription
        );

        if (!storedDescription) {
          console.error(`No description found in local storage for ${coinId}`);
          document.getElementById("coin-description").innerText =
            "Description not available.";
          return;
        }

        const descriptionData = JSON.parse(storedDescription);

        // Extract the English description (you can change this to any language you prefer)
        const description =
          descriptionData.description.en || "Description not available.";

        // Display the description in the HTML
        document.getElementById("coin-description").innerHTML = description;
      }

      // Call the function to fetch and display the description
      fetchDescription();
    });
    document.getElementById("price_change_24h").innerText = `${
      coinDetails.price_change_24h
        ? `₹${Math.abs(coinDetails.price_change_24h).toFixed(4)}`
        : "N/A"
    } (${
      coinDetails.price_change_percentage_24h
        ? coinDetails.price_change_percentage_24h.toFixed(4)
        : "N/A"
    }%)`;

    document.getElementById("market_cap_change_24h").innerText = `${
      coinDetails.market_cap_change_24h
        ? `₹${Math.abs(coinDetails.market_cap_change_24h).toFixed(4)}`
        : "N/A"
    } (${
      coinDetails.market_cap_change_percentage_24h
        ? coinDetails.market_cap_change_percentage_24h.toFixed(4)
        : "N/A"
    }%)`;

    document.getElementById("circulating_supply").innerText =
      coinDetails.circulating_supply ? coinDetails.circulating_supply : "N/A";
    document.getElementById("total_supply").innerText = coinDetails.total_supply
      ? coinDetails.total_supply
      : "N/A";
    document.getElementById("max_supply").innerText = coinDetails.max_supply
      ? coinDetails.max_supply
      : "N/A";
  } catch (error) {
    console.error("Error fetching crypto details:", error);
  }
}

fetchCryptoDetails();

// async function fetchCoinDescription() {
//   try {
//     const response = await fetch("/details/tron_data.json"); // Adjust the path as necessary
//     if (!response.ok) {
//       throw new Error("Network response was not ok: " + response.statusText);
//     }

//     const descriptionData = await response.json(); // Ensure this variable is defined
//     console.log("Fetched Description Data:", descriptionData); // Log the fetched data for debugging

//     // Access the description directly from the correct path
//     const descriptionDetails = descriptionData.details; // Get the details object

//     // Log the details to see its structure
//     console.log("Description Details:", descriptionDetails);

//     // Display the description in English if found
//     if (
//       descriptionDetails &&
//       descriptionDetails.description &&
//       descriptionDetails.description.en
//     ) {
//       document.getElementById("coin-description").innerHTML =
//         descriptionDetails.description.en;
//     } else {
//       document.getElementById("coin-description").textContent =
//         "Description not available";
//     }
//   } catch (error) {
//     console.error("Error fetching coin description:", error);
//   }
// }

// // Call the function to fetch the description
// fetchCoinDescription();

document.addEventListener("DOMContentLoaded", () => {
  // Function to fetch and display cryptocurrency description
  async function fetchDescription(coinId) {
      // Fetch description from local storage
      const storedDescription = localStorage.getItem(`${coinId}_description`);
      console.log(`Stored description data for ${coinId}:`, storedDescription);

      if (!storedDescription) {
          // If not found in local storage, fetch from the API
          console.log(`No description found in local storage for ${coinId}. Fetching from API...`);
          try {
              const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
              const data = await response.json();

              // Store the description in local storage
              localStorage.setItem(`${coinId}_description`, JSON.stringify(data));

              // Extract the English description
              const description = data.description.en || "Description not available.";
              
              // Display the description in the HTML
              document.getElementById("coin-description").innerHTML = description;
          } catch (error) {
              console.error("Error fetching description from API:", error);
              document.getElementById("coin-description").innerText = "Error fetching description.";
          }
      } else {
          const descriptionData = JSON.parse(storedDescription);

          // Extract the English description
          const description = descriptionData.description.en || "Description not available.";
          
          // Display the description in the HTML
          document.getElementById("coin-description").innerHTML = description;
      }
  }

  // Get the coin ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const coinId = urlParams.get("id"); // Assuming the URL is like 'details.html?id=bitcoin'

  // Call the function to fetch and display the description
  fetchDescription(coinId);
});





