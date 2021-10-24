/**
 * WordPress dependencies
 */
import { Path, SVG, Polygon } from '@wordpress/components';

export const blockIcon = (
	<SVG viewBox="0 0 24 24">
		<Polygon points="17.5,1.5 7.8,6.1 10.8,6.5 6.5,10.5 16.5,6 13.4,5.5" />
		<Path d="M4,11.2v11.5h16V11.2H4z M5.5,12.8h6v3.5h-6V12.8z M5.5,21.2v-3.5h6v3.5H5.5z M18.5,21.2H13v-3.5h5.5V21.2z M13,16.2v-3.5 h5.5v3.5H13z" />
	</SVG>
);

export const alignTop = (
	<SVG viewBox="0 0 24 24">
		<Path d="M9 20h6V9H9v11zM4 4v1.5h16V4H4z" />
	</SVG>
);

export const alignMiddle = (
	<SVG viewBox="0 0 24 24">
		<Path d="M20 11h-5V4H9v7H4v1.5h5V20h6v-7.5h5z" />
	</SVG>
);

export const alignBottom = (
	<SVG viewBox="0 0 24 24">
		<Path d="M15 4H9v11h6V4zM4 18.5V20h16v-1.5H4z" />
	</SVG>
);

export const mergeCell = (
	<SVG viewBox="0 0 24 24">
		<Path d="M2,19.9V2h20.5v17.9H2z M8.4,3.5H3.3v3h5.1V3.5z M14.8,3.5H9.7v3h5.1C14.8,6.5,14.8,3.5,14.8,3.5z M21.2,3.5h-5.1v3h5.1V3.5 z M20.2,9.5h-16v3h16C20.2,12.5,20.2,9.5,20.2,9.5z M8.4,15.5H3.3v3h5.1V15.5z M14.8,15.5H9.7v3h5.1C14.8,18.5,14.8,15.5,14.8,15.5z M21.2,15.5h-5.1v3h5.1V15.5z" />
	</SVG>
);

export const splitCell = (
	<SVG viewBox="0 0 24 24">
		<Path d="M2,19.9V2h20.5v17.9H2z M21.2,3.5H3.3v3h17.9V3.5z M21.2,15.5H3.3v3h17.9V15.5z M8.8,9.5H4.2v3h4.6V9.5z M14.5,9.5H9.9v3 h4.6C14.5,12.5,14.5,9.5,14.5,9.5z M20.2,9.5h-4.6v3h4.6V9.5z" />
	</SVG>
);

export const borderSeparate = (
	<SVG viewBox="0 0 24 24">
		<Path
			d="M6 5.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM4 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm11-.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5zM13 6a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V6zm5 8.5h-3a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5zM15 13a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2h-3zm-9 1.5h3a.5.5 0 01.5.5v3a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5zM4 15a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3z"
			fillRule="evenodd"
			clipRule="evenodd"
		/>
	</SVG>
);

export const borderCollapse = (
	<SVG viewBox="0 0 24 24">
		<Path
			d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7.8 16.5H5c-.3 0-.5-.2-.5-.5v-6.2h6.8v6.7zm0-8.3H4.5V5c0-.3.2-.5.5-.5h6.2v6.7zm8.3 7.8c0 .3-.2.5-.5.5h-6.2v-6.8h6.8V19zm0-7.8h-6.8V4.5H19c.3 0 .5.2.5.5v6.2z"
			fillRule="evenodd"
			clipRule="evenodd"
		/>
	</SVG>
);

export const borderSolid = (
	<SVG viewBox="0 0 24 24">
		<Path d="M2,10h20v4H2V10z" />
	</SVG>
);

export const borderDotted = (
	<SVG viewBox="0 0 24 24">
		<Path d="M6.5,12c0-1.4-1.1-2.5-2.5-2.5S1.5,10.6,1.5,12s1.1,2.5,2.5,2.5S6.5,13.4,6.5,12z" />
		<Path d="M14.5,12c0-1.4-1.1-2.5-2.5-2.5S9.5,10.6,9.5,12s1.1,2.5,2.5,2.5S14.5,13.4,14.5,12z" />
		<Path d="M22.5,12c0-1.4-1.1-2.5-2.5-2.5s-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5S22.5,13.4,22.5,12z" />
	</SVG>
);

export const borderDashed = (
	<SVG viewBox="0 0 24 24">
		<Path d="M1,10h6v4H1V10z" />
		<Path d="M9,10h6v4H9V10z" />
		<Path d="M17,10h6v4h-6V10z" />
	</SVG>
);

export const borderDouble = (
	<SVG viewBox="0 0 24 24">
		<Path d="M2,9h20v2H2V9z" />
		<Path d="M2,13h20v2H2V13z" />
	</SVG>
);
