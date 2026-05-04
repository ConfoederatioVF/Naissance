//Import modules
global.child_process = require("child_process");
global.cubic_spline = require("cubic-spline");
global.electron = require("electron");
global.exec = require("child_process").exec;
global.fs = require("fs");
global.JSDOM = require("jsdom").JSDOM;
global.JSON5 = require("json5");
global.mathjs = require("mathjs");
global.ml_matrix = require("ml-matrix");
global.net = require("net");
global.netcdfjs = require("netcdfjs");
global.path = require("path");
global.pngjs = require("pngjs");
global.polylabel = require("polylabel");
global.puppeteer = require("puppeteer");
global.util = require("util");

global.h1 = "./histmap/1.data_scraping/";
global.h2 = "./histmap/2.data_cleaning/";
global.h3 = "./histmap/3.data_merging/";
global.h4 = "./histmap/4.data_processing/";
global.h5 = "./histmap/5.data_post_processing/";
global.h6 = "./histmap/6.data_visualisation/";

global.l1d = "./livemap/1.workers/dashboard/";
global.l1e = "./livemap/1.workers/types/economics/";
global.l1m = "./livemap/1.workers/types/military/";
global.l1p = "./livemap/1.workers/types/politics/";
global.l2 = "./livemap/2.ontology/";
global.l3e = "./livemap/3.models/economics/";
global.l3m = "./livemap/3.models/military/";
global.l3p = "./livemap/3.models/politics/";
global.l4e = "./livemap/4.view/economics/";
global.l4m = "./livemap/4.view/military/";
global.l4p = "./livemap/4.view/politics/";

//Initialise functions
{
  global.initialiseGlobal = function () {
		//KEEP AT TOP! Make sure file paths exist
		{
			if (!fs.existsSync("./saves/")) fs.mkdirSync("./saves/");
			loadSettings();
		}
		
		//Initialise global.scene
		global.scene = new ve.Scene({
			map_component: new ve.Map()
		});
			global.map = scene.map_component.map;
		
    //Declare global variables
		global.main_navbar = new UI_Navbar();
    global.main = {
			date: Date.getCurrentDate(),
			hierarchy: {},
			interfaces: {
				//Leftbar
				leftbar_ui: new UI_Leftbar(),
				
				//Rightbar
				edit_brush_keyframes: new UI_BrushKeyframes(),
				edit_geometry_label: new UI_EditGeometryLabel(),
				edit_geometry_line: new UI_EditGeometryLine(),
				edit_geometry_point: new UI_EditGeometryPoint(),
				edit_geometry_polygon: new UI_EditGeometryPolygon(),
				edit_selected_geometries_ui: new UI_EditSelectedGeometries(),
				mapmodes_ui: new UI_Mapmodes(),
				
				//Topbar
				date_ui: new UI_DateMenu(),
				navbar: global.main_navbar,
			},
			_layers: { //Layers which are not appended to the map but kept internally
				province_layers: [], //Array of all current naissance.Layers that are flagged as 'provinces'
				provinces: new maptalks.VectorLayer("province_layer", [], { hitDetect: true, interactive: false }) 
			},
			layers: {
				//Foreground layers
				overlay_layer: new maptalks.VectorLayer("overlay_layer", [], { hitDetect: true, interactive: true, zIndex: 10001 }),
				cursor_layer: new maptalks.VectorLayer("cursor_layer", [], { hitDetect: false, interactive: false, zIndex: 10000 }),
				
				//Background layers
				label_layer: new maptalks.VectorLayer("label_layer", [], { hitDetect: false, interactive: false, zIndex: 6 }),
				selection_layer: new maptalks.VectorLayer("selection_layer", [], { hitDetect: false, interactive: false, zIndex: 5 }),
				entity_layer: new maptalks.VectorLayer("entity_layer", [], {
					hitDetect: true,
					interactive: true,
					zIndex: 3
				}),
				group_tile_layers: new maptalks.GroupTileLayer("group_tile_layers", [], { zIndex: -10000 }) //Tile layers must be at bottom
			},
			map: map,
			renderer: new naissance.Renderer(map),
			settings: {},
			user: {
				_mapmodes: {},
				mapmodes: []
			}
    };
		
		if (!global.naissance) global.naissance = {};
			main.map.settings = {
				autoload_last_date: true
			};
			UI_Settings.loadSettings();
			main.user.brush = new naissance.Brush();
		
		//1.1. Append all layers to map
		Object.iterate(main.layers, (local_key, local_value) => local_value.addTo(map));
		
		//1.2. Add event handlers to map
		//mousedown
		let mousedown_dictionary = ["left_click", "middle_click", "right_click"];
		map.on("mousedown", (e) => {
			for (let i = 0; i < mousedown_dictionary.length; i++)
				delete HTML[mousedown_dictionary[i]];
			HTML[mousedown_dictionary[e.domEvent.which - 1]] = true;
		});
		
		//mouseup
		map.on("mouseup", (e) => {
			for (let i = 0; i < mousedown_dictionary.length; i++)
				delete HTML[mousedown_dictionary[i]];
		});
		
		//2. Set aliases
		main.brush = main.user.brush;
  };
	
	global.loadSettings = function () {
		//Try to read from svea_settings.json if possible
		if (fs.existsSync("svea_settings.json")) {
			global.svea_settings = JSON.parse(fs.readFileSync("svea_settings.json", "utf8"));
		} else {
			console.warn(`svea_settings.json is not defined. API secrets and processes will not be processed.`);
		}
	};

  function trackPerformance () {
    //Declare local instance variables
		let { ipcRenderer } = require('electron');
    let frame_count = 0;
		let last_time = performance.now();

		//Track FPS
    function trackFPS() {
      frame_count++;
			let now = performance.now();

      //Report back to the main process once per second
      if (now - last_time >= 1000) {
        ipcRenderer.send('update-fps', frame_count);
        frame_count = 0;
        last_time = now;
      }

      //Keep the loop going
      requestAnimationFrame(trackFPS);
    }

    //Start the counter
    trackFPS();
  }
}

//Startup process
{
	global.is_naissance = true;
	ve.start({
		//Accepts wildcards (*), exclusionary patterns (!), and folders/file paths
		load_files: [
			"common",
			"!core/startup.js",
			"!core/archives",
			"core",
			"core/framework/brush",
			"core/framework/actions",
			"histmap",
			"livemap"
		],
		special_function: function () {
			try {
				initialiseGlobal();	
			} catch (e) {
				console.error(e);
			}	
		}
	});

  trackPerformance();
}