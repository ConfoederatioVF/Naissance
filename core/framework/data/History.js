if (!global.naissance) global.naissance = {};
naissance.History = class extends ve.Class {
	constructor (arg0_keyframes_obj, arg1_options) {
		//Convert from parameters
		super();
		this.do_not_draw = false;
		this.keyframes = (arg0_keyframes_obj) ? arg0_keyframes_obj : {};
		
		//Declare local instance variables
		this.options = {
			components_obj: {},
			...arg1_options
		};
		this.interface = new ve.Interface({}, { name: "Keyframes", width: 99 });
	}
	
	addKeyframe (arg0_date, ...argn_arguments) {
		//Convert from parameters
		let date = (arg0_date !== undefined) ? Date.convertTimestampToDate(arg0_date) : main.date;
		
		//Declare local instance variables
		let timestamp = Date.getTimestamp(date);
		
		//Create a new keyframe, otherwise concatenate with existing options if history is already defined
		if (this.keyframes[timestamp] === undefined) {
			this.keyframes[timestamp] = new naissance.HistoryKeyframe(date, ...argn_arguments);
		} else {
			let local_keyframe = this.keyframes[timestamp];
				local_keyframe.addData(...argn_arguments);
		}
		
		//Return statement
		return this.keyframes[timestamp];
	}
	
	//[QUARANTINE]
	cleanKeyframes () {
		//Declare local instance variables
		let all_timestamps = Object.keys(this.keyframes).sort((a, b) => {
			return Date.convertTimestampToInt(a) - Date.convertTimestampToInt(b);
		});
		let running_state = []; //Tracks the accumulated values to find redundancies
		
		//Iterate over all_timestamps in the current history
		for (let i = 0; i < all_timestamps.length; i++) {
			let timestamp = all_timestamps[i];
			let local_keyframe = this.keyframes[timestamp];
			let has_meaningful_change = false;
			
			//Don't clean the very first keyframe, as it serves as the baseline
			if (i === 0) {
				//Update running state with the first keyframe's data
				running_state = JSON.parse(JSON.stringify(local_keyframe.value));
				continue;
			}
			
			for (let x = 0; x < local_keyframe.value.length; x++) {
				let current_val = local_keyframe.value[x];
				let prev_val = running_state[x];
				
				//Skip only if undefined; null is treated as a meaningful value change
				if (current_val === undefined) continue;
				
				if (typeof current_val === "object" && current_val !== null) {
					// Handle object merging and variable delta checks
					let is_redundant_obj = true;
					let cleaned_obj = { ...current_val };
					if (current_val.variables)
						cleaned_obj.variables = { ...current_val.variables };
					
					//Check nested variables
					if (current_val.variables && prev_val && prev_val.variables) {
						for (let key in current_val.variables)
							if (Boolean.isDeepEqual(current_val.variables[key], prev_val.variables[key])) {
								delete cleaned_obj.variables[key];
							} else {
								is_redundant_obj = false;
							}
						//If variables becomes empty, remove the key
						if (Object.keys(cleaned_obj.variables).length === 0) delete cleaned_obj.variables;
					} else if (current_val.variables) {
						is_redundant_obj = false;
					}
					
					//Check other properties of the object (excluding variables which we just handled)
					for (let key in current_val) {
						if (key === "variables") continue;
						if (prev_val && Boolean.isDeepEqual(current_val[key], prev_val[key])) {
							delete cleaned_obj[key];
						} else {
							is_redundant_obj = false;
						}
					}
					
					if (is_redundant_obj) {
						//Remove this index from keyframe if it changes nothing
						local_keyframe.value[x] = undefined;
					} else {
						//Update the keyframe with cleaned object and update running state
						local_keyframe.value[x] = cleaned_obj;
						has_meaningful_change = true;
						
						//Update running state for next iteration; ensure state is an object if merging
						if (typeof running_state[x] !== "object" || running_state[x] === null)
							running_state[x] = { variables: {} };
						
						if (cleaned_obj.variables)
							running_state[x].variables = {
								...running_state[x].variables,
								...cleaned_obj.variables
							};
						running_state[x] = { ...running_state[x], ...cleaned_obj };
					}
				} else {
					//Handle primitive values and null
					if (current_val === prev_val) {
						local_keyframe.value[x] = undefined;
					} else {
						running_state[x] = current_val;
						has_meaningful_change = true;
					}
				}
			}
			
			//If the keyframe now contains no unique data, delete the keyframe entirely
			let is_empty = local_keyframe.value.every(val => val === undefined);
			if (is_empty || !has_meaningful_change) {
				delete this.keyframes[timestamp];
			}
		}
	}
	
	draw (arg0_interface_obj) {
		//Convert from parameter
		let interface_obj = arg0_interface_obj;
		
		//Declare local instance variables
		let components_obj = {};
		if (this.interface && typeof this.interface.remove === "function") this.interface.remove();
		this.getKeyframe({ refresh_localisation: true });
		
		//Iterate over all_keyframes and push it to components_obj
		Object.iterate(this.keyframes, (local_key, local_value) => {
			//Set components_obj
			components_obj[`t_${local_key}`] = new ve.Interface({
				date_info: new ve.HTML(String.formatDate(parseInt(local_key)), { 
					tooltip: `Timestamp: ${local_value.timestamp}`,
					x: 0, y: 0
				}),
				localisation: veHTML(() => 
					(local_value.localisation) ? local_value.localisation : "", { x: 1, y: 0 }),
				actions_bar: veRawInterface({
					jump_to_date: veButton((e) => {
						DALS.Timeline.parseAction({
							options: { name: "Set Date", key: "load_date" },
							value: [
								{ type: "global", set_date: Date.convertTimestampToDate(local_key) },
								{ type: "global", refresh_date: true }
							]
						});
					}, {
						name: "<icon>arrow_forward</icon>",
						tooltip: "Jump to Date"
					}),
					move_keyframe: veButton(() => {
						let move_keyframe_window = veWindow({
							new_date: veDate(JSON.parse(JSON.stringify(local_value.date)), { name: "New Date" }),
							confirm: veButton(() => {
								DALS.Timeline.parseAction({
									options: { name: "Move Keyframe", key: "move_keyframe" },
									value: [{
										type: "Geometry",
										geometry_id: this.options._id(),
										move_keyframe: {
											date: local_value.date,
											ot_date: move_keyframe_window.new_date.v
										}
									}]
								});
								move_keyframe_window.close();
							})
						}, {
							can_rename: false,
							name: "Move Keyframe"
						});
					}, {
						name: "<icon>height</icon>",
						tooltip: "Move Keyframe to Date"
					}),
					remove_keyframe: veButton((e) => {
						DALS.Timeline.parseAction({
							options: { name: "Delete Keyframe", key: "delete_keyframe" },
							value: [
								{ type: "Geometry", geometry_id: this.options._id(), remove_keyframe: local_key },
								{ type: "global", refresh_date: true }
							]
						});
					}, {
						name: "<icon>delete</icon>",
						tooltip: "Delete Keyframe"
					})
				}, {
					style: {
						display: "flex",
						flexWrap: "nowrap",
						"[component='ve-button']": { marginRight: "var(--padding)" }
					},
					x: 2, y: 0 
				})
			}, {
				gc: true,
				is_folder: false,
				style: {
					"> table > tbody > tr": {
						"[id='0-0']": { width: "6rem" },
						"[id='1-0']": { width: "50%" },
					}
				}
			});
		}, { sort_mode: "date_descending" });
		
		//Set interface_obj.v
		if (interface_obj) {
			interface_obj.v = components_obj;
		} else {
			this.interface = new ve.Interface(components_obj, { name: "Keyframes", width: 99 });
		}
	}
	
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = JSON.parse(arg0_json);
		
		//Iterate over all_json_keys and assume them as keyframes
		if (json.keyframes) {
			let all_keyframes = Object.keys(json.keyframes).sort();
			
			this.do_not_draw = true;
			this.keyframes = {};
			for (let i = 0; i < all_keyframes.length; i++) {
				let local_date = Date.convertTimestampToDate(all_keyframes[i]);
				let local_keyframe = json.keyframes[all_keyframes[i]];
				
				this.addKeyframe(local_date, ...local_keyframe.value);
			}
			this.do_not_draw = false;
		} else {
			console.error(`naissance.History.fromJSON() requires arg0_json to have a .keyframes Array<Object>.`, json);
		}
	}
	
	getFirstKeyframe () {
		//Declare local instance variables
		let all_timestamps = this.getTimestamps();
		
		//Return statement
		return (all_timestamps.length > 0) ? this.keyframes[all_timestamps[0]] : undefined;
	}
	
	getLastKeyframe () {
		//Declare local instance variables
		let all_timestamps = this.getTimestamps();
		
		//Return statement
		return (all_timestamps.length > 0) ? this.keyframes[all_timestamps.length - 1] : undefined;
	}
	
	getKeyframe (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (options.date === undefined) options.date = main.date;
		
		//Declare local instance variables
		let return_keyframe = {};
		let timestamp = Date.getTimestamp(options.date);
		
		//1. If options.absolute_keyframe = true, iterate over all keyframes in this.keyframes, and return the most recent one
		if (options.absolute_keyframe) {
			Object.iterate(
				this.keyframes,
				(local_key, local_keyframe) => {
					if (Date.convertTimestampToInt(local_key) <= Date.convertTimestampToInt(timestamp))
						return_keyframe = this.keyframes[local_key];
				},
				{ sort_mode: "date_ascending" }
			);
			
			//Return statement
			return return_keyframe;
		}
		
		//2. If options.absolute_keyframe = false, iterate over all keyframes in this.keyframes, and concatenate the .value of the relative keyframe
		if (!options.absolute_keyframe) {
			return_keyframe = {
				date: options.date,
				timestamp: timestamp,
				value: [],
			};
			
			Object.iterate(this.keyframes, (local_key, local_keyframe) => {
				//Parse localisation first, then concatenate
				if (options.refresh_localisation)
					local_keyframe.localisation = (this.options.localisation_function) ? 
						this.options.localisation_function(local_keyframe, return_keyframe) : "";
				
				if (Date.convertTimestampToInt(local_key) <= Date.convertTimestampToInt(timestamp))
					for (let x = 0; x < local_keyframe.value.length; x++)
						if (typeof local_keyframe.value[x] === "object" && local_keyframe.value[x] !== null) {
							let old_variables = return_keyframe.value[x]?.variables
								? return_keyframe.value[x].variables
								: {};
							
							//Return keyframe
							return_keyframe.value[x] = {
								...(return_keyframe.value[x] ? return_keyframe.value[x] : {}),
								...local_keyframe.value[x],
							};
							
							//Handle nested .variables
							if (local_keyframe.value[x] && local_keyframe.value[x].variables)
								return_keyframe.value[x].variables = {
									...old_variables,
									...local_keyframe.value[x].variables,
								};
						} else if (local_keyframe.value[x] !== undefined) {
							if (local_keyframe.value[x] === "undefined") continue; //Overwrite undefined strings
							if (x !== 0 && local_keyframe.value[x] === null) continue; //Null should be overridden for [1] symbols, [2] properties
							//If the value is null or a primitive, it overwrites the previous accumulated state
							return_keyframe.value[x] = local_keyframe.value[x];
						}
			}, { sort_mode: "date_ascending" });
			
			//Return statement
			return return_keyframe;
		}
	}
	
	getTimestamps () {
		//Return statement
		return Object.keys(this.keyframes).sort((a, b) => {
			return Date.convertTimestampToInt(a) - Date.convertTimestampToInt(b);
		});
	}
	
	moveKeyframe (arg0_date, arg1_date) {
		//Convert from parameters
		let date = Date.convertTimestampToDate(arg0_date);
		let ot_date = Date.convertTimestampToDate(arg1_date);
		
		//Declare local instance variables
		let ot_timestamp = Date.getTimestamp(ot_date);
		let timestamp = Date.getTimestamp(date);
		
		//Internal guard clause if timestamps are the same
		if (timestamp === ot_timestamp) return;
		
		//Check if keyframe_obj exists; if it does, move it
		let keyframe_obj = this.keyframes[timestamp];
		
		if (keyframe_obj) {
			keyframe_obj.date = ot_date;
			keyframe_obj.timestamp = ot_timestamp;
			this.keyframes[ot_timestamp] = this.keyframes[timestamp];
			
			delete this.keyframes[timestamp];
		}
	}
	
	removeKeyframe (arg0_date) {
		//Convert from parameters
		let date = (arg0_date !== undefined) ? Date.convertTimestampToDate(arg0_date) : main.date;
		
		//Declare local instance variables
		let timestamp = Date.getTimestamp(date);
		
		//Delete target keyframe 
		delete this.keyframes[timestamp];
	}
	
	replaceKeyframe (arg0_keyframe, arg1_keyframe, arg2_options) {
		//Convert from parameters
		let keyframe = arg0_keyframe;
		let ot_keyframe = arg1_keyframe;
		let options = (arg2_options) ? arg2_options : {};
		
		//Declare local instance variables
		let timestamp = JSON.parse(JSON.stringify(keyframe.timestamp));
		
		//Swap out keyframe; refresh localisation
		this.removeKeyframe(timestamp);
		this.addKeyframe(timestamp, ...ot_keyframe.value);
		
		if (options.refresh_localisation !== false) this.getKeyframe();
	}
	
	toJSON () {
		//Convert from parameters
		let json_obj = {
			keyframes: {}
		};
		
		//Iterate over all this.keyframes and parse them to a minimal JSON contract
		let all_keyframes = Object.keys(this.keyframes).sort();
		
		for (let i = 0; i < all_keyframes.length; i++) {
			let local_keyframe = this.keyframes[all_keyframes[i]];
			
			if (local_keyframe.value[0] === undefined) local_keyframe.value[0] = "undefined";
			json_obj.keyframes[all_keyframes[i]] = { value: local_keyframe.value };
		}
		
		//Return statement
		return JSON.stringify(json_obj);
	}
};