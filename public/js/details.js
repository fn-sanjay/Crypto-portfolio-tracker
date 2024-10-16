// // Sample price data structure
// const priceData = {
//   "7d": [
//     { time: 1609459200, price: 29000 },
//     { time: 1609545600, price: 29500 },
//     { time: 1609632000, price: 30000 },
//     { time: 1609718400, price: 31000 },
//     { time: 1609804800, price: 30500 },
//     { time: 1609891200, price: 32000 },
//     { time: 1609977600, price: 33000 },
//     { time: 1610064000, price: 34000 },
//   ],
//   // Add additional time frames if needed
// };

// // Function to create the SVG graph
// // Function to create the SVG graph
// function drawGraph(data) {
//   const svg = d3.select("#price-graph");
//   const width = 760; // Adjust as needed
//   const height = 500; // Adjust as needed
//   const padding = 20;

//   // Clear previous content
//   svg.selectAll("*").remove();

//   if (!data || !Array.isArray(data) || data.length === 0) {
//     console.error("Invalid data passed to drawGraph");
//     return;
//   }

//   // Parse time values for the x-axis
//   const timeParser = d3.timeFormat("%b %d"); // Format for date (e.g., "Jan 01")
//   const xScale = d3
//     .scaleTime()
//     .domain(d3.extent(data, (d) => new Date(d.time * 1000))) // Convert Unix to JS Date
//     .range([padding, width - padding]);

//   const yMin = d3.min(data, (d) => d.price);
//   const yMax = d3.max(data, (d) => d.price);
//   const yScale = d3
//     .scaleLinear()
//     .domain([yMin, yMax])
//     .range([height - padding, padding]);

//   // Add the x-axis with time labels
//   const xAxis = d3.axisBottom(xScale).tickFormat(timeParser);
//   svg
//     .append("g")
//     .attr("transform", `translate(0, ${height - padding})`)
//     .call(xAxis)
//     .selectAll("text")
//     .style("fill", "white");

//   // Add the y-axis with price labels on the right side
//   const yAxis = d3.axisRight(yScale).ticks(6);
//   svg
//     .append("g")
//     .attr("transform", `translate(${width - padding}, 0)`)
//     .call(yAxis)
//     .selectAll("text")
//     .style("fill", "white");

//   // Add labels for the x and y axes
// //   svg
// //     .append("text")
// //     .attr("x", width / 2)
// //     .attr("y", height - 5)
// //     .attr("text-anchor", "middle")
// //     .attr("font-size", "15px")
// //     .attr("fill", "white")
// //     .text("Time");

// //   svg.append("text")
// //   .attr("x", width - padding / 2)  // Positions the label on the right side of the SVG
// //   .attr("y", height /2)           // Centers the label vertically
// //   .attr("text-anchor", "middle")
// //   .attr("transform", `rotate(90, ${width - padding / 2}, ${height / 2})`) // Rotate around the label’s position
// //   .attr("font-size", "15px")
// //   .attr("fill", "white")
// //   .text("Price ($)");

// //   svg
// //     .append("text")
// //     .attr("x", 680) // Positioning near the right edge
// //     .attr("y", 50) // Centered vertically based on height
// //     .attr("text-anchor", "middle")
// //     .attr("transform", "rotate(90, 680, 150)") // Rotate around (680, 150)
// //     .attr("font-size", "15px")
// //     .attr("fill", "white")
// //     .text("Price ($)");

//   // Create line generator for data points
//   const line = d3
//     .line()
//     .x((d) => xScale(new Date(d.time * 1000)))
//     .y((d) => yScale(d.price));

//   svg
//     .append("path")
//     .datum(data)
//     .attr("fill", "none")
//     .attr("stroke", "green")
//     .attr("stroke-width", 2)
//     .attr("d", line);

//   // Add circles for each point on the line
//   svg
//     .selectAll("circle")
//     .data(data)
//     .enter()
//     .append("circle")
//     .attr("cx", (d) => xScale(new Date(d.time * 1000)))
//     .attr("cy", (d) => yScale(d.price))
//     .attr("r", 3)
//     .attr("fill", "green")
//     .on("mouseover", function (event, d) {
//       const tooltip = svg
//         .append("text")
//         .attr("x", xScale(new Date(d.time * 1000)))
//         .attr("y", yScale(d.price) - 10)
//         .attr("text-anchor", "middle")
//         .attr("fill", "white")
//         .text(`$${d.price}`);

//       this.onmouseout = () => tooltip.remove();
//     });
// }

// // Call drawGraph function with the 7d price data
// drawGraph(priceData["7d"]);


async function drawGraph() {
    const svg = d3.select("#price-graph");
    const width = 770; // Adjust as needed
    const height = 500; // Adjust as needed
    const padding = 20;
  
    // Clear previous content
    svg.selectAll("*").remove();
  
    // Fetch price data from the hosted API
    try {
    const response = await fetch('/details/bitcoin_data.json');// Ensure correct API path
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const jsonData = await response.json();
      
      // Access the prices data from the JSON structure
      const data = jsonData.chart.prices.map(d => ({
        time: d[0] / 1000, // Convert milliseconds to seconds
        price: d[1]
      }));
  
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("Invalid data passed to drawGraph");
        return;
      }
  
      // Parse time values for the x-axis
      const timeParser = d3.timeFormat("%b %d"); // Format for date (e.g., "Jan 01")
      const xScale = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => new Date(d.time * 1000))) // Convert Unix to JS Date
        .range([padding, width - padding]);
  
      const yMin = d3.min(data, (d) => d.price);
      const yMax = d3.max(data, (d) => d.price);
      const yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - padding, padding]);
  
      // Add the x-axis with time labels
      const xAxis = d3.axisBottom(xScale).tickFormat(timeParser);
      svg
        .append("g")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(xAxis)
        .selectAll("text")
        .style("fill", "white");
  
      // Add the y-axis with price labels on the right side
      const yAxis = d3.axisRight(yScale).ticks(6);
      svg
        .append("g")
        .attr("transform", `translate(${width - padding}, 0)`)
        .call(yAxis)
        .selectAll("text")
        .style("fill", "white");
  
      // Create line generator for data points
      const line = d3
        .line()
        .x((d) => xScale(new Date(d.time * 1000)))
        .y((d) => yScale(d.price));
  
      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", line);
  
      // Add circles for each point on the line
      svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(new Date(d.time * 1000)))
        .attr("cy", (d) => yScale(d.price))
        .attr("r", 3)
        .attr("fill", "green")
        .on("mouseover", function (event, d) {
          // Create a tooltip for displaying the price
          const tooltip = svg
            .append("text")
            .attr("x", xScale(new Date(d.time * 1000)))
            .attr("y", yScale(d.price) - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text(`$${d.price}`);
  
          // Remove tooltip on mouseout
          this.onmouseout = () => tooltip.remove();
        });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  // Call drawGraph function to fetch and display the price data
  drawGraph();
  

