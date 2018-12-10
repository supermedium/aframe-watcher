## aframe-watcher

Companion server to the A-Frame Inspector to sync changes back to HTML files.

Are you tired of switching back and forth between your text editor, the Inspector, and refreshing? Now you can save your changes from the Inspector directly to your HTML files. The Inspector has built-in support with a save button for the Watcher. Just make sure your entities have defined IDs.

### Usage

Install via npm:

```
npm install -g aframe-watcher
```

Then launch aframe-watcher in your project directory containing HTML files.

```
aframe-watcher
```

You can also specify which HTML files to watch.

```
aframe-watcher foo.html templates/*.html
```

Open the Inspector on an A-Frame scene with `ctrl + alt + i` (currently master or
0.9.0 version of Inspector):

```html
<a-scene inspector="url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js'>
```

Make changes and hit save:

![](https://user-images.githubusercontent.com/674727/49696477-fa525f00-fb5e-11e8-92e9-be0c9461f4ac.png)

Then accept the changes from the command line:

![](https://user-images.githubusercontent.com/674727/49696426-80ba7100-fb5e-11e8-93b5-6f79cafa6b5a.png)

The watcher will then modify your HTML files in place.

### Scope

Currently only handles entity updates that have defined IDs:

```
<a-entity id="updateMe"></a-entity>
```
