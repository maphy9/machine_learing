class Car {
	constructor(x, y, width, height, maxSpeed, controlType, color) {
		this.x = x;
		this.y = y;
		this.startY = y;
		this.width = width;
		this.height = height;
		if (controlType == "Player" || controlType == "AI") {
			this.sensor = new Sensor(this, 6, 250, Math.PI / 2);
			this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
		}
		this.controls = new Controls(controlType);
		this.maxSpeed = maxSpeed;
		this.color = color;
		this.useBrain = controlType == "AI";

		this.speed = 0;
		this.distance = 0;
		this.acceleration = 0.05;
		this.friction = 0.03;
		this.angle = 0;
		this.angleChange = 0.05;
		this.damaged = false;
	}

	static generateTrafic(oldTraffic, bestCar) {
		const traffic = oldTraffic.filter(el => el.y < (bestCar.y + carCanvas.height / 2));
		if (traffic.length < road.laneCount) {
			for (let i = 0; i < road.laneCount; i++) {
				const laneCenter = road.getLaneCenter(i % road.laneCount);
				const laneCar = traffic.find(el => el.x == laneCenter);
				if (!laneCar) {
				const dummy = new Car(
					laneCenter,
					bestCar.y - carCanvas.height - (Math.random() * carCanvas.height / 2),
					30, 50,
					Math.floor(Math.random() * 3) + 1,
					"Dummy",
					colors[Math.floor(Math.random() * colors.length)],
				);
				traffic.push(dummy);
				}
			}
		}
		return traffic;
	}

	update(borders, traffic) {
		if (!this.damaged) {
			this.#move();
			this.polygon = this.#createPolygon();
			this.damaged = this.#assessDamage(borders, traffic);
		}
		if (this.sensor) {
			this.sensor.update(borders, traffic);
			const offsets = this.sensor.readings.map(
				r => r == null ? 0 : 1 - r.offset
			);
			const outputs = NeuralNetwork.feedForward(offsets, this.brain);

			if (this.useBrain) {
				this.controls.forward = outputs[0];
				this.controls.reverse = outputs[1];
				this.controls.right = outputs[2];
				this.controls.left = outputs[3];
			}
		}
	}

	static generateCars(n) {
		const cars = [];
		for (let i = 0; i < n; i++) {
			const car = new Car(
				road.getLaneCenter(road.laneCount - 1), 100,
				30,	50,
				5, "AI", "red"
			);
			cars.push(car);
		}
		return cars;
	}

	static updateCars(oldCars) {
		return oldCars.filter(car => car.y <= bestCar.y + carCanvas.height);
	}

	#assessDamage(borders, traffic) {
		for (const border of borders) {
			if (polygonIntersection(this.polygon, border)) {
				return true;
			}
		}
		for (const car of traffic) {
			if (polygonIntersection(this.polygon, car.polygon)) {
				return true;
			}
		}
		return false;
	}

	#createPolygon() {
		const points = [];
		const rad = Math.hypot(this.width, this.height) / 2;
		const alpha = Math.atan2(this.width, this.height);
		points.push({
			x: this.x - Math.sin(this.angle - alpha) * rad,
			y: this.y - Math.cos(this.angle - alpha) * rad,
		})
		points.push({
			x: this.x - Math.sin(this.angle + alpha) * rad,
			y: this.y - Math.cos(this.angle + alpha) * rad,
		})
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
		})
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
		})
		return points;
	}

	#move() {
		if (this.controls.forward) {
			this.speed += this.acceleration;
		}
		if (this.controls.reverse) {
			this.speed -= this.acceleration;
		}
		const flip = this.speed >= 0 ? 1 : -1;
		if (this.controls.left) {
			this.angle += this.angleChange * flip;
		}
		if (this.controls.right) {
			this.angle -= this.angleChange * flip;
		}
		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed;
		} else if (this.speed < -this.maxSpeed / 2) {
			this.speed = -this.maxSpeed / 2;
		}
		if (this.speed > this.friction) {
			this.speed -= this.friction;
		} else if (this.speed < -this.friction) {
			this.speed += this.friction;
		} else {
			this.speed = 0;
		}
		this.x -= this.speed * Math.sin(this.angle);
		this.y -= this.speed * Math.cos(this.angle);
		this.distance += this.speed;
	}

	//static getPerformance(car) {
	//	if (car.distance <= 0) {
	//		return 0;
	//	}
	//	const displacement = car.startY - car.y;
	//	const performance = displacement / car.distance;
	//	return performance;
	//}
	//
	//static getBestCar(cars) {
	//	let bestCars = cars
	//		.filter(car => !car.damaged)
	//		.toSorted((a, b) => a.y - b.y)
	//		.slice(0, Math.min(cars.length, 5));
	//	if (bestCars.length == 0) {
	//		return cars[0];
	//	}
	//	const bestDistance = bestCars[0].y;
	//	bestCars = bestCars.filter(car => car.y - bestDistance <= carCanvas.height);
	//	let bestCar = bestCars[0];
	//	let bestPerformance = Car.getPerformance(bestCar);
	//	for (let i = 0; i < bestCars.length; i++) {
	//		const performance = Car.getPerformance(bestCars[i]);
	//		if (performance > bestPerformance) {
	//			bestCar = bestCars[i];
	//			bestPerformance = performance;
	//		}
	//	}
	//	return bestCar;
	//}
	
	static getBestCar(cars) {
		return cars.toSorted((a, b) => a.y - b.y)[0];
	}

	draw(carCtx, drawSensors=false) {
		if (this.damaged) {
			carCtx.fillStyle = "gray";
		} else {
			carCtx.fillStyle = this.color;
		}
		carCtx.beginPath();
		carCtx.moveTo(this.polygon[0].x, this.polygon[0].y);
		for (let i = 1; i < this.polygon.length; i++) {
			carCtx.lineTo(this.polygon[i].x, this.polygon[i].y);
		}
		carCtx.fill();
		if (this.sensor && drawSensors) {
			this.sensor.draw(carCtx);
		}
	}
}
