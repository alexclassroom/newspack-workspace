/**
 * ChartCard (NPPD-1649).
 *
 * Frame around a visualization (pie / line / bar) that centralizes the
 * graceful-failure states: hidden_in_v1 (renders nothing), custom-dimension
 * overlay, generic error, and the no-data empty case. The section passes the
 * built chart as children; ChartCard only renders it when the payload is
 * computable with rows.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SETUP_DOCS_URL, type MetricPayload } from './metrics';

export interface ChartCardProps {
	title: string;
	caption?: string;
	payload?: MetricPayload;
	children: React.ReactNode;
}

const ChartCard = ( { title, caption, payload, children }: ChartCardProps ) => {
	if ( ! payload || payload.hidden_in_v1 ) {
		return null;
	}

	let body: React.ReactNode = children;
	if ( payload.overlay ) {
		const param = payload.overlay.dimensions[ 0 ] ?? '';
		body = (
			<p className="newspack-insights__table-note">
				<code>
					{ __( 'Custom dimension', 'newspack-plugin' ) } { param } { __( 'not detected', 'newspack-plugin' ) }
				</code>{ ' ' }
				<a href={ SETUP_DOCS_URL } target="_blank" rel="noreferrer">
					{ __( 'See setup docs', 'newspack-plugin' ) }
				</a>
			</p>
		);
	} else if ( payload.error ) {
		body = <p className="newspack-insights__table-note">{ __( 'Data temporarily unavailable.', 'newspack-plugin' ) }</p>;
	}

	return (
		<div className="newspack-insights__chart-card">
			<h3 className="newspack-insights__chart-card-title">{ title }</h3>
			{ caption && <p className="newspack-insights__chart-card-caption">{ caption }</p> }
			{ body }
		</div>
	);
};

export default ChartCard;
