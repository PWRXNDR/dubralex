import * as THREE from 'three';

/**
 * Parameters
 */
const parameters = {
    materialColor: '#5d52ff',
    movementIntensity: 0.1, // Reduced intensity for smoothness
};

/**
 * Base Setup
 */
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

/**
 * Lighting
 */
const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

/**
 * Particles
 */
const particlesCount = 1000;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Sizes & Responsive Adjustments
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

/**
 * Camera - Adjust FOV for Mobile
 */
const isMobile = sizes.width < 768;
const camera = new THREE.PerspectiveCamera(isMobile ? 45 : 35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
scene.add(camera);

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Adjust Camera FOV for Mobile
    const isMobile = sizes.width < 768;
    camera.fov = isMobile ? 45 : 35;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Adjust Cube Positions Dynamically
    adjustCubePositions();
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Floating Cubes with Unique Textures
 */
const textureLoader = new THREE.TextureLoader();

const createCube = (index) => {
    const cubeGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const faceImages = [
        `textures/section${index + 1}_face1.webp`, 
        `textures/section${index + 1}_face2.webp`, 
        `textures/section${index + 1}_face3.webp`, 
        `textures/section${index + 1}_face4.webp`, 
        `textures/section${index + 1}_face5.webp`, 
        `textures/section${index + 1}_face6.webp`
    ];
    
    const cubeMaterials = faceImages.map((img) => {
        const texture = textureLoader.load(img);
        texture.colorSpace = THREE.SRGBColorSpace;
        return new THREE.MeshStandardMaterial({ map: texture });
    });

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    scene.add(cube);

    return cube;
};

const leftCube = createCube(0);
const rightCube = createCube(1);

/**
 * Adjust Cube Positions Dynamically
 */
const adjustCubePositions = () => {
    const isMobile = sizes.width < 768;
    
    if (isMobile) {
        leftCube.position.set(0, 2, -2);  // Above first category
        rightCube.position.set(0, -2, -2); // Below second category
    } else {
        leftCube.position.set(-2, 1.5, -2);
        rightCube.position.set(2, 1.5, -2);
    }
};

adjustCubePositions(); // Run on load

/**
 * Cursor Movement Effect - Reduced Sensitivity
 */
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / sizes.width - 0.8) * parameters.movementIntensity;
    cursor.y = -(event.clientY / sizes.height - 0.8) * parameters.movementIntensity;
});

/**
 * Animation Loop
 */
const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Animate cubes
    leftCube.rotation.y += 0.01;
    rightCube.rotation.y += 0.01;

    leftCube.rotation.z += 0.005;
    rightCube.rotation.z += 0.005;

    // Animate particles
    particles.rotation.y = elapsedTime * 0.1;

    // Mouse Interaction
    camera.position.x += (cursor.x - camera.position.x) * 0.05;
    camera.position.y += (cursor.y - camera.position.y) * 0.05;

    // Render
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
