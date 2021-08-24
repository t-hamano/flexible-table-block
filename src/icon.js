/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Path, SVG, Polygon, Rect } from '@wordpress/components';

export const fsbIcon = (
	<SVG viewBox="0 0 24 24">
		<Polygon points="17.5,1.5 7.8,6.1 10.8,6.5 6.5,10.5 16.5,6 13.4,5.5"/>
		<Path d="M4,11.2v11.5h16V11.2H4z M5.5,12.8h6v3.5h-6V12.8z M5.5,21.2v-3.5h6v3.5H5.5z M18.5,21.2H13v-3.5h5.5V21.2z M13,16.2v-3.5 h5.5v3.5H13z"/>
	</SVG>
);

export const borderSolid = (
	<SVG viewBox="0 0 24 24">
		<Path d="M2,10h20v4H2V10z"/>
	</SVG>
);

export const borderDotted = (
	<SVG viewBox="0 0 24 24">
		<Path d="M6.5,12c0-1.4-1.1-2.5-2.5-2.5S1.5,10.6,1.5,12s1.1,2.5,2.5,2.5S6.5,13.4,6.5,12z"/>
		<Path d="M14.5,12c0-1.4-1.1-2.5-2.5-2.5S9.5,10.6,9.5,12s1.1,2.5,2.5,2.5S14.5,13.4,14.5,12z"/>
		<Path d="M22.5,12c0-1.4-1.1-2.5-2.5-2.5s-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5S22.5,13.4,22.5,12z"/>
	</SVG>
);

export const borderDashed = (
	<SVG viewBox="0 0 24 24">
		<Path d="M1,10h6v4H1V10z"/>
		<Path d="M9,10h6v4H9V10z"/>
		<Path d="M17,10h6v4h-6V10z"/>
	</SVG>
);

export const borderDouble = (
	<SVG viewBox="0 0 24 24">
		<Path d="M2,9h20v2H2V9z"/>
		<Path d="M2,13h20v2H2V13z"/>
	</SVG>
);

export const borderAll = (
	<SVG viewBox="0 0 24 24" aria-label={ __( 'Border all', 'flexible-table-block' ) }>
		<Path d="M5,3H3v18h2V3z M3,21h18v-2H3V21z M19,21h2V3h-2V21z M3,5h18V3H3V5z"/>
	</SVG>
);

export const borderTop = (
	<SVG viewBox="0 0 24 24" aria-label={ __( 'Border Top', 'flexible-table-block' ) }>
		<Rect x="3" y="7" width="2" height="2"/>
		<Rect x="19" y="7" width="2" height="2"/>
		<Rect x="19" y="15" width="2" height="2"/>
		<Rect x="19" y="11" width="2" height="2"/>
		<Rect x="7" y="19" width="2" height="2"/>
		<Rect x="3" y="11" width="2" height="2"/>
		<Rect x="3" y="3" width="18" height="2"/>
		<Rect x="19" y="19" width="2" height="2"/>
		<Rect x="15" y="19" width="2" height="2"/>
		<Rect x="3" y="15" width="2" height="2"/>
		<Rect x="3" y="19" width="2" height="2"/>
		<Rect x="11" y="19" width="2" height="2"/>
	</SVG>
);

export const borderRight = (
	<SVG viewBox="0 0 24 24" aria-label={ __( 'Border Right', 'flexible-table-block' ) }>
		<Rect x="15" y="3" width="2" height="2"/>
		<Rect x="15" y="19" width="2" height="2"/>
		<Rect x="7" y="19" width="2" height="2"/>
		<Rect x="11" y="19" width="2" height="2"/>
		<Rect x="3" y="7" width="2" height="2"/>
		<Rect x="11" y="3" width="2" height="2"/>
		<Rect x="19" y="3" width="2" height="18"/>
		<Rect x="3" y="19" width="2" height="2"/>
		<Rect x="3" y="15" width="2" height="2"/>
		<Rect x="7" y="3" width="2" height="2"/>
		<Rect x="3" y="3" width="2" height="2"/>
		<Rect x="3" y="11" width="2" height="2"/>
	</SVG>
);

export const borderBottom = (
	<SVG viewBox="0 0 24 24" aria-label={ __( 'Border Bottom', 'flexible-table-block' ) }>
		<Rect x="19" y="15" width="2" height="2"/>
		<Rect x="3" y="15" width="2" height="2"/>
		<Rect x="3" y="7" width="2" height="2"/>
		<Rect x="3" y="11" width="2" height="2"/>
		<Rect x="15" y="3" width="2" height="2"/>
		<Rect x="19" y="11" width="2" height="2"/>
		<Rect x="3" y="19" width="18" height="2"/>
		<Rect x="3" y="3" width="2" height="2"/>
		<Rect x="7" y="3" width="2" height="2"/>
		<Rect x="19" y="7" width="2" height="2"/>
		<Rect x="19" y="3" width="2" height="2"/>
		<Rect x="11" y="3" width="2" height="2"/>
	</SVG>
);

export const borderLeft = (
	<SVG viewBox="0 0 24 24" aria-label={ __( 'Border Left', 'flexible-table-block' ) }>
		<Rect x="7" y="19" width="2" height="2"/>
		<Rect x="7" y="3" width="2" height="2"/>
		<Rect x="15" y="3" width="2" height="2"/>
		<Rect x="11" y="3" width="2" height="2"/>
		<Rect x="19" y="15" width="2" height="2"/>
		<Rect x="11" y="19" width="2" height="2"/>
		<Rect x="3" y="3" width="2" height="18"/>
		<Rect x="19" y="3" width="2" height="2"/>
		<Rect x="19" y="7" width="2" height="2"/>
		<Rect x="15" y="19" width="2" height="2"/>
		<Rect x="19" y="19" width="2" height="2"/>
		<Rect x="19" y="11" width="2" height="2"/>
	</SVG>
);
