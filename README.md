# standard-stingray-platform

Short version of the Simon task as described and tested in Burgoyne et al. ([2023](https://doi.org/10.1037/xge0001408), [OSF](https://osf.io/7q598/)). 

This JavaScript implementation (using the [jsPsych](https://www.jspsych.org/) library) is a fork from Liceralde & Burgoyne ([2023](https://github.com/vrtliceralde/squared_jspsych)) under CC BY NC SA 4.0. 

- Repo: <https://github.com/digital-wellbeing/standard-stingray-platform>
- Live task: <https://digital-wellbeing.github.io/standard-stingray-platform>
- Data output: <https://osf.io/pzjf4/>

The task runs in a browser, and saves data to the OSF using [DataPipe](https://pipe.jspsych.org/). This version is setup for Pureprofile; please use the `pureprofile_id` URL variable to indicate participants (e.g. `https://digital-wellbeing.github.io/standard-stingray-platform/index.html?pureprofile_id=participant_id_from_survey_platform`.)

Descriptions in Burgoyne et al. are slightly different from the implementation in the program available on the Engle Lab website, VL decided to stick to Burgoyne et al. description because it gave participants feedback at the end and provided reason for why the correct response was correct.

A 30-second practice block is given, followed by a 90-second main block. Participants are shown an arrow prompt at the left or right of the screen, and they have to click on the word that indicates the direction that the arrow prompt is pointing (not its location).

## Output

After the task, a .csv file is saved to OSF

The `.csv` file contains the following variables:

| Variable | Type | Description |
| -------- | ---- | ----------- |
| `rt`	| 		numeric | response time for each trial |
| `stimulus`	|		string | html-formatted stimulus that is drawn on participant's screen |
| `response`	|		numeric | indicator for which of the two buttons/choices the participant clicked on; `0`: left-hand choice, `1`: right-hand choice |
| `trial_type`	|		string | jsPsych plugin shown on the screen |
| `trial_index`	|		numeric | cumulative count of each plugin change shown to the participant |
| `time_elapsed`	|		numeric | system-recorded timestamp at the trial |
| `internal_node_id`	|	string | jsPsych-specific marker of the location of the current trial in the experiment sequence |
| `pid`	|		string | unique identifier for participant, collected at start-up |
| `task`	|			string | one of the three squared tasks; `stroop`, `flanker`, `simon` |
| `block_trial_count`	|	numeric | cumulative trial count within the practice and main blocks; refer to this variable for what counts as a "trial" in the task; `0`: the task timed out at that trial |
| `practice`	|		numeric | indicator for whether the trial was seen in the practice block; `0`: main block, `1`: practice block |
| `item`	|		numeric | identifier for the type of trial shown to the participant |
| `stim`	|			string | the string prompt shown to the participant |
| `resp1`	|			string | the string choice presented in the left-hand button |
| `resp2`	|			string | the string choice presented in the right-hand button |
| `correct_response`	|	numeric | indicator of whether the left-hand or right-hand button is the correct-response for the trial; `0`: left-hand choice, `1`: right-hand choice |
| `condition`	|		numeric | indicator of the type/condition of the trial; `1`: `FullyCongruent`, `2`: `StimCongruentRespIncongruent`, `3`: `StimIncongruentRespCongruent`, `4`: `FullyIncongruent` (see `Squared Attention Control Task Trial Types.xls` from Burgoyne et al.) |
| `accuracy`	|		numeric | indicator for whether the participant made the correct response for the trial; `0`: incorrect, `1`: correct
| `timeout`		|		numeric | indicator for whether the block timed out for that trial, if so, accuracy for that trial is *not* counted towards final score; `0`: block is ongoing, `1`: time for block ended during this trial |
| `score_after_trial`	|	numeric | cumulative score of participant. Following Burgoyne et al., participants get a point for each correct response and lose a point for each incorrect response. The participant's final score for the task is the `score_after_trial` value on the very last row |

The following variables are included in the output of the Squared tasks from the Engle Lab website and are thus also included in all the `.csv` files:

| Variable | Type | Description |
| -------- | ---- | ----------- |
| `score_final`	|		numeric | final score of the participant at the end of the main block |
| `meanrt_final`	|		numeric | mean RT of all the trials in the main block |
| `score_x`	|			numeric | score of the participant for condition `x` calculated as `correct` $-$ `incorrect` for trials in condition `x`, where `x` is: one of the following: `1`: `FullyCongruent`; `2`: `StimCongruentRespIncongruent`; `3`: `StimIncongruent`; `4`: `FullyIncongruent` |
| `meanrt_x`	|		numeric | mean RT of all trials for condition `x` (regardless of accuracy) |
| `location` |			string | the location on the screen where the arrow is shown; `left`, `right` |


## FAQs

1. ***The task is still accepting responses even if the time has run out. Why is that happening? Is that a problem?***

    This is due to the how the `endCurrentTimeline()` function in jsPsych works: when the current timeline is ended, the program also waits for the current trial to end before moving on to the next timeline. So hypothetically, a new trial can appear at 29.9 sec of the 30-sec practice block (i.e., just as the block is supposed to time out), and the program would wait for a response before moving on the next part of the program, making the practice block technically last for more than 30 sec. Apparently, in jsPsych v7.3.1, that's just how it is (or we haven't gotten a solution).

    To work around this glitch, we had implemented for the `timeout` variable to be updated from 0 to 1 when the time limit is hit, so that even when a response is technically accepted after the time limit, the associated `timeout` value for that "last" trial is 1 and these trials can filtered out before any analysis. Moreover, these timeout trials have been marked with a `block_trial_count` of 0 to further distinguish them from valid trials. Note that the final value of the `score_after_trial` variable is based on the final valid trial---it is not changed at the timeout trial, so you can take the final value as the participant's actual score for the task. All of the `score_x` and `meanrt_x` variables are also only based on the valid trials.

   Long story short, this shouldn't be a problem.

2. ***The output has blank rows every after response. What are those blank rows for?***

   The online implementations of the task record every single event that happens to the screen or internally. Those blank rows represent when feedback is shown to the participant (correct or incorrect) and thus no response is collected, leaving many of the variables blank. Those blank rows can be easily filtered out.

# Citation

Original article describing the short Stroop, Flanker, and Simon tasks:

```
@article{burgoyneNatureMeasurementAttention2023,
  title = {Nature and Measurement of Attention Control.},
  author = {Burgoyne, Alexander P. and Tsukahara, Jason S. and Mashburn, Cody A. and Pak, Richard and Engle, Randall W.},
  date = {2023-08},
  journaltitle = {Journal of Experimental Psychology: General},
  shortjournal = {Journal of Experimental Psychology: General},
  volume = {152},
  number = {8},
  pages = {2369--2402},
  issn = {1939-2222, 0096-3445},
  doi = {10.1037/xge0001408},
  url = {http://doi.apa.org/getdoi.cfm?doi=10.1037/xge0001408}
}
```

Original JavaScript implementation:

```
@misc{liceralde23squared,
  author = {Van Rynald T. Liceralde and Alexander P. Burgoyne},
  year = {2023},
  title = {Squared tasks of attention control for {jsPsych}},
  howpublished = {\url{https://doi.org/10.5281/zenodo.8313315}}
}
```

This fork:

Just link to the GitHub repo (<https://github.com/digital-wellbeing/standard-stingray-platform>).
