$(document).ready(function () {
	var viewport = $("#viewport"), ratio,
	    inner = $("#viewport-inner"), innerTranslation,
	    sections = $("> section", inner),
	    degrees = 360 / sections.length,
	    degree = 0, rotateX = 0, rotateY = 0,
	    tab = sections.eq(0).outerWidth(true),
	    currentIndex = 0, translateZ;
	
	$(".parallax").each(function () {
		var plx = $(this);
		
		$(".parallax-layer", plx).parallax({
			mouseport: plx,
			yparallax: false
		});
	});
	
	// Auto prefix these properties
	$.fn.vendorblender(["transform", "perspective-origin-y"]);
	
	if (!Modernizr.csstransforms3d) {
		sections.width(sections.eq(0).width());
		inner.width(tab * sections.length);
	}
	
	function adjustViewport () {
		if (Modernizr.csstransforms3d) {
			
			// Half the width of a section divided by the tangent of PI by the number of sections
			translateZ = (sections.eq(0).width() / 2) / Math.tan(Math.PI / sections.length);
			
			ratio = inner.height() / inner.width();
			
			innerTranslation = "translate3d(0, 0, -" + (translateZ * 1.5) + "px)";
			inner.css("transform", innerTranslation);
			
			sections.each(function () {
				$(this).css("transform", "rotateY(" + degree + "deg) translateZ(" + (translateZ) + "px)");
				
				if (viewport.hasClass("carousel")) {
					$(this).find(".parallax").css("transform", "rotateY(-" + degree + "deg)");
				}
				
				degree += degrees;
			});
		}
	}
	
	// viewport.bind("mousemove", function (e) {
	// 	var pct = Math.round((e.pageY / viewport.height()) * 100);
	// 	$(this).css("perspective-origin-y", pct + "%");
	// });
	
	$(window).bind("resize", adjustViewport);
	
	$(document).bind("keydown", function (e) {
		switch(e.keyCode) {
		case 37: // left
			rotateY -= degrees;
			currentIndex = Math.max(0, currentIndex - 1);
			break;

		case 38: // up
			rotateX += degrees;
			break;

		case 39: // right
			rotateY += degrees;
			currentIndex = Math.min(sections.length - 1, currentIndex + 1);
			break;

		case 40: // down
			rotateX -= degrees;
			break;
		}
		
		if (Modernizr.csstransforms3d) {
			inner.css("transform", innerTranslation + " rotateX(" + rotateX + "deg)" + " rotateY(" + rotateY + "deg)");
			
			if (viewport.hasClass("carousel")) {
				sections.find(".parallax").each(function () {
					var plx = $(this),
					    transform, regexp, plxY;

					if (plx.data("rotateY") === undefined) {
						transform = plx.css("transform");
						regexp = (/rotateY\((.*)deg\)/).exec(transform);
						plxY = window.parseInt(regexp[1]);
						plx.data("rotateY", plxY);
					}

					plx.css("transform", "rotateY(" + (plx.data("rotateY") - rotateY) + "deg)");
				});
			}
		} else if (Modernizr.csstransforms) {
			inner.css("transform", "translateX(-" + (tab * currentIndex) + "px)");
		}
	}, false);
	
	adjustViewport();
});
