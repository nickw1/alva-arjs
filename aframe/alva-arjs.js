
import './alva-scene.js';
import './clicker.js';

AFRAME.registerComponent("alva-arjs", {
    init: function() {
        console.log('alva-arjs init()');
        let testEntitiesAdded = false;
        const camera = document.querySelector("[gps-new-camera]");
        camera.addEventListener("gps-camera-update-position", e => {
            if(!testEntitiesAdded) {
                alert(`Initial position: ${e.detail.position.longitude} ${e.detail.position.latitude}`);
                // Add four boxes to the north (red), south (yellow), west (blue)
                // and east (red) of the initial GPS position
                const properties = [{
                    color: 'red',
                    latDis: 0.0001,
                    lonDis: 0
                },{
                    color: 'yellow',
                    latDis: -0.0001,
                    lonDis: 0
                },{
                    color: 'blue',
                    latDis: 0,
                    lonDis: -0.0001
                },{
                    color: 'green',
                    latDis: 0,
                    lonDis: 0.0001
                }];
                for(const prop of properties) {
                    const entity = document.createElement("a-icosahedron");
                    entity.setAttribute("scale", {
                        x: 1, 
                        y: 1,
                        z: 1 
                    });
                    entity.setAttribute('material', { color: prop.color } );
                    entity.setAttribute('gps-new-entity-place', {
                        latitude: e.detail.position.latitude + prop.latDis,
                        longitude: e.detail.position.longitude + prop.lonDis
                    });
                    entity.setAttribute('clicker', { });                
                    document.querySelector("a-scene").appendChild(entity);
                }
                testEntitiesAdded = true;
                this.el.emit("all-objects-added", { });
            }
        });
    }
});
