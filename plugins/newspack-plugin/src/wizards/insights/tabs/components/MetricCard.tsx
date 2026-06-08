/**
 * MetricCard (NPPD-1616, extended for NPPD-1604 and NPPD-1649).
 *
 * Scorecard atom: label (top) → value + optional delta (vertically
 * centered hero region) → description (pinned to the bottom). Every
 * card carries the brand-color top accent so all cards in a row read
 * as a single coherent unit, and the hero numbers line up at the same
 * vertical position regardless of label or description height.
 *
 * `lowerIsBetter` flips the green/red delta tone for metrics where a
 * decrease is desirable (refund rate, churned subscriber count).
 *
 * `pending` (NPPD-1604) renders the value normally but suppresses the
 * comparison delta even when `previousValue` is supplied.
 *
 * `overlay` / `error` (NPPD-1649) render graceful failure states in
 * place of the value: `overlay` for a missing GA4 custom dimension
 * ("Custom dimension `<param>` not detected"), `error` for a generic
 * data failure. Both are additive — every existing call site leaves
 * them undefined, so its rendering is unchanged.
 */

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { formatCurrency, formatDecimal, formatDuration, formatNumber, formatPercent, formatDelta, deltaTone } from './format';

export type MetricFormat = 'number' | 'currency' | 'percent' | 'decimal' | 'duration';

export interface MetricCardOverlay {
	type: string;
	dimensions: string[];
}

export interface MetricCardProps {
	label: string;
	value?: number;
	format?: MetricFormat;
	/** Null is treated the same as undefined — no comparison delta is rendered. */
	previousValue?: number | null;
	description?: string;
	lowerIsBetter?: boolean;
	secondary?: string;
	pending?: boolean;
	/** Missing-custom-dimension state. When set, the value is replaced by overlay copy. */
	overlay?: MetricCardOverlay;
	/** Generic failure message. When set, the card renders an error state. */
	error?: string;
	/** URL for the "see setup docs" link in the custom-dimension overlay. */
	setupDocsUrl?: string;
}

const formatValue = ( v: number, fmt: MetricFormat ): string => {
	switch ( fmt ) {
		case 'currency':
			return formatCurrency( v );
		case 'percent':
			return formatPercent( v );
		case 'decimal':
			return formatDecimal( v );
		case 'duration':
			return formatDuration( v );
		default:
			return formatNumber( v );
	}
};

const PLACEHOLDER = '—';

const MetricCard = ( props: MetricCardProps ) => {
	const {
		label,
		value = 0,
		format = 'number',
		previousValue,
		description,
		lowerIsBetter = false,
		secondary,
		pending = false,
		overlay,
		error,
		setupDocsUrl,
	} = props;

	// Error state: no value, no delta.
	if ( error ) {
		return (
			<div className="newspack-insights__metric-card newspack-insights__metric-card--error">
				<div className="newspack-insights__metric-card-label">{ label }</div>
				<div className="newspack-insights__metric-card-body">
					<div className="newspack-insights__metric-card-value newspack-insights__metric-card-value--muted">{ PLACEHOLDER }</div>
					<div className="newspack-insights__metric-card-note" title={ error }>
						{ __( 'Data temporarily unavailable.', 'newspack-plugin' ) }
					</div>
				</div>
				{ description && <div className="newspack-insights__metric-card-description">{ description }</div> }
			</div>
		);
	}

	// Custom-dimension-missing overlay state.
	if ( overlay ) {
		const param = overlay.dimensions[ 0 ] ?? '';
		const overlayText = sprintf(
			/* translators: %s: GA4 custom dimension parameter name */
			__( 'Custom dimension %s not detected', 'newspack-plugin' ),
			param
		);
		return (
			<div className="newspack-insights__metric-card newspack-insights__metric-card--overlay">
				<div className="newspack-insights__metric-card-label">{ label }</div>
				<div className="newspack-insights__metric-card-body">
					<div className="newspack-insights__metric-card-value newspack-insights__metric-card-value--muted">{ PLACEHOLDER }</div>
					<div className="newspack-insights__metric-card-note">
						<code>{ overlayText }</code>
						{ setupDocsUrl && (
							<>
								{ ' ' }
								<a href={ setupDocsUrl } target="_blank" rel="noreferrer">
									{ __( 'See setup docs', 'newspack-plugin' ) }
								</a>
							</>
						) }
					</div>
				</div>
				{ description && <div className="newspack-insights__metric-card-description">{ description }</div> }
			</div>
		);
	}

	const hasComparison = ! pending && typeof previousValue === 'number';
	const delta = hasComparison ? formatDelta( value, previousValue as number ) : null;
	const tone = hasComparison ? deltaTone( value, previousValue as number, lowerIsBetter ) : 'neutral';
	const deltaA11y =
		hasComparison && delta
			? sprintf(
					/* translators: %s: signed percent change from previous timeframe */
					__( '%s vs previous timeframe', 'newspack-plugin' ),
					delta
			  )
			: null;

	return (
		<div className="newspack-insights__metric-card">
			<div className="newspack-insights__metric-card-label">{ label }</div>
			<div className="newspack-insights__metric-card-body">
				<div className="newspack-insights__metric-card-value">{ formatValue( value, format ) }</div>
				{ secondary && <div className="newspack-insights__metric-card-secondary">{ secondary }</div> }
				{ hasComparison && delta && (
					<div
						className={ `newspack-insights__metric-card-delta newspack-insights__metric-card-delta--${ tone }` }
						aria-label={ deltaA11y ?? undefined }
					>
						{ delta }
					</div>
				) }
			</div>
			{ description && <div className="newspack-insights__metric-card-description">{ description }</div> }
		</div>
	);
};

export default MetricCard;
