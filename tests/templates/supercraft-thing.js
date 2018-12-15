/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * supercraft-thing component for A-Frame.
 */
AFRAME.registerComponent('supercraft-thing', {
  dependencies: ['position'],

  schema: {
    from: {default: '', type: 'selector'},
    name: {default: '', type: 'string'},
    resetOrigin: {default: true},
    ignorePosition: {default: false},
    debug: {default: false}
  },

  init: function () {
    var el = this.el;
    this.data.from.addEventListener('supercraftloaderloaded', evt => {
      var objEl;
      var obj;
      var bb;
      var center;

      objEl = evt.target.querySelector('#' + this.data.name);
      if (!objEl) {
        throw `Thing ${this.data.name} not found.`
      }
      obj = objEl.object3D.clone();
      obj.visible = true;

      if (this.data.resetOrigin) {
        obj.updateMatrix();

        // Apply object3D matrix and recenter.
        bb = new THREE.Box3().setFromObject(obj);
        center = new THREE.Vector3();
        bb.getCenter(center);
        obj.traverseVisible( o => {
          if (o.type == 'Mesh') {
            o.geometry.applyMatrix(obj.matrix);
            o.geometry.translate(-center.x, -center.y, -center.z);
          }
        });

        if (this.data.ignorePosition) {
          obj.position.set(0, 0, 0);
        } else {
          // Reset object3D transforms.
          obj.position.copy(this.el.object3D.position);
          // Move entity to original thing position.
          this.el.object3D.position.copy(center);
        }

        obj.rotation.set(0, 0, 0);
        obj.scale.set(1, 1, 1);
        obj.updateMatrix();
      }

      if (this.data.debug) {
        bb = new THREE.Box3().setFromObject(obj);
        var helper = new THREE.Box3Helper( bb, 0xffff00 );
        this.el.setObject3D('debug', helper);
        helper.visible = this.data.debug;
      }
      el.setObject3D('mesh', obj);
      el.emit('supercraftthingloaded');
    });
  }
});
