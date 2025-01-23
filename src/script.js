import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Parameters
 */
const parameters = {
    materialColor: '#5d52ff',
};

/**
 * Base
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
const sectionHeight = 10;
const totalHeight = sectionHeight * document.querySelectorAll('.section').length;

for (let i = 0; i < particlesCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * totalHeight - totalHeight / 2;
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
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

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
 * Scroll Animation
 */
const sections = document.querySelectorAll('.section');
const textureLoader = new THREE.TextureLoader();

sections.forEach((section, index) => {
    // Additional Text
    const additionalText = document.createElement('p');
    additionalText.classList.add('additional-text');
    additionalText.textContent = section.dataset.additionalText;
    section.appendChild(additionalText);

    // Button with Separate Links
    const button = document.createElement('a');
    button.classList.add('section-button');
    button.href =
        index === 0
            ? 'https://www.youtube.com/@AlexDubranov'
            : index === 1
            ? 'https://forms.gle/ALEkM4yanYg5Rj598'
            : 'https://ko-fi.com/alexdubranov';
    button.textContent = 'Explore';
    section.appendChild(button);

    // Rotating Cube
    const cubeGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const faceImages = [
        `textures/section${index + 1}_face1.webp`,
        `textures/section${index + 1}_face2.webp`,
        `textures/section${index + 1}_face3.webp`,
        `textures/section${index + 1}_face4.webp`,
        `textures/section${index + 1}_face5.webp`,
        `textures/section${index + 1}_face6.webp`,
    ];
      // Apply SRGB color space to each texture
      const cubeMaterials = faceImages.map((img) => {
        const texture = textureLoader.load(img);
        texture.colorSpace = THREE.SRGBColorSpace;
        return new THREE.MeshStandardMaterial({
            map: texture,
        });
    });

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    cube.position.y = -index * (sectionHeight * 0.4) + 1.5; // Adjusted y-position for each cube
    cube.position.z = -2;
    scene.add(cube);

    // Animation for the Cube
    const rotateCube = () => {
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.005;
        requestAnimationFrame(rotateCube);
    };
    rotateCube();
});

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollY > sectionTop - sectionHeight / 2 && scrollY < sectionTop + sectionHeight / 2) {
            gsap.to(section.querySelector('.additional-text'), {
                opacity: 1,
                y: 0,
                duration: 0.5,
            });
        } else {
            gsap.to(section.querySelector('.additional-text'), {
                opacity: 0,
                y: 10,
                duration: 0.5,
            });
        }
    });
});

/**
 * Cursor
 */
const cursor = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animation Loop
 */
const clock = new THREE.Clock();
const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Animate particles
    particles.rotation.y = elapsedTime * 0.1;

    // Parallax effect
    const parallaxX = cursor.x * 0.5;
    const parallaxY = -cursor.y * 0.5;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.1;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.1;

    // Scroll effect
    camera.position.y = -window.scrollY / sizes.height * 4;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
