//import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { AlvaAR } from '../alva/assets/alva_ar.js';
import { ARCamView }  from '../alva/assets/view.js';
import { Camera, onFrame, resize2cover } from '../alva/assets/utils.js';
import * as THREE from 'three';
import * as THREEx from '@ar-js-org/ar.js/three.js/build/ar-threex-location-only.js';

function main() {
    console.log('main()');
    const config = {
        video: {
            facingMode: 'environment',
            aspectRatio: 16 / 9,
            width: { ideal: 1280 }
        },
        audio: false
    };

    const container = document.getElementById('container');
    const view = document.createElement('div');
    const canvas = document.createElement('canvas');
    const overlay = document.getElementById('overlay');

    Camera.Initialize(config).then( async(media) => {
        const video = media.el;
        const size = resize2cover(video.videoWidth, video.videoHeight, container.clientWidth, container.clientHeight);

        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        video.style.width = size.width + 'px';
        video.style.height = size.height + 'px';
        
        const ctx = canvas.getContext('2d', { 
            alpha: false,
            desynchronized: true
        });
        
        const alva = await AlvaAR.Initialize(canvas.width, canvas.height);
        const arCamView = new ARCamView(view, canvas.width, canvas.height);

        const arjs = new THREEx.LocationBased(arCamView.scene, arCamView.camera, { initialPositionAsOrigin: true});
        console.log('sending fakeGps');

        const geom = new THREE.BoxGeometry(10,10,10);
        const mtl = [new THREE.MeshBasicMaterial({color:0xff0000}),  new THREE.MeshBasicMaterial({color:0xffff00}),  new THREE.MeshBasicMaterial({color:0x0000ff}),  new THREE.MeshBasicMaterial({color:0x00ff00})];
        let object;

        arjs.on("gpsupdate", e => {
            console.log('camera position now:');
            console.log(arCamView.camera.position);
            if(!object) {
                object = new THREE.Mesh(geom, mtl[0]);
                object.visible = false;    
                const pos = arjs.lonLatToWorldCoords(-0.72, 51.051);
                console.log(pos);
                arCamView.addObject(object, pos[0], arCamView.camera.position.y, pos[1]);
            }
        });

        container.appendChild(canvas);
        container.appendChild(view);
        arjs.fakeGps(-0.72, 51.05);


        onFrame( () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pose = alva.findCameraPose(frame);
            if(pose) {
                arCamView.updateCameraPose(pose);
            } else {
                arCamView.lostCamera();
                const dots = alva.getFramePoints();
                for(const p of dots) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(p.x, p.y,2, 2);
                }
            }
            return true;
        }, 30);
        
    }).catch( error => alert(error) );
}

main();
