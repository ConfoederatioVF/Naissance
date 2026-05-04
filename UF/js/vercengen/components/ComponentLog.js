/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The key of the log channel to display.
 * - `arg1_options`: {@link Object}
 *   - `.view_only=false`: {@link boolean}
 *   
 * ##### Instance:
 * - `.v`: {@link string}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Log.draw|draw}</span>()
 * - <span color=00ffff>{@link ve.Log.getChannel|getChannel}</span>() | {@link log.Channel}
 * - <span color=00ffff>{@link ve.Log.openChannel|openChannel}</span>(arg0_log_key:{@link string})
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Log}
 */
ve.Log = class extends ve.Component { //[WIP] - Finish Component body
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-log");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		
		this.actions_bar_el = new ve.RawInterface({
			console_command: new ve.Text("", {
				attributes: { placeholder: loc("ve.registry.localisation.Log_enter_console_command") },
				name: " ",
				style: {
					display: "inline",
					'input[type="text"]': {
						maxWidth: "30rem"
					}
				}
			}),
			send_command: new ve.Button(() => {
				//Declare local instance variables
				let command_value = this.actions_bar_el.console_command.v;
				let log_obj = this.getChannel();
				
				if (!log_obj) return; //Internal guard clause if there is no valid log_obj
				
				if (command_value.length > 0) try {
					let user_command_el = document.createElement("div");
						user_command_el.setAttribute("class", "uf-log-line user-command");
						user_command_el.innerText = command_value;
						log_obj.log_el.appendChild(user_command_el);
					eval(command_value); //Evaluate user command
				} catch (e) {
					log_obj.error(e);
				}
			}, { name: loc("ve.registry.localisation.Log_send") }),
			clear_console: new ve.Button(() => {
				let local_confirm_modal = new ve.Confirm(loc("ve.registry.localisation.Log_clear_console_confirmation"), {
					special_function: () => { try { this.getChannel().clear(); } catch (e) {} }
				});
			}, { name: "Clear Console" }),
		}, {
			style: { whiteSpace: "nowrap" }
		});
		this.console_el = document.createElement("div");
			this.console_el.id = "console";
		this.draw();
		if (value) {
			this.from_binding_fire_silently = true;
			this.v = value;
			delete this.from_binding_fire_silently;
		}
		if (log.Channel.instances > 0)
			this.openChannel(log.Channel.instances[0].key);
		ve.Log.instances.push(this);
		
		//Logic loop for determining max height of console
		this.logic_loop = setInterval(() => {
			if (this.owners !== undefined)
				if (this.owners[0] instanceof ve.Window) {
					let offset_height = 400;
						try { 
							offset_height = this.owners[0].element.querySelector("#feature-body").offsetHeight; 
							offset_height = `${offset_height}px`;
						} catch (e) {
							offset_height = ve.registry.Log.default_console_height;
						}
					this.console_el.querySelector(".log-element").style.maxHeight = `calc(${offset_height} - ${this.actions_bar_el.element.offsetHeight}px - var(--padding)*2 - 5px)`; //px from resize handler
				}
		});
	}
	
	/**
	 * Returns the value of the component.
	 * - Accessor of: {@link ve.Log}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.Log
	 * @type {string}
	 */
	get v () {
		//Return statement
		return this._open_key;
	}
	
	/**
	 * Sets the present value of the Component.
	 * - Accessor of: {@link ve.Log}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.Log
	 * 
	 * @param {string} arg0_channel
	 */
	set v (arg0_channel) {
		//Convert from parameters
		let channel = arg0_channel;
		
		if (channel === undefined) return; //Internal guard clause if channel is set to undefined
		
		//Open the new channel and set it
		this.openChannel(channel);
		this.fireFromBinding();
	}
	
	/**
	 * Draws and updates the present component.
	 * - Method of: {@link ve.Log}
	 * 
	 * @alias draw
	 * @memberof ve.Component.ve.Log
	 */
	draw () {
		//Declare local instance variables
		let components_obj;
		let search_select_obj = {};
		
		//Internal guard clause if no channel is currently opened
		if (!this._open_key && log.Channel.instances.length > 0) {
			this.openChannel(log.Channel.instances[0].key);
			return;
		}
		
		//Iterate over all log.Channel.instances and append them to search_select_el as buttons
		for (let i = 0; i < log.Channel.instances.length; i++) {
			let local_log_channel = log.Channel.instances[i];
			let local_key = local_log_channel.key;
			
			let local_el = document.createElement("button");
				local_el.id = local_key;
				local_el.setAttribute("log-button", "true");
				if (this._open_key === local_key)
					local_el.classList.add("active");
				local_el.innerText = local_key;
				local_el.onclick = () => this.openChannel(local_key);
			let local_html_obj = new ve.HTML(local_el, { style: { padding: 0 } });
				local_html_obj._name = local_key;
			
			search_select_obj[local_log_channel.key] = local_html_obj;
		}
		
		if (!this.interface) {
			components_obj = {
				search_select: new ve.SearchSelect({
					...search_select_obj
				}, {
					display: "inherit",
					search_keys: ["_name"],
				}),
				console_el: new ve.HTML(this.console_el, {
					style: {
						height: "100%",
						paddingBottom: 0,
						paddingLeft: "var(--padding)",
						paddingTop: 0
					}
				}),
				type: "horizontal"
			};
			
			this.interface = new ve.FlexInterface(components_obj);
			this.interface.bind(this.element);
			
			this.components_obj = { flex_interface: this.interface };
		} else {
			this.interface.search_select.v = search_select_obj;
		}
	}
	
	/**
	 * Returns the currently opened channel.
	 * - Method of: {@link ve.Log}
	 * 
	 * @alias getChannel
	 * @memberof ve.Component.ve.Log
	 * 
	 * @returns {log.Channel}
	 */
	getChannel () {
		if (!this._open_key) return undefined; //Internal guard clause if this._open_key is not defined
		
		//Return statement
		for (let i = 0; i < log.Channel.instances.length; i++)
			if (log.Channel.instances[i].key === this._open_key)
				return log.Channel.instances[i];
	}
	
	/**
	 * Opens a log channel within the current component.
	 * - Method of: {@link ve.Log}
	 * 
	 * @alias openChannel
	 * @memberof ve.Component.ve.Log
	 * 
	 * @param {string} arg0_log_key
	 */
	openChannel (arg0_log_key) {
		//Convert from parameters
		let log_key = (arg0_log_key) ? arg0_log_key : log.Channel.instances?.[0]?.key;
		
		if (!log_key) return; //Internal guard clause if log_key is undefined
		if (!log[log_key]) return; //Internal guard clause if no log object matches this channel
		
		//Declare local instance variables
		let log_obj;
			for (let i = 0; i < log.Channel.instances.length; i++)
				if (log.Channel.instances[i].key === log_key) {
					log_obj = log.Channel.instances[i];
					break;
				}
		this._open_key = log_key;
		
		//Populate this.console_el
		this.console_el.innerHTML = "";
		this.console_el.appendChild(log_obj.log_el);
		
		if (!this.options.view_only)
			this.actions_bar_el.bind(this.console_el);
		
		//Update draw call
		this.draw();
	}
};

//Functional binding

/**
 * @returns {ve.Log}
 */
veLog = function () {
	//Return statement
	return new ve.Log(...arguments);
};