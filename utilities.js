const lerp = (y1, y2, t) => y1 + (y2 - y1) * t;

const getIntersection = (a, b, c, d) => {
	const bottom = (d.x - c.x) * (b.y - a.y) - (d.y - c.y) * (b.x - a.x);
	const ATop = (d.x - c.x) * (c.y - a.y) - (d.y - c.y) * (c.x - a.x);
	const BTop = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

	if (bottom != 0) {
		const A = ATop / bottom;
		const B = BTop / bottom;
		if (A >= 0 && A <= 1 && B >= 0 && B <= 1) {
			return {
				x: lerp(a.x, b.x, A),
				y: lerp(a.y, b.y, A),
				offset: A,
			};
		}
	}
	return null;
};

const polygonIntersection = (poly1, poly2) => {
	for (let i = 0; i < poly1.length; i++) {
		for (let j = 0; j < poly2.length; j++) {
			const touch = getIntersection(
				poly1[i], poly1[(i + 1) % poly1.length],
				poly2[j], poly2[(j + 1) % poly2.length]
			);
			if (touch) {
				return true;
			}
		}
	}
	return false;
};

const colors = [
	"green", "yellow", "blue",
	"cyan", "orange", "teal",
];

function getRGBA(value){
	const alpha=Math.abs(value);
	const R=value<0?0:255;
	const G=R;
	const B=value>0?0:255;
	return "rgba("+R+","+G+","+B+","+alpha+")";
}

const save = () => {
	localStorage.setItem(
		"bestBrain", JSON.stringify(bestCar.brain)
	);
};

const discard = () => {
	localStorage.removeItem("bestBrain");
};
