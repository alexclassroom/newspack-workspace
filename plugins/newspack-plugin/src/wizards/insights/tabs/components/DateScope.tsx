/**
 * DateScope (NPPD-1649).
 *
 * Small muted caption under a windowed section's description showing the active
 * date-range scope (mirrors the Subscribers tab pattern). Preset ranges read as
 * "Last 30 days" / "This month"; a custom range reads "From May 10 to June 8".
 */

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { DateRange } from '../../state/useDateRange';
import { formatShortDate } from './format';

export interface DateScopeProps {
	range: DateRange;
}

const PRESET_LABELS: Record< string, string > = {
	'last-7': __( 'Last 7 days', 'newspack-plugin' ),
	'last-30': __( 'Last 30 days', 'newspack-plugin' ),
	'last-90': __( 'Last 90 days', 'newspack-plugin' ),
	'this-month': __( 'This month', 'newspack-plugin' ),
	'last-month': __( 'Last month', 'newspack-plugin' ),
};

const DateScope = ( { range }: DateScopeProps ) => {
	let label = PRESET_LABELS[ range.preset ];
	if ( ! label ) {
		// Custom range — dates arrive as YYYY-MM-DD; formatShortDate wants YYYYMMDD.
		const from = formatShortDate( ( range.start || '' ).replace( /-/g, '' ) );
		const to = formatShortDate( ( range.end || '' ).replace( /-/g, '' ) );
		if ( ! from || ! to ) {
			return null;
		}
		label = sprintf(
			/* translators: 1: start date (e.g. "May 10"), 2: end date (e.g. "June 8"). */
			__( 'From %1$s to %2$s', 'newspack-plugin' ),
			from,
			to
		);
	}

	return <p className="newspack-insights__date-scope">{ label }</p>;
};

export default DateScope;
