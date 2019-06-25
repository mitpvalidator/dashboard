Barchart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    data = _data;


    this.initVis();
}


// gridlines in x axis function


Barchart.prototype.make_y_gridlines = function() {
        return d3.axisLeft(x2)

}

Barchart.prototype.initVis = function() {
    var vis = this


    svg = d3.select("#" + vis.parentElement),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
        x = d3.scaleBand()
            .range([0, 100])
            .padding(0.1)
            .domain(data.map(function(d) { return d.Date; })),

        x2 = d3.scaleBand()
            .range([100, 10])
            .padding(0.1)
            .domain(data.map(function(d) { return d.Count; }));

    y = d3.scaleLinear()
        .range([500, 0])
        .domain([0, d3.max(data, function(d) { return d.Count; })])
        .nice();




    g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
        .attr("class", "axis axis--x");

    g.append("g")
        .attr("class", "axis axis--y");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")

    z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var legend_text = ["Abstracts", "HTML", "PDF"]


    var legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + (10 + 12) + ', 0)');

    legend.selectAll('rect')
        .data(legend_text)
        .enter()
        .append('rect')
        .attr('x', 35)
        .attr('y', function(d, i){
            return i * 18;
        })
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', function(d, i){
            return z(d);
        });

    legend.selectAll('text')
        .data(legend_text)
        .enter()
        .append('text')
        .text(function(d){
            return d;
        })
        .attr('x', 50)
        .attr('y', function(d, i){
            return i * 18;
        })
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'hanging');



    vis.updateVis();
};



Barchart.prototype.updateVis = function(){


    var vis = this;
    var bounds = svg.node().getBoundingClientRect(),
        width = bounds.width - margin.left - margin.right,
        height = bounds.height - margin.top - margin.bottom;


    z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    x.rangeRound([0, width]);
    y.rangeRound([height, 0]);


    g.select(".axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.select(".axis--y")
        .call(d3.axisLeft(y));





    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append("g")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 100)
        .attr("height", 40)
        .attr("class", "tooltip")


    tooltip.append("text")
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr("font-size", "12px")






    var bars = g.selectAll(".bar")
        .data(data);

    // ENTER
    bars
        .enter().append("rect")
        .attr("y", function(d) { return y(d.Count); })

        .attr("height", function(d) { return height - y(d.Count); })
        .attr("class", "bar")
        .style("filter", "url(#drop-shadow)")
        .attr("fill", function(d){

             return z(d["Page description"]);
        })


        .attr("x", function(d, i) {


/*            if(d["Page description"] == "Full-text EPUB"){

                return x(d.Date) + (((width/14)/4.2) *1) - x.bandwidth()/4
            }*/
            if(d["Page description"] == "Full-text PDF"){
                return x(d.Date) + (((width/14)/4.2) *2) - x.bandwidth()/4
            }

            if(d["Page description"] == "Full-text HTML"){
                return x(d.Date) + (((width/14)/4.2) *3) - x.bandwidth()/4
            }

            if(d["Page description"] == "Abstracts"){
                return x(d.Date) + (((width/14)/4.2) *4) - x.bandwidth()/4
            }

        })
        .attr("width", x.bandwidth()/4)
        .on("mouseover", function() { tooltip.style("display", "block"); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
            var xPosition = d3.mouse(this)[0] - 15;
            var yPosition = d3.mouse(this)[1] - 40;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").html("" +
                "<tspan x=\"0\" dy=\"1.2em\">Date: "+ d.Date +"</tspan>\n" +
                "<tspan x=\"0\" dy=\"1.2em\">Count: "+ d.Count +"</tspan>" +
                "<tspan x=\"0\" dy=\"1.2em\">Count: "+ d["Page description"] +"</tspan>"
            );
        });



    // UPDATE
    bars.attr("fill", function(d){

        return z(d["Page description"]);
    })
        .attr("x", function(d) {

/*            if(d["Page description"] == "Full-text EPUB"){

                return x(d.Date) + (((width/14)/4.2) *1) - x.bandwidth()/4
            }*/
            if(d["Page description"] == "Full-text PDF"){
                return x(d.Date) + (((width/14)/4.2) *2) - x.bandwidth()/4
            }

            if(d["Page description"] == "Full-text HTML"){
                return x(d.Date) + (((width/14)/4.2) *3) - x.bandwidth()/4
            }

            if(d["Page description"] == "Abstracts"){
                return x(d.Date) + (((width/14)/4.2) *4) - x.bandwidth()/4
            }


        })
        .attr("width", x.bandwidth()/4)
        .attr("y", function(d) { return y(d.Count); })
        .attr("height", function(d) { return height - y(d.Count); })




    // EXIT
    bars.exit()
        .remove();








    // filters go in defs element
    defs = svg.append("defs");

// create filter with id #drop-shadow
// height=130% so that the shadow is not clipped
    filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");

// SourceAlpha refers to opacity of graphic that this filter will be applied to
// convolve that with a Gaussian with standard deviation 3 and store result
// in blur
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 1)
        .attr("result", "blur");

// translate output of Gaussian blur to the right and downwards with 2px
// store result in offsetBlur
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 1)
        .attr("dy", 1)
        .attr("result", "offsetBlur");

// overlay original SourceGraphic over translated blurred opacity by using
// feMerge filter. Order of specifying inputs is important!
    feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");


}


$(document).ready(function() {
    var vis = this;
    window.addEventListener("resize", Barchart.prototype.updateVis);

});
