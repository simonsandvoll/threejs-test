import ReactDOM from "react-dom"
import * as CANNON from "cannon";
import React, { useState } from "react"
import { Canvas, useThree, useFrame } from "react-three-fiber"
import { useDrag } from "react-use-gesture";
import * as THREE from 'three';
import "./index.css"
import { useCannon, Provider } from './useCannon';

function DraggableDodecahedron({ position: initialPosition }) {
    const { size, viewport } = useThree();
    const [position, setPosition] = useState(initialPosition);
    const [quaternion, setQuaternion] = useState(new THREE.Quaternion());
    const aspect = size.width / viewport.width;

    const { ref, body } = useCannon({ bodyProps: { mass: 100000 } }, body => {
        body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)))
        body.position.set(...position);
        console.log('init cannon');
    }, []);

    const bind = useDrag(({ offset: [, ], xy: [x, y], first, last }) => {
         
        console.log('dragging');
        console.log(body.position);
        console.log(position);
        if (first) {
            body.mass = 0;
            body.updateMassProperties();
        } else if (last) {
            body.mass = 10000;
            body.updateMassProperties();
        }
        console.log(`x: ${x}`);
        console.log(`y: ${y}`);
        console.log(`size.width: ${size.width}`);
        body.position.set((x - size.width / 2) / aspect, -(y - size.height / 2) / aspect, -0.7);
        console.log('dragging after set');
        console.log(body.position);
        console.log(position);
    }, { pointerEvents: true });

    useFrame(() => {
        //if (ref.current) {
            //console.log(body.position);
            setPosition(body.position.clone().toArray());
            // setQuaternion(body.quaternion.clone());
        //}
    });
    return (
        <mesh ref={ref} castShadow position={position} {...bind()}
            onClick={e => {
                e.stopPropagation();
                console.log('clicked object');
            }}
        >

            <dodecahedronBufferGeometry attach="geometry" />
            <meshLambertMaterial attach="material" color="yellow" />

        </mesh>
    )
}

function Plane({ position, onPlaneClick }) {
    const { ref } = useCannon({ bodyProps: { mass: 0 } }, body => {
        body.addShape(new CANNON.Plane())
        body.position.set(...position)
    })
    return (
        <mesh ref={ref} receiveShadow position={position}
            onClick={onPlaneClick}>
            <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
            <meshPhongMaterial attach="material" color="#272727" />
        </mesh>
    )
}

function Objects({ objects, addObject }) {
    return <React.Fragment>
        {objects}
    </React.Fragment>;
}

function App() {

    const [objects, setObjects] = useState([
        // <DraggableDodecahedron position={[0, 0, 0]} key={Math.random()} />
    ]);

    const { mouse, camera } = useThree();
    const onPlaneClick = (e) => {
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        var dir = vector.sub(camera.position).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        const position = [pos.x, pos.y, 2];
        setObjects([...objects,
        <DraggableDodecahedron position={position} key={Math.random()} />]);
    };

    return <React.Fragment>
        <ambientLight intensity={0.5} />
        <spotLight intensity={0.6} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
        <Provider>
            <Objects objects={objects}>
            </Objects>
            <Plane position={[0, 0, -2]} onPlaneClick={onPlaneClick} />
        </Provider>
    </React.Fragment>

};

function createCanvas() {
    return <Canvas
        onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
    >
        <App />
    </Canvas>
}

ReactDOM.render(
    createCanvas(),
    document.getElementById("root")
)


