import { Path, SVG, Polygon } from '@wordpress/components';

export const alignTop = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M9 20h6V9H9v11zM4 4v1.5h16V4H4z" />
	</SVG>
);

export const alignBottom = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M15 4H9v11h6V4zM4 18.5V20h16v-1.5H4z" />
	</SVG>
);

export const alignMiddle = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M20 11h-5V4H9v7H4v1.5h5V20h6v-7.5h5z" />
	</SVG>
);

export const splitCells = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="m22.24979,5.97071a1.20586,1.20586 0 0 0 -1.20586,-1.20586l-18.08787,0a1.20586,1.20586 0 0 0 -1.20586,1.20586l0,12.05858a1.20586,1.20586 0 0 0 1.20586,1.20586l18.08787,0a1.20586,1.20586 0 0 0 1.20586,-1.20586l0,-12.05858zm-7.53661,12.05858l-5.42636,0l0,-12.05858l5.42636,0l0,12.05858zm1.20586,0l0,-12.05858l5.1249,0l0,12.05858l-5.1249,0zm-7.83808,0l-5.1249,0l0,-12.05858l5.1249,0l0,12.05858z" />
	</SVG>
);

export const mergeCells = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="m0,0l24,0l0,24l-24,0l0,-24z" fill="none" />
		<Polygon id="svg_2" points="21.5,18 2.5,18 2.5,20 21.5,20 21.5,18 " />
		<Path d="m19.5,10l0,4l-15,0l0,-4l15,0m1,-2l-17,0c-0.55,0 -1,0.45 -1,1l0,6c0,0.55 0.45,1 1,1l17,0c0.55,0 1,-0.45 1,-1l0,-6c0,-0.55 -0.45,-1 -1,-1l0,0z" />
		<Polygon id="svg_4" points="21.5,4 2.5,4 2.5,6 21.5,6 21.5,4 " />
	</SVG>
);
