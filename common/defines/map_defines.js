config.defines.map = {
	custom_projections_full_extent: {
		top: 6378137 * Math.PI,
		left: -6378137 * Math.PI,
		bottom: -6378137 * Math.PI,
		right: 6378137 * Math.PI,
	}, //The full map extents of custom zoom projections. Global by default.
	custom_projections_resolutions: [156543.03392804097, 78271.51696402048, 39135.75848201024,
		19567.87924100512, 9783.93962050256, 4891.96981025128,
		2445.98490512564, 1222.99245256282, 611.49622628141,
		305.748113140705, 152.8740565703525, 76.43702828517625,
		38.21851414258813], //The zoom level resolutions to display when a custom proj4js projection is set.
	
	default_label_symbol: {
		textFaceName: "Karla",
		textFill: "white",
		textHaloFill: "black",
		textHaloRadius: 2,
		textSize: {
			stops: [
				[2, 0],
				[4, 10],
				[5, 14],
			],
		}
	},
	default_z_indices: [0, 8] //Heuristic bounds for default z-indices. Bottom mapmodes are z-indexed underneath [0]; top mapmodes are z-indexed above [1]
};