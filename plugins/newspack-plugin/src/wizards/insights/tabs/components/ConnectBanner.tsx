/**
 * ConnectBanner (NPPD-1649).
 *
 * Full-tab state shown when the orchestrator returns
 * `{ tab_error: 'oauth_not_connected', banner_text }` — i.e. the publisher
 * has no Google Analytics connection. Replaces all section content with a
 * single connect CTA. Used by both AudienceTab and EngagementTab.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const CONNECTIONS_URL = '/wp-admin/admin.php?page=newspack-connections';

export interface ConnectBannerProps {
	text?: string;
}

const ConnectBanner = ( { text }: ConnectBannerProps ) => (
	<div className="newspack-insights__connect-banner" role="status">
		<p className="newspack-insights__connect-banner-text">
			{ text || __( 'Connect Google Analytics in Newspack → Connections to see this tab.', 'newspack-plugin' ) }
		</p>
		<a className="newspack-insights__connect-banner-cta" href={ CONNECTIONS_URL }>
			{ __( 'Connect Google Analytics →', 'newspack-plugin' ) }
		</a>
	</div>
);

export default ConnectBanner;
