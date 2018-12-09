## aframe-watcher

Companion server to o A-Frame Inspector to sync changes back to HTML files.

### Usage

Install via npm:

```
npm install -g aframe-watcher
```

Then specify HTML files to watch in your project:

```
aframe-watcher *.html
```

Open the Inspector (currently master or 0.9.0 version of Inspector). Make
changes and hit save:

![](https://user-images.githubusercontent.com/674727/49696477-fa525f00-fb5e-11e8-92e9-be0c9461f4ac.png)

Then accept the changes from the command line:

![](https://user-images.githubusercontent.com/674727/49696426-80ba7100-fb5e-11e8-93b5-6f79cafa6b5a.png)

The watcher will then modify your HTML files in place.

### Scope

Currently only handles entity updates that have defined IDs:

```
<a-entity id="updateMe"></a-entity>
```
