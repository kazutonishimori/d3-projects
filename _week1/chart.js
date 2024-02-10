import * as d3 from "d3";

async function drawLineChart() {
    const dataset = await d3.json("./data/my_weather_data.json");
    console.log(dataset[0]);

    //set accessors
    const parseDate = d3.timeParse("%Y-%m-%d");
    const accessors = {
        yMax: d => d["temperatureMax"],
        yMin: d => d["temperatureMin"],
        yMean: d => (d["temperatureMax"] + d["temperatureMin"]) / 2,
        x: d => parseDate(d["date"]),
    };
    
    //set dimensions
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

    //create wrapper and bounds
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
    const yMaxExtent = d3.extent(dataset, accessors['yMax'])
    const yMinExtent = d3.extent(dataset, accessors['yMin']);
    const yScale = d3.scaleLinear()
        .domain(d3.extent([...yMaxExtent, ...yMinExtent]))
        .range([dimensions.boundedHeight, 0]);
    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, accessors['x']))
        .range([0, dimensions.boundedWidth]);  
    console.log(d3.extent(dataset, accessors['yMax']))

    //freezing temperature box
    const freezingTemperaturePlacement = yScale(32);
    /*const freezingTemperatures = bounds.append("rect")
        .attr("x", 0)
        .attr("width", dimensions.boundedWidth)
        .attr("y", freezingTemperaturePlacement)
        .attr("height", dimensions.boundedHeight - freezingTemperaturePlacement)
        .attr("fill", "#e0f3f3"); */
    const freezingTemperatureLine = bounds.append("line")
        .attr("x1", 0)
        .attr("x2", dimensions.boundedWidth)
        .attr("y1", freezingTemperaturePlacement)
        .attr("y2", freezingTemperaturePlacement)
        .attr("stroke", "#000000")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "10,20")
        .attr("opacity", 0.5);

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

    // Draw
    const lineGenerator = d3.line()
        .x(d => xScale(accessors['x'](d)))
    const maxLine = bounds.append("path")
        .datum(dataset) // Bind the dataset to the path
        .attr("d", lineGenerator.y(d => yScale(accessors['yMax'](d))))
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("class", "line")
        .attr("stroke", "url(#line-gradient)")
    const minLine = bounds.append("path")
        .datum(dataset) // Bind the dataset to the path
        .attr("d", lineGenerator.y(d => yScale(accessors['yMin'](d))))
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("class", "line")
        .attr("stroke", "url(#line-gradient)")

    const areaGenerator = d3.area()
        .x(d => xScale(accessors['x'](d)))
        .y0(d => yScale(accessors['yMin'](d)))
        .y1(d => yScale(accessors['yMax'](d)))  
    const area = bounds.append("path")
        .datum(dataset)
        .attr("d", areaGenerator)
        .attr("fill", "url(#line-gradient)")
        .attr("opacity", 0.1)

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