//Initialise functions
{
	if (!global.String)
		/**
		 * The namespace for all UF/String utility functions, typically for static methods.
		 * 
		 * @namespace String
		 */
		global.String = {};
	
	/**
	 * Capitalises all the words in a string.
	 * @alias String.capitalise
	 * 
	 * @param {string} arg0_string
	 *
	 * @returns {string}
	 */
	String.capitalise = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Declare local instance variables
		let separate_words = string.split(" ");
		
		//Iterate over separate_words to capitalise them
		for (let i = 0; i < separate_words.length; i++) {
			separate_words[i] = separate_words[i].charAt(0).toUpperCase();
			separate_words[i].substring(1);
		}
		
		//Return statement
		return separate_words.join(" ");
	};
		
	/**
	 * Cleans an input object to be compatible with JSON.stringify().
	 * @alias String.cleanStringify
	 * 
	 * @param {Object} arg0_input_object
	 * 
	 * @returns {string}
	 */
	String.cleanStringify = function (arg0_input_object) {
		//Convert from parameters
		let input_object = arg0_input_object;
		
		//Copy without circular references
		if (input_object && typeof input_object == "object")
			input_object = copyWithoutCircularReferences([object], object);
		
		//Return statement
		return JSON.stringify(input_object);
		
		//Declare sub-function
		function copyWithoutCircularReferences (arg0_references, arg1_object) {
			//Convert from parameters
			let references = arg0_references;
			let object = arg1_object;
			
			//Declare local instance variables
			let clean_object = {};
			
			Object.keys(object).forEach(function (key) {
				let value = object[key];
				
				if (value && typeof value === 'object') {
					if (references.indexOf(value) < 0) {
						references.push(value);
						clean_object[key] = copyWithoutCircularReferences(references, value);
						references.pop();
					} else {
						clean_object[key] = '###_Circular_###';
					}
				} else if (typeof value !== 'function') {
					clean_object[key] = value;
				}
			});
			
			//Sub-return statement
			return clean_object;
		}
	};
	
	/**
	 * Compares two strings, ignoring their case. Returns a boolean.
	 * @alias String.equalsIgnoreCase
	 *
	 * @param {string} arg0_string - The string to compare with.
	 * @param {string} arg1_string - The other string to compare with.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.trim=false]
	 *
	 * @returns {boolean}
	 */
	String.equalsIgnoreCase = function (arg0_string, arg1_string, arg2_options) {
		//Convert from parameters
		let string = arg0_string;
		let ot_string = arg1_string;
		let options = (arg2_options) ? arg2_options : {};
		
		//Trim if available
		if (options.trim) {
			string = string.trim();
			ot_string = ot_string.trim();
		}
		
		//Return statement
		return (string.toLowerCase() === ot_string.toLowerCase());
	};
	
	/**
	 * Formalises a debug string into human-readable text. Returns a string.
	 * @alias String.formalise
	 *
	 * @returns {string}
	 */
	String.formalise = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Return statement
		return string.replace(/_/g, " ").replace(/(^\w{1})|(\s{1}\w{1})/g, (match) => match.toUpperCase());
	};
	
	/**
	 * Formats an array into a string.
	 * @alias String.formatArray
	 * 
	 * @param {Array} arg0_array
	 * 
	 * @returns {string}
	 */
	String.formatArray = function (arg0_array) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		
		//Declare local instance variables
		let name_string = "";
		
		//Modify ending
		if (array.length > 2) {
			array[array.length - 1] = `and ${array[array.length - 1]}`;
			name_string = array.join(", ");
		} else if (array.length === 2) {
			array[array.length - 1] = `and ${array[array.length - 1]}`;
			name_string = array.join(" ");
		} else {
			name_string = array[0];	
		}
		
		//Return statement
		return name_string;
	};
	
	/**
	 * Returns a human-readable version of a boolean.
	 * @alias String.formatBoolean
	 * 
	 * @param {boolean} arg0_input_boolean
	 * 
	 * @returns {string}
	 */
	String.formatBoolean = function (arg0_input_boolean) {
		//Convert from parameters
		let input_boolean = arg0_input_boolean;
		
		//Return statement
		return (input_boolean) ? `Yes` : `No`;
	};
	
	/**
	 * Formats a Date object into a default string.
	 * @alias String.formatDate
	 * 
	 * @param {Object} [arg0_date]
	 * 
	 * @returns {string}
	 */
	String.formatDate = function (arg0_date) {
		//Convert from parameters
		let date = (arg0_date) ? arg0_date : Date.getCurrentDate();
		if (typeof date === "number") date = Date.convertTimestampToDate(date);
		
		//Declare local instance variables
		let day_name = String.ordinalise(date.day);
		let minute_name =  date.minute.toString().padStart(2, "0");
		let month_name = Date.months[Object.keys(Date.months)[date.month - 1]].name;
		let hour_name = date.hour.toString().padStart(2, "0");
		
		//Return statement
		return `${day_name} ${month_name} ${Math.abs(date.year)}${(date.year >= 0) ? "AD" : "BC"} - ${hour_name}:${minute_name}`;
	};
	
	/**
	 * Formats a date length into a string given a number of seconds.
	 * @alias String.formatDateLength
	 * 
	 * @param {number} arg0_seconds
	 * 
	 * @returns {string}
	 */
	String.formatDateLength = function (arg0_seconds) {
		//Convert from parameters
		let seconds = Math.returnSafeNumber(arg0_seconds);
		
		//Declare local instance variables
		let days = Math.floor(seconds/86400);
			seconds %= 86400;
		let hours = Math.floor(seconds/3600);
			seconds %= 3600;
		let minutes = Math.floor(seconds/60);
			seconds %= 60;
		
		//Return statement
		return `${String.formatNumber(days)} day(s), ${String.formatNumber(hours)} hour(s), ${String.formatNumber(minutes)} minute(s), ${String.formatNumber(seconds)} second(s)`;
	};
	
	/**
	 * Formats an object as a given string.
	 * @alias String.formatObject
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {string}
	 */
	String.formatObject = function (arg0_object) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : {};
		
		//Internal guard clause if object is empty
		if (Object.keys(object).length === 0) return "None";
		
		//Declare local instance variables
		let string_array = [];
		
		//Iterate over object and parse it to a string
		Object.iterate(object, (local_key, local_value) => {
			if (typeof string_array === "object") {
				string_array.push(`${local_key}: ${JSON.stringify(local_value)}`);
			} else {
				string_array.push(`${local_key}: ${local_value.toString()}`);
			}
		});
		
		//Return statement
		return string_array.join(", ");
	};
	
	/**
	 * Formats a number based off of the selected locale, rounding it to the specified number of places.
	 * @alias String.formatNumber
	 * 
	 * @param {number} arg0_number
	 * @param {number} [arg1_places=0]
	 * 
	 * @returns {string}
	 */
	String.formatNumber = function (arg0_number, arg1_places) {
		//Convert from parameters
		let number = parseFloat(arg0_number);
		let places = Math.returnSafeNumber(arg1_places, 0);
		
		//Round to sigfigs first
		number = Math.roundNumber(number, places);
		
		//Return statement
		return new Intl.NumberFormat("de-DE").format(number);
	};
	
	/**
	 * Formats the type name of a given value based off its actual JS type.
	 * @alias String.formatTypeName
	 * 
	 * @param {any} arg0_value
	 * 
	 * @returns {string}
	 */
	String.formatTypeName = function (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : undefined;
		
		//Return statement; internal guard clauses
		if (value === null) return "null";
		if (Array.isArray(value)) return `Array(${value.length})`;
		if (typeof value === "function") {
			let function_string = value.toString();
			if (function_string.startsWith("class")) return "Class";
			if (function_string.startsWith("[native code]")) return "Native Function";
			return "Function";
		}
		if (value.constructor && value.constructor.name) return value.constructor.name;
		return typeof value;
	};
	
	/**
	 * Returns a string timestamp of a contemporary date.
	 * @alias String.prototype.getDate
	 *
	 * @param {string} arg0_string
	 *
	 * @returns {Date}
	 */
	String.getDate = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Return statement
		return Date.parse(string);
	};
	
	/**
	 * Fetches the amount of nesting embedded within the current string.
	 * @alias String.prototype.getNesting
	 *
	 * @param {string} arg0_string
	 *
	 * @returns {number}
	 */
	String.getNesting = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Declare local instance variables
		let first_character = "";
		let nesting = 0;
		let spaces_until_first_character = 0;
		
		//Iterate over string to count the number of spaces to the next character
		for (let i = 0; i < string.length; i++) {
			if (string[i] === " ") {
				spaces_until_first_character++;
			} else {
				if (first_character === "")
					first_character = string[i];
			}
			
			//Break once non-space is found
			if (first_character !== "") break;
		}
		
		if (first_character === "-")
			nesting = Math.ceil(spaces_until_first_character/2);
		
		//Return statement
		return nesting;
	};
	
	/**
	 * Returns spreadsheet formatted coords (i.e. 'A1', 'ZZ15') given a numeric coords pair (1-indexed).
	 * @alias String.getSpreadsheetCell
	 * 
	 * @param {number} arg0_x
	 * @param {number} arg1_y
	 * 
	 * @returns {string}
	 */
	String.getSpreadsheetCell = function (arg0_x, arg1_y) {
		//Convert from parameters
		let x_coord = Math.returnSafeNumber(arg0_x);
		let y_coord = Math.returnSafeNumber(arg1_y);
		
		//Declare local instance variables
		let column = String.getSpreadsheetColumn(x_coord);
		
		//Return statement
		return `${column}${y_coord}`;
	};
	
	/**
	 * Returns the spreadsheet column (i.e. 'A', 'ZZ') given an X coordinate number.
	 * @alias String.getSpreadsheetColumn
	 * 
	 * @param {number} arg0_x
	 * 
	 * @returns {string}
	 */
	String.getSpreadsheetColumn = function (arg0_x) {
		//Convert from parameters
		let x_coord = Math.returnSafeNumber(arg0_x);
		
		//Declare local instance variables
		let column = "";
		
		while (x_coord > 0) {
			x_coord--; //Spreadsheet is 1-based
			column = String.fromCharCode(65 + (x_coord % 26)) + column;
			x_coord = Math.floor(x_coord/26);
		}
		
		//Return statement
		return column;
	};
	
	/**
	 * Hashes a string for later checks whether a string is equivalent to another.
	 * @alias String.hash
	 * 
	 * @param {string} arg0_string
	 * 
	 * @returns {string}
	 */
	String.hash = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Declare local instance variables
		let hash = 0;
		
		for (let i = 0; i < string.length; i++) {
			let char = string.charCodeAt(i);
			
			//Set hash
			hash = (hash << 5) - hash + char;
			hash |= 0;
		}
		
		//Return statement
		return Math.abs(hash).toString(16);
	};
	
	/**
	 * Checks if the given link is that of a compatible image.
	 * @alias String.isImage
	 *
	 * @returns {boolean}
	 */
	String.isImage = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Return statement
		return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(string);
	};
	
	/**
	 * Checks whether a given string is loosely a valid URL.
	 * @alias String.isURL
	 *
	 * @returns {boolean}
	 */
	String.isURL = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Return statement
		try {
			new URL(string);
			return true;
		} catch (e) {
			return false;
		}
	};
	
	/**
	 * Ordinalises a given number and returns it as a string.
	 * @alias String.ordinalise
	 * 
	 * @param {number} arg0_number
	 * 
	 * @returns {string}
	 */
	String.ordinalise = function (arg0_number) {
		//Convert from parameters
		let number = Math.returnSafeNumber(arg0_number);
		
		//Declare local instance variables
		let negative_suffix = (number < 0) ? "-" : "";
			number = Math.abs(number);
		let n_a = number % 10, n_b = number % 100;
		
		//Return statement
		if (n_a === 1 && n_b !== 11)
			return `${negative_suffix}${number}st`;
		if (n_a === 2 && n_b !== 12)
			return `${negative_suffix}${number}nd`;
		if (n_a === 3 && n_b !== 13)
			return `${negative_suffix}${number}rd`;
		return `${negative_suffix}${number}th`;
	};
	
	/**
	 * Parses a European number string to a number.
	 * @alias String.parseEuropeanNumber
	 * 
	 * @param {string} arg0_string
	 *
	 * @returns {number|string}
	 */
	String.parseEuropeanNumber = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Guard clause if number is not a string
		if (typeof string !== "string") return string;
		
		//Remove all non-numeric characters except . and ,
		let normalised_input = string.trim().replace(/[^0-9.,-]/g, "");
		
		//Remove all dots (thousands separators)
		normalised_input = normalised_input.replace(/\./g, "");
		
		//Replace the last comma with a dot (decimal separator)
		let lastCommaIndex = normalised_input.lastIndexOf(",");
		if (lastCommaIndex !== -1) {
			normalised_input =
				normalised_input.substring(0, lastCommaIndex) +
				"." +
				normalised_input.substring(lastCommaIndex + 1);
		}
		
		//Return statement
		return parseFloat(normalised_input);
	};
	
	/**
	 * Parses a list into human-readable form.
	 * @alias String.parseList
	 * 
	 * @param {string[]} arg0_input_list
	 * 
	 * @returns {string}
	 */
	String.parseList = function (arg0_input_list) {
		//Convert from parameters
		let name_array = arg0_input_list;
		
		//Declare local instance variables
		let name_string = "";
		
		//Modify ending
		if (name_array.length > 2) {
			name_array[name_array.length - 1] = `and ${name_array[name_array.length-1]}`;
			name_string = name_array.join(", ");
		} else if (name_array.length === 2) {
			name_array[name_array.length - 1] = `and ${name_array[name_array.length-1]}`;
			name_string = name_array.join(" ");
		} else {
			name_string = name_array[0];
		}
		
		//Return statement
		return name_string;
	};
	
	/**
	 * Fetches the current ordinal present in a numeric string.
	 * @alias String.processOrdinal
	 *
	 * @returns {string}
	 */
	String.processOrdinal = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Declare local instance variables
		let current_string = string.toString().trim();
		let trim_patterns = [
			[/  /gm, " "],
			[" . ", ". "],
			[/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3}) [a-z]*/gm]
		];
		let alphabet = "abcdefghijklmnopqrstuvwxyz";
		for (let i = 0; i < alphabet.split("").length; i++) {
			trim_patterns.push([` ${alphabet.split("")[i]} `, `${alphabet.split("")[i]} `]);
		}
		
		//Trim out, well, trim patterns
		for (let i = 0; i < trim_patterns.length; i++)
			if (trim_patterns[i].length > 1) {
				current_string = current_string.replace(trim_patterns[i][0], trim_patterns[i][1]);
			} else {
				let current_roman_array = current_string.match(trim_patterns[i][0]);
				if (current_roman_array !== null) {
					current_string = current_string.replace(current_roman_array[0], current_roman_array[0].split(" ").join(" "));
				}
			}
		
		//Return statement
		return current_string;
	};
	
	/**
	 * Truncates a string to a given length, appending the ellipsis afterwards.
	 * @alias String.truncate
	 *
	 * @param {string} arg0_string
	 * @param {number} arg1_number
	 * @param {string} [arg2_ellipsis=" ..."]
	 *
	 * @returns {string}
	 */
	String.truncate = function (arg0_string, arg1_number, arg2_ellipsis) {
		//Convert from parameters
		let string = arg0_string;
		let number = Math.returnSafeNumber(arg1_number, 120);
		let ellipsis = (arg2_ellipsis) ? arg2_ellipsis : " ...";
		
		//Return statement
		if (string.length > number)
			return `${string.substring(0, number)}${ellipsis}`;
		return string;
	};
}