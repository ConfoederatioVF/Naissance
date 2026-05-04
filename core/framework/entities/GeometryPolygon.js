if (!global.naissance) global.naissance = {};
/**
 * {@link naissance.HistoryKeyframe} data structure:
 * - [0]: arg0_coords:{@link Object}<{@link Array}<{@link float}, {@link float}>> - Contains the maptalks coordinates.
 * - [1]: arg1_symbol:{@link Object} - Contains the maptalks symbol.
 * - [2]: arg2_data:{@link Object}
 * 
 * @type {naissance.GeometryPolygon}
 */
naissance.GeometryPolygon = class extends naissance.Geometry {
	constructor () {
		super();
		this.class_name = "GeometryPolygon";
		this.node_editor_mode = "Polygon";
		
		//Declare UI
		this.interface = veInterface({
			information: veHTML(() => {
				//Declare local instance variables
				let area_km2 = (this.geometry && this.isOpen("instance")) ? 
					this.geometry.getArea()/1000000 : 0;
				
				//Return statement
				return `ID: ${this.id} | Area: ${String.formatNumber(area_km2)}km^2`;
			}, { width: 99, x: 0, y: 0 }),
			move_to_brush: veButton(() => DALS.Timeline.parseAction({
				options: { name: "Select Geometry" },
				value: [{ type: "Brush", select_geometry_id: this.id }]
			}), { name: "Move To Brush", limit: () => (main.brush.selected_geometry?.id !== this.id), x: 0, y: 1 }),
			finish_polygon: veButton(() => DALS.Timeline.parseAction({
				options: { name: "Deselect Geometry", key: "deselect_geometry" },
				value: [{ type: "Brush", select_geometry_id: false }]
			}), { name: "Finish Polygon", limit: () => (main.brush.selected_geometry?.id === this.id), x: 0, y: 1 }),
			
			selected: veCheckbox(this.selected, {
				name: "Selected",
				onuserchange: (v) => this.selected = v,
				x: 1, y: 1
			}),
			debug: veButton(() => {
				console.log(`$geometry - naissance.GeometryPolygon (ID: ${this.id}):`, this);
				window.$geometry = this;
			}, {
				name: "Debug",
				x: 2, y: 1
			}),
			
			actions_bar: veRawInterface(this.drawHierarchyDatatypeGenerics(), {
				name: "<b>Quick Actions:</b>",
				style: {
					alignItems: "center",
					display: "flex",
					"[component='ve-button']": { marginLeft: "var(--padding)" }
				},
				width: 99
			})
		}, { is_folder: false });
		this.edit_symbol_ui = veInterface({
			edit_fill: main.interfaces.edit_geometry_polygon.draw({ _id: () => this.id, name: "Fill" }),
			edit_label: main.interfaces.edit_geometry_label.draw({ _id: () => this.id, name: "Label" }),
			edit_stroke: main.interfaces.edit_geometry_line.draw({ _id: () => this.id, name: "Stroke" })
		}, { name: "Edit Symbol" });
		this.keyframes_ui = veInterface({}, {
			name: `Keyframes`, open: true
		});
		super.drawVariablesEditor();
		
		//Add keyframe with default brush symbol upon instantiation
		let brush_symbol = main.brush.getBrushSymbol();
		if (brush_symbol)
			this.addKeyframe(main.date, undefined, brush_symbol);
		
		//KEEP AT BOTTOM!
		this.updateOwner();
	}
	
	draw () {
		//Declare local instance variables
		let brush_symbol = main.brush.getBrushSymbol();
		let derender_geometry = false;
		
		//1. Set this.value from current relative keyframe
		this.value = this.history.getKeyframe({ date: main.date }).value;
		if (this.value === undefined || this.value.length === 0 || this._is_visible === false) 
			derender_geometry = true;
			
		//2. Check any cause for derendering
		if (this.value && this.value[0] === null) derender_geometry = true; //Coords are null, derender geometry
		if (this.value && this.value[2]) {
			if (this.value[2].hidden) derender_geometry = true;
			if (this.value[2].max_zoom && map.getZoom() > this.value[2].max_zoom) derender_geometry = true;
			if (this.value[2].min_zoom && map.getZoom() < this.value[2].min_zoom) derender_geometry = true;
		}
		
		//3. Draw this.geometry, this.label from this.value onto map
		if (!derender_geometry) {
			try {
				if (this.geometry) this.geometry.remove();
				if (this.label_geometries)
					for (let i = this.label_geometries.length - 1; i >= 0; i--) {
						this.label_geometries[i].remove();
						this.label_geometries.splice(i, 1);
					}
				if (this.selected_geometry) this.selected_geometry.remove();
				
				//Draw this.geometry, this.label_geometries, this.selected_geometry
				if (this.value[0]) {
					this.geometry = maptalks.Geometry.fromJSON(this.value[0]);
					if (this.value[1] && this.geometry) this.geometry.setSymbol(this.value[1]);
					main.layers.entity_layer.addGeometry(this.geometry);
				}
				if (this.value[2]) {
					//Fetch this.value[2].label_coordinates, this.value[2].label_name/name, this.value[2].label_symbol
					if (this.geometry && !this.value[2]?.label_symbol?.hide) {
						let label_geometries = (this.value[2].label_geometries) ?
							this.value[2].label_geometries : [];
						let label_name = (this.value[2].label_name) ? 
							this.value[2].label_name : this.value[2].name;
						
						//1. .label_coordinates
						if (label_geometries.length === 0) {
							if (!this.geometry.getGeometries) {
								this.label_geometries[0] = new maptalks.Marker(this.geometry.getCenter());
							} else {
								let all_geometries = this.geometry.getGeometries();
								
								for (let i = 0; i < all_geometries.length; i++)
									this.label_geometries[i] = new maptalks.Marker(all_geometries[i].getCenter());
							}
						} else {
							for (let i = 0; i < label_geometries.length; i++)
								this.label_geometries[i] = maptalks.Geometry.fromJSON(label_geometries[i]);
						}
						
						//Iterate over all this.label_geometries, apply settings
						for (let i = 0; i < this.label_geometries.length; i++) {
							//2. .label_name/.name
							if (label_geometries.length === 0) {
								this.label_geometries[i].setSymbol({
									textName: label_name,
									
									textFaceName: brush_symbol.textFaceName,
									textFill: brush_symbol.textFill,
									textHaloFill: brush_symbol.textHaloFill,
									textHaloRadius: brush_symbol.textHaloRadius,
									textSize: brush_symbol.textSize,
									...this.value[2].label_symbol
								});
								
								if (main.settings.hide_labels_by_default)
									this.label_geometries[i].hide();
							}
								
							this.label_geometries[i].addTo(main.layers.label_layer);
						}
					}
				}
			} catch (e) { console.error(e); }
			
			//4. Draw this.selected_geometry
			try {
				this.selected_geometry = undefined;
				
				if (this.geometry && this.selected) {
					this.selected_geometry = this.geometry.copy();
					this.selected_geometry.setSymbol({
						lineColor: `rgb(255, 255, 0)`,
						lineDasharray : (main.brush.selected_geometry?.id !== this.id) ? [10, 10, 10] : undefined,
						lineOpacity: 0.5,
						lineWidth: 4
					});
					main.layers.selection_layer.addGeometry(this.selected_geometry);
				}
			} catch (e) { console.error(e); }
			
			//5. Add bindings
			if (this.geometry) {
				this.geometry.addEventListener("click", (e) => {
					if (!["fill_tool", "node", "node_override", "node_transfer"].includes(main.brush.mode)) {
						this.history.draw(this.keyframes_ui);
						super.open("instance", { name: this.name, ...this.window_options });
					}
				});
			}
		}
		
		//6. Derender geometry handler
		if (derender_geometry) {
			if (this.geometry) this.geometry.remove();
			if (this.label_geometries)
				for (let i = 0; i < this.label_geometries.length; i++)
					this.label_geometries[i].remove();
			if (this.selected_geometry) this.selected_geometry.remove();
		}
	}
	
	drawHierarchyDatatype () {
		//Declare local instance variables
		let current_keyframe = this.history.getKeyframe();
			this._current_keyframe = current_keyframe;
		let current_symbol = current_keyframe.value[1];
		let is_visible = false;
		
		try {
			if (current_keyframe.value[0] !== undefined && Object.keys(current_keyframe.value[0]).length)
				is_visible = true;
		} catch (e) {}
		
		//Return statement
		if (this.hierarchy_datatype?.remove) this.hierarchy_datatype.remove();
		this.hierarchy_datatype = new ve.HierarchyDatatype({
			icon: veHTML(`<icon style = "${
				(current_symbol?.polygonFill) ? `color: ${current_symbol?.polygonFill};` : ""
			}">pentagon</icon>`, {
				tooltip: "GeometryPolygon"
			}),
			...super.drawHierarchyDatatypeGenerics(),
			context_menu: veButton(() => {
				try { this.history.draw(this.keyframes_ui); } catch (e) {}
				super.open("instance", { name: this.name, ...this.window_options });
			}, {
				attributes: { class: "order-101" },
				name: "<icon>more_vert</icon>",
				tooltip: "More Actions"
			})
		},  {
			attributes: {
				"data-is-selected": this.selected,
				"data-is-visible": (is_visible) ? "true" : "false",
				"data-selected-geometry": (main.brush.selected_geometry?.id === this.id),
				"data-type": "GeometryPolygon"
			},
			do_not_display: true,
			instance: this,
			name: this.name,
			name_options: {
				onprogramchange: () => {
					this.drawHierarchyDatatype();
				},
				onuserchange: (v) => {
					this.name = v;
				}
			}
		});
		delete this._current_keyframe;
		return this.hierarchy_datatype;
	}
	
	getActionsBarElement () {
		//Declare local instance variables
		let actions_bar_el = super.getActionsBarElement();
		
		let context_menu_button = veButton(() => {
			try { this.history.draw(this.keyframes_ui); } catch (e) {}
			super.open("instance", { name: this.name, ...this.window_options });
		}, {
			attributes: { class: "order-101" },
			name: "<icon>more_vert</icon>",
			tooltip: "More Actions"
		});
			context_menu_button.bind(actions_bar_el);
		
		//Return statement
		return actions_bar_el;
	}
};