/**
 * Engagement › Time patterns (NPPD-1649, Section 4).
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { InsightsWindow } from '../../../api/audience';
import ChartCard from '../../components/ChartCard';
import { toSeries } from '../../components/metrics';
import LineChart from '../../audience/viz/LineChart';

export interface SectionProps {
	current: InsightsWindow;
	previous: InsightsWindow | null;
}

const TimePatternsSection = ( { current }: SectionProps ) => (
	<section className="newspack-insights__section" aria-labelledby="newspack-insights-engagement-time">
		<h2 id="newspack-insights-engagement-time" className="newspack-insights__section-heading">
			{ __( 'Time patterns', 'newspack-plugin' ) }
		</h2>
		<p className="newspack-insights__section-caption">{ __( 'When engagement runs highest.', 'newspack-plugin' ) }</p>
		<div className="newspack-insights__chart-grid">
			<ChartCard
				title={ __( 'Engagement by Day of Week', 'newspack-plugin' ) }
				caption={ __( 'Average engaged session duration per day.', 'newspack-plugin' ) }
				payload={ current.engagement_by_day_of_week }
			>
				<LineChart points={ toSeries( current.engagement_by_day_of_week, 'day_of_week', 'avg_session_duration' ) } />
			</ChartCard>
		</div>
	</section>
);

export default TimePatternsSection;
