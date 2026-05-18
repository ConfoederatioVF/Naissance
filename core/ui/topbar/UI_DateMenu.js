global.UI_DateMenu = class extends ve.Class {
	// 1. Static property to track the active timer across all instances
	static logic_loop = null;
	
	constructor () {
		console.warn(`[WIP] - UI_DateMenu needs a revamp: add proper setDate() instead of main.date, end date doesn't work yet for timelapses.`);
		super();
		
		let navbar_el = document.querySelector(".ve.navbar");
		this.is_playing = false;
		this.tick_speed = 1000;
		// Initialize step as a default if not set
		this.time_step = { year: 1 };
		
		this.date = veDate(undefined, {
			name: " ",
			tooltip: "BC years are negative.",
			onuserchange: (v) => {
				if (this.is_playing) return;
				DALS.Timeline.parseAction({
					options: { name: "Set Date", key: "load_date" },
					value: [{ type: "global", set_date: v }, { type: "global", refresh_date: true }]
				});
				naissance.Mapmode.draw();
			}
		});
		
		this.time_controls = veRawInterface({
			play: veButton(() => {
				this.is_playing = true;
				this.playTimelapse();
			}, {
				name: "<icon>play_arrow</icon>",
				tooltip: "Play",
				limit: () => !this.is_playing
			}),
			pause: veButton(() => {
				this.is_playing = false;
				// Ensure the timer is killed immediately
				if (UI_DateMenu.logic_loop) clearTimeout(UI_DateMenu.logic_loop);
			}, {
				name: "<icon>pause</icon>",
				tooltip: "Pause",
				limit: () => this.is_playing
			}),
			settings: veButton(() => {
				if (this.time_controls_window) this.time_controls_window.close();
				this.time_controls_window = veWindow({
					start_date: veDate(this.start_date || structuredClone(main.date), {
						name: "Start Date",
						onuserchange: (v) => this.start_date = v
					}),
					end_date: veDate(this.end_date || structuredClone(main.date), {
						name: "End Date",
						onuserchange: (v) => this.end_date = v
					}),
					time_step: veDateLength(this.time_step, {
						name: "Time Step",
						onuserchange: (v) => this.time_step = v
					}),
					tick_speed: veNumber(this.tick_speed, {
						name: "Tick Speed (ms)",
						min: 0,
						onuserchange: (v) => this.tick_speed = v
					})
				}, { 
					can_rename: false, 
					name: "Time Controls", 
					width: "20rem" 
				});
			}, { name: "<icon>settings</icon>", tooltip: "Settings" }),
		});
		
		super.open("instance", {
			anchor: "top_right",
			attributes: {
				"data-do-not-toggle-ui": "true"
			},
			mode: "static_window",
			name: "Date",
			width: "24rem",
			x: 8,
			y: ((navbar_el) ? navbar_el.offsetHeight : 0) + 8
		});
	}
	
	//[QUARANTINE]
	playTimelapse () {
		// Clean up any existing system-wide loop
		if (UI_DateMenu.logic_loop) clearTimeout(UI_DateMenu.logic_loop);
		if (this.end_date === undefined) 
			this.end_date = Date.convertTimestampToDate(JSON.parse(JSON.stringify((main.date))));
		if (this.start_date === undefined) 
			this.start_date = Date.convertTimestampToDate(JSON.parse(JSON.stringify((main.date))));
		
		UI_DateMenu.setDate(this.start_date);
		const tick = () => {
			// Stop if this specific instance is no longer playing
			if (!this.is_playing) return;
			
			let next = { ...main.date };
			let step = this.time_step || { year: 1 };
			
			// 1. Apply increments
			next.minute = (next.minute || 0) + (step.minute || 0);
			next.hour = (next.hour || 0) + (step.hour || 0);
			next.day = (next.day || 1) + (step.day || 0);
			next.month = (next.month || 1) + (step.month || 0);
			next.year = (next.year || 0) + (step.year || 0);
			
			// 2. Normalise units
			if (next.minute >= 60) {
				next.hour += Math.floor(next.minute / 60);
				next.minute %= 60;
			}
			if (next.hour >= 24) {
				next.day += Math.floor(next.hour / 24);
				next.hour %= 24;
			}
			// Basic day-to-month normalisation (assuming 30 days for simplicity, 
			// or replace with a proper calendar check if needed)
			while (next.day > 30) {
				next.day -= 30;
				next.month += 1;
			}
			while (next.month > 12) {
				next.month -= 12;
				next.year += 1;
			}
			while (next.month < 1) {
				next.month += 12;
				next.year -= 1;
			}
			
			// 3. Robust Termination logic
			if (this.end_date) {
				const d1 = next;
				const d2 = this.end_date;
				
				// Cascading comparison from largest to smallest unit
				const isPast =
					d1.year > d2.year ||
					(d1.year === d2.year && (d1.month || 1) > (d2.month || 1)) ||
					(d1.year === d2.year &&
						(d1.month || 1) === (d2.month || 1) &&
						(d1.day || 1) > (d2.day || 1)) ||
					(d1.year === d2.year &&
						(d1.month || 1) === (d2.month || 1) &&
						(d1.day || 1) === (d2.day || 1) &&
						(d1.hour || 0) > (d2.hour || 0)) ||
					(d1.year === d2.year &&
						(d1.month || 1) === (d2.month || 1) &&
						(d1.day || 1) === (d2.day || 1) &&
						(d1.hour || 0) === (d2.hour || 0) &&
						(d1.minute || 0) > (d2.minute || 0));
				
				if (isPast) {
					this.is_playing = false;
					console.log(`Quit playing.`, this.start_date, this.end_date);
					return;
				}
			}
			
			// Update global state and UI
			UI_DateMenu.setDate(next);
			naissance.Geometry.instances.forEach((local_geometry) =>
				local_geometry.draw(),
			);
			
			// Schedule next tick
			UI_DateMenu.logic_loop = setTimeout(tick, this.tick_speed);
		};
		
		tick();
	}
	
	static setDate (arg0_date) {
		//Convert from parameters
		let date = (arg0_date !== undefined) ? arg0_date : main.interfaces.date_ui.date.v;
			date = Date.convertTimestampToDate(date);
		
		//Set date
		main.date = date;
		main.interfaces.date_ui.date.v = date;
		DALS.Timeline.parseAction({
			options: { name: "Refresh Date", key: "load_date" },
			value: [{ type: "global", refresh_date: true }]
		}, true);
	}
};