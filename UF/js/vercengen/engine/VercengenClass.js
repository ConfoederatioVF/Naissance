if (!global.ve) global.ve = {};

/**
 * <span color = "yellow">{@link ve.Class}</span>: Classes that extend this are parsed by the reflection engine, with UIs treated as being a subset of state via <span color = "yellow">{@link ve.Component}</span> type declarations.
 *
 * UIs can be opened via super.<span color=00ffff>open</span>(arg0_mode:"class"/"instance", arg1_options:{@link Object}), and closed using <span color=00ffff>close</span>(arg0_mode:"class"/"instance").
 * 
 * ##### Instance:
 * - `.id=Class.generateRandomID(ve.Class)`
 * - 
 * - `.class_window`: {@link ve.Window} - The class window any static components are bound to.
 * - `.instance_window`: {@link ve.Window} - The instance window non-static components is bound to.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Class.close|close}</span>(arg0_mode:"class"/"instance")
 * - <span color=00ffff>{@link ve.Class.draw|draw}</span>(arg0_function:{@link function}(this:{@link ve.Class}), arg1_interval=0:{@link number}) - The draw function intended to make non-UI related draw calls to browser/process.
 * - <span color=00ffff>{@link ve.Class.getState|getState}</span>() | {@link Object}
 * - <span color=00ffff>{@link ve.Class.isClosed|isClosed}</span>(arg0_mode:"class"/"instance") | {@link boolean} - Whether the selected window is closed.
 * - <span color=00ffff>{@link ve.Class.isOpen|isOpen}</span>(arg0_mode:"class"/"instance") | {@link boolean} - Whether the selected window is open.
 * - <span color=00ffff>{@link ve.Class.open|open}</span>(arg0_mode:"class"/"instance") - Opens the UI bound to the current ve.Class.
 * - <span color=00ffff>{@link ve.Class.updateOwner|updateOwner}()</span> - Updates the `.owner`/`.owners` field attached to {@link ve.Component}s.
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<this:{@link ve.Class}>
 * 
 * @class
 * @memberof ve
 * @namespace ve.Class
 * @type {ve.Class}
 */
ve.Class = class {
	//Declare local static variables
	
	/**
	 * @type ve.Class[]
	 */
	static instances = [];
	
	//Constructor/getter/setter
	constructor () {
		//Declare local instance variables
		this.id = Class.generateRandomID(ve.Class); //Non-Vercengen objects can be used freely
		
		this.class_window = undefined;
		this.instance_window = undefined;
		
		//Call updateOwner() upon initialisation
		this.updateOwner();
	}
	
	//Class methods
	
	/**
	 * Closes any open UI currently associated with ve.Class, either its class (static) or instance.
	 * - Method of: {@link ve.Class}
	 * 
	 * @param {string} arg0_mode - Either 'class'/'instance'.
	 */
	close (arg0_mode) {
		//Convert from parameters
		let mode = arg0_mode;
		
		//Close class_window/instance_window
		if (this[`${mode}_window`]) {
			this[`${mode}_window`].close({ do_not_close: true });
			this[`${mode}_window`].element.remove();
		}
		clearInterval(this.draw_loop);
		delete this.draw_loop;
		delete this[`${mode}_window`];
	}
	
	/**
	 * Draws the current element on the screen based on a constant loop that can be cleared by the process.
	 * - Method of: {@link ve.Class}
	 * 
	 * @param {function|undefined} arg0_function
	 * @param {number} [arg1_interval=0]
	 */
	draw (arg0_function, arg1_interval) {
		//Convert from parameters
		let local_function = arg0_function;
		let interval = (arg1_interval) ? parseInt(arg1_interval) : 0;
		
		//Set draw loop
		if (local_function)
			this.draw_loop = setInterval(() => { local_function(this); }, interval);
	}
	
	/**
	 * Whether the bound UI for the current mode is closed.
	 * - Method of: {@link ve.Class}
	 * 
	 * @param {string} arg0_mode - Either 'class'/'instance'.
	 * 
	 * @returns {boolean}
	 */
	isClosed (arg0_mode) { //[WIP] - Finish function body
		//Return statement
		return (!(this.class_window || this.instance_window));
	}
	
	/**
	 * Whether the bound UI for the current mode is open.
	 * - Method of: {@link ve.Class}
	 *
	 * @param {string} arg0_mode - Either 'class'/'instance'.
	 *
	 * @returns {boolean}
	 */
	isOpen (arg0_mode) { //[WIP] - Finish function body
		//Return statement
		return (this.class_window || this.instance_window);
	}
	
	/**
	 * Opens the relevant {@link ve.Window} or other Feature responsible for containing either class or instance variables.
	 * - Method of: {@link ve.Class}
	 *
	 * @param {string} [arg0_mode="instance"] - Whether the UI is bound to 'class'/'instance'. If 'class', it displays all static Vercengen fields.
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.do_not_close_if_open=false] - Whether to close the Window already bound to class_window or instance_window
	 *  @param {string} [arg1_options.name]
	 *  @param {string} [arg1_options.type="window"] - Either 'static'/'window'. 'static' by default if `.anchor`/`.x`/`.y` are specified.
	 *
	 *  @param {string} [arg1_options.anchor="top_left"] - Either 'bottom_left'/'bottom_right'/'top_left'/'top_right'. If neither this nor .x/.y are defined, the UI is spawned at the cursor position.
	 *  @param {number|string} [arg1_options.height]
	 *  @param {number|string} [arg1_options.width]
	 *  @param {number|string} [arg1_options.x=HTML.mouse_x] - Mouse coordinates if undefined.
	 *  @param {number|string} [arg1_options.y=HTML.mouse_y] - Mouse coordinates if undefined.
	 */
	open (arg0_mode, arg1_options) {
		//Convert from parameters
		let mode = (arg0_mode) ? arg0_mode : "instance";
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (options.type === undefined &&
			(options.anchor !== undefined || options.x !== undefined || options.y !== undefined)
		) options.type = "static";
		
		//Declare local instance variables
		let state_obj = this.updateOwner();
		
		let class_components_obj = state_obj.class_components_obj;
		let instance_components_obj = state_obj.instance_components_obj;
		
		//Close window if open first
		if (this.isOpen(mode) && !options.do_not_close_if_open) this.close(mode);
		
		//Open ve.Window if either 'static'/'window'
		let components_obj = (mode === "class") ? class_components_obj : instance_components_obj;
		
		if (options.type === "static") {
			this[`${mode}_window`] = new ve.Window(components_obj, {
				class_instance: this,
				class_instance_type: mode,
				is_static: true,
				...options 
			});
		} else {
			this[`${mode}_window`] = new ve.Window(components_obj, {
				class_instance: this,
				class_instance_type: mode,
				draggable: true,
				is_static: false,
				resizeable: true,
				...options
			});
		}
	}
	
	//State methods
	
	/**
	 * Returns the values of all bound {@link ve.Component}s as a destructured object.
	 * 
	 * @returns {{"<variable_key>": ve.Component}}
	 */
	getState () {
		//Declare local instance variables
		let child_class = this.constructor;
		let parent_class = Object.getPrototypeOf(child_class);
		let state_obj = {};
		
		//Fetch instance fields in child class
		let instance_fields = {};
			Object.iterate(this, (local_key, local_value) => {
				instance_fields[local_key] = local_value
			});
		
		//Fetch static fields unique to child class, mutate their keys to have 'static-' prepended to them.
		let static_fields = Object.getOwnPropertyNames(child_class).filter((key) => (
			!["length", "prototype", "name"].includes(key) && //Filter out any default keys
			!Object.getOwnPropertyNames(parent_class).includes(key) //Filter out any parent keys
		)).reduce((local_obj, key) => {
			local_obj[`static-${key}`] = child_class[key];
			
			//Return statement
			return local_obj;
		}, {});
		
		//Filter both static_fields and instance_fields for .vercengen_component and append them to state_obj
		let temp_state_obj = { ...static_fields, ...instance_fields };
		
		Object.iterate(temp_state_obj, (local_key, local_value) => {
			try {
				if (local_value.is_vercengen_component && !local_value.options?.ignore_component)
					state_obj[local_key] = local_value;
			} catch (e) {}
		});
		
		//Return statement
		return state_obj;
	}
	
	/**
	 * Updates the `.owner`/`.owners` field(s) for any attached {@link ve.Component}s to the current ve.Class.
	 * - Method of: {@link ve.Class}
	 * 
	 * @returns {{class_components_obj: {"variable_key": ve.Component}, instance_components_obj: {"variable_key": ve.Component}}}
	 */
	updateOwner () {
		//Declare local instance variables
		let state_obj = this.getState();
		
		let class_components_obj = {};
		let instance_components_obj = {};
		
		//Iterate over all components in state_obj to update their owners
		Object.iterate(state_obj, (local_key, local_value) => {
			if (!local_value?.options?.do_not_display === true)
				if (local_key.startsWith("static-")) {
					class_components_obj[local_key] = local_value;
					class_components_obj[local_key].setOwner(this, [this]);
				} else {
					instance_components_obj[local_key] = local_value;
					instance_components_obj[local_key].setOwner(this, [this]);
				}
		});
		
		//Return statement
		return {
			class_components_obj: class_components_obj,
			instance_components_obj: instance_components_obj
		};
	}
};