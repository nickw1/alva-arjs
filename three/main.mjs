import { AlvaAR, ARCamView, Camera, onFrame, resize2cover } from 'alva-js';
import * as THREE from 'three';
import * as LocAR from 'locar';

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

const origLon = -0.72, origLat = 51.05;

let alva, locar, arCamView, ctx, video;
let gotFirstGps = false;

Camera.Initialize(config).then( async(media) => {
    video = media.el;
    const size = resize2cover(video.videoWidth, video.videoHeight, container.clientWidth, container.clientHeight);

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    video.style.width = size.width + 'px';
    video.style.height = size.height + 'px';
    
    ctx = canvas.getContext('2d', { 
        alpha: false,
        desynchronized: true
    });


    container.appendChild(canvas);
    container.appendChild(view);

    initAlva().then(initLocar);
    
}).catch( error => alert(error) );

document.getElementById("start").addEventListener("click", e => {
    setupFrameHandler();
    document.getElementById("start").setAttribute("disabled", "disabled");
});


async function initAlva() {        
    alva = await AlvaAR.Initialize(canvas.width, canvas.height);
    arCamView = new ARCamView(view, canvas.width, canvas.height);

    // from Alva demo - add the icosahedron object
    const object = new THREE.Mesh( new THREE.IcosahedronGeometry( 1, 0 ), new THREE.MeshNormalMaterial( { flatShading: true } ) );
    object.visible = false;
    // will be added at x=0, y=0, z=-10
    arCamView.addObject( object );
}

function initLocar() {
    locar = new LocAR.LocationBased(arCamView.scene, arCamView.camera);

    const geom = new THREE.BoxGeometry(20,20,20);
    const props = [{
        mtl: new THREE.MeshBasicMaterial({color:0xff0000}),
        lonDis: -0.001,
        latDis: 0,
        yDis: 0
    }, {
        mtl: new THREE.MeshBasicMaterial({color:0xffff00}), 
        lonDis: 0.001,
        latDis: 0,
        yDis: 0
    }, {
        mtl: new THREE.MeshBasicMaterial({color:0x0000ff}),  
        lonDis: 0,
        latDis: -0.001,
        yDis: 0
    }, {
        mtl: new THREE.MeshBasicMaterial({color:0x00ff00}),
        lonDis: 0,
        latDis: 0.001,
        yDis: 0
    }, {
        mtl: new THREE.MeshBasicMaterial({color:0xffff80}),
        lonDis: 0,
        latDis: 0,
        yDis:100
    }, {
        mtl: new THREE.MeshBasicMaterial({color:0xff80ff}),
        lonDis: 0,
        latDis: 0,
        yDis:-100
    }
    ];

    locar.on("gpsupdate", ev => {
        alert(`Got GPS position: ${ev.position.coords.longitude} ${ev.position.coords.latitude}`);
        console.log(`gpsupdate: camera position now:`);
        console.log(arCamView.camera.position);
        if(!gotFirstGps) {
            for(let i=0; i<props.length; i++) {
                const object = new THREE.Mesh(geom, props[i].mtl);
                object.visible = false;    
                const [x, z]  = locar.lonLatToWorldCoords(origLon + props[i].lonDis, origLat + props[i].latDis); 
                console.log(x, z);
                arCamView.addObject(object, x, arCamView.camera.position.y + props[i].yDis, z);
            }
            gotFirstGps = true;
        }
    });
    locar.fakeGps(-0.72, 51.05);
}

function setupFrameHandler() {
    if(gotFirstGps) {
        onFrame( () => {

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pose = alva.findCameraPose(frame);
            if(pose) {
                arCamView.updateCameraPose(pose);
                console.log(`onFrame(): camera position now:`);
                console.log(arCamView.camera.position);
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
    } else {
        alert('Cannot start frame processing as no GPS location yet');
    }
}

