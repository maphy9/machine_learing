class Road {
	constructor(x, width, laneCount=3) {
		this.x = x;
		this.width = width;
		this.laneCount = laneCount;

		this.left = x - width / 2;
		this.right = x + width / 2;
		const infinity = 1000000;
		this.top = -infinity;
		this.bottom = infinity;

		const topLeft = {
			x: this.left,
			y: this.top,
		};
		const topRight = {
			x: this.right,
			y: this.top,
		};
		const bottomLeft = {
			x: this.left,
			y: this.bottom,
		};
		const bottomRight = {
			x: this.right,
			y: this.bottom,
		};
		this.borders = [
			[topLeft, bottomLeft],
			[topRight, bottomRight],
		]
	}

	getLaneCenter(laneIndex) {
		const x1 = lerp(
			this.left,
			this.right,
			laneIndex / this.laneCount
		);
		const x2 = lerp(
			this.left,
			this.right,
			(laneIndex + 1) / this.laneCount
		);
		return lerp(x1, x2, 0.5);
	}

	draw(carCtx) {
		carCtx.lineWidth = 5;
		carCtx.strokeStyle = "white";

		carCtx.setLineDash([20, 20]);
		for (let i = 1; i < this.laneCount; i++) {
			carCtx.beginPath();
			const position = lerp(
				this.left,
				this.right,
				i / this.laneCount,
			)
			carCtx.moveTo(position, this.top);
			carCtx.lineTo(position, this.bottom);
			carCtx.stroke();
		}

		carCtx.setLineDash([]);
		for (const border of this.borders) {
			carCtx.beginPath();
			carCtx.moveTo(border[0].x, border[0].y);
			carCtx.lineTo(border[1].x, border[1].y);
			carCtx.stroke();
		}
	}
}
