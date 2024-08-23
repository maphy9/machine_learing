class Sensor {
	constructor(car, rayCount=3, rayLength=100, raySpread=Math.PI / 4) {
		this.car = car;
		this.rayCount = rayCount;
		this.rayLength = rayLength;
		this.raySpread = raySpread;
		
		this.rays = [];
		this.readings = [];
	}

	update(borders, traffic) {
		this.#castRays();
		this.readings = [];
		for (let i = 0; i < this.rayCount; i++) {
			this.readings.push(
				this.#getReading(this.rays[i], borders, traffic)
			);
		}
	}

	#getReading(ray, borders, traffic) {
		let touches = [];
		for (const border of borders) {
			const touch = getIntersection(
				ray[0],	ray[1],
				border[0], border[1]
			);
			if (touch) {
				touches.push(touch);
			}
		}
		for (const car of traffic) {
			const polygon = car.polygon;
			for (let i = 0; i < polygon.length; i++) {
				const touch = getIntersection(
					ray[0], ray[1],
					polygon[i], polygon[(i + 1) % polygon.length]
				);
				if (touch) {
					touches.push(touch);
				}
			}
		}
		if (touches.length == 0) {
			return null;
		}
		const offsets = touches.map(el => el.offset);
		const minOffset = Math.min(...offsets);
		return touches.find(el => el.offset == minOffset);
	}

	#castRays() {
		this.rays = [];
		for (let i = 0; i < this.rayCount; i++) {
			const rayAngle = lerp(
				this.raySpread / 2,
				-this.raySpread / 2,
				this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
			) + this.car.angle;
			const start = {
				x: this.car.x,
				y: this.car.y,
			};
			const end = {
				x: this.car.x - this.rayLength * Math.sin(rayAngle),
				y: this.car.y - this.rayLength * Math.cos(rayAngle),
			};
			this.rays.push([start, end]);
		}
	}

	draw(carCtx) {
		carCtx.save();
		carCtx.lineWidth = 4;
		for (let i = 0; i < this.rayCount; i++) {
			let end = this.rays[i][1];
			if (this.readings[i]) {
				end = this.readings[i];
			}
			carCtx.strokeStyle = "yellow";
			carCtx.beginPath();
			carCtx.moveTo(
				this.rays[i][0].x,
				this.rays[i][0].y
			);
			carCtx.lineTo(
				end.x,
				end.y
			);
			carCtx.stroke();

			carCtx.strokeStyle = "black";
			carCtx.beginPath();
			carCtx.moveTo(
				end.x,
				end.y
			);
			carCtx.lineTo(
				this.rays[i][1].x,
				this.rays[i][1].y
			);
			carCtx.stroke();
		}
		carCtx.restore();
	}
}
