//Initialise functions
{
	if (!global.String) global.String = {};
	
	/**
	 * Edits a string by adding text to it.
	 * @alias String.editAddToString
	 * 
	 * @param {string} arg0_string - The original line to edit.
	 * @param {string} arg1_string - The line to add to the original.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.avoid_duplicates=true]
	 *  @param {boolean} [arg2_options.case_sensitive=false]
	 *  @param {string} [arg2_options.insert_at="append"] - Either 'append'/'prepend'.
	 *  @param {boolean} [arg2_options.insert_newline=true]
	 *  @param {string} [arg2_options.newline_character="<br>"]
	 *  @param {string} [arg2_options.search="substring"] - Either 'substring'/'whole_line'.
	 *  
	 * @returns {string}
	 */
	String.editAddToString = function (arg0_string, arg1_string, arg2_options) {
		//Convert from parameters
		let string = (arg0_string) ? arg0_string : "";
		let ot_string = (arg1_string) ? arg1_string : "";
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (options.avoid_duplicates === undefined) options.avoid_duplicates = true;
		if (options.case_sensitive === undefined) options.case_sensitive = false;
		if (options.insert_at === undefined) options.insert_at = "append";
		if (options.insert_newline === undefined) options.insert_newline = true;
		if (options.newline_character === undefined) options.newline_character = "<br>";
		if (options.search === undefined) options.search = "substring";
		
		//Declare local instance variables
		let do_not_insert = false;
		let newline = (options.insert_newline) ? options.newline_character : "";
		
		if (options.avoid_duplicates)
			if (options.search === "substring") {
				if (options.case_sensitive) {
					if (string.includes(ot_string)) do_not_insert = true;
				} else {
					if (string.trim().toLowerCase().includes(ot_string.trim().toLowerCase())) 
						do_not_insert = true;
				}
			} else if (options.search === "whole_line") {
				let all_lines = string.split(options.newline_character);
				
				for (let i = 0; i < all_lines.length; i++) {
					if (options.case_sensitive) {
						if (all_lines[i].trim() === ot_string.trim())
							do_not_insert = true;
					} else {
						if (String.equalsIgnoreCase(all_lines[i], ot_string, { trim: true }))
							do_not_insert = true;
					}
					if (do_not_insert) break;
				}
			}
		
		//Mutate string if do_not_insert check is false
		if (!do_not_insert) {
			if (options.insert_at === "append") string += `${newline}${ot_string}`;
			if (options.insert_at === "prepend") string = `${ot_string}${newline}${string}`;
		}
		
		//Return statement
		return string;
	};
	
	/**
	 * Edits a string by replacing text within it.
	 * @alias String.editReplaceInString
	 *
	 * @param {string} arg0_string - The original string to edit.
	 * @param {string} arg1_find_string - The string to look for.
	 * @param {string} arg2_replace_string - The string to replace the found occurrence with.
	 * @param {Object} [arg3_options]
	 *  @param {boolean} [arg3_options.case_sensitive=false]
	 *  @param {string} [arg3_options.newline_character="<br>"]
	 *  @param {boolean} [arg3_options.replace_all=false]
	 *  @param {string} [arg3_options.replace_order="first"] - Either 'first'/'last'-ordered.
	 *  @param {string} [arg3_options.search="substring"] - Either 'substring'/'whole_line'.
	 *
	 * @returns {string}
	 */
	String.editReplaceInString = function (arg0_string, arg1_find_string, arg2_replace_string, arg3_options) {
		//Convert from parameters
		let string = (arg0_string) ? arg0_string : "";
		let find_string = (arg1_find_string) ? arg1_find_string : "";
		let replace_string = (arg2_replace_string) ? arg2_replace_string : "";
		let options = (arg3_options) ? arg3_options : {};
		
		//Initialise options
		if (options.case_sensitive === undefined) options.case_sensitive = false;
		if (options.newline_character === undefined) options.newline_character = "<br>";
		if (options.replace_all === undefined) options.replace_all = (options.remove_all !== undefined) ? options.remove_all : false;
		if (options.replace_order === undefined) options.replace_order = (options.remove_order !== undefined) ? options.remove_order : "first";
		if (options.search === undefined) options.search = "substring";
		
		//Declare local instance variables
		let replaced_count = 0;
		
		if (options.search === "substring") {
			if (options.replace_all) {
				let flags = (options.case_sensitive) ? "g" : "gi";
				let regex = new RegExp(find_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), flags);
				
				string = string.replace(regex, replace_string);
			} else {
				let search_string = (options.case_sensitive) ? string :
					string.toLowerCase();
				let search_find_string = (options.case_sensitive) ? find_string :
					find_string.toLowerCase();
				
				let index = (options.replace_order === "first") ? search_string.indexOf(search_find_string) :
					search_string.lastIndexOf(search_find_string);
				
				if (index !== -1)
					string = string.substring(0, index) + replace_string + string.substring(index + find_string.length);
			}
		} else if (options.search === "whole_line") {
			let all_lines = string.split(options.newline_character);
			let result_lines = [];
			
			if (options.replace_order === "last" && !options.replace_all) {
				for (let i = all_lines.length - 1; i >= 0; i--) {
					let is_match = false;
					
					if (options.case_sensitive) {
						if (all_lines[i].trim() === find_string.trim())
							is_match = true;
					} else {
						if (String.equalsIgnoreCase(all_lines[i], find_string, { trim: true }))
							is_match = true;
					}
					
					if (is_match && replaced_count === 0) {
						result_lines.unshift(replace_string);
						replaced_count++;
					} else {
						result_lines.unshift(all_lines[i]);
					}
				}
			} else {
				for (let i = 0; i < all_lines.length; i++) {
					let is_match = false;
					
					if (options.case_sensitive) {
						if (all_lines[i].trim() === find_string.trim())
							is_match = true;
					} else {
						if (String.equalsIgnoreCase(all_lines[i], find_string, { trim: true }))
							is_match = true;
					}
					
					if (is_match && (options.replace_all || replaced_count === 0)) {
						result_lines.push(replace_string);
						replaced_count++;
					} else {
						result_lines.push(all_lines[i]);
					}
				}
			}
			
			string = result_lines.join(options.newline_character);
		}
		
		//Return statement
		return string;
	};
	
	/**
	 * Edits a string by removing text from it.
	 * @alias String.editRemoveFromString
	 *
	 * @param {string} arg0_string
	 * @param {string} arg1_string
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.case_sensitive=false]
	 *  @param {string} [arg2_options.newline_character="<br>"]
	 *  @param {boolean} [arg2_options.remove_all=false]
	 *  @param {string} [arg2_options.remove_order="first"] - Either 'first'/'last'-ordered.
	 *  @param {string} [arg2_options.search="substring"] - Either 'substring'/'whole_line'.
	 *
	 * @returns {string}
	 */
	String.editRemoveFromString = function (arg0_string, arg1_string, arg2_options) {
		return String.editReplaceInString(arg0_string, arg1_string, "", arg2_options);
	};
}