import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { AlvaAR } from './alva/assets/alva_ar.js';
import { ARCamView }  from './alva/assets/view.js';
import { Camera, onFrame, resize2cover } from './alva/assets/utils.js';

function main() {
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

        const object = new THREE.Mesh(new THREE.IcosahedronGeometry(1,0), new THREE.MeshNormalMaterial({flatShading: true}));
        object.visible = false;    
        arCamView.addObject(object);

        container.appendChild(canvas);
        container.appendChild(view);

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
