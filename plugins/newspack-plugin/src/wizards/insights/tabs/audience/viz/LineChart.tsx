/**
 * LineChart (NPPD-1649) — tab-local time-series line.
 *
 * Dependency-free SVG polyline scaled to the data range, with a subtle area
 * fill. Used for "active readers over time" (Audience) and "engagement by day
 * of week" (Engagement, which imports this component per the v1 plan).
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { formatNumber } from '../../components/format';

export interface LinePoint {
	label: string;
	value: number;
}

export interface LineChartProps {
	points: LinePoint[];
}

const W = 600;
const H = 160;
const PAD = 8;

const LineChart = ( { points }: LineChartProps ) => {
	if ( points.length === 0 ) {
		return <p className="newspack-insights__chart-empty">{ __( 'No data in this timeframe.', 'newspack-plugin' ) }</p>;
	}

	const values = points.map( p => p.value || 0 );
	const max = Math.max( ...values, 1 );
	const min = Math.min( ...values, 0 );
	const span = max - min || 1;
	const stepX = points.length > 1 ? ( W - PAD * 2 ) / ( points.length - 1 ) : 0;

	const coords = points.map( ( p, i ) => {
		const x = PAD + i * stepX;
		const y = H - PAD - ( ( ( p.value || 0 ) - min ) / span ) * ( H - PAD * 2 );
		return [ x, y ] as const;
	} );

	const line = coords.map( ( [ x, y ] ) => `${ x.toFixed( 1 ) },${ y.toFixed( 1 ) }` ).join( ' ' );
	const area = `${ PAD },${ H - PAD } ${ line } ${ ( PAD + ( points.length - 1 ) * stepX ).toFixed( 1 ) },${ H - PAD }`;

	const lastLabel = points[ points.length - 1 ].label;
	const a11y = __( 'Time-series chart', 'newspack-plugin' );

	return (
		<div className="newspack-insights__line">
			<svg viewBox={ `0 0 ${ W } ${ H }` } className="newspack-insights__line-svg" role="img" aria-label={ a11y } preserveAspectRatio="none">
				<polygon className="newspack-insights__line-area is-series-0" points={ area } />
				<polyline className="newspack-insights__line-stroke is-series-0" points={ line } fill="none" />
			</svg>
			<div className="newspack-insights__line-meta">
				<span>{ points[ 0 ].label }</span>
				<span>
					{ /* translators: shown as "peak: 4,300" under a line chart. */ }
					{ __( 'peak', 'newspack-plugin' ) }: { formatNumber( max ) }
				</span>
				<span>{ lastLabel }</span>
			</div>
		</div>
	);
};

export default LineChart;
