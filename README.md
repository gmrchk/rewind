# Rewind
Draggable controls for HTML5 videos. 

## Usage
Include Rewind source in the html file. 
```html
<script src="./dist/Rewind.js"></script>
```

Initialize Rewind with element. Some options/handlers are available.
```javascript
const videoElement = document.getElementById('video');
const rewind = new Rewind(videoElement, {
    // handlers
    onTimeChange: ({time}) => {
        // is trigger on mouse up after drag (time is in seconds)
    },
    onPreviewTimeChange: ({time}) => {
        // is trigger on mouse move (left/right) when mouse is pressed (time is in seconds)
    },
    onVolumeChange: ({volume}) => {
        // is trigger on mouse move (up/down) when mouse is pressed (volume 0 - 100)
    },
    onClick: (isAdjusting) => {
        // called on click of video element
        // isAjusting defines whether user was dragging the mouse, or it is just a click 
    },
    
    // values
    timeSpeed: 0.04, // multiplier for time changes
    volumeSpeed: 1, // multiplier for time changes
    
    // styles
    font: 'Arial',
    fontSize: 11,
    mainColor: '#E50914',
    secondaryColor: '#ffffff',
    simpleLine: false, // instead of the streching effect
});
```

## License 
### Commercial license
If you want to use Rewind or any parts of it to develop commercial sites, themes, projects, and applications, contact [gmarcuk@gmail.com](mailto:gmarcuk@gmail.com) for license.

### Open source license
If you are creating an open source application under a license compatible with the [GNU GPL license v3](https://www.gnu.org/licenses/gpl-3.0.html), you may use Rewind under the terms of the GPLv3.

