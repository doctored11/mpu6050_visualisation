import * as THREE from 'three';

import { GLTFLoader } from 'GLTFLoader';
console.log(THREE);
//

//
let ax_prev = 0;
let ay_prev = 0;
let az_prev = 0;
//
const borderView = 8;
let mode = 'cube';
//
const modeSelect = document.querySelector('select');
modeSelect.onchange = () => {
	console.log(modeSelect.value);
	mode = modeSelect.value;
	// getRandomColor();
	createParticles();

	loadModel();
};

//
//
//
// /
const properties = {
	rocket: {
		link: '../rocket/scene.gltf',
		scale: 10,
		x: 1,
		y: 1,
		z: 0,
		particleCount: 100,
		particleMaxR: 256,
		particleMaxG: 256,
		particleMaxB: 256,
		particleMinR: 80,
		particleMinG: 10,
		particleMinB: 80,
		particleBrightness: 180,
		particleRad: 4,
	},
	ship: {
		link: '../ship/ship.glb',
		scale: 18,
		x: 0,
		y: 0,
		z: 1,
		particleCount: 200,
		particleMaxR: 240,
		particleMaxG: 245,
		particleMaxB: 256,
		particleMinR: 200,
		particleMinG: 200,
		particleMinB: 250,
		particleBrightness: 250,
		particleSpeed: 1 / 10000,
		particleRad: Math.random() * (3.6 - 1.6) + 1.6,
	},
	cube: {
		link: '',
		scale: 1,
		x: 1,
		y: 1,
		z: 1,
		particleCount: 0,
		particleMaxR: 0,
		particleMaxG: 0,
		particleMaxB: 0,
		particleMinR: 80,
		particleMinG: 0,
		particleMinB: 0,
		particleBrightness: 0,
		particleRad: 0,
	},
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
scene.background = new THREE.Color(0x87ceeb);

//
//
//
let model;
loadModel();

function loadModel() {
	const loader = new GLTFLoader();
	if (model) scene.remove(model);
	if (mode != 'cube') {
		loader.load(
			properties[mode].link,
			function (glb) {
				model = glb.scene;
				console.log(glb.scene);
				glb.scene.position.z = 0;
				glb.scene.position.x = 0;
				glb.scene.position.y = -2;
				glb.scene.rotation.x = 0;
				// glb.scene.scale.set(10, 10, 10);
				glb.scene.scale.set(
					properties[mode].scale,
					properties[mode].scale,
					properties[mode].scale
				);

				scene.add(glb.scene);
			},
			undefined,
			function (error) {
				console.error(error);
			}
		);
	}
	if (mode == 'cube') {
		const geometry = new THREE.BoxGeometry(1, 0.4, 2);
		const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
		model = new THREE.Mesh(geometry, material);
		scene.add(model);
	}
}
//

var L1 = new THREE.PointLight(0xffffff, 1);
L1.position.z = 150;
L1.position.y = 50;
L1.position.x = -10;
scene.add(L1);

var L2 = new THREE.PointLight(0xffffff, 0.9);
L2.position.z = 10;
L2.position.y = -100;
L2.position.x = -50;
scene.add(L2);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//

camera.position.z = 5;

var socket = io();
let _x = 0,
	_y = 0,
	_z = 0;
let arr = [];
socket.on('message', function (msg) {
	if (msg == 0) return;
	arr = msg.split(' ');
	_x = arr[0] * (Math.PI / 180);
	_y = arr[1] * (Math.PI / 180);
	_z = arr[2] * (Math.PI / 180);
	console.log(_x, _y, _z);
});

//
//

// Создаем группу объектов, в которую будем добавлять кубы
const group = new THREE.Group();
scene.add(group);

// Создаем массив кубов
const cubes = [];

// Создаем функцию для генерации случайных цветов
function getRandomColor() {
	if (!mode) return;
	const r = Math.floor(
		Math.random() * (properties[mode].particleMaxR - properties[mode].particleMinR) +
			properties[mode].particleMinR
	);
	const g = Math.floor(
		Math.random() * (properties[mode].particleMaxG - properties[mode].particleMinG) +
			properties[mode].particleMinG
	);
	const b = Math.floor(
		Math.random() * (properties[mode].particleMaxB - properties[mode].particleMinB) +
			properties[mode].particleMinB
	);
	const brightness = Math.sqrt(0.381 * r * r + 0.391 * g * g + 0.381 * b * b);
	if (brightness < properties[mode].particleBrightness) {
		return getRandomColor(); // рекурсивно генерируем новый цвет, если текущий слишком темный
	}
	return `rgb(${r}, ${g}, ${b})`;
}

// Создаем много кубов и добавляем их в группу
createParticles();
function createParticles() {
	for (let i = 0; i < properties[mode].particleCount; ++i) {
		const geometry = new THREE.BoxGeometry(
			Math.random() * (0.15 - 0.05) + 0.05,
			Math.random() * (0.15 - 0.05) + 0.05,
			Math.random() * (0.15 - 0.05) + 0.05
		);
		const material = new THREE.MeshBasicMaterial({ color: getRandomColor() });
		const cube = new THREE.Mesh(geometry, material);
		group.add(cube);
		cube.position.set(0, -2, 20);
		cubes.push(cube);
	}
}

//
//
// облака
const clouds = [];
const groupCloud = new THREE.Group();
scene.add(groupCloud);
for (let i = 0; i < 15; i++) {
	let random = Math.random() * (2 - 0.5) + 0.5;
	const geometry = new THREE.BoxGeometry(random, random / 4, random);

	const material = new THREE.MeshBasicMaterial({
		color: 0xffffff, // белый цвет
		opacity: 0.5, // прозрачность
		transparent: true, // включаем прозрачность
	});

	const cloud = new THREE.Mesh(geometry, material);
	group.add(cloud);
	cloud.position.set(
		Math.random() * (borderView + 1) - 1,
		Math.random() * (borderView + 1) - 1,
		Math.random() * (borderView + 1) - 1
	);
	cloud.explosion = false;
	clouds.push(cloud);
}
//
//
if (mode == 'ship') {
	const geometry = new THREE.BoxGeometry(100, -1, 5);
	const material = new THREE.MeshBasicMaterial({ color: 0x16f0e1 });
	const water = new THREE.Mesh(geometry, material);
	water.position.set(0, -1.7, 0);
	scene.add(water);
}

//

function animate() {
	requestAnimationFrame(animate);
	//
	///
	//

	let max = 1;
	//

	//
	switch (mode) {
		case 'rocket':
			particleFlameAnimate();
			break;
		case 'ship':
			particleShipAnimate();
			break;
	}

	//
	cloudAnimate();
	//
	//
	let ax = 3,
		ay = 0,
		az = 0;

	////////////////////////////////////

	if (properties[mode].x) ax = -_x; //-x
	if (properties[mode].y) ay = _y; //y
	if (properties[mode].z) az = _z; //z -работает только на малых отклонениях

	// az = _z; //!!!!!!!!!!!!!!!!возможно убрать

	model.rotation.x = ax;
	model.rotation.z = ay;
	model.rotation.y = az;

	renderer.render(scene, camera);
}

animate();

//
//
//
function cloudAnimate() {
	clouds.forEach((cloud) => {
		// Получаем текущие координаты куба
		const { x, y, z } = cloud.position;
		// Вычисляем новые координаты на основе времени
		let newX = x + (1 / 10) * Math.sin(_y) * (Math.random() * (1.8 - 0.3) + 0.3);
		let newY = y + (-1 / 10) * Math.cos(_x) * (Math.random() * (1.8 - 0.3) + 0.3);
		let newZ =
			z + (1 / 100) * Math.cos(_y) * Math.sin(_x) * (Math.random() * (1.8 - 0.3) + 0.3);
		if (mode != 'rocket') {
			newX = x + (-1 / 100) * Math.sin(_z) * (Math.random() * (1.8 - 0.3) + 0.3) + 1 / 100;
			newY = 4;
			newZ =
				z +
				(1 / 100) * Math.cos(_y) * Math.sin(_x) * (Math.random() * (1.8 - 0.3) + 0.3) +
				1 / 100;
		}

		// Устанавливаем новые координаты для куба
		cloud.position.set(newX, newY, newZ);
		if (
			cloud.position.x < -borderView - 1 ||
			cloud.position.x > borderView + 1 ||
			cloud.position.y < -borderView - 1 ||
			cloud.position.y > borderView + 1 ||
			cloud.position.z < -borderView - 10 ||
			cloud.position.z > borderView + 10
		) {
			let max = borderView;
			let min = -borderView;
			cloud.position.set(
				Math.random() * (max - min) + min,
				Math.random() * (max - min) + min,
				Math.random() * (max - min) + min
			);
			cloud.material.opacity = 0.5;
			cloud.explosion = false;
		}
		//
		let cloudHeight = cloud.geometry.parameters.height;
		let cloudWidth = cloud.geometry.parameters.width;
		let cloudDepth = cloud.geometry.parameters.depth;
		// console.log(newX, newY, newZ);
		if (
			newX + cloudWidth > -1 / 2 &&
			newX - cloudWidth / 2 < 1 / 2 &&
			newY + cloudHeight > -1 / 2 - 2 &&
			newY - cloudWidth / 2 < 1 / 2 - 2 &&
			newZ + cloudDepth > -1 / 2 &&
			newZ - cloudWidth / 2 < 1 / 2 &&
			!cloud.explosion
		) {
			cloud.explosion = true;
			createExplosion(newX, newY, newZ);
			cloud.material.opacity = 0;
		}
		//
		//
	});
}
function particleFlameAnimate() {
	cubes.forEach((cube) => {
		// Получаем текущие координаты куба
		const { x, y, z } = cube.position;
		// Вычисляем новые координаты на основе времени
		const newX = x + (1 / 10) * Math.sin(_y) * (Math.random() * (1.8 - 0.3) + 0.3);
		const newY = y + (-1 / 10) * Math.cos(_x) * (Math.random() * (1.8 - 0.3) + 0.3);

		const newZ =
			z + (1 / 10) * Math.cos(_y) * Math.sin(_x) * (Math.random() * (1.8 - 0.3) + 0.3);
		cube.rotation.x += 0.5;

		// Устанавливаем новые координаты для куба
		cube.position.set(newX, newY, newZ);
		if (
			cube.position.x < -properties[mode].particleRad ||
			cube.position.x > properties[mode].particleRad ||
			cube.position.y < -properties[mode].particleRad - 2 ||
			cube.position.y > properties[mode].particleRad - 2 ||
			cube.position.z < -properties[mode].particleRad ||
			cube.position.z > properties[mode].particleRad
		) {
			cube.position.set(0, -2, 0);
		}
		//
		//
	});
}

function particleShipAnimate() {
	cubes.forEach((cube) => {
		// Получаем текущие координаты куба
		const { x, y, z } = cube.position;

		const newX = x + (1 / 50) * Math.cos(_z + Math.PI) * (Math.random() * (1.8 - 0.3) + 0.3);
		const newY = y + 1 / 2500;
		const newZ = z + (-1 / 50) * Math.sin(_z + Math.PI);
		// Устанавливаем новые координаты для куба
		cube.position.set(newX, newY, newZ);
		if (
			cube.position.x < -properties[mode].particleRad ||
			cube.position.x > properties[mode].particleRad ||
			cube.position.y < -properties[mode].particleRad - 2 ||
			cube.position.y > properties[mode].particleRad - 2 ||
			cube.position.z < -properties[mode].particleRad ||
			cube.position._z > properties[mode].particleRad
		) {
			cube.position.set(0, -2, 0);
		}
		//
		//
	});
}

//

function createExplosion(x, y, z) {
	var particles = [];

	// Создаем n квадратных частиц
	for (var i = 0; i < 30; i++) {
		var particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
		var particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		var particle = new THREE.Mesh(particleGeometry, particleMaterial);
		scene.add(particle);
		particles.push(particle);
	}

	// Располагаем частицы в начальной точке
	particles.forEach(function (particle) {
		particle.position.set(x, y, z);
	});

	// Запускаем анимацию отправки частиц во все стороны
	var speed = 2;
	var startTime = Date.now();
	function update() {
		var time = Date.now() - startTime;
		particles.forEach(function (particle) {
			var distance = speed * (time / 1000);
			particle.position.x += distance * (Math.random() - 0.5);
			particle.position.y += distance * (Math.random() - 0.5);
			particle.position.z += distance * (Math.random() - 0.5);
		});
		if (time < 1000) {
			requestAnimationFrame(update);
		} else {
			// Удаляем частицы после 1 секунды
			particles.forEach(function (particle) {
				scene.remove(particle);
			});
		}
	}
	update();
}
