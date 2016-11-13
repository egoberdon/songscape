#songscape.js

Built by dreamers for dreamers

##songscape.html

Load up songscape.html in a browser to start the fun!
Gain points with different point values to unlock different parts of the experience.

##Requirements
+ Python
+ Pip

##Entering the songscape
```bash
$ pip install Flask
$ export FLASK_APP=app
$ flask run
```

##Runtime Environment

Tested on Chrome

##Points
+ 5 Points - Song begins
+ 35 Points - Music starts
+ 65 Points - Movement starts
+ 100 Points - Faces implode

##GUI
+ cheat codes: type in cheat codes for surprises
+ song selector: select one of four sample songs
+ custom: load a custom song from your local directory
+ **NOTE** for song selector & custom, you must choose your song before it starts playing! songs will not change midway through to maintain the aesthetic

##User Controls

+ arrow key up makes sun/light move up
+ arrow key down makes sun/light move down
+ Mouse Click
  + on face - increases points by one
  + anywhere (including face) - generates a laser

##Commented Out Controls (Useful For Testing)
+ m - toggles movement
+ s - stops song
+ p - plays song **NOTE** songs cannot be restarted once they're stopped in the WebAudioAPI
+ c - toggles color
