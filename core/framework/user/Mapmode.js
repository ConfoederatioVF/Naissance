if (!global.naissance) global.naissance = {};

/**
 * ##### Constructor:
 * - `arg0_mapmode_id`: {@link string}
 * - `arg1_options`: {@link Object}
 *   - `.icon`: {@link string}
 *   - `.name`: {@link string}
 *   - `.layer="bottom"`: {@link string} - Either 'bottom'/'top', targets `main.layers.mapmode_<key>_layer`.
 *   - 
 *   - `.onhide`: {@link function}(v:{@link naissance.Mapmode}) - Called upon mapmode being hidden.
 *   - `.onshow`: {@link function}(v:{@link naissance.Mapmode}) - Called upon mapmode being shown.
 *   - `.node_editor_file`: {@link string}
 *   - `.node_editor_value`: {@link Object}
 *   - `.special_function`: {@link function} | {@link maptalks.Geometry}[] - Called upon mapmode being shown or drawn.
 *   - `.tooltip`: {@link string}
 * 
 * @type {naissance.Mapmode}
 */
naissance.Mapmode = class extends ve.Class { //[WIP] - Finish class body
	static instances = [];
	
	constructor (arg0_mapmode_id, arg1_options) {
		//Convert from parameters
		let mapmode_id = arg0_mapmode_id;
		let options = (arg1_options) ? arg1_options : {};
			super();
			
		//Initialise options
		if (!options.layer) options.layer = "bottom";
			
		//Declare local instance variables
		this.geometries = [];
		this.id = (mapmode_id) ? mapmode_id : Class.generateRandomID(naissance.Mapmode);
		this.options = options;
		
		naissance.Mapmode.instances.push(this);
	}
	
	get is_enabled () {
		//Iterate over all naissance.Mapmode.instances
		for (let i = 0; i < main.user.mapmodes.length; i++)
			if (main.user.mapmodes[i] === this.id)
				//Return statement
				return true;
		return false;
	}
	
	drawHierarchyDatatype () {
		//Declare local instance variables
		let display_name = (this.options.name) ? this.options.name : this.id;
		
		//Return statement
		return veButton(() => {
			if (!this.is_enabled) {
				this.show();
			} else {
				this.hide();
			}
			main.interfaces.mapmodes_ui.draw();
		}, {
			attributes: {
				"data-selected-mapmode": this.is_enabled
			},
			name: `<icon>${(this.options.icon) ? this.options.icon : "flag"}</icon><span style = 'display: none'>${display_name}</span>`,
			tooltip: display_name
		});
	}
	
	hide () {
		//Iterate over all this.geometries and remove them from the map
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		this.geometries = [];
		
		//Remove mapmode from main.user.mapmodes
		for (let i = 0; i < main.user.mapmodes.length; i++)
			if (main.user.mapmodes[i] === this.id) {
        if (this.options.onhide) this.options.onhide(this);
				main.user.mapmodes.splice(i, 1);
				break;
			}
	}
	
	initLayer () {
		let local_key = `mapmode_${this.id}`;
		let local_mapmode_layer = main.layers[local_key];
		
		if (!local_mapmode_layer) {
			main.layers[local_key] = new maptalks.VectorLayer(local_key, [], {
				hitDetect: true,
				interactive: true
			});
			main.layers[local_key].addTo(map);
		}
	}
	
	setGeometries (arg0_geometries) {
		//Convert from parameters
		let geometries = (arg0_geometries) ? arg0_geometries : [];
		
		//Declare local instance variables
		this.initLayer();
		let mapmode_layer = main.layers[`mapmode_${this.id}`];
		
		//Iterate over all present this.geometries
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		for (let i = 0; i < geometries.length; i++)
			geometries[i].addTo(mapmode_layer);
		this.geometries = geometries;
		
		//Return statement
		return this.geometries;
	}
	
	show () {
		if (!main.user.mapmodes.includes(this.id)) main.user.mapmodes.push(this.id);
		naissance.Mapmode.draw();
		
		if (this.options.onshow) this.options.onshow(this);
	}
	
	static draw () {
		//Declare local instance variables
		let z_index_obj = naissance.Mapmode.getZIndexes();
		
		//Iterate over all main.user.mapmodes in order and render them
		for (let i = 0; i < main.user.mapmodes.length; i++) {
			let local_mapmode;
			for (let x = 0; x < naissance.Mapmode.instances.length; x++)
				if (naissance.Mapmode.instances[x].id === main.user.mapmodes[i]) {
					local_mapmode = naissance.Mapmode.instances[x];
					break;
				}
			
			//Remove all current geometries before resetting
			for (let x = 0; x < local_mapmode.geometries.length; x++)
				local_mapmode.geometries[x].remove();
			
			//Draw the local_mapmode if possible
			{
				//Initialise layer
				local_mapmode.initLayer();
				let local_key = `mapmode_${local_mapmode.id}`;
				let local_mapmode_layer = main.layers[local_key]; //Refresh ref
					local_mapmode_layer.setZIndex(z_index_obj[local_mapmode.id]);
				
				//Assign new_geometries
				let new_geometries = local_mapmode.options.special_function(local_mapmode);
				
				if (new_geometries !== undefined) {
					local_mapmode.geometries = new_geometries;
				} else {
					console.warn(`naissance.Mapmode: ${local_mapmode.id}.special_function does not return a valid geometries array.`);
				}
				
				//Iterate over all local_mapmode.geometries and draw them
				for (let x = 0; x < local_mapmode.geometries.length; x++) {
					let local_geometry = local_mapmode.geometries[x];
					
          local_geometry.config("interactive", !main.settings.disable_mapmode_interactivity);
					local_geometry.remove();
					local_geometry.addTo(local_mapmode_layer);
				}
			}
		}
	}
	
	/**
	 * Returns a map of mapmode IDs to their actual z-indexes. Disabled mapmodes are not included.
	 * 
	 * @returns {{ "<mapmode_key>": number }}
	 */
	static getZIndexes () { //[WIP] - Finish function body
		//Declare local instance variables
		let bottom_mapmodes = 0;
		let current_mapmodes = main.user.mapmodes;
		let map_defines = config.defines.map;
		let map_settings = main.map.settings;
		let return_obj = {};
		
		//Iterate over current_mapmodes in order
		for (let i = current_mapmodes.length - 1; i >= 0; i--) {
			let local_mapmode;
			for (let x = 0; x < naissance.Mapmode.instances.length; x++)
				if (naissance.Mapmode.instances[x].id === main.user.mapmodes[i]) {
					local_mapmode = naissance.Mapmode.instances[x];
					break;
				}
			
			//Fetch local_layer
			if (map_settings?.mapmodes?.[local_mapmode.id]?.layer)
				local_mapmode.options.layer = map_settings.mapmodes[local_mapmode.id].layer;
			let local_layer = local_mapmode.options.layer;
			
			if (local_layer === "bottom") {
				bottom_mapmodes++;
				return_obj[local_mapmode.id] = map_defines.default_z_indices[0] - bottom_mapmodes;
			} else {
				return_obj[local_mapmode.id] = map_defines.default_z_indices[1] + i;
			}
		}
		
		//Return statement
		return return_obj;
	}
	
	/**
	 * Loads config mapmodes from `config.mapmodes`, mapmodes with conflicting IDs are replaced
	 */
	static loadConfig () {
		//Iterate over config.mapmodes if it exists
		if (config.mapmodes)
			Object.iterate(config.mapmodes, (local_key, local_value) => {
				//Iterate over naissance.Mapmode.instances and remove duplicate mapmodes
				for (let i = naissance.Mapmode.instances.length - 1; i >= 0; i--) {
					let local_mapmode = naissance.Mapmode.instances[i];
					
					if (local_mapmode.id === local_key) {
						local_mapmode.hide();
						naissance.Mapmode.instances.splice(i, 1);
					}
				}
				
				//Push local_value as new mapmode
				config.mapmodes[local_key].instance = new naissance.Mapmode(local_key, local_value);
			});
		main.interfaces.mapmodes_ui.draw();
	}
};