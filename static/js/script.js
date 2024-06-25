
const is_production = false;
let api_base_url;
let default_n;

if (is_production) {
    api_base_url = "https://meandre.explore2.inrae.fr";
    default_n = 4;
} else {
    api_base_url = "http://127.0.0.1:5000";
    default_n = 7;
}


$(document).ready(function() {
    console.log("ready");
    updateContent(start=true);
});

$(window).on('popstate', function(event) {
    console.log("popstate");
    updateContent();
});


function change_url(url, start=false, actualise=true) {
    history.pushState({}, "", url);
    updateContent(start=start, actualise=actualise);
}

function updateContent(start=false, actualise=true) {
    var url = window.location.pathname;

    // console.log("url       ", url);
    // console.log("start     ", start);
    // console.log("actualise ", actualise);
    
    if (url !== "/") {
	// console.log("a");
	hide_home();
    } else {
	// console.log("b");
	show_home();
    }
    if (start || url !== "/personnalisation-avancee") {
	// console.log("c");
    	fetch_components();
    }
    
    if (start && url == "/") {
	// console.log("d");
	$("#container-map-gallery").load("/html" + "/plus-d-eau-ou-moins-d-eau/nord-et-sud" + ".html");
    	update_data_debounce();
	
    } else if (actualise && url !== "/" && (start || url !== "/personnalisation-avancee")) {
	// console.log("e");
    	$("#container-map-gallery").load("/html" + url + ".html");
    	update_data_debounce();
    }

    // console.log("");
}


function fetch_components() {
    $.get('/html/menu.html', function(html) {
        if ($('#menu-element').length) {
            $('#menu-element').html(html);
            load_slider();
        }
    });

    $.get('/html/bar.html', function(html) {
	if ($('#bar-element').length) {
            $('#bar-element').html(html);
            select_tab();
	    check_bar();
	}
    });
}

// function stopPropagation(event) {
    // event.stopPropagation();
// }



function hide_home() {
    document.getElementById('container-home').style.display = "none";
}
function show_home() {
    document.getElementById('container-home').style.display = "flex";
}


function unique(array) {
    return array.filter(function(item, index) {
        return array.indexOf(item) === index;
    });
}






// const CTRIP_color = "#A88D72";
// const EROS_color = "#CECD8D";
// const GRSD_color = "#619C6C";
// const J2000_color = "#00a3a6";
// const MORDORSD_color = "#D8714E";
// const MORDORTS_color = "#AE473E";
// const ORCHIDEE_color = "#EFA59D";
// const SIM2_color = "#475E6A";
// const SMASH_color = "#F6BA62";



function debounce(func, delay) {
    let timerId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}


let dataBackend;
let data;
let data_point;

function update_data() {

    $('#map-loading').css('display', 'flex');
    
    var n = get_n();
    var variable = get_variable();
    var horizon = get_horizon("futur");
    var chain = get_chain();
    var exp = chain[0].split('_')[0].replace('-', '_');
    
    var data_query = {
	n: n,
        exp: exp,
        chain: chain,
        variable: variable,
        horizon: horizon,
    };

    fetch(api_base_url + "/get_delta_on_horizon", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_query)
    })
    .then(response => response.json())
    .then(dataBackend => {
	data = dataBackend.data

	$('#map-loading').css('display', 'none');
	update_map();
	redrawPoint();
	
	update_grid(dataBackend);
	draw_colorbar(dataBackend);
	
    })
    // .catch(error => {
        // console.error('Error:', error);
    // });
}
const update_data_debounce = debounce(update_data, 1000);
// update_data_debounce();

function update_data_point() {
    $('#line-loading').css('display', 'flex');
    
    var variable = get_variable();
    var chain = get_chain();
    var exp = chain[0].split('_')[0].replace('-', '_');

    var data_query = {
	code: selected_code,
        exp: exp,
        chain: chain,
        variable: variable
    };

    fetch(api_base_url + "/get_delta_serie", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_query)
    })
    .then(response => response.json())
    .then(dataBackend => {
	data_point = dataBackend
	$('#line-loading').css('display', 'none');
	plot_data_serie()
    })
}
const update_data_point_debounce = debounce(update_data_point, 1000);


// function update_plot_data_serie() {
//     if (data_point) {
// 	plot_data_serie();
//     }
// }
window.addEventListener('resize', function() {
    plot_data_serie();
});

function plot_data_serie() {
    if (data_point) {
	d3.select("#svg-line").selectAll("*").remove();
	var svgContainer = d3.select("#svg-line");
	
	var gridLineContainer = d3.select("#grid-line");
	var containerPadding = 2 * parseFloat(window.getComputedStyle(gridLineContainer.node()).paddingLeft);
	var svgWidth = gridLineContainer.node().getBoundingClientRect().width - containerPadding;

	var svgHeight_min = 250;
	var svgHeight = Math.max(svgHeight_min,
				 +svgContainer.node().getBoundingClientRect().height);
	
	var margin = { top: 10, right: 10, bottom: 20, left: 40 };
	var width = svgWidth - margin.left - margin.right;
	var height = svgHeight - margin.top - margin.bottom;

	var svg = svgContainer
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	data_point.forEach(function(line) {
	    line.values.forEach(function(d) {
		d.x = new Date(d.x);
	    });
	});
	
	var xScale = d3.scaleTime()
	    .domain(d3.extent(data_point[0].values, function(d) { return d.x; }))
	    .range([0, width]);

	var yScale = d3.scaleLinear()
	    .domain([
		d3.min(data_point, function(line) {
		    return d3.min(line.values, function(d) { return d.y; });
		}),
		d3.max(data_point, function(line) {
		    return d3.max(line.values, function(d) { return d.y; });
		})
	    ])
	    .range([height, 0]);

	// Define axes
	if (window.innerWidth < 768) {
            xAxis = d3.axisBottom(xScale)
                .tickSize(0)
		.tickSizeInner(5)
                .tickFormat(d3.timeFormat("%Y"))
                .ticks(d3.timeYear.every(20)); // Show ticks every 20 years
        } else {
            xAxis = d3.axisBottom(xScale)
                .tickSize(0)
		.tickSizeInner(5)
                .tickFormat(d3.timeFormat("%Y"))
                .ticks(d3.timeYear.every(10)); // Show ticks every 10 years by default
        }

	var customTickFormat = function(d) {
	    return d > 0 ? "+" + d : d;
	};
	
	var yAxis = d3.axisLeft().scale(yScale)
	    .tickSize(0)
	    .tickSizeInner(-width)
	    .ticks(5)
	    .tickPadding(6)
	    .tickFormat(customTickFormat);
	
	// Append axes
	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	    .selectAll("text")
            .style("fill", "grey")
            .style("font-size", "12px");

	svg.selectAll('.x.axis').selectAll("line")
	    .style("stroke", "#ccc");
	svg.select(".x.axis").select(".domain")
	    .style("stroke", "#aaa");
	
	svg.append("g")
    	    .attr("class", "y axis")
    	    .call(yAxis)
    	    .selectAll("text")
            .style("fill", "grey")
            .style("font-size", "12px");
	
	svg.selectAll('.y.axis').selectAll("line")
	    .style("stroke", "#ccc")
	    .filter(function(d) { return d === 0; })
	    .remove();

	svg.select(".y.axis").select(".domain").remove();

	var line = d3.line()
	    .x(function(d) { return xScale(d.x); })
	    .y(function(d) { return yScale(d.y); });

	var tooltip = d3.select("#grid-line_tooltip");

	var lines = svg.selectAll(".line")
	    .data(data_point)
	    .enter().append("path")
	    .attr("class", "line")
	    .attr("fill", "none")
	    .attr("id", function(d) { return d.chain; })
	    .attr("d", function(d) { return line(d.values); })
	    .attr("opacity", function(d) { return d.opacity; })
	    .attr("stroke", function(d) { return d.color; })
	    .attr("stroke-width", function(d) { return d.stroke_width; });
	
	lines.on("mouseover", function(event, d) {
	    if (d.order === 2) {
		d3.select(this)
		    .attr("stroke-width", "2px");
		d3.select("#" + d.chain + "_back")
		    .attr("stroke-width", "5px");
		tooltip.style("opacity", 1)
		    .style("color", d.color)
		    .html(d.chain.replace(/_/g, " "));
		
	    } else if (d.order === 0) {
		d3.select(this)
		    .attr("opacity", "1");
		tooltip.style("opacity", 1)
		    .style("color", d.color)
		    .html(d.chain.replace(/_/g, " "));
	    }
	});
	lines.on("mouseout", function(event, d) {
            d3.select(this)
		.attr("opacity", d.opacity)
		.attr("stroke-width", d.stroke_width);
	    if (d.order === 2) {
		d3.select("#" + d.chain + "_back")
		    .attr("stroke-width", "3px");
	    }
            tooltip.style("opacity", 0);
	});
	
	svg.append("line")
	    .attr("class", "zero-line")
	    .attr("x1", 0)
	    .attr("y1", yScale(0))
	    .attr("x2", width)
	    .attr("y2", yScale(0))
	    .style("stroke", "#555")
	    .style("stroke-dasharray", ("3, 3"))
	    .style("stroke-width", 1);
    }
}







function update_grid(dataBackend) {

    var variable = dataBackend.variable_fr;
    if (variable.includes("_")) {
	variable = variable.match(/([^_]*)_/)[1];
    }
    
    var n = get_n();
    var horizon = get_horizon("futur");
    
    if (horizon === "H1") {
	var period = "01/01/2021 - 31/12/2050";
	var horizon_name = "proche";
    } else if (horizon === "H2") {
	var period = "01/01/2041 - 31/12/2070";
	var horizon_name = "moyen";
    } else if (horizon === "H3") {
	var period = "01/01/2070 - 31/12/2099";
	var horizon_name = "lointain";
    }

    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
		    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    var sampling_period = dataBackend.sampling_period_fr;    
    if (sampling_period.includes(",")) {
	sampling_period = sampling_period.split(", ")
	sampling_period_start = months[sampling_period[0].match(/-(\d+)/)[1] -1];
	sampling_period_end = months[sampling_period[1].match(/-(\d+)/)[1] -1];
	sampling_period = "de " + sampling_period_start + " à fin " + sampling_period_end;
	
    } else if (sampling_period.includes("-")) {
	sampling_period = months[sampling_period.match(/-(\d+)/)[1] -1];
	sampling_period = "débutant en " + sampling_period;
    } else {
	sampling_period = "débutant au " + sampling_period.toLowerCase();
    }    
    
    var chain = get_chain();
    var exp = chain[0].split('_')[0].replace('-', '_');
    
    document.getElementById("grid-variable_variable").textContent = variable;
    document.getElementById("grid-variable_sampling-period").innerHTML = "Année hydrologique " + sampling_period;
    document.getElementById("grid-variable_name").innerHTML = dataBackend.name_fr;
    
    document.getElementById("grid-horizon_name").innerHTML = "Horizon " + horizon_name;

    period = period.replace(/ - /g, "</b> au <b>");
    document.getElementById("grid-horizon_period-l1").innerHTML = "Période futur du <b>" + period + "</b>";
    document.getElementById("grid-horizon_period-l2").innerHTML = "Période de référence du <b>01/01/1976</b> au <b>31/08/2005</b>";

}




function close_point_grid() {
    document.getElementById("grid-point_cross").parentNode.style.display = "none";
    document.getElementById("grid-line_cross").parentNode.style.display = "none";
    selected_code = null;
    highlight_selected_point();
}


function make_list(from, to) {
    const result = [];
    for (let i = from; i <= to; i++) {
        result.push(i);
    }
    return result;
}


function draw_colorbar(dataBackend) {
    // document.getElementById("grid-variable_unit").innerHTML = dataBackend.unit_fr;

    var bin = dataBackend.bin.slice(1, -1).reverse();
    var Palette = dataBackend.palette.reverse();
    var step = 25;
    var shift = 20;
    var to_normalise = dataBackend.to_normalise;

    if (to_normalise) {
	var unit = "%";
    } else {
	var unit = "jours";
    }

    const svg = d3.select("#svg-colorbar");

    svg.attr("height", (Palette.length - 1) * step + shift * 2);
    svg.attr("width", "100%");

    // Update tick lines
    const lines = svg.selectAll(".tick-line")
        .data(bin);

    lines.enter()
        .append("line")
        .attr("class", "tick-line")
        .attr("x1", 5)
        .attr("x2", 15)
        .merge(lines)
        .attr("y1", (d, i) => i * step + step / 2 + shift)
        .attr("y2", (d, i) => i * step + step / 2 + shift);

    lines.exit().remove();

    // Update bin text
    const texts = svg.selectAll(".bin-text")
        .data(bin);
    texts.enter()
	.append("text")
	.attr("class", "bin-text")
	.attr("x", 28)
	.merge(texts)
	.attr("y", (d, i) => i * step + step / 2 + shift + 4)
	.html(d => {
            d = d > 0 ? "+" + d : d;
	    d = d == 0 ? d : `<tspan>${d}</tspan>&nbsp;<tspan class="colorbar-unit">${unit}</tspan>`;
            return d;
	});
    texts.exit().remove();

    var selected_color = null;
    const circles = svg.selectAll(".color-circle")
        .data(Palette);
    circles.enter()
        .append("circle")
        .attr("class", "color-circle")
        .attr("cx", 10)
        .attr("r", 6)
        .merge(circles)
        .attr("cy", (d, i) => i * step + shift)
        .attr("fill", d => d)
    	.on("mouseover", function(event, d) {
	    d3.select(this).attr("r", 7);
	})
	.on("mouseout", function(event, d) {
	    if (this.getAttribute('fill') !== selected_color) {
		d3.select(this).attr("r", 6);
	    }
	})
	.each(function(d, i) {
            d3.select(this)
	        .on("click", function(event, d) {
		    var clicked_color = d;

		    if (i < Palette.length/2) {
			var clicked_ID = make_list(0, i);
			var clicked_Ticks = clicked_ID;
		    } else {
			var clicked_ID = make_list(i, Palette.length-1);
			var clicked_Ticks = make_list(i-1, Palette.length-1);
		    }
		    var clicked_Colors = clicked_ID.map(id => Palette[id]);

		    if (selected_color === clicked_color) {
			d3.select("#svg-france").selectAll(".point")
			    .attr("opacity", 1);
			selected_color = null;
			svg.selectAll(".color-circle, .tick-line, .bin-text")
			    .attr("opacity", 1)
			    .attr("r", 6);
			
		    } else {
			selected_color = clicked_color;
			d3.select("#svg-france").selectAll(".point")
			    .attr("opacity", function(d) {
				return clicked_Colors.includes(d.fill) ? 1 : 0.1;
			    });

			svg.selectAll(".color-circle")
			    .attr("opacity", function() {
				return clicked_Colors.includes(this.getAttribute('fill')) ? 1 : 0.3;	
			    });
			svg.selectAll(".tick-line")
			    .attr("opacity", function(d, j) {
				return clicked_Ticks.includes(j) ? 1 : 0.3;
			    });
			svg.selectAll(".bin-text")
			    .attr("opacity", function(d, j) {
				return clicked_Ticks.includes(j) ? 1 : 0.3;
			    });
		    }
		});
	});
    circles.exit().remove();
}




let geoJSONdata_france, geoJSONdata_river, geoJSONdata_entiteHydro;

const geoJSONfiles = [
    "/data/france.geo.json",
    "/data/river.geo.json",
    "/data/entiteHydro.geo.json"
];

function loadGeoJSON(fileURL) {
    return d3.json(fileURL)
	.then(data => data)
	.catch(error => {
	    console.error("Error loading geojson file :", error);
	    throw error;
	});
}

const promises = geoJSONfiles.map(fileURL => loadGeoJSON(fileURL));
Promise.all(promises)
    .then(geoJSONdata => {
	geoJSONdata_france = geoJSONdata[0];
	geoJSONdata_river = geoJSONdata[1];
	geoJSONdata_entiteHydro = geoJSONdata[2];
	update_map();
    });



let selected_code = null;

const fill_entiteHydro = "transparent";
const stroke_entiteHydro = "#000000";

const fill_france = "transparent";
const stroke_france = "#89898A";
/* "#3D3E3E"; */
const stroke_river = "#B0D9D6";

const minZoom = 1;
const maxZoom = 4;
const maxPan = 0;

const transitionDuration = 500;

const k_simplify_ref = 0.1;
let k_simplify = k_simplify_ref;

const riverLength_max = 0.4;
const riverLength_min = 0;
let riverLength = riverLength_max;

const strokeWith_france = 2;
const strokeWith_river_max = 1.5;
const strokeWith_river_min = 0.4;

let width = window.innerHeight;
let height = window.innerHeight;

let projection;
let svgFrance;

function update_map() {

    d3.select("#svg-france").selectAll("*").remove();
    
    const zoom = d3.zoom()
	  .scaleExtent([minZoom, maxZoom])
	  .on("zoom", function (event) {
	      riverLength = riverLength_max - (event.transform.k - minZoom)/(maxZoom-minZoom)*(riverLength_max-riverLength_min);
	      k_simplify = k_simplify_ref + (event.transform.k - minZoom)/(maxZoom-minZoom)*(1-k_simplify_ref);
	      svgFrance.attr("transform", event.transform);
	      svgFrance.style("width", width * event.transform.k + "px");
	      svgFrance.style("height", height * event.transform.k + "px");
	      redrawMap_debounce();
	      highlight_selected_point();
	  });

    projection = d3.geoMercator()
	  .center(geoJSONdata_france.features[0].properties.centroid);

     svgFrance = d3.select("#svg-france")
	  .attr("width", "100%")
	  .attr("height", "100%")
	  .call(zoom)
	  .append("g");

    function handleResize() {
	if (window.innerWidth < window.innerHeight) {
	    var width = window.innerWidth;
	    var height = window.innerWidth;
	} else {
	    var width = window.innerHeight - 50;
	    var height = window.innerHeight - 50;
	}
	zoom.translateExtent([[-width*maxPan, -height*maxPan], [width*(1+maxPan), height*(1+maxPan)]]);
	svgFrance.attr("width", width).attr("height", height);
	projection.scale([height*3.2]).translate([width / 2, height / 2]);	    
	redrawMap();
	highlight_selected_point();
    }
    window.addEventListener("resize", handleResize.bind(null, k_simplify, riverLength));

    redrawMap();
    handleResize();
}


function redrawMap() {

    const pathGenerator = d3.geoPath(projection);
    const simplifiedGeoJSON_france = geotoolbox.simplify(geoJSONdata_france, { k: k_simplify, merge: false });
    const selectedGeoJSON_river = geotoolbox.filter(geoJSONdata_river, (d) => d.norm >= riverLength);
    const simplifiedselectedGeoJSON_river = geotoolbox.simplify(selectedGeoJSON_river, { k: k_simplify, merge: false });

    svgFrance.selectAll("path.france")
	.data(simplifiedGeoJSON_france.features)
	.join("path")
	.attr("class", "france")
    	.attr("fill", fill_france)
	.attr("stroke", stroke_france)
	.attr("stroke-width", strokeWith_france)
	.attr("stroke-linejoin", "miter")
	.attr("stroke-miterlimit", 1)
	.attr("d", pathGenerator)
	.transition()
	.duration(1000);

    svgFrance.selectAll("path.river")
	.data(simplifiedselectedGeoJSON_river.features)
	.join("path")
	.attr("class", "river")
    	.attr("fill", "transparent")
	.attr("stroke", stroke_river)
	.attr("stroke-width", function(d) {
	    return strokeWith_river_max - (1 - d.properties.norm) * (strokeWith_river_max - strokeWith_river_min);
	})
	.attr("stroke-linejoin", "miter")
	.attr("stroke-linecap", "round")
	.attr("stroke-miterlimit", 1)
	.attr("d", pathGenerator)
	.transition()
	.duration(1000);

    redrawPoint();
    highlight_selected_point();
}
const redrawMap_debounce = debounce(redrawMap, 100);


function highlight_selected_point() {
    
    const svg = d3.select("#svg-france");
    svg.selectAll(".point.clicked")
        .attr("stroke-width", 0)
        .attr("r", 3)
        .classed("clicked", false);
    
    if (selected_code !== null) {
        const svg = d3.select("#svg-france");

        svg.selectAll(".point.clicked")
            .attr("stroke-width", 0)
            .attr("r", 3)
            .classed("clicked", false);

        var clickedPoint = svg.selectAll(".point")
            .filter(function(d) {
                return d.code === selected_code;
            });

        clickedPoint
            .attr("r", 4)
            .attr("stroke", "#060508")
            .attr("stroke-width", 1)
            .classed("clicked", true);

        var parentNode = clickedPoint.node().parentNode;
        parentNode.appendChild(clickedPoint.node());
    }
}

function redrawPoint() {
    if (data) {
	svgFrance.selectAll(".point").remove();
	svgFrance.selectAll("circle.point")
	    .data(data)
	    .join("circle")
	    .attr("class", "point")
	    .attr("cx", function(d) {
		return projection([d.lon_deg, d.lat_deg])[0];
	    })
	    .attr("cy", function(d) {
		return projection([d.lon_deg, d.lat_deg])[1];
	    })
	    .attr("r", 3)
	    .attr("fill", function(d) {
		return d.fill;
	    })

	    .on("mouseover", function(event, d) {
		if (!d3.select(this).classed("clicked")) {
		    d3.select(this).attr("stroke", "#060508");
		}

		document.getElementById("panel-hover").style.display = "block";
		document.getElementById("panel-hover_code").innerHTML =
		    "<span style='font-weight: 900; color:" + d.fill_text + ";'>" +
		    d.code + "</span>";
		// const value = d.value.toFixed(2);
		// document.getElementById("panel-hover_value").innerHTML =
		// "<span style='color:" + d.fill_text + ";'>" +
		// "<span style='font-weight: 900;'>" +
		// (value > 0 ? "+" : "") + value + " </span>%</span>";
		
	    })
	    .on("mouseout", function(event, d) {
		if (!d3.select(this).classed("clicked")) {
		    d3.select(this).attr("stroke", "none");
		}
		document.getElementById("panel-hover").style.display = "none";
	    })
	    .on("click", function(d, point) {

		if (selected_code === point.code) {
		    selected_code = null;
		    document.getElementById("grid-point").style.display = "none";
		    document.getElementById("grid-line").style.display = "none";
		} else {
		    selected_code = point.code;
		    document.getElementById("grid-point").style.display = "flex";
		    document.getElementById("grid-line").style.display = "flex";
		}
		highlight_selected_point();

		update_data_point_debounce();

		document.getElementById("grid-point_code").innerHTML =
		    "<span style='font-weight: 900; color:" + point.fill_text + ";'>" +
		    point.code + "</span>";

		// const value = point.value.toFixed(2);
		// document.getElementById("grid-point_value").innerHTML =
		//     "<span style='color:" + point.fill_text + ";'>" +
		//     "<span style='font-weight: 900;'>" +
		//     (value > 0 ? "+" : "") + value + " </span>%</span>";
		
		document.getElementById("grid-point_name").innerHTML = point.name;

		document.getElementById("grid-point_hr").innerHTML =
		    "<span class='text-light'>Région hydrologique: </span>" +
		    point.hydrological_region;

		document.getElementById("grid-point_reference").innerHTML =
		    "<span class='text-light'>Station de référence: </span>" +
		    (point.is_reference ? "Oui" : "Non");

		document.getElementById("grid-point_n").innerHTML =
		    "<span class='text-light'>Nombre de modèles hydrologiques: </span>" +
		    point.n;
		
		var HM = get_HM();
		var surface_HM = HM.map(hm => "surface_" +
					hm.toLowerCase().replace('-', '_') +
					"_km2");
		surface_HM = surface_HM.map(x => point[x]);
		var isnotNull = surface_HM.map(value => value !== null);
		HM = HM.filter((_, index) => isnotNull[index]);

		HM_available =
		    HM.reduce((str, hm) => str + `${hm}&nbsp; `, "");
		document.getElementById("grid-point_HM").innerHTML = HM_available;
		
		document.getElementById("grid-point_xl93").innerHTML =
		    "<span class='text-light'>XL93: </span>" +
		    Math.round(point.xl93_m) +
		    " <span class='text-light'>m</span>";
		document.getElementById("grid-point_yl93").innerHTML =	
		    "<span class='text-light'>YL93: </span>" + 
		    Math.round(point.yl93_m) +
		    " <span class='text-light'>m</span>";

		// document.getElementById("grid-point_lat").innerHTML =
		//     "<span class='text-light'>lat: </span>" +
		//     Math.abs(point.lat_deg.toFixed(2)) +
		//     " <span class='text-light'>°</span>" + (point.lat_deg >= 0 ? "N" : "S");
		// document.getElementById("grid-point_lon").innerHTML =	
		//     "<span class='text-light'>lon: </span>" + 
		//     Math.abs(point.lon_deg.toFixed(2)) +
		//     " <span class='text-light'>°</span>" + (point.lon_deg >= 0 ? "E" : "W") ;

		document.getElementById("grid-point_surface").innerHTML =
		    "<span class='text-light'>Surface: </span>" +
		    Math.round(point.surface_km2) +
		    " <span class='text-light'>km<sup>2</sup></span>";
	    });
    }
}




