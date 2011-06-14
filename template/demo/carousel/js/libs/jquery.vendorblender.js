/*
File: jquery.vendorblender.js

About: Version
	0.1

Project: jQuery Vendor Blender
	http://github.com/doctyper/jquery-vendorblender/

Description:
	Allows you to auto-prefix experimental CSS properties

Usage:
	- First, define the property (or properties) to be auto-prefixed:
		- $.fn.vendorblender("transform");
		- $.fn.vendorblender(["transform", "perspective"]);
	
	- Then, use as normal:
		- $("#foo").css("transform", "rotateY(90deg)");

Author:
	- Richard Herrera (@doctyper)
	- Based on Zachary Johnson's transform monkeypatch (github.com/zachstronaut/jquery-css-transform/)

Requires:
	- jQuery <http://jquery.com/>
	
*/
(function ($) {
	$.fn.vendorblender = function (property) {
		var undef = "undefined",
		    cachedCSSMethod;
		
		if (!$.fn.vendorblender.overridden) {
			cachedCSSMethod = $.fn.css;
			
			$.fn.css = function (arg, val) {
				var orig = $.fn.vendorblender.properties[arg];
				
				if (orig) {
					// Find the correct browser specific property and setup the mapping using
					// $.props which is used internally by jQuery.attr() when setting CSS
					// properties via either the css(name, value) or css(properties) method.
					// The problem with doing this once outside of css() method is that you
					// need a DOM node to find the right CSS property, and there is some risk
					// that somebody would call the css() method before body has loaded or any
					// DOM-is-ready events have fired.
					if (typeof $.props[arg] === "undefined" && (typeof arg === "string" || (typeof arg === "object" && typeof arg[arg] !== "undefined"))) {
						$.props[arg] = orig;
					}

					// We force the property mapping here because jQuery.attr() does
					// property mapping with jQuery.props when setting a CSS property,
					// but curCSS() does *not* do property mapping when *getting* a
					// CSS property.  (It probably should since it manually does it
					// for 'float' now anyway... but that'd require more testing.)
					//
					// But, only do the forced mapping if the correct CSS property
					// is not 'transform' and is something else.
					if ($.props[arg] !== arg) {
						// Call in form of css(arg ...)
						if (typeof arg === "string") {
							arg = $.props[arg];

							// User wants to GET the transform CSS, and in jQuery 1.4.3
							// calls to css() for transforms return a matrix rather than
							// the actual string specified by the user... avoid that
							// behavior and return the string by calling jQuery.style()
							// directly
							if (typeof val === "undefined" && $.style) {
								return $.style(this.get(0), arg);
							}
						} else if (typeof arg === "object" && typeof arg[arg] !== "undefined") {
							// Call in form of css({arg: ...})
							arg[$.props[arg]] = arg[arg];
							delete arg[arg];
						}
					}
				}
				
				return cachedCSSMethod.apply(this, arguments);
			};
			
			$.fn.vendorblender.overridden = true;
		}
		
		if (!$.isArray(property)) {
			property = [property];
		}
		
		$.each(property, function (i, prop) {
			addVendorProperty(prop);
		});
		
		return this;
	};

	function addVendorProperty (property) {
		$.fn.vendorblender.properties = $.fn.vendorblender.properties || {};
		
		if (!$.fn.vendorblender.properties[property]) {
			$.fn.vendorblender.properties[property] = getVendorProperty(property);
		}
	}

	function getVendorProperty (property) {
		var dummy = $('<div></div>').appendTo(document.body),
		    prefixes = "Webkit Moz ms O ".split(" "),
		    camelCasedProp = property.replace(property.charAt(0), property.charAt(0).toUpperCase()),
		    prefixedProp = property;
		
		$.each(prefixes, function (i, prefix) {
			var prop = prefix + (prefix ? camelCasedProp : property);
			if (typeof dummy.get(0).style[prop] !== "undefined") {
				dummy.remove();
				prefixedProp = prop;
				return false;
			}
		});
		
		dummy.remove();
		return prefixedProp;
	}
})(jQuery);
