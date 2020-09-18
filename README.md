SBVAdjust

First version:
Python program for adjusting Youtube subtitles to a text file.

**Inputs:**
- subtitles downloaded from the youtube video (sbv format)
- text files containing the text content for the video

**Result:**
- new subtitle file (sbv format), with adjusted text content matched to the input text content
- corrections.txt file containing the fixes made in the subtitles

Second version:
Doing the same, without the corrections collected, but in a browser, and the language is Javascript.
Start with opening the SBVAdjust.html file.

Also contains the script cutter functionality, this cuts the original script into caption blocks. Later I plan to make it possible to adjust the timing of these blocks, by using the original YT video showing on the page, and the YT API.
