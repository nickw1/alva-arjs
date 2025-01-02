// Intended to get an idea of the nature of the Alva coord system
// Five boxes are created in different colours, one at the origin and four
// two units along -/+ z and -/+ x.
import './alva-scene.js';
import './clicker.js';

AFRAME.registerComponent("alva-basic", {
    init: function() {
            console.log('alva-basic init');
            const properties = [{
                color: 'white',
                x: 0,
                y: 0, 
                z: 0
            }, {
                color: 'red',
                x: 0,
                y: 0,
                z: -2
            },{
                color: 'yellow',
                x: 0,
                y: 0,
                z: 2
            },{
                color: 'blue',
                x: -2,
                y: 0,
                z: 0
            },{
                color: 'green',
                x: 2,
                y: 0,
                z: 0
            }];
            for(const prop of properties) {
                const entity = document.createElement("a-icosahedron");
                entity.setAttribute("scale", {
                    x: 1, 
                    y: 1,
                    z: 1 
                });
                entity.setAttribute('material', { color: prop.color } );
                entity.setAttribute('position', {
                    x: prop.x,
                    y: prop.y,
                    z: prop.z
                });
                entity.setAttribute('clicker', { });                
                document.querySelector("a-scene").appendChild(entity);
            }
            this.el.emit("all-objects-added", { });
    }
});
