const d3 = require('d3');
const utils = require('./utils');

function bar_chart(layer, chart){
    
    let week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    let data = _xyz.locales[_xyz.locale].layers[layer].charts[chart];
    
    let div = utils.createElement('div');
    let td = utils.createElement('td', {
        colSpan: "2"
    });
    let tr = utils.createElement('tr');
    
    // Define the div for the tooltip
    let tltp = d3.select(div).append("div")	
    .attr("class", "chart-tooltip")				
    .style("opacity", 0);
    
    // set the dimensions of the canvas
    let margin = {top: 20, right: 10, bottom: 20, left: 30},
        width = 290 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;
    
    // set the ranges
    let x = d3.scaleBand().range([0, width]).round(0.05);
    let y = d3.scaleLinear().range([height, 0]);
    
    // define the axis
    let xAxis = d3.axisBottom(x);
    let yAxis = d3.axisLeft().scale(y);
    
    // add the SVG element
    //let svg = d3.select("body").append("svg")
    let svg = d3.select(div).append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // scale the range of the data
    x.domain(data.map(function(d){
        return d.x;
    }));
    y.domain([0, d3.max(data, function(d){
        return d.y ? d.y : 0; 
    })]);
    
    // append the rectangles for the bar chart d3 v4
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d){
            return x(d.x);
        })
        .attr("width", x.bandwidth())
        .attr("y", function(d){
            return y(d.y);
        })
        .attr("height", function(d){ 
            return height - y(d.y);
        })
        .on("mouseover", function(d){
            tltp.transition()
            .duration(200)
            .style("opacity", .9);
        
           tltp.html(d.y)
           .style("left", (d3.event.pageX - 18) + "px")
           .style("top", (d3.event.pageY - 20) + "px");
        }).on("mouseout", function(d){
           tltp.transition()
               .duration(500)
               .style("opacity", 0);
    });

    
      // add the x Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(function(d, i){
        return data.length == week.length ? week[d] : d;
    }));
    
    
       // text label for the x axis
    svg.append("text")             
      .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle");
    
      // add the y Axis
    svg.append("g").call(d3.axisLeft(y).tickFormat(function(d, i){
        return (d == Math.floor(d)) ? d : "";
    }));
    //.ticks(data.length));
    
     // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle");
    
    td.appendChild(div);
    tr.appendChild(td);
    return tr;
}

module.exports = {
    bar_chart: bar_chart
}