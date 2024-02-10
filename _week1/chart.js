import * as d3 from "d3";

async function drawLineChart() {
    const dataset = await d3.json("./data/my_weather_data.json");
    console.log(dataset[0]);
    const yAccessor = d => d["temperatureMax"];
    const parseDate = d3.timeParse("%Y-%m-%d");
    const xAccessor = d => parseDate(d["date"]);

    const accessors = {
        max: d => d["temperatureMax"],
        min: d => d["temperatureMin"],
        mean: d => (d["temperatureMax"] + d["temperatureMin"]) / 2
    };
    

    let dimensions = {
        width: window.innerWidth * 0.9,
        height: 400,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60,
        }
    };
    dimensions.boundedWidth = dimensions.width
        - dimensions.margin.left
        - dimensions.margin.right;  
    dimensions.boundedHeight = dimensions.height
        - dimensions.margin.top
        - dimensions.margin.bottom; 

    const wrapper = d3.select("#wrapper")
    const svg = wrapper.append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    const bounds = svg.append("g")
        .style("transform", `translate(${
            dimensions.margin.left
        }px, ${
            dimensions.margin.top
        }px)`);

        // set scales
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .range([dimensions.boundedHeight, 0]);
    const freezingTemperaturePlacement = yScale(32);
    const freezingTemperatures = bounds.append("rect")
        .attr("x", 0)
        .attr("width", dimensions.boundedWidth)
        .attr("y", freezingTemperaturePlacement)
        .attr("height", dimensions.boundedHeight - freezingTemperaturePlacement)
        .attr("fill", "#e0f3f3");


    // Set the gradient
    svg.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", dimensions.boundedHeight)
        .attr("x2", 0)
        .attr("y2", 0)
        .selectAll("stop")
        .data([
            {offset: "0%", color: "blue"},
            {offset: "100%", color: "red"}
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });
        
    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, xAccessor))
        .range([0, dimensions.boundedWidth]);    
    const lineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)));

    const line = bounds.append("path")
        .datum(dataset) // Bind the dataset to the path
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("stroke", "url(#line-gradient)")

   




    
    const yAxisGenerator = d3.axisLeft()        
        .scale(yScale);
    const yAxis = bounds.append("g")    
        .call(yAxisGenerator);
    const xAxisGenerator = d3.axisBottom()
        .scale(xScale);
    const xAxis = bounds.append("g")
        .call(xAxisGenerator)
        .style("transform", `translateY(${
            dimensions.boundedHeight
        }px)`);
}

drawLineChart()