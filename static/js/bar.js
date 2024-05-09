

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

