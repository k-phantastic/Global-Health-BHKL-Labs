// Import d3 
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Similar CSV load function as recent lab
async function loadData() {
    const numericFields = [
        "Fertility_Rate", "Urban_Population_Percent", "Total_Population",
        "Water_Access_Percent", "Unemployment_Rate", "Sanitary_Expense_Per_GDP",
        "Life_Expectancy", "Life_Expectancy_Female", "Life_Expectancy_Male",
        "Infant_Deaths", "GDP_Per_Capita", "Hospital_Beds_Per_1000",
        "Female_Population", "Male_Population", "Alcohol_Consumption_Per_Capita",
        "Immunization_Rate", "Sanitary_Expense_Per_Capita", "CO2_Exposure_Percent",
        "Air_Pollution", "Labour_Force_Total", "Tuberculosis_Per_100000",
        "Suicide_Rate_Percent", "Obesity_Rate_Percent", "Underweight_Rate_Percent",
        "Overweight_Rate_Percent", "Safe_Water_Access_Percent", "log_GDP_Per_Capita",
        "Life_Expectancy_Score", "log_GDP_Per_Capita_Score",
        "Safe_Water_Access_Percent_Score", "Unemployment_Rate_Score",
        "Immunization_Rate_Score", "Aggregate_Score"
    ];
    const parseYear = d3.timeParse("%Y");

    const data = await d3.csv("data/global_health_with_index.csv", (row) => {
        numericFields.forEach(f => {
        row[f] = +row[f];
        });
        return {
        ...row,
        Year: parseYear(row.Year),
        Country: row.Country?.trim?.() || "",
        };
    });

    return data;
}

// Create scatter plot, also similar to prev lab
function renderScatterPlot(data) {
    // Set up SVG and dimensions
    const width = 1000;
    const height = 600; 

    // Margin and usable area 
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };
    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`) 
        .style('overflow', 'visible');
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.log_GDP_Per_Capita))
        .range([usableArea.left, usableArea.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Life_Expectancy))
        .range([usableArea.bottom, usableArea.top])
        .nice();

    const [minLines, maxLines] = d3.extent(data, d => d.Total_Population);
    const rScale = d3
        .scaleSqrt() // Change only this line
        .domain([minLines, maxLines])
        .range([2, 30]);

    // // Add gridlines BEFORE the axes
    // const gridlines = svg
    //     .append('g')
    //     .attr('class', 'gridlines')
    //     .attr('transform', `translate(${usableArea.left}, 0)`);

    // // Create gridlines as an axis with no labels and full-width ticks
    // gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
    
    // Axis creation
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${usableArea.bottom})`)
        .call(xAxis);
    svg.append("g")
        .attr("transform", `translate(${usableArea.left}, 0)`)
        .call(yAxis);
    
    // Filter data for a specific year (e.g., 2020)
    const currentYear = 2020;
    const yearData = data.filter(d => d.Year.getFullYear() === currentYear);
    
    // Plot data points 
    const dots = svg.append('g').attr('class', 'dots');
    const sortedData = d3.sort(yearData, d => -d.Total_Population);

    let colorScale = d3.scaleOrdinal(d3.schemePastel1);


    dots.selectAll("circle")
        .data(sortedData)
        .join("circle")
        .attr("cx", d => xScale(d.log_GDP_Per_Capita))
        .attr("cy", d => yScale(d.Life_Expectancy))
        .attr("r", d => rScale(d.Total_Population))
        .attr("fill", d => colorScale(d.Country))
        .attr("fill-opacity", 0.7)
        .on("mouseenter", (event, d) => {
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr("fill-opacity", 1)
                .attr("stroke", "#333")
                .attr("stroke-width", 1);
            renderTooltipContent(d);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
            })
        .on("mouseleave", (event) => {
            d3.select(event.currentTarget)
                .transition().duration(200)
                .attr("fill-opacity", 0.7)
                .attr("stroke-width", 0);
                updateTooltipVisibility(false);
        });
}

// Initializations 
const data = await loadData();
renderScatterPlot(data);