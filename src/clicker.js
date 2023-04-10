AFRAME.registerComponent("clicker", {
    init: function() {
        this.el.addEventListener("click", e => {
            alert(`x ${this.el.object3D.position.x} y ${this.el.object3D.position.y} z ${this.el.object3D.position.z}`);
        });
    }
});
    
