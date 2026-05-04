if (!global.naissance) global.naissance = {};
naissance.Geometry = class extends ve.Class {
	static instances = [];
	static reserved_keys = ["name"];
	
	constructor () {
		//Convert from parameters
		super();
		this.history = new naissance.History({}, {
			_id: () => this.id,
			localisation_function: (new_keyframe, old_keyframe) => { //[WIP] - Finish function
				//Declare local instance variables
				let return_string = [];
				
				try {
					//[0] .geometry change
					if (new_keyframe.value[0])
						return_string.push(`Geometry changed`);
					if (new_keyframe.value[0] === null)
						return_string.push(`Geometry removed`);
					
					//[1] .symbol change
					if (new_keyframe.value[1])
						return_string.push(`Symbol changed to: ${String.formatObject(new_keyframe.value[1])}`);
					
					//[2] .properties change
					if (new_keyframe.value[2]?.hidden === false)
						return_string.push(`Geometry visible`);
					if (new_keyframe.value[2]?.hidden === true)
						return_string.push(`Geometry hidden`);
					if (new_keyframe.value[2]?.label_geometries)
						if (new_keyframe.value[2].label_geometries.length > 0)
							return_string.push(`Set custom label geometries`);
					if (new_keyframe.value[2]?.label_name)
						return_string.push(`Label name changed to: ${new_keyframe.value[2].label_name}`);
					if (new_keyframe.value[2]?.label_symbol)
						return_string.push(`Label symbol changed to: ${String.formatObject(new_keyframe.value[2].label_symbol)}`);
					if (new_keyframe.value[2]?.max_zoom !== undefined)
						return_string.push(`Maximum zoom set to ${new_keyframe.value[2].max_zoom}`);
					if (new_keyframe.value[2]?.min_zoom !== undefined)
						return_string.push(`Minimum zoom set to ${new_keyframe.value[2].min_zoom}`);
					if (new_keyframe.value[2]?.name)
						return_string.push(`Name changed to ${new_keyframe.value[2].name}`);
					if (new_keyframe.value[2]?.variables)
						return_string.push(`Variables changed to: ${String.formatObject(new_keyframe.value[2].variables)}`);
				} catch (e) {
					try {
						JSON.stringify(old_keyframe);
						JSON.stringify(new_keyframe);
					} catch (e) {
						console.error(`Was a circular reference detected? If so, ensure that you are feeding in arg0_v, and not arg1_e for the property in question.`);
					}
					console.error(`new_keyframe:`, new_keyframe, `old_keyframe:`, old_keyframe, `Error:`, e);
				}
				
				//Return statement
				return String.formatArray(return_string);
			}
		});
		this.id = Class.generateRandomID(naissance.Geometry);
		this.instance = this;
		this.is_naissance_geometry = true; //Identifier flag for Naissance-bound reflection engine
		this.metadata = {};
		
		//Initialise this.options
		if (!this.options) this.options = {};
			this.options.instance = this;
		
		//Declare local instance variables
		this.fire_action_silently = true;
		this.name = undefined;
		delete this.fire_action_silently;
		
		//Define naissance.Geometry contract
		
		/** 
		 * The current geometry as rendered on {@link global.map}.
		 * @type {maptalks.Geometry|undefined} 
		 */
		this.geometry = undefined;
		/** 
		 * Renders any assigned name to the geometry/label.
		 * @type {maptalks.Label[]|undefined}
		 */
		this.label_geometries = [];
		/** @type {boolean} */
		this._selected = false; //Should be overridden by a getter/setter that attempts to render this.selected_geometry
		/**
		 * Selected geometry overlay.
		 * - Mirror of: {@link this.geometry}
		 * @type {maptalks.Geometry|undefined} 
		 */
		this.selected_geometry = undefined;
		/**
		 * Holds the currently rendered keyframe at this date.
		 * @type {naissance.HistoryKeyframe.value|undefined}
		 */
		this.value = undefined;
		/**
		 * Options passed to the interface window that is opened.
		 * @type {Object}
		 */
		this.window_options = {
			width: "30rem",
			onuserchange: (v) => {
				if (v.name)
					DALS.Timeline.parseAction({
						options: { name: "Rename Geometry", key: "rename_geometry" },
						value: [{ type: "Geometry", geometry_id: this.id, set_name: v.name }]
					});
			}
		};
		
		//Push to naissance.Geometry.instances
		naissance.Geometry.instances.push(this);
		if (main.brush.selected_feature?.entities) {
			this.parent = main.brush.selected_feature;
			main.brush.selected_feature.entities.push(this);
		}
	}
	
	get current_geometry () {
		//Declare local instance variables
		let current_keyframe = this.current_keyframe;
		
		//Return statement
		return (current_keyframe && current_keyframe.value[0]) ?
			maptalks.Geometry.fromJSON(current_keyframe.value[0]) : undefined;
	}
	
	get current_keyframe () {
		//Return statement
		return this.history.getKeyframe();
	}
	
	get name () {
		//Declare local instance variables
		let current_keyframe = (this._current_keyframe) ? 
			this._current_keyframe : this.history.getKeyframe();
		let current_value = current_keyframe.value;
		
		let current_name;
			if (current_value[2] && current_value[2].name) current_name = current_value[2].name;
			if (!current_name)
				Object.iterate(this.history.keyframes, (local_key, local_value) => {
					if (local_value?.value[2] && local_value?.value[2].name) {
						current_name = local_value.value[2].name;
						return "break"; //Break if possible
					}
				});
		
		//Return statement
		return (current_name) ? 
			current_name : `New ${(this.class_name) ? this.class_name : "Geometry"}`;
	}
	
	set name (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : `New ${(this.class_name) ? this.class_name : "Geometry"}`;
		
		//Send DALS.Timeline.parseAction() command
		DALS.Timeline.parseAction({
			options: { name: "Rename Geometry", key: "rename_Geometry" },
			value: [{ type: "Geometry", geometry_id: this.id, set_name: value }]
		}, this.fire_action_silently);
	}
	
	get selected () {
		//Declare local instance variables
		let is_selected;
		
		//Fetch is_selected
		if (main.brush && main.brush.selected_geometry && main.brush.selected_geometry.id === this.id) {
			is_selected = true;
		} else {
			is_selected = this._selected;
		}
		if (this.interface && this.interface.selected)
			this.interface.selected.v = is_selected;
		
		//Return statement
		return is_selected;
	}
	
	set selected (v) {
		//Set selected, then update draw
		this._selected = v;
		this.draw();
		UI_LeftbarHierarchy.refresh();
	}
	
	addKeyframe (arg0_date, arg1_coords, arg2_symbol, arg3_data) {
		//Convert from parameters
		let date = (arg0_date) ? arg0_date : main.date;
		let coords = arg1_coords;
		let symbol = arg2_symbol;
		let data = arg3_data;
		
		//Declare local instance variables
		this.history.addKeyframe(date, coords, symbol, data);
		this.draw();
	}
	
	/**
	 * Returns an object of hierarchy generics that can be destructured when `drawHierarchyDatatype()` is called.
	 * 
	 * @returns {Object}
	 */
	drawHierarchyDatatypeGenerics () {
		//Declare local instance variables
		let current_keyframe = (this._current_keyframe) ? 
			this._current_keyframe : this.current_keyframe;
		
		//Return statement
		return {
			multitag: veButton(() => {
				if (this.tags_editor) this.tags_editor.close();
				this.tags_editor = veWindow({
					tags_list: veMultiTag(this.metadata.tags, {
						onuserchange: (v) => this.metadata.tags = v
					})
				}, {
					name: `Edit Tags (${this.name})`,
					can_rename: false,
					width: "20rem",
					
					onuserchange: (v) => {
						if (v.close)
							DALS.Timeline.parseAction({
								options: { name: "Edit Geometry Tags", key: "edit_geometry_tags" },
								value: [{ type: "Geometry", geometry_id: this.id, set_tags: this.metadata.tags }]
							});
					}
				})
			}, {
				attributes: { class: "order-99" },
				name: "<icon>new_label</icon>", tooltip: "Manage Tags"
			}),
			hide_geometry: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Hide Geometry", key: "hide_geometry" },
					value: [{ type: "Geometry", geometry_id: this.id, set_properties: { hidden: true } }]
				});
			}, {
				attributes: { class: "order-100" },
				name: `<icon>visibility</icon>`,
				limit: () => !current_keyframe.value[2]?.hidden,
				tooltip: "Hide Geometry"
			}),
			show_geometry: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Show Geometry", key: "show_geometry" },
					value: [{ type: "Geometry", geometry_id: this.id, set_properties: { hidden: false } }]
				});
			}, {
				attributes: { class: "order-100" },
				name: "<icon>visibility_off</icon>",
				limit: () => current_keyframe.value[2]?.hidden,
				tooltip: "Show Geometry"
			}),
			delete_button: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Delete Geometry", key: "delete_geometry" },
					value: [{ type: "Geometry", geometry_id: this.id, delete_geometry: true }]
				});
			}, {
				attributes: { class: "order-101" },
				name: "<icon>delete</icon>",
				tooltip: "Delete Geometry"
			})
		};
	}
	
	/**
	 * Draws the variables editor for the current geometry UI.
	 */
	drawVariablesEditor () {
		//Declare local instance variables
		this.variables_ui = veInterface({
			geometry_description: veWordProcessor(this.metadata.description, { //Loaded after 1 tick
				onuserchange: (v) => this.metadata.description = v
			}),
			actions_bar: veRawInterface({
				open_variables_editor: veButton(() => {
					if (this.variables_editor) this.variables_editor.close();
					try { this.syncVariablesToSpreadsheet(); } catch (e) { console.error(e); } //Sync first
					this.variables_editor = veWindow({
						table_editor: veSpreadsheet(this.metadata.variables, {
							dark_mode: true,
							onuserchange: (v, e) => { //[WIP] - Finish function body
								let array_values = e.convertToArray();
								this.history.do_not_draw = true;
								
								//1. Reset all [2].variables from all keyframes
								Object.iterate(this.history.keyframes, (local_key, local_keyframe) => {
									let local_value = local_keyframe.value;
									
									if (local_value[2] && local_value[2].variables)
										if (Object.keys(local_value[2]).length === 1) {
											delete this.history.keyframes[local_key];
										} else {
											delete local_value[2].variables;
										}
								});
								
								//2. Reconstruct .variables for all valid keyframes
								for (let i = 0; i < array_values.length; i++)
									for (let x = 0; x < array_values[i].length; x++) //Iterate over all rows in spreadsheets
										if (array_values[i][x][0]) {
											let local_date = Date.convertStringToDate(array_values[i][x][0].toString());
											let local_variables_obj = {};
											
											//If local_date is defined, iterate over all values in row and append them to local_variables_obj
											if (local_date && array_values[i][x].length > 1) {
												for (let y = 1; y < array_values[i][x].length; y++) {
													let local_cell_variable_name = y;
													if (array_values[i][0][y])
														local_cell_variable_name = array_values[i][0][y];
													
													local_variables_obj[local_cell_variable_name] = array_values[i][x][y];
												}
												
												this.history.addKeyframe(local_date, undefined, undefined, {
													variables: local_variables_obj
												});
											}
										}
								
								this.metadata.variables = e.toJSON();
								delete this.history.do_not_draw;
								this.history.draw(this.keyframes_ui);
							}
						})
					}, {
						name: `Variables Editor (${this.name})`,
						can_rename: false,
						height: "20rem",
						width: "30rem",
						
						onuserchange: (v, e) => {
							//Declare local instance variables
							let table_editor = e?.instance?.table_editor;
								if (table_editor) this.metadata.variables = table_editor.toJSON();
							
							//Call DALS.Timeline.parseAction() .set_history 
							if (v.close)
								DALS.Timeline.parseAction({
									options: { name: "Edit Geometry History", key: "edit_geometry_history" },
									value: [{ type: "Geometry", geometry_id: this.id, set_history: this.history.toJSON() }]
								});
						}
					});
				}, { name: "<icon>rule</icon> Variables Editor", x: 0, y: 1 }),
				open_help_menu: veButton(() => {
					
				}, { name: "<icon>info</icon> Help Menu", x: 1, y: 1 })
			}, {
				style: {
					"[component='ve-button']": { marginRight: `var(--padding)` }
				}
			})
		}, { name: "Variables", open: true });
		
		//Wait a tick for metadata to load
		setTimeout(() => {
			if (this.metadata.description) this.variables_ui.geometry_description.v = this.metadata.description;
		});
	}
	
	/**
	 * Imports a {@link naissance.Geometry} class from JSON. Contract function.
	 */
	fromJSON () {
		console.warn(`naissance.Geometry.fromJSON() was called for: ${this.class_name}, but was not defined.`);
	}
	
	/**
	 * Returns the actions bar element with geometry generics.
	 * 
	 * @returns {HTMLElement}
	 */
	getActionsBarElement () {
		//Declare local instance variables
		let actions_bar_el = document.createElement("div");
			actions_bar_el.id = `actions-bar`;
		let hierarchy_generics = this.drawHierarchyDatatypeGenerics();
			
		//Iterate over hierarchy_generics
		Object.iterate(hierarchy_generics, (local_key, local_value) => 
			local_value.bind(actions_bar_el));
		
		//Return statement
		return actions_bar_el;
	}
	
	/**
	 * Returns a unique list of all names as a flat array, without respect to keyframes. Most recent namees first.
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.return_objects=false] - Whether to return objects. Returns [{ name: string, timestamp: number, ... }] in ascending order.
	 */
	getAllNames (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let all_names = []; //[{ name: string, timestamp: number }, ...]
		
		//Iterate over this.history.keyframes
		Object.iterate(this.history.keyframes, (local_key, local_value) => {
			let is_duplicate = false;
			let local_properties = local_value.value?.[2];
			
			if (local_properties?.name) {
				for (let i = 0; i < all_names.length; i++)
					if (all_names[i].name === local_properties.name) {
						is_duplicate = true;
						break;
					}
				
				if (!is_duplicate)
					all_names.push({ name: local_properties.name, timestamp: local_value?.timestamp });
			}
		}, { sort_mode: "descending" });
		
		all_names.sort((a, b) => b.timestamp - a.timestamp);
		
		//Return statement
		return (!options.return_objects) ? 
			all_names.map((element) => element.name) : all_names;
	}
	
	/**
	 * Returns all keyframes that change the current geometry. Returns either the timestamp/date. Dates by default.
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.return_timestamps=false]
	 * 
	 * @returns {Object[]|number[]}
	 */
	getGeometryKeyframes (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let unique_timestamps = [];
		
		//Iterate over all .history.keyframes
		Object.iterate(this.history.keyframes, (local_key, local_value) => {
			if (local_value.value[0] !== undefined)
				unique_timestamps.push(Date.convertTimestampToInt(local_key));
		});
		
		if (!options.return_timestamps) {
			let unique_dates = [];
			
			//Return statement
			for (let i = 0; i < unique_timestamps.length; i++)
				unique_dates.push(Date.convertTimestampToDate(unique_timestamps[i]));
			return unique_dates;
		}
		return unique_timestamps;
	}
	
	/**
	 * Returns the Maptalks geometry at the specific date.
	 * 
	 * @param {Object|number} [arg0_date]
	 * 
	 * @returns {Object}
	 */
	getGeometryKeyframeAtDate (arg0_date) {
		//Convert from parameters
		let date = (arg0_date) ? arg0_date : main.date;
			date = Date.convertTimestampToDate(date);
		
		//Return statement
		return this.history.getKeyframe({ date: date }).value[0];
	}
	
	/**
	 * Fetches the layer that the current {@link naissance.Geometry} is appended to, if anything. Used for masking.
	 *
	 * @returns {naissance.FeatureLayer}
	 */
	getLayer () {
		//Iterate over naissance.Feature.instances
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			
			if (local_feature instanceof naissance.FeatureLayer) {
				let local_geometries = local_feature.getAllGeometries();
				
				for (let x = 0; x < local_geometries.length; x++)
					if (local_geometries[x].id === this.id)
						//Return statement
						return local_feature;
			}
		}
	}
	
	/**
	 * Hides the present Geometry. Used by {@link naissance.Feature}, not internally used.
	 */
	hide () {
		this._is_visible = false;
		this.draw();
	}
	
	/**
	 * Removes the current {@link naissance.Geometry} instance.
	 */
	remove () {
		super.close("instance"); //Close any open UIs
		
		//Remove from naissance.Feature .entities
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			
			if (local_feature.entities)
				for (let x = 0; x < local_feature.entities.length; x++)
					if (local_feature.entities[x].id === this.id)
						local_feature.entities.splice(x, 1);
		}
		
		//Remove from naissance.Geometry.instances
		for (let i = 0; i < naissance.Geometry.instances.length; i++)
			if (naissance.Geometry.instances[i].id === this.id)
				naissance.Geometry.instances.splice(i, 1);
		
		//Rerender deleted geometry and remove it from the map
		this.history = new naissance.History();
		this.draw();
	}
	
	/**
	 * Alias for {@link naissance.History.removeKeyframe}.
	 *
	 * @param {Object} arg0_date
	 */
	removeKeyframe (arg0_date) {
		//Convert from parameters
		let date = (arg0_date) ? Date.convertTimestampToDate(arg0_date) : main.date;
		
		//Remove the keyframe at the given date
		this.history.removeKeyframe(date);
		if (Object.keys(this.history.keyframes).length === 0) //Remove geometry if no keyframes exist anymore
			this.remove();
	}
	
	/**
	 * Shows the present Geometry. Used by {@link naissance.Feature}, not internally used.
	 */
	show () {
		this._is_visible = true;
		this.draw();
	}
	
	/**
	 * Synchronises `.value[2].variables` in the Geometry's `.history` to the Variables Spreadsheet contained by the Geometry.
	 * Resolves date equivalence using timestamps to prevent row duplication.
	 * - Method of: {@link naissance.Geometry}
	 */
	//[QUARANTINE]
	syncVariablesToSpreadsheet () {
		//Declare local instance variables
		let first_sheet_id;
		let snapshot = (this.metadata.variables && this.metadata.variables.sheets) ?
			this.metadata.variables : { is_snapshot: true, sheets: {}, sheetOrder: [] };
		
		//1. Initialise skeleton snapshot if it does not exist
		if (snapshot.sheetOrder.length === 0) {
			first_sheet_id = Class.generateRandomID();
			snapshot.sheetOrder.push(first_sheet_id);
			snapshot.sheets[first_sheet_id] = {
				id: first_sheet_id,
				name: "Variables",
				cellData: { 0: { 0: { v: "Date", t: 1 } } },
				columnCount: 20,
				rowCount: 1000
			};
		}
		
		first_sheet_id = snapshot.sheetOrder[0];
		let local_sheet = snapshot.sheets[first_sheet_id];
		let local_cell_data = local_sheet.cellData;
		
		//2. Map existing Columns (headers) and Rows (via parsed Timestamps)
		let col_map = {}; // { variable_name: index }
		let timestamp_row_map = {}; // { timestamp_number: index }
		let max_col = 0;
		let max_row = 0;
		
		//Map headers from Row 0
		if (local_cell_data[0])
			Object.iterate(local_cell_data[0], (local_col_idx, local_cell) => {
				let local_idx = parseInt(local_col_idx);
				if (local_cell?.v) col_map[local_cell.v.toString()] = local_idx;
				if (local_idx > max_col) max_col = local_idx;
			});
		
		//Map existing rows by parsing Column 0 to identify dates correctly
		Object.iterate(local_cell_data, (local_row_idx, local_row) => {
			let local_idx = parseInt(local_row_idx);
			if (local_idx > max_row) max_row = local_idx;
			
			let local_date_cell = local_row[0];
			if (local_date_cell?.v != null && local_idx > 0) {
				//Parse Date using existing convention to ensure match
				let local_parsed_date = Date.convertStringToDate(local_date_cell.v.toString());
				let local_ts = Date.getTimestamp(local_parsed_date);
				
				if (local_ts != null && !isNaN(local_ts))
					timestamp_row_map[local_ts] = local_idx;
			}
		});
		
		//3. Iterate through History Keyframes and sync to cellData
		Object.iterate(this.history.keyframes, (local_kf_id, local_keyframe) => {
			let local_variables = local_keyframe.value[2]?.variables;
			let local_kf_ts = Date.getTimestamp(local_keyframe.date);
			
			if (local_variables && local_kf_ts != null && !isNaN(local_kf_ts)) {
				let target_row_idx = timestamp_row_map[local_kf_ts];
				
				//Create a new row if this timestamp does not exist in the table
				if (target_row_idx === undefined) {
					max_row++;
					target_row_idx = max_row;
					let local_date = local_keyframe.date;
					let local_cell_obj = { t: 1 };
					
					//CONCISE FORMATTING: Store as Number (t: 2) if it is a plain year
					if (local_date.month === 1 && local_date.day === 1 && local_date.hour === 0 && local_date.minute === 0) {
						local_cell_obj.v = local_date.year;
						local_cell_obj.t = 2;
					} else {
						//Build concise string only as long as necessary
						let local_str = local_date.year.toString();
						if (local_date.minute > 0) {
							local_str += `.${local_date.month}.${local_date.day}.${local_date.hour}.${local_date.minute}`;
						} else if (local_date.hour > 0) {
							local_str += `.${local_date.month}.${local_date.day}.${local_date.hour}`;
						} else if (local_date.day > 1) {
							local_str += `.${local_date.month}.${local_date.day}`;
						} else if (local_date.month > 1) {
							local_str += `.${local_date.month}`;
						}
						local_cell_obj.v = local_str;
					}
					
					local_cell_data[target_row_idx] = { 0: local_cell_obj };
					timestamp_row_map[local_kf_ts] = target_row_idx;
				}
				
				let target_row = local_cell_data[target_row_idx];
				
				Object.iterate(local_variables, (local_var_name, local_var_value) => {
					//Ensure column exists for this variable
					if (col_map[local_var_name] === undefined) {
						max_col++;
						col_map[local_var_name] = max_col;
						if (!local_cell_data[0]) local_cell_data[0] = {};
						local_cell_data[0][max_col] = { v: local_var_name, t: 1 };
					}
					let target_col_idx = col_map[local_var_name];
					
					//4. Sync only if the cell does not already contain a value
					if (!target_row[target_col_idx] || target_row[target_col_idx].v == null) {
						let local_cell_obj = {};
						let local_val_str = (local_var_value != null) ? local_var_value.toString() : "";
						
						if (local_val_str.startsWith("=")) {
							local_cell_obj.f = local_val_str;
						} else {
							local_cell_obj.v = local_var_value;
							local_cell_obj.t = (typeof local_var_value === "number") ? 2 : 1;
						}
						target_row[target_col_idx] = local_cell_obj;
					}
				});
			}
		});
		
		//Update the metadata snapshot and push to the active editor UI
		this.metadata.variables = snapshot;
		
		if (this.variables_editor?.instance?.table_editor)
			this.variables_editor.instance.table_editor.fromJSON(snapshot);
	}
	
	/**
	 * Exports a {@link naissance.Geometry} class to JSON. Contract function.
	 */
	toJSON () {
		console.warn(`naissance.Geometry.toJSON() was called for: ${this.class_name}, but was not defined.`);
	}
	
	/**
	 * Returns a map of all `naissance.Geometry.instances`.
	 * 
	 * @returns {{"<geometry_id>": naissance.Geometry}}
	 */
	static getObject () {
		//Declare local instance variables
		let return_obj = {};
		
		//Iterate over all naissance.Geometry.instances
		for (let i = 0; i < naissance.Geometry.instances.length; i++) {
			let local_geometry = naissance.Geometry.instances[i];
			
			return_obj[local_geometry.id] = local_geometry;
		}
		
		//Return statement
		return return_obj;
	}
	
	/**
	 * Parses a list of commands for multiple geometries.
	 * 
	 * @param {string[]} arg0_geometry_ids
	 * @param {Object} [arg1_options]
	 *  @param {Object} [arg1_options.command="set_symbol"] - The `parseAction()` command to package up.
	 *  @param {string} [arg1_options.key="set_geometry_symbols"]
	 *  @param {string} [arg1_options.name="Set Geometry Symbols"]
	 *  @param {string} [arg1_options.type="Geometry"]
	 *  @param {function()|Object} [arg1_options.value] - The individual value to actually send to each command. If a function, the return value is concatenated. .arguments[0] if a function refers to the index.
	 *  
	 *  @param {Object} [arg1_options.date] - The date at which to apply this change.
	 */
	static parseActionForGeometries (arg0_geometry_ids, arg1_options) {
		//Convert from parameters
		let geometry_ids = Array.toArray(arg0_geometry_ids);
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.command) options.command = "set_symbol";
		if (!options.key) options.key = "set_geometry_symbols";
		if (!options.name) options.name = "Set Geometry Symbols";
		if (!options.type) options.type = "Geometry";
		if (!options.value) options.value = {};
		
		//Declare local instance variables
		let dals_value_array = [];
		let old_date;
		
		//Iterate over all geometry_ids and populate dals_value_array
		for (let i = 0; i < geometry_ids.length; i++) {
			let local_value = options.value;
			
			if (typeof options.value === "function")
				local_value = options.value(i);
			
			dals_value_array.push({ 
				type: options.type,
				geometry_id: geometry_ids[i], 
				[options.command]: options.value 
			});
		}
		
		//Add to DALS
		if (options.date) {
			old_date = JSON.parse(JSON.stringify(main.date));
			main.date = options.date;
		}
		DALS.Timeline.parseAction({
			options: { name: options.name, key: options.key },
			value: dals_value_array
		});
		if (options.date)
			main.date = old_date;
	};
	
	static setGeometries (arg0_geometry_ids, arg1_geometries, arg2_options) { 
		//Convert from parameters
		let geometry_ids = Array.toArray(arg0_geometry_ids);
		let geometries = Array.toArray(arg1_geometries);
		let options = (arg2_options) ? arg2_options : {};
		
		//Parse action for geometries
		naissance.Geometry.parseActionForGeometries(geometry_ids, {
			command: "set_geometry",
			key: "set_geometries",
			name: "Set Geometries",
			value: (i) => (geometries[i]) ? geometries[i] : undefined,
			...options
		});
	}
	
	static setProperties (arg0_geometry_ids, arg1_properties_obj, arg2_options) {
		//Convert from parameters
		let geometry_ids = Array.toArray(arg0_geometry_ids);
		let properties_obj = (arg1_properties_obj) ? arg1_properties_obj : {};
		let options = (arg2_options) ? arg2_options : {};
		
		//Parse action for geometries
		naissance.Geometry.parseActionForGeometries(geometry_ids, {
			command: "set_properties",
			key: "set_geometry_properties",
			name: "Set Geometry Properties",
			value: properties_obj,
			...options
		});
	}
	
	static setSymbols (arg0_geometry_ids, arg1_symbol_obj, arg2_options) {
		//Convert from parameters
		let geometry_ids = Array.toArray(arg0_geometry_ids);
		let symbol_obj = (arg1_symbol_obj) ? arg1_symbol_obj : {};
		let options = (arg2_options) ? arg2_options : {};
		
		//Parse action for geometries
		naissance.Geometry.parseActionForGeometries(geometry_ids, {
			value: symbol_obj,
			...options
		});
	}
};