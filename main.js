const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 300;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2,	carCanvas.width * 0.9, 4);

let traffic = [];

let cars = Car.generateCars(4000);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
	for (let i = 0; i < cars.length; i++) {
		cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
		if (i != 0) {
			NeuralNetwork.mutate(cars[i].brain, 0.15);
		}
	}
}

animate();

function animate() {
	carCanvas.height = window.innerHeight;
	networkCanvas.height = window.innerHeight;
	cars = Car.updateCars(cars);
	bestCar = Car.getBestCar(cars);
	
	traffic = Car.generateTrafic(traffic, bestCar);
	for (let i = 0; i < traffic.length; i++) {
		traffic[i].update(road.borders, []);
	}

	for (let i = 0; i < cars.length; i++) {
		cars[i].update(road.borders, traffic);
	}

	carCtx.save();
	carCtx.translate(0, -bestCar.y + carCanvas.height * 0.75);
	road.draw(carCtx);
	for (let i = 0; i < traffic.length; i++) {
		traffic[i].draw(carCtx);
	}
	for (let i = 0; i < cars.length; i++) {
		if (cars[i] == bestCar) {
			carCtx.globalAlpha = 1;
			cars[i].draw(carCtx, true);
		} else {
			carCtx.globalAlpha = 0.2;
			cars[i].draw(carCtx);
		}
	}
	carCtx.restore();

	Visualizer.drawNetwork(networkCtx, bestCar.brain);
	requestAnimationFrame(animate);
}
