/**
 * Parses a JSON action for a target GeometryPolygon.
 * - Static method of: {@link naissance.GeometryPolygon}
 *
 * `arg0_json`: {@link Object|string}
 * - `.geometry_id`: {@link string} - Identifier. The {@link naissance.Geometry} ID to target changes for, if any.
 * <br>
 * - #### Extraneous Commands:
 * - `.create_polygon`: {@link Object}
 *   - `.do_not_refresh`: {@link boolean}
 *   - `.id`: {@link string}
 *   - `.name`: {@link string}
 * - #### Internal Commands:
 * - `.add_to_polygon`: {@link Object}
 *   - `.geometry`: {@link string}
 *   - `.date=main.date`: {@link Object}
 *   - `.date_range`: {@link Array}<{@link Object}> - [start_date, end_date]; both are Date objects or timestamps.
 * - `.hide_polygon`: {@link boolean}
 * - `.remove_from_polygon`: {@link Object}
 *   - `.geometry`: {@link string}
 *   - `.date=main.date`: {@link Object}
 *   - `.date_range`: {@link Array}<{@link Object}> - [start_date, end_date]; both are Date objects or timestamps.
 * - `.set_polygon`: {@link Object}
 *   - `.geometry`: {@link Object}|{@link string}
 * - `.show_polygon`: {@link boolean}
 * - `.simplify_polygon`: {@link Object}|{@link number} - The amount to simplify the Polygon by.
 *   - `.date=main.date`: {@link Object}
 *   - `.date_range`: {@link Array}<{@link Object}> - [start_date, end_date]; both are Date objects or timestamps.
 *   - `.tolerance`: {@link number}
 *   - `.truncate`: {@link number}
 */
naissance.GeometryPolygon.parseAction = function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let polygon_obj = naissance.Geometry.instances.filter((v) => v.id === json.geometry_id)[0];
	
	//Parse extraneous commands
	//create_polygon
	if (json.create_polygon)
		if (json.create_polygon.id) {
			let new_polygon = new naissance.GeometryPolygon();
			new_polygon.id = json.create_polygon.id;
			if (json.create_polygon.name) {
				new_polygon.fire_action_silently = true;
				new_polygon.name = json.create_polygon.name;
				delete new_polygon.fire_action_silently;
			}
			if (main.brush.selected_feature)
				if (!json.create_polygon.do_not_refresh)
					UI_LeftbarHierarchy.refresh();
		}
	
	//Parse commands for polygon_obj
	if (polygon_obj && polygon_obj instanceof naissance.GeometryPolygon) {
		let _parseGeometryActionsInDateRange = (date_range, special_function) => {
			date_range =  [Date.getTimestamp(date_range[0]), Date.getTimestamp(date_range[1])];
			let polygon_keyframes = polygon_obj.getGeometryKeyframes({ return_timestamps: true });
			
			//Keyframes are look-forwards; create the keyframe at start_date; then for .value[0] changes until end_date
			if (!polygon_keyframes.includes(date_range[0]))
				polygon_keyframes.unshift(date_range[0]);
			
			//Iterate over all polygon_keyframes and apply the changes at the given date
			for (let i = 0; i < polygon_keyframes.length; i++)
				if (polygon_keyframes[i] >= date_range[0] && polygon_keyframes[i] <= date_range[1])
					special_function(polygon_keyframes[i]);
		};
		
		//add_to_polygon
		if (json.add_to_polygon) {
			let date = (json.add_to_polygon.date) ? json.add_to_polygon.date : main.date;
			let geometry = (json.add_to_polygon.date) ?
				polygon_obj.getGeometryKeyframeAtDate(date) : polygon_obj.geometry;
			let ot_geometry = maptalks.Geometry.fromJSON(json.add_to_polygon.geometry);
			
			//Date range handling
			if (json.add_to_polygon.date_range) {
				_parseGeometryActionsInDateRange(json.add_to_polygon.date_range, (local_keyframe) => {
					DALS.Timeline.parseAction({
						options: { name: "Add to Polygon", key: "add_to_polygon" },
						value: [{
							type: "GeometryPolygon",
							geometry_id: polygon_obj.id,
							add_to_polygon: {
								date: local_keyframe,
								geometry: json.add_to_polygon.geometry
							}
						}]
					}, true);
				});
			} else {
				//Union with existing geometry if defined, if undefined replace geometry
				try {
					geometry = (geometry) ? Geospatiale.convertMaptalksToTurf(geometry) : null;
					ot_geometry = (ot_geometry) ? Geospatiale.convertMaptalksToTurf(ot_geometry) : null;
					
					if (geometry && ot_geometry) {
						polygon_obj.addKeyframe(date, Geospatiale.convertTurfToMaptalks(
							turf.union(turf.featureCollection([geometry, ot_geometry]))
						).toJSON());
					} else if (geometry && !ot_geometry) {
						polygon_obj.addKeyframe(date, Geospatiale.convertTurfToMaptalks(geometry).toJSON());
					} else if (!geometry && ot_geometry) {
						polygon_obj.addKeyframe(date, Geospatiale.convertTurfToMaptalks(ot_geometry).toJSON());
					}
				} catch (e) { console.error(e); }
			}
		}
		
		//remove_from_polygon
		if (json.remove_from_polygon) { //[WIP] - Replicate add_to_polygon logic for remove_from_polygon
			let date = (json.remove_from_polygon.date) ? json.remove_from_polygon.date : main.date;
			let geometry = (json.remove_from_polygon.date) ?
				polygon_obj.getGeometryKeyframeAtDate(date) : polygon_obj.geometry;
			let ot_geometry = maptalks.Geometry.fromJSON(json.remove_from_polygon.geometry);
			
			//Difference with existing geometry, if return value is null replace geometry
			if (json.remove_from_polygon.date_range) {
				_parseGeometryActionsInDateRange(json.remove_from_polygon.date_range, (local_keyframe) => {
					DALS.Timeline.parseAction({
						options: { name: "Remove from Polygon", key: "remove_from_polygon" },
						value: [{
							type: "GeometryPolygon",
							geometry_id: polygon_obj.id,
							remove_from_polygon: {
								date: local_keyframe,
								geometry: json.remove_from_polygon.geometry
							}
						}]
					}, true);
				});
			} else {
				//Difference with existing geometry; if it covers the entire geometry set to null to hide
				if (geometry) {
					let turf_difference;
					try {
						turf_difference = turf.difference(turf.featureCollection([
							Geospatiale.convertMaptalksToTurf(geometry),
							Geospatiale.convertMaptalksToTurf(ot_geometry)
						]));
					} catch (e) {}
					polygon_obj.addKeyframe(date, (turf_difference) ?
						Geospatiale.convertTurfToMaptalks(turf_difference).toJSON() : null);
				}
			}
		}
		
		//set_polygon
		if (json.set_polygon && json.set_polygon.geometry) {
			let new_geometry = json.set_polygon.geometry;
			
			if (typeof new_geometry === "string")
				new_geometry = JSON.parse(new_geometry);
			polygon_obj.addKeyframe(main.date, new_geometry);
		}
		
		//simplify_polygon
		if (json.simplify_polygon !== undefined) {
			if (typeof json.simplify_polygon === "number") {
				let geometry = polygon_obj.geometry;
				let turf_simplify = turf.simplify(Geospatiale.convertMaptalksToTurf(geometry), { tolerance: json.simplify_polygon });
				
				polygon_obj.addKeyframe(main.date, (turf_simplify) ?
					Geospatiale.convertTurfToMaptalks(turf_simplify).toJSON() : null);
			} else if (typeof json.simplify_polygon === "object") {
				let tolerance = Math.returnSafeNumber(json.simplify_polygon.tolerance);
				
				if (tolerance) {
					let date = (json.simplify_polygon.date) ? json.simplify_polygon.date : main.date;
					
					if (json.simplify_polygon.date_range) {
						_parseGeometryActionsInDateRange(json.simplify_polygon.date_range, (local_keyframe) => {
							let local_simplify_options = json.simplify_polygon;
								delete local_simplify_options.date_range;
								
							DALS.Timeline.parseAction({
								options: { name: "Simplify Polygon", key: "simplify_polygon" },
								value: [{
									type: "GeometryPolygon",
									geometry_id: polygon_obj.id,
									simplify_polygon: {
										date: local_keyframe,
										tolerance: tolerance,
										...local_simplify_options
									}
								}]
							}, true);
						});
					} else {
						let geometry = (json.simplify_polygon.date) ? 
							polygon_obj.getGeometryKeyframeAtDate(date) : polygon_obj.geometry;
						
						if (geometry) try {
							let turf_simplify = turf.simplify(Geospatiale.convertMaptalksToTurf(geometry), { tolerance: tolerance });
								if (json.simplify_polygon.truncate > 0)
									turf_simplify = turf.truncate(turf_simplify, { precision: json.simplify_polygon.truncate });
							
							polygon_obj.addKeyframe(date, (turf_simplify) ?
								Geospatiale.convertTurfToMaptalks(turf_simplify).toJSON() : null);
						} catch (e) {
							console.error(`Turf simplify:`, Geospatiale.convertMaptalksToTurf(geometry), geometry, e);
						}
					}
				}
			}
		}
		
		//simplify_polygon_for_all_keyframes
		if (json.simplify_polygon_for_all_keyframes !== undefined) {
			Object.iterate(polygon_obj.history.keyframes, (local_key, local_value) => {
				let local_geometry = local_value.value[0];
				
				if (local_geometry && local_geometry !== "undefined") {
					let geometry = maptalks.Geometry.fromJSON(local_geometry);
					
					if (geometry) try {
						let turf_simplify = turf.simplify(Geospatiale.convertMaptalksToTurf(geometry), { 
							tolerance: json.simplify_polygon_for_all_keyframes.tolerance
						});
						if (json.simplify_polygon_for_all_keyframes.truncate > 0)
							turf_simplify = turf.truncate(turf_simplify, { 
								precision: json.simplify_polygon_for_all_keyframes.truncate 
							});
						
						local_value.value[0] = Geospatiale.convertTurfToMaptalks(turf_simplify).toJSON();
					} catch (e) { console.error(`Error simplifying ${polygon_obj.name}:`, local_value, e); }
				}
			});
		}
	}
};

naissance.GeometryPolygon.parseActionForDateRange = function (arg0_date_range) { //[WIP] - Finish function body
	
};