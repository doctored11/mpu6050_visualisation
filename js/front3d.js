import * as THREE from 'three';

import { GLTFLoader } from 'GLTFLoader';
console.log(THREE);
//
//
//
let mode = 'rocket';
//
//
//
// /
const properties = {
	rocket: { link: '../rocket/scene.gltf', scale: 10, x: 1, y: 1, z: 0 },
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

//
//
const loader = new GLTFLoader();
let model;
loader.load(
	properties[mode].link,
	// '../rocket/scene.gltf',
	// '../ship/corabl.glb',
	function (glb) {
		model = glb.scene;
		console.log(glb.scene);
		glb.scene.position.z = 0;
		glb.scene.position.x = 0;
		glb.scene.position.y = -2;
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
//

var L1 = new THREE.PointLight(0xffffff, 1);
L1.position.z = 50;
L1.position.y = 50;
L1.position.x = -10;
scene.add(L1);

var L2 = new THREE.PointLight(0xffffff, 0.9);
L2.position.z = 120;
L2.position.y = -50;
L2.position.x = -50;
scene.add(L2);

const renderer = new THREE.WebGLRenderer();
// renderer.setClearColor(0x000000, 0);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//
// const geometry = new THREE.BoxGeometry(1, 0.4, 2);
// const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
// model = new THREE.Mesh(geometry, material);
// scene.add(model);

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
});

//
//
//
//
//

// Создаем группу объектов, в которую будем добавлять кубы
const group = new THREE.Group();
scene.add(group);

// Создаем массив кубов
const cubes = [];

// Создаем функцию для генерации случайных цветов
function getRandomColor() {
	const r = Math.floor(Math.random() * (256 - 0) + 0);
	const g = Math.floor(Math.random() * (256 - 0) + 0);
	const b = Math.floor(Math.random() * (256 - 0) + 0);
	const brightness = Math.sqrt(0.381 * r * r + 0.391 * g * g + 0.381 * b * b);
	if (brightness < 180) {
		return getRandomColor(); // рекурсивно генерируем новый цвет, если текущий слишком темный
	}
	return `rgb(${r}, ${g}, ${b})`;
}

// Создаем 100 кубов и добавляем их в группу
for (let i = 0; i < 100; i++) {
	const geometry = new THREE.BoxGeometry(
		Math.random() * (0.15 - 0.05) + 0.05,
		Math.random() * (0.15 - 0.05) + 0.05,
		Math.random() * (0.15 - 0.05) + 0.05
	);
	const material = new THREE.MeshBasicMaterial({ color: getRandomColor() });
	const cube = new THREE.Mesh(geometry, material);
	group.add(cube);
	cube.position.set(0, -2, 0);
	cubes.push(cube);
}

// Создаем переменную для хранения времени
let time = 0;
//

//
//
//
// облака
const clouds = [];
const groupCloud = new THREE.Group();
scene.add(groupCloud);
for (let i = 0; i < 10; i++) {
	let random = Math.random() * (2 - 0.5) + 0.5;
	const geometry = new THREE.BoxGeometry(random, random / 4, random);
	const hexColor = '#91f2ff7f';
	const material = new THREE.MeshBasicMaterial({
		color: 0xffffff, // белый цвет
		opacity: 0.5, // прозрачность
		transparent: true, // включаем прозрачность
	});

	const cloud = new THREE.Mesh(geometry, material);
	group.add(cloud);
	cloud.position.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
	clouds.push(cloud);
}
//

//
function animate() {
	requestAnimationFrame(animate);
	//
	///
	//
	// Циклическое изменение углов поворота частиц
	// Увеличиваем время на 0.01 на каждом кадре

	let max = 1;
	// Обновляем положение кубов

	//
	particleFlameAnimate();
	//
	cloudAnimate();
	//
	//
	let ax = 0,
		ay = 0,
		az = 0;
	if (properties[mode].x) ax = -_x; //-x
	if (properties[mode].y) ay = -_y; //-y
	if (properties[mode].z) az = _z; //z -работает только на малых отклонениях
	model.rotation.x = ax;
	model.rotation.z = ay;
	model.rotation.y = az;
	console.log(Math.tan(0), Math.tan(0), Math.tan(_x));

	renderer.render(scene, camera);
}

animate();

function filter(angle) {
	if (angle > 360 || angle < -360) {
		return angle % 360;
	}
	return angle;
}
//
//
//
function cloudAnimate() {
	clouds.forEach((cloud) => {
		// Получаем текущие координаты куба
		const { x, y, z } = cloud.position;
		// Вычисляем новые координаты на основе времени
		const newX = x + (-1 / 10) * Math.sin(_y) * (Math.random() * (1.8 - 0.3) + 0.3);
		const newY = y + (-1 / 10) * Math.cos(_x) * (Math.random() * (1.8 - 0.3) + 0.3);
		const newZ =
			z + (1 / 100) * Math.cos(_y) * Math.sin(_x) * (Math.random() * (1.8 - 0.3) + 0.3);

		// Устанавливаем новые координаты для куба
		cloud.position.set(newX, newY, newZ);
		if (
			cloud.position.x < -8 ||
			cloud.position.x > 8 ||
			cloud.position.y < -8 ||
			cloud.position.y > 8 ||
			cloud.position.z < -8 ||
			cloud.position._z > 8
		) {
			let max = 6;
			let min = -6;
			cloud.position.set(
				Math.random() * (max - min) + min,
				Math.random() * (max - min) + min,
				Math.random() * (max - min) + min
			);
			console.log('0-0');
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
		const newX = x + (-1 / 10) * Math.sin(_y) * (Math.random() * (1.8 - 0.3) + 0.3);
		const newY = y + (-1 / 10) * Math.cos(_x) * (Math.random() * (1.8 - 0.3) + 0.3);
		const newZ =
			z + (1 / 10) * Math.cos(_y) * Math.sin(_x) * (Math.random() * (1.8 - 0.3) + 0.3);
		cube.rotation.x += 0.5;
		// Устанавливаем новые координаты для куба
		cube.position.set(newX, newY, newZ);
		if (
			cube.position.x < -4 ||
			cube.position.x > 4 ||
			cube.position.y < -4 ||
			cube.position.y > 4 ||
			cube.position.z < -4 ||
			cube.position._z > 4
		) {
			cube.position.set(0, -2, 0);
			console.log('0-0');
		}
		//
		//
	});
}
