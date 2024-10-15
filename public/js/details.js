// Sample price data structure
const priceData = {
    "7d": [
        { "time": 1609459200, "price": 29000 },
        { "time": 1609545600, "price": 29500 },
        { "time": 1609632000, "price": 30000 },
        { "time": 1609718400, "price": 31000 },
        { "time": 1609804800, "price": 30500 },
        { "time": 1609891200, "price": 32000 },
        { "time": 1609977600, "price": 33000 },
        { "time": 1610064000, "price": 34000 }
    ],
    // Add additional time frames if needed
};

// Function to create the SVG graph
function drawGraph(data) {
    const svg = d3.select("#price-graph");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const padding = 20;

    // Clear previous content
    svg.selectAll("*").remove();

    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("Invalid data passed to drawGraph");
        return;
    }

    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([0, data.length - 1])
        .range([padding, width - padding]);

    // Calculate the y domain and ensure height is correctly calculated
    const yMin = d3.min(data, d => d.price);
    const yMax = d3.max(data, d => d.price);

    // Debugging y values
    console.log("yMin:", yMin, "yMax:", yMax);

    // Check if yMin and yMax are valid numbers
    if (isNaN(yMin) || isNaN(yMax) || yMin === yMax) {
        console.error("Invalid y domain:", yMin, yMax);
        return;
    }

    // Only set the range if yMin and yMax are valid numbers
    const yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height - padding, padding]); // Ensure ascending order

    // Debugging: Check scales
    console.log("xScale domain:", xScale.domain(), "range:", xScale.range());
    console.log("yScale domain:", yScale.domain(), "range:", yScale.range());

    // Create line generator
    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d.price));

    // Add the line to the SVG
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Create circles for each point
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => {
            const x = xScale(i);
            console.log(`Circle ${i}: cx=${x}`); // Debugging cx value
            return x;
        })
        .attr("cy", d => {
            const y = yScale(d.price);
            console.log(`Circle price=${d.price}, cy=${y}`); // Debugging cy value
            return y;
        })
        .attr("r", 3)
        .attr("fill", "red")
        .on("mouseover", function (event, d) {
            const tooltip = svg.append("text")
                .attr("x", xScale(data.indexOf(d)))
                .attr("y", yScale(d.price) - 10)
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .text(`$${d.price}`);

            this.onmouseout = () => tooltip.remove();
        });
}

// Call drawGraph function with the 7d price data
drawGraph(priceData["7d"]);
