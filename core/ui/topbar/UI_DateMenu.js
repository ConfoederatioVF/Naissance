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
			binding: "main.date",
			name: " ",
			tooltip: "BC are negative.",
			onprogramchange: (v) => {
				console.log("onprogramchange");
				if (this.is_playing) return;
				DALS.Timeline.parseAction({
					options: { name: "Refresh Date", key: "load_date" },
					value: [{ type: "global", refresh_date: true }]
				}, true);
			},
			onuserchange: (v) => {
				console.log("onuserchange");
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
					start_date: veDate(this.start_date || main.date, {
						name: "Start Date",
						onuserchange: (v) => this.start_date = v
					}),
					end_date: veDate(this.end_date || main.date, {
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
				}, { name: "Time Controls", width: "20rem" });
			}, { name: "<icon>settings</icon>", tooltip: "Settings" }),
		});
		
		super.open("instance", {
			anchor: "top_right",
			mode: "static_window",
			name: "Date",
			width: "24rem",
			x: 8,
			y: ((navbar_el) ? navbar_el.offsetHeight : 0) + 8
		});
	}
	
	playTimelapse () {
		// Clean up any existing system-wide loop
		if (UI_DateMenu.logic_loop) clearTimeout(UI_DateMenu.logic_loop);
		
		const tick = () => {
			// Stop if this specific instance is no longer playing
			if (!this.is_playing) return;
			
			let next = { ...main.date };
			let step = this.time_step || { year: 1 };
			
			// Apply increments
			next.minute = (next.minute || 0) + (step.minute || 0);
			next.hour = (next.hour || 0) + (step.hour || 0);
			next.day = (next.day || 1) + (step.day || 0);
			next.month = (next.month || 1) + (step.month || 0);
			next.year = (next.year || 0) + (step.year || 0);
			
			// Normalize BC and Overflows
			if (next.minute >= 60) { next.hour += Math.floor(next.minute / 60); next.minute %= 60; }
			if (next.hour >= 24) { next.day += Math.floor(next.hour / 24); next.hour %= 24; }
			while (next.month > 12) { next.month -= 12; next.year += 1; }
			while (next.month < 1) { next.month += 12; next.year -= 1; }
			
			// Termination logic
			if (this.end_date) {
				const isPast = next.year > this.end_date.year ||
					(next.year === this.end_date.year && next.month > (this.end_date.month || 1));
				if (isPast) {
					this.is_playing = false;
					return;
				}
			}
			
			// Update global state
			main.date = next;
			naissance.Geometry.instances.forEach((local_geometry) => local_geometry.draw());
			
			// Schedule next tick using current tick_speed
			UI_DateMenu.logic_loop = setTimeout(tick, this.tick_speed);
		};
		
		tick();
	}
};