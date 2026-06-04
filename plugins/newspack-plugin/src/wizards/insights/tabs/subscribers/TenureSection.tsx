/**
 * TenureSection (NPPD-1616).
 *
 * Tenure of the active subscriber base. Server returns one
 * row per active subscription `{ product_name, tenure_days }`; this
 * component computes median + quartiles + day-bucket counts client-side
 * so the raw distribution remains available for future drill-downs.
 *
 * Hover any bar to see "{label}: {count} subscribers ({pct}%)". The
 * percentage denominator is the sum of all bucket counts (i.e. the
 * total number of tenure rows received). This may differ from the
 * "Active subscribers" scorecard, which counts DISTINCT customers;
 * tenure rows are per-subscription, so a customer with two active
 * subs contributes two tenure rows. The bucket sum is the correct
 * denominator for "% of subscriptions in this tenure band."
 */

/**
 * WordPress dependencies
 */
import { __, sprintf, _n } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { TenureDistributionRow } from '../../api/subscribers';
import { formatNumber } from './format';

export interface TenureSectionProps {
	rows: TenureDistributionRow[];
}

interface TenureBucket {
	key: string;
	label: string;
	count: number;
}

const BUCKETS: { key: string; label: string; min: number; max: number }[] = [
	{ key: '0-30', label: __( '0–30 days', 'newspack-plugin' ), min: 0, max: 30 },
	{ key: '31-90', label: __( '31–90 days', 'newspack-plugin' ), min: 31, max: 90 },
	{ key: '91-180', label: __( '91–180 days', 'newspack-plugin' ), min: 91, max: 180 },
	{ key: '181-365', label: __( '181–365 days', 'newspack-plugin' ), min: 181, max: 365 },
	{ key: '365+', label: __( 'Over 1 year', 'newspack-plugin' ), min: 366, max: Infinity },
];

const percentile = ( sorted: number[], p: number ): number => {
	if ( sorted.length === 0 ) {
		return 0;
	}
	if ( sorted.length === 1 ) {
		return sorted[ 0 ];
	}
	const rank = ( sorted.length - 1 ) * p;
	const lower = Math.floor( rank );
	const upper = Math.ceil( rank );
	const weight = rank - lower;
	return sorted[ lower ] * ( 1 - weight ) + sorted[ upper ] * weight;
};

/**
 * Pick an axis max + 6 evenly-spaced ticks based on the largest
 * bucket count. Spec:
 *   max <= 10  -> 0, 2, 4, 6, 8, 10
 *   max <= 25  -> 0, 5, 10, 15, 20, 25
 *   max <= 50  -> 0, 10, 20, 30, 40, 50
 *   max <= 100 -> 0, 20, 40, 60, 80, 100
 *   max > 100  -> 6 ticks at the smallest "nice" round-number step
 *                 (50, 100, 200, 500, 1000, ...) whose 5x covers max
 */
const chooseAxis = ( max: number ): { axisMax: number; ticks: number[] } => {
	if ( max <= 10 ) {
		return { axisMax: 10, ticks: [ 0, 2, 4, 6, 8, 10 ] };
	}
	if ( max <= 25 ) {
		return { axisMax: 25, ticks: [ 0, 5, 10, 15, 20, 25 ] };
	}
	if ( max <= 50 ) {
		return { axisMax: 50, ticks: [ 0, 10, 20, 30, 40, 50 ] };
	}
	if ( max <= 100 ) {
		return { axisMax: 100, ticks: [ 0, 20, 40, 60, 80, 100 ] };
	}
	const niceSteps = [ 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000 ];
	for ( const step of niceSteps ) {
		if ( step * 5 >= max ) {
			return { axisMax: step * 5, ticks: [ 0, step, step * 2, step * 3, step * 4, step * 5 ] };
		}
	}
	const fallbackStep = Math.ceil( max / 5 / 100000 ) * 100000;
	return {
		axisMax: fallbackStep * 5,
		ticks: [ 0, fallbackStep, fallbackStep * 2, fallbackStep * 3, fallbackStep * 4, fallbackStep * 5 ],
	};
};

const TenureSection = ( { rows }: TenureSectionProps ) => {
	const stats = useMemo( () => {
		if ( rows.length === 0 ) {
			return null;
		}
		const days = rows
			.map( r => r.tenure_days )
			.filter( ( d ): d is number => Number.isFinite( d ) )
			.sort( ( a, b ) => a - b );
		const buckets: TenureBucket[] = BUCKETS.map( b => ( {
			key: b.key,
			label: b.label,
			count: days.filter( d => d >= b.min && d <= b.max ).length,
		} ) );
		const max = Math.max( ...buckets.map( b => b.count ), 1 );
		const { axisMax, ticks } = chooseAxis( max );
		return {
			count: days.length,
			p25: Math.round( percentile( days, 0.25 ) ),
			median: Math.round( percentile( days, 0.5 ) ),
			p75: Math.round( percentile( days, 0.75 ) ),
			buckets,
			axisMax,
			ticks,
		};
	}, [ rows ] );

	if ( ! stats ) {
		return (
			<section className="newspack-insights__section newspack-insights__section--tenure" aria-labelledby="newspack-insights-tenure-heading">
				<h2 id="newspack-insights-tenure-heading" className="newspack-insights__section-heading">
					{ __( 'Subscriber tenure', 'newspack-plugin' ) }
				</h2>
				<p className="newspack-insights__section-empty">
					{ __( 'No subscribers yet — tenure data will appear once subscriptions exist.', 'newspack-plugin' ) }
				</p>
			</section>
		);
	}

	return (
		<section className="newspack-insights__section newspack-insights__section--tenure" aria-labelledby="newspack-insights-tenure-heading">
			<h2 id="newspack-insights-tenure-heading" className="newspack-insights__section-heading">
				{ __( 'Subscriber tenure', 'newspack-plugin' ) }
			</h2>
			<dl className="newspack-insights__stats-summary">
				<div>
					<dt>{ __( 'Median tenure', 'newspack-plugin' ) }</dt>
					<dd>
						{ sprintf(
							/* translators: %d: number of days */
							_n( '%d day', '%d days', stats.median, 'newspack-plugin' ),
							stats.median
						) }
					</dd>
				</div>
				<div>
					<dt>{ __( '25th percentile', 'newspack-plugin' ) }</dt>
					<dd>
						{
							/* translators: %d: number of days */
							sprintf( _n( '%d day', '%d days', stats.p25, 'newspack-plugin' ), stats.p25 )
						}
					</dd>
				</div>
				<div>
					<dt>{ __( '75th percentile', 'newspack-plugin' ) }</dt>
					<dd>
						{
							/* translators: %d: number of days */
							sprintf( _n( '%d day', '%d days', stats.p75, 'newspack-plugin' ), stats.p75 )
						}
					</dd>
				</div>
			</dl>
			<ul className="newspack-insights__bar-list" aria-label={ __( 'Tenure buckets', 'newspack-plugin' ) }>
				{ stats.buckets.map( b => {
					const pct = stats.count > 0 ? Math.round( ( b.count / stats.count ) * 100 ) : 0;
					const tooltip = sprintf(
						/* translators: 1: tenure bucket label (e.g. "0-30 days"), 2: count of subscribers, 3: percentage of total */
						__( '%1$s: %2$s subscribers (%3$d%%)', 'newspack-plugin' ),
						b.label,
						formatNumber( b.count ),
						pct
					);
					return (
						<li key={ b.key } className="newspack-insights__bar-list-item" tabIndex={ 0 } aria-label={ tooltip }>
							<span className="newspack-insights__bar-list-label">{ b.label }</span>
							<span
								className="newspack-insights__bar-list-bar"
								style={ { width: `${ ( b.count / stats.axisMax ) * 100 }%` } }
								aria-hidden="true"
							/>
							<span className="newspack-insights__bar-list-value">{ formatNumber( b.count ) }</span>
							<span className="newspack-insights__bar-list-tooltip" role="tooltip">
								{ tooltip }
							</span>
						</li>
					);
				} ) }
			</ul>
			<div className="newspack-insights__bar-list-axis" aria-hidden="true">
				<span className="newspack-insights__bar-list-axis-spacer" />
				<div className="newspack-insights__bar-list-axis-track">
					{ stats.ticks.map( t => (
						<span key={ t } className="newspack-insights__bar-list-axis-tick">
							{ formatNumber( t ) }
						</span>
					) ) }
				</div>
				<span className="newspack-insights__bar-list-axis-spacer" />
			</div>
		</section>
	);
};

export default TenureSection;
