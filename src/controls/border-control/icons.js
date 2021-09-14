/**
 * WordPress dependencies
 */
import { Path, SVG } from '@wordpress/components';

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
