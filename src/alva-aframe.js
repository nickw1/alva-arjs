// NOTICE: Contains code developed by Alan Ross as part of the AlvaAR
// demos, specifically the camera example at:
//
// https://github.com/alanross/AlvaAR/blob/main/examples/public/camera.html

import { AlvaAR } from '../public/assets/alva_ar.js';
import { AlvaARConnectorTHREE } from '../public/assets/alva_ar_three.js';

AFRAME.registerComponent("alva-test", {
    schema: {
        x: {
            type: "number",
            default: 0
        },
        y: {
            type: "number",
            default: 0
        },
        z: {
            type: "number",
            default: -1,
        },
        scale: {
            type: "number",
            default: 0.1
        }
    },

    init: async function() {
        this.videoCanvas = document.createElement('canvas');
        this.videoCanvas.setAttribute('id', 'alvaVideoCanvas');
        this.videoCanvas.width = parseInt(this.el.sceneEl.canvas.width);
        this.videoCanvas.height = parseInt(this.el.sceneEl.canvas.height);
        this.videoCanvas.style.display = 'block';
        this.el.sceneEl.appendChild(this.videoCanvas);
        console.log(`Initialising alva with dimensions ${this.videoCanvas.width} ${this.videoCanvas.height}`);
        this.alva = await AlvaAR.Initialize(this.videoCanvas.width, this.videoCanvas.height);
        this.ctx = this.videoCanvas.getContext('2d');

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',    
                width:  this.videoCanvas.width,
                height: this.videoCanvas.height
            }
        }).then(stream => {
            this.video = document.createElement('video');
            this.video.style.display = 'none';
            document.body.appendChild(this.video);
            this.video.srcObject = stream;
            this.video.onloadedmetadata = async() => {
                console.log(`video width and height: ${this.video.videoWidth} ${this.video.videoHeight} aframe canvas w/h ${this.el.sceneEl.canvas.width} ${this.el.sceneEl.canvas.height}`);
                this.video.width = this.video.videoWidth;
                this.video.height = this.video.videoHeight;
                // not sure why this is needed as the video is invisible
                // it's taken from the Alva example
                this.video.style.width = this.video.videoWidth+'px';
                this.video.style.height = this.video.videoHeight+'px';
                console.log(`Initialising alva with dimensions ${this.videoCanvas.width} ${this.videoCanvas.height}`);

                this.drawRect = this._resizeToCover(this.video.videoWidth, this.video.videoHeight, this.videoCanvas.width, this.videoCanvas.height);
                console.log(this.drawRect);
            };
            this.video.play();
        });
            
        
        this.applyPose = AlvaARConnectorTHREE.Initialize(THREE);

        this.el.sceneEl.camera.rotation.reorder('YXZ');
        this.el.sceneEl.camera.updateProjectionMatrix();

        this.object = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1,0),
            new THREE.MeshNormalMaterial({
                flatShading: true
            })
        );
        this.object.position.set(this.data.x, this.data.y, this.data.z);
        this.object.scale.set(this.data.scale, this.data.scale, this.data.scale);
        this.object.visible = false;

        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(100,100,100,4,4,4), 
            new THREE.MeshBasicMaterial({
                color: 0xff00ff,
                transparent: true,
                depthTest: true,
                wireframe: true,
                opacity: 0
            })
        );
        this.box.visible = false;

        this.el.sceneEl.object3D.add(this.object);
        this.el.sceneEl.object3D.add(this.box);
    },

    tick: function() {

        if(this.video && this.drawRect) {

//            this.ctx.drawImage(this.video, 0, 0, this.videoCanvas.width, this.videoCanvas.height);
            this.ctx.drawImage(this.video, 0, 0, this.videoCanvas.width, this.videoCanvas.height, this.drawRect.x, this.drawRect.y, this.drawRect.w, this.drawRect.h);
            const frame = this.ctx.getImageData(0, 0, this.videoCanvas.width, this.videoCanvas.height);
            const pose = this.alva.findCameraPose(frame);
            if(pose) {
                console.log('Updating pose');
                this._updateCameraPose(pose);
            } else {
                console.log('Lost camera');
                this._lostCamera();
                const dots = this.alva.getFramePoints();
                this.ctx.fillStyle = 'white';
                for(const p of dots) {
                    this.ctx.fillRect(p.x, p.y, 2, 2);
                }
            }
        }    
    },

    _updateCameraPose: function(pose) {
        this.applyPose(pose, this.el.sceneEl.camera.quaternion, this.el.sceneEl.camera.position);
        this.object.visible = true;
        this.box.visible = true;
    },

    _lostCamera: function() {
        this.object.visible = false;
        this.box.visible = false;
    },
    // from the original AlvaAR example
    _resizeToCover: function(srcWidth, srcHeight, dstWidth, dstHeight) {
        const rect = {};
        let scale;
        console.log(`resizeToCover(): src ${srcWidth} ${srcHeight} dst ${dstWidth} ${dstHeight}`);
        if (dstWidth/dstHeight > srcWidth/srcHeight) {
            scale = dstWidth / srcWidth;
            rect.w = dstWidth;    
            rect.h = srcHeight * scale;
            rect.x = 0;
            rect.y = (dstHeight - rect.h) *0.5;
        } else {
            scale = dstHeight / srcHeight;
            rect.w = srcWidth * scale;
            rect.h = dstHeight;
            rect.x = (dstWidth - rect.w) *0.5;
            rect.y = 0;    
        }
        return rect;
    }
});
