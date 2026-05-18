global.UI_Settings = class extends ve.Class { //[WIP] - Add settings serialisation/deserialisation
	constructor () {
		super();
		
		//Declare local instance variables
		let navbar_el = document.querySelector(".ve.navbar");
		
		let settings_ui = {
			project: {
				name: "Project",
				components_obj: {
					autoload_file_container: veRawInterface({
						autoload_file_label: veHTML(`<b>Autoload File</b>`, { style: { display: "inline" } }),
						autoload_file: veFile((main.settings.autoload_file) ? main.settings.autoload_file : path.join(process.cwd(), "saves/autosave.naissance"), {
							name: "Change Save",
							tooltip: "Loads file whenever available.",
							
							onuserchange: (v) => {
								main.settings.autoload_file = v;
								UI_Settings.saveSettings();
							}
						})
					}),
					autoloading_mode: veSelect({
						default: {
							name: "Default"
						},
						disable_autoload: {
							name: "Disable Autoload"
						},
						load_last_save: {
							name: "Load Last Save"
						}
					}, {
						name: "Autoloading Mode",
						onuserchange: (v) => {
							main.settings.autoloading_mode = v;
							UI_Settings.saveSettings();
						},
						selected: main.settings.autoloading_mode
					}),
					sort_settings_alphabetically: veToggle(main.settings.sort_settings_alphabetically, {
						name: "Sort Settings Alphabetically",
						onuserchange: (v) => {
							main.settings.sort_settings_alphabetically = v;
							UI_Settings.saveSettings();
						}
					}),
					open_map_settings: veButton(() => new UI_MapSettings(), {
						name: `<icon>settings</icon> Map Settings`,
						tooltip: `Map settings are restricted to the current project, and are not globally applied.`
					})
				}
			},
			appearance: {
				name: "Appearance",
				components_obj: {
					appearance_ui: vePageMenu({
						editor_appearance: {
							name: "Editor Appearance",
							components_obj: {
								hierarchy_ordering: new ve.Select({
									features_at_top: {
										name: "Features At Top"
									},
									geometries_at_top: {
										name: "Geometries At Top"
									}
								}, {
									name: "Hierarchy Ordering",
									selected: (main.settings.hierarchy_ordering) ? 
										main.settings.hierarchy_ordering : "features_at_top",
									
									onuserchange: (v) => {
										main.settings.hierarchy_ordering = v;
										UI_Settings.saveSettings();
										UI_LeftbarHierarchy.refresh();
									}
								}),
								hierarchy_recommended_max_geometries_in_layer: new ve.Number(Math.returnSafeNumber(main.settings.hierarchy_recommended_max_geometries_in_layer, 100), {
									name: "Hierarchy Recommended Max. Geometries in Layer",
									onuserchange: (v) => {
										main.settings.hierarchy_recommended_max_geometries_in_layer = v;
										UI_Settings.saveSettings();
									}
								}),
								locale: new ve.Select(config.localisation.locales, {
									name: "Language",
									tooltip: "The locale to change your UI to.",
									selected: (main.settings.locale) ?
										main.settings.locale : "default",
									
									onuserchange: (v) => {
										//Declare local instance variables
										let locale_obj = config.localisation.locales[v];
										
										//Apply locale first
										let actual_locale = (locale_obj.key !== undefined) ? locale_obj.key : v;
										
										main.settings.locale = actual_locale;
										ve.registry.locale = actual_locale;
										UI_Settings.saveSettings();
										
										//Reload save
										let cached_state = DALS.Timeline.saveState();
										
										ve.clear();
										initialiseGlobal();
										setTimeout(() => DALS.Timeline.loadState(cached_state), 200);
									}
								}),
								ui_scaling: new ve.Range(Math.returnSafeNumber(main.settings.ui_scaling, 1), {
									min: 0.5,
									max: 1.5,
									name: "UI Scaling",
									onuserchange: (v) => {
										main.settings.ui_scaling = v;
										UI_Settings.refresh();
										UI_Settings.saveSettings();
									}
								})
							}
						},
						map_appearance: {
							name: "Map Appearance",
							components_obj: {
								font_registry: new ve.MultiTag(main.settings.font_registry, {
									name: "Font Registry",
									tags_key: "settings_font_registry",
									
									onuserchange: (v) => {
										main.settings.font_registry = v;
										UI_Settings.saveSettings();
									}
								}),
								default_label_symbol: veInterface({
									hide_labels_by_default: veToggle(main.settings.hide_labels_by_default, {
										name: "Hide Labels by Default",
										tooltip: "Labels will not appear by default when new Geometries are created.",
										
										onuserchange: (v) => {
											main.settings.hide_labels_by_default = v;
											UI_Settings.saveSettings();
										}
									}),
									hide_labels_under_km2: veNumber(Math.returnSafeNumber(main.settings.hide_labels_under_km2, 1000), {
										name: "Hide Labels Under Area (km^2)",
										tooltip: "Labels will not appear for exclaves under this area.",
										onuserchange: (v) => {
											main.settings.hide_labels_under_km2 = v;
											UI_Settings.saveSettings();
										}
									}),
									
									default_label_colour: veColour((main.settings.default_label_colour) ? main.settings.default_label_colour : [255, 255, 255], {
										name: "Font Colour",
										onuserchange: (v, e) => {
											main.settings.default_label_colour = e.getHex();
											UI_Settings.saveSettings();
										}
									}),
									default_label_font: veSelect(main.settings.font_registry, {
										name: "Font Family",
										selected: main.settings.default_label_font,
										
										onuserchange: (v) => {
											main.settings.default_label_font = v;
											UI_Settings.saveSettings();
										}
									}),
									default_label_font_size: veNumber(Math.returnSafeNumber(main.settings.default_label_font_size, 14), {
										name: "Font Size",
										
										min: 6,
										onuserchange: (v) => {
											main.settings.default_label_font_size = v;
											UI_Settings.saveSettings();
										}
									}),
									default_label_stroke: veColour((main.settings.default_label_stroke) ? main.settings.default_label_stroke : [0, 0, 0], {
										name: "Font Stroke",
										onuserchange: (v, e) => {
											main.settings.default_label_stroke = e.getHex();
											UI_Settings.saveSettings();
										}
									}),
									default_label_stroke_width: veNumber(Math.returnSafeNumber(main.settings.default_label_stroke_width, 2), {
										name: "Font Stroke Width",
										
										min: 0,
										onuserchange: (v) => {
											main.settings.default_label_stroke_width = v;
											UI_Settings.saveSettings();
										}
									})
								}, {
									attributes: { class: "ve-disable-nesting" },
									name: "Default Label Symbol" 
								}),
								province_layer_symbol: veInterface({
									province_layer_opacity: veRange(Math.returnSafeNumber(main.settings.province_layer_opacity, 0.5), {
										name: "Layer Opacity",
										
										onuserchange: (v) => {
											main.settings.province_layer_opacity = v;
											UI_Settings.saveSettings();
											naissance.FeatureLayer.fetchProvincesLayer();
										}
									}),
									refresh_province_layer: veButton(() => {
										naissance.FeatureLayer.fetchProvincesLayer();
									}, { name: "Refresh Province Layer" })
								}, {
									attributes: { class: "ve-disable-nesting" },
									name: "Province Layer Symbol"
								})
							}
						}
					}, {
						style: { padding: 0 }
					})
				}
			},
			keymap: {
				name: "Keymap"
			}
		};
		
		//Open UI
		this.settings_ui = new ve.PageMenu(settings_ui, {
			style: {
				padding: 0,
				
				'[component="ve-interface"]': {
					padding: 0
				}
			}
		});
		super.open("instance", {
			name: "Settings",
			can_rename: false,
			width: "30rem",
			y: ((navbar_el) ? navbar_el.offsetHeight : 0) + HTML.mouse_y + 8 
		});
	}
	
	static refresh () {
		//Declare local instance variables
		let html_el = document.querySelector("html");
		
		//Apply UI scaling changes (rem)
		html_el.style.fontSize = `${16*Math.returnSafeNumber(main.settings.ui_scaling, 1)}px`;
	}
	
	/**
	 * Loads settings from `settings.json`.
	 */
	static loadSettings () {
		//Load settings from settings.json if it exists
		if (fs.existsSync("./settings.json")) try {
			main.settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
			UI_Settings.refresh();
		} catch (e) {
			veWindow(`Error loading <kbd>./settings.json</kbd>: ${e}<br><br>If you have modified ./settings.json manually, please ensure that your syntax is correct.`, {
				name: "Error Loading Settings"
			});
			return;
		}
		
		//main.settings.autoload_file handler
		if (main.settings.autoload_file && main.settings.autoloading_mode === "default")
			if (fs.existsSync(main.settings.autoload_file[0])) {
				let load_data = fs.readFileSync(main.settings.autoload_file[0], "utf8");
				
				//Load state
				setTimeout(() => {
					DALS.Timeline.parseAction({
						options: { name: "Load Save", key: "load_save" },
						value: [{ type: "global", load_save: load_data }]
					});
				}, 100);
			}
	}
	
	/**
	 * Saves the current `main.settings` {@link Object} to `settings.json`.
	 */
	static saveSettings () {
		fs.writeFileSync(`./settings.json`, JSON.stringify(main.settings, null, 2));
	}
}