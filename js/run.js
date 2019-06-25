var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
});
var id = vars["id"];
var jrn_id = vars["jrn"];


if(jrn_id == "leon" && id=="4544jjen2"){
    setTimeout(function(){

        $(".spinner").hide();
        $(".spinner_cover").hide();

    }, 2000);



    return_text = '<a href="https://www.mitpressjournals.org/'+jrn_id+'">Back to journal homepage</a>'
    $("#back_button").html(return_text);



    d3.queue()
        .defer(d3.json, "data/world-110m.geojson")
        .defer(d3.csv, "data/article-usage.csv")
        .defer(d3.csv, "data/countries.csv")
        .defer(d3.csv, "data/muse_format.csv")
        .defer(d3.csv, "data/jstor_format.csv")
        .await(loadData);


    function loadData(error, _geoData, _monthData, _countryData,  _museData, _jstorData) {


        /* DATA FROM Atypon */
        _monthData = _monthData.filter(function(d, i)
        {
            if (d["Series code"] == jrn_id)
            {
                return d;
            }
        })

        _monthData.forEach(function (d, i) {
            d.Count = parseInt(d.Count);
        });



        /* DATA FROM JSTOR */
        _jstorData = _jstorData.filter(function(d, i)
        {
            if (d["Journal Name"] == "International Security")
            {
                return d;
            }
        });

        _jstorData.forEach(function (d, i) {
            d.TOTAL = parseInt(d.TOTAL);
        });


        /* DATA FROM MUSE */
        _museData = _museData.filter(function(d, i)
        {
            if (d["RESOURCE"] == "International Security")
            {
                return d;
            }
        })

        _museData.forEach(function (d, i) {
            d.REQUESTS = parseInt(d.REQUESTS);
        });



        barchartMonths = new Barchart("barchart_month", _monthData, "Monthly Downloads");
        table = new Table("table", _monthData);
        mapVis = new MapVis("mapvis", _geoData, _countryData);
        MJE = new MJE("muse_pie", "jstor_pie", _museData, _jstorData);


    }

}else{

    setTimeout(function(){

        $(".spinner").hide();
        $(".spinner_cover").hide();

    }, 2000);



    return_text = '<a href="https://mit-test.literatumonline.com/loi/'+jrn_id+'">Back to journal homepage</a>'
    $("#back_button").html(return_text);

    $("#container").html("<p>Invalid URL, please check the URL and contact <a href=\"mailto:'journals-tecch@mit.edu\">journals-tecch@mit.edu</a> if you continue to have trouble.</p>")
}


