



function update() {
    var variable = get_variable();
    var historical = get_period("historical");
    var futur = get_period("futur");

    var EXP_GCM_RCM = get_chunk_of_chain('[id^="block_"][id$="_RCM"]:visible');
    var BC_HM = get_chunk_of_chain('[id^="block_"][id$="_HM"]:visible');
    var chain = get_chain(EXP_GCM_RCM, BC_HM);
    
    console.log(variable);
    console.log(historical);
    console.log(futur);
    console.log(EXP_GCM_RCM);
    console.log(BC_HM);
    console.log(chain);

    // Construct the data payload to send to the backend
    var data = {
        chain: chain,
        variable: variable,
        historical_start: historical[0],
        historical_end: historical[1],
        futur_start: futur[0],
        futur_end: futur[1]
    };

    // Make a POST request to the Flask backend using fetch API
    fetch('http://127.0.0.1:5000/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        // Process the response data from the backend
        console.log('Received data from backend:', data);
        // Update the UI with the received data
        // Example: Display the data in a table on the webpage
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors
    });
}




function get_variable() {
    var variableBunch = $('#bunch-variable');
    var selectedButton = variableBunch.find('.selected')[0];
    var variableName = selectedButton.getAttribute('value');
    return variableName;
}

function get_period(horizon) {
    var sliderHorizon = $('#slider-horizon_'+horizon)[0];
    var bunchHorizon = $('#bunch-horizon_'+horizon);
    if (sliderHorizon.classList.contains("slider-unselect")) {
	var buttonHorizon = bunchHorizon.find('.selected')[0];
	var period = buttonHorizon.getAttribute('value').split(', ');
    } else {
	var period = sliderHorizon.noUiSlider.get();
	futur[0] = futur[0] + "-01-01"
	futur[1] = futur[1] + "-12-31"
    }
    return period;
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
	const geoJSONdata_france = geoJSONdata[0];
	const geoJSONdata_river = geoJSONdata[1];
	const geoJSONdata_entiteHydro = geoJSONdata[2];
	drawGeoJSON(geoJSONdata_france, geoJSONdata_river, geoJSONdata_entiteHydro);
    })
    .catch(error => {
	console.error("Error loading or processing GeoJSON files:", error);
    });



function drawGeoJSON(geoJSONdata_france, geoJSONdata_river, geoJSONdata_entiteHydro) {
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
	}



	const pathGenerator = d3.geoPath(projection);

	redrawMap();
	handleResize();
	

	return svg.node();
    }
}








document.addEventListener('DOMContentLoaded', function () {

    var rangeSlider_reference = document.getElementById('slider-horizon_historical');
    noUiSlider.create(rangeSlider_reference, {
	start: [1970, 2000],
	margin: 30,
	behaviour: 'drag-smooth-steps-tap',
	step: 5,
	connect: true,
	keyboardDefaultStep: 1,
	keyboardPageMultiplier: 2,
	keyboardMultiplier: 1,
	tooltips: [wNumb({decimals: 0}), wNumb({decimals: 0})],
	format: {
	    from: function(value) {
		return parseInt(value);
	    },
	    to: function(value) {
		return parseInt(value);
	    }
	},
	range: {
	    'min': 1970,
	    'max': 2020
	},
	pips: {
	    mode: 'values',
	    values: [1970, 2000, 2020],
	    density: 10,
	    format: wNumb({
		decimals: 0,
	    })
	}
	
    });
    mergeTooltips(rangeSlider_reference, 100, ' - ');


    var rangeSlider_futur = document.getElementById('slider-horizon_futur');
    noUiSlider.create(rangeSlider_futur, {
	start: [2040, 2070],
	margin: 30,
	behaviour: 'drag-smooth-steps-tap',
	step: 5,
	connect: true,
	keyboardDefaultStep: 1,
	keyboardPageMultiplier: 2,
	keyboardMultiplier: 1,
	tooltips: [wNumb({decimals: 0}), wNumb({decimals: 0})],
	format: {
	    from: function(value) {
		return parseInt(value);
	    },
	    to: function(value) {
		return parseInt(value);
	    }
	},
	range: {
	    'min': 2020,
	    'max': 2100
	},
	pips: {
	    mode: 'values',
	    values: [2020, 2050, 2100],
	    density: 10,
	    format: wNumb({
		decimals: 0,
	    })
	}
	
    });
    mergeTooltips(rangeSlider_futur, 100, ' - ');
})




function mergeTooltips(slider, threshold, separator) {
    var textIsRtl = getComputedStyle(slider).direction === 'rtl';
    var isRtl = slider.noUiSlider.options.direction === 'rtl';
    var isVertical = slider.noUiSlider.options.orientation === 'vertical';
    var tooltips = slider.noUiSlider.getTooltips();
    var origins = slider.noUiSlider.getOrigins();
    var arrows = [];
    tooltips.forEach(function (tooltip, index) {
	if (tooltip) {
	    let div = document.createElement('div');
	    div.classList.add('noUi-tooltip-arrow');
	    origins[index].appendChild(div);
	    origins[index].appendChild(tooltip);
	    arrows.push(div);
	}
    });
    
    slider.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) {
	
	var pools = [[]];
	var poolPositions = [[]];
	var poolValues = [[]];
	var atPool = 0;

	// Assign the first tooltip to the first pool, if the tooltip is configured
	if (tooltips[0]) {
	    pools[0][0] = 0;
	    poolPositions[0][0] = positions[0];
	    poolValues[0][0] = values[0];
	}

	for (var i = 1; i < positions.length; i++) {
	    if (!tooltips[i] || (positions[i] - positions[i - 1]) > threshold) {
		atPool++;
		pools[atPool] = [];
		poolValues[atPool] = [];
		poolPositions[atPool] = [];
	    }

	    if (tooltips[i]) {
		pools[atPool].push(i);
		poolValues[atPool].push(values[i]);
		poolPositions[atPool].push(positions[i]);
	    }
	}

	pools.forEach(function (pool, poolIndex) {
	    var handlesInPool = pool.length;

	    for (var j = 0; j < handlesInPool; j++) {
		var handleNumber = pool[j];

		if (j === handlesInPool - 1) {
		    var offset = 0;

		    poolPositions[poolIndex].forEach(function (value) {
			offset += 1000 - value;
		    });

		    var direction = isVertical ? 'bottom' : 'right';
		    var last = isRtl ? 0 : handlesInPool - 1;
		    var lastOffset = 1000 - poolPositions[poolIndex][last];
		    offset = (textIsRtl && !isVertical ? 100 : 0) + (offset / handlesInPool) - lastOffset;
		    
		    // Center this tooltip over the affected handles
		    tooltips[handleNumber].innerHTML = poolValues[poolIndex].join(separator);
		    tooltips[handleNumber].style.display = 'block';
		    tooltips[handleNumber].style[direction] = offset + '%';

		    arrows[handleNumber].style.display = 'block';
		    arrows[handleNumber].style[direction] = offset + '%';
		    
		} else {
		    // Hide this tooltip
		    tooltips[handleNumber].style.display = 'none';
		    arrows[handleNumber].style.display = 'none';
		}
	    }
	});
    });
}
