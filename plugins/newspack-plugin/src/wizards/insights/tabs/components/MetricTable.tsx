/**
 * MetricTable (NPPD-1649).
 *
 * Renders a rows-shaped metric payload (`type: 'table'`) using the canonical
 * Insights table chrome (`.newspack-insights__table-wrap` + `.newspack-insights__table`
 * from sections.scss), and routes every graceful-failure state through the
 * shared MetricNote / section-empty treatments. Hidden-in-v1 payloads are
 * skipped by the caller.
 */

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { formatCurrency, formatDecimal, formatDuration, formatNumber, formatPercent } from './format';
import MetricNote from './MetricNote';
import type { MetricPayload, MetricRow } from './metrics';

export interface MetricTableColumn {
	key: string;
	label: string;
	/** How to format a numeric cell. Omit for plain strings. */
	format?: 'number' | 'percent' | 'decimal' | 'duration' | 'currency';
	align?: 'left' | 'right';
}

export interface MetricTableProps {
	payload?: MetricPayload;
	columns: MetricTableColumn[];
	emptyMessage: string;
	rowLimit?: number;
	/**
	 * Key of a column to collapse when every displayed row shares the same
	 * meaningful value (e.g. "country"). The column is hidden and a "Showing
	 * {value}" caption is shown above the table. Unset / empty / "(not set)"
	 * values never collapse, so data-quality gaps stay visible.
	 */
	collapseColumn?: string;
}

const UNSET_VALUES = [ '', '(not set)' ];

/** Returns the shared value if `key` is uniform-and-meaningful across rows, else null. */
const uniformValue = ( rows: MetricRow[], key: string ): string | null => {
	if ( rows.length === 0 ) {
		return null;
	}
	const first = rows[ 0 ][ key ];
	if ( first === null || first === undefined || UNSET_VALUES.includes( String( first ) ) ) {
		return null;
	}
	return rows.every( row => row[ key ] === first ) ? String( first ) : null;
};

const formatCell = ( value: string | number | null, format?: MetricTableColumn[ 'format' ] ): string => {
	if ( value === null || value === undefined ) {
		return '—';
	}
	if ( format && typeof value === 'number' ) {
		switch ( format ) {
			case 'percent':
				return formatPercent( value );
			case 'decimal':
				return formatDecimal( value );
			case 'duration':
				return formatDuration( value );
			case 'currency':
				return formatCurrency( value );
			default:
				return formatNumber( value );
		}
	}
	return String( value );
};

const MetricTable = ( { payload, columns, emptyMessage, rowLimit = 10, collapseColumn }: MetricTableProps ) => {
	if ( payload?.overlay ) {
		return <MetricNote overlay={ payload.overlay } />;
	}
	if ( payload?.error ) {
		return <MetricNote error />;
	}
	if ( payload?.not_configured ) {
		return <MetricNote notConfigured />;
	}

	const rows: MetricRow[] = payload && Array.isArray( payload.rows ) ? payload.rows.slice( 0, rowLimit ) : [];

	if ( rows.length === 0 ) {
		return <p className="newspack-insights__section-empty">{ emptyMessage }</p>;
	}

	// Collapse a uniform column (e.g. country) into a caption above the table.
	const collapsedValue = collapseColumn ? uniformValue( rows, collapseColumn ) : null;
	const displayColumns = collapsedValue !== null ? columns.filter( col => col.key !== collapseColumn ) : columns;

	const numClass = ( col: MetricTableColumn ) => ( col.align === 'right' ? 'newspack-insights__table-num' : undefined );

	return (
		<>
			{ payload?.degraded && (
				<p className="newspack-insights__metric-note">
					<span className="newspack-insights__metric-note-icon" aria-hidden="true">
						&#9432;
					</span>
					<span>{ __( 'Singular content filter unavailable; showing all URLs.', 'newspack-plugin' ) }</span>
				</p>
			) }
			{ collapsedValue !== null && (
				<p className="newspack-insights__chart-card-caption">
					{ sprintf(
						/* translators: %s: the single value shared by every row (e.g. a country name). */
						__( 'Showing %s', 'newspack-plugin' ),
						collapsedValue
					) }
				</p>
			) }
			<div className="newspack-insights__table-wrap">
				<table className="newspack-insights__table">
					<thead>
						<tr>
							{ displayColumns.map( col => (
								<th key={ col.key } className={ numClass( col ) }>
									{ col.label }
								</th>
							) ) }
						</tr>
					</thead>
					<tbody>
						{ rows.map( ( row, i ) => (
							<tr key={ i }>
								{ displayColumns.map( col => (
									<td key={ col.key } className={ numClass( col ) }>
										{ formatCell( row[ col.key ] ?? null, col.format ) }
									</td>
								) ) }
							</tr>
						) ) }
					</tbody>
				</table>
			</div>
		</>
	);
};

export default MetricTable;
