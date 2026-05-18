global.UI_Navbar = class {
	constructor () {
		//Declare local instance variables
		this.navbar_el = new ve.Navbar({
			file: {
				name: "Project",
				
				open_project_folder: {
					name: "Open Project Folder"
				}
			},
			edit: {
				name: "Edit",
				
				undo: {
					name: "Undo",
					keybind: "ctrl+z",
					onclick: () => DALS.Timeline.undo()
				},
				redo: {
					name: "Redo",
					keybind: "ctrl+y",
					onclick: () => DALS.Timeline.redo()
				}
			},
			settings: {
				name: "Settings",
				onclick: () => new UI_Settings()
			},
			view: {
				name: "View",
				
				keybinds: {
					name: "Keybinds"
				},
				toggle_ui: {
					name: "Toggle UI",
					onclick: () => naissance.Renderer.toggleUI()
				},
				zoom_in: {
					name: "Zoom In",
					keybind: "ctrl+=",
					onclick: () => map.zoomIn()
				},
				zoom_out: {
					name: "Zoom Out",
					keybind: "ctrl+-",
					onclick: () => map.zoomOut()
				}
			},
			help: {
				name: "Wiki",
				
				naissance: {
					name: "<b>Naissance</b>"
				},
				brush: {
					name: "Brush",
					
					brush_mode: {
						name: "Brush Mode"
					},
					selection: {
						name: "Selection"
					}
				},
				entities: {
					name: "Entities",
					
					geometries: {
						name: "Geometries",
						
						polygon: {
							name: "Polygon"
						}
					},
					features: {
						name: "Features",
						
						group: {
							name: "Group"
						},
						layer: {
							name: "Layer"
						},
						sketchmap: {
							name: "SketchMap",
							
							circle: {
								name: "Circle"
							},
							ellipse: {
								name: "Ellipse"
							},
							freehand_line_string: {
								name: "FreeHandLineString"
							},
							freehand_polygon: {
								name: "FreeHandPolygon"
							},
							line_string: {
								name: "LineString"
							},
							point: {
								name: "Point"
							},
							polygon: {
								name: "Polygon"
							},
							rectangle: {
								name: "Rectangle"
							}
						},
						tile_layer: {
							name: "TileLayer"
						}
					},
					metadata: {
						name: "Metadata"
					}
				},
				date: {
					name: "Date",
					onclick: () => console.log("Date"),
					
					history: {
						name: "History"
					},
					keyframes: {
						name: "Keyframes"
					},
					metadata: {
						name: "Metadata"
					}
				},
				map: {
					name: "Map"
				},
				projects: {
					name: "Projects"
				},
				undo_redo: {
					name: "Undo/Redo",
					
					timelines: {
						name: "Timelines"
					}
				},
				about_confoederatio: {
					name: "About&nbsp;<b>Confoederatio</b>"
				}
			}
		}, { name: "Naissance HGIS" });
	}
};