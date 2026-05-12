if (!global.naissance) global.naissnace = {};
naissance.BrushNodeEditor = class extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		this.draw_tool = new maptalks.DrawTool({ mode: "Polygon" }).addTo(map).disable();
		this.node_editor_modes = ["node", "node_override"];
		
		this.handleEvents();
	}
	
	disable () { 
		this.draw_tool.disable(); 
	}
	
	enable () {
		this.draw_tool.enable(); 
	}
	
	handleEvents () {
		this.draw_tool.on("drawend", (e) => {
			let selected_geometry = main.brush._selected_geometry;
			
			//Internal guard clause; check to make sure that ._selected_geometry is not in a provinces layer
			if (selected_geometry) {
				let layer_obj = selected_geometry.getLayer();
				if (layer_obj?._type === "provinces") {
					e.geometry.remove();
					return;
				}
			}
			
			//Otherwise, handle node additions/subtractions as normal
			if (main.brush.disabled) try { this.draw_tool.disable(); } catch (e) {}
			
			if (naissance[selected_geometry.class_name].handleNodeEditorEnd)
				naissance[selected_geometry.class_name].handleNodeEditorEnd.call(selected_geometry, e);
			e.geometry.remove();
		});
		this.draw_tool.on("drawstart", (e) => {
			if (main.brush.disabled) try { this.draw_tool.disable(); } catch (e) {}
			if (HTML.ctrl_pressed) {
				this.draw_tool.setSymbol({
					polygonFill: "rgba(240, 60, 60, 0.5)"
				});
				this.mode = "remove";
			} else {
				this.draw_tool.setSymbol({
					polygonFill: "rgba(255, 255, 255, 0.5)"
				});
				this.mode = "add";
			}
		});
	}
	
	update () {
		if (["node", "node_override", "node_transfer"].includes(main.brush.mode)) {
			if (main.brush._selected_geometry)
				if (main.brush._selected_geometry.node_editor_mode)
					this.draw_tool.setMode(main.brush._selected_geometry.node_editor_mode).enable();
		} else {
			if (main.brush._selected_geometry instanceof naissance.GeometryLine) {
				this.draw_tool.setMode("FreeHandLineString").enable();
			} else {
				this.draw_tool.disable();
			}
		}
	}
};

naissance.GeometryLine.handleNodeEditorEnd = function (arg0_e) {
	//Convert from parameters
	let e = (arg0_e);
	
	//Push action to timeline
	if (main.brush.node_editor.mode === "add") {
		e.geometry = main.brush.getAddLine(e.geometry);
		DALS.Timeline.parseAction({
			options: { name: "Add to Line", key: "add_to_line" },
			value: [{
				type: "GeometryLine",
				
				geometry_id: this.id,
				add_to_line: { geometry: e.geometry.toJSON() }
			}]
		});
	}
	
	main.brush.node_editor.disable();
	main.brush.node_editor.enable();
};
naissance.GeometryPolygon.handleNodeEditorEnd = function (arg0_e) {
	//Convert from parameters
	let e = arg0_e;
	
	//Declare local instance variables
	let date_range = main.interfaces.edit_brush_keyframes.getDateRange();
	
	//Transfer handler
	if (main.brush.mode === "node_transfer") {
		try {
			let from_geometry_id = main.brush.from_geometry_id;
			let from_geometry;
			if (from_geometry_id)
				for (let i = 0; i < naissance.Geometry.instances.length; i++)
					if (naissance.Geometry.instances[i].id === from_geometry_id) {
						from_geometry = naissance.Geometry.instances[i];
						break;
					}
			
			//Get the intersection of from_geometry and e.geometry
			if (!(from_geometry?.geometry && e?.geometry)) return; //Internal guard clause if neither are presently defined
			if (from_geometry?.id === this.id) return; //Internal guard clause for self-selection
			
			let cursor_turf_geometry = Geospatiale.convertMaptalksToTurf(e.geometry);
			let ot_turf_geometry = Geospatiale.convertMaptalksToTurf(from_geometry.geometry);
			let turf_geometry = (this.geometry) ? Geospatiale.convertMaptalksToTurf(this.geometry) : null;
			
			let turf_intersection = (main.brush.node_editor.mode === "add") ?
				turf.intersect(turf.featureCollection([ot_turf_geometry, cursor_turf_geometry])) :
				turf.intersect(turf.featureCollection([turf_geometry, cursor_turf_geometry]));
			if (!turf_intersection) return; //Internal guard clause if nothing overlaps
			turf_intersection = turf.buffer(turf_intersection, Math.returnSafeNumber(main.brush.node_buffer/1000, 0.01), { units: "kilometers" });
			
			//Transfer selected polygon
			e.geometry = Geospatiale.convertTurfToMaptalks(turf_intersection);
			
			if (main.brush.node_editor.mode === "add") {
				DALS.Timeline.parseAction({
					options: { name: "Remove from Polygon", key: "remove_from_polygon" },
					value: [{
						type: "GeometryPolygon",
						geometry_id: from_geometry.id,
						remove_from_polygon: {
							date_range: date_range,
							geometry: e.geometry.toJSON()
						}
					}]
				}); //Remove cut from target polygon
				setTimeout(() => {
					DALS.Timeline.parseAction({
						options: { name: "Simplify Polygon", key: "simplify_polygon" },
						value: [{
							type: "GeometryPolygon",
							geometry_id: this.id,
							simplify_polygon: {
								date_range: date_range,
								tolerance: 0.01
							}
						}]
					}, true);
				}, 100);
			} else if (main.brush.node_editor.mode === "remove") {
				DALS.Timeline.parseAction({
					options: { name: "Add to Polygon", key: "add_to_polygon" },
					value: [{
						type: "GeometryPolygon",
						geometry_id: from_geometry.id,
						add_to_polygon: {
							date_range: date_range,
							geometry: e.geometry.toJSON() 
						},
						simplify_polygon: {
							date_range: date_range,
							tolerance: 0.01
						}
					}]
				});
				
				setTimeout(() => {
					DALS.Timeline.parseAction({
						options: { name: "Simplify Polygon", key: "simplify_polygon" },
						value: [{
							type: "GeometryPolygon",
							geometry_id: from_geometry.id,
							simplify_polygon: {
								date_range: date_range,
								tolerance: 0.01
							}
						}]
					}, true);
				}, 100);
			}
			
		} catch (e) { console.error(e); }
	}
	
	//Push action to timeline for selected geometry
	if (main.brush.node_editor.mode === "add") {
		e.geometry = main.brush.getAddPolygon(e.geometry);
		if (!e.geometry) console.log(`Undefined geometry:`, e.geometry);
		DALS.Timeline.parseAction({
			options: { name: "Add to Polygon", key: "add_to_polygon" },
			value: [{
				type: "GeometryPolygon",
				
				geometry_id: this.id,
				add_to_polygon: {
					date_range: date_range,
					geometry: e.geometry.toJSON() 
				},
				simplify_polygon: {
					date_range: date_range,
					tolerance: (main.brush.simplify > 0 && main.brush.simplify_applies_to_polygon) ?
						main.brush.simplify : undefined
				}
			}]
		}); //Add cut to target polygon
	} else if (main.brush.node_editor.mode === "remove") {
		e.geometry = main.brush.getRemovePolygon(e.geometry);
		DALS.Timeline.parseAction({
			options: { name: "Remove from Polygon", key: "remove_from_polygon" },
			value: [{
				type: "GeometryPolygon",
				geometry_id: this.id,
				remove_from_polygon: {
					date_range: date_range,
					geometry: e.geometry.toJSON()
				}
			}]
		});
	}
	
	main.brush.node_editor.disable();
	main.brush.node_editor.enable();
};