/**
 * RetentionSection (NPPD-1617).
 *
 * Donor retention metrics. Both rates are derived from cohorts that
 * may legitimately not exist yet on a fresh or young site (no donors
 * lapsed in the prior window; no recurring donors active at the
 * window start), so the storage returns `null` for those cases. The
 * UI distinguishes "no data yet" (null) from a real 0%:
 *
 *   both null   → single section-wide explanatory card
 *   one null    → render the card that has data + a note on the other
 *   both numbers → render both normally
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

const RECOVERY_LABEL = () => __( 'Lapsed donor recovery rate', 'newspack-plugin' );
const RECOVERY_DESCRIPTION = () => __( 'Donors who lapsed in the previous timeframe and returned to donate in this one', 'newspack-plugin' );

const RETENTION_LABEL = () => __( 'Recurring donor retention', 'newspack-plugin' );
const RETENTION_DESCRIPTION = () => __( 'Recurring donors active at the start of this timeframe who are still active now', 'newspack-plugin' );

const RetentionSection = ( { current, previous }: RetentionSectionProps ) => {
	const recoveryRate = current.lapsed_donor_recovery_rate;
	const retentionRate = current.recurring_donor_retention;
	const recoveryHasData = typeof recoveryRate === 'number';
	const retentionHasData = typeof retentionRate === 'number';

	const sectionProps = {
		className: 'newspack-insights__section newspack-insights__section--retention',
		'aria-labelledby': 'newspack-insights-donors-retention-heading',
	};

	const heading = (
		<h2 id="newspack-insights-donors-retention-heading" className="newspack-insights__section-heading">
			{ __( 'Retention', 'newspack-plugin' ) }
		</h2>
	);

	if ( ! recoveryHasData && ! retentionHasData ) {
		return (
			<section { ...sectionProps }>
				{ heading }
				<p className="newspack-insights__section-empty">
					{ __(
						'Retention metrics will appear once your data shows donors lapsing and returning, or recurring donors aging through the selected timeframe.',
						'newspack-plugin'
					) }
				</p>
			</section>
		);
	}

	return (
		<section { ...sectionProps }>
			{ heading }
			<div className="newspack-insights__metric-grid">
				{ recoveryHasData ? (
					<MetricCard
						label={ RECOVERY_LABEL() }
						value={ recoveryRate as number }
						format="percent"
						previousValue={ previous?.lapsed_donor_recovery_rate }
						description={ RECOVERY_DESCRIPTION() }
					/>
				) : (
					<div className="newspack-insights__metric-card newspack-insights__metric-card--empty">
						<div className="newspack-insights__metric-card-label">{ RECOVERY_LABEL() }</div>
						<p className="newspack-insights__metric-card-empty-note">
							{ __( 'No donors lapsed in the previous timeframe yet.', 'newspack-plugin' ) }
						</p>
					</div>
				) }
				{ retentionHasData ? (
					<MetricCard
						label={ RETENTION_LABEL() }
						value={ retentionRate as number }
						format="percent"
						previousValue={ previous?.recurring_donor_retention }
						description={ RETENTION_DESCRIPTION() }
					/>
				) : (
					<div className="newspack-insights__metric-card newspack-insights__metric-card--empty">
						<div className="newspack-insights__metric-card-label">{ RETENTION_LABEL() }</div>
						<p className="newspack-insights__metric-card-empty-note">
							{ __( 'No recurring donors were active at the start of this timeframe.', 'newspack-plugin' ) }
						</p>
					</div>
				) }
			</div>
		</section>
	);
};

export default RetentionSection;
