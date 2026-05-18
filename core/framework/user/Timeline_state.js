//State mutation functions
{
	DALS.Timeline.parseAction = function (arg0_json, arg1_do_not_push_action) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		let do_not_push_action = arg1_do_not_push_action;
		
		//Initialise JSON
		if (json.options === undefined) json.options = {};
		if (json.value === undefined) json.value = [];
		
		//Iterate over multi-value packet (MVP) and filter it down to superclass single-value packets (SVPs)
		//console.log(json.value);
		for (let i = 0; i < json.value.length; i++) {
			if (json.value[i].type === "global") {
				if (json.value[i].load_save)
					DALS.Timeline.loadState(json.value[i].load_save);
				if (json.value[i].set_date) {
					UI_DateMenu.setDate(json.value[i].set_date);
				} else if (json.value[i].refresh_date === true) {
					naissance.Geometry.instances.forEach((local_geometry) => local_geometry.draw());
				}
				continue;
			}
			if (json.value[i].type)
				naissance[json.value[i].type].parseAction(json.value[i]);
		}
		
		//Save action to current timeline if needed
		if (!do_not_push_action) {
			new DALS.Action(json);
			
			//Force all UI_LeftbarHierarchy instances to .refresh()
			UI_LeftbarHierarchy.refresh();
		}
	};
}

//State save/load functions
{
	DALS.Timeline.loadState = function (arg0_json) { //[WIP] - Finish function body
		//Convert from parameters
		let json = (arg0_json) ? arg0_json : {};
		if (typeof json === "string") json = JSON.parse(json);
		
		//0. Clear map
		console.log(`DALS.Timeline.loadState called.`);
		
		{
			//Clear _layers
			main._layers.province_layers = [];
			if (main._layers.provinces)
				main._layers.provinces.clear();
			
			//Clear geometries
			for (let i = 0; i < naissance.Geometry.instances.length; i++)
				naissance.Geometry.instances[i].remove();
			
			//Clear scene
			scene.map_component.clear();
			naissance.Feature.instances = [];
			naissance.Geometry.instances = [];
		}
		
		//1. Handle main map
		if (json.map_settings)
			UI_MapSettings.fromJSON(json.map_settings);
		
		//2. Handle naissance.Geometry classes
		//Iterate over JSON to load in each class
		Object.iterate(json, (local_key, local_value) => {
			if (local_value.class_name && local_value.type === "geometry") {
				let geometry_obj = new naissance[local_value.class_name]();
				if (local_value.id) geometry_obj.id = local_value.id;
				geometry_obj.history.fromJSON(local_value.history);
				if (local_value.metadata) geometry_obj.metadata = local_value.metadata;
				try {
					if (geometry_obj.draw) geometry_obj.draw();
				} catch (e) { console.warn(e); }
			}
		});
		
		//3. Handle naissance.Feature classes
		Object.iterate(json, (local_key, local_value) => {
			if (local_value.class_name && local_value.type === "feature") {
				let feature_obj = new naissance[local_value.class_name](undefined, {
					metadata: local_value.metadata
				});
				
				if (local_value.id) feature_obj.id = local_value.id;
				if (local_value.value) feature_obj.json = local_value.value;
			}
		});
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			
			local_feature.fromJSON(local_feature.json);
			try {
				if (local_feature.draw) local_feature.draw();
			} catch (e) { console.warn(e); }
		}
		
		//4. Force all UI_LeftbarHierarchy instances to .refresh()
		setTimeout(() => {
			UI_LeftbarHierarchy.refresh();
			main.renderer.update(); //Update renderer
		}, 100);
		
		//Reload cursor
		main.layers.cursor_layer.addGeometry(main.brush.cursor);
	};
	
	DALS.Timeline.saveState = function () { //[WIP] - Finish function body for naissance.Feature
		//Declare local instance variables
		let json_obj = {};
		
		//Set json_obj.map_settings
		try {
			if (global.map) json_obj.map_settings = UI_MapSettings.toJSON();
		} catch (e) { console.error(e); }
		
		//Iterate over all naissance.Geometry.instances and serialise them
		for (let i = 0; i < naissance.Geometry.instances.length; i++) {
			let local_geometry = naissance.Geometry.instances[i];
			json_obj[local_geometry.id] = {
				id: local_geometry.id,
				class_name: local_geometry.class_name,
				history: local_geometry.history.toJSON(),
				metadata: local_geometry.metadata,
				type: "geometry"
			};
		}
		
		//Iterate over all naissance.Feature.instances and serialise them
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			json_obj[local_feature.id] = {
				id: local_feature.id,
				class_name: local_feature.class_name,
				metadata: local_feature.metadata,
				type: "feature",
				value: local_feature.toJSON()
			};
		}
		
		//Return statement
		return json_obj;
	};
}