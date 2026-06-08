/**
 * Engagement › Reader segments (NPPD-1649, Section 3).
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { InsightsWindow } from '../../../api/audience';
import MetricTable from '../../components/MetricTable';

export interface SectionProps {
	current: InsightsWindow;
	previous: InsightsWindow | null;
}

const SESSIONS_COL = { key: 'sessions', label: __( 'Sessions', 'newspack-plugin' ), format: 'number' as const, align: 'right' as const };
const PAGES_COL = { key: 'avg_pages_per_session', label: __( 'Avg pages', 'newspack-plugin' ), format: 'decimal' as const, align: 'right' as const };
const TIME_COL = { key: 'avg_engagement_seconds', label: __( 'Avg time', 'newspack-plugin' ), format: 'duration' as const, align: 'right' as const };

const ReaderSegmentsSection = ( { current }: SectionProps ) => (
	<section className="newspack-insights__section" aria-labelledby="newspack-insights-engagement-segments">
		<h2 id="newspack-insights-engagement-segments" className="newspack-insights__section-heading">
			{ __( 'Reader segments', 'newspack-plugin' ) }
		</h2>
		<p className="newspack-insights__section-caption">{ __( 'How engagement differs across devices and reader types.', 'newspack-plugin' ) }</p>
		<div className="newspack-insights__table-grid">
			<div>
				<h3 className="newspack-insights__chart-card-title">{ __( 'Engagement by Device Type', 'newspack-plugin' ) }</h3>
				<MetricTable
					payload={ current.engagement_by_device_type }
					emptyMessage={ __( 'No device data in this timeframe.', 'newspack-plugin' ) }
					columns={ [ { key: 'device', label: __( 'Device', 'newspack-plugin' ) }, SESSIONS_COL, TIME_COL, PAGES_COL ] }
				/>
			</div>
			<div>
				<h3 className="newspack-insights__chart-card-title">{ __( 'Engagement by Returning vs New', 'newspack-plugin' ) }</h3>
				<MetricTable
					payload={ current.engagement_by_returning_vs_new }
					emptyMessage={ __( 'No segment data in this timeframe.', 'newspack-plugin' ) }
					columns={ [ { key: 'reader_type', label: __( 'Reader type', 'newspack-plugin' ) }, SESSIONS_COL, PAGES_COL, TIME_COL ] }
				/>
			</div>
			<div>
				<h3 className="newspack-insights__chart-card-title">{ __( 'Engagement by Newsletter Status', 'newspack-plugin' ) }</h3>
				<MetricTable
					payload={ current.engagement_by_newsletter_status }
					emptyMessage={ __( 'No newsletter-status data in this timeframe.', 'newspack-plugin' ) }
					columns={ [ { key: 'segment', label: __( 'Segment', 'newspack-plugin' ) }, SESSIONS_COL, PAGES_COL, TIME_COL ] }
				/>
			</div>
		</div>
	</section>
);

export default ReaderSegmentsSection;
