if (!global.naissance) global.naissance = {};
naissance.Feature = class extends ve.Class {
	static instances = [];
	
	constructor (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		super();
		this.id = Class.generateRandomID(naissance.Feature);
		this.instance = this;
		this.is_naissance_feature = true;
		this._is_visible = true;
		this.metadata = (options.metadata) ? options.metadata : {};
		this.ui = {};
		
		//Initialise this.options
		if (!this.options) this.options = {};
			this.options.instance = this;
			
		//Declare local instance variables
		this._name = "New Feature";
		this._parent = undefined;
		
		//Push to naissance.Feature.instances
		naissance.Feature.instances.push(this);
		setTimeout(() => {
			if (main.brush.selected_feature?.entities && !this.cannot_nest_self) { //Sanity check to make sure .cannot_nest_self is invalid for nesting
				this.parent = main.brush.selected_feature;
				main.brush.selected_feature.entities.push(this);
			}
		});
	}
	
	get name () {
		//Return statement
		return this._name;
	}
	
	set name (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "";
		
		//Send DALS.Timeline.parseAction() command
		DALS.Timeline.parseAction({
			options: { name: "Rename Feature", key: "rename_Feature" },
			value: [{ type: "Feature", feature_id: this.id, set_name: value }]
		}, this.fire_action_silently);
	}
	
	get parent () {
		//Return statement
		return this._parent;
	}
	
	set parent (arg0_v) {
		//Convert from parameters
		let value = arg0_v;
		
		//Make sure parent cannot be self
		if (value && value.id !== this.id)
			this._parent = value;
		if (value === undefined)
			this._parent = undefined;
	}
	
	drawActionsPalette (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Feature";
		if (!options.move_to_filters) options.move_to_filters = ["FeatureGroup", "FeatureLayer"];
		if (!options.type) options.type = "feature";
		
		//Return statement
		return veInterface({
			actions_palette: veSearchSelect({
				add_descriptions: veButton(() => { //[WIP] - Add line_break toggle, whole line/substring searching for duplicates
					//Set defaults
					if (this.ui.add_descriptions_avoid_duplicates === undefined) this.ui.add_descriptions_avoid_duplicates = true;
					if (this.ui.add_descriptions_insert_at === undefined) this.ui.add_descriptions_insert_at = "append";
					if (this.ui.add_descriptions_insert_newline === undefined) this.ui.add_descriptions_insert_newline = true;
					if (this.ui.add_descriptions_search === undefined) this.ui.add_descriptions_search = "substring";
					
					if (this.add_descriptions_window) this.add_descriptions_window.close();
					this.add_descriptions_window = veWindow({
						value: veWordProcessor(this.ui.add_descriptions_value, {
							onuserchange: (v) => this.ui.add_descriptions_value = v,
							width: 99,
							x: 0, y: 0
						}),
						duplicate_filtering: veInterface({
							avoid_duplicates: veToggle(this.ui.add_descriptions_avoid_duplicates, {
								name: "Avoid Duplicates",
								onuserchange: (v) => this.ui.add_descriptions_avoid_duplicates = v
							}),
							case_sensitive: veToggle(this.ui.add_descriptions_case_sensitive, {
								name: "Case Sensitive",
								onuserchange: (v) => this.ui.add_descriptions_case_sensitive = v
							}),
							search: veSelect({
								substring: { name: "Substring" },
								whole_line: { name: "Whole Line" }
							}, {
								name: "Search",
								selected: this.ui.add_descriptions_search,
								onuserchange: (v) => this.ui.add_descriptions_search = v
							})
						}, { name: "Duplicate Filtering", x: 0, y: 1 }),
						insert_options: veInterface({
							insert_at: veSelect({
								append: { name: "Append" },
								prepend: { name: "Prepend" }
							}, {
								name: "Insert At",
								onuserchange: (v) => this.ui.add_descriptions_insert_at = v,
								selected: this.ui.add_descriptions_insert_at
							}),
							insert_newline: veToggle(this.ui.add_descriptions_insert_newline, {
								name: "Insert Newline",
								onuserchange: (v) => this.ui.add_descriptions_insert_newline = v
							}),
						}, { name: "Insert Options", x: 1, y: 1 }),
						confirm: veButton(() => {
							if (!(this.ui.add_descriptions_value?.length > 0)) {
								veToast(`<icon>warning</icon> You must provide a valid description to append/prepend.`);
								return;
							}
							
							//Declare local instance variables
							let all_geometries = this.getAllGeometries();
							
							//Iterate over all_geometries and add to .metadata.description
							for (let i = 0; i < all_geometries.length; i++) {
								if (!all_geometries[i].metadata) all_geometries[i].metadata = {};
								if (!all_geometries[i].metadata.description) all_geometries[i].metadata.description = "";
								
								let local_description = all_geometries[i].metadata.description;
								
								all_geometries[i].metadata.description = String.editAddToString(local_description, this.ui.add_descriptions_value, {
									avoid_duplicates: this.ui.add_descriptions_avoid_duplicates,
									case_sensitive: this.ui.add_descriptions_case_sensitive,
									insert_at: this.ui.add_descriptions_insert_at,
									insert_newline: this.ui.add_descriptions_insert_newline,
									search: this.ui.add_descriptions_search,
								});
								
								if (all_geometries[i].variables_ui) all_geometries[i].variables_ui.remove(); //Free previous variables_ui
								all_geometries[i].drawVariablesEditor();
							}
							veToast(`Added descriptions for ${all_geometries.length} geometries in ${this.name}.`);
						}, { name: "Confirm" })
					}, {
						name: "Add Descriptions",
						can_rename: false,
						width: "30rem"
					})
				}, { name: "Add Descriptions" }),
				add_field: veButton(() => {
					
				}, { name: "Add Field", disabled: true }),
				add_variable: veButton(() => {
					if (this.add_variable_window) this.add_variable_window.close();
					this.add_variable_window = veWindow({
						variable_key: veText(this.ui.add_variable_key, {
							name: "Field/Variable Key",
							onuserchange: (v) => this.ui.add_variable_key = v
						}),
						value: veText(this.ui.add_variable_value, {
							name: "Value",
							onuserchange: (v) => {
								if (!isNaN(parseFloat(v))) {
									this.ui.add_variable_value = parseFloat(v);
								} else {
									this.ui.add_variable_value = v;
								}
							}
						}),
						keyframe: veSelect({
							end: { name: "End Date" },
							manual: { name: "Manual Date" },
							start: { name: "Start Date" },
						}, {
							name: "Keyframe",
							selected: (this.ui.add_variable_keyframe) ? this.ui.add_variable_keyframe : "start",
							onuserchange: (v) => this.ui.add_variable_keyframe = v
						}),
						date: veDate(main.date, {
							name: "Date",
							limit: () => this.ui.add_variable_keyframe === "manual",
							onuserchange: (v) => this.ui.add_variable_date = v
						}),
						
						confirm: veButton(() => {
							if (!this.ui.add_variable_key) {
								veToast(`<icon>warning</icon> You must provide a valid variable key.`);
								return;
							}
							
							let actual_date;
								if (this.ui.add_variable_keyframe === "manual") {
									actual_date = (this.ui.add_variable_date) ? this.ui.add_variable_date : main.date;
								} else {
									actual_date = (this.ui.add_variable_keyframe) ? this.ui.add_variable_keyframe : "start";
								}
							DALS.Timeline.parseAction({
								options: { name: "Add Variable", key: `add_variable_${this.ui.add_variable_key}` },
								value: [{
									type: "Feature",
									feature_id: this.id,
									add_variable: {
										date: actual_date,
										key: this.ui.add_variable_key,
										value: (this.ui.add_variable_value !== undefined) ? this.ui.add_variable_value : ""
									}
								}]
							});
						}, { name: "Confirm" })
					}, { 
						name: "Add Variable", 
						can_rename: false,
						width: "20rem"
					});
				}, { name: "Add Variable" }),
				clear_descriptions: veButton(() => {
					
				}, { name: "Clear Descriptions", disabled: true }),
				clean_geometry_tags: veButton(() => {
					veConfirm(`Are you sure you want to clean all geometry tags in ${this.name}?`, {
						special_function: () => {
							DALS.Timeline.parseAction({
								options: { name: "Clean Geometry Tags", key: `clean_${options.type}_geometry_tags` },
								value: [{
									type: "Feature",
									feature_id: this.id,
									clean_geometry_tags: true
								}]
							});
							veToast(`Cleaned geometry tags.`);
						}
					});
				}, { name: "Clean Geometry Tags" }),
				clean_keyframes: veButton(() => {
					if (this.clean_keyframes_window) this.clean_keyframes_window.close();
					this.clean_keyframes_window = veWindow({
						clean_symbols: veToggle(this.ui.clean_symbols, {
							name: "Clean Symbols",
							onuserchange: (v) => this.ui.clean_symbols = v
						}),
						clean_keyframes: veButton(() => {
							//Declare local instance variables
							let all_flags = [];
							if (this.ui.clean_symbols) all_flags.push("symbol");
							
							DALS.Timeline.parseAction({
								options: { name: "Clean Keyframes", key: `clean_${options.type}_keyframes` },
								value: [{
									type: "Feature",
									feature_id: this.id,
									clean_keyframes: all_flags
								}]
							});
							veToast(`Cleaned ${options.name} keyframes.`);
						}, { name: "Confirm" })
					}, { name: `Clean ${options.name} Keyframes`, can_rename: false });
				}, { name: `Clean ${options.name} Keyframes` }),
				flatten_all_geometries: veButton(() => {
					veConfirm(`Are you sure you want to flatten all geometries in ${this.name}?`, {
						special_function: () => {
							DALS.Timeline.parseAction({
								options: { name: "Flatten Geometries", key: `flatten_${options.type}_geometries` },
								value: [{
									type: "Feature",
									feature_id: this.id,
									flatten_all_geometries: true
								}]
							});
							veToast(`Flattened all geometries.`);
						}
					});
				}, {
					name: "Flatten All Geometries"
				}),
				move_entities_to: veButton(() => {
					if (this.move_entities_window) this.move_entities_window.close();
					this.move_entities_window = veWindow({
						to_feature: new UI_FeatureDatalist(this.ui.to_feature_id, {
							name: `To ${options.name}`,
							filter_types: options.move_to_filters,
							onuserchange: (v) => {
								console.log(v);
								this.ui.to_feature_id = v;
							}
						}),
						confirm: veButton(() => {
							try {
								//Declare local instance variables
								let ot_feature = naissance.Feature.instances.filter((v) => v.id === this.ui.to_feature_id)[0];
								
								//Parse action
								DALS.Timeline.parseAction({
									options: { name: "Move Geometries To", key: `move_${options.type}_geometries_to` },
									value: [{
										type: "Feature",
										feature_id: this.id,
										move_all_entities_to_feature: this.ui.to_feature_id
									}]
								});
								veToast(`Moved all geometries from ${this.name} ${options.name} to ${ot_feature.name} ${options.name}.`);
							} catch (e) { console.error(e); }
						}, { name: "Confirm" })
					}, { name: "Move Entities To", can_rename: false })
				}, { name: `Move Entities To ${options.name}` }),
				simplify_polygons: veButton(() => {
					if (this.simplify_polygons_window) this.simplify_polygons_window.close();
					this.simplify_polygons_window = veWindow({
						simplify_threshold: veRange(Math.returnSafeNumber(this.ui.simplify_threshold, 0.01), {
							name: `Simplify Threshold`,
							onuserchange: (v) => this.ui.simplify_threshold = v
						}),
						confirm: veButton(() => {
							//Declare local instance variables
							let simplify_threshold = Math.returnSafeNumber(this.ui.simplify_threshold, 0.01);
							
							try {
								DALS.Timeline.parseAction({
									options: { name: "Simplify Polygons", key: `simplify_${options.type}_geometries` },
									value: [{
										type: "Feature",
										feature_id: this.id,
										simplify_all_polygons: simplify_threshold
									}]
								});
								veToast(`Simplified all geometries by ${String.formatNumber(simplify_threshold)}`)
							} catch (e) { console.error(e); }
						}, { name: "Confirm" })
					}, { name: "Simplify Polygons", can_rename: false });
				}, { name: "Simplify Polygons" }),
				remove_field: veButton(() => {
					
				}, { name: "Remove Field", disabled: true }),
				remove_variable: veButton(() => {
					
				}, { name: "Remove Variable", disabled: true }),
				replace_descriptions: veButton(() => { //[WIP] - Should be changed to replace_descriptions
					if (this.replace_descriptions_window) this.replace_descriptions_window.close();
					this.replace_descriptions_window = veWindow({
						find: veInterface({
							find_value: veWordProcessor(this.ui.replace_descriptions_find_value, {
								onuserchange: (v) => this.ui.replace_descriptions_find_value = v
							}),
						}, { name: "Find", open: true }),
						replace: veInterface({
							replace_value: veWordProcessor(this.ui.replace_descriptions_replace_value, {
								onuserchange: (v) => this.ui.replace_descriptions_replace_value = v
							}),
						}, { name: "Replace", open: true }),
						information: veHTML("If no replace value is provided, the found value(s) will automatically be removed."),
						
						match_filtering: veInterface({
							case_sensitive: veToggle(this.ui.replace_descriptions_case_sensitive, {
								name: "Case Sensitive",
								onuserchange: (v) => this.ui.replace_descriptions_case_sensitive = v
							}),
							remove_all: veToggle(this.ui.replace_descriptions_remove_all, {
								name: "Remove All",
								onuserchange: (v) => this.ui.replace_descriptions_remove_all = v
							}),
							remove_order: veSelect({
								first: { name: "First-to-last" },
								last: { name: "Last-to-first" }
							}, {
								name: "Remove Order",
								onuserchange: (v) => this.ui.replace_descriptions_remove_order = v,
								selected: (this.ui.replace_descriptions_remove_order) ? 
									this.ui.replace_descriptions_remove_order : "first"
							}),
							search: veSelect({
								substring: { name: "Substring" },
								whole_line: { name: "Whole Line" }
							}, {
								name: "Search",
								onuserchange: (v) => this.ui.replace_descriptions_search = v,
								selected: (this.ui.replace_descriptions_search) ? 
									this.ui.replace_descriptions_search : "substring"
							})
						}, { name: "Match Filtering", x: 0, y: 2 }),
						confirm: veButton(() => {
							if (!(this.ui.replace_descriptions_find_value?.length > 0)) {
								veToast(`<icon>warning</icon> You must provide a valid value to find.`);
								return;
							}
							
							//Declare local instance variables
							let all_geometries = this.getAllGeometries();
							
							//Iterate over all_geometries and add to .metadata.description
							for (let i = 0; i < all_geometries.length; i++) {
								if (!(all_geometries[i]?.metadata?.description)) continue;
								
								let local_description = all_geometries[i].metadata.description;
								
								all_geometries[i].metadata.description = String.editReplaceInString(
									local_description, 
									this.ui.replace_descriptions_find_value, 
									this.ui.replace_descriptions_replace_value, 
									{
										case_sensitive: this.ui.replace_descriptions_case_sensitive,
										remove_all: this.ui.replace_descriptions_remove_all,
										remove_order: this.ui.replace_descriptions_remove_order,
										search: this.ui.replace_descriptions_search
									});
								if (all_geometries[i].metadata.description?.length === 0) 
									delete all_geometries[i].metadata.description;
								
								if (all_geometries[i].variables_ui) all_geometries[i].variables_ui.remove(); //Free previous variables_ui
								all_geometries[i].drawVariablesEditor();
							}
							veToast(`Replaced descriptions for ${all_geometries.length} geometries in ${this.name}.`);
						})
					}, {
						name: "Replace Descriptions",
						can_rename: false,
						width: "30rem"
					});
				}, { name: "Replace Descriptions" }),
			}, {
				display: "inline",
				placeholder: "Search for action ...",
				style: {
					"> [component='ve-button']": {
						display: "inline",
						padding: 0
					}
				}
			})
		}, {
			name: "Actions",
			style: { padding: 0 },
			width: 99
		});
	}
	
	drawHierarchyDatatypeGenerics () {
		//Return statement
		return {
			hide_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Hide Feature", key: "hide_feature" },
					value: [{ type: "Feature", feature_id: this.id, set_visibility: false }]
				});
			}, {
				attributes: { class: "order-99" },
				name: `<icon>visibility</icon>`,
				limit: () => this._is_visible,
				tooltip: "Hide Feature"
			}),
			show_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Show Feature", key: "show_feature" },
					value: [{ type: "Feature", feature_id: this.id, set_visibility: true }]
				});
			}, {
				attributes: { class: "order-99" },
				name: "<icon>visibility_off</icon>",
				limit: () =>  !this._is_visible,
				tooltip: "Show Feature"
			}),
			delete_button: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Delete Feature", key: "delete_feature" },
					value: [{ type: "Feature", feature_id: this.id, delete_feature: true }]
				});
			}, {
				attributes: { class: "order-100" },
				name: "<icon>delete</icon>", 
				tooltip: "Delete",
			}),
		};
	}
	
	/**
	 * Returns an array of all {@link naissance.Geometry}|{@link naissance.Feature} instances housed in the Feature.
	 * - Method of: {@link naissance.Feature}
	 *
	 * @param {naissance.Feature} [arg0_object]
	 * @param {Object} [arg1_options]
	 *  @param {naissance.Feature[]} [arg1_options.owners]
	 *  @param {boolean} [arg1_options.refresh_metadata=false]
	 *  @param {string[]} [arg1_options.types=["Feature", "Geometry"]] - The types to filter for.
	 *
	 * @returns {naissance.Geometry[]}
	 */
	getAllEntities (arg0_object, arg1_options) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : this;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.owners) options.owners = [];
		if (!options.types) options.types = ["Feature", "Geometry"];
		
		//Declare local instance variables
		let all_entities = [];
		let owner_names = [];
		
		//Iterate over options.owners and fetch their .name
		for (let i = 0; i < options.owners.length; i++) {
			let local_name = options.owners[i]?.name;
			
			if (local_name) owner_names.push(local_name);
		}
		
		//Iterate over all .entities and check if they have .entities
		if (object?.entities)
			for (let i = 0; i < object.entities.length; i++) {
				let local_entity = object.entities[i];
				
				//Iterate over all options.types and determine if it is valid
				for (let x = 0; x < options.types.length; x++)
					if (local_entity instanceof naissance[options.types[x]]) {
						all_entities.push(local_entity);
						break;
					}
				
				if (local_entity) {
					//Edit metadata
					if (options.refresh_metadata) {
						if (!local_entity.metadata) local_entity.metadata = {};
						if (!local_entity.metadata.tags) local_entity.metadata.tags = [];
						
						//Iterate over all owner_names and ensure they inherit the proper tags if they don't exist, i.e. convert groups to tags
						for (let x = 0; x < owner_names.length; x++)
							if (!local_entity.metadata.tags.includes(owner_names[x]))
								local_entity.metadata.tags.push(owner_names[x]);
					}
					
					//Recurse if the entity has its own entities
					if (local_entity.entities)
						all_entities = all_entities.concat(this.getAllEntities(local_entity, {
							...options,
							owners: options.owners.concat([local_entity])
						}));
				}
			}
		
		//Return statement
		return all_entities;
	}
	
	/**
	 * Returns an array of all {@link naissance.Feature} instances housed in the Feature.
	 * 
	 * @param {naissance.Feature} arg0_object
	 * @param {Object} arg1_options
	 * 
	 * @returns {naissance.Geometry[]}
	 */
	getAllFeatures (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Return statement
		return this.getAllEntities(object, {
			...options,
			types: ["Feature"]
		});
	}
	
	/**
	 * Returns an array of all {@link naissance.Geometry} instances housed in the Feature.
	 *
	 * @param {naissance.Feature} [arg0_object]
	 * @param {Object} [arg1_options]
	 *  @param {naissance.Feature[]} [arg1_options.owners]
	 *
	 * @returns {naissance.Geometry[]}
	 */
	getAllGeometries (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Return statement
		return this.getAllEntities(object, {
			...options,
			types: ["Geometry"]
		});
	}
	
	hide () {
		//Declare local instance variables
		this._is_visible = false;
		
		//Iterate over all entities; attempt to hide all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].hide)
					this.entities[i].hide();
	}
	
	remove () {
		//Declare local instance variables
		let delete_keys = ["_entities", "entities"]
		
		//Remove from naissance.Feature.instances
		for (let i = naissance.Feature.instances.length - 1; i >= 0; i--) {
			let local_feature = naissance.Feature.instances[i];
			
			if (local_feature.id === this.id)
				naissance.Feature.instances.splice(i, 1);
			if (local_feature.entities)
				//Iterate over delete_keys and local_feature.entities.length to ensure clean removal
				for (let x = 0; x < delete_keys.length; x++)
					if (local_feature[delete_keys[x]])
						for (let y = local_feature[delete_keys[x]].length - 1; y >= 0; y--)
							if (local_feature[delete_keys[x]][y].id === this.id)
								local_feature[delete_keys[x]].splice(y, 1);
		}
		
		//Remove from local_feature.entities
		if (this.hide) this.hide();
		if (this.entities)
			for (let x = 0; x < this.entities.length; x++)
				if (this.entities[x].id === this.id)
					naissance.Feature.instances.splice(x, 1);
		
		//Rerender deleted feature and remove it from the map
		if (this.draw) this.draw();
		UI_LeftbarHierarchy.refresh();
	}
	
	show () {
		this._is_visible = true;``
		
		//Iterate over all entities; attempt to show all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].show)
					this.entities[i].show();
	}
};