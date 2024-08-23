class Controls {
	constructor(controlType) {
		this.forward = false;
		this.left = false;
		this.right = false;
		this.reverse = false;
		switch (controlType) {
			case "Player":
				this.#addKeyboardListeners();
				break;
			case "Dummy":
				this.forward = true;
				break;
		}
	}

	#addKeyboardListeners() {
		document.onkeydown = (e) => {
			switch(e.key) {
				case 'a':
					this.left = true;
					break;
				case 'd':
					this.right = true;
					break;
				case 'w':
					this.forward = true;
					break;
				case 's':
					this.reverse = true;
					break;
			}
		}
		document.onkeyup = (e) => {
			switch(e.key) {
				case 'a':
					this.left = false;
					break;
				case 'd':
					this.right = false;
					break;
				case 'w':
					this.forward = false;
					break;
				case 's':
					this.reverse = false;
					break;
			}
		}
	}
}
