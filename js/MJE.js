MJE = function(_museElement, _jstorElement, _museData, _jstorData){
    this.museElement = _museElement;
    this.jstorElement = _jstorElement;
    this.museData = _museData;
    this.jstorData = _jstorData;
    this.loadData();



}

MJE.prototype.loadData = function() {
    var vis = this;

    /* SVG drawing area */
    vis.margin = {top: 40, right: 40, bottom: 60, left: 10
    };
    vis.width = 300 - vis.margin.left - vis.margin.right,
    vis.height = 300 - vis.margin.top - vis.margin.bottom;

    vis.radius = Math.min(vis.width, vis.height) / 2;


    vis.color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6"]);

    vis.arc = d3.arc()
        .outerRadius(vis.radius - 10)
        .innerRadius(30);

    vis.outerArc = d3.arc()
        .outerRadius(vis.radius * 0.6)
        .innerRadius(vis.radius * 0.7);

    vis.labelArc = d3.arc()
        .outerRadius(vis.radius * 0.5)
        .innerRadius(vis.radius * 0.6);

    vis.pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.total; });



    /* Calculate Muse data */
    vis.muse_total = 0 //To hold the total number of downloads between both formats
    vis.muse_pdf = [];
    vis.muse_html = [];

    vis.museData.forEach(function (d, i) {
        if(d.FORMAT == "pdf"){
            vis.muse_pdf.push(d.REQUESTS)
        }
        if(d.FORMAT == "html"){
            vis.muse_html.push(d.REQUESTS)
        }

    });

   vis.muse_total_pdf = vis.muse_pdf.reduce(add);
    vis.muse_total_html = vis.muse_html.reduce(add);
    vis.muse_total_all = vis.muse_total_pdf + vis.muse_total_html

    function add(accumulator, a) {
        return accumulator + a;
    }




    vis.museData.forEach(function (d, i) {
        vis.muse_total = vis.muse_total + d.REQUESTS;
    });



/* Calculate JSTOR data */
    var jstor_abstract,
    jstor_pdf;

    if(vis.jstorData[0].TOTAL == "Article Views"){
        vis.jstor_abstract = vis.jstorData[1].TOTAL;
        vis.jstor_pdf = vis.jstorData[0].TOTAL;
    }else{
        vis.jstor_abstract = vis.jstorData[0].TOTAL;
        vis.jstor_pdf = vis.jstorData[1].TOTAL;
    }
    vis.jstor_total = (vis.jstor_abstract + vis.jstor_pdf);

    vis.initText();
    vis.initVis();


};

MJE.prototype.midAngle = function(d) {

    return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

MJE.prototype.initText = function() {
    var vis = this

    //Add Muse data
    $("#muse_total").html("Total Downloads: " + vis.muse_total.toLocaleString());
    $("#muse_abstract").html("Full Text HTML Requests: " + vis.muse_total_html.toLocaleString());
    $("#muse_pdf").html("Full Text PDF Requests: " + vis.muse_total_pdf.toLocaleString());


    //Add JSTOR data
    $("#jstor_total").html("Total Downloads: " + vis.jstor_total.toLocaleString());
    $("#jstor_abstract").html("Full Text HTML Requests: " + vis.jstor_abstract.toLocaleString());
    $("#jstor_pdf").html("Full Text PDF Requests: " + vis.jstor_pdf.toLocaleString());
};


MJE.prototype.initVis = function() {
    var vis = this


    /* Add Muse chart */
    vis.museDataset = [
        { format: 'PDF', total: vis.muse_total_pdf},
        { format: 'HTML', total: vis.muse_total_html },

    ];

    vis.svgMuse = d3.select("#" + vis.museElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");

    vis.svgMuse.append('g').classed('labels',true);
    vis.svgMuse.append('g').classed('lines',true);

    //!* For the drop shadow filter... *!//
    vis.defs = vis.svgMuse.append("defs");

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


    vis.g = vis.svgMuse.selectAll(".arc")
        .data(vis.pie(vis.museDataset))
        .enter().append("g")
        .attr("class", "arc")

    vis.g.append("path")
        .attr("d", vis.arc)
        .style("fill", function(d) { return vis.color(d.data.total); })
        .attr("filter", "url(#dropshadow)")
        .style("opacity", 0.8)


    /*vis.polyline = vis.svgMuse.select('.lines')
        .selectAll('polyline')
        .data(vis.pie(vis.museDataset))
        .enter().append('polyline')
        .attr('points', function (d) {
            var pos = vis.outerArc.centroid(d);
            pos[0] = vis.radius * 0.95 * (vis.midAngle(d) < Math.PI ? 1 : -1);
            return [vis.arc.centroid(d), vis.outerArc.centroid(d), pos]

        })


    vis.label = vis.svgMuse.select('.labels').selectAll('text')
        .data(vis.pie(vis.museDataset))
        .enter().append('text')
        .attr('dy', '.35em')
        .attr('class', 'pie-labels')
        .text(function(d) { return d.data.format; })
        .attr('transform', function (d) {

            vis.pos = vis.outerArc.centroid(d);
            vis.pos[0] = vis.radius * 1 * (vis.midAngle(d) < Math.PI ? 1 : -1);
            return 'translate(' + vis.pos + ')';
        })
        .style('text-anchor', function (d) {
            return (vis.midAngle(d)) < Math.PI ? 'start' : 'end';
        });
*/

    /*vis.svgMuse = d3.select("#" + vis.museElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");


    var g = vis.svgMuse.selectAll(".arc")
        .data(vis.pie(vis.museDataset))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", vis.arc)
        .style("fill", function(d) { return vis.color(d.data.total); });

    g.append("text")
        .attr("transform", function(d) {
            return "translate(" + vis.labelArc.centroid(d) + ")"; })
        .text(function(d) { return d.data.format; });
*/



    /* Add JSTOR chart */
    vis.jstorDataset = [
        { format: 'PDF', total: vis.jstor_pdf},
        { format: 'HTML', total:vis.jstor_abstract },

    ];

    vis.svgJstor = d3.select("#" + vis.jstorElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");



    vis.svgJstor.append('g').classed('labels',true);
    vis.svgJstor.append('g').classed('lines',true);

    //!* For the drop shadow filter... *!//
    vis.defs = vis.svgJstor.append("defs");




    vis.g = vis.svgJstor.selectAll(".arc")
        .data(vis.pie(vis.jstorDataset))
        .enter().append("g")
        .attr("class", "arc")

    vis.g.append("path")
        .attr("d", vis.arc)
        .style("fill", function(d) { return vis.color(d.data.total); })
        .attr("filter", "url(#dropshadow)")
        .style("opacity", 0.8)


/*    vis.polyline = vis.svgJstor.select('.lines')
        .selectAll('polyline')
        .data(vis.pie(vis.jstorDataset))
        .enter().append('polyline')
        .attr('points', function (d) {
            var pos = vis.outerArc.centroid(d);
            pos[0] = vis.radius * 0.95 * (vis.midAngle(d) < Math.PI ? 1 : -1);
            return [vis.arc.centroid(d), vis.outerArc.centroid(d), pos]

        })


    vis.label = vis.svgJstor.select('.labels').selectAll('text')
        .data(vis.pie(vis.jstorDataset))
        .enter().append('text')
        .attr('dy', '.35em')
        .attr('class', 'pie-labels')
        .text(function(d) { return d.data.format; })
        .attr('transform', function (d) {

            vis.pos = vis.outerArc.centroid(d);
            vis.pos[0] = vis.radius * 1 * (vis.midAngle(d) < Math.PI ? 1 : -1);
            return 'translate(' + vis.pos + ')';
        })
        .style('text-anchor', function (d) {
            return (vis.midAngle(d)) < Math.PI ? 'start' : 'end';
        });*/
};

MJE.prototype.updateVis = function(){
    var vis = this;




}


