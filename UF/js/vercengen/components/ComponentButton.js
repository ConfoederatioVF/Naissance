/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Generic button used to call a function upon user click. If multiple buttons are to be inline, they may be appended using {@link ve.RawInterface} as a container.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link function}({@link MouseEvent}) - The function to call upon user click.
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 * 
 * ##### Instance:
 * - `.v`: {@link function} - Accessor. The current function stored by the {@link ve.Button} component.
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Button}
 */
ve.Button = class extends ve.Component {
	static demo_value = () => { window.alert("This is an alert from ve.Button."); };
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		if (options.name === undefined) options.name = loc("ve.registry.localisation.Button_confirm");
		if (options.name.startsWith("<icon>") && !options.name.endsWith(">")) 
			//Add default padding for text after <icon>
			options.name += "&nbsp;&nbsp;";
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-button");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		this.value = value;
		
		//Format HTML string
		this.button_el = document.createElement("button");
			if (this.options.disabled)
				this.button_el.setAttribute("disabled", "true");
			if (this.options.icon) {
				this.icon_el = document.createElement("img");
				this.icon_el.setAttribute("src", options.icon);
				this.button_el.appendChild(this.icon_el);
			}
			this.name_el = document.createElement("span");
				this.name_el.id = "name";
				this.button_el.appendChild(this.name_el);
			this.element.appendChild(this.button_el);
		
		//Add click event listener
		this.button_el.addEventListener("click", (e) => {
			if (this.value) this.value(e, this);
			this.fireToBinding();
		});
		this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the function bound to the present button.
	 * - Accessor of: {@link ve.Button}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Button
	 * @type {function}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the function for the present button.
	 * - Accessor of: {@link ve.Button}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Button
	 * 
	 * @param {function} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set value and update UI
		this.value = value;
		this.fireFromBinding();
	}
};

//Functional binding

/**
 * @returns {ve.Button}
 */
veButton = function () {
	//Return statement
	return new ve.Button(...arguments);
};