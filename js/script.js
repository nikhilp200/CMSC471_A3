let censusData = [];
let selectedMetroArea = 'All';

const whiteHatMargin = { top: 20, right: 30, bottom: 50, left: 70 };
const whiteHatWidth = 800 - whiteHatMargin.left - whiteHatMargin.right;
const whiteHatHeight = 600 - whiteHatMargin.top - whiteHatMargin.bottom;

let whiteHatSvg = d3.select('#white-hat svg')
    .attr('width', whiteHatWidth + whiteHatMargin.left + whiteHatMargin.right)
    .attr('height', whiteHatHeight + whiteHatMargin.top + whiteHatMargin.bottom);

let whiteHatG = whiteHatSvg.append('g')
    .attr('transform', `translate(${whiteHatMargin.left},${whiteHatMargin.top})`);

let xScaleWhiteHat, yScaleWhiteHat;

// Define a color scale for metro areas
let colorScale;

function initWhiteHat() {
    d3.csv('data/census_tracts.csv', d => {
        return {
            geoid: d.geoid,
            metro_area: d.metro_area,
            median_income: +d.median_income,
            median_home_value: +d.median_home_value
        };
    }).then(data => {
        censusData = data;

        // Create color scale for metro areas
        const metroAreas = Array.from(new Set(censusData.map(d => d.metro_area)));
        metroAreas.sort();

        colorScale = d3.scaleOrdinal()
            .domain(metroAreas)
            .range(d3.schemeCategory10); // or use another color scale like d3.schemeSet3

        setupSelectorWhiteHat();
        updateAxesWhiteHat();
        updateVisWhiteHat();
    });
}

window.addEventListener('load', initWhiteHat);

// Setup metro area selector
function setupSelectorWhiteHat() {
    const metroAreas = Array.from(new Set(censusData.map(d => d.metro_area)));
    metroAreas.sort();

    // Add "All" option
    metroAreas.unshift("All");

    const dropdown = d3.select('#metroAreaSelector');
    dropdown.selectAll('option')
        .data(metroAreas)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);

    dropdown.on('change', function () {
        selectedMetroArea = this.value;
        updateAxesWhiteHat();
        updateVisWhiteHat();
    });
}

// Update axes
function updateAxesWhiteHat() {
    whiteHatG.selectAll('.axis').remove();
    whiteHatSvg.selectAll('.axis-label').remove();

    const filtered = selectedMetroArea === 'All'
        ? censusData
        : censusData.filter(d => d.metro_area === selectedMetroArea);

    xScaleWhiteHat = d3.scaleLinear()
        .domain([0, d3.max(filtered, d => d.median_income)]).nice()
        .range([0, whiteHatWidth]);

    yScaleWhiteHat = d3.scaleLinear()
        .domain([0, d3.max(filtered, d => d.median_home_value)]).nice()
        .range([whiteHatHeight, 0]);

    whiteHatG.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${whiteHatHeight})`)
        .call(d3.axisBottom(xScaleWhiteHat));

    whiteHatG.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(yScaleWhiteHat));

    whiteHatSvg.append("text")
        .attr("class", "axis-label")
        .attr("transform", `translate(${whiteHatMargin.left + whiteHatWidth / 2}, ${whiteHatHeight + whiteHatMargin.top + 40})`)
        .style("text-anchor", "middle")
        .text("Median Income (dollars)");

    whiteHatSvg.append("text")
        .attr("class", "axis-label")
        .attr("transform", `rotate(-90)`)
        .attr("y", whiteHatMargin.left - 70)
        .attr("x", 0 - (whiteHatHeight / 2) - whiteHatMargin.top)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Median Home Value (dollars)");
}

// Update visualization
function updateVisWhiteHat() {
    const filtered = selectedMetroArea === 'All'
        ? censusData
        : censusData.filter(d => d.metro_area === selectedMetroArea);

    const tooltip = d3.select("body").select(".tooltip").empty()
        ? d3.select("body").append("div").attr("class", "tooltip")
        : d3.select("body").select(".tooltip");

    const circles = whiteHatG.selectAll("circle")
        .data(filtered, d => d.geoid);

    circles.enter()
        .append("circle")
        .attr("cx", d => xScaleWhiteHat(d.median_income))
        .attr("cy", d => yScaleWhiteHat(d.median_home_value))
        .attr("r", 0)
        .attr("fill", d => colorScale(d.metro_area)) // Apply color based on metro area
        .on("mouseover", function (event, d) {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Census Tract: ${d.geoid}<br/>
                          Income: $${d.median_income}<br/>
                          Home Value: $${d.median_home_value}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .attr("r", 4);

    circles.transition()
        .duration(1000)
        .attr("cx", d => xScaleWhiteHat(d.median_income))
        .attr("cy", d => yScaleWhiteHat(d.median_home_value));

    circles.exit()
        .transition()
        .duration(500)
        .attr("r", 0)
        .remove();
}