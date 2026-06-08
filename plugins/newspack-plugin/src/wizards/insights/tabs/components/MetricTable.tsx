/**
 * MetricTable (NPPD-1649).
 *
 * Renders a rows-shaped metric payload (`type: 'table'`) as a table, handling
 * every graceful-failure state the orchestrator can return: custom-dimension
 * overlay, generic error, degraded (article filter unavailable), and the
 * empty / no-data case. Hidden-in-v1 payloads are skipped by the caller.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { formatCurrency, formatDecimal, formatDuration, formatNumber, formatPercent } from './format';
import { SETUP_DOCS_URL, type MetricPayload, type MetricRow } from './metrics';

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
}

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

const Note = ( { children }: { children: React.ReactNode } ) => <p className="newspack-insights__table-note">{ children }</p>;

const MetricTable = ( { payload, columns, emptyMessage, rowLimit = 10 }: MetricTableProps ) => {
	if ( ! payload ) {
		return <Note>{ emptyMessage }</Note>;
	}

	if ( payload.overlay ) {
		const param = payload.overlay.dimensions[ 0 ] ?? '';
		return (
			<Note>
				<code>
					{ /* translators: %s is a GA4 custom dimension parameter name. */ }
					{ __( 'Custom dimension', 'newspack-plugin' ) } { param } { __( 'not detected', 'newspack-plugin' ) }
				</code>{ ' ' }
				<a href={ SETUP_DOCS_URL } target="_blank" rel="noreferrer">
					{ __( 'See setup docs', 'newspack-plugin' ) }
				</a>
			</Note>
		);
	}

	if ( payload.error ) {
		return <Note>{ __( 'Data temporarily unavailable.', 'newspack-plugin' ) }</Note>;
	}

	const rows: MetricRow[] = Array.isArray( payload.rows ) ? payload.rows.slice( 0, rowLimit ) : [];

	if ( rows.length === 0 ) {
		return <Note>{ emptyMessage }</Note>;
	}

	return (
		<>
			{ payload.degraded && <Note>{ __( 'Singular content filter unavailable; showing all URLs.', 'newspack-plugin' ) }</Note> }
			<table className="newspack-insights__table">
				<thead>
					<tr>
						{ columns.map( col => (
							<th key={ col.key } className={ col.align === 'right' ? 'is-right' : undefined }>
								{ col.label }
							</th>
						) ) }
					</tr>
				</thead>
				<tbody>
					{ rows.map( ( row, i ) => (
						<tr key={ i }>
							{ columns.map( col => (
								<td key={ col.key } className={ col.align === 'right' ? 'is-right' : undefined }>
									{ formatCell( row[ col.key ] ?? null, col.format ) }
								</td>
							) ) }
						</tr>
					) ) }
				</tbody>
			</table>
		</>
	);
};

export default MetricTable;
