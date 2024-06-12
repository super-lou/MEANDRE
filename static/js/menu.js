

function selectAllButton(selectedButton) {
    var buttons = selectedButton.parentNode.querySelectorAll('button');
    buttons.forEach(function (button) {
	button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');

    update_data_debounce();
}



function selectButton(selectedButton) {
    if (selectedButton.classList.contains('selected')) {
        selectedButton.classList.remove('selected');
    } else {
        selectedButton.classList.add('selected');
    }

    update_data_debounce();
}


function load_slider() {
    var slider = document.getElementById('slider-n');
    
    noUiSlider.create(slider, {
	start: [default_n],
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
	update_data_debounce();
    });
}


function selectVariableButton(selectedButton) {
    var buttons = selectedButton.parentNode.querySelectorAll('button');
    buttons.forEach(function (button) {
	button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
    update_data_debounce();
}


function selectHorizonButton(selectedButton) {
    var buttons = selectedButton.parentNode.querySelectorAll('button');
    buttons.forEach(function (button) {
	button.classList.remove('selected');
    });
    selectedButton.classList.add('selected');
    update_data_debounce();
}




function toggle_menu() {
    const menu_container = document.getElementById("container-menu");
    const menu = document.getElementById("menu");
    const icon = document.getElementById("tab_personnalisation-avancee-icon");
    const title = document.getElementById("tab_personnalisation-avancee-text");
    const button = document.getElementById("tab_personnalisation-avancee");
    const bar = document.getElementById("bar");
    
    if (menu_container.classList.contains("expanded")) {
        menu_container.classList.remove("expanded");
        menu.classList.add("hidden");
        icon.style.display = "block"; 
        title.style.display = "block";
	bar.classList.remove("expanded");
	button.classList.remove("expanded");
        setTimeout(() => {
	    icon.classList.remove("expanded");
	    title.classList.remove("expanded");

        }, 300);
    } else {
        menu_container.classList.add("expanded");
        menu.classList.remove("hidden");
	icon.classList.add("expanded");
	title.classList.add("expanded");
	button.classList.add("expanded");
	bar.classList.add("expanded");
        setTimeout(() => {
            icon.style.display = "none";
            title.style.display = "none";
        }, 300);
    }

    setTimeout(() => {
	check_bar();
    }, 300);
}


let drawer_mode = 'drawer-chain';
function toggle_drawer(drawerId) {
    var drawer_to_check = ['drawer-narratif',
			   'drawer-RCP',
			   'drawer-chain'];

    if (drawer_to_check.includes(drawerId)) {
	drawer_mode = drawerId;
	drawer_to_check.forEach(function(id) {
	    var drawerContent = document.getElementById(id + "-content");
	    var drawerIcon = document.getElementById(id + "-icon");
	    if (id === drawerId) {
		if (drawerContent.classList.contains("expanded")) {
		    drawerContent.classList.remove("expanded");
		    drawerIcon.classList.remove("rotated");
		} else {
		    drawerContent.classList.add("expanded");
		    drawerIcon.classList.add("rotated");
		    update_data_debounce();
		}
	    } else {
		if (drawerContent.classList.contains("expanded")) {
		    drawerContent.classList.remove("expanded");
		    drawerIcon.classList.remove("rotated");
		}	
	    }
	})
	
    } else {
	var drawerContent = document.getElementById(drawerId + "-content");
	var drawerIcon = document.getElementById(drawerId + "-icon");
	if (drawerContent.classList.contains("expanded")) {
            drawerContent.classList.remove("expanded");
            drawerIcon.classList.remove("rotated");
	} else {
            drawerContent.classList.add("expanded");
            drawerIcon.classList.add("rotated");
	}
    }
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

}





function show_HM(selectedButton) {
    var BC = selectedButton.id.split('_')[0];
    var HM = selectedButton.id.split('_')[1];
    
    if (HM === "HM") {
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


function get_chunk_of_chain(value, search="selected") {
    var blockChain = $(value);
    var buttonsChain = blockChain.find("." + search);
    
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


function get_RCP_only() {
    var container = document.getElementById('bunch_RCP_only');
    var selectedButton = container.querySelector('button.selected');
    return selectedButton.value;
}

function get_narratif_only() {
    var container = document.getElementById('bunch_narratif');
    var selectedButton = container.querySelector('button.selected');
    return [selectedButton.value];
}

function get_chain() {
    // var drawer_to_check = ['drawer-narratif',
    // 			   'drawer-RCP',
    // 			   'drawer-chain'];

    if (drawer_mode === 'drawer-chain') {
	var EXP_GCM_RCM = get_chunk_of_chain('[id^="block_"][id$="_RCM"]:visible');
	var BC_HM = get_chunk_of_chain('[id^="block_"][id$="_HM"]:visible');
	var chain = [];
	EXP_GCM_RCM.forEach(function(item1) {
            BC_HM.forEach(function(item2) {
		chain.push(item1 + "_" + item2);
            });
	});
	
    } else if (drawer_mode === 'drawer-narratif') {
	var EXP_GCM_RCM_BC = get_narratif_only();
	var HM = ["CTRIP", "EROS", "GRSD", "J2000", "MORDOR-SD",
		  "MORDOR-TS", "ORCHIDEE", "SIM2", "SMASH"];
	var chain = [];
	EXP_GCM_RCM_BC.forEach(function(item1) {
            HM.forEach(function(item2) {
		chain.push(item1 + "_" + item2);
            });
	});

    } else if (drawer_mode === 'drawer-RCP') {
	var rcp = "chain_" + get_RCP_only();
	var EXP_GCM_RCM = get_chunk_of_chain('[id^="block_"][id$="_RCM"]',
					     search=rcp);
	var BC_HM = get_chunk_of_chain('[id^="block_"][id$="_HM"]',
				       search="chain");
	var chain = [];
	EXP_GCM_RCM.forEach(function(item1) {
            BC_HM.forEach(function(item2) {
		chain.push(item1 + "_" + item2);
            });
	});
    }

    var chain = chain.map(function(element) {
	return "historical-rcp" + element;
    });

    return chain;
}

