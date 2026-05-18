global.UI_MapSettings = class UI_MapSettings extends ve.Class { //[WIP] - Finish serialisation/deserialisation, map date settings
	constructor () {
		super();
		
		//Declare local instance variables
		let previous_window = document.querySelector(`.ve.window[id="UI_MapSettings"]`)?.instance;
		if (previous_window) previous_window.close();
		this.projection_obj = {
			"EPSG:4326": {
				name: "Equirectangular",
				options: { projection: "EPSG:4326" }
			},
			"EPSG:3857": {
				name: "Mercator",
				options: { projection: "EPSG:3857" }
			}
		};
		let spatial_reference = map.getSpatialReference();
		
		if (this.projection_obj[spatial_reference._projection.code])
			this.projection_obj[spatial_reference._projection.code].selected = true;
		
		this.interface = veWindow({
			date_settings: veInterface({
				autoload_last_date: veToggle(main.map.settings.autoload_last_date, { 
					name: "Autoload last date", 
					tooltip: "If no load date is specified, this field defaults to the current date.",
					to_binding: "main.map.settings.autoload_last_date",
					x: 0, y: 0
				}),
				constant_load_date: veToggle(main.map.settings.constant_load_date, {
					name: "Constant Load Date",
					to_binding: "main.map.settings.constant_load_date",
					x: 0, y: 1
				}),
				constant_load_date_value: veDate(main.map.settings.constant_load_date_value, {
					tooltip: "Superseded by Autoload last date.",
					to_binding: "main.map.settings.constant_load_date_value",
					x: 1, y: 1
				})
			}, { name: "Date", open: true }),
			projection_settings: veInterface({
				projection: veSelect(this.projection_obj, {
					name: "Projection",
					onuserchange: (v) => this._DALS_setProjection(v),
					x: 0, y: 0
				}),
				proj4js_string: veText("", {
					name: "Proj4JS String",
					x: 0, y: 1
				}),
				proj4js_confirm_settings: veButton(() => this._DALS_setCustomProjection(this.interface.projection_settings.proj4js_string.v), {
					name: "Apply Proj4JS Projection",
					tooltip: `<span style = "align-items: top; display: flex;"><icon>warning</icon><span style = "margin-left: 0.5rem;">Back up your save before applying a new Proj4JS projection, as custom projections can be unstable!</span></span>`,
					x: 1, y: 1
				})
			}, { name: "Projection", open: true })
		}, { 
			can_rename: false,
			id: "UI_MapSettings",
			name: "Map Settings",
			width: "30rem"
		});
	}
	
	_DALS_setCustomProjection (arg0_proj4js_string, arg1_do_not_add_to_undo_redo) {
		//Convert from parameters
		let proj4js_string = (arg0_proj4js_string) ? arg0_proj4js_string : "";
		let do_not_add_to_undo_redo = arg1_do_not_add_to_undo_redo;
		
		//Declare local instance variables
		let proj4js_transform = proj4("WGS84", proj4js_string);
		
		//Fire action
		if (proj4js_string.length > 0)
			DALS.Timeline.parseAction({
				options: { name: "Set Map Projection", key: "set_map_projection" },
				value: [{ type: "Renderer", set_map_spatial_reference: {
					projection: {
						code: "proj4-custom",
						project: (c) => {
							if (!Array.isArray(c.toArray())) return new maptalks.Coordinate([0, 0]);
							let pc = proj4js_transform.forward(c.toArray());
							
							//If projection returns invalid or NaN, return neutral coords
							if (!pc || isNaN(pc[0]) || isNaN(pc[1])) pc = [0, 0];
							return new maptalks.Coordinate(pc);
						},
						unproject: (pc) => {
							if (!Array.isArray(pc.toArray())) return new maptalks.Coordinate([0, 0]);
							let result = proj4js_transform.inverse(pc.toArray());
							if (!result || isNaN(result[0]) || isNaN(result[1])) result = [0, 0];
							return new maptalks.Coordinate(result);
						},
						measure: "EPSG:4326"
					},
					fullExtent: config.defines.map.custom_projections_full_extent,
					resolutions: config.defines.map.custom_projections_resolutions
				} }]
			}, do_not_add_to_undo_redo);
	}
	
	_DALS_setProjection (arg0_projection, arg1_do_not_add_to_undo_redo) {
		//Convert from parameters
		let projection = arg0_projection;
		let do_not_add_to_undo_redo = arg1_do_not_add_to_undo_redo;
		
		//Declare local instance variables
		let selected_projection_obj = this.projection_obj[projection];
		
		//Fire action
		if (selected_projection_obj.options)
			DALS.Timeline.parseAction({
				options: { name: "Set Map Projection", key: "set_map_projection" },
				value: [{ type: "Renderer", set_map_spatial_reference: selected_projection_obj.options }]
			}, do_not_add_to_undo_redo);
	}
	
	static fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		if (json.settings)
			main.map.settings = json.settings;
		
		//Set date
		if (json.date)
			if (main.map.settings.autoload_last_date) {
				UI_DateMenu.setDate(JSON.parse(json.date));
			} else if (main.map.settings.constant_load_date) {
				UI_DateMenu.setDate(main.map.settings.constant_load_date);
			}
		//Set spatial reference
		if (json.spatial_reference)
			map.setSpatialReference(json.spatial_reference);
		
		//Update mapmode draw
		main.interfaces.mapmodes_ui.draw();
	}
	
	static toJSON () {
		//Declare local instance variables
		let json_obj = {
			date: JSON.stringify(main.date),
			settings: main.map.settings,
			spatial_reference: map.getSpatialReference().toJSON()
		};
		
		//Return statement
		return json_obj;
	}
};