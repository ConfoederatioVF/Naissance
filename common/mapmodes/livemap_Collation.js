config.mapmodes.livemap_Collation = {
	name: "Collation (Livemap)",
	icon: "visibility",
	description: `Streams live intelligence into Naissance. Workers must be active for real-time data. These workers can be toggled from the map overlay menu.`,
	tooltip: "Live intelligence from active Ontologies.",

  onhide: function (v) {
    //Declare local instance variables
		let config_obj = config.mapmodes.livemap_Collation;

    //Iterate over all config_obj.geometries
    for (let i = 0; i < config_obj.geometries.length; i++)
      config_obj.geometries[i].remove();
    config_obj.geometries = [];

    config_obj.instance.setGeometries([]);
  },
	onshow: function (v) {
		//Declare local instance variables
		let config_obj = config.mapmodes.livemap_Collation;
		
		//Refresh Collation Livemap window
		if (main.interfaces.livemap_Collation) main.interfaces.livemap_Collation.close();
		main.interfaces.livemap_Collation = new ve.Window({
			hours_ago: new ve.Number(Ontology_Event.draw_hours_ago, {
				name: "Hours Ago (Event)",
				onuserchange: (v) => {
					Ontology_Event.draw_hours_ago = v;
					config_obj.redraw();
				}
			}),
			ais_days_ago: new ve.Number(Math.returnSafeNumber(config_obj.AISFriends?.options?.days_ago_threshold, 7), {
				name: "Days Ago (AIS)",
				onuserchange: (v) => {
					if (config_obj.AISFriends) {
						config_obj.AISFriends.options.days_ago_threshold = v;
						config_obj.redraw();
					}
				}
			})
		}, {
			name: "Livemap (Collation)",
			can_rename: false
		});
	},
	
	redraw: function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let config_obj = config.mapmodes.livemap_Collation;
			config_obj.geometries = [];
		
		//Iterate over all Ontologies and draw them
		for (let i = 0; i < Ontology.instances.length; i++) {
			let local_ontology = Ontology.instances[i];
			
			config_obj.geometries = config_obj.geometries.concat(local_ontology.draw());
		}
		
		//[TEMP] - Draw calls for other Collation data sources
		let localDraw = () => { //30s draw loop
			if (!config_obj.instance.is_enabled) return; //Internal guard clause to ensure draw is only active if mapmode is
			
			//AIS Data
			if (!config_obj.AISFriends) config_obj.AISFriends = new GLOBAL_Navy_AISFriends_Worker();
			config_obj.AISFriends.draw().then(() => {
				if (config_obj.AISFriends.geometries)
					config_obj.geometries = config_obj.geometries.concat(config_obj.AISFriends.geometries);
				config_obj.instance.setGeometries(config_obj.geometries); //Set geometries
			});
			
			//UA Conflict Data
			try {
				if (!options.do_not_reload) {
					if (config_obj.UAControlMap) config_obj.UAControlMap.remove();
					config_obj.UAControlMap = new UA_UkraineControlMap({
						onload: () => this.redraw({ do_not_reload: true })
					});
				}
				if (config_obj.UAControlMap?.geokmz?.layer) {
					let all_layer_geometries = config_obj.UAControlMap.geokmz.layer.getGeometries();
					config_obj.geometries = config_obj.geometries.concat(all_layer_geometries);
					config_obj.UAControlMap.geokmz.layer.clear();
				}
			} catch (e) { console.error(e); }
		};
		
		//Immediate draw pattern; [WARN] - This destroys manual z-index handling
		if (!config_obj.logic_loop)
			config_obj.logic_loop = setInterval(localDraw, 30000);
		localDraw();
		
		//Sort geometries
		config_obj.geometries = Geospatiale.sortGeometries(config_obj.geometries);
		
		//Return statement
		return config_obj.instance.setGeometries(config_obj.geometries);
	},
	
	special_function: function (v) {
		//Declare local instance variables
		let config_obj = config.mapmodes.livemap_Collation;
		
		//Return statement
		return config_obj.redraw();
	}
};