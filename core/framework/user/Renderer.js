if (!global.naissance) global.naissance = {};
naissance.Renderer = class extends ve.Class {
	constructor () {
		super();
		
		this.handleEvents();
	}
	
	handleEvents () {
		map.on("zoomend", () => {
			//Call this.update() in the correct order
			this.update();
		});
	}
	
	/**
	 * Returns the ordered z-indexes of all Geometries within each Feature based on {@link UI_LeftbarHierarchy}.
	 */
	getRenderingOrder (arg0_entity_obj) { //[WIP] - Finish function body
		//Convert from parameters
		let entity_obj = (arg0_entity_obj) ? arg0_entity_obj : undefined;
		
		//Declare local instance variables
		let rendering_order = [];
		
		//1. Base Hierarchy handling
		if (!entity_obj) {
			//Iterate over all naissance.Feature.instances
			for (let i = 0; i < naissance.Feature.instances.length; i++) {
				let local_feature = naissance.Feature.instances[i];
				
				if (!local_feature.parent)
					rendering_order.push(local_feature);
				rendering_order = rendering_order.concat(this.getRenderingOrder(local_feature));
			}
			
			//Iterate over all naissance.Geometry.instances
			for (let i = 0; i < naissance.Geometry.instances.length; i++) {
				let local_geometry = naissance.Geometry.instances[i];
				
				if (!local_geometry.parent)
					rendering_order.push(local_geometry);
			}
		}
		//2. naissance.Feature handling
		else {
			//(Real Groups) naissance.Group, naissance.Layer handling
			if (entity_obj.entities) {
				for (let i = 0; i < entity_obj.entities.length; i++) {
					let local_entity = entity_obj.entities[i];
					
					rendering_order.push(local_entity);
					if (local_entity.entities || local_entity._entities)
						rendering_order = rendering_order.concat(this.getRenderingOrder(local_entity));
				}
			}
			//(Pseudo-Groups) naissance.SketchMap handling
			else if (entity_obj._entities) {
				for (let i = 0; i < entity_obj._entities.length; i++) {
					let local_geometry = entity_obj._entities[i];
					
					rendering_order.push(local_geometry);
				}
			}
		}
		
		//Return statement
		return rendering_order;
	}
	
	/**
	 * Draws all Features/Geometries in order by calling their draw function.
	 */
	update () {
		//Declare local instance variables
		let current_z_index = 0;
		let rendering_order = this.getRenderingOrder();
		
		//Iterate over all entities in rendering order in reverse
		for (let i = rendering_order.length - 1; i >= 0; i--)
			if (rendering_order[i].draw)
				rendering_order[i].draw();
	}
	
	static toggleUI () {
		let all_interface_els = document.querySelectorAll(`#ve-overlay > .ve`);
		naissance.Renderer.hide_ui = (!naissance.Renderer.hide_ui);
		
		if (naissance.Renderer.hide_ui) {
			for (let i = 0; i < all_interface_els.length; i++) {
				if (all_interface_els[i].getAttribute("data-do-not-toggle-ui")) continue;
				let local_display = all_interface_els[i].style.display;
				
				if (local_display !== "")
					all_interface_els[i].setAttribute("data-display", JSON.parse(JSON.stringify(all_interface_els[i].style.display)));
				all_interface_els[i].style.display = "none";
			}
		} else {
			for (let i = 0; i < all_interface_els.length; i++) {
				let local_data_display = all_interface_els[i].getAttribute("data-display");
				
				all_interface_els[i].style.display = (local_data_display) ? local_data_display : "";
				all_interface_els[i].removeAttribute("data-display");
			}
		}
	}
};