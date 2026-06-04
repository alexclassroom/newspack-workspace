/**
 * RetentionSection (NPPD-1617).
 *
 * Donor retention metrics. Both are window-scoped and visualised as
 * percentages with a descriptive subtitle.
 *
 * - Lapsed donor recovery rate: of donors who lapsed in the prior
 *   window of equal length, the fraction who made a new donation in
 *   the current window. Higher is better.
 * - Recurring donor retention: of recurring donors active at the
 *   window start, the fraction still active now. Higher is better.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { DonorsWindow } from '../../api/donors';
import MetricCard from '../components/MetricCard';

export interface RetentionSectionProps {
	current: DonorsWindow;
	previous: DonorsWindow | null;
}

const RetentionSection = ( { current, previous }: RetentionSectionProps ) => (
	<section
		className="newspack-insights__section newspack-insights__section--retention"
		aria-labelledby="newspack-insights-donors-retention-heading"
	>
		<h2 id="newspack-insights-donors-retention-heading" className="newspack-insights__section-heading">
			{ __( 'Retention', 'newspack-plugin' ) }
		</h2>
		<div className="newspack-insights__metric-grid">
			<MetricCard
				label={ __( 'Lapsed donor recovery rate', 'newspack-plugin' ) }
				value={ current.lapsed_donor_recovery_rate }
				format="percent"
				previousValue={ previous?.lapsed_donor_recovery_rate }
				description={ __( 'Donors who lapsed in the previous timeframe and returned to donate in this one', 'newspack-plugin' ) }
			/>
			<MetricCard
				label={ __( 'Recurring donor retention', 'newspack-plugin' ) }
				value={ current.recurring_donor_retention }
				format="percent"
				previousValue={ previous?.recurring_donor_retention }
				description={ __( 'Recurring donors active at the start of this timeframe who are still active now', 'newspack-plugin' ) }
			/>
		</div>
	</section>
);

export default RetentionSection;
