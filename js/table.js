Table = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    this.loadData();

}

Table.prototype.loadData = function() {
    var vis = this;


    // Pull out the format specific data and create a new array with each month
    vis.groupedMonths = []; //THis will hold the new array with the reformated info


    vis.abstractData = vis.data.filter(function(d, i)
    {
        if (d["Page description"] == 'Abstracts')
        {
            return d;
        }
    })

    vis.pdfData = vis.data.filter(function(d, i)
    {
        if (d["Page description"] == 'Full-text PDF')
        {
            return d;
        }
    })

    vis.htmlData = vis.data.filter(function(d, i)
    {
        if (d["Page description"] == 'Full-text HTML')
        {
            return d;
        }
    });

    vis.epubData = vis.data.filter(function(d, i)
    {
        if (d["Page description"] == 'Full-text EPUB')
        {
            return d;
        }
    })


    for (var i = 0; i < vis.abstractData.length; i++) {
        vis.groupedMonths.push({
            Date: vis.pdfData[i].Date,
            Abstracts: vis.abstractData[i].Count,
            "Full-text PDF": vis.pdfData[i].Count,
            "Full-text HTML": vis.htmlData[i].Count,
            //"Full-text EPUB": vis.epubData[i].Count,
        });
    }


    //SUM up the total ABSTRACTS Count
    vis.abstractsTotal = d3.nest()
        .key(function(d) { return d["Abstracts"]; })
        .rollup(function(v) { return {
            Count: d3.sum(v, function(d) { return d.Count; }),
        }; })
        .entries(vis.abstractData);

    //SUM up the total PDF Count
    vis.pdfTotal = d3.nest()
        .key(function(d) { return d["Full-text PDF"]; })
        .rollup(function(v) { return {
            Count: d3.sum(v, function(d) { return d.Count; }),
        }; })
        .entries(vis.pdfData);

    //SUM up the total HTML by format
    vis.htmlTotal = d3.nest()
        .key(function(d) { return d["Full-text HTML"]; })
        .rollup(function(v) { return {
            Count: d3.sum(v, function(d) { return d.Count; }),
        }; })
        .entries(vis.htmlData);

    //SUM up the total HTML by format
    vis.epubTotal = d3.nest()
        .key(function(d) { return d["Full-text EPUB"]; })
        .rollup(function(v) { return {
            Count: d3.sum(v, function(d) { return d.Count; }),
        }; })
        .entries(vis.epubData);


    $("#absTotal").append(vis.abstractsTotal[0].value["Count"].toLocaleString());
    $("#pdfTotal").append(vis.pdfTotal[0].value["Count"].toLocaleString());
    $("#htmlTotal").append(vis.htmlTotal[0].value["Count"].toLocaleString());
    //$("#epubTotal").append(vis.epubTotal[0].value["Count"].toLocaleString());

    vis.initVis(['Date', 'Abstracts', 'Full-text HTML', 'Full-text PDF'/*, 'Full-text EPUB'*/]);




};



Table.prototype.initVis = function(columns) {
    var vis = this

    console.log(vis.groupedMonths)


        var table = d3.select("#" + vis.parentElement).append('table')
        var thead = table.append('thead')
        var	tbody = table.append('tbody');

        table.attr('class', 'table')

    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(vis.groupedMonths)
        .enter()
        .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value.toLocaleString(); });

    return table;




};


Table.prototype.updateVis = function(){
    var vis = this;




}


