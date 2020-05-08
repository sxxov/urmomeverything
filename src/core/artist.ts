import {
	createCanvas,
	registerFont,
} from 'canvas';
import paths from '../resources/paths.js';

registerFont(paths.internal.BOLD_FONT_FILE, {
	family: '__font',
	weight: '700',
});

registerFont(paths.internal.REGULAR_FONT_FILE, {
	family: '__font',
	weight: '400',
});

export class Artist {
	private static palette = {
		DARK: 'black',
		LIGHT: 'white',
	}

	private static canvasConfig = {
		width: 1920,
		height: 1920,
	}

	private static textConfig = {
		prefix: 'ur mom',
		fontSize: 207,
		fontFamily: '__font',
	}

	private static fonts = {
		bold: `700 ${Artist.textConfig.fontSize}px ${Artist.textConfig.fontFamily}`,
		regular: `400 ${Artist.textConfig.fontSize}px ${Artist.textConfig.fontFamily}`,
	}

	private canvas = createCanvas(Artist.canvasConfig.width, Artist.canvasConfig.height);
	private canvasCtx = this.canvas.getContext('2d');

	private static isPaletteInverted(index: number): boolean {
		// eg, (4 + 2 == 6) % 6 == 0
		return !!((
			(
				((index + 0) % 6) === 0
			) || (
				((index + 1) % 6) === 0
			) || (
				((index + 2) % 6) === 0
			)
		));
	}

	private static paintBackground(colour: string, canvasCtx: CanvasRenderingContext2D): void {
		canvasCtx.beginPath();
		canvasCtx.rect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
		canvasCtx.fillStyle = colour;
		canvasCtx.fill();
	}

	private static configureText(colour: string, canvasCtx: CanvasRenderingContext2D): void {
		canvasCtx.fillStyle = colour;
		canvasCtx.textBaseline = 'middle';
		canvasCtx.textAlign = 'center';
	}

	private static measureText(text: string, font: string): TextMetrics {
		const canvas = createCanvas(Artist.canvasConfig.width, Artist.canvasConfig.height);
		const canvasCtx = canvas.getContext('2d');

		canvasCtx.font = font;

		return canvasCtx.measureText(text);
	}

	private static paintText(text: string, canvasCtx: CanvasRenderingContext2D): void {
		const padding = 30;
		const space = 48;
		const textWidth = Artist.measureText(text, Artist.fonts.bold).width;
		const prefixWidth = Artist.measureText(Artist.textConfig.prefix, Artist.fonts.regular).width;
		const totalWidth = textWidth + space + prefixWidth;
		const centre = {
			x: canvasCtx.canvas.width / 2,
			y: canvasCtx.canvas.height / 2,
		};

		// get the available space to play with after subtracting left & right padding
		const workingWidth = this.canvasConfig.width - (padding * 2);

		switch (true) {
		// text is too wide to fit on one line, even without prefix
		case textWidth > workingWidth: {
			let maxTextLengthOnSingleLine = 0;
			let textLine1 = null;
			let textLine2 = null;

			// get the maximum amount of characters that can fit on a line
			for (let i = 0, l = text.length; i < l; ++i) {
				const { width } = Artist.measureText(text.substring(0, l - i), Artist.fonts.bold);

				if (width <= workingWidth) {
					maxTextLengthOnSingleLine = l - i;

					break;
				}
			}

			// if 2nd line text is not a lot, just make both lines the same length
			if (maxTextLengthOnSingleLine - text.length <= 3) {
				textLine1 = text.substring(0, Math.floor(text.length / 2));
				textLine2 = text.substring(Math.floor(text.length / 2), text.length);
			} else {
				textLine1 = text.substring(0, maxTextLengthOnSingleLine);
				textLine2 = text.substring(maxTextLengthOnSingleLine, text.length);
			}

			// x: centre, y: above centre
			paintRegular(
				Artist.textConfig.prefix,
				centre.x,
				centre.y - Artist.textConfig.fontSize + 30,
			);
			// x: centre, y, centre
			paintBold(
				`${textLine1}-`,
				centre.x,
				centre.y,
			);
			// x: centre, y: below centre
			paintBold(
				textLine2,
				centre.x,
				centre.y + Artist.textConfig.fontSize - 30,
			);

			break;
		}
		// text and prefix too wide to fit inside 'workingWidth'
		case totalWidth > workingWidth: {
			// x: centre, y: above centre
			paintRegular(
				Artist.textConfig.prefix,
				centre.x,
				centre.y - Artist.textConfig.fontSize / 2 + 15,
			);
			// x: centre, y: below centre
			paintBold(
				text,
				centre.x,
				centre.y + Artist.textConfig.fontSize / 2 - 15,
			);

			break;
		}
		// text and prefix can fit inside of 'workingWidth'
		default: {
			// x: depends, y: centre
			paintRegular(
				Artist.textConfig.prefix,
				centre.x - (totalWidth / 2) + (prefixWidth / 2) - 8,
				centre.y,
			);
			// x: depends, y: centre
			paintBold(
				text,
				centre.x + (totalWidth / 2) - (textWidth / 2) - 8,
				centre.y,
			);
		}
		}

		function paintRegular(string: string, x: number, y: number): void {
			canvasCtx.font = Artist.fonts.regular;
			canvasCtx.fillText(string, x, y);
		}

		function paintBold(string: string, x: number, y: number): void {
			canvasCtx.font = Artist.fonts.bold;
			canvasCtx.fillText(string, x, y);
		}
	}

	public paint(word: string, index: number): Buffer {
		// paint canvas background (default: light)
		Artist.paintBackground(
			Artist.isPaletteInverted(index)
				? Artist.palette.DARK
				: Artist.palette.LIGHT,
			this.canvasCtx,
		);

		// configure text styles
		Artist.configureText(
			Artist.isPaletteInverted(index)
				? Artist.palette.LIGHT
				: Artist.palette.DARK,
			this.canvasCtx,
		);

		// paint text
		Artist.paintText(
			word,
			this.canvasCtx,
		);

		// debugCanvas();

		const buffer = this.canvas.toBuffer('image/jpeg', {
			quality: 1,
		});

		return buffer;
	}
}
