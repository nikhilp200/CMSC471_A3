/***** WHITE HAT VISUALIZATION: Scatter Plot *****/

  /***** BLACK HAT VISUALIZATION: Misleading Bar Chart *****/
d3.csv("data/census_tracts.csv").then(function(data) {
  data.forEach(function(d) {
    d.total_population = +d.total_population;
  });

  data.sort((a, b) => b.total_population - a.total_population);
  var filteredData = data.slice(0, 10);
  
  var svg = d3.select("#black-hat svg"),
      margin = {top: 50, right: 50, bottom: 70, left: 80},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var g = svg.append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var y = d3.scaleLinear()
            .domain([d3.min(filteredData, d => d.total_population), d3.max(filteredData, d => d.total_population)])
            .range([height, 0]);

  var x = d3.scaleBand()
            .domain(filteredData.map(d => d.geoid))
            .range([0, width])
            .padding(0.2);

  g.append("g")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x))
   .selectAll("text")
   .attr("transform", "rotate(-45)")
   .style("text-anchor", "end");

  g.append("g")
   .call(d3.axisLeft(y).ticks(5));

  svg.append("text")
     .attr("x", margin.left)
     .attr("y", margin.top - 20)
     .attr("class", "chart-title")
     .text("Dramatic Population Spike in Urban Areas");

  svg.append("text")
     .attr("transform", "translate(" + (margin.left + width / 2) + " ," + (height + margin.top + 65) + ")")
     .style("text-anchor", "middle")
     .attr("class", "axis-label")
     .text("Census Tract IDs (Top 10 High-Population Areas)");

  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", margin.left - 60)
     .attr("x", 0 - (height / 2) - margin.top)
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .attr("class", "axis-label")
     .text("Population Count (Misleading Scale)");

  g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(""));

  g.selectAll(".bar")
   .data(filteredData)
   .enter().append("rect")
     .attr("class", "bar")
     .attr("x", d => x(d.geoid))
     .attr("y", d => y(d.total_population))
     .attr("width", x.bandwidth())
     .attr("height", d => height - y(d.total_population))
     .attr("fill", "tomato")
     .style("opacity", 0.8) 
     .append("title")  
     .text(d => "Population: " + d.total_population + " (Dramatic Spike?)");
});
