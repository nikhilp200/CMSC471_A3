/***** WHITE HAT VISUALIZATION: Scatter Plot *****/
d3.csv("data/census_tracts.csv").then(function(data) {
    data.forEach(function(d) {
      d.median_income = +d.median_income;
      d.median_home_value = +d.median_home_value;
    });
  
    var svg = d3.select("#white-hat svg"),
        margin = {top: 20, right: 30, bottom: 50, left: 60},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
  
    var g = svg.append("g")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    var x = d3.scaleLinear()
              .domain([0, d3.max(data, d => d.median_income)]).nice()
              .range([0, width]);
    var y = d3.scaleLinear()
              .domain([0, d3.max(data, d => d.median_home_value)]).nice()
              .range([height, 0]);
  
    g.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));
    g.append("g")
     .call(d3.axisLeft(y));
  
    svg.append("text")
       .attr("transform", "translate(" + (margin.left + width/2) + " ," + (height + margin.top + 40) + ")")
       .style("text-anchor", "middle")
       .text("Median Income (dollars)");
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", margin.left - 50)
       .attr("x", 0 - (height / 2) - margin.top)
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Median Home Value (dollars)");
  
    var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip");
  
    g.selectAll("circle")
     .data(data)
     .enter().append("circle")
       .attr("cx", d => x(d.median_income))
       .attr("cy", d => y(d.median_home_value))
       .attr("r", 4)
       .attr("fill", "steelblue")
       .on("mouseover", function(event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip.html("Census Tract: " + d.geoid + "<br/>" +
                       "Income: " + d.median_income + "<br/>" +
                       "Home Value: " + d.median_home_value)
                 .style("left", (event.pageX + 5) + "px")
                 .style("top", (event.pageY - 28) + "px");
       })
       .on("mouseout", function() {
          tooltip.transition().duration(500).style("opacity", 0);
       });
  });
  
  /***** BLACK HAT VISUALIZATION: Misleading Bar Chart *****/
  d3.csv("data/census_tracts.csv").then(function(data) {
    data.forEach(function(d) {
      d.total_population = +d.total_population;
    });
  
    data.sort((a, b) => b.total_population - a.total_population);
    var filteredData = data.slice(0, 10);
  
    var svg = d3.select("#black-hat svg"),
        margin = {top: 20, right: 30, bottom: 50, left: 60},
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
              .padding(0.1);
  
    g.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x));
    g.append("g")
     .call(d3.axisLeft(y));
  
    g.selectAll(".bar")
     .data(filteredData)
     .enter().append("rect")
       .attr("class", "bar")
       .attr("x", d => x(d.geoid))
       .attr("y", d => y(d.total_population))
       .attr("width", x.bandwidth())
       .attr("height", d => height - y(d.total_population))
       .attr("fill", "tomato")
       .append("title")  
       .text(d => "Population: " + d.total_population);
  });
  