/**
 * <span color = "yellow">{@link ve.Component}</span>: Components represent inputs and displays that yield a value via `.v`. They are typically encapsulated by a <span color="yellow">{@link ve.Feature}</span>, but can be manually mounted via <span color=00ffff>{@link ve.Component.bind|bind}</span>(arg0_container_el:{@link HTMLElement}).
 * 
 * ##### Constructor:
 * - `arg0_options`: {@link Object}
 *   - All bindings accept 'this'/'global'/'window' variables. Bindings propagate recursively upwards (i.e. a userchange at a lower level will register as a userchange in an upper level).
 *   - `.binding`: {@link string} - Related event: `.onchange`. Bidirectional data binding for both `.from_binding`/`.to_binding`.
 *   - `.from_binding`: {@link string} - Related event: `.onprogramchange`. Unidirectional data binding.
 *   - `.to_binding`: {@link string} - Related event: `.onuserchange`. Unidirectional data binding.
 *   - 
 *   - `.do_not_display=false`: {@link boolean} - If set to true, Component is not automatically displayed by {@link ve.Class}.
 *   - `.gc=false`: {@link boolean} - Whether to auto-remove the component upon being detached.
 *   - `.onchange`: {@link function}(this.v, this:{@link ve.Component})
 *   - `.onprogramchange`: {@link function}(this.v, this:{@link ve.Component})
 *   - `.onuserchange`: {@link function}(this.v, this:{@link ve.Component})
 *   -
 *   - `.attributes`: {@link Object} - Any attributes to place on the mounted `this.element`.
 *     - `<attribute_key>`: {@link string}
 *   - `.limit=true`: {@link function}(this.v)|{@link undefined} | {@link boolean} - Whether to display the current Component. Immediate mode.
 *   - `.onload`: {@link function}(this:{@link ve.Component})
 *   - `.tooltip`: {@link Object}<{@link ve.Component}>|{@link string}
 *   - `.style`: {@link Object} - The CSS/Telestyle object to use for the current element. Immediate mode CSS if function is declared.
 *     - `<selector_key>`: {@link string} - CSS query selector. :nth-parent() is acceptable.
 *       - `<css_property>`: {@link function}|{@link string}
 *     - `<css_property>`: {@link function}|{@link string}
 *     
 *   - `.log_gc=false`: {@link boolean} - Whether to log Vercengen garbage collection for the given component.
 *
 * ##### DOM:
 * - Attributes:
 *   - `data-debug-add-component`: {@link boolean}
 *   - `data-debug-limit`: {@link boolean}
 * - Fields:
 *   - `.instance`: this:{@link ve.Component}
 *
 * ##### Instance:
 * - `.child_class=this.constructor`: {@link ve.Component} - The constructor object of the child class.
 * - `.is_vercengen_component=true`: {@link boolean} - Whether to mark this ve.Component as a Vercengen component.
 * - `.parent_el`: {@link HTMLElement} - The parent element of the current component, should it exist.
 * -
 * - `.height=1`: {@link number}
 * - `.width=1`: {@link number}
 * - `.x=0`: {@link number} - Switches to an n+1 default if only `.y` is defined.
 * - `.y=n + 1`: {@link number} - Switches to 0 if only `.x` is defined.
 * -
 * - The linter/engine guarantees the following fields:
 * - `.element`: {@link HTMLElement} - The HTMLElement that the ve.Component is mounted to.
 * - `.name`: {@link string} - The name to display for the current ve.Component.
 * - `.owner`: {@link any} - The root owner of the current ve.Component. This is typically a {@link ve.Class}, but can also be a {@link ve.Feature} or {@link global}/{@link window}.
 * - `.owners`: {@link Array}<{@link any}> - A list of relevant owners in descending orders.
 * - `.v`: {@link any} - The value stored by the component. Getter/setter.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Component.addComponent|addComponent}</span>() - Attempts to mount the current component on its parent_el.
 * - <span color=00ffff>{@link ve.Component.bind|bind}</span>(arg0_container_el:{@link HTMLElement}) - Manually mounts the current component to arg0_container_el.
 * - <span color=00ffff>{@link ve.Component.fireFromBinding|fireFromBinding}</span>() - Pseudo-setter from binding. Fires only upon program-driven changes to `.v` directly.
 * - <span color=00ffff>{@link ve.Component.fireToBinding|fireToBinding}</span>() - Pseudo-setter to binding. Fires only upon user-driven changes to `.v`.
 * - <span color=00ffff>{@link ve.Component.gc|gc}</span>() - Adds the component to garbage collection.
 * - <span color=00ffff>{@link ve.Component.remove|remove}</span>() - Removes the component/element from the DOM.
 * - <span color=00ffff>{@link ve.Component.removeComponent|removeComponent}</span>() - Unmounts the current component from its parent_el.
 * - <span color=00ffff>{@link ve.Component.setValueFromObject|setValueFromObject}</span>(arg0_object:{@link Object}, arg1_object:{@link Object}) - 
 * - <span color=00ffff>{@link ve.Component.setOwner|setOwner}</span>(arg0_value:{@link Object}, arg1_owner_array=[]:{@link Array}<{@link Object}>) - Used by the reflection engine in {@link ve.Class} to set the owner hierarchy automatically.
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.Component.getElement|getElement}</span>(arg0_component_obj:{@link ve.Component}|{@link HTMLElement}) | {@link HTMLElement}
 * - <span color=00ffff>{@link ve.Component.linter|linter}</span>() - Run at startup if {@link ve.registry.debug_mode} is true. Lints all Vercengen components.
 * 
 * ##### Types:
 * Types are annotated by both their constructor function and what they return after the pipe separator (`.v`). 
 * 
 * \* indicates a recursive Object of that type.
 * - {@link ve.Component.ve.DatavisSuite|veDatavisSuite}(arg0_value:{@link Object}, arg1_options:{@link Object}) | {@link Object}
 * - {@link ve.Component.ve.FileExplorer|veFileExplorer}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string} - The file path the File Explorer is currently navigating.
 * - {@link ve.Component.ve.Hierarchy|veHierarchy}(arg0_value:{@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) | {@link Object}<{@link ve.Component}> - Note. It is recommended to use {@link ve.HierarchyDatatype} as the specific {@link ve.Component} for `arg0_value`. Tree/scene inspector.
 *   - {@link ve.Component.ve.HierarchyDatatype|veHierarchyDatatype}({@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) | {@link Object}<{@link ve.Component}> - Represents individual items in a hierarchy.
 * - {@link ve.Component.ve.NodeEditor|veNodeEditor}(arg0_value:{@link Object}, arg1_options:{@link Object}) | {@link Object} - Visual node-based DAG editor with async processing.
 *   - {@link ve.Component.ve.NodeEditorDatatype|veNodeEditorDatatype}(arg0_value:{@link Object}, arg1_options:{@link Object}) | {@link Object}
 * - {@link ve.Component.ve.ScriptManager|veScriptManager}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string}
 *   - {@link ve.Component.ve.ScriptManagerBlockly|veScriptManagerBlockly}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string}
 *   - {@link ve.Component.ve.ScriptManagerMonaco|ScriptManagerMonaco}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string}
 * - {@link ve.Component.ve.Spreadsheet|veSpreadsheet}(arg0_value:{@link Array}<{@link Array}<{@link Array}<{@link any}>>>|{@link Object}, arg1_options:{@link Object}) | {@link Array}<{@link Array}<{@link Array}<{@link any}>>>|{@link Object} - Spreadsheet editor with formulas. Can be converted to {@link ve.Table} on demand.
 * - {@link ve.Component.ve.WordProcessor|WordProcessor}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string} - Word processor.
 * 
 * - {@link ve.Component.ve.Button|veButton}(arg0_value:{@link function}, arg1_options:{@link Object}) | {@link function}
 * - {@link ve.Component.ve.Checkbox|veCheckbox}(arg0_value:{@link boolean}|{@link Object}<{@link boolean}>\*, arg1_options: {@link Object}) | {@link boolean}|{@link Object}<{@link boolean}>\* - A recursive list of checkboxes, or a single toggleable input.
 * - {@link ve.Component.ve.Colour|veColour}(arg0_value:{@link Array}<{@link number}, {@link number}, {@link number}|{@link string}, arg1_options: {@link Object}>) | {@link Array}<{@link number}, {@link number}, {@link number}> - RGB colour selector.
 * - {@link ve.Component.ve.CRUD|veCRUD}(arg0_value:{@link Array}<{@link Array}<{@link any}>>, arg1_options:{@link Object}) | {@link Array}<{@link Array}<{@link any}>> - CRUD interface for ediitng instances in a table.
 * - {@link ve.Component.ve.Datalist|veDatalist}(arg0_value:{@link Object}<{@link string}>, arg1_options: {@link Object})
 * - {@link ve.Component.ve.Date|veDate}(arg0_value:{@link UF.Date}, arg1_options: {@link Object}) | {@link UF.Date}
 * - {@link ve.Component.ve.DateLength|veDateLength}(arg0_value:{@link UF.Date}, arg1_options: {@link Object}) | {@link UF.Date}
 * - {@link ve.Component.ve.File|veFile}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string} - The file/folder path selected by the user.
 * - {@link ve.Component.ve.FlexInterface|veFlexInterface}(arg0_value:{@link Object}<{@link Object}|{@link ve.Component}>, arg1_options:{@link Object}) | {@link Object}<{@link Object}|{@link ve.Component}>
 * - {@link ve.Component.ve.Graph|veGraph}(arg0_value:{@link Object}, arg1_options:{@link Object}) | {@link Object}
 * - {@link ve.Component.ve.HTML|veHTML}(arg0_value:{@link function}|{@link HTMLElement}|{@link string}, arg1_options: {@link Object}) | {@link string}
 * - {@link ve.Component.ve.Interface|veInterface}(arg0_value:{@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) | {@link Object}<{@link ve.Component}>
 * - {@link ve.Component.ve.Log|veLog}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string}
 * - {@link ve.Component.ve.List|veList}(arg0_value:{@link Array}<{@link ve.Component}>, arg1_options:{@link Object}) | {@link Array}<{@link ve.Component}>
 * - {@link ve.Component.ve.Map|veMap}(arg0_value:{@link maptalks.Map}, arg1_options:{@link Object}) | {@link maptalks.Map}
 * - {@link ve.Component.ve.MultiTag|veMultiTag}(arg0_value:{@link Array}<{@link string}>, arg1_options:{@link Object}) | {@link Array}<{@link string}>
 * - {@link ve.Component.ve.Number|veNumber}(arg0_value:{@link number}, arg1_options:{@link Object}) | {@link number}
 * - {@link ve.Component.ve.ObjectEditor|veObjectEditor}(arg0_value:{@link Object}, arg1_options:{@link Object}) | {@link Object} - Any valid JSON object.
 * - {@link ve.Component.ve.ObjectInspector|veObjectInspector}(arg0_value:{@link any}, arg1_options:{@link Object}) | {@link any}
 * - {@link ve.Component.ve.PageMenu|vePageMenu}(arg0_value:{@link Object}, arg1_options:{@link Object}) | {@link string} - The `.page` key currently displayed.
 * - {@link ve.Component.ve.Password|vePassword}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string}
 * - {@link ve.Component.ve.Radio|veRadio}(arg0_value:{@link Object}<{@link boolean}>\* | {@link Object}<{@link boolean}>\*
 * - {@link ve.Component.ve.Range|veRange}(arg0_value:{@link number}, arg1_options: {@link Object}) | {@link number}
 * - {@link ve.Component.ve.RawInterface|veRawInterface}(arg0_components_obj:{@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) | {@link Object}<{@link ve.Component}>
 * - {@link ve.Component.ve.RichText|veRichText}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string} - Single-line rich text input. `.v` is an HTML string.
 * - {@link ve.Component.ve.SearchSelect|veSearchSelect}(arg0_components_obj:{@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) | {@link Object}<{@link ve.Component}>
 * - {@link ve.Component.ve.Select|veSelect}(arg0_value:{@link ve.Object}<{@link string}>, arg1_options:{@link Object}) | {@link string} - The key of the selected option.
 * - {@link ve.Component.ve.Table|veTable}(arg0_value:{@link Array}<{@link Array}<{@link any}>>, arg1_options:{@link Object}) | {@link Array}<{@link Array}<{@link any}>> - Paginated lazy-loaded table. Can be converted to {@link ve.Spreadsheet} on demand.
 * - {@link ve.Component.ve.Telephone|veTelephone}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string}
 * - {@link ve.Component.ve.Text|veText}(arg0_value:{@link string}, arg1_options: {@link Object}) | {@link string}
 * - {@link ve.Component.ve.Time|veTime}(arg0_value:{hour:{@link number}, minute:{@link number}}, arg1_options:{@link Object}) | {hour:{@link number}, minute:{@link number}}
 * - {@link ve.Component.ve.Toggle|veToggle}(arg0_value:{@link boolean}, arg1_options:{@link Object}) | {@link boolean}
 * - {@link ve.Component.ve.UndoRedo|veUndoRedo}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string} - The {@link DALS.Timeline} ID that the UndoRedo component is currently navigating.
 * - {@link ve.Component.ve.URL|veURL}(arg0_value:{@link string}, arg1_options:{@link Object}) | {@link string}
 * 
 * @class
 * @memberof ve
 * @namespace ve.Component
 * @type {ve.Component}
 */
ve.Component = class {
	//Declare local static variables
	
	/**
	 * @type {ve.Component[]}
	 */
	static instances = [];
	static registry = new FinalizationRegistry((v) => {
		//This runs when the component is GC'd
		let index = ve.Component.instances.indexOf(v);
		if (index > -1) ve.Component.instances.splice(index, 1);
	});
	
	constructor (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		this.child_class = this.constructor;
		this.class_name = this.constructor.class_name;
		this.do_not_fire_to_binding = false;
		this.is_vercengen_component = true;
		if (this.options === undefined)
			this.options = options; //Preferably overridden by lower components
		
		this.height = options.height;
		this.width = options.width;
		this.x = options.x;
		this.y = options.y;
		
		//Push to instances if ve.registry.debug_profile_components is true
		if (ve.registry.debug_profile_components || this.options.gc) this.gc();
		
		//Binding handlers; setTimeout() is necessary to tick a frame until ve.Component child class's constructor populates
		setTimeout(() => {
			if (!this.options) return; //Internal guard clause if this.options doesn't exist
			if (this.options.style) HTML.applyTelestyle(this.element, this.options.style);
			if (this.options.theme) HTML.applyTelestyle(this.element, ve.registry.themes[this.options.theme]);
			
			//Flow control handlers
			//.binding handler (bidirectional)
			if (this.options.binding) {
				this.from_binding = this.options.binding; //onprogramchange
				this.to_binding = this.options.binding; //onuserchange
			}
			//.from_binding handler (unidirectional, onprogramchange, variable -> this)
			if (this.options.from_binding)
				this.from_binding  = this.options.from_binding;
			//.to_binding handler (unidirectional, onuserchange, this -> variable)
			if (this.options.to_binding)
				this.to_binding = this.options.to_binding;
			
			//Event handlers
			//.onload handler
			if (this.options.onload)
				setTimeout(() => {
					this.options.onload(this.v, this);
				}, 100);
			
			//KEEP AT BOTTOM! - Feature/UI handlers
			//.limit handler
			if (this.options.limit) 
				this.limit = this.options.limit;
			if (this.options.name && this.name === "")
				this.name = this.options.name;
			
			//.tooltip handler
			if (this.options.tooltip) {
				let createTooltip = () => this.tooltip = new ve.Tooltip(this.options.tooltip, { 
					element: this.element });
				
				this.element.addEventListener("mouseover", (e) => {
					if (Object.keys(this.tooltip).length === 0) createTooltip();
				});
				createTooltip();
			}
		});
	}
	
	//ve.Component getters/setters
	
	/**
	 * Internal `.from_binding` setter for handling .options.from_binding. Accepts a string literal that is then parsed to a variable reference.
	 *
	 * `.to_binding` counterparts are manually handled child-side.
	 * - Accessor of: {@link ve.Component}
	 *
	 * @param {string} arg0_variable_string
	 */
	set from_binding (arg0_variable_string) {
		//Convert from parameters
		let variable_string = arg0_variable_string;
		
		//Declare local instance variables
		let initial_object = global;
		this.from_binding_string = variable_string;
		
		try {
			//Parse this to this.owner; watch variable mutation using getter/setter, and set this.v to new value
			if (variable_string.startsWith("this.")) {
				variable_string = variable_string.replace("this.", "");
				initial_object = this.owner;
			} else if (variable_string.startsWith("window.")) {
				variable_string = variable_string.replace("window.", "");
				initial_object = window;
			} else {
				variable_string = variable_string.replace("global.", "");
			}
			
			//Set init value if applicable
			let from_value = Object.getValue(initial_object, variable_string);
			if (this.options.binding && from_value === undefined)
				Object.setValue(initial_object, variable_string, this.v);
			from_value = Object.getValue(initial_object, variable_string);
			
			//Add getter/setter
			Object.addGetterSetter(initial_object, variable_string, {
				set_function: (arg0_value) => {
					//Convert from parameters
					let local_value = arg0_value;
					if (this.from_binding_fire_silently) return;
					
					let is_same_value = Boolean.strictEquality(local_value, this.v);
					if (is_same_value) return;
					
					//Declare local instance variables
					this.from_binding_fire_silently = true;
					this.v = local_value;
					delete this.from_binding_fire_silently;
					
					//Traverse up the .owners tree and fire onchange/onprogramchange
					if (this.owners)
						for (let i = this.owners.length - 1; i >= 0; i--)
							if (this.owners[i].options) {
								let local_options = this.owners[i].options;
								
								if (typeof local_options.onchange === "function") //Fire onchange (bidirectional)
									local_options.onchange(this.owners[i].v, this.owners[i]);
								if (typeof local_options.onprogramchange === "function") //Fire onprogramchange (unidirectional)
									local_options.onprogramchange(this.owners[i].v, this.owners[i]);
							}
					
					if (typeof this.options.onchange === "function") //Fire onchange (bidirectional)
						this.options.onchange(local_value, this);
					if (typeof this.options.onprogramchange === "function") //Fire onprogramchange (unidirectional)
						this.options.onprogramchange(local_value, this);
					//this.v = local_value;
				}
			});
			let temp = from_value;
			this.from_binding_fire_silently = true;
			Object.setValue(initial_object, variable_string, temp);
			delete this.from_binding_fire_silently;
		} catch (e) {
			let error_array = [];
			error_array.push(`ve.Component: ${this.child_class.prototype.constructor.name}: this.from_binding failed.`);
			if (initial_object === undefined)
				error_array.push(`- this.updateOwner() has not been called synchronously (check constructors and/or ve.Component updates).`);
			if (this.options.binding && error_array.length <= 1) return; //Internal guard clause if this is a valid bidirectional binding
			
			console.error(`${error_array.join("\n")}\n- initial_object:`, initial_object, `variable_string:`, variable_string);
		}
	}
	
	/**
	 * Tests the current {@link this.limit} by calling {@link this.limit_function}({@link this.v}, {@link this}). Otherwise resolves to true if no `.options.limit` is set.
	 * - Accessor of: {@link ve.Component}
	 * 
	 * @returns {boolean}
	 */
	get limit () {
		//Return statement
		try {
			return (typeof this.limit_function === "function") ?
				this.limit_function(this.v, this) : true;
		} catch (e) { return false; }
	}
	
	/**
	 * Sets the present {@link this.limit} or clears it (if undefined). Calls {@link this.limit_function}({@link this.v}, {@link this}) when polled.
	 * - Accessor of: {@link ve.Component}
	 * 
	 * @param {function|undefined} arg0_function
	 */
	set limit (arg0_function) {
		//Convert from parameters
		this.limit_function = arg0_function;
		
		if (this.limit_function !== undefined) {
			let evaluateLimit = () => {
				if (this.element)
					if (!this.limit) {
						this.element.classList.add("ve-display-none");
						if (this.element.getAttribute("data-debug-limit"))
							console.log(`- .limit: Removing component:`, this);
					} else {
						this.element.classList.remove("ve-display-none");
						if (this.element.getAttribute("data-debug-limit"))
							console.log(`- .limit: Adding component:`, this);
					}
			};
			
			evaluateLimit(); //Evaluate once immediately to prevent flickering (i.e. waiting 100ms)
			this.limit_logic_loop = setInterval(() => evaluateLimit(), 100);
		} else {
			delete this.limit_function;
			clearInterval(this.limit_logic_loop);
			delete this.limit_logic_loop;
		}
	}
	
	/**
	 * Returns the visual name of the present {@link ve.Component},
	 * - Accessor of: {@link ve.Component}
	 * 
	 * @returns {string}
	 */
	get name () {
		//Internal guard clause for this.components_obj.name.v
		if (this.components_obj && this.components_obj.name)
			return this.components_obj.name.v;
		
		//Declare local instance variables
		let name_el = this.element.querySelector(`#name`);
		
		//Return statement
		if (name_el)
			return name_el.innerHTML;
	}
	
	/**
	 * Sets the visual name of the present {@link ve.Component}
	 * - Accessor of: {@link ve.Component}
	 * 
	 * @param {string} arg0_value
	 */
	set name (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "";
		
		//Guard catch for this.components_obj.name.v
		if (this.components_obj && this.components_obj.name) {
			this.components_obj.name.v = (value) ? value : "";
			return;
		}
		
		//Declare local instance variables
		let name_el = this.element.querySelector(`#name`);
		
		//Return statement
		if (name_el)
			name_el.innerHTML = (value) ? value.trim() : "";
	}
	
	//ve.Component dataflow functions - [WIP] - Reduce redundancy with parsing variable_string
	
	/**
	 * Pseudo-setter from binding. Fires only upon program-driven changes to .v directly, which means that this has to be monitored manually component-side in set v(). This should always come last in set v().
	 * - Method of: {@link ve.Component}
	 */
	fireFromBinding () {
		//Convert from parameters
		let variable_string = (this.from_binding_string) ? JSON.parse(JSON.stringify(this.from_binding_string)) : undefined;
			if (this.from_binding_fire_silently) return; //Internal guard clause if this.from_binding is to fire silently
			if (variable_string === undefined) return; //Internal guard clause if variable_string is undefined
		
		//Declare local instance variables
		let initial_object = global;
		
		//Parse this to this.owner; watch mutation using getter/setter, and set this.v to new value
		if (variable_string.startsWith("this.")) {
			variable_string = variable_string.replace("this.", "");
			initial_object = this.owner;
		} else if (variable_string.startsWith("window.")) {
			variable_string = variable_string.replace("window.", "");
			initial_object = window;
		} else {
			variable_string = variable_string.replace("global.", "");
		}
		
		//Set this.from_binding in a to binding manner
		if (this.from_binding_string) {
			this.from_binding_fire_silently = true;
			Object.setValue(initial_object, variable_string, this.v);
			delete this.from_binding_fire_silently;
			
			if (typeof this.options.onchange === "function") //Fire onchange (bidirectional)
				this.options.onchange(this.v, this);
			if (typeof this.options.onprogramchange === "function") //Fire onprogramchange (unidirectional)
				this.options.onprogramchange(this.v, this);
		}
	}
	
	/**
	 * Pseudo-setter to binding. Fires only upon user-driven changes, which means that this has to be monitored manually component-side.
	 * - Method of: {@link ve.Component}
	 */
	fireToBinding () {
		//Declare local instance variables
		let initial_object = global;
		let variable_string = this.to_binding;
		
		//Internal guard clause if this.do_not_fire_to_binding is active
		if (this.do_not_fire_to_binding || this.to_binding_fire_silently) return;
		this.from_binding_fire_silently = true;
		
		//Internal guard clause if this.to_binding is not defined
		if (this.to_binding) {
			if (typeof this.to_binding !== "string") {
				console.error(`ve.Component: ${this.child_class.prototype.constructor.name}: this.to_binding is an invalid string:`, this.to_binding);
				return;
			}
			
			//Parse this to this.owner; watch variable mutation using getter/setter, and set this.v to new value
			if (variable_string.startsWith("this.")) {
				variable_string = variable_string.replace("this.", "");
				initial_object = this.owner;
			} else if (variable_string.startsWith("window.")) {
				variable_string = variable_string.replace("window.", "");
				initial_object = window;
			} else {
				variable_string = variable_string.replace("global.", "");
			}
		}
		
		//Set value of to object by fetching this.v
		let local_value = this.v; //Because this is a getter, run it once
		
		//Traverse up the .owners tree and fire onchange/onuserchange
		if (this.owners) 
			for (let i = this.owners.length - 1; i >= 0; i--)
				if (this.owners[i]?.options) {
					let local_options = this.owners[i].options;
					
					if (typeof local_options.onchange === "function")
						local_options.onchange(this.owners[i].v, this.owners[i]);
					if (typeof local_options.onuserchange === "function") //Fire onuserchange (unidirectional)
						local_options.onuserchange(this.owners[i].v, this.owners[i]);
				}
		
		if (typeof this.options.onchange === "function") //Fire onchange (bidirectional)
			this.options.onchange(local_value, this);
		if (typeof this.options.onuserchange === "function") //Fire onuserchange (unidirectional)
			this.options.onuserchange(local_value, this);
		
		if (this.to_binding)
			Object.setValue(initial_object, variable_string, local_value);
		this.from_binding_fire_silently = false;
	}
	
	/**
	 * Adds the current component to the garbage collector.
	 * - Method of: {@link ve.Component}
	 */
	gc () {
		//Declare local instance variables
		let ref = new WeakRef(this);
		this._id = Class.generateRandomID(ve.Component); //Private variable since sub-components have their own .id and .instances
		this._timestamp = new Date().getTime();
		
		//Push the component to be GC-tracked
		ve.Component.instances.push(ref);
		ve.Component.registry.register(this, ref);
	}
	
	/**
	 * Sets the root parent and ownership tree. Influences {@link this.parent_el}, {@link this.owner}, {@link this.owners}.
	 * - Method of: {@link ve.Component}
	 * 
	 * @param arg0_value
	 * @param arg1_owner_array
	 */
	setOwner (arg0_value, arg1_owner_array) {
		//Convert from parameters
		let value = arg0_value;
		let owner_array = (arg1_owner_array) ? arg1_owner_array : [this];
		
		//Declare local instance variables
		this.owner = value;	
		this.owners = [].concat(owner_array); //Mutate to avoid shallow copies
		
		//Iterate over all this.child_class_argument_names and recursively drill down owners
		if (this.components_obj) {
			owner_array.push(this);
			
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (local_value.setOwner)
					local_value.setOwner(value, owner_array);
			});
		}
	}
	
	//ve.Component UI functions
	
	/**
	 * Adds the current component to {@link this.parent_el} should it exist.
	 * - Method of: {@link ve.Component}
	 */
	addComponent () {
		if (this.parent_el) try {
			if (!this.parent_el.contains(this.element)) {
				this.parent_el.appendChild(this.element);
				
				if (this.element.getAttribute("data-debug-add-component"))
					console.log(`- addComponent() called for:`, this, `bound to`, this.parent_el);
			}
		} catch (e) { console.error(e); }
	}
	
	/**
	 * Manually binds/mounts the present <span color="yellow">{@link ve.Component}</span> into the visual DOM.
	 * - Method of: {@link ve.Component}
	 * 
	 * @param {HTMLElement} arg0_container_el
	 */
	bind (arg0_container_el) {
		//Convert from parameters
		let container_el = arg0_container_el;
		
		//Set variable_key, append to container_el
		container_el.append(this.element);
	}
	
	/**
	 * Removes the component/element from the DOM.
	 * - Method of: {@link ve.Component}
	 */
	remove () {
		//Declare local instance variables
		let all_keys = Object.keys(this);
		if (all_keys.length === 0) return; //Internal guard clause if already cleared
		let child_class_obj;
		try { child_class_obj = ve[this.child_class.prototype.constructor.name]; } catch (e) {}
		
		//Clear element first if available
		if (typeof this.clear === "function")
			this.clear();
		if (this.logic_loop !== undefined)
			clearInterval(this.logic_loop);
		
		//Iterate over all instances in child_class_obj.instances if available
		if (child_class_obj?.instances && this.id)
			for (let i = 0; i < child_class_obj.instances.length; i++)
				if (child_class_obj.instances[i].id === this.id) {
					child_class_obj.instances.splice(i, 1);
					break;
				}
		
		//Remove everything else
		if (this.options.onremove) this.options.onremove(this); //Fire .options.onremove if it exists
		
		//Iterate over this and delete it
		if (this.components_obj)
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (local_value && local_value.remove) local_value.remove();
			});
		for (let i = 0; i < all_keys.length; i++) {
			let local_value = this[all_keys[i]];
			
			if (local_value === undefined) continue;
			if (local_value instanceof HTMLElement || local_value instanceof ve.Component)
				local_value.remove();
			this[all_keys[i]] = undefined; //This is more performant than delete since Object shapes are preserved
		}
		Object.setPrototypeOf(this, null); //Set this to null - [WARN] - This might not optimise heap; remains to be seen in production
		
		//Clear freed this.instances
		ve.Component.instances = ve.Component.instances.filter((ref) => (
			ref instanceof WeakRef && ref.deref() !== undefined));
	}
	
	/**
	 * Removes the current component from {@link this.parent_el} should it exist.
	 * - Method of: {@link ve.Component}
	 */
	removeComponent () {
		if (this.element.parentElement) try {
			if (this.element.parentElement.contains(this.element)) {
				this.parent_el = this.element.parentElement;
				this.parent_el.removeChild(this.element);
			}
		} catch (e) { console.error(e); }
	}
	
	/**
	 * Destructures Object values and transfers them into the `.v` instance fields of each Vercengen component.
	 * - Method of: {@link ve.Component}
	 * 
	 * @param {Object} arg0_object - The Vercengen object to transfer to.
	 * @param {Object} arg1_object - The other object to transfer from.
	 */
	setValueFromObject (arg0_object, arg1_object) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : {};
		let ot_object = (arg1_object) ? arg1_object : {};
		
		//Iterate over ot_object
		Object.iterate(ot_object, (local_key, local_value) => {
			try {
				if (object[local_key]?.v !== undefined) {
					object[local_key].v = local_value;
				} else if (
					object[local_key] !== undefined && local_value !== undefined && 
					typeof local_value === "object" && !local_value.is_vercengen_component
				) {
					this.setValueFromObject(object[local_key], local_value);
				}
			} catch (e) {}
		});
	}
	
	/**
	 * Returns the {@link HTMLElement} of a given Vercengen Component/DOM Node.
	 * - Static method of: {@link ve.Component}
	 * 
	 * @param {HTMLElement|ve.Component} arg0_component_obj
	 * 
	 * @returns {HTMLElement}
	 */
	static getElement (arg0_component_obj) {
		//Convert from parameters
		let component_obj = arg0_component_obj;
		
		//Return statement
		if (component_obj.is_vercengen_component) {
			return component_obj.element;
		} else if (component_obj instanceof HTMLElement) {
			return component_obj;
		}
	}
	
	/**
	 * Runs over all Vercengen components that extend <span color="yellow">{@link ve.Component}</span> and lints them in addition to declaring `ve[local_key]`() as a functional binding for each.
	 * - Static method of: {@link ve.Component}
	 * 
	 * Ensures the following properties if `ve.registry.debug_mode=true`:
	 * - get v()/set v()
	 * - Not a duplicate component
	 */
	static linter () {
		Object.iterate(global.ve, (local_key, local_value) => {
			try {
				if (Object.getPrototypeOf(local_value) === ve.Component) {
					let local_name = Object.getOwnPropertyDescriptor(local_value.prototype, "name");
					let local_v = Object.getOwnPropertyDescriptor(local_value.prototype, "v");
					
					let local_prefix = `ve.Component: ve.${local_key}`;
					
					if (!global[`ve${local_key}`]) {
						global[`ve${local_key}`] = function () {
							//Return statement
							return new ve[local_key](...arguments);
						};
					} else if (typeof global[`ve${local_key}`] !== "function") {
						console.error(`ve.${local_key} cannot have its functional binding registered, since it is already reserved elsewhere as a non-function. Use Ctrl + F to find where it has been reserved in your codebase.`);
					}
					
					if (ve.registry.debug_mode) {
						if (local_value.demo_value === undefined)
							console.warn(`${local_prefix} does not have a set static .demo_value.`);
						if (local_value.excluded_from_demo)
							console.warn(`${local_prefix} is currently excluded from automated testing. Perhaps it is a singleton?`);
					}
					
					//Check if get()/set() methods exist
					if (!local_v || typeof local_v.get !== "function")
						console.error(`${local_prefix} does not have a valid get v() function.`);
					if (!local_v || typeof local_v.set !== "function")
						console.error(`${local_prefix} does not have a valid set v() function.`);
					
					//Append to ve.registry.components
					if (!ve.registry.components[local_key] && !ve.registry.features[local_key]) {
						local_value.class_name = local_key;
						ve.registry.components[local_key] = local_value;
					} else {
						let error_value = (ve.registry.components[local_key]) ? 
							ve.registry.components[local_key] : ve.registry.features[local_key];
						
						console.error(`Could not replace with duplicate component. A component/feature with the key: ${local_key} already exists as:`, error_value, "Duplicate registered as", local_value);
					}
				}
			} catch (e) { console.error(e); }
		});
	}
};