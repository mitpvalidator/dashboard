Bar = function(_parentElement, _data){
    this.parentElement = _parentElement;
    data = _data;


    this.initVis();
}



Bar.prototype.initVis = function() {
    var vis = this


    // SVG drawing area
    margin = {top: 40, right: 80, bottom: 60, left: 80
    };

    bounds = d3.select("#barchart_month").node().getBoundingClientRect(),
        width = bounds.width - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    svgBar = d3.select("#" + vis.parentElement)
        .append("g")
        .attr("transform", "translate(" + margin.left+ "," + margin.top + ")");


// set the ranges
    x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(data.map(function(d) { return d.Date; }));

    y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, function(d) { return d.Count; })])
        .nice();;

    yAxis = svgBar.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));

    xAxis = d3.axisBottom()
        .scale(x);

    svgBar.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0, " + height  + ")")
        .call(xAxis);




    bars = svgBar.selectAll(".bar")
        .data(data)
        .enter().append("rect")




    vis.updateVis();
};



Bar.prototype.updateVis = function(){
    var vis = this;


    bounds = d3.select("#barchart_month").node().getBoundingClientRect(),
        width = bounds.width - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    svgBar = d3.select("#" + vis.parentElement)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left+ "," + margin.top + ")");

    x.range([0, width]);
    y.range([height, 0]);

    svgBar.append("g")

        .call(xAxis);



    bars
        .attr("fill", function(d){
            if(d["Page description"] == "Full-text PDF"){
                return "#8E9FBB";
            }
            if(d["Page description"] == "Full-text HTML"){
                return "#475069";
            }
            if(d["Page description"] == "Abstracts"){
                return "#fff";
            }
            if(d["Page description"] == "Full-text EPUB"){
                return "#475069";
            }
        })
        .style("filter", "url(#drop-shadow)")
        .attr("x", function(d) {

            if(d["Page description"] == "Full-text PDF"){
                return x(d.Date) + 0;
            }

            if(d["Page description"] == "Full-text HTML"){
                return x(d.Date) + 20
            }

            if(d["Page description"] == "Abstracts"){
                return x(d.Date) + 40
            }

            if(d["Page description"] == "Full-text EPUB"){
                return x(d.Date) + 20
            }

        })
        .attr("width", x.bandwidth()/3)
        .attr("y", function(d) { return y(d.Count); })
        .attr("height", function(d) { return height - y(d.Count); })
        .on("mouseover", function(d) {
            d3.select(this).style("opacity", 1)
            //vis.tip.show();
            //$("#BarTipText").html(d.Date + "<br>" + d.Count );

        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", 0.8);
            //vis.tip.hide();
        })




    // EXIT
    bars.exit()
        .remove();

    svgBar.selectAll(".x-axis").exit();



    // filters go in defs element
    vis.defs = svgBar.append("defs");

// create filter with id #drop-shadow
// height=130% so that the shadow is not clipped
    vis.filter = vis.defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");

// SourceAlpha refers to opacity of graphic that this filter will be applied to
// convolve that with a Gaussian with standard deviation 3 and store result
// in blur
    vis.filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 1)
        .attr("result", "blur");

// translate output of Gaussian blur to the right and downwards with 2px
// store result in offsetBlur
    vis.filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 1)
        .attr("dy", 1)
        .attr("result", "offsetBlur");

// overlay original SourceGraphic over translated blurred opacity by using
// feMerge filter. Order of specifying inputs is important!
    vis.feMerge = vis.filter.append("feMerge");

    vis.feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    vis.feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");



}



$(document).ready(function() {
    var vis = this;
    window.addEventListener("resize", Bar.prototype.updateVis);
});
