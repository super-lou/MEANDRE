

function toggle_subtab(tab) {
    var subbars = $('.subbar');
    subbars.each(function() {
	var subbar = $(this);
	var subtabs = $("[id^='" + subbar.attr("id") + "'][class^='subbar-tab']");
	
	if (subbar.hasClass("expanded")) {
	    subtabs.each(function() {
		$(this).removeClass("expanded");
	    });
	    setTimeout(() => {
		subbar.removeClass("expanded");
		subtabs.each(function() {
		    $(this).css("display", "none");
		});
	    }, 300);
	    
	} else if (subbar.attr("id").startsWith(tab.id)) {
	    subbar.addClass("expanded");
	    subtabs.each(function() {
		$(this).css("display", "flex");
	    });
	    setTimeout(() => {
		subtabs.each(function() {
		    $(this).addClass("expanded");
		});
	    }, 300);
	}
    });

    setTimeout(() => {
	check_bar();
    }, 300);
}


function check_bar() {
    var bar = document.getElementById("bar");
    var sep = document.getElementById("last-sep");
    var arrows = $('.arrow');
    
    if (bar.scrollWidth > bar.offsetWidth) {
	arrows.each(function() {
	    $(this).addClass("show");
	});
	sep.style.display = "none";
    } else {
	arrows.each(function() {
	    $(this).removeClass("show");
	});
	sep.style.display = "inline-flex";
    }
}

function scroll_bar_left() {
    var bar = document.getElementById('bar');
    bar.scrollBy({ left: -200, behavior: 'smooth' });
}
function scroll_bar_right() {
    var bar = document.getElementById('bar');
    bar.scrollBy({ left: 200, behavior: 'smooth' });
}




function select_tab() {
    var url = window.location.href;
    var path = new URL(url).pathname;
    var parts = path.split('/');
    var tab = parts[1];
    var subtab = parts[2];

    const tabs = document.querySelectorAll('.bar-tab');
    tabs.forEach(tab => {
        tab.classList.remove('selected');
    });
    const subtabs = document.querySelectorAll('.subbar-tab');
    subtabs.forEach(tab => {
        tab.classList.remove('selected');
    });

    var selected_tab = $("#tab_" + tab);
    selected_tab.addClass('selected');
    var selected_subtab = $("#tab_" + tab + "_" + subtab);
    selected_subtab.addClass('selected');
    
    // element.classList.add('selected');

    
    
    // if (parts[pageIndex + 1]) {
    // 	var page = parts[pageIndex + 1];
    // } else {
    // 	var page = parts[pageIndex];
    // }
    // page = page.replace('.html', '');

    // console.log(page);

    // if (page === "projets") {
    // 	var IDs = ['header_tab-projets', 'projets_subtab-projets']
    // } else if (page === "amenagements") {
    // 	var IDs = ['header_tab-projets', 'header_subtab-amenagements', 'projets_subtab-amenagements']
    // } else if (page === "microarchitectures") {
    // 	var IDs = ['header_tab-projets', 'header_subtab-microarchitectures', 'projets_subtab-microarchitectures']
    // } else if (page === "signaletiques") {
    // 	var IDs = ['header_tab-projets', 'header_subtab-signaletiques', 'projets_subtab-signaletique']
    // } else if (page === "chantiers_participatifs") {
    // 	var IDs = ['header_tab-projets', 'header_subtab-chantiers_participatifs', 'projets_subtab-chantiers_participatifs']

    // } else if (page === "mobiliers") {
    // 	var IDs = ['header_tab-mobiliers']
    // } else if (page === "agencements") {
    // 	var IDs = ['header_tab-mobiliers', 'header_subtab-agencements', 'mobiliers_subtab-agencements']
    // } else if (page === "ligne_de_mobilier") {
    // 	var IDs = ['header_tab-mobiliers', 'header_subtab-ligne_de_mobilier', 'mobiliers_subtab-ligne_de_mobilier']

    // } else if (page === "ateliers") {
    // 	var IDs = ['header_tab-ateliers']
    // } else if (page === "ateliers_sur-mesures") {
    // 	var IDs = ['header_tab-ateliers', 'header_subtab-ateliers_sur-mesures', 'ateliers_subtab-ateliers_sur-mesures']
    // } else if (page === "notre_offre") {
    // 	var IDs = ['header_tab-ateliers', 'header_subtab-notre_offre', 'ateliers_subtab-notre_offre']

    // } else if (page === "contact") {
    // 	var IDs = ['header_tab-contact']

    // } else {
    // 	var IDs = null
    // }

    // $('a.selected').removeClass('selected');

    // if (IDs) {
    // 	IDs.forEach(function (id) {
    // 	    var div = $("#" + id)[0];
    // 	    console.log(div);
    // 	    if (div) {
    // 		div.classList.add('selected');
    // 	    }
    // 	});
    // }
}
