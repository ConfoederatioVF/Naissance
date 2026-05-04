/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Multiline rich text editor used as a word processor.
 * - Functional binding: <span color=00ffff>veWordProcessor</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The HTML contents of the current text editor.
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.v`: {@link string} - The current HTML contents, same as `arg0_value`.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.WordProcessor.handleEvents|handleEvents}</span>() - Initialises event handlers for the present component.
 * - <span color=00ffff>{@link ve.WordProcessor.getWYSIWYGFromFields|getWYSIWYGFromFields}</span>(arg0_wysiwyg_el:{@link HTMLElement}) | {@link string} - Fetches the internal .innerHTML value, resolving conflicts between visual/code views.
 * - <span color=00ffff>{@link ve.WordProcessor.initWYSIWYG|initWYSIWYG}</span>() - Internal helper function. Initialises the component.
 * - 
 * - <span color=00ffff>{@link ve.WordProcessor.addParagraphTag|addParagraphTag}</span>(arg0_e:{@link KeyboardEvent})
 * - <span color=00ffff>{@link ve.WordProcessor.parentTagActive|parentTagActive}</span>(arg0_el:{@link HTMLElement}) | {@link boolean}
 * - <span color=00ffff>{@link ve.WordProcessor.selectionChange|selectionChange}</span>(arg0_e:{@link Event}, arg1_buttons:{@link Array}<{@link HTMLElement}>, arg2_editor:{@link HTMLElement}) | {@link boolean} - Fires an internal selection change event.
 * - <span color=00ffff>{@link ve.WordProcessor.pasteEvent|pasteEvent}</span>(arg0_e:{@link ClipboardEvent})
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.WordProcessor.execCodeAction|execCodeAction}</span>(arg0_button_el:{@link HTMLElement}, arg1_editor_el:{@link HTMLElement}, arg2_visual_view_el:{@link HTMLElement}, arg3_html_view_el:{@link HTMLElement})
 * - <span color=00ffff>{@link ve.WordProcessor.execDefaultAction|execDefaultAction}</span>(arg0_action:{@link string})
 * - <span color=00ffff>{@link ve.WordProcessor.execLinkAction|execLinkAction}</span>(arg0_modal_el:{@link HTMLElement})
 * - <span color=00ffff>{@link ve.WordProcessor.restoreSelection|restoreSelection}</span>(arg0_saved_selection:{@link Selection})
 * - <span color=00ffff>{@link ve.WordProcessor.saveSelection|saveSelection}</span>() | {@link Range}
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.WordProcessor}
 */
ve.WordProcessor = class extends ve.Component {
	static demo_value = `This is an immediate test for WYSIWYG editors being ported.`;
	static demo_options = {
		onchange: (e) => {
			console.log(`ve.WordProcessor:`, e);
		}
	};
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-word-processor");
		this.element.instance = this;
		let html_string = [];

		//Div header
		html_string.push(`<div class = "header" id = "name"></div>`);

		html_string.push(`<div class = "wysiwyg-editor-container">`);
		html_string.push(`<div id = "wysiwyg-editor" class = "wysiwyg-editor">`);
			//Editor toolbar
			{
				html_string.push(`<div class = "toolbar">`);
					//FIRST LINE
					html_string.push(`<div class = "line">`);

					//First box: Bold, Italic, Underline, Strikethrough
					html_string.push(`<div class = "box">`);
						//Bold
						html_string.push(`<span class = "editor-button icon small" data-action = "bold" data-tag-name = "b" title = "${loc("ve.registry.localisation.WYSIWYG_bold")}"><icon>format_bold</icon></span>`);
						//Italic
						html_string.push(`<span class = "editor-button icon small" data-action = "italic" data-tag-name = "i" title = "${loc("ve.registry.localisation.WYSIWYG_italic")}"><icon>format_italic</icon></span>`);
						//Underline
						html_string.push(`<span class = "editor-button icon small" data-action = "underline" data-tag-name = "u" title = "${loc("ve.registry.localisation.WYSIWYG_underline")}"><icon>format_underlined</icon></span>`);
						//Strikethrough
						html_string.push(`<span class = "editor-button icon small" data-action = "strikeThrough" data-tag-name = "strike" title = "${loc("ve.registry.localisation.WYSIWYG_strikethrough")}"><icon>strikethrough_s</icon></span>`);
					html_string.push(`</div>`);

					//Second box: Alignment, Lists, Indents, Hr
					html_string.push(`<div class = "box">`);
						html_string.push(`<span class = "editor-button icon has-submenu">`);
							//Menu icon
							html_string.push(`<icon class = "has-submenu-icon">format_align_left</icon><icon class = "has-submenu-chevron">keyboard_arrow_down</icon>`);

							//1. Submenu
							html_string.push(`<div class = "submenu">`);
								//Align left
								html_string.push(`<span class = "editor-button icon" data-action = "justifyLeft" data-style = "textAlign:left" title = "${loc("ve.registry.localisation.WYSIWYG_align_left")}"><icon>format_align_left</icon></span>`);
								//Align centre
								html_string.push(`<span class = "editor-button icon" data-action = "justifyCenter" data-style = "textAlign:center" title = "${loc("ve.registry.localisation.WYSIWYG_align_centre")}"><icon>format_align_center</icon></span>`);
								//Align right
								html_string.push(`<span class = "editor-button icon" data-action = "justifyRight" data-style = "textAlign:right" title = "${loc("ve.registry.localisation.WYSIWYG_align_right")}"><icon>format_align_right</icon></span>`);
								//Align justify
								html_string.push(`<span class = "editor-button icon" data-action = "formatBlock" data-style = "textAlign:justify" title = "${loc("ve.registry.localisation.WYSIWYG_justify")}"><icon>format_align_justify</icon></span>`);
							html_string.push(`</div>`);
						html_string.push(`</span>`);

						//Insert ordered list
						html_string.push(`<span class = "editor-button icon" data-action = "insertOrderedList" data-tag-name = "ol" title = "${loc("ve.registry.localisation.WYSIWYG_insert_ordered_list")}"><icon>format_list_numbered</icon></span>`);
						//Insert unordered list
						html_string.push(`<span class = "editor-button icon" data-action = "insertUnorderedList" data-tag-name = "ul" title = "${loc("ve.registry.localisation.WYSIWYG_insert_unordered_list")}"><icon>format_list_bulleted</icon></span>`);
						//Indent
						html_string.push(`<span class = "editor-button icon" data-action = "indent" title = "${loc("ve.registry.localisation.WYSIWYG_indent")}"><icon>format_indent_increase</icon></span>`);
						//Outdent
						html_string.push(`<span class = "editor-button icon" data-action = "outdent" title = "${loc("ve.registry.localisation.WYSIWYG_outdent")}" data-required-tag = "li"><icon>format_indent_decrease</icon></span>`);
					html_string.push(`</div>`);

				html_string.push(`</div>`);

				//SECOND LINE
				html_string.push(`<div class = "line">`);

					//Third box: Undo, clear formatting
					html_string.push(`<div class = "box">`);
						//Undo
						html_string.push(`<span class = "editor-button icon small" data-action = "undo" title = "${loc("ve.registry.localisation.WYSIWYG_undo")}"><icon>undo</icon></span>`);
						//Remove formatting
						html_string.push(`<span class = "editor-button icon small" data-action = "removeFormat" title = "${loc("ve.registry.localisation.WYSIWYG_remove_format")}"><icon>format_clear</icon></span>`);
					html_string.push(`</div>`);

					//Fourth box: Add link, remove link
					html_string.push(`<div class = "box">`);
						//Insert Link
						html_string.push(`<span class = "editor-button icon small" data-action = "createLink" title = "${loc("ve.registry.localisation.WYSIWYG_insert_link")}"><icon>add_link</icon></span>`);
						//Unlink
						html_string.push(`<span class = "editor-button icon small" data-action = "unlink" data-tag-name = "a" title = "${loc("ve.registry.localisation.WYSIWYG_unlink")}"><icon>link_off</icon></span>`);
					html_string.push(`</div>`);

					//Fifth box: Show HTML
					html_string.push(`<div class = "box">`);
						//Show HTML code
						html_string.push(`<icon class = "editor-button icon" data-action = "toggle-view" title = "${loc("ve.registry.localisation.WYSIWYG_show_html_code")}"><icon>code</icon></span>`);
					html_string.push(`</div>`);
				html_string.push(`</div>`);
			html_string.push(`</div>`);
		}

			//Content area
			html_string.push(`<div class = "content-area">`);
				html_string.push(`<br><div class = "visual-view" contenteditable spellcheck = "false"></div>`);
				html_string.push(`<textarea class = "html-view"></textarea>`);
			html_string.push(`</div>`);

			//Modal for hyperlinks
			html_string.push(`<div class = "modal">`);
				html_string.push(`<div class = "modal-bg"></div>`);
				html_string.push(`<div class = "modal-wrapper">`);
					html_string.push(`<div class = "close">x</div>`);
					html_string.push(`<div class = "modal-content" id = "modal-create-link">`);
						html_string.push(`<h3>${loc("ve.registry.localisation.WYSIWYG_insert_link")}</h3>`);
						html_string.push(`<input type = "text" id = "link-value" placeholder = "Link (example: https://google.com/)">`);
						html_string.push(`<div class = "row">`);
							html_string.push(`<input type = "checkbox" id = "new-tab"`);
							html_string.push(`<label for = "new-tab">${loc("ve.registry.localisation.WYSIWYG_open_in_new_tab")}</label>`);
						html_string.push(`</div>`);
						html_string.push(`<button class = "done">${loc("ve.registry.localisation.WYSIWYG_done")}</button>`);
					html_string.push(`</div>`);
				html_string.push(`</div>`);
			html_string.push(`</div>`);
		html_string.push(`</div>`);
		html_string.push(`</div>`);

		//Set .innerHTML; this.v
		this.element.innerHTML = html_string.join("");
		this.options = options;
		
		this.handleEvents();
		this.initWYSIWYG();
		this.from_binding_fire_silently = true;
		this.v = value;
		this.from_binding_fire_silently = false;
	}
	
	/**
	 * Returns the innerHTML of the present Component's input value.
	 * - Accessor of: {@link ve.WordProcessor}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.WordProcessor
	 * @type {string}
	 */
	get v () {
		//Return statement
		return this.getWYSIWYGFromFields(this.element);
	}
	
	/**
	 * Sets the HTML value for the present Component as a string.
	 * - Accessor of: {@link ve.WordProcessor}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "";
		
		//Set element .html-view, .visual-view content
		this.element.querySelector(`.html-view`).value = value;
		this.element.querySelector(`.visual-view`).innerHTML = value;
		this.fireFromBinding();
	}
	
	/**
	 * Initialises event handlers for the present Component.
	 * - Method of: {@link ve.WordProcessor}
	 * 
	 * @alias handleEvents
	 * @memberof ve.Component.ve.WordProcessor
	 */
	handleEvents () {
		//Declare local instance variables
		let html_view_el = this.element.querySelector(`.html-view`);
		let visual_view_el = this.element.querySelector(`.visual-view`);
		
		//Add change handlers
		html_view_el.addEventListener("input", (e) => {
			this.fireToBinding();
		});
		visual_view_el.addEventListener("input", (e) => {
			this.fireToBinding();
		});
	}
	
	//Internal helper functions
	
	/**
	 * Adds a paragraph tag on newline.
	 * - Method of: {@link ve.WordProcessor}
	 *
	 * @alias addParagraphTag
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {KeyboardEvent} arg0_e
	 */
	addParagraphTag (arg0_e) {
		//Convert from parameters
		let e = arg0_e;
		
		//Check if keyCode was Enter
		if (e.keyCode === "13") {
			//Guard clause; Don't add a p tag on list item
			if (window.getSelection().anchorNode.parentNode.tagName === "LI") return;
			
			//Otherwise, add a p tag
			document.execCommand("formatBlock", false, "p");
		}
	}
	
	/**
	 * Fetches the internal .innerHTML value, resolving any conflicts between the visual view and the code view.
	 * - Method of: {@link ve.WordProcessor}
	 *
	 * @alias getWYSIWYGFromFields
	 * @memberof ve.Component.ve.WordProcessor
	 *
	 * @param {HTMLElement} arg0_wysiwyg_el
	 *
	 * @returns {string}
	 */
	getWYSIWYGFromFields (arg0_wysiwyg_el) {
		//Convert from parameters
		let wysiwyg_el = arg0_wysiwyg_el;
		
		//Declare local instance variables
		let html_content_el = wysiwyg_el.querySelector(`.html-view`);
		let visual_content_el = wysiwyg_el.querySelector(`.visual-view`);
		
		//Return statement
		return (html_content_el.innerHTML.length > visual_content_el.innerHTML.length) ?
			html_content_el.innerHTML : visual_content_el.innerHTML;
	}
	
	/**
	 * Initialises the present WYSIWYG Component.
	 * - Method of: {@link ve.WordProcessor}
	 *
	 * @alias initWYSIWYG
	 * @memberof ve.Component.ve.WordProcessor
	 */
	initWYSIWYG () {
		//Declare local instance variables
		let editor = this.element.querySelector(`.wysiwyg-editor`);
		let modal = editor.getElementsByClassName("modal")[0];
		let toolbar = editor.getElementsByClassName("toolbar")[0];
		
		let buttons = toolbar.querySelectorAll(`.editor-button:not(.has-submenu)`);
		let content_area = editor.getElementsByClassName("content-area")[0];
		let visual_view = content_area.getElementsByClassName(`visual-view`)[0];
		
		let html_view = content_area.getElementsByClassName(`html-view`)[0];
		
		//Add active tag event
		document.addEventListener("selectionchange", (e) => {
			if (typeof this.selectionChange === "function") this.selectionChange(e, buttons, editor);
		});
		
		//Add paste event
		visual_view.addEventListener("paste", this.pasteEvent);
		
		//Add paragraph tag on newline
		content_area.addEventListener("keypress", this.addParagraphTag);
		
		//Add toolbar button actions
		for (let i = 0; i < buttons.length; i++) {
			let local_button = buttons[i];
			
			local_button.addEventListener("click", function (e) {
				let action = this.dataset.action;
				
				//execCommand handler
				switch (action) {
					case "toggle-view":
						ve.WordProcessor.execCodeAction(this, editor, visual_view, html_view);
						break;
					case "createLink":
						ve.WordProcessor.execLinkAction(modal);
						break;
					default:
						ve.WordProcessor.execDefaultAction(action);
				}
			});
		}
	}
	
	/**
	 * Check if the parent tag of an element was active.
	 * - Method of: {@link ve.WordProcessor}
	 *
	 * @alias parentTagActive
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {HTMLElement} arg0_el
	 * 
	 * @returns {boolean}
	 */
	parentTagActive (arg0_el) {
		//Convert from parameters
		let element = arg0_el;
		
		//Guard clause for visual view
		if (!element || !element.classList || element.classList.contains("visual-view"))
			return false;
		
		//Declare local instance variables
		let tag_name = element.tagName.toLowerCase();
		let text_align = element.style.textAlign;
		let toolbar_button;
		
		//Active by tag name
		toolbar_button = document.querySelectorAll(`.toolbar .editor-button[data-tag-name="${tag_name}"]`)[0];
		
		//Active by text-align
		toolbar_button = document.querySelectorAll(`.toolbar .editor-button[data-style="textAlign:${text_align}"]`)[0];
		
		//Set toolbar_button to being active if toolbar_button is defined
		if (toolbar_button)
			toolbar_button.classList.add("active");
		
		//Return statement
		return this.parentTagActive(element.parentNode);
	}
	
	/**
	 * Internal helper function for monitoring selection changes.
	 * - Method of: {@link ve.WordProcessor}
	 *
	 * @alias selectionChange
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {Event} arg0_e
	 * @param {HTMLElement[]} arg1_buttons
	 * @param {HTMLElement} arg2_editor
	 * 
	 * @returns {boolean}
	 */
	selectionChange (arg0_e, arg1_buttons, arg2_editor) {
		//Convert from parameters
		let e = arg0_e;
		let buttons = arg1_buttons;
		let editor = arg2_editor;
		
		//Declare local instance variables
		for (let i = 0; i < buttons.length; i++) {
			let local_button = buttons[i];
			
			//Don't remove active class on code toggle button
			if (local_button.dataset.action === "toggle-view") continue;
			
			local_button.classList.remove("active");
		}
		
		try {
			if (!childOf(window.getSelection().anchorNode.parentNode, editor))
				//Return statement; guard clause
				return false;
			
			this.parentTagActive(window.getSelection().anchorNode.parentNode);
		} catch {}
	}
	
	/**
	 * 	pasteEvent() - Handles paste event by removing all HTML tags.
	 * - Method of: {@link ve.WordProcessor}
	 *
	 * @alias pasteEvent
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {ClipboardEvent} arg0_e
	 */
	pasteEvent (arg0_e) {
		//Convert from parameters
		let e = arg0_e;
		
		//Declare local instance variables
		let text = (e.originalEvent || e).clipboardData.getData("text/plain");
		
		e.preventDefault();
		document.execCommand("insertHTML", false, text);
	}
	
	//Static helper methods
	
	/**
	 * Executes a code action and changes the formatting within the {@link ve.WordProcessor} component.
	 * - Static method of: {@link ve.WordProcessor}
	 *
	 * @alias #execCodeAction
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {HTMLElement} arg0_button_el - The button_el that determines the code action to execute.
	 * @param {HTMLElement} arg1_editor_el
	 * @param {HTMLElement} arg2_visual_view_el
	 * @param {HTMLElement} arg3_html_view_el
	 */
	static execCodeAction (arg0_button_el, arg1_editor_el, arg2_visual_view_el, arg3_html_view_el) {
		//Convert from parameters
		let button_el = arg0_button_el;
		let visual_view = arg2_visual_view_el;
		let html_view = arg3_html_view_el;
		
		//Toggle visual/HTML view depending on current state
		if (button_el.classList.contains("active")) { //Show visual view
			visual_view.innerHTML = html_view.value;
			html_view.style.display = "none";
			visual_view.style.display = "block";
			
			button_el.classList.remove("active");
		} else { //Show HTML view
			html_view.value = visual_view.innerHTML;
			visual_view.style.display = "none";
			html_view.style.display = "block";
			
			button_el.classList.add("active");
		}
	}
	
	/**
	 * Executes a default action given its string via {@link document.execCommand}.
	 * - Static method of: {@link ve.WordProcessor}
	 *
	 * @alias #execDefaultAction
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {string} arg0_action
	 */
	static execDefaultAction (arg0_action) {
		//Convert from parameters
		let action = arg0_action;
		
		//Invoke execCommand
		document.execCommand(action, false);
	}
	
	/**
	 * Adds a link to the current {@link ve.WordProcessor} editor being mentioned.
	 * - Static method of: {@link ve.WordProcessor}
	 *
	 * @alias #execLinkAction
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {HTMLElement} arg0_modal_el
	 */
	static execLinkAction (arg0_modal_el) {
		//Convert from parameters
		let modal = arg0_modal_el;
		
		//Declare local instance variables
		let close = modal.querySelectorAll(".close")[0];
		let selection = ve.WordProcessor.saveSelection();
		let submit = modal.querySelectorAll("button.done")[0];
		
		//Set modal to visible
		modal.style.display = "block";
		
		//Add link once done button is active
		submit.addEventListener("click", (e) => {
			e.preventDefault();
			
			let new_tab_checkbox = modal.querySelectorAll(`#new-tab`)[0];
			let link_input = modal.querySelectorAll(`#link-value`)[0];
			let link_value = link_input.value;
			let new_tab = new_tab_checkbox.checked;
			
			//Restore selection
			ve.WordProcessor.restoreSelection(selection);
			
			//Handle selection
			if (window.getSelection().toString()) {
				let local_a = document.createElement("a");
				
				local_a.href = link_value;
				if (new_tab)
					local_a.target = "_blank";
				window.getSelection().getRangeAt(0).surroundContents(local_a);
			}
			
			//Hide modal, deregister modal events
			modal.style.display = "none";
			link_input.value = "";
			
			submit.removeEventListener("click", arguments.callee); //[WIP] - Deprecate callee at a later date
			close.removeEventListener("click", arguments.callee);
		});
		
		//Close modal on close button click
		close.addEventListener("click", (e) => {
			e.preventDefault();
			
			let link_input = modal.querySelectorAll("#link-value")[0];
			
			//Hide modal, deregister modal events
			modal.style.display = "none";
			link_input.value = "";
			
			submit.removeEventListener("click", arguments.callee);
			close.removeEventListener("click", arguments.callee);
		});
	}
	
	/**
	 * Restores a saved selection for the current {@link ve.WordProcessor} component.
	 * - Static method of: {@link ve.WordProcessor}
	 *
	 * @alias #restoreSelection
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @param {Selection} arg0_saved_selection
	 */
	static restoreSelection (arg0_saved_selection) {
		//Convert from parameters
		let saved_selection = arg0_saved_selection;
		
		//Restore selection
		if (saved_selection)
			if (window.getSelection) {
				let selection = window.getSelection();
				selection.removeAllRanges();
				
				//Populate selection ranges
				for (let i = 0, length = saved_selection.length; i < length; i++)
					selection.addRange(saved_selection[i]);
			} else if (document.selection && saved_selection.select) {
				saved_selection.select();
			}
	}
	
	/**
	 * Saves the current selection for later restoration by {@link ve.WordProcessor.restoreSelection}().
	 * - Static method of: {@link ve.WordProcessor}
	 *
	 * @alias #saveSelection
	 * @memberof ve.Component.ve.WordProcessor
	 * 
	 * @returns {Range}
	 */
	static saveSelection () {
		if (window.getSelection) {
			let selection = window.getSelection();
			
			if (selection.getRangeAt && selection.rangeCount) {
				let ranges = [];
				
				//Iterate over selection.rangeCount to populate ranges
				for (let i = 0, length = selection.rangeCount; i < length; i++)
					ranges.push(selection.getRangeAt(i));
				
				//Return statement
				return ranges;
			}
		} else if (document.selection && document.selection.createRange) {
			//Return statement
			return document.selection.createRange();
		}
	}
};

//Functional binding

/**
 * @returns {ve.WordProcessor}
 */
veWordProcessor = function () {
	//Return statement
	return new ve.WordProcessor(...arguments);
};