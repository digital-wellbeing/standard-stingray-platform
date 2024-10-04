// ATTENTION CONTROL SQUARED TASKS

///////////////////////////////////////////
// DEFINE TIMELINE AND GENERAL VARIABLES //
///////////////////////////////////////////

var jsPsych = initJsPsych({});

// Maybe choose a task
var task = jsPsych.data.getURLVariable("task");

// Exit URL
var base_exit_url = "https://oii.qualtrics.com/jfe/form/SV_2aBwbXdJE8EdDtI";

// Trials are run in the same order for all participants to minimize performance variation due to trial order
jsPsych.randomization.setSeed('squaredtasks');

// var main_duration = 90000; // duration of main task
var main_duration = 90000; // duration of main task
var debug = jsPsych.data.getURLVariable("debug");
if (debug) {
	main_duration = 3000;
}
var practice_duration = main_duration / 3; // duration of practice

// general variables for use throughout the experiment
var total_simon = 0; // track total Simon score
var block_trial_count = 0;
var practice = 1; // Indicator of whether the trials being shown belong to the practice phase
var timeout = 0; // Indicator whether trial was responded to when the task timed out
var timeleft; // Placeholder for the amount of time left for the block
var block_time_limit; // Placeholder for the time limit for the block
var end_timer; // Holder for timeout of task
var block_start; // Placeholder for time when block started
var stay = 1; // Indicator of whether participant has indicated that they still want to read the instructions

var items_simon = Array.from(Array(8).keys()); // Array from 0-7

// Function to countdown to 0
// setInterval is a built in function that calls the function in the first argument at the every time interval in ms specified in the second argument
function countdown(start, timelimit) {

	var timeleft_bar = document.getElementById("timeleft");
	var timeleft_width = (timelimit - (Date.now() - start)) * 100 / timelimit;
	timeleft_bar.style.width = timeleft_width + "%";

	function shorten_timebar() {
		if (timeleft_width <= 0) {
			clearInterval(update_timeleft)
		} else {
			timeleft_width -= 10 * 100 / timelimit // 10: time interval set in setInterval;
			timeleft_bar.style.width = timeleft_width + "%";
		}
	}

	var update_timeleft = setInterval(shorten_timebar, 10);
}

///////////////////////////////////////////
// INITIALIZE EXPERIMENT CONTEXT  /////////
///////////////////////////////////////////

// Initialize timeline
var timeline = [];

var enter_fullscreen = {
	type: jsPsychFullscreen,
	fullscreen_mode: true
}

// Participant id
var random_id = jsPsych.data.getURLVariable("random_id");
var pureprofile_id = jsPsych.data.getURLVariable("pureprofile_id");
jsPsych.data.addProperties({
	random_id: random_id,
	pureprofile_id: pureprofile_id
});

// update exit_url with parameters
const urlObj = new URL(base_exit_url, window.location.origin);
const params = new URLSearchParams();

if (typeof pureprofile_id !== 'undefined') {
    params.append('PUREPROFILE_ID', pureprofile_id);
}

if (typeof panel_wave !== 'undefined') {
    params.append('PANEL_WAVE', panel_wave);
}

// Set the search parameters
urlObj.search = params.toString();

// Get the full URL as a string
const fullExitUrl = urlObj.toString();
console.log('exit_url = ' + fullExitUrl);

var welcome = {
	type: jsPsychHtmlButtonResponse,
	stimulus: "<p style='font-size:25px;'><b>Arrows Task</b></p>" +
		"<p style='font-size:25px;'>Click on START to read the instructions.</p>",
	choices: ["START"]
}


// 3b & 3e
var threetwoone = {
	timeline: [{
		type: jsPsychHtmlKeyboardResponse,
		stimulus: function () {
			return "<div style='font-size: 10pt; display: flex; align-items: center;'>Time left<div id = 'countdownbar' style = 'margin: 0px 25px;'><div id = 'timeleft'></div></div><div style='align-self: baseline;'>Score<br><span style='font-size:27pt;'><b>0</b></span></div></div><div style='height: 89px;'></div>" +
				"<p style='font-size: 120pt; font-weight: 1000;'>" + jsPsych.timelineVariable("num") + "</p>"
		},
		choices: "NO_KEYS",
		trial_duration: 1000
	}],
	timeline_variables: [{ num: 3 }, { num: 2 }, { num: 1 }]
}


///////////////////////////////////////////////
///////////////// SIMON /////////////////////
///////////////////////////////////////////////

// 1. Create object that has all the possible stimuli for the task (stimuli_simon)
// 2. Create fixed random order of trials for practice and main phases of task (practice_simon, main_simon)
// 3. Create timeline objects
//		a. intro_simon timeline
//			a1. instructions_simon_1
//      	a2. prepare_practice_simon
//      b. threetwoone countdown
//		c. block_simon_practice -> practice trials
//      d. premain_simon timeline
//			d1. instructions_simon_2
//			d2. prepare_main_simon
//		e. threetwoone countdown
//		f. block_main_simon -> main task
//		g. conclusion_simon -> reports final score to participant

const rarr = "assets/rarr.PNG";
const larr = "assets/larr.PNG";

// 1. Create object that has all the possible stimuli for the task (stimuli_simon)
var stimuli_simon = [
	{ stim: larr, stimsign: "<", loc: "left", resp1: "LEFT", resp2: "RIGHT", correct_response: 0, condition: 1 },
	{ stim: rarr, stimsign: ">", loc: "right", resp1: "LEFT", resp2: "RIGHT", correct_response: 1, condition: 1 },
	{ stim: larr, stimsign: "<", loc: "left", resp1: "RIGHT", resp2: "LEFT", correct_response: 1, condition: 2 },
	{ stim: rarr, stimsign: ">", loc: "right", resp1: "RIGHT", resp2: "LEFT", correct_response: 0, condition: 2 },
	{ stim: larr, stimsign: "<", loc: "right", resp1: "LEFT", resp2: "RIGHT", correct_response: 0, condition: 3 },
	{ stim: rarr, stimsign: ">", loc: "left", resp1: "LEFT", resp2: "RIGHT", correct_response: 1, condition: 3 },
	{ stim: larr, stimsign: "<", loc: "right", resp1: "RIGHT", resp2: "LEFT", correct_response: 1, condition: 4 },
	{ stim: rarr, stimsign: ">", loc: "left", resp1: "RIGHT", resp2: "LEFT", correct_response: 0, condition: 4 }
]

// 2. Create fixed random order of trials for practice and main phases of task (practice_simon, main_simon)
var practice_simon = jsPsych.randomization.sampleWithReplacement(items_simon, 100);
var main_simon = jsPsych.randomization.sampleWithReplacement(items_simon, 500);

// 3a.1
var instructions_simon_1 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `<p style='font-size: 15pt; text-align: left;'>Arrows will appear below, on the right or the left. You must click the response option that<br>
				says which direction the arrow is pointing. We will begin with a practice round. You<br>
				will have 30 seconds to earn as many points as possible.</p>
				<div style='height: 100px;'></div>
				<span style='font-size: 9pt; text-align: left;'>ARROW IS POINTING LEFT</span><br>
				<span style='display: flex; justify-content: left;'><img src='` + larr + `' height='70'></span><p></p>
				<div style='height: 50px;'></div>
				<div><button class="choiceStyle" style="font-family: Open SANS; color: white; font-weight: 1000;"><div style="color: red; font-size: 34pt; font-weight: 200;">&#10008;</div>RIGHT<div style="font-size: 9pt; color: white; font-weight: normal;">WRONG ANSWER<br>(Meaning doesn't match direction of arrow)</div></button><div class="space"></div>
				<button class="choiceStyle" style="font-family: Open Sans; color: white; font-weight: 1000;"><div style="color: #1ED760; font-size: 34pt; font-weight: 200;">&#10004;</div>LEFT<div style="font-size: 9pt; color: white; font-weight: normal;">RIGHT ANSWER<br>(Meaning matches direction of arrow)</div></button></div>`,
	choices: ["Begin practice"],
	button_html: `<div style='height: 70px;'></div><button class="defaultButton">%choice%</button>`,
	on_finish: function (data) {
		data.task = "simon";
	}
}

// 3a.2
var prepare_practice_simon = {
	type: jsPsychHtmlButtonResponse,
	stimulus: "<div style='font-size: 10pt; display: flex; align-items: center;'>Time left<div id = 'countdownbar' style = 'margin: 0px 25px;'><div id = 'timeleft'></div></div><div style='align-self: baseline;'>Score<br><span style='font-size:27pt;'><b>" + total_simon + "</b></span></div></div><div style='height: 150px;'></div>" +
		"<p style='font-size: 54pt; font-weight: 1000; color: black;'>_</p>",
	choices: ["Review instructions again", "Start practice trials"],
	button_html: `<div style='height: 70px;'></div><button class="defaultButton">%choice%</button>`,
	on_finish: function (data) {
		stay = data.response == 0 ? 1 : 0;
		data.task = "simon";
		practice = 1;
	}
}

// 3a
var intro_simon = {
	timeline: [instructions_simon_1, prepare_practice_simon],
	on_timeline_start: function () {
		stay = 1;
		timeout = 0;
	},
	loop_function: function () {
		return stay;
	},
	on_timeline_end: function () {
		stay = 1;
	}
}

// 3d.1
var instructions_simon_2 = {
	type: jsPsychHtmlButtonResponse,
	stimulus: `<p style='font-size: 15pt; text-align: left;'>That's it for practice. Please review the instructions one last time. Arrows will appear<br>
				below on the right or the left. You must click the response option that says which<br>
				direction the arrow is pointing. You have 90 seconds to earn as many points as<br>
				possible.</p>
				<div style='height: 75px;'></div>
				<span style='font-size: 9pt; text-align: left;'>ARROW IS POINTING LEFT</span><br>
				<span style='display: flex; justify-content: left;'><img src='` + larr + `' height='70'></span><p></p>
				<div style='height: 50px;'></div>
				<div><button class="choiceStyle" style="font-family: Open SANS; color: white; font-weight: 1000;"><div style="color: red; font-size: 34pt; font-weight: 200;">&#10008;</div>RIGHT<div style="font-size: 9pt; color: white; font-weight: normal;">WRONG ANSWER<br>(Meaning doesn't match direction of arrow)</div></button><div class="space"></div>
				<button class="choiceStyle" style="font-family: Open Sans; color: white; font-weight: 1000;"><div style="color: #1ED760; font-size: 34pt; font-weight: 200;">&#10004;</div>LEFT<div style="font-size: 9pt; color: white; font-weight: normal;">RIGHT ANSWER<br>(Meaning matches direction of arrow)</div></button></div>`,
	choices: ["I understand"],
	button_html: `<div style='height: 70px;'></div><button class="defaultButton">%choice%</button>`,
	on_finish: function (data) {
		data.task = "simon";
	}
}

// 3d.2
var prepare_main_simon = {
	type: jsPsychHtmlButtonResponse,
	stimulus: "<div style='font-size: 10pt; display: flex; align-items: center;'>Time left<div id = 'countdownbar' style = 'margin: 0px 25px;'><div id = 'timeleft'></div></div><div style='align-self: baseline;'>Score<br><span style='font-size:27pt;'><b>" + total_simon + "</b></span></div></div><div style='height: 150px;'></div>" +
		"<p style='font-size: 54pt; font-weight: 1000; color: black;'>_</p>",
	choices: ["Review instructions again", "Start task"],
	button_html: `<div style='height: 70px;'></div><button class="defaultButton">%choice%</button>`,
	on_finish: function (data) {
		stay = data.response == 0 ? 1 : 0;
		data.task = "simon";
		practice = 0;
		clearTimeout(end_timer);
	}
}

// 3d
var premain_simon = {
	timeline: [instructions_simon_2, prepare_main_simon],
	on_timeline_start: function () {
		total_simon = 0;
		timeout = 0;
	},
	loop_function: function () {
		return stay;
	},
	on_timeline_end: function () {
		stay = 1;
	}
}

// Function to create display stimulus + countdown bar
var display_simon = function (stimulus) {
	var stim = stimuli_simon[stimulus].stim;
	var loc = stimuli_simon[stimulus].loc;

	return "<div style='font-size: 10pt; position: relative; left: 5%; display: flex; align-items: center;'>Time left<div id = 'countdownbar' style = 'margin: 0px 25px;'><div id = 'timeleft'></div></div><div style='align-self: baseline;'>Score<br><span style='font-size:27pt;'><b>" + total_simon + "</b></span></div></div><div style='height: 128px;'></div>" +
		"<span style='display: flex; justify-content: " + loc + ";'><img src='" + stim + "' height='70'></span><p></p>" +
		"<div style='height: 50px;'></div>"
}

// Function to create block of simon trials
// 		- simon: Array containing the indices of stimuli_simon to be referenced as nth trials for that block
var createSimonBlock = function (simon) {
	var trial_simon = {
		type: jsPsychHtmlButtonResponse,
		stimulus: function () { return display_simon(simon[block_trial_count]); },
		choices: function () { return [stimuli_simon[simon[block_trial_count]].resp1, stimuli_simon[simon[block_trial_count]].resp2]; },
		button_html: function () {
			var choice1 = '<button class="choiceStyle" style="font-family: Open Sans; font-weight: 1000; color: white;"><div style="color: black; font-size: 34pt; font-weight: 200;">_</div>%choice%</button>'
			var choice2 = '<button class="choiceStyle" style="font-family: Open Sans; font-weight: 1000; color: white;"><div style="color: black; font-size: 34pt; font-weight: 200;">_</div>%choice%</button>'

			return [choice1, choice2];
		},
		margin_horizontal: '53px',
		on_start: function () {
			// Set up timer if it's the first trial
			if (block_trial_count == 0) {
				block_time_limit = practice == 1 ? practice_duration : main_duration;
				block_start = Date.now();

				end_timer = setTimeout(function () {

					block_trial_count = 0;
					timeout = 1;

					// this function is all you need to end the current timeline
					jsPsych.endCurrentTimeline();

				}, block_time_limit);
			}
		},
		on_load: function () {
			countdown(block_start, block_time_limit);
		},
		on_finish: function (data) {
			data.block_trial_count = timeout == 1 ? block_trial_count : block_trial_count + 1;
			data.task = "simon";
			data.practice = practice;
			data.item = simon[block_trial_count];
			data.stim = stimuli_simon[simon[block_trial_count]].stimsign;
			data.location = stimuli_simon[simon[block_trial_count]].loc;
			data.resp1 = stimuli_simon[simon[block_trial_count]].resp1;
			data.resp2 = stimuli_simon[simon[block_trial_count]].resp2;
			data.correct_response = stimuli_simon[simon[block_trial_count]].correct_response;
			data.condition = stimuli_simon[simon[block_trial_count]].condition;
			data.accuracy = data.response == stimuli_simon[simon[block_trial_count]].correct_response ? 1 : 0;
			data.timeout = timeout;

			switch (timeout) {
				case 0:
					total_simon = data.accuracy == 1 ? total_simon + 1 : total_simon - 1;
					break;
				case 1:
					total_simon = total_simon;
					break;
			}

			data.score_after_trial = total_simon;
		}
	}

	var feedback_simon = {
		type: jsPsychHtmlButtonResponse,
		stimulus: function () { return display_simon(simon[block_trial_count]); },
		choices: function () { return [stimuli_simon[simon[block_trial_count]].resp1, stimuli_simon[simon[block_trial_count]].resp2]; },
		button_html: function () {
			var resp = jsPsych.data.get().last(1).values()[0].response;
			var correct_response = jsPsych.data.get().last(1).values()[0].correct_response;

			switch (resp) {
				case 0:
					var feedback1 = correct_response == 0 ? '<div style="color: #1ED760; font-size: 34pt; font-weight: 200;">&#10004;</div>' : '<div style="color: red; font-size: 34pt; font-weight: 200;">&#10008;</div>';
					var feedback2 = '<div style="color: black; font-size: 34pt; font-weight: 200;">_</div>';
					break;
				case 1:
					var feedback1 = '<div style="color: black; font-size: 34pt; font-weight: 200;">_</div>';
					var feedback2 = correct_response == 1 ? '<div style="color: #1ED760; font-size: 34pt; font-weight: 200;">&#10004;</div>' : '<div style="color: red; font-size: 34pt; font-weight: 200;">&#10008;</div>';
					break;
			}

			var choice1 = '<button class="choiceStyle" style="font-family: Open Sans; font-weight: 1000; color: white;">' + feedback1 + '%choice%</button>'
			var choice2 = '<button class="choiceStyle" style="font-family: Open Sans; font-weight: 1000; color: white;">' + feedback2 + '%choice%</button>'

			return [choice1, choice2];
		},
		margin_horizontal: '53px',
		on_start: function () {
			block_trial_count++
		},
		on_load: function () {
			countdown(block_start, block_time_limit);

		},
		trial_duration: 500,
		response_ends_trial: false
	}

	var block_simon = {
		timeline: [trial_simon, feedback_simon],
		loop_function: function () {
			return true;
		}
	}

	return block_simon;
}

// 3c & 3f
block_simon_practice = createSimonBlock(practice_simon);
block_simon_main = createSimonBlock(main_simon);

// 3g
var conclusion_simon = {
	type: jsPsychHtmlButtonResponse,
	stimulus: function () { return `<p>You earned a total of ` + total_simon + ` points for that task. Great job!</p><p>Click on NEXT to see all your scores.</p>`; },
	choices: ["NEXT"],
	button_html: `<div style='height: 70px;'></div><button class="defaultButton">%choice%</button>`,
	on_start: function () {
		// Calculate the following metrics separately for practice trials and main trials, filtering out the trial where the block timed out:
		//     - score_final: final score of the participant at the end of the block
		//	   - meanrt_final: mean RT of all trials across the block (regardless of accuracy)
		//     - score_x: score of the participant for x condition calculated as correct - incorrect for trials in x condition, where x is as follows:
		//			1. fully congruent
		//			2. stim congruent resp incongruent
		//			3. stim incongruent resp congruent
		//          4. fully incongruent
		//	   - meanrt_x: mean RT of all trials for x condition (regardless of accuracy)

		jsPsych.data.get().filter({ task: "simon", practice: 1 }).addToAll({
			score_final: jsPsych.data.get().filter({ task: "simon", practice: 1, timeout: 0 }).last(1).values()[0].score_after_trial,
			meanrt_final: jsPsych.data.get().filter({ task: "simon", practice: 1, timeout: 0 }).select("rt").mean(),
			score_1: jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 1, accuracy: 1, timeout: 0 }).select("accuracy").count() - jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 1, accuracy: 0, timeout: 0 }).select("accuracy").count(),
			meanrt_1: jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 1, timeout: 0 }).select("rt").mean(),
			score_2: jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 2, accuracy: 1, timeout: 0 }).select("accuracy").count() - jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 2, accuracy: 0, timeout: 0 }).select("accuracy").count(),
			meanrt_2: jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 2, timeout: 0 }).select("rt").mean(),
			score_3: jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 3, accuracy: 1, timeout: 0 }).select("accuracy").count() - jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 3, accuracy: 0, timeout: 0 }).select("accuracy").count(),
			meanrt_3: jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 3, timeout: 0 }).select("rt").mean(),
			score_4: jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 4, accuracy: 1, timeout: 0 }).select("accuracy").count() - jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 4, accuracy: 0, timeout: 0 }).select("accuracy").count(),
			meanrt_4: jsPsych.data.get().filter({ task: "simon", practice: 1, condition: 4, timeout: 0 }).select("rt").mean()
		})

		jsPsych.data.get().filter({ task: "simon", practice: 0 }).addToAll({
			score_final: jsPsych.data.get().filter({ task: "simon", practice: 0, timeout: 0 }).last(1).values()[0].score_after_trial,
			meanrt_final: jsPsych.data.get().filter({ task: "simon", practice: 0, timeout: 0 }).select("rt").mean(),
			score_1: jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 1, accuracy: 1, timeout: 0 }).select("accuracy").count() - jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 1, accuracy: 0, timeout: 0 }).select("accuracy").count(),
			meanrt_1: jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 1, timeout: 0 }).select("rt").mean(),
			score_2: jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 2, accuracy: 1, timeout: 0 }).select("accuracy").count() - jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 2, accuracy: 0, timeout: 0 }).select("accuracy").count(),
			meanrt_2: jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 2, timeout: 0 }).select("rt").mean(),
			score_3: jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 3, accuracy: 1, timeout: 0 }).select("accuracy").count() - jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 3, accuracy: 0, timeout: 0 }).select("accuracy").count(),
			meanrt_3: jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 3, timeout: 0 }).select("rt").mean(),
			score_4: jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 4, accuracy: 1, timeout: 0 }).select("accuracy").count() - jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 4, accuracy: 0, timeout: 0 }).select("accuracy").count(),
			meanrt_4: jsPsych.data.get().filter({ task: "simon", practice: 0, condition: 4, timeout: 0 }).select("rt").mean()
		})

		clearTimeout(end_timer);
	}
}

// Put timeline together
var simon_task = { timeline: [intro_simon, threetwoone, block_simon_practice, premain_simon, threetwoone, block_simon_main, conclusion_simon] };

/////////////////////////////////////////
// FINALIZE EXPERIMENT CONTEXT  /////////
/////////////////////////////////////////


// Ending screen
var conclusion = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: function () {
		return '<p style="font-size:25px;"> You earned ' + total_simon + ' points.<br>' +
			'<p style="font-size:25px;">You are now finished with the task.</p>' +
			'<p style="font-size:25px;"><b><a href=' + fullExitUrl + '>Click here to complete the survey.</a></b>.</p>'
	},
	choices: "NO_KEYS"
}

var exit_fullscreen = {
	type: jsPsychFullscreen,
	fullscreen_mode: false
}


// PUTTING IT ALL TOGETHER
var preload = {
	type: jsPsychPreload,
	images: [rarr, larr]
}

const now = new Date()
now_iso = now.toISOString()

const save_data_simon = {
	type: jsPsychPipe,
	action: "save",
	experiment_id: "Xm6F2aSsLHWI",
	filename: `simon-${random_id}-(${now_iso}).csv`,
	data_string: () => jsPsych.data.get().filter({ task: "simon" }).csv()
};

timeline.push(
	preload,
	welcome,
	enter_fullscreen
);

timeline.push(
	simon_task,
	save_data_simon
);

timeline.push(
	exit_fullscreen,
	conclusion
);

jsPsych.run(timeline);