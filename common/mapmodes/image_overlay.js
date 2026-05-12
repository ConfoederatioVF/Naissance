config.mapmodes.image_overlay = {
	name: "Image Overlay",
	icon: "image",
	description: "Overlay images on top of the main map.",
	
	//Options
	max_lat: 89.99,
	max_lng: 180,
	min_lat: -90,
	min_lng: -180,
	opacity: 1,
	
	onhide: function (v) {
		//Declare local instance variables
		let config_obj = config.mapmodes.image_overlay;
		
		config_obj._layer.setImages([]);
		config_obj._layer.remove();
	},
	onshow: function (v) {
		//Declare local instance variables
		let config_obj = config.mapmodes.image_overlay;
		
		if (main.interfaces.image_overlay) main.interfaces.image_overlay.close();
		main.interfaces.image_overlay = new ve.Window({
			image_path: new ve.Text(config_obj.image_path, {
				name: "Image Path",
				onuserchange: (v) => {
					config_obj.image_path = v;
					config_obj.redraw();
				}
			}),
			opacity: new ve.Range(config_obj.opacity, {
				onuserchange: (v) => {
					config_obj.opacity = v;
					config_obj.redraw();
				}
			}),
			max_lat: new ve.Number(config_obj.max_lat, {
				name: "Max. Lat (Y)",
				onuserchange: (v) => { config_obj.max_lat = v; config_obj.redraw(); }
			}),
			max_lng: new ve.Number(config_obj.max_lng, {
				name: "Max. Lng (X)",
				onuserchange: (v) => { config_obj.max_lng = v; config_obj.redraw(); }
			}),
			min_lat: new ve.Number(config_obj.min_lat, {
				name: "Min. Lat (Y)",
				onuserchange: (v) => { config_obj.min_lat = v; config_obj.redraw(); }
			}),
			min_lng: new ve.Number(config_obj.min_lng, {
				name: "Min. Lng (X)",
				onuserchange: (v) => { config_obj.min_lng = v; config_obj.redraw(); }
			}),
		}, {
			name: "Image Overlay",
			can_rename: false,
			width: "20rem"
		})
	},
	
	redraw: function () {
		//Declare local instance variables
		let config_obj = config.mapmodes.image_overlay;
		
		if (config_obj._layer) config_obj._layer.remove();
		if (config_obj.image_path?.length) {
			config_obj._layer = new maptalks.ImageLayer("images", [{
				url: config_obj.image_path,
				extent: [config_obj.min_lng, config_obj.min_lat, config_obj.max_lng, config_obj.max_lat],
				opacity: config_obj.opacity,
			}]);
			config_obj._layer.addTo(main.map);
			config_obj._layer.bringToFront();
		}
		
		//Return statement
		return [];
	},
	special_function: function (v) {
		//Declare local instance variables
		let config_obj = config.mapmodes.image_overlay;
		
		//Return statement
		return config_obj.redraw();
	}
};