
MapVis = function(_parentElement, _geoData, _data){

    parentElement1 = _parentElement;
    geoData = _geoData;
    rawData = _data;



    this.loadData();
}

MapVis.prototype.loadData = function() {
    var vis = this;

    MapVis.prototype.initVis();
};


MapVis.prototype.initVis = function() {
    var vis = this

    svgMap = d3.select("#" + parentElement1),
    margin = { top: 20, right: 20, bottom: 30, left: 40 },
        g2 = svgMap.append("g")






    zoom = d3.zoom()
        .scaleExtent([0, 0])
        .translateExtent([[0,0], [0, 0]])
        .extent([[0, 0], [0, 0]])
        .on("zoom", vis.zoomed);

    // Map and projection
    dataMap = d3.map();
    path = d3.geoPath();


    // Setup data arrays
    totalArray = [];
    stringArray = [];



    vis.updateVis();
};




MapVis.prototype.updateVis = function(){
    var vis = this;

    var bounds = svgMap.node().getBoundingClientRect(),
        width = bounds.width - margin.left - margin.right,
        height = bounds.height - margin.top - margin.bottom;




    svgMap.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

        .attr("transform", "translate(0,0)");






    //.attr("transform", "translate(150,0)");




    projection = d3.geoNaturalEarth()
        .scale(width / 3 / Math.PI)
        .translate([width / 2, height / 2])
    path.projection(projection);


    rawData.forEach(function(d) {
        dataMap.set(d["Country name"], +d.Count);
    });

    rawData.forEach(function (d, i) {
        d.Count = parseInt(d.Count);
    });


    // Calculate for legend
    totalSum = Math.round(d3.sum(rawData.map(function (d) {
        return d.Count
    })))

    totalPart = totalSum / 10;

    for (i = 1; i < 11; i++) {
        totalArray.push(Math.round(totalPart * i) + 20)
    }

    totalArray.forEach(function (d) {
        stringArray.push(d.toString())
    })

    newArray = [];

    totalArray.forEach(function (d) {
        newArray.push(d/3)
    })

    //Scale the data
    linearScale = d3.scaleLinear()
        .domain([d3.min(rawData, function(d) { return d.Count; }), d3.max(rawData, function(d) { return d.Count; })])
        .range([d3.min(rawData, function(d) { return d.Count; }), d3.max(rawData, function(d) { return d.Count; })]);




    // Data and color scale
    colorScale4 = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(rawData, function(d) { return d.Count; })]);
    var lowColor = '#f7fbff'
    var highColor = '#08306b'
    var ramp = d3.scaleLinear().domain([d3.min(rawData, function(d) { return d.Count; }),d3.max(rawData, function(d) { return d.Count; })]).range([lowColor,highColor])

    rounded_min = 0;
    rounded_max = Math.ceil(d3.max(rawData, function(d) { return d.Count; })/10000)*10000;





    var paths = svgMap.selectAll("path")
        .data(geoData.features)


    paths
        .enter().append("path").attr("class", "countries")
        .attr("fill", function (d){
            // Pull data for this country
            d.Count = dataMap.get(d.properties.name) || 0;
            // Set the color
            return ramp(d.Count);
        })
        .attr("d", path)
/*        .call(d3.zoom().on("zoom", function () {
            svgMap.attr("transform", d3.event.transform)
        }))*/
        .on("mouseover", function() { tooltip2.style("display", "block"); })
        .on("mouseout", function() { tooltip2.style("display", "none"); })
        .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 45;
            tooltip2.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip2.select("text").html("" +
                "<tspan x=\"0\" dy=\"1.2em\">"+ d.properties.name +"</tspan>\n" +
                "<tspan x=\"0\" dy=\"1.2em\">Count: "+ d.Count +"</tspan>");
        })


    // Prep the tooltip bits, initial display is hidden
    tooltip2 = svgMap.append("g")
        .style("display", "none");

    tooltip2.append("rect")
        .attr("width", 100)
        .attr("height", 40)
        .attr("class", "tooltip")


    tooltip2.append("text")
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr("font-size", "12px")

    paths
        .attr("fill", function (d){
            // Pull data for this country
            d.Count = dataMap.get(d.properties.name) || 0;
            // Set the color
            return ramp(d.Count);
        })
        .attr("d", path)
        // .call(d3.zoom().on("zoom", function () {
        //     svgMap.attr("transform", d3.event.transform)
        // }))




    var linear = d3.scaleLinear()
        .domain([0,rounded_max])
        .range([lowColor, highColor]);




    svgMap.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(20,20)");

    var legendLinear = d3.legendColor()
        .shapeWidth(30)
        .labelFormat(d3.format(".0f"))
        .orient('vertical')
        .scale(linear)
        .cells(7);

    svgMap.select(".legendLinear")
        .call(legendLinear);


}

MapVis.prototype.zoomed = function(){

    svgMap.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")


}


MapVis.prototype.highlightMap = function(_selected){

    var vis = this;

    selected = _selected;
    svgMap.selectAll("path")
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style("opacity", function (d) {
            if(d.properties.name == "") {
                return 0.8;
            }else
            if(d.properties.name == selected) {
                return 0.8;
            }else{
                return 0.1;
            }
        })

    piechart.showLabels(selected)



}




$(document).ready(function() {
    var vis = this;
    window.addEventListener("resize", MapVis.prototype.updateVis);

});