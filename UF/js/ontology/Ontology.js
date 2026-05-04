//Initialise functions
{
	/**
	 * Represents Ontologies which have been hydrated and streamed-in from a set database. Each Ontology line is formatted like this:
	 * `<Ontology ID>` {@link Object} - Where Object is JSON, with the following mandatory options.
	 * - `.date`: {@link number} - The date the Ontology event happened as a timestamp.
	 * - `.type`: {@link string}
	 * 
	 * Ontologies are streamed from `.ontology` files at the device's maximum read-speed via inter-process communication (IPC). For most modern computers, this is ~1GB/s. They may be stream-queried in a separate process, piped to render, and disposed of as necessary.
	 * 
	 * ##### Constructor:
	 * - `arg0_type="Ontology"`: {@link string} - The Ontology subclass/type to reference.
	 * - `arg1_state_array`: {@link Array}<{ date: {@link number}, data: {@link Object}, ...argn_fields }>
	 *   - `argn_fields`:
	 *     - `.add_relations`: { id: {@link string}, type: {@link string} }
	 *     - `.add_tags`: {@link Array}<{@link string}>
	 *     - `.remove_relations`: { id: {@link string}, ... }|{@link Array}<{@link string}>
	 *     - `.remove_tags`: {@link Array}<{@link string}>
	 *     - `.set_tags`: {@link Array}<{@link string}> - Override.
	 *     - `.set_relations`: { id: {@link string}, type: {@link string} } - Override.
	 * - `arg2_options`: {@link Object}
	 *   - `.id=Ontology.getOntologyID()`: {@link string} - The manual ID to override the default assignment.
	 *   - `.worker_type=""`: {@link string} - The worker from which the Ontology originated.
	 *   
	 * ##### Instance:
	 * - `.options`: {@link Object}
	 * - `.type`: {@link string}
	 * - 
	 * - `.id`: {@link string}
	 * - `.geometries`: {@link Array}<{@link maptalks.Geometry}>
	 * - `.state`: {@link Array}<{@link Object}>
	 * - `.worker_type`: {@link string}
	 * 
	 * ##### Methods:
	 * - <span color=00ffff>{@link Ontology._rebuildDiffsFromSnapshots|_rebuildDiffsFromSnapshots}</span> | {@link Object}(arg0_snapshots:{@link Array}<{@link Object}>)
	 * - <span color=00ffff>{@link Ontology._resolveAllSnapshots|_resolveAllSnapshots}</span>() | {@link Array}<{@link Object}>
	 * - <span color=00ffff>{@link Ontology._resolveStateAtIndex|_resolveStateAtIndex}</span>(arg0_index:{@link number}) | {@link Object}
	 * - <span color=00ffff>{@link Ontology._sortState|_sortState}</span>()
	 * - <span color=00ffff>{@link Ontology.addKeyframe|addKeyframe}</span>(arg0_date:{@link Date}, arg1_date:{@link Date}) | {@link Object}
	 * - <span color=00ffff>{@link Ontology.addRelation|addRelation}</span>(arg0_date:{@link Date}, arg1_relation_obj:{@link Object}) | {@link Object}
	 * - <span color=00ffff>{@link Ontology.deleteKeyframe|deleteKeyframe}</span>(arg0_date:{@link Date}) | {@link boolean}
	 * - <span color=00ffff>{@link Ontology.draw|draw}</span>() | {@link Array}<{@link maptalks.Geometry}>
	 * - <span color=00ffff>{@link Ontology.getElement|getElement}</span>() | {@link HTMLElement}
	 * - <span color=00ffff>{@link Ontology.getFirstKeyframeWithProperty|getFirstKeyframeWithProperty}</span>(arg0_property:{@link Object})
	 * - <span color=00ffff>{@link Ontology.getLastKeyframeWithProperty|getLastKeyframeWithProperty}</span>(arg0_property:{@link Object})
	 * - <span color=00ffff>{@link Ontology.getTimelineElement|getTimelineElement}</span>(arg0_options:{@link Object}) | {@link HTMLElement}
	 * - <span color=00ffff>{@link Ontology.getState|getState}</span>(arg0_date:{@link Date}) | {@link Object}
	 * - <span color=00ffff>{@link Ontology.getTimelineElement|getTimelineElement}</span>(arg0_options:{@link Object})
	 * - <span color=00ffff>{@link Ontology.jumpToKeyframe|jumpToKeyframe}</span>(arg0_date:{@link Date}) | {@link Object}|{@link null}
	 * - <span color=00ffff>{@link Ontology.mergeState|mergeState}</span>(arg0_state:{@link Array}<{@link Object}>)
	 * - <span color=00ffff>{@link Ontology.moveKeyframe|moveKeyframe}</span>(arg0_date:{@link Date}, arg1_date:{@link Date}) | {@link boolean}
	 * - <span color=00ffff>{@link Ontology.remove|remove}</span>()
	 * - <span color=00ffff>{@link Ontology.removeRelation|removeRelation}</span>(arg0_relation:{@link string}, arg1_date:{@link Date})
	 * - <span color=00ffff>{@link Ontology.removeRleations|removeRelations}</span>(arg0_relations:{@link Array}<{@link string}>, arg1_date:{@link Date})
	 * - <span color=00ffff>{@link Ontology.saveToDatabase|saveToDatabase}</span>()
	 * 
	 * ##### Static Fields:
	 * - `.initialised=false`: {@link boolean}
	 * - `.instances`: {@link Array}<{@link Ontology}>
	 * - `.ontology_folder_path=""`: {@link string}
	 * - `.queue`: {@link Array}<{@link Ontology}> - Queued Ontologies waiting to be saved and passed into `.instances`.
	 * 
	 * ##### Static Methods:
	 * - <span color=00ffff>{@link Ontology.applyMutations|applyMutations}</span>(arg0_resolved_data:{@link Object}, arg1_mutations:{@link Object}) | {@link Object}
	 * - <span color=00ffff>{@link Ontology.fromDatabase|fromDatabase}</span>()
	 * - <span color=00ffff>{@link Ontology.getOntologyFromDatabase}</span>(arg0_ontology_id:{@link string})
	 * - <span color=00ffff>{@link Ontology.getOntologyID|getOntologyID}</span>() | {@link string}
	 * - <span color=00ffff>{@link Ontology.initialise|initialise}</span>()
	 * 
	 * @type {Ontology}
	 */
	global.Ontology = class {
		static dirty_instances = new Set();
		static _instances_set = new Set();
		static _is_flushing = false;
		
		/**
		 * @type {boolean}
		 */
		static initialised = false;
		
		/**
		 * @type {Ontology[]}
		 */
		static instances = [];
		
		static is_loading = false;
		
		/**
		 * @type {string}
		 */
		static ontology_folder_path = ve.registry.settings.Blacktraffic.ontology_saves_folder;
		
		/**
		 * @type {Ontology[]}
		 */
		static queue = [];
		
		constructor (arg0_type, arg1_state_array, arg2_options) {
			let type = arg0_type ? arg0_type : 'Ontology';
			let state_array = arg1_state_array ? arg1_state_array : [];
			let options = arg2_options ? arg2_options : {};
			
			if (!Ontology.initialised) Ontology.initialise();
			
			this.is_ontology = true;
			this.options = options;
			this.type = type;
			this.id = this.options.id ? this.options.id : Ontology.getOntologyID();
			
			// Detect if the incoming data is already marked as saved
			let is_clean_load = state_array.length > 0 && state_array.every(kf => kf._saved);
			
			let existing_instance =
				Ontology.instances.find((local_ontology) => local_ontology.id === this.id) ||
				Ontology.queue.find((local_ontology) => local_ontology.id === this.id);
			
			if (existing_instance) {
				existing_instance.mergeState(state_array, is_clean_load);
				return existing_instance;
			}
			
			this.geometries = [];
			this.state = state_array;
			this.worker_type = this.options.worker_type ? this.options.worker_type : '';
			
			this._sortState();
			
			//If it's a new user-created instance (not clean), mark it dirty
			if (!is_clean_load)
				Ontology.dirty_instances.add(this);
			Ontology.queue.push(this);
		}
		
		/**
		 * Given an array of fully-resolved snapshots (one per keyframe, indexed automatically to `this.state`), rewrite every keyframe's data so that the last entry is the full snapshot and every earlier entry is a negative diff against its successor.
		 * @private
		 * 
		 * @param {Object[]} arg0_snapshots
		 * 
		 * @returns {Object}
		 */
		_rebuildDiffsFromSnapshots(arg0_snapshots, arg1_is_clean) {
			let snapshots = arg0_snapshots ? arg0_snapshots : [];
			if (snapshots.length === 0) return;
			
			let last_index = snapshots.length - 1;
			
			// Re-calculate the negative diff chain
			this.state[last_index].data = structuredClone(snapshots[last_index]);
			for (let i = last_index - 1; i >= 0; i--) {
				this.state[i].data = Object.computeNegativeDiff(
					snapshots[i],
					snapshots[i + 1]
				);
			}
			
			/**
			 * Only mark as dirty if this is NOT a clean load from the database.
			 * If arg1_is_clean is true, we preserve the existing _saved flags.
			 */
			if (!arg1_is_clean) {
				for (let local_keyframe of this.state) {
					delete local_keyframe._saved; // Now the logic loop will pick this up
					
					// Clean up mutation metadata
					delete local_keyframe.add_relations;
					delete local_keyframe.add_tags;
					delete local_keyframe.remove_relations;
					delete local_keyframe.remove_tags;
					delete local_keyframe.set_relations;
					delete local_keyframe.set_tags;
				}
				Ontology.dirty_instances.add(this);
			}
			
			return this.state;
		}
		
		/**
		 * Fully resolve every keyframe, return the array of snapshots.
		 * @private
		 * 
		 * @returns {Object[]}
		 */
		_resolveAllSnapshots () {
			//Declare local instance variables
			let snapshots = [];
			
			//Iterate over the present state and push all resolved states to snapshots
			for (let i = 0; i < this.state.length; i++)
				snapshots.push(this._resolveStateAtIndex(i));
			
			//Return statement
			return snapshots;
		}
		
		/**
		 * Resolves the state at a given index and returns it.
		 * @private
		 * 
		 * @param {number} [arg0_index=0]
		 * 
		 * @returns {Object}
		 */
		_resolveStateAtIndex (arg0_index) {
			//Convert from parameters
			let index = Math.returnSafeNumber(arg0_index);
			
			if (this.state.length === 0) return {}; //Internal guard clause if state is empty
			if (index < 0 || index > this.state.length - 1) return {}; //Internal guard clause if state is invalid
			
			//Declare local instance variables
			let resolved = structuredClone(this.state[this.state.length - 1].data || {});
			
			//Walk backwards from head towards the requested index, applying each keyframe's stored diff to regress the state
			for (let i = this.state.length - 2; i >= index; i--) {
				let diff = (this.state[i].data || {});
				
				Object.iterate(diff, (local_key, local_value) => {
					if (local_value === null) {
						delete resolved[local_key]; //Null sentinel = key did not exist at that keyframe
					} else {
						resolved[local_key] = structuredClone(local_value);
					}
				});
			}
			
			//Return statement
			return resolved;
		}
		
		/**
		 * Sorts `this.state` in ascending order by `.date`. Last = head.
		 * @private
		 */
		_sortState () { 
			this.state.sort((a, b) => a.date - b.date);
		}
		
		/**
		 * Adds a new keyframe/state mutation at the given date, typically the head state. The provided `arg1_data` and optional relation/tag mutations are merged into the resolved timeline, and the entire diff chain is rebuilt so the head remains the latest full snapshot.
		 * 
		 * @param {Date|any} arg0_date
		 * @param {Object} arg1_data
		 * @param {Object} [arg2_options]
		 *  @param {Object[]} [arg2_options.add_relations]
		 *  @param {string[]} [arg2_options.add_tags]
		 *  @param {Object[]|string[]} [arg2_options.remove_relations]
		 *  @param {string[]} [arg2_options.remove_tags]
		 *  @param {Object[]} [arg2_options.set_relations]
		 *  @param {string[]} [arg2_options.set_tags]
		 * 
		 * @returns {Object}
		 */
		addKeyframe (arg0_date, arg1_data, arg2_options) {
			//Convert from parameters
			let date = Date.getDate(arg0_date).getTime();
			let data_obj = (arg1_data) ? structuredClone(arg1_data) : {};
			let options = (arg2_options) ? arg2_options : {};
			
			//Declare local instance variables
			let insert_index = this.state.length;
			let snapshots = this._resolveAllSnapshots();
			
			//Iterate over this.state and overwrite existing keyframes
			for (let i = 0; i < this.state.length; i++)
				if (this.state[i].date === date) {
					insert_index = i; //Overwrite existing keyframe at this date
					break;
				} else if (this.state[i].date > date) {
					insert_index = i;
					break;
				}
			
			//Resolve the base state at this date (what would have been active just before this keyframe)
			let base_state = {};
		
			if (insert_index > 0 && insert_index <= snapshots.length) {
				//Use the snapshot of the previous keyframe
				base_state = structuredClone(snapshots[Math.min(insert_index, snapshots.length) - 1]);
			} else if (insert_index === 0 && snapshots.length > 0) {
				base_state = {};
			}
			
			//Merge data onto base, then apply relation/tag mutations
			let is_overwrite = (insert_index < this.state.length && this.state[insert_index].date === date);
			let new_keyframe = { date: date, data: {} };
			let new_snapshot = Object.assign({}, base_state, data_obj);
				new_snapshot = Ontology.applyMutations(new_snapshot, options);
				
			if (is_overwrite) {
				this.state[insert_index] = new_keyframe;
				snapshots[insert_index] = new_snapshot;
			} else {
				this.state.splice(insert_index, 0, new_keyframe);
				snapshots.splice(insert_index, 0, new_snapshot);
			}
			
			//Rebuild negative diffs from the snapshot array
			this._rebuildDiffsFromSnapshots(snapshots);
			
			//Return statement
			return this.state[insert_index];
		}
		
		/**
		 * Adds a relation object to the selected date.
		 * 
		 * @param {Date|any} arg0_date
		 * @param {{id: string, data: Object}} arg1_relation_obj
		 */
		addRelation (arg0_date, arg1_relation_obj) {
			//Convert from parameters
			let date = (arg0_date) ? Date.getDate(arg0_date).getTime() : Date.now();
			let relation_obj = arg1_relation_obj;
			
			if (!relation_obj) return; //Internal guard clause if relation is null
			
			//Declare local instance variables
			let current_state = this.getState(date);
			
			this.addKeyframe(date, current_state, { add_relations: [relation_obj] });
		}
		
		/**
		 * Deletes the keyframe at the given date.
		 * 
		 * @param {Date|any} arg0_date
		 * 
		 * @returns {boolean}
		 */
		deleteKeyframe (arg0_date) {
			//Convert from parameters
			let date = Date.getDate(arg0_date).getTime();
			
			//Declare local instance variables
			let index = this.state.findIndex((local_keyframe) => local_keyframe.date === date);
				if (index === -1) return false; //Internal guard clause if index could not be deleted
			let snapshots = this._resolveAllSnapshots();
			
			//Remove keyframe
			this.state.splice(index, 1);
			snapshots.splice(index, 1);
			
			if (this.state.length > 0) this._rebuildDiffsFromSnapshots(snapshots);
			
			//Return statement
			return true;
		}
		
		/**
		 * Draws the Ontology. Should be overridden by subclasses.
		 */
		draw () {
			try {
				if (this.type !== "Ontology" && global[`Ontology_${this.type}`]) {
					let target_class = global[`Ontology_${this.type}`];
					
					//Only delegate if this is not already an instance of that class to prevent infinite loops
					if (!(this instanceof target_class) && typeof target_class.prototype.draw === "function")
						return target_class.prototype.draw.call(this);
				}
			} catch (e) {
				console.error(`[Ontology] Error in delegated draw for ${this.id}:`, e);
			}
			return this.geometries;
		}
		
		/**
		 * Returns an HTMLElement representing this Ontology.
		 * 
		 * @param {Object} [arg0_options]
		 *  @param {boolean} [arg0_options.do_not_show_timeline=false]
		 *  @param {Date|any} [arg0_options.end_date]
		 *  @param {Date|any} [arg0_options.start_date]
		 *  
		 * @returns {HTMLElement}
		 */
		getElement (arg0_options) {
			//Convert from parameters
			let options = (arg0_options) ? arg0_options : {};
			
			//Declare local instance variables
			let container_el = document.createElement("div");
				container_el.classList.add("ontology-element");
				container_el.dataset.id = this.id;
			let header_el = document.createElement("div");
				header_el.classList.add("ontology-header");
				header_el.textContent = `Type: ${this.type} | ID: ${this.id}`;
				container_el.appendChild(header_el);
			let state_el = document.createElement("pre");
				state_el.className = "ontology-state";
				let head_index = this.state.length - 1;
				state_el.textContent = (head_index >= 0) ? JSON.stringify(this.state[head_index].data, null, 2) : "{}";
				container_el.appendChild(state_el);
			
			//Timeline (unless suppressed)
			if (!options.do_not_show_timeline) container_el.appendChild(this.getTimelineElement(options));
			
			//Return statement
			return container_el;
		}
		
		/**
		 * Returns the first keyframe whose resolved state contains the given property key.
		 * 
		 * @param {string} arg0_property
		 * 
		 * @returns {{data: Object, date: Date, index: number}|null}
		 */
		getFirstKeyframeWithProperty (arg0_property) {
			//Convert from parameters
			let property = arg0_property;
			
			//Iterate over this.state from beginning
			for (let i = 0; i < this.state.length; i++) {
				let resolved_obj = this._resolveStateAtIndex(i);
				
				//Return statement
				if (resolved_obj[property] !== undefined && resolved_obj[property] !== null)
					return {
						data: resolved_obj,
						date: this.state[i].date,
						index: i
					};
			}
			return null;
		}
		
		/**
		 * Returns the last keyframe whose resolved state contains the given property key.
		 *
		 * @param {string} arg0_property
		 *
		 * @returns {{data: Object, date: Date, index: number}|null}
		 */
		getLastKeyframeWithProperty (arg0_property) {
			//Convert from parameters
			let property = arg0_property;
			
			//Iterate over this.state from latest
			for (let i = this.state.length - 1; i >= 0; i--) {
				let resolved_obj = this._resolveStateAtIndex(i);
				
				//Return statement
				if (resolved_obj[property] !== undefined && resolved_obj[property] !== null)
					return {
						data: resolved_obj,
						date: this.state[i].date,
						index: i
					};
			}
			return null;
		}
		
		/**
		 * Returns the fully-resolved state at a given date. If the date fails between two keyframes, the earlier keyframe's resolved state is returned. If the date is past the head, the head snapshot is returned. If before all keyframes, an empty object is returned.
		 *
		 * @param {Date|any} arg0_date
		 *
		 * @returns {Object}
		 */
		getState (arg0_date) {
			//Convert from parameters
			let date = Date.getDate(arg0_date);
			
			if (this.state.length === 0) return {}; //Internal guard clause if state is empty
			
			//Declare local instance variables
			let current_timestamp = date.getTime();
			let target_index = -1;
			
			//Find the last keyframe whose date <= current_timestamp
			for (let i = this.state.length - 1; i >= 0; i--)
				if (this.state[i].date <= current_timestamp) {
					target_index = i;
					break;
				}
			if (target_index === -1) return {};
			
			//Return statement
			return this._resolveStateAtIndex(target_index);
		}
		
		/**
		 * Returns an {@link HTMLElement} representing this Ontology's timeline.
		 * 
		 * @param {Object} [arg0_options]
		 *  @param {Date|any} [arg0_options.start_date]
		 *  @param {Date|any} [arg0_options.end_date]
		 *  
		 * @returns {HTMLElement}
		 */
		getTimelineElement (arg0_options) {
			//Convert from parameters
			let options = (arg0_options) ? arg0_options : {};
			
			//Initialise options
			options.end_date = (options.end_date !== undefined) ?
				Date.getDate(options.end_date).getTime() : Infinity;
			options.start_date = (options.start_date !== undefined) ? 
				Date.getDate(options.start_date).getTime() : -Infinity;
			
			//Declare local instance variables
			let timeline_el = document.createElement("div");
				timeline_el.classList.add("ontology-timeline");
				
			//Iterate over all keyframes in state
			for (let i = 0; i < this.state.length; i++) {
				let local_keyframe = this.state[i];
				if (local_keyframe.date < options.start_date || local_keyframe.date > options.end_date) continue;
				
				let local_keyframe_el = document.createElement("div");
					local_keyframe_el.classList.add("ontology-keyframe");
					local_keyframe_el.dataset.date = local_keyframe.date;
					local_keyframe_el.dataset.index = i.toString();
				
				let label_el = document.createElement("span");
					label_el.classList.add("ontology-keyframe-date");
					label_el.textContent = new Date(local_keyframe.date).toISOString();
					local_keyframe_el.appendChild(label_el);
				
				if (i === this.state.length - 1) local_keyframe_el.classList.add("ontology-keyframe-head");
				timeline_el.appendChild(local_keyframe_el);
			}
			
			//Return statement
			return timeline_el;
		}
		
		/**
		 * Jumps to a specific keyframe and calls the draw function for the Ontology.
		 * 
		 * @param arg0_date
		 * 
		 * @returns {{data: Object, date: Date, index: number}|null}
		 */
		jumpToKeyframe (arg0_date) {
			//Convert from parameters
			let date = Date.getDate(arg0_date);
			
			if (this.state.length === 0) return null; //Internal guard clause if there is nothing in the current state
			
			//Declare local instance variables
			let best_index = 0;
			let timestamp = date.getTime();
			
			let best_distance = Math.abs(this.state[0].date - timestamp);
			
			//Iterate over the current state and update best_dist, best_index
			for (let i = 1; i < this.state.length; i++) {
				let local_distance = Math.abs(this.state[i].date - timestamp);
				
				if (local_distance < best_distance) {
					best_distance = local_distance;
					best_index = i;
				}
			}
			
			if (this.draw) this.draw(); //Call draw() if it exists
			
			//Return statement
			return {
				data: this._resolveStateAtIndex(best_index),
				date: this.state[best_index].date,
				index: best_index
			};
		}
		
		/**
		 * Merges an incoming state array into the current Ontology. Resolves both states to snapshots, merges them, and rebuilds the diff chain.
		 * 
		 * @param {Object[]} arg0_state_array
		 */
		mergeState (arg0_state_array, arg1_is_clean) {
			let state = arg0_state_array ? arg0_state_array : [];
			if (state.length === 0) return;
			
			let current_snapshots = this._resolveAllSnapshots();
			let snapshot_map = {};
			
			for (let i = 0; i < this.state.length; i++)
				snapshot_map[this.state[i].date] = current_snapshots[i];
			
			// Logic to resolve incoming state snapshots
			let temp_context = {
				state: state,
				_resolveStateAtIndex: this._resolveStateAtIndex,
			};
			temp_context._resolveAllSnapshots = this._resolveAllSnapshots.bind(temp_context);
			temp_context._resolveStateAtIndex = this._resolveStateAtIndex.bind(temp_context);
			let incoming_snapshots = temp_context._resolveAllSnapshots();
			
			for (let i = 0; i < state.length; i++) {
				let local_date = state[i].date;
				if (snapshot_map[local_date]) {
					Object.assign(snapshot_map[local_date], incoming_snapshots[i]);
				} else {
					snapshot_map[local_date] = incoming_snapshots[i];
				}
			}
			
			let sorted_dates = Object.keys(snapshot_map)
			.map(Number)
			.sort((a, b) => a - b);
			
			this.state = sorted_dates.map((date) => {
				// Look for an existing keyframe to preserve the _saved flag if it exists
				let existing = state.find((s) => s.date === date);
				return { date: date, data: {}, _saved: existing?._saved };
			});
			
			let final_snapshots = sorted_dates.map((date) => snapshot_map[date]);
			
			// Pass the "clean" flag
			this._rebuildDiffsFromSnapshots(final_snapshots, arg1_is_clean);
		}
		
		/**
		 * Moves a keyframe from `arg0_date` to `arg1_date`.
		 * 
		 * @param {Date|any} arg0_date
		 * @param {Date|any} arg1_date
		 * 
		 * @returns {boolean}
		 */
		moveKeyframe (arg0_date, arg1_date) {
			//Convert from parameters
			let old_date = Date.getDate(arg0_date).getTime();
			let new_date = Date.getDate(arg1_date).getTime();
			
			//Declare local instance variables
			let index = this.state.findIndex((local_keyframe) => local_keyframe.date === old_date);
				if (index === -1) return false; //Internal guard clause if index could not be found
			
			//Resolve snapshot at the old position
			let snapshot = this._resolveStateAtIndex(index);
			this.deleteKeyframe(old_date);
			this.addKeyframe(new_date, snapshot);
			
			//Return statement
			return true;
		}
		
		/**
		 * Removes the Ontology.
		 */
		remove () {
			//Declare local instance variables
			let index = Ontology.instances.indexOf(this);
				if (index !== -1) Ontology.instances.splice(index, 1);
			let queue_index = Ontology.queue.indexOf(this);
				if (queue_index !== -1) Ontology.queue.splice(queue_index, 1);
			Ontology._instances_set.delete(this);
			Ontology.dirty_instances.delete(this);
			
			//Remove geometries from any map layer
			for (let local_geometry of this.geometries)
				if (local_geometry && local_geometry.remove) local_geometry.remove();
			this.geometries = [];
			this.state = [];
		}
		
		/**
		 * Removes a single relation from a specified date.
		 * 
		 * @param {Object|string} arg0_relation
		 * @param {Date|any} arg1_date
		 */
		removeRelation (arg0_relation, arg1_date) {
			//Convert from parameters
			let relation_id = (typeof arg0_relation === "string") ? arg0_relation : arg0_relation?.id;
			let date = (arg1_date) ? Date.getDate(arg1_date).getTime() : Date.now();
			
			if (!relation_id) return; //Internal guard clause if relation_id doesn't exist
			
			//Declare local instance variables
			let current_state = this.getState(date);
			
			this.addKeyframe(date, current_state, { remove_relations: [relation_id] });
		}
		
		/**
		 * Removes multiple relations from a specified date.
		 * 
		 * @param {Object|string} arg0_relations
		 * @param {Date|any} arg1_date
		 */
		removeRelations (arg0_relations, arg1_date) {
			//Convert from parameters
			let relations = (arg0_relations) ? arg0_relations : [];
			let date = (arg1_date) ? Date.getDate(arg1_date).getTime() : Date.now();
			
			//Declare local instance variables
			let current_state = this.getState(date);
			let relation_ids = relations.map((r) => (typeof r === "string") ? r : r.id);
			
			this.addKeyframe(date, current_state, { remove_relations: relation_ids });
		}
		
		/**
		 * Collects dirty keyframes into a write-batch map.
		 * Does NOT perform I/O itself; called by the logic loop.
		 *
		 * @param {Map<string, {lines: string[], keyframes: Object[]}>} arg0_batch_map
		 */
		saveToDatabase (arg0_batch_map) {
			let all_clean = true;
			
			for (let local_keyframe of this.state) {
				if (local_keyframe._saved) continue;
				all_clean = false;
				
				let filename = `${String.getDateString()}.ontology`;
				
				if (!arg0_batch_map.has(filename))
					arg0_batch_map.set(filename, { lines: [], keyframes: [] });
				
				let entry = arg0_batch_map.get(filename);
				let save_data = Object.assign({ type: this.type }, local_keyframe);
				delete save_data._saved;
				
				entry.lines.push(`${this.id} ${JSON.stringify(save_data)}\n`);
				entry.keyframes.push(local_keyframe);
			}
			
			if (all_clean) Ontology.dirty_instances.delete(this);
		}
		
		/**
		 * Applies relation/tag mutation fields onto a fully-resolved data object and returns the result (input is not mutated).
		 * 
		 * Order per category: set > add > remove.
		 * @alias #applyMutations
		 * @memberof Ontology
		 * 
		 * @param {Object} arg0_resolved_data
		 * @param {Object} arg1_mutations
		 * 
		 * @returns {Object}
		 */
		static applyMutations (arg0_resolved_data, arg1_mutations) {
			//Convert from parameters
			let data = structuredClone(arg0_resolved_data);
			let mutations = arg1_mutations;
			
			//Initialise data
			if (!data._relations) data._relations = [];
			if (!data._tags) data._tags = [];
			
			//Relations
			if (mutations.set_relations)
				data._relations = structuredClone(mutations.set_relations);
			if (mutations.add_relations)
				for (let local_relation of mutations.add_relations)
					if (!data._relations.find((r) => (r.id === local_relation.id)))
						data._relations.push(structuredClone(local_relation));
			if (mutations.remove_relations)
				for (let local_relation of mutations.remove_relations) {
					let relation_id = (typeof local_relation === "string") ? local_relation : local_relation.id;
					data._relations = data._relations.filter((r) => r.id !== relation_id);
				}
			
			//Tags
			if (mutations.set_tags)
				data._tags = [...mutations.set_tags];
			if (mutations.add_tags)
				for (let local_tag of mutations.add_tags)
					if (!data._tags.includes(local_tag)) data._tags.push(local_tag);
			if (mutations.remove_tags)
				data._tags = data._tags.filter((t) => !mutations.remove_tags.includes(t));
			
			//Return statement
			return data;
		}
		
		/**
		 * Loads all .ontology files from the folder path and hydrates the static instances.
		 * 
		 * @alias #fromDatabase
		 * @memberof Ontology
		 */
		//[QUARANTINE]
		static async fromDatabase () {
			let ipcRenderer = electron.ipcRenderer;
			
			// Set the hydration guard to prevent the Logic Loop from writing to disk
			Ontology.is_loading = true;
			
			console.log('[Ontology] Starting streaming hydration...');
			
			return new Promise((resolve, reject) => {
				// Clean up any stale listeners
				ipcRenderer.removeAllListeners('ontology:stream-batch');
				ipcRenderer.removeAllListeners('ontology:stream-done');
				ipcRenderer.removeAllListeners('ontology:stream-next');
				
				ipcRenderer.on('ontology:stream-batch', (event, batch) => {
					const ids = Object.keys(batch);
					
					/**
					 * processSlice
					 * Processes a small number of IDs per tick to keep the UI responsive.
					 */
					const processSlice = (index) => {
						const sliceSize = 10; // Number of unique Ontologies to hydrate per frame
						const end = Math.min(index + sliceSize, ids.length);
						
						for (let i = index; i < end; i++) {
							const id = ids[i];
							const state_array = batch[id];
							
							// 1. Mark every incoming keyframe as already saved to prevent Zip Bombing
							for (let local_kf of state_array) {
								local_kf._saved = true;
							}
							
							const head_state = state_array[state_array.length - 1];
							const type = head_state.type || 'Ontology';
							const target_class = global[`Ontology_${type}`] || Ontology;
							
							try {
								/**
								 * 2. Instantiate or Merge.
								 * The Ontology constructor handles merging if the ID already exists in queue/instances.
								 */
								if (type === 'Ontology') {
									new target_class(type, state_array, { id: id });
								} else {
									new target_class(state_array, { id: id });
								}
							} catch (e) {
								console.error(`[Ontology] Hydration error for ID ${id}:`, e);
							}
						}
						
						// 3. If there is more in the current batch, yield to the UI and continue
						if (end < ids.length) {
							setTimeout(() => processSlice(end), 0);
						} else {
							// 4. Batch finished; pull the next batch from the Main process
							ipcRenderer.send('ontology:stream-next');
						}
					};
					
					processSlice(0);
				});
				
				ipcRenderer.on('ontology:stream-done', () => {
					console.log('[Ontology] Hydration complete. Re-enabling disk saves.');
					Ontology.is_loading = false; // Release the hydration guard
					ipcRenderer.removeAllListeners('ontology:stream-next');
					resolve();
				});
				
				// Handle unexpected IPC errors
				ipcRenderer.on('ontology:stream-error', (event, err) => {
					Ontology.is_loading = false;
					console.error('[Ontology] IPC Stream Error:', err);
					reject(err);
				});
				
				// Initial trigger to start the stream
				ipcRenderer.send("ontology:initialise", Ontology.ontology_folder_path);
			});
		}
		
		/**
		 * Fetches a specific Ontology from the database by ID.
		 * 
		 * @alias #getOntologyFromDatabase
		 * @memberof Ontology
		 *
		 * @param {string} arg0_ontology_id
		 * 
		 * @returns {Ontology|null}
		 */
		//[QUARANTINE]
		static getOntologyFromDatabase (arg0_ontology_id) {
			// In a streaming architecture, we check current instances first
			let existing = Ontology.instances.find(i => i.id === arg0_ontology_id);
			if (existing) return existing;
			
			// If not loaded, we trigger a full load (or a filtered load)
			Ontology.fromDatabase();
			return Ontology.instances.find(i => i.id === arg0_ontology_id) || null;
		}
		
		/**
		 * Returns an Ontology ID/hash reflective of the current date.
		 * 
		 * @alias #getOntologyID
		 * @memberof Ontology
		 * 
		 * @returns {string}
		 */
		static getOntologyID () {
			//Return statement
			return `${Date.now()}_${this.queue.length}`;
		}
		
		/**
		 * Initialises Ontology logic at the global level.
		 * 
		 * @alias #initialise
		 * @memberof Ontology
		 */
		static initialise () {
			Ontology.initialised = true;
			
			if (!fs.existsSync(Ontology.ontology_folder_path))
				fs.mkdirSync(Ontology.ontology_folder_path, { recursive: true });
			
			Ontology.logic_loop = setInterval(async () => {
				if (Ontology._is_flushing) return;
				Ontology._is_flushing = true;
				
				try {
					// 1. ALWAYS flush queue to instances (Even while loading)
					for (let local_instance of Ontology.queue) {
						if (!Ontology._instances_set.has(local_instance)) {
							Ontology._instances_set.add(local_instance);
							Ontology.instances.push(local_instance);
							
							let sub_class = local_instance.constructor;
							if (sub_class !== Ontology && Array.isArray(sub_class.instances)) {
								if (!sub_class.instances.includes(local_instance))
									sub_class.instances.push(local_instance);
							}
						}
					}
					Ontology.queue = [];
					
					// Exit early if there are no dirty instances
					if (Ontology.dirty_instances.size === 0) return;
					
					//2. IMPORTANT: Move current dirty items to a temporary "work set", and clear the main set immediately.
					let work_set = new Set(Ontology.dirty_instances);
					Ontology.dirty_instances.clear();
					
					//Perform batch writes using the snapshot
					let batch_map = new Map();
					
					for (let local_instance of work_set)
						local_instance.saveToDatabase(batch_map);
					
					let write_promises = [];
					
					for (let [filename, { lines, keyframes }] of batch_map) {
						let file_path = path.join(Ontology.ontology_folder_path, filename);
						
						write_promises.push((async () => {
							let last_error = null;
							let max_retries = 5;
							
							for (let attempt = 0; attempt < max_retries; attempt++) {
								try {
									await fs.promises.appendFile(file_path, lines.join(""), "utf8");
									
									//Mark keyframes as saved on success
									for (let kf of keyframes) kf._saved = true;
									return;
								} catch (err) {
									last_error = err;
									// Exponential backoff
									await new Promise((resolve) =>
										setTimeout(resolve, 20*(attempt + 1)),
									);
								}
							}
							
							console.error(`Ontology: Failed to write to ${filename} after ${max_retries} attempts.`, last_error);
						})());
					}
					await Promise.all(write_promises);
				} finally {
					Ontology._is_flushing = false;
				}
			}, 100);
		}
	};
}