/**
 * Donors API client (NPPD-1617).
 *
 * Thin wrapper around `@wordpress/api-fetch` for the single Tab 7
 * endpoint: `GET /newspack-insights/v1/donors`. Type definitions
 * mirror the PHP response shape assembled by
 * `Donors_REST_Controller`.
 */

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

export type StorageBackend = 'hpos' | 'legacy';

export interface DonorsClassification {
	backend: StorageBackend;
	donation_product_count: number;
	has_donation_family: boolean;
}

export interface DonorsSnapshot {
	active_donors: number;
	active_recurring_donors: number;
	donation_mrr: number;
	donation_arr: number;
}

export interface DonorsTierVariationRow {
	variation_id: number;
	label: string;
	active_recurring_donors: number;
	new_donors_in_window: number;
	one_time_gifts_in_window: number;
	recurring_revenue_in_window: number;
	lifetime_donation_revenue: number;
}

export interface DonorsTierRow {
	product_id: number;
	name: string;
	is_parent: boolean;
	active_recurring_donors: number;
	new_donors_in_window: number;
	one_time_gifts_in_window: number;
	recurring_revenue_in_window: number;
	lifetime_donation_revenue: number;
	/** Present only when `is_parent` is true. Sorted by active_recurring_donors descending. */
	variations?: DonorsTierVariationRow[];
}

export interface DonorsWindow {
	window: { start: string; end: string };
	new_donors: number;
	lapsed_donors: number;
	one_time_revenue: number;
	recurring_revenue: number;
	total_revenue: number;
	average_gift: number;
	/** Null when the prior-window lapsed cohort is empty ("no data yet"). */
	lapsed_donor_recovery_rate: number | null;
	/** Null when no recurring donors were active at the window start. */
	recurring_donor_retention: number | null;
	donations_by_tier: DonorsTierRow[];
}

export interface DonorsResponse {
	classification: DonorsClassification;
	snapshot: DonorsSnapshot;
	current: DonorsWindow;
	previous: DonorsWindow | null;
}

export interface DonorsQuery {
	start: string;
	end: string;
	compare_start?: string;
	compare_end?: string;
}

const ENDPOINT = '/newspack-insights/v1/donors';

/**
 * Fetch Tab 7 data for the given window pair.
 */
export const fetchDonorsData = async ( query: DonorsQuery ): Promise< DonorsResponse > => {
	const params = new URLSearchParams();
	params.set( 'start', query.start );
	params.set( 'end', query.end );
	if ( query.compare_start && query.compare_end ) {
		params.set( 'compare_start', query.compare_start );
		params.set( 'compare_end', query.compare_end );
	}
	return apiFetch< DonorsResponse >( {
		path: `${ ENDPOINT }?${ params.toString() }`,
		method: 'GET',
	} );
};
