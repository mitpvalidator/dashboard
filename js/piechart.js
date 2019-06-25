Piechart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.rawData = _data;


    this.loadData();
}

Piechart.prototype.loadData = function() {
    var vis = this;

    vis.initVis();


};
Piechart.prototype.midAngle = function(d) {

    return d.startAngle + (d.endAngle - d.startAngle) / 2;
}


Piechart.prototype.initVis = function() {
    var vis = this
    // SVG drawing area
    vis.margin = {top: 0, right: 60, bottom: 60, left: 60
    };

    vis.width = 450 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom,
        vis.radius = Math.min(vis.width, vis.height) / 2;

    vis.svgChart = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 250 + "," + (vis.height - 100) + ")");

    vis.svgChart.append('g').classed('labels',true);
    vis.svgChart.append('g').classed('lines',true);

    vis.result = {};
    vis.selected;

    // Map and projection
    vis.data2 = d3.map();

    vis.pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.Count;
        });


    vis.CountArray = [];
    vis.rawData.forEach(function(d) {
        vis.data2.set(d["Country name"], +d.Count);
    });

    vis.arc = d3.arc()
        .innerRadius(vis.radius*0.5)
        .outerRadius(vis.radius*0.2);

    vis.outerArc = d3.arc()
        .outerRadius(vis.radius * 0.6)
        .innerRadius(vis.radius * 0.7);

    vis.color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888"]);

    // Data and color scale
    vis.colorScheme = d3.schemeReds[9];
    vis.colorScheme.unshift("#eee")
    vis.colorScale = d3.scaleThreshold()
        .domain([1,4])
        .range(vis.colorScheme);

    vis.colorScale4 = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 100]);

    //!* For the drop shadow filter... *!//
    vis.defs = vis.svgChart.append("defs");

    vis.filter = vis.defs.append("filter")
        .attr("id", "dropshadow")

    vis.filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 1)
        .attr("result", "blur");
    vis.filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 1)
        .attr("dy", 1)
        .attr("result", "offsetBlur");

    vis.feMerge = vis.filter.append("feMerge");

    vis.feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    vis.feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");


    vis.svgChart.append("text")
        .attr("y", -7)
        .attr("x", -9)
        .attr("dy", "1em")
        .attr("id", "prct")
        .style("opacity", 0.4)
        .style("font-weight", "bold")

    vis.updateVis();
};




Piechart.prototype.updateVis = function(){
    var vis = this;

    vis.totalSum = Math.round(d3.sum(vis.rawData.map(function (d) {
        return d.Count
    })))

    vis.g = vis.svgChart.selectAll(".arc")
        .data(vis.pie(vis.data))
        .enter().append("g")
        .attr("class", "arc")
        .on("mouseout", function(d){
            vis.reset();
            mapVis.reset();
        })


    vis.g.append("path")
        .attr("d", vis.arc)
        .style("fill", function (d) {
            return vis.colorScale4(d.data.Count*2);
        })
        .attr("filter", "url(#dropshadow)")
        .style("opacity", 0.8)
        .on("mouseover", function(d){
            vis.selected = d.data["Country name"];
            vis.value = d.value;
            vis.showLabels(vis.selected);
            mapVis.highlightMap(vis.selected);
            $("#prct").html(function(d) {
                return Math.round((vis.value/vis.totalSum) * 100) + "%";

            });


        })
        .on("mouseout", function(d){
            vis.selected = d.data["Country name"];
            vis.showLabels(vis.selected);
        })
        .on("click", function(d){
            vis.selected = d.data["Country name"];
            vis.showLabels(vis.selected);
        });

    vis.polyline = vis.svgChart.select('.lines')
        .selectAll('polyline')
        .data(vis.pie(vis.data))
        .enter().append('polyline')
        .attr('points', function (d) {
            vis.pos = vis.outerArc.centroid(d);
            vis.pos[0] = vis.radius * 0.70 * (vis.midAngle(d) < Math.PI ? 1 : -1);
            return [vis.arc.centroid(d), vis.outerArc.centroid(d), vis.pos];

        })


    vis.label = vis.svgChart.select('.labels').selectAll('text')
        .data(vis.pie(vis.data))
        .enter().append('text')
        .attr('dy', '.35em')
        .attr('class', 'pie-labels')
        .html(function (d, i) {
            return vis.data[i]["Country name"];
        })
        .attr('transform', function (d) {
            vis.pos = vis.outerArc.centroid(d);
            vis.pos[0] = vis.radius * 0.73 * (vis.midAngle(d) < Math.PI ? 1 : -1);
            return 'translate(' + vis.pos + ')';
        })
        .style('text-anchor', function (d) {
            return (vis.midAngle(d)) < Math.PI ? 'start' : 'end';
        });



/*    vis.svgChart.enter().append("text")
        .data(vis.pie(vis.data))
        .attr("id", "p")
        .attr("y", 0)
        .attr("x", 0)
        .attr("dy", "1em")*/







}






Piechart.prototype.showLabels = function(_selected){
    var vis = this;
    selected = _selected;


/*
    vis.svgChart.selectAll("#p")
        .data(vis.pie(vis.data))
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .text(function(d, i) {
            console.log(d)
            return d.value;
        })
*/



    vis.svgChart.selectAll(".arc")
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style("opacity", function (d) {
            if(d.data["Country name"] == selected) {
                return 0.8;
            }else{
                return 0.1;
            }
        })

    vis.svgChart.select('.lines')
        .selectAll('polyline')
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style("opacity", function (d) {
            if(d.data["Country name"] == selected) {
                return 0.1;
            }else{
                return 0;
            }
        })

    vis.svgChart.select('.labels')
        .selectAll('text')
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style("fill", function (d) {

            if(d.data["Country name"] == selected) {
                return "#aaa";
            }else{
                return "#none";
            }
        })


}

Piechart.prototype.reset = function(){
    var vis = this;

    vis.svgChart.selectAll(".arc")
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style("opacity", 0.8);

    vis.svgChart.select('.lines')
        .selectAll('polyline')
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style("opacity", 0);

    vis.svgChart.select('.labels')
        .selectAll('text')
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .style("fill", "none");

    $("#prct").html("");




}