/**
 * ScorecardSection (NPPD-1617).
 *
 * "Donors at a glance" — current-state metrics that ignore the date
 * picker. Active donors (any), Active recurring donors, Donation
 * MRR, Donation ARR.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { DonorsSnapshot } from '../../api/donors';
import MetricCard from '../components/MetricCard';

export interface ScorecardSectionProps {
	snapshot: DonorsSnapshot;
}

const ScorecardSection = ( { snapshot }: ScorecardSectionProps ) => (
	<section
		className="newspack-insights__section newspack-insights__section--scorecard"
		aria-labelledby="newspack-insights-donors-scorecard-heading"
	>
		<h2 id="newspack-insights-donors-scorecard-heading" className="newspack-insights__section-heading">
			{ __( 'Donors at a glance', 'newspack-plugin' ) }
		</h2>
		<div className="newspack-insights__metric-grid">
			<MetricCard
				label={ __( 'Active donors', 'newspack-plugin' ) }
				value={ snapshot.active_donors }
				format="number"
				description={ __(
					'Distinct customers with an active recurring donation or a one-time gift in the last 12 months',
					'newspack-plugin'
				) }
			/>
			<MetricCard
				label={ __( 'Active recurring donors', 'newspack-plugin' ) }
				value={ snapshot.active_recurring_donors }
				format="number"
				description={ __( 'Distinct customers with at least one active recurring donation', 'newspack-plugin' ) }
			/>
			<MetricCard
				label={ __( 'Donation MRR', 'newspack-plugin' ) }
				value={ snapshot.donation_mrr }
				format="currency"
				description={ __( 'Active recurring donations normalized to a monthly rate', 'newspack-plugin' ) }
			/>
			<MetricCard
				label={ __( 'Donation ARR', 'newspack-plugin' ) }
				value={ snapshot.donation_arr }
				format="currency"
				description={ __( 'Donation MRR × 12', 'newspack-plugin' ) }
			/>
		</div>
	</section>
);

export default ScorecardSection;
