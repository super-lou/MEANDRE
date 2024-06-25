

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
window.addEventListener('resize', function() {
    check_bar();
});

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

    var selected_close_tab = $("#tab_close_" + tab);
    // console.log("#tab_close_" + tab);
    // console.log(selected_close_tab);
    selected_close_tab.addClass('selected');
    
    var selected_subtab = $("#tab_" + tab + "_" + subtab);
    selected_subtab.addClass('selected');
}
