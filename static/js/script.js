// Copyright 2024
// Louis Héraut (louis.heraut@inrae.fr)*1,
// Jean-Philippe Vidal (jean-philippe.vidal@inrae.fr)*1

//     *1   INRAE, France

// This file is part of MEANDRE.

// MEANDRE is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// MEANDRE is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with MEANDRE.
// If not, see <https://www.gnu.org/licenses/>.


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


let URL_QA = ["/",
	      "/plus-d-eau-ou-moins-d-eau/nord-et-sud",
	      "/plus-d-eau-ou-moins-d-eau/et-entre-les-deux",
	      "/plus-d-eau-ou-moins-d-eau/le-changement-dans-la-continuite",
	      "/plus-d-eau-ou-moins-d-eau/ajouter-une-pincee-de-variabilite-naturelle",
	      "/plus-d-eau-ou-moins-d-eau/raconter-les-trajectoires"];

let URL_VCN10 = ["/des-etiages-plus-severe/moins-d-eau-l-ete",
		 "/des-etiages-plus-severe/et-c-est-certain"];

let URL_dtLF = ["/des-etiages-plus-severe/des-etiages-plus-longs"];

let URL_QJXA = ["/des-crues-incertaines/quelle-evolution-en-france",
		"/des-crues-incertaines/et-d-abord-dans-quelle-direction",
		"/des-crues-incertaines/ajouter-une-louche-de-variabilite"];

let URL_narratifs = ["/plus-d-eau-ou-moins-d-eau/et-entre-les-deux",
		     "/plus-d-eau-ou-moins-d-eau/raconter-les-trajectoires",
		     "/des-etiages-plus-severe/et-c-est-certain",
		     "/des-etiages-plus-severe/des-etiages-plus-longs",
		     "/des-crues-incertaines/et-d-abord-dans-quelle-direction"]; 

let URL_serie = ["/plus-d-eau-ou-moins-d-eau/ajouter-une-pincee-de-variabilite-naturelle",
		 "/plus-d-eau-ou-moins-d-eau/raconter-les-trajectoires",
		 "/des-etiages-plus-severe/des-etiages-plus-longs",
		 "/des-crues-incertaines/ajouter-une-louche-de-variabilite"];

let URL_noSL = ["/",
		"/plus-d-eau-ou-moins-d-eau/nord-et-sud",
		"/plus-d-eau-ou-moins-d-eau/et-entre-les-deux",
		"/plus-d-eau-ou-moins-d-eau/le-changement-dans-la-continuite",
		"/plus-d-eau-ou-moins-d-eau/ajouter-une-pincee-de-variabilite-naturelle"]; 


$(document).ready(function() {
    // console.log("ready");
    updateContent(start=true);
});

$(window).on('popstate', function(event) {
    // console.log("popstate");
    updateContent();
});


function change_url(url, start=false, actualise=true) {
    var current_url = window.location.pathname;
    // console.log(current_url);
    if (current_url === url && url === "/exploration-avancee") {
	actualise = false;
    }
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
    if (start) {
	// console.log("c");
    	fetch_components(url);
    } else {
	select_tab();
	check_bar();
    }

    if (actualise) {
	const promises = geoJSONfiles.map(fileURL => loadGeoJSON(fileURL));
	Promise.all(promises)
	    .then(geoJSONdata => {
		geoJSONdata_france = geoJSONdata[0];
		geoJSONdata_river = geoJSONdata[1];
		geoJSONdata_entiteHydro = geoJSONdata[2];
		svgFrance = update_map("#svg-france", svgFrance, data_point=null);
	    });
    }

    if (url !== "/a-propos") {
	if (start && url == "/") {
	    $("#container-map-gallery").load("/html" + "/plus-d-eau-ou-moins-d-eau/nord-et-sud" + ".html", function() {
		check_url();
	    });
	    update_data_point_debounce();
	    
	} else if (actualise && url !== "/") {
	    $("#container-map-gallery").load("/html" + url + ".html", function() {
		check_url();
	    });
	    update_data_point_debounce();
	}
	
    } else {
	$("#container-map-gallery").load("/html" + url + ".html");
    }
}

function check_url() {
    var url = window.location.pathname;
    var selected_variable = get_variable();

    // console.log(selected_variable);
    
    if (URL_QA.includes(url) && selected_variable != "QA") {
	var variable = document.getElementById("button-QA");
	selectVariableButton(variable);

    } else if (URL_VCN10.includes(url) && selected_variable != "VCN10_summer") {
	var variable = document.getElementById("button-VCN10_summer");
	selectVariableButton(variable);
	
    } else if (URL_dtLF.includes(url) && selected_variable != "dtLF_summer") {
	var variable = document.getElementById("button-dtLF_summer");
	selectVariableButton(variable);
	
    } else if (URL_QJXA.includes(url) && selected_variable != "QJXA") {
	var variable = document.getElementById("button-QJXA");
	selectVariableButton(variable);
    }

    if (URL_narratifs.includes(url)) {
	change_drawer("drawer-narratif");
    } else {
	change_drawer("drawer-chain");
    }
}

function check_url_after_data() {
    var url = window.location.pathname;
    if (URL_serie.includes(url)) {
	show_serie(data_point, "K228311002", toggle=false);
    } else {
	close_serie();
    }
}


function fetch_components(url) {
    // console.log("fetch");
    
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

function debounce(func, delay) {
    let timerId;
    return function(...args) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}



let data_back;
let data_point;
let data_point_vert;
let data_point_jaune;
let data_point_orange;
let data_point_violet;
let data_serie;

let svgFrance;
let svgFrance_vert;
let svgFrance_jaune;
let svgFrance_orange;
let svgFrance_violet;

function update_data_point() {

    var url = window.location.pathname;
    console.log(url);

    let check_cache;
    if (url === "/exploration-avancee") {
	check_cache = false; 
    } else {
	check_cache = true;
    }
    
    if (drawer_mode === 'drawer-narratif') {
	$('#map-vert-loading').css('display', 'flex');
	$('#map-jaune-loading').css('display', 'flex');
	$('#map-orange-loading').css('display', 'flex');
	$('#map-violet-loading').css('display', 'flex');
    } else {
	$('#map-loading').css('display', 'flex');	
    }
    
    var n = get_n();
    var variable = get_variable();
    var horizon = get_horizon("futur");
    var chain = get_chain();
    var exp = chain[0].split('_')[0].replace('-', '_');
    
    if (drawer_mode === 'drawer-narratif') {
	var data_query = {
	    n: n,
            exp: exp,
            chain: chain,
            variable: variable,
            horizon: horizon,
	    check_cache: check_cache,
	};
	fetch(api_base_url + "/get_delta_on_horizon", {
            method: 'POST',
            headers: {
		'Content-Type': 'application/json'
            },
            body: JSON.stringify(data_query)
	})
	    .then(response => response.json())
	    .then(data_back => {
		data_point = data_back;
		update_grid(data_back);
		draw_colorbar(data_back);
		check_url_after_data();
	    })

	var chain_vert = chain.filter(item => item.includes("85_HadGEM2-ES_ALADIN63_ADAMONT"));
	var chain_jaune = chain.filter(item => item.includes("85_CNRM-CM5_ALADIN63_ADAMONT"));
	var chain_orange = chain.filter(item => item.includes("85_EC-EARTH_HadREM3-GA7_ADAMONT"));
	var chain_violet = chain.filter(item => item.includes("85_HadGEM2-ES_CCLM4-8-17_ADAMONT"));
	
	var data_query = {
	    n: n,
            exp: exp,
            chain: chain_vert,
            variable: variable,
            horizon: horizon,
	    check_cache: check_cache,
	};
	fetch(api_base_url + "/get_delta_on_horizon", {
            method: 'POST',
            headers: {
		'Content-Type': 'application/json'
            },
            body: JSON.stringify(data_query)
	})
	    .then(response => response.json())
	    .then(data_back => {
		data_point_vert = data_back;
		svgFrance_vert = update_map("#svg-france-vert", svgFrance_vert, data_point_vert);
		$('#map-vert-loading').css('display', 'none');
	    })

	var data_query = {
	    n: n,
            exp: exp,
            chain: chain_jaune,
            variable: variable,
            horizon: horizon,
	    check_cache: check_cache,
	};
	fetch(api_base_url + "/get_delta_on_horizon", {
            method: 'POST',
            headers: {
		'Content-Type': 'application/json'
            },
            body: JSON.stringify(data_query)
	})
	    .then(response => response.json())
	    .then(data_back => {
		data_point_jaune = data_back;
		svgFrance_jaune = update_map("#svg-france-jaune", svgFrance_jaune, data_point_jaune);
		$('#map-jaune-loading').css('display', 'none');
	    })

	var data_query = {
	    n: n,
            exp: exp,
            chain: chain_orange,
            variable: variable,
            horizon: horizon,
	    check_cache: check_cache,
	};
	fetch(api_base_url + "/get_delta_on_horizon", {
            method: 'POST',
            headers: {
		'Content-Type': 'application/json'
            },
            body: JSON.stringify(data_query)
	})
	    .then(response => response.json())
	    .then(data_back => {
		data_point_orange = data_back;
		svgFrance_orange = update_map("#svg-france-orange", svgFrance_orange, data_point_orange);
		$('#map-orange-loading').css('display', 'none');
	    })

	var data_query = {
	    n: n,
            exp: exp,
            chain: chain_violet,
            variable: variable,
            horizon: horizon,
	    check_cache: check_cache,
	};
	fetch(api_base_url + "/get_delta_on_horizon", {
            method: 'POST',
            headers: {
		'Content-Type': 'application/json'
            },
            body: JSON.stringify(data_query)
	})
	    .then(response => response.json())
	    .then(data_back => {
		data_point_violet = data_back;
		svgFrance_violet = update_map("#svg-france-violet", svgFrance_violet, data_point_violet);
		$('#map-violet-loading').css('display', 'none');
	    })
	
	
    } else {
	var data_query = {
	    n: n,
            exp: exp,
            chain: chain,
            variable: variable,
            horizon: horizon,
	    check_cache: check_cache,
	};

	fetch(api_base_url + "/get_delta_on_horizon", {
            method: 'POST',
            headers: {
		'Content-Type': 'application/json'
            },
            body: JSON.stringify(data_query)
	})
	    .then(response => response.json())
	    .then(data_back => {
		data_point = data_back;
		// delete data_back.data;
		// meta_point = data_back;
		update_grid(data_back);
		draw_colorbar(data_back);
		svgFrance = update_map("#svg-france", svgFrance, data_point);
		svgFrance = redrawPoint(svgFrance, data_point);
		$('#map-loading').css('display', 'none');
		check_url_after_data();
	    })
    }
}
const update_data_point_debounce = debounce(update_data_point, 1000);
// update_data_point_debounce();

function update_data_serie() {
    $('#line-loading').css('display', 'flex');
    
    var variable = get_variable();
    var chain = get_chain();
    var exp = chain[0].split('_')[0].replace('-', '_');

    console.log("selected_code");
    console.log(selected_code);
    
    var data_query = {
	code: selected_code,
        exp: exp,
        chain: chain,
        variable: variable,
    };

    fetch(api_base_url + "/get_delta_serie", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_query)
    })
    .then(response => response.json())
    .then(data_back => {
	data_serie = data_back;
	$('#line-loading').css('display', 'none');
	plot_data_serie();
    })
}
const update_data_serie_debounce = debounce(update_data_serie, 1000);


// function update_plot_data_serie() {
//     if (data_serie) {
// 	plot_data_serie();
//     }
// }
window.addEventListener('resize', function() {
    plot_data_serie();
});

function plot_data_serie() {
    if (data_serie) {
	var url = window.location.pathname;
	if (URL_noSL.includes(url)) {
	    data_serie = data_serie.filter(item => item.order === 0);
	}
	
	d3.select("#svg-line").selectAll("*").remove();
	var svgContainer = d3.select("#svg-line");

	var svgNode = d3.select("#grid-line").node();
	var computedStyle = window.getComputedStyle(svgNode);
	var paddingLeft = parseFloat(computedStyle.paddingLeft);
	var paddingRight = parseFloat(computedStyle.paddingRight);
	var containerPadding = paddingLeft + paddingRight;
	var svgWidth = svgNode.getBoundingClientRect().width - containerPadding;
	
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

	data_serie.forEach(function(line) {
	    line.values.forEach(function(d) {
		d.x = new Date(d.x);
	    });
	});
	
	var xScale = d3.scaleTime()
	    .domain(d3.extent(data_serie[0].values, function(d) { return d.x; }))
	    .range([0, width]);

	var yScale = d3.scaleLinear()
	    .domain([
		d3.min(data_serie, function(line) {
		    return d3.min(line.values, function(d) { return d.y; });
		}),
		d3.max(data_serie, function(line) {
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
	    .data(data_serie)
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







function update_grid(data_back) {

    var variable = data_back.variable_fr;
    if (variable.includes("_")) {
	variable = variable.match(/([^_]*)_/)[1];
    }
    
    var n = get_n();
    var horizon = get_horizon("futur");
    
    if (horizon === "H1") {
	var period = "2021 - 2050";
	var horizon_name = "proche";
    } else if (horizon === "H2") {
	var period = "2041 - 2070";
	var horizon_name = "moyen";
    } else if (horizon === "H3") {
	var period = "2070 - 2099";
	var horizon_name = "lointain";
    }

    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
		    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    var sampling_period = data_back.sampling_period_fr;    
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
    document.getElementById("grid-variable_name").innerHTML = data_back.name_fr;
    
    document.getElementById("grid-horizon_name").innerHTML = "Horizon " + horizon_name;

    period = period.replace(/ - /g, "</b> à <b>");
    document.getElementById("grid-horizon_period-l1").innerHTML = "Période futur de <b>" + period + "</b>";
    document.getElementById("grid-horizon_period-l2").innerHTML = "Période de référence de <b>1976</b> à <b>2005</b>";

    $(".grid-n_text").css("display", "flex");
    document.getElementById("grid-n_number").innerHTML = n;
    
    var url = window.location.pathname;
    if (url === "/exploration-avancee") {
	$("#grid-chain_drawer-narratif").css("display", "none");
	$("#grid-chain_drawer-RCP").css("display", "none");
	$("#grid-chain_drawer-chain").css("display", "none");
	
	if (drawer_mode === "drawer-narratif") {
	    $("#grid-chain_drawer-narratif").css("display", "flex");
	    
	} else if (drawer_mode === "drawer-RCP") {
    	    $("#grid-chain_drawer-RCP").css("display", "flex");

	    var RCP = get_RCP();
	    $("#grid-chain_RCP26-text").css("display", "none");
	    $("#grid-chain_RCP45-text").css("display", "none");
	    $("#grid-chain_RCP85-text").css("display", "none");
	    
	    if (RCP === "RCP 2.6") {
		$("#grid-chain_RCP26-text").css("display", "block");
	    } else if (RCP === "RCP 4.5") {
		$("#grid-chain_RCP45-text").css("display", "block");
	    } else if (RCP === "RCP 8.5") {
		$("#grid-chain_RCP85-text").css("display", "block");
	    }
	    
	} else if (drawer_mode === "drawer-chain") {
	    $("#grid-chain_drawer-chain").css("display", "flex");
	}
    }
    
}



function close_serie() {
    selected_code = null;
    var url = window.location.pathname;
    if (url !== "/a-propos") {
	document.getElementById("grid-point_cross").parentNode.style.display = "none";
	document.getElementById("grid-line_cross").parentNode.style.display = "none";
	highlight_selected_point();
    }
}


function make_list(from, to) {
    const result = [];
    for (let i = from; i <= to; i++) {
        result.push(i);
    }
    return result;
}


function draw_colorbar(data_back) {
    // Get the bins and palette
    var bin = data_back.bin.slice(1, -1).reverse();
    var Palette = data_back.palette.reverse();
    var step = 25;
    var shift = 20;
    var to_normalise = data_back.to_normalise;

    // Determine the unit based on normalization
    var unit = to_normalise ? "%" : "jours";

    // Select the SVG and convert it to a DOM node
    const svg = d3.select("#svg-colorbar");
    const svgNode = svg.node();
    svg.selectAll("*").remove();

    // Calculate and set initial SVG dimensions
    svg.attr("height", (Palette.length - 1) * step + shift * 2);
    svg.attr("width", "100%");

    // Update tick lines
    const lines = svg.selectAll(".tick-line")
        .data(bin);

    lines.enter()
        .append("line")
        .attr("x1", 5)
        .attr("x2", 15)
        .style("stroke", "#3d3e3e")
        .style("stroke-width", "1px")
        .merge(lines)
        .attr("y1", (d, i) => i * step + step / 2 + shift)
        .attr("y2", (d, i) => i * step + step / 2 + shift);
    lines.exit().remove();

    // Update bin text
    const texts = svg.selectAll(".bin-text")
        .data(bin);
    texts.enter()
        .append("text")
        .attr("x", 28)
        .style("fill", "#3d3e3e")
        .style("font-family", "Lato, sans-serif")
        .style("font-weight", "600")
        .merge(texts)
        .attr("y", (d, i) => i * step + step / 2 + shift + 4)
        .html(d => {
            d = d > 0 ? "+" + d : d;
            d = d == 0 ? d : `<tspan>${d}</tspan>&nbsp;<tspan class="colorbar-unit" style="fill: #70757A; font-size: 9pt;">${unit}</tspan>`;
            return d;
        });
    texts.exit().remove();

    // Update color circles
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
                    var clicked_ID, clicked_Ticks;

                    if (i < Palette.length / 2) {
                        clicked_ID = make_list(0, i);
                        clicked_Ticks = clicked_ID;
                    } else {
                        clicked_ID = make_list(i, Palette.length - 1);
                        clicked_Ticks = make_list(i - 1, Palette.length - 1);
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

    // Ensure width and height are set to prevent distortion
    const bbox = svgNode.getBBox();  // Get bounding box of the content
    svgNode.setAttribute("viewBox", `${bbox.x - 2} ${bbox.y - 2} ${bbox.width + 2} ${bbox.height + 2}`);  // Set viewBox
    svgNode.setAttribute("width", bbox.width);  // Set width
    svgNode.setAttribute("height", bbox.height);  // Set height
    svgNode.setAttribute("preserveAspectRatio", "xMidYMid meet");  // Preserve aspect ratio
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
const scale = 3.5;

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


function update_map(id_svg, svgElement, data_back) {

    d3.select(id_svg).selectAll("*").remove();

    if (drawer_mode === 'drawer-narratif') {
	var fact = 2;
    } else {
	var fact = 1;
    }

    function redrawMap() {
	const pathGenerator = d3.geoPath(projection);
	const simplifiedGeoJSON_france = geotoolbox.simplify(geoJSONdata_france, { k: k_simplify, merge: false });
	const selectedGeoJSON_river = geotoolbox.filter(geoJSONdata_river, (d) => d.norm >= riverLength);
	const simplifiedselectedGeoJSON_river = geotoolbox.simplify(selectedGeoJSON_river, { k: k_simplify, merge: false });

	svgElement.selectAll("path.france")
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

	svgElement.selectAll("path.river")
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

	if (data_back) {
	    svgElement = redrawPoint(svgElement, data_back);
	    highlight_selected_point();
	}
    }
    const redrawMap_debounce = debounce(redrawMap, 100);

    function handleResize() {
	if (window.innerWidth < window.innerHeight) {
	    var width = window.innerWidth / fact;
	    var height = window.innerWidth / fact;
	} else {
	    var width = (window.innerHeight - 50 ) / fact;
	    var height = (window.innerHeight - 50) / fact;
	}

	zoom.translateExtent([[-width*maxPan, -height*maxPan], [width*(1+maxPan), height*(1+maxPan)]]);
	svgElement.attr("width", width).attr("height", height);
	projection.scale([height*scale]).translate([width / 2, height / 2]);	    

	redrawMap();
	highlight_selected_point();
    }
    window.addEventListener("resize", handleResize.bind(null, k_simplify, riverLength));
    
    const zoom = d3.zoom()
	  .scaleExtent([minZoom, maxZoom])
	  .on("zoom", function (event) {
	      riverLength = riverLength_max - (event.transform.k - minZoom)/(maxZoom-minZoom)*(riverLength_max-riverLength_min);
	      k_simplify = k_simplify_ref + (event.transform.k - minZoom)/(maxZoom-minZoom)*(1-k_simplify_ref);
	      svgElement.attr("transform", event.transform);
	      svgElement.style("width", width * event.transform.k + "px");
	      svgElement.style("height", height * event.transform.k + "px");
	      redrawMap_debounce();
	      highlight_selected_point();
	  });

    projection = d3.geoMercator()
	  .center(geoJSONdata_france.features[0].properties.centroid);

     svgElement = d3.select(id_svg)
	.attr("width", "100%")
	.attr("height", "100%")
	.append("g");

    // if (is_zoom) {
	svgElement.call(zoom)
    // }

    redrawMap();
    handleResize();

    return svgElement
}



function highlight_selected_point() {

    if (selected_code) {
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

	    if (clickedPoint.node()) {
		clickedPoint
		    .attr("r", 4)
		    .attr("stroke", "#060508")
		    .attr("stroke-width", 1)
		    .classed("clicked", true);

		var parentNode = clickedPoint.node().parentNode;
		parentNode.appendChild(clickedPoint.node());
	    }
	}
    }
}


function find_code_in_data(data_back, code) {
    return data_back.data.find(item => item.code === code);
}

// function hide_serie() {
//     selected_code = null;
//     document.getElementById("grid-point").style.display = "none";
//     document.getElementById("grid-line").style.display = "none";
// }

function show_serie(data_back, code, toggle=true) {
    console.log(code);
    // console.log(data_back);
    
    var point = find_code_in_data(data_back, code);

    console.log("point");
    console.log(point);
    
    
    if (selected_code === point.code && toggle) {
	selected_code = null;
	document.getElementById("grid-point").style.display = "none";
	document.getElementById("grid-line").style.display = "none";
    } else {
	selected_code = point.code;
	document.getElementById("grid-point").style.display = "flex";
	document.getElementById("grid-line").style.display = "flex";
    }
    highlight_selected_point();
    update_data_serie_debounce();

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
}


function redrawPoint(svgElement, data_back) {
    
    if (data_back) {
	svgElement.selectAll(".point").remove();
	svgElement.selectAll("circle.point")
	    .data(data_back.data)
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
		console.log("aaa");
		show_serie(data_back, point.code);
	    });
    }
    
    return svgElement
}





// function exportSVG() {
//     const svgElement = d3.select("#svg-france");
//     const bbox = svgElement.node().getBBox();
//     svgElement.attr("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);

//     const serializer = new XMLSerializer();
//     const svgString = serializer.serializeToString(svgElement.node());

//     const blob = new Blob([svgString], { type: "image/svg+xml" });

//     const url = URL.createObjectURL(blob);
//     const downloadLink = document.createElement("a");
//     downloadLink.href = url;
//     downloadLink.download = "map.svg";

//     document.body.appendChild(downloadLink);
//     downloadLink.click();
//     document.body.removeChild(downloadLink);

//     URL.revokeObjectURL(url);
// }


function get_france_svg() {
    const svgElement = d3.select("#svg-france").node();
    const clonedSvgElement = svgElement.cloneNode(true);
    const bbox = svgElement.getBBox();
    clonedSvgElement.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    clonedSvgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "map.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

function get_colorbar_svg() {
    const svgElement = d3.select("#svg-colorbar").node();
    const clonedSvgElement = svgElement.cloneNode(true);
    const bbox = svgElement.getBBox();
    const padding = 10;
    const viewBox = [
        bbox.x - padding, 
        bbox.y - padding, 
        bbox.width + padding * 2, 
        bbox.height + padding * 2
    ].join(" ");
    clonedSvgElement.setAttribute("viewBox", viewBox);
    clonedSvgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "colorbar.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}









function exportCombinedSVG() {

    const cut_left_map = 30;
    const right_colorbar_offset = 40;
    const top_colorbar_offset = 30;
    const top_map_offset = 10;
    const bottom_map_offset = 10;
    
    
    const mapSvgElement = d3.select("#svg-france").node();
    const colorbarSvgElement = d3.select("#svg-colorbar").node();

    // Clone both SVG elements
    const clonedMapSvg = mapSvgElement.cloneNode(true);
    const clonedColorbarSvg = colorbarSvgElement.cloneNode(true);

    // Get bounding box of the map SVG
    const mapBBox = mapSvgElement.getBBox();

    const mapBBox_height_top = mapBBox.y - top_map_offset;
    const mapBBox_height_bottom = mapBBox.height + top_map_offset + bottom_map_offset;
    clonedMapSvg.setAttribute("viewBox", `${mapBBox.x} ${mapBBox_height_top} ${mapBBox.width} ${mapBBox_height_bottom}`);
    clonedMapSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Calculate the desired height for the colorbar (2/3 of map height)
    const colorbarHeight = (2 / 3) * mapBBox.height;

    // Calculate the scaling factor for the colorbar to fit the new height
    const colorbarBBox = colorbarSvgElement.getBBox();
    const colorbarScale = colorbarHeight / colorbarBBox.height;

    const colorbar_width = colorbarBBox.width + 10;
    clonedColorbarSvg.setAttribute("viewBox", `${colorbarBBox.x} ${colorbarBBox.y} ${colorbar_width} ${colorbarBBox.height}`);
    clonedColorbarSvg.setAttribute("width", colorbarBBox.width * colorbarScale);
    clonedColorbarSvg.setAttribute("height", colorbarHeight);
    clonedColorbarSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Calculate total width of the combined SVG
    const combinedWidth = mapBBox.width + (colorbarBBox.width * colorbarScale) + right_colorbar_offset;
    const combinedHeight = mapBBox.height;
    
    // Create a new SVG element to hold both the map and the colorbar
    const combinedSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    combinedSvg.setAttribute("width", combinedWidth);
    combinedSvg.setAttribute("height", combinedHeight);
    combinedSvg.setAttribute("viewBox", `${cut_left_map} 0 ${combinedWidth} ${combinedHeight}`);

    // Position the colorbar to the right of the map
    clonedColorbarSvg.setAttribute("x", mapBBox.width + right_colorbar_offset);
    clonedColorbarSvg.setAttribute("y", top_colorbar_offset);

    // Append cloned SVG elements to the new combined SVG
    combinedSvg.appendChild(clonedMapSvg);
    combinedSvg.appendChild(clonedColorbarSvg);


    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(combinedSvg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "map.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    
    // // Create a data URL for the SVG
    // const svgData = new XMLSerializer().serializeToString(combinedSvg);
    // const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    // const url = URL.createObjectURL(svgBlob);

    // // Set the resolution multiplier
    // const resolutionMultiplier = 5; // Change this value to increase or decrease resolution

    // // Create an image element to render the SVG data
    // const img = new Image();
    // img.onload = function () {
    //     // Create a canvas with the scaled dimensions
    //     const canvas = document.createElement("canvas");
    //     canvas.width = combinedWidth * resolutionMultiplier;
    //     canvas.height = combinedHeight * resolutionMultiplier;

    //     // Scale the context to increase resolution
    //     const ctx = canvas.getContext("2d");
    //     ctx.scale(resolutionMultiplier, resolutionMultiplier);

    //     // Draw the SVG on the canvas
    //     ctx.drawImage(img, 0, 0);

    //     // Export the canvas as a PNG
    //     const pngData = canvas.toDataURL("image/png");

    //     const filename = "map";
    //     // Create a link element to download the PNG
    //     const link = document.createElement("a");
    //     link.download = `${filename || "export"}.png`;
    //     link.href = pngData;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);

    //     // Clean up
    //     URL.revokeObjectURL(url);
    // };
    // img.src = url;
}







function exportSVG() {

    var title = data_point.name_fr;
    var horizon = get_horizon("futur");
    if (horizon === "H1") {
	var horizon_period = "en début de siècle 2021-2050";
    } else if (horizon === "H2") {
	var horizon_period = "en milieu de siècle 2041-2070";
    } else if (horizon === "H3") {
	var horizon_period = "en fin de siècle 2070-2099";
    }
    var model = "Au moins " + get_n() + " modèles hydrologiques par point";
    
    var relatif = data_point.to_normalise ? "relatif " : "";
    var subtitle = "Changements " + relatif + horizon_period + " par rapport à la période de référence 1976-2005";

    const width_max_title = 42;
    const width_max_subtitle = 60;
    let title_wrap = wrapTextByCharacterLimit(title, width_max_title);

    let top_title_line1;
    let top_title;
    let title_line;
    if (title_wrap.length > 1) {
	top_title_line1 = 3;
	top_title = 15;
	title_line = 12;
    } else {
	top_title_line1 = 6;
	top_title = 18;
	title_line = 0;
    }
    let subtitle_wrap = wrapTextByCharacterLimit(subtitle, width_max_subtitle);

    
    const topMargin = 64;
    const bottomMargin = 2;
    const right_cut = 20;

    const left_title_line = 12;
    const top_title_line2 = 45 + title_line;
    
    const left_title = 23;

    const top_subtitle = 32 + title_line;
    const left_subtitle = 23;
    
    const top_colorbar = 132;
    const left_colorbar = -25;
    
    const left_logo = 6;
    const bottom_logo = 30;
    const width_logo = 33;
    const height_logo = 33;

    const left_meandre = 46;
    const bottom_meandre = 10;
    const left_url = 47;
    const bottom_url = 5;
    
    const left_sep_line = 122;
    const bottom_sep_line1 = 4;
    const bottom_sep_line2 = 20;
    
    const bottom_footer = 16;
    const left_footer = 127;

    const right_lo = 48;
    const bottom_lo = 22;
    const width_lo = 18;
    const height_lo = 18;

    const right_lo_text = 28;
    const bottom_lo_text = 14;
    

    
    // // Select existing SVG elements
    // const svgColorbar = d3.select("#svg-colorbar");
    // const svgFrance = d3.select("#svg-france");

    // // Clone both SVG elements
    // const clonedSvgColorbar = svgColorbar.node().cloneNode(true);
    // const clonedSvgFrance = svgFrance.node().cloneNode(true);

    // // Get bounding box of the France SVG
    // const franceBBox = svgFrance.node().getBBox();
    // const colorbarBBox = svgColorbar.node().getBBox();

    // // Define dimensions for the combined SVG
    // const colorbarWidth = colorbarBBox.width + 10;
    // const colorbarHeight = colorbarBBox.height;
    // const franceWidth = franceBBox.width;
    // const franceHeight = franceBBox.height;
    // const combinedWidth = franceWidth + colorbarWidth - right_cut;
    // const combinedHeight = Math.max(franceHeight, colorbarHeight) + topMargin + bottomMargin; 

    
    // // Define new dimensions for the colorbar
    // const newColorbarHeight = combinedHeight * 0.4;  // Height is 1/3 of combined height
    // const colorbarAspectRatio = colorbarWidth / colorbarHeight;
    // const newColorbarWidth = newColorbarHeight * colorbarAspectRatio;

    // // Adjust the viewBox for the France SVG to ensure it fits
    // const mapBBox_height_top = franceBBox.y;
    // const mapBBox_height_bottom = franceBBox.height + mapBBox_height_top;
    // clonedSvgFrance.setAttribute("viewBox", `${franceBBox.x} ${mapBBox_height_top} ${franceBBox.width} ${mapBBox_height_bottom}`);
    // clonedSvgFrance.setAttribute("preserveAspectRatio", "xMidYMid meet");

    

    const svgColorbar = d3.select("#svg-colorbar");
    const svgFrance = d3.select("#svg-france");

    // Clone both SVG elements
    const clonedSvgColorbar = svgColorbar.node().cloneNode(true);
    const clonedSvgFrance = svgFrance.node().cloneNode(true);

    // Get bounding box of the France SVG
    const franceBBox = svgFrance.node().getBBox();
    const colorbarBBox = svgColorbar.node().getBBox();

    // Fixed map height for France
    const fixedMapHeight = 331;

    // Calculate the aspect ratio of the France SVG
    const franceAspectRatio = franceBBox.width / franceBBox.height;

    // Calculate the new width based on the fixed height
    const franceWidth = fixedMapHeight * franceAspectRatio;
    const franceHeight = fixedMapHeight;

    // Adjust the viewBox for the France SVG to match the fixed height
    const mapBBox_height_top = franceBBox.y;
    const mapBBox_height_bottom = franceHeight + mapBBox_height_top;
    clonedSvgFrance.setAttribute("viewBox", `${franceBBox.x} ${mapBBox_height_top} ${franceBBox.width} ${mapBBox_height_bottom}`);
    clonedSvgFrance.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Adjust dimensions for the colorbar based on the new France map height
    const combinedHeight = franceHeight + topMargin + bottomMargin; // New combined height with fixed map height
    const colorbarHeight = combinedHeight * 0.4; // New colorbar height (40% of combined height)
    const colorbarAspectRatio = colorbarBBox.width / colorbarBBox.height;
    const colorbarWidth = colorbarHeight * colorbarAspectRatio + 10; // Adjusted colorbar width

    // Calculate combined width by adding the colorbar's width and the France map width
    const combinedWidth = franceWidth + colorbarWidth;
    // - right_cut;

    console.log(franceBBox);

    

    const combinedSVGNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const combinedSVG = d3.select(combinedSVGNode)
        .attr("width", combinedWidth)
        .attr("height", combinedHeight)
        .attr("xmlns", "http://www.w3.org/2000/svg");

        // Add background color
    combinedSVG.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", combinedWidth)
        .attr("height", combinedHeight)
        .attr("fill", "#F5F5F5");


    combinedSVG.append("line")
	.attr("x1", left_title_line)
	.attr("y1", top_title_line1) 
	.attr("x2", left_title_line)
	.attr("y2", top_title_line2) 
	.attr("stroke", "#C5E7E7")
	.attr("stroke-width", 7);
    
    combinedSVG.append("text")
        .attr("x", left_title)
        .attr("y", top_title)
        .attr("text-anchor", "start")
        .attr("font-size", "15px")
	.attr("font-family", "Raleway, sans-serif")
	.attr("font-weight", "800")
        .attr("fill", "#16171f")
        .selectAll("tspan")
        .data(title_wrap)
        .enter().append("tspan")
        .attr("x", left_title)
        .attr("dy", (d, i) => i === 0 ? 0 : "1em")
        .text(d => d);

    combinedSVG.append("text")
        .attr("x", left_subtitle)
        .attr("y", top_subtitle)
        .attr("text-anchor", "start")
        .attr("font-size", "10px")
	.attr("font-family", "Lato, sans-serif")
	.attr("font-weight", "400")
        .attr("fill", "#16171f")
        .selectAll("tspan")
        .data(subtitle_wrap)
        .enter().append("tspan")
        .attr("x", left_subtitle)
        .attr("dy", (d, i) => i === 0 ? 0 : "1em")
        .text(d => d);
    

    // Add footer
    combinedSVG.append("text")
        .attr("x", left_footer)
        .attr("y", combinedHeight - bottom_footer)
        .attr("text-anchor", "start")
        .attr("font-size", "5px")
	.attr("font-family", "Lato, sans-serif")
	.attr("font-weight", "400")
        .attr("fill", "#060508")
        .selectAll("tspan")
        .data([
            "Ces résultats sont issus de projections hydrologiques réalisées sur la France. La mise à jour",
	    "de ces projections a été réalisé entre 2022 et 2024 dans le cadre du projet national Explore2.",
	    "Ces résultats sont un aperçu de quelques futures possibles pour la ressource en eau."
        ])
        .enter().append("tspan")
        .attr("x", left_footer)
        .attr("dy", (d, i) => i === 0 ? 0 : "1.1em")
        .text(d => d);
    
    // Append France to combined SVG
    combinedSVG.append(() => clonedSvgFrance)
        .attr("x", 0)
        .attr("y", topMargin)
        .attr("width", franceWidth)
        .attr("height", franceHeight);

    // Append colorbar to combined SVG
    combinedSVG.append(() => clonedSvgColorbar)
        .attr("x", franceWidth + left_colorbar)
        .attr("y", top_colorbar)
        .attr("width", colorbarWidth)
        .attr("height", colorbarHeight);


    combinedSVG.append("line")
	.attr("x1", left_sep_line)
	.attr("y1", combinedHeight - bottom_sep_line1) 
	.attr("x2", left_sep_line)
	.attr("y2", combinedHeight - bottom_sep_line2) 
	.attr("stroke", "#C5E7E7")
	.attr("stroke-width", 2);
    
    combinedSVG.append("text")
        .attr("x", left_meandre)
        .attr("y", combinedHeight - bottom_meandre)
        .attr("text-anchor", "start")
        .attr("font-size", "13px")
	.attr("font-family", "Raleway, sans-serif")
        .attr("font-weight", "900")
	.attr("fill", "#16171f")
        .text("MEANDRE");

    combinedSVG.append("text")
        .attr("x", left_url)
        .attr("y", combinedHeight - bottom_url)
        .attr("text-anchor", "start")
        .attr("font-size", "5px")
	.attr("font-family", "Raleway, sans-serif")
        .attr("font-weight", "500")
	.attr("fill", "#16171f")
        .text("meandre.explore2.inrae.fr");

    combinedSVG.append("text")
        .attr("x", combinedWidth - right_lo_text)
        .attr("y", combinedHeight - bottom_lo_text)
        .attr("text-anchor", "start")
        .attr("font-size", "6px")
	.attr("font-family", "Arial, sans-serif")
	.attr("font-weight", "300")
        .attr("fill", "#89898A")
        .selectAll("tspan")
        .data([
            "Licence",
	    "Ouverte"
        ])
        .enter().append("tspan")
        .attr("x", combinedWidth - right_lo_text)
        .attr("dy", (d, i) => i === 0 ? 0 : "1.1em")  // Adjust vertical spacing between lines
        .text(d => d);
    

    // Fetch the first logo (MEANDRE logo)
    fetch('/resources/logo/MEANDRE_logo.svg')
	.then(response => response.text())
	.then(svgData => {
            const base64Logo1 = btoa(svgData);

            // Append the first logo (MEANDRE)
            combinedSVG.append("image")
		.attr("href", "data:image/svg+xml;base64," + base64Logo1)
		.attr("x", left_logo)
		.attr("y", combinedHeight - bottom_logo)
		.attr("width", width_logo)
		.attr("height", height_logo)
		.attr("preserveAspectRatio", "xMidYMid meet");

            // Fetch the second logo (another SVG)
            fetch('/resources/licence_ouverte/Logo-licence-ouverte2_grey.svg')
		.then(response => response.text())
		.then(svgData2 => {
                    const base64Logo2 = btoa(svgData2);

                    // Append the second logo
                    combinedSVG.append("image")
			.attr("href", "data:image/svg+xml;base64," + base64Logo2)
			.attr("x", combinedWidth - right_lo)
			.attr("y", combinedHeight - bottom_lo) 
			.attr("width", width_lo)
			.attr("height", height_lo)
			.attr("preserveAspectRatio", "xMidYMid meet");

                    // Serialize the combined SVG to a string
                    const combinedSVGNode = combinedSVG.node();
                    const svgString = new XMLSerializer().serializeToString(combinedSVGNode);
                    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
                    const svgUrl = URL.createObjectURL(svgBlob);

                    // Set the resolution multiplier
                    const resolutionMultiplier = 5;  // Change this value to increase or decrease resolution

                    // Create an image element to render the SVG data
                    const img = new Image();
                    img.onload = function () {
			// Create a canvas with the scaled dimensions
			const canvas = document.createElement("canvas");
			canvas.width = combinedWidth * resolutionMultiplier;
			canvas.height = combinedHeight * resolutionMultiplier; // Include extra space
			const ctx = canvas.getContext("2d");
			ctx.scale(resolutionMultiplier, resolutionMultiplier);

			// Draw the SVG on the canvas
			ctx.drawImage(img, 0, 0);

			// Export the canvas as a PNG
			const pngData = canvas.toDataURL("image/png");

			// Create a link element to download the PNG
			const link = document.createElement("a");
			link.download = "combined.png";
			link.href = pngData;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up
			URL.revokeObjectURL(svgUrl);
                    };
                    img.src = svgUrl;

                    // Remove the combined SVG from the document
                    combinedSVG.remove();
		});
	});

}


function wrapTextByCharacterLimit(text, maxChars) {
    let words = text.split(' '); // Split the text into words
    let lines = [];
    let currentLine = [];

    words.forEach(word => {
        let currentLineLength = currentLine.join(' ').length;

        // If the word fits within the max limit, add it to the current line
        if (currentLineLength + word.length + 1 <= maxChars) {
            currentLine.push(word);
        } else {
            // If the line reaches the limit, push it to lines and start a new line
            lines.push(currentLine.join(' '));
            currentLine = [word];
        }
    });

    // Add the last line if there are remaining words
    if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
    }

    return lines;
}


