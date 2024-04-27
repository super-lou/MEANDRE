









function unique(array) {
    return array.filter(function(item, index) {
        return array.indexOf(item) === index;
    });
}

function selectVariableButton(selectedButton) {
    var buttons = selectedButton.parentNode.querySelectorAll('button');
    buttons.forEach(function (button) {
	button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
}



function addUnselectedClass(bunchId) {
    var bunch = document.getElementById(bunchId);
    bunch.classList.add('unselected');
}

function removeUnselectedClass(bunchId) {
    var bunch = document.getElementById(bunchId);
    bunch.classList.remove('unselected');
}

function removeSelectedClass(bunchId) {
    var buttons = document.querySelectorAll('#' + bunchId + ' button');
    buttons.forEach(function(button) {
        button.classList.remove('selected');
    });
}

function removeSelectedClass(sliderId, bunchId) {
    var buttons = document.querySelectorAll('#' + bunchId + ' button');
    buttons.forEach(function(button) {
        button.classList.remove('selected');
    });

    var slider = document.getElementById(sliderId);
    slider.classList.remove('slider-unselect');
}



function selectHorizonButton(selectedButton, sliderId) {
    var buttons = selectedButton.parentNode.querySelectorAll('button');
    buttons.forEach(function (button) {
	button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
        
    var slider = document.getElementById(sliderId);
    slider.classList.add('slider-unselect');
}





function toggleMenu() {
    var threebar = $('.threebar')[0];
    var threebar_class = threebar.getAttribute('class').split(' ')[1];
    if (threebar_class === "hamburger") {
	$('.threebar')
	    .removeClass('hamburger')
	    .addClass('cross');
    } else if (threebar_class === "cross") {
	$('.threebar')
	    .removeClass('cross')
	    .addClass('hamburger');
    }

    /* const menuButton = document.getElementById("menuButton");
       if (menuButton.classList.contains("expanded")) {
       menuButton.classList.remove("expanded");
       } else {
       menuButton.classList.add("expanded");
       } */

    const menu = document.getElementById("menu");
    const menuExpand = document.getElementById("menuExpand");
    const menuSep = document.getElementById("menuSep");

    if (menu.classList.contains("expanded")) {
	menu.classList.remove("expanded");
	menuExpand.classList.add("hidden");
	menuSep.classList.remove("sep");
    } else {
	menu.classList.add("expanded");
	menuExpand.classList.remove("hidden");
	menuSep.classList.add("sep");
    }
}

function toggleDrawer(drawerId) {
    var drawerContent = document.getElementById(drawerId + "-content");
    var drawerIcon = document.getElementById(drawerId + "-icon");

    if (drawerContent.classList.contains("expanded")) {
        drawerContent.classList.remove("expanded");
        drawerIcon.classList.remove("rotated"); // Remove rotated class
    } else {
        drawerContent.classList.add("expanded");
        drawerIcon.classList.add("rotated"); // Add rotated class
    }
}


const CTRIP_color = "#A88D72";
const EROS_color = "#CECD8D";
const GRSD_color = "#619C6C";
const J2000_color = "#00a3a6";
const MORDORSD_color = "#D8714E";
const MORDORTS_color = "#AE473E";
const ORCHIDEE_color = "#EFA59D";
const SIM2_color = "#475E6A";
const SMASH_color = "#F6BA62";

var icon_storyLines = {
    "ASTER": "local_fire_department",
    "DAHLIA": "wb_sunny",
    "NARCISSE": "filter_drama",
    "EUPHORBE": "umbrella"
};

var RCP = null;
var GCM = null;
var RCM = null;


// function get_selectedClimateChain() {
//     var RCM_block = $('[id^="block_"][id$="_RCM"]:visible');
    
//     if (RCM_block.length > 0) {

// 	console.log(RCM_block.find('.selected'));
	
// 	var RCM_button = RCM_block.find('.selected')[0];
// 	var RCP = RCM_button.id.split('_')[0];
// 	var GCM = RCM_button.id.split('_')[1];
// 	var RCM = RCM_button.id.split('_')[2];
	
// 	var RCM_class = RCM_button.getAttribute('class').split(' ');
// 	var RCM_class = RCM_class.filter(function(chr) {
// 	    return chr !== 'selected';})[0];

// 	if (RCM_class && RCM_class.length > 0) {
// 	    if (RCM_class === "ASTER" || RCM_class === "EUPHORBE") {
// 		var button_id = ['85_GCM', '85_HadGEM2-ES_RCM', 'ADAMONT_HM'];
// 	    } else {
// 		var button_id = ['85_GCM', 'ADAMONT_HM'];
// 	    }
// 	    button_id.forEach(function(id) {
// 		document.getElementById('icon_' + id).innerHTML = icon_storyLines[RCM_class]
// 		var button_class = $('#' + id)[0].getAttribute('class').split(' ');
// 		if (button_class.includes('selected')) {
// 		    $('#' + id).removeClass().addClass(RCM_class + ' selected');
// 		} else {
// 		    $('#' + id).removeClass().addClass(RCM_class);
// 		}
// 	    });
// 	}
//     }
// }
function get_selectedClimateChain() {
    var iconContainers = ['#icon_85_GCM', '#icon_ADAMONT_HM', '#icon_85_HadGEM2-ES_RCM'];

    iconContainers.forEach(function(containerID) {

	if (containerID === '#icon_85_HadGEM2-ES_RCM') {
	    var icon_storyLines = {
		"ASTER": "local_fire_department",
		"DAHLIA": "",
		"NARCISSE": "",
		"EUPHORBE": "umbrella"
	    };
	} else {
	    var icon_storyLines = {
		"ASTER": "local_fire_department",
		"DAHLIA": "wb_sunny",
		"NARCISSE": "filter_drama",
		"EUPHORBE": "umbrella"
	    };
	}
	
        var RCM_block = $('[id^="block_"][id$="_RCM"]:visible');
        var iconContainer = $(containerID);
	

        // Reset style to display icons
        iconContainer.removeAttr('style');

        if (RCM_block.length > 0) {
            var selectedRCMButtons = RCM_block.find('.selected');

            if (selectedRCMButtons.length > 0) {
                var iconsAdded = false;
                iconContainer.empty();

                selectedRCMButtons.each(function() {
                    var RCM_button = this;
                    var RCM_class = RCM_button.getAttribute('class').split(' ').filter(function(chr) {
                        return chr !== 'selected';
                    });

                    RCM_class.forEach(function(cls, index) {
                        var icon = icon_storyLines[cls];
                        iconContainer.append('<span class="material-icons-outlined inline-front">' + icon + '</span>');

                        // Check if the icon is the "umbrella" icon
                        if (icon === 'umbrella') {
                            // Apply smaller left and right margins to reduce spacing
                            iconContainer.children().last().addClass('reduce-space');
                        }

                        // Set iconsAdded to true if any icon is added
                        iconsAdded = true;
                    });
                });

                if (!iconsAdded) {
                    iconContainer.attr('style', 'display: none;');
                }
            }
        }
    });
}

get_selectedClimateChain();


// function update_colorHM() {
//     var HM_bunch = $('[id^="bunch_"][id$="_HM"]:visible');
//     if (HM_bunch.length > 0) {
// 	var HM_button = HM_bunch.find('.selected')[0];
// 	var BC = HM_button.id.split('_')[0];
// 	var HM = HM_button.id.split('_')[1];
// 	$('#colorHM').css('color', eval(HM.replace(/-/, "") + '_color'));
//     }
// }
// update_colorHM();



function selectAllButton(selectedButton) {
    var buttons = selectedButton.parentNode.querySelectorAll('button');
    buttons.forEach(function (button) {
	button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');

    // update_colorHM();
    get_selectedClimateChain();
}



function selectButton(selectedButton) {
    if (selectedButton.classList.contains('selected')) {
        selectedButton.classList.remove('selected');
    } else {
        selectedButton.classList.add('selected');
    }

    // update_colorHM();
    get_selectedClimateChain();
}



function toggleBlock(selectedBlock) {
    var bunch = document.getElementById(selectedBlock.id.replace("button", "bunch"));
    var buttons = bunch.children;
    var buttons = Array.from(buttons);

    var hasSelected = false;
    buttons.forEach(function(button) {
    	if (button.classList.contains("selected")) {
            hasSelected = true;
            return;
    	}
    });

    buttons.forEach(function(button) {
    	if (hasSelected) {
	    if (button.classList.contains("selected")) {
		button.classList.remove("selected");
		show_GCM_RCM(button)
	    }
    	} else {
            button.classList.add("selected");
	    show_GCM_RCM(button)
    	}
    });


}


function show_GCM_RCM(selectedButton) {
    var RCP = selectedButton.id.split('_')[0];
    var GCM = selectedButton.id.split('_')[1];
    var RCM = selectedButton.id.split('_')[2];

    if (GCM === "GCM") {

	var GCM_blockAll = document.querySelectorAll(`[id^="block_"][id$="_GCM"]`);
	GCM_blockAll.forEach(function (GCM_block) {
	    GCM_block.style.display = 'none';
	});
	var GCM_selectedBlock = document.getElementById(`block_${RCP}_GCM`);
	if (GCM_selectedBlock) {
	    GCM_selectedBlock.style.display = 'flex';
	}


	
	var RCM_blockAll = document.querySelectorAll(`[id^="block_"][id$="_RCM"]`);
	RCM_blockAll.forEach(function (RCM_block) {
	    RCM_block.style.display = 'none';
	});

	var RCM_blockAll = document.querySelectorAll(`[id^="block_${RCP}"][id$="_RCM"]`);

	var GCM_selectedBunch = document.getElementById(`bunch_${RCP}_GCM`);
	var GCM_buttonSelected = GCM_selectedBunch.querySelectorAll('.selected');
	var GCM_selected = Array.from(GCM_buttonSelected).map(button => button.id.split('_')[1]);

	
	RCM_blockAll.forEach(function (RCM_block) {
	    var GCM = RCM_block.id.split('_')[2];
	    if (GCM_selected.includes(GCM)) {
		RCM_block.style.display = 'flex';
	    } else {
		RCM_block.style.display = 'none';
	    }
	});

    }
    if (RCM === "RCM") {
	var RCM_selectedBlock = document.getElementById(`block_${RCP}_${GCM}_RCM`);
	if (RCM_selectedBlock.style.display === 'flex') {
	    RCM_selectedBlock.style.display = 'none';
	} else {
	    RCM_selectedBlock.style.display = 'flex';
	}
    }

    get_selectedClimateChain();
}





function show_HM(selectedButton) {
    var BC = selectedButton.id.split('_')[0];
    var HM = selectedButton.id.split('_')[1];
    
    if (HM === "HM") {
	// var HM_blockAll = document.querySelectorAll(`[id^="block_"][id$="_HM"]`);
	// HM_blockAll.forEach(function (HM_block) {
	    // HM_block.style.display = 'none';
	// });
	var HM_selectedBlock = document.getElementById(`block_${BC}_HM`);
	if (HM_selectedBlock.style.display === 'flex') {
	    HM_selectedBlock.style.display = 'none';
	} else {
	    HM_selectedBlock.style.display = 'flex';
	}
    }
}













function get_n() {
    var slider = document.getElementById('slider-n');
    var n = parseInt(slider.noUiSlider.get());
    return n;
}


function get_variable() {
    var variableBunch = $('#bunch-variable');
    var selectedButton = variableBunch.find('.selected')[0];
    var variableName = selectedButton.getAttribute('value');
    return variableName;
}

function get_horizon(horizon) {
    var bunchHorizon = $('#bunch-horizon_'+horizon);
    var buttonHorizon = bunchHorizon.find('.selected')[0];
    var horizon = buttonHorizon.getAttribute('value');
    return horizon;
}


function get_chunk_of_chain(value) {
    var blockChain = $(value);
    var buttonsChain = blockChain.find('.selected');
    var Chain = [];
    buttonsChain.each(function() {
	Chain.push($(this).attr('id'));
    });
    var Chain = Chain.filter(function(item, index, self) {
	return self.indexOf(item) === index;
    });
    return Chain;
}


function get_HM() {
    var BC_HM = get_chunk_of_chain('[id^="block_"][id$="_HM"]:visible');
    var HM = BC_HM.map(item => item.split('_')[1]);
    HM = unique(HM);
    return HM;
}


function get_chain(array1, array2) {
    var chain = [];
    array1.forEach(function(item1) {
        array2.forEach(function(item2) {
            chain.push(item1 + "_" + item2);
        });
    });
    var chain = chain.map(function(element) {
	return "historical-rcp" + element;
    });
    return chain;
}






function update() {
    update_data();
}




let dataBackend;
let data;



function update_data() {

    var n = get_n();
    var variable = get_variable();
    var horizon = get_horizon("futur");

    var EXP_GCM_RCM = get_chunk_of_chain('[id^="block_"][id$="_RCM"]:visible');
    var BC_HM = get_chunk_of_chain('[id^="block_"][id$="_HM"]:visible');
    var chain = get_chain(EXP_GCM_RCM, BC_HM);
    var exp = chain[0].split('_')[0].replace('-', '_');

    var data_query = {
	n: n,
        exp: exp,
        chain: chain,
        variable: variable,
        horizon: horizon,
    };

    fetch('http://127.0.0.1:5000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_query)
    })
    .then(response => response.json())
    .then(dataBackend => {
        console.log('Data received from backend');	
	// console.log(dataBackend);

	data = dataBackend.data
	
	draw_map(geoJSONdata_france,
		    geoJSONdata_river,
		    geoJSONdata_entiteHydro,
		    data);

	update_grid(dataBackend);
	draw_colorbar(dataBackend);
	
    })
    .catch(error => {
        console.error('Error:', error);
    });
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
    
    
    var EXP_GCM_RCM = get_chunk_of_chain('[id^="block_"][id$="_RCM"]:visible');
    var BC_HM = get_chunk_of_chain('[id^="block_"][id$="_HM"]:visible');
    var chain = get_chain(EXP_GCM_RCM, BC_HM);
    var exp = chain[0].split('_')[0].replace('-', '_');

    
    document.getElementById("grid-variable_variable").textContent = variable;
    document.getElementById("grid-variable_sampling-period").innerHTML = "Année hydrologique " + sampling_period;
    document.getElementById("grid-variable_name").innerHTML = dataBackend.name_fr;
    
    document.getElementById("grid-horizon_name").innerHTML = "Horizon " + horizon_name;

    period = period.replace(/ - /g, "</b> au <b>");
    document.getElementById("grid-horizon_period-l1").innerHTML = "Période futur du <b>" + period + "</b>";
    document.getElementById("grid-horizon_period-l2").innerHTML = "Période de référence du <b>01/01/1976</b> au <b>31/08/2005</b>";


    // var gridElement = document.getElementById("grid-title_n");
    // gridElement.textContent = n;
    
}




function close_grid(element) {
    element.parentNode.style.display = "none";
    selected_code = null;
    highlight_selected_point();
}



function draw_colorbar(dataBackend) {
    document.getElementById("grid-variable_unit").innerHTML = dataBackend.unit_fr;

    var bin = dataBackend.bin.slice(1, -1).reverse();
    var palette = dataBackend.palette.reverse();
    var step = 25;
    var shift = 20;

    const svg = d3.select("#svg-colorbar");

    svg.attr("height", (palette.length - 1) * step + shift * 2);
    svg.attr("width", "50%");

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
        .text(d => {
            return d > 0 ? "+" + d : d;
	});
    texts.exit().remove();

    var selectedColor = null;
    const circles = svg.selectAll(".color-circle")
        .data(palette);
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
	    d3.select(this).attr("r", 6);
	})
	.each(function(d, i) {
            d3.select(this)
	        .on("click", function(event, d) {
		    var clickedColor = d;

		    if (selectedColor === clickedColor) {
			d3.select("#geoJSONsvg_france").selectAll(".point")
			    .attr("opacity", 1);
			selectedColor = null;
			svg.selectAll(".color-circle, .tick-line, .bin-text")
			    .attr("opacity", 1);
			
		    } else {
			d3.select("#geoJSONsvg_france").selectAll(".point")
			    .attr("opacity", function(d) {
				return d.fill === clickedColor ? 1 : 0.1;
			    });
			selectedColor = clickedColor;

			svg.selectAll(".color-circle")
			    .attr("opacity", function() {
				return this === event.target ? 1 : 0.3;
			    });
			svg.selectAll(".tick-line")
			    .attr("opacity", function(d, j) {
				return j === i || j === i - 1 ? 1 : 0.3;
			    });
			svg.selectAll(".bin-text")
			    .attr("opacity", function(d, j) {
				return j === i || j === i - 1 ? 1 : 0.3;
			    });
		    }
		});
	});
    circles.exit().remove();
    

    

    // svg.selectAll(".color-circle")
    //     .on("click", function(event, d) {
    //         var clickedColor = d;

    //         if (selectedColor === clickedColor) {
    //             d3.select("#geoJSONsvg_france").selectAll(".point")
    //                 .attr("opacity", 1);
    //             selectedColor = null;
    //         } else {
    //             d3.select("#geoJSONsvg_france").selectAll(".point")
    //                 .attr("opacity", function(d) {
    //                     return d.fill === clickedColor ? 1 : 0.1;
    //                 });
    //             selectedColor = clickedColor;
    //         }
    //     });
}











let geoJSONdata_france, geoJSONdata_river, geoJSONdata_entiteHydro;

const geoJSONfiles = [
    "data/france.geo.json",
    "data/river.geo.json",
    "data/entiteHydro.geo.json"
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

	// update_data();
	draw_map(geoJSONdata_france,
		 geoJSONdata_river,
		 geoJSONdata_entiteHydro,
		 data);
	update();
    })
    .catch(error => {
	console.error("Error loading or processing GeoJSON files:", error);
    });



let selected_code = null;
function highlight_selected_point() {
    
    const svg = d3.select("#geoJSONsvg_france");
    svg.selectAll(".point.clicked")
        .attr("stroke-width", 0)
        .attr("r", 3)
        .classed("clicked", false);
    
    if (selected_code !== null) {
        const svg = d3.select("#geoJSONsvg_france");

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




function draw_map(geoJSONdata_france,
		     geoJSONdata_river,
		     geoJSONdata_entiteHydro,
		     data) {


    d3.select("#geoJSONsvg_france").selectAll("*").remove();
    
    if (geoJSONdata_france && geoJSONdata_river) {
	
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

	const zoom = d3.zoom()
	      .scaleExtent([minZoom, maxZoom])
	      .on("zoom", function (event) { 
		  riverLength = riverLength_max - (event.transform.k - minZoom)/(maxZoom-minZoom)*(riverLength_max-riverLength_min);
		  k_simplify = k_simplify_ref + (event.transform.k - minZoom)/(maxZoom-minZoom)*(1-k_simplify_ref);

		  redrawMap();
		  highlight_selected_point();
		  
		  svg.attr("transform", event.transform);
		  svg.style("width", width * event.transform.k + "px");
		  svg.style("height", height * event.transform.k + "px");
	      });


	const projection = d3.geoMercator()
	      .center(geoJSONdata_france.features[0].properties.centroid);


	const svg = d3.select("#geoJSONsvg_france")
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
	    svg.attr("width", width).attr("height", height);
	    projection.scale([height*3.2]).translate([width / 2, height / 2]);	    
	    redrawMap();
	    highlight_selected_point();
	}

	window.addEventListener("resize", handleResize.bind(null, k_simplify, riverLength));

	function redrawMap() {
	    
	    const simplifiedGeoJSON_france = geotoolbox.simplify(geoJSONdata_france, { k: k_simplify, merge: false });
	    const selectedGeoJSON_river = geotoolbox.filter(geoJSONdata_river, (d) => d.norm >= riverLength);
	    const simplifiedselectedGeoJSON_river = geotoolbox.simplify(selectedGeoJSON_river, { k: k_simplify, merge: false });
	    
	    svg.selectAll("path.france")
		.data(simplifiedGeoJSON_france.features)
		.join("path")
		.attr("class", "france")
		.attr("d", pathGenerator)
		.transition()
		.duration(1000)
		.attr("fill", fill_france)
		.attr("stroke", stroke_france)
		.attr("stroke-width", strokeWith_france)
		.attr("stroke-linejoin", "miter")
		.attr("stroke-miterlimit", 1);

	    svg.selectAll("path.river")
		.data(simplifiedselectedGeoJSON_river.features)
		.join("path")
		.attr("class", "river")
		.attr("d", pathGenerator)
		.transition()
		.duration(1000)
		.attr("fill", "transparent")
		.attr("stroke", stroke_river)
		.attr("stroke-width", function(d) {
		    return strokeWith_river_max - (1 - d.properties.norm) * (strokeWith_river_max - strokeWith_river_min);
		})
		.attr("stroke-linejoin", "miter")
		.attr("stroke-linecap", "round")
		.attr("stroke-miterlimit", 1);

	    
	    if (data) {

		svg.selectAll(".point").remove();
		svg.selectAll("circle.point")
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
			document.getElementById("panel-hover_code").innerHTML = d.code;
			const value = d.value.toFixed(2);
			document.getElementById("panel-hover_value").innerHTML =
			    "<span style='color:" + d.fill_text + ";'>" +
			    "<span style='font-weight: 900;'>" +
			    (value > 0 ? "+" : "") + value + " </span>%</span>";
			
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
			} else {
			    selected_code = point.code;
			    document.getElementById("grid-point").style.display = "flex";
			}
			highlight_selected_point();
			
			document.getElementById("grid-point_code").innerHTML = point.code;

			const value = point.value.toFixed(2);
			document.getElementById("grid-point_value").innerHTML =
			    "<span style='color:" + point.fill_text + ";'>" +
			    "<span style='font-weight: 900;'>" +
			    (value > 0 ? "+" : "") + value + " </span>%</span>";
			
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
			
			document.getElementById("grid-point_xl93").innerHTML =
			    "<span class='text-light'>XL93: </span>" +
			    Math.round(point.xl93_m) +
			    " <span class='text-light'>m</span>";
			document.getElementById("grid-point_yl93").innerHTML =	
			    "<span class='text-light'>YL93: </span>" + 
			    Math.round(point.yl93_m) +
			    " <span class='text-light'>m</span>";

			document.getElementById("grid-point_lat").innerHTML =
			    "<span class='text-light'>lat: </span>" +
			    Math.abs(point.lat_deg.toFixed(2)) +
			    " <span class='text-light'>°</span>" + (point.lat_deg >= 0 ? "N" : "S");
			document.getElementById("grid-point_lon").innerHTML =	
			    "<span class='text-light'>lon: </span>" + 
			    Math.abs(point.lon_deg.toFixed(2)) +
			    " <span class='text-light'>°</span>" + (point.lon_deg >= 0 ? "E" : "W") ;

			var HM = get_HM();
			var surface_HM = HM.map(hm => "surface_" +
						hm.toLowerCase().replace('-', '_') +
						"_km2");
			surface_HM = surface_HM.map(x => point[x]);
			var isnotNull = surface_HM.map(value => value !== null);
			HM = HM.filter((_, index) => isnotNull[index]);
			surface_HM = surface_HM.filter((_, index) => isnotNull[index]);
			surface_HM = surface_HM.map(x => Math.round(x));

			document.getElementById("grid-point_surface").innerHTML =
			    "<span class='text-light'>Surface: </span>" +
			    Math.round(point.surface_km2) +
			    " <span class='text-light'>km<sup>2</sup></span>";
			
			surface =
			    HM.reduce((str, hm, index) =>
				      str +
				      `<span class='text-light nowrap'>${hm}:&nbsp;</span>${surface_HM[index]}` +
				      "&nbsp;<span class='text-light'>km<sup>2</sup></span>&nbsp;&nbsp; ",
				      "");
			document.getElementById("grid-point_surface_HM").innerHTML = surface;
		    });
	    }

	}

	const pathGenerator = d3.geoPath(projection);

        redrawMap();
        handleResize();
    }
}

























document.addEventListener('DOMContentLoaded', function () {

    var slider = document.getElementById('slider-n');
    
    noUiSlider.create(slider, {
	start: [4],
	behaviour: 'drag-smooth-steps-tap',
	step: 1,
	connect: true,
	keyboardDefaultStep: 1,
	keyboardPageMultiplier: 2,
	keyboardMultiplier: 1,
	range: {
	    'min': 1,
	    'max': 9
	},
	pips: {
	    mode: 'values',
	    values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
	    density: 100,
	}
    });


    var startValue = slider.noUiSlider.get();
    var maxPos = Math.max(startValue) - 1;
    $(slider).find('.noUi-value:visible').removeClass('highlight').eq(maxPos).addClass('highlight');
    
    slider.noUiSlider.on('change', function(values) {
    	var maxPos = Math.max(values) -1;
        $(slider).find('.noUi-value:visible').removeClass('highlight').eq(maxPos).addClass('highlight');
    });

})







