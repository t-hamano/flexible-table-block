import { times } from 'lodash';
import classnames from 'classnames';

import {
	Component,
	Fragment
} from '@wordpress/element';

import {
	PanelBody,
	TextControl,
	ToggleControl,
	Button,
	Toolbar,
	DropdownMenu,
	IconButton,
	BaseControl,
	RangeControl,
	Placeholder
} from '@wordpress/components';

import {
	InspectorControls,
	BlockControls,
	PanelColorSettings,
	RichText,
	BlockIcon,
	ColorPalette
} from '@wordpress/block-editor';

import {
	alignLeft,
	alignRight,
	alignCenter,
	blockTable,
	table,
	update,
	tableColumnAfter,
	tableColumnBefore,
	tableColumnDelete,
	tableRowAfter,
	tableRowBefore,
	tableRowDelete
} from '@wordpress/icons';

import {
	alignTop,
	alignMiddle,
	alignBottom,
	splitCells,
	mergeCells
} from './icons';

let willSetContent = null;
let lastValue = '';

class utbTable extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			initRow: 3,
			initCol: 3,
			selectedCell: null,
			rangeSelected: null,
			multiSelected: null,
			sectionSelected: null,
			updated: false
		};

		this.calculateRealColIndex = this.calculateRealColIndex.bind( this );
		this.updateAllCellsStyles = this.updateAllCellsStyles.bind( this );
		this.isMultiSelected = this.isMultiSelected.bind( this );
		this.isRangeSelected = this.isRangeSelected.bind( this );
	}

	componentDidMount() {
		this.calculateRealColIndex( 'head' );
	}

	componentDidUpdate() {
		const {isSelected} = this.props;
		const {selectedCell, updated} = this.state;

		if ( ! isSelected && selectedCell ) {
			this.setState({
				selectedCell: null,
				rangeSelected: null,
				multiSelected: null
			});
		}

		if ( updated ) {
			this.calculateRealColIndex();
			this.updateAllCellsStyles();
			this.setState({updated: false});
		}
	}

	createTable() {
		const {setAttributes} = this.props;
		const {initRow, initCol} = this.state;

		this.setState({updated: true});
		return setAttributes({
			body: times( parseInt( initRow ), () => ({
				cells: times( parseInt( initCol ), () => ({
					content: ''
				}) )
			}) )
		});
	}

	isMultiSelected() {
		const {multiSelected} = this.state;
		return ( multiSelected && 1 < multiSelected.length );
	}

	isRangeSelected() {
		const {rangeSelected} = this.state;
		return ( rangeSelected && rangeSelected.toCell );
	}

	calculateRealColIndex() {
		const {attributes, setAttributes} = this.props;

		[ 'head', 'body', 'foot' ].forEach( ( section ) => {
			if ( ! attributes[section].length ) {
				return null;
			}

			const newSection = attributes[section].map( ( row, cRow ) => {
				return {
					cells: row.cells.map( ( cell, cCol ) => {
						cell.cI = cCol;
						for ( let i = 0; i < cRow; i++ ) {
							for ( let j = 0; j < attributes[section][i].cells.length; j++ ) {
								if ( attributes[section][i].cells[j] && attributes[section][i].cells[j].colSpan ) {
									if ( attributes[section][i].cells[j].rowSpan && i + parseInt( attributes[section][i].cells[j].rowSpan ) > cRow ) {
										if ( 0 === cCol ) {
											if ( attributes[section][i].cells[j].cI <= cell.cI ) {
												cell.cI += parseInt( attributes[section][i].cells[j].colSpan );
											}
										} else {
											const lastColSpan = ! isNaN( parseInt( row.cells[cCol - 1].colSpan ) ) ? parseInt( row.cells[cCol - 1].colSpan ) : 0;
											if ( attributes[section][i].cells[j].cI === row.cells[cCol - 1].cI + 1 ||
												attributes[section][i].cells[j].cI <= row.cells[cCol - 1].cI + lastColSpan
											) {
												cell.cI += parseInt( attributes[section][i].cells[j].colSpan );
											}
										}
									}
								}
							}
						}

						for ( let j = 0; j < cCol; j++ ) {
							if ( row.cells[j]) {
								if ( row.cells[j].colSpan ) {
									cell.cI += parseInt( row.cells[j].colSpan ) - 1;
								}
							}
						}

						return cell;
					})
				};
			});

			setAttributes({[section]: newSection});
		});
	}

	insertRow( offset ) {
		const {selectedCell, sectionSelected} = this.state;

		if ( ! selectedCell ) {
			return null;
		}

		const {attributes, setAttributes} = this.props;
		const currentSection = attributes[sectionSelected];
		const {rowIndex} = selectedCell;
		const newRow = jQuery.extend( true, {}, currentSection[rowIndex]);
		newRow.cells.map( ( cell ) => {
			cell.content = '';

			return cell;
		});
		newRow.cells = newRow.cells.filter( ( cCell ) => ! cCell.rowSpan );

		const newSection = [
			...currentSection.slice( 0, rowIndex + offset ),
			newRow,
			...currentSection.slice( rowIndex + offset )
		].map( ( row, rowIdx ) => ({
			cells: row.cells.map( ( cell ) => {
				if ( cell.rowSpan ) {
					if ( rowIdx <= rowIndex && ( ( rowIdx + parseInt( cell.rowSpan ) - 1 ) >= rowIndex ) ) {
						cell.rowSpan = parseInt( cell.rowSpan ) + 1;
					}
				}
				return cell;
			})
		}) );

		this.setState({
			selectedCell: null,
			sectionSelected: null,
			updated: true
		});
		setAttributes({[sectionSelected]: newSection});
	}

	deleteRow() {
		const {selectedCell, sectionSelected} = this.state;

		if ( ! selectedCell ) {
			return null;
		}

		const {attributes, setAttributes} = this.props;
		const currentSection = attributes[sectionSelected];
		const {rowIndex} = selectedCell;

		const newSection = currentSection.map( ( row, cRowIdx ) => ({
			cells: row.cells.map( ( cell ) => {
				if ( cell.rowSpan ) {
					if ( cRowIdx <= rowIndex && parseInt( cell.rowSpan ) + cRowIdx > rowIndex ) {
						cell.rowSpan = parseInt( cell.rowSpan ) - 1;
						if ( cRowIdx === rowIndex ) {
							const findColIdx = currentSection[cRowIdx + 1].cells.findIndex( ( elm ) => elm.cI === cell.cI || elm.cI > cell.cI );
							currentSection[cRowIdx + 1].cells.splice( findColIdx, 0, cell );
						}
					}
				}

				return cell;
			})
		}) );

		this.setState({
			selectedCell: null,
			sectionSelected: null,
			updated: true
		});

		if ( 2 > newSection.length ) {
			alert( '現在のセクションに、一つ以上の行が必要です。' );
			return false;
		}

		setAttributes({
			[sectionSelected]: newSection.filter( ( row, index ) => index !== rowIndex )
		});
	}

	insertColumn( offset ) {
		const {selectedCell} = this.state;

		if ( ! selectedCell ) {
			return null;
		}

		const {attributes, setAttributes} = this.props;
		const {cI} = selectedCell;
		let countRowSpan = 0;

		this.setState({
			selectedCell: null,
			updated: true
		});

		[ 'head', 'body', 'foot' ].forEach( ( section ) => (
			setAttributes({
				[section]: attributes[section].map( ( row ) => {
					if ( 0 < countRowSpan ) {
						countRowSpan--;
						return row;
					}

					let findColIdx = row.cells.findIndex( ( cell, idx ) => cell.cI === cI || ( row.cells[idx + 1] && row.cells[idx + 1].cI > cI ) );
					if ( -1 === findColIdx ) {
						findColIdx = row.cells.length - 1;
					}

					if ( row.cells[findColIdx].colSpan &&
						row.cells[findColIdx].cI < cI + offset &&
						row.cells[findColIdx].cI + parseInt( row.cells[findColIdx].colSpan ) > cI + offset
					) {
						row.cells[findColIdx].colSpan++;

						if ( row.cells[findColIdx].rowSpan ) {
							countRowSpan = parseInt( row.cells[findColIdx].rowSpan ) - 1;
						}

						return row;
					} else {
						let realOffset = offset;
						if ( row.cells[findColIdx].cI > cI && 1 === offset ) {
							realOffset = 0;
						} else if ( row.cells[findColIdx].cI < cI && 0 === offset ) {
							realOffset = 1;
						}

						return {
							cells: [
								...row.cells.slice( 0, findColIdx + realOffset ),
								{content: ''},
								...row.cells.slice( findColIdx + realOffset )
							]
						};
					}
				})
			})
		) );
	}

	deleteColumn() {
		const {selectedCell} = this.state;

		if ( ! selectedCell ) {
			return null;
		}

		const {attributes, setAttributes} = this.props;
		const {cI} = selectedCell;
		let countRowSpan = 0;

		this.setState({
			selectedCell: null,
			updated: true
		});

		[ 'head', 'body', 'foot' ].forEach( ( section ) => (
			setAttributes({
				[section]: attributes[section].map( ( row ) => {
					if ( 0 < countRowSpan ) {
						countRowSpan--;
						return row;
					}

					const findColIdx = row.cells.findIndex( ( cell, idx ) => cell.cI === cI || ( row.cells[idx + 1] && row.cells[idx + 1].cI > cI ) );

					if ( row.cells[findColIdx].rowSpan ) {
						countRowSpan = parseInt( row.cells[findColIdx].rowSpan ) - 1;
					}

					if ( row.cells[findColIdx].colSpan ) {
						row.cells[findColIdx].colSpan--;
						if ( 1 >= row.cells[findColIdx].colSpan ) {
							delete row.cells[findColIdx].colSpan;
						}

						return row;
					}

					return {
						cells: row.cells.filter( ( cell, index ) => index !== findColIdx )
					};
				})
			})
		) );
	}

	mergeCells() {
		const {rangeSelected, sectionSelected} = this.state;

		if ( ! this.isRangeSelected() ) {
			return null;
		}

		const {attributes, setAttributes} = this.props;
		const {fromCell, toCell} = rangeSelected;
		const currentSection = attributes[sectionSelected];
		const fCell = currentSection[fromCell.rowIdx].cells[fromCell.colIdx];
		const tCell = currentSection[toCell.rowIdx].cells[toCell.colIdx];
		const fcSpan = 'undefined' === typeof fCell.colSpan ? 0 : parseInt( fCell.colSpan ) - 1;
		const frSpan = 'undefined' === typeof fCell.rowSpan ? 0 : parseInt( fCell.rowSpan ) - 1;
		const tcSpan = 'undefined' === typeof tCell.colSpan ? 0 : parseInt( tCell.colSpan ) - 1;
		const trSpan = 'undefined' === typeof tCell.rowSpan ? 0 : parseInt( tCell.rowSpan ) - 1;
		const minRowIdx = Math.min( fromCell.rowIdx, toCell.rowIdx );
		const maxRowIdx = Math.max( fromCell.rowIdx + frSpan, toCell.rowIdx + trSpan );
		const minColIdx = Math.min( fromCell.RCI, toCell.RCI );
		const maxColIdx = Math.max( fromCell.RCI + fcSpan, toCell.RCI + tcSpan );

		const newSection = currentSection.map( ( row, curRowIndex ) => {
			if ( curRowIndex < minRowIdx || curRowIndex > maxRowIdx ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, curColIndex ) => {
					if ( curColIndex === Math.min( fromCell.colIdx, toCell.colIdx ) &&
						curRowIndex === Math.min( fromCell.rowIdx, toCell.rowIdx )
					) {
						const rowSpan = Math.abs( maxRowIdx - minRowIdx ) + 1;
						const colSpan = Math.abs( maxColIdx - minColIdx ) + 1;
						return {
							...cell,
							rowSpan: 1 < rowSpan ? rowSpan : undefined,
							colSpan: 1 < colSpan ? colSpan : undefined
						};
					}

					return cell;
				}).filter( ( cell, cCol ) =>
					cell.cI < minColIdx ||
					( cCol === Math.min( fromCell.colIdx, toCell.colIdx ) && curRowIndex === Math.min( fromCell.rowIdx, toCell.rowIdx ) ) ||
					cell.cI > maxColIdx
				)
			};
		});

		setAttributes({[sectionSelected]: newSection});
		this.setState({
			selectedCell: null,
			sectionSelected: null,
			rangeSelected: null,
			updated: true
		});
	}

	splitMergedCells() {
		const {selectedCell, sectionSelected} = this.state;

		if ( ! selectedCell ) {
			return null;
		}

		const {attributes, setAttributes} = this.props;
		const {colIndex, rowIndex, cI} = selectedCell;

		const cellColSpan = attributes[sectionSelected][rowIndex].cells[colIndex].colSpan ? parseInt( attributes[sectionSelected][rowIndex].cells[colIndex].colSpan ) : 1;
		const cellRowSpan = attributes[sectionSelected][rowIndex].cells[colIndex].rowSpan ? parseInt( attributes[sectionSelected][rowIndex].cells[colIndex].rowSpan ) : 1;
		attributes[sectionSelected][rowIndex].cells[colIndex].colSpan = undefined;
		attributes[sectionSelected][rowIndex].cells[colIndex].rowSpan = undefined;

		const newSection = attributes[sectionSelected].map( ( row, curRowIndex ) => {
			if ( curRowIndex >= rowIndex && curRowIndex < ( rowIndex + cellRowSpan ) ) {
				const findColIdx = row.cells.findIndex( ( cell ) => cell.cI >= cI );
				let startRowFix = 0;
				if ( curRowIndex === rowIndex ) {
					startRowFix = 1;
				}

				return {
					cells: [
						...row.cells.slice( 0, findColIdx + startRowFix ),
						...times( cellColSpan - startRowFix, () => ({content: ''}) ),
						...row.cells.slice( findColIdx + startRowFix )
					]
				};
			}

			return row;
		});

		setAttributes({[sectionSelected]: newSection});
		this.setState({
			selectedCell: null,
			sectionSelected: null,
			updated: true
		});
	}

	static parseStyles( styles ) {
		if ( 'string' !== typeof styles ) {
			return styles;
		}

		return styles
			.split( ';' )
			.filter( style => style.split( ':' )[0] && style.split( ':' )[1])
			.map( style => [
				style.split( ':' )[0].trim().replace( /-./g, c => c.substr( 1 ).toUpperCase() ),
				style.split( ':' )[1].trim()
			])
			.reduce( ( styleObj, style ) => ({
				...styleObj,
				[style[0]]: style[1]
			}), {});
	}

	getCellStyles( style ) {
		const {selectedCell, sectionSelected} = this.state;
		const section = this.props.attributes[sectionSelected];

		if ( ! selectedCell ) {
			return undefined;
		}

		const {rowIndex, colIndex} = selectedCell;

		const styles = utbTable.parseStyles( section[rowIndex].cells[colIndex].styles );

		if ( 'object' === typeof styles ) {
			let convertedStyles = styles[style];

			if ( convertedStyles && 'number' !== typeof convertedStyles && convertedStyles.indexOf( 'px' ) ) {
					convertedStyles = styles[style].replace( /px/g, '' );
			}

			return convertedStyles;
		} else {
			return 'undefined';
		}
	}

	updateCellsStyles( style ) {
		const {selectedCell, rangeSelected, multiSelected, sectionSelected} = this.state;
		if ( ! selectedCell && ! this.isRangeSelected() && ! this.isMultiSelected() ) {
			return null;
		}

		const {attributes, setAttributes} = this.props;
		const {rowIndex, colIndex} = selectedCell;
		const section = attributes[sectionSelected];
		let minRowIdx, maxRowIdx, minColIdx, maxColIdx;

		if ( this.isRangeSelected() ) {
			const {fromCell, toCell} = rangeSelected;
			const fCell = section[fromCell.rowIdx].cells[fromCell.colIdx];
			const tCell = section[toCell.rowIdx].cells[toCell.colIdx];
			const fcSpan = 'undefined' === typeof fCell.colSpan ? 0 : parseInt( fCell.colSpan ) - 1;
			const frSpan = 'undefined' === typeof fCell.rowSpan ? 0 : parseInt( fCell.rowSpan ) - 1;
			const tcSpan = 'undefined' === typeof tCell.colSpan ? 0 : parseInt( tCell.colSpan ) - 1;
			const trSpan = 'undefined' === typeof tCell.rowSpan ? 0 : parseInt( tCell.rowSpan ) - 1;
			minRowIdx = Math.min( fromCell.rowIdx, toCell.rowIdx );
			maxRowIdx = Math.max( fromCell.rowIdx + frSpan, toCell.rowIdx + trSpan );
			minColIdx = Math.min( fromCell.RCI, toCell.RCI );
			maxColIdx = Math.max( fromCell.RCI + fcSpan, toCell.RCI + tcSpan );
		}

		const newSection = section.map( ( row, curRowIndex ) => {
			if ( ! this.isRangeSelected() && ! this.isMultiSelected() && curRowIndex !== rowIndex ||
				( this.isRangeSelected() && ( curRowIndex < minRowIdx || curRowIndex > maxRowIdx ) ) ||
				( this.isMultiSelected() && -1 === multiSelected.findIndex( ( c ) => c.rowIndex === curRowIndex ) )
			) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, curColIndex ) => {
					if ( ! this.isRangeSelected() && ! this.isMultiSelected() && curColIndex === colIndex ||
						( this.isRangeSelected() && ( cell.cI >= minColIdx && cell.cI <= maxColIdx ) ) ||
						( this.isMultiSelected() && -1 < multiSelected.findIndex( ( c ) => c.colIndex === curColIndex && c.rowIndex === curRowIndex ) )
					) {
						cell.styles = utbTable.parseStyles( cell.styles );
						cell.styles = {...cell.styles, ...style};
					}

					return cell;
				})
			};
		});

		setAttributes({[section]: newSection});
	}

	updateAllCellsStyles() {
		const {attributes, setAttributes} = this.props;
		const {
			head,
			body,
			foot,
			padding,
			borderWidth
		} = attributes;

		const paddingVal = !! padding ? padding + 'em' : undefined;

		[ head, body, foot ].forEach( ( section ) => {
			if ( ! section.length ) {
				return null;
			}

			const newSection = section.map( ( row ) => {
				return {
					cells: row.cells.map( ( cell ) => {
						cell.styles = utbTable.parseStyles( cell.styles );
						cell.styles = {
							...cell.styles,
							padding: paddingVal,
							borderWidth: borderWidth
						};
						return cell;
					})
				};
			});

			setAttributes({[section]: newSection});
		});
	}

	updateCellContent( content, cell = null ) {
		const {selectedCell, sectionSelected} = this.state;
		if ( ! selectedCell && ! cell ) {
			return null;
		}

		let rowIndex, colIndex;
		if ( cell ) {
			rowIndex = cell.rowIndex;
			colIndex = cell.colIndex;
		} else {
			rowIndex = selectedCell.rowIndex;
			colIndex = selectedCell.colIndex;
		}

		const {attributes, setAttributes} = this.props;

		const newSection = attributes[sectionSelected].map( ( row, curRowIndex ) => {
			if ( curRowIndex !== rowIndex ) {
				return row;
			}

			return {
				cells: row.cells.map( ( cell, curColIndex ) => {
					if ( curColIndex !== colIndex ) {
						return cell;
					}

					return {
						...cell,
						content
					};
				})
			};
		});

		setAttributes({[sectionSelected]: newSection});
	}

	updateFirstColumnWidth( value ) {
		const {attributes, setAttributes} = this.props;

		[ 'head', 'body', 'foot' ].forEach( ( section ) => {
			if ( ! attributes[section].length ) {
				return null;
			}

			const cell = attributes[section][0].cells[0];

			cell.styles = utbTable.parseStyles( cell.styles );

			if ( 0 === value || 'undefined' === typeof value ) {
				cell.styles = {...cell.styles, width: undefined};
			} else {
				cell.styles = {...cell.styles, width: value + '%'};
			}

			return setAttributes({firstColumnWidth: value});
		});
	}

	toggleSection( section ) {
		const {attributes, setAttributes} = this.props;
		const {sectionSelected} = this.state;
		const {body} = attributes;
		const cellsToAdd = [ {cells: body[0].cells.map( ( cell ) => ({cI: cell.cI, colSpan: cell.colSpan}) )} ];

		if ( sectionSelected === section ) {
			this.setState({
				selectedCell: null,
				sectionSelected: null
			});
		}

		if ( ! attributes[section].length ) {
			return setAttributes({[section]: cellsToAdd});
		}

		return setAttributes({[section]: []});
	}

	renderSection( section ) {
		const {attributes} = this.props;
		const {selectedCell, multiSelected, rangeSelected, sectionSelected} = this.state;

		return attributes[section].map( ({cells}, rowIndex ) => (
			<tr key={rowIndex}>
				{cells.map( ({content, styles, colSpan, rowSpan, cI}, colIndex ) => {
					const cell = {rowIndex, colIndex, cI, section};

					let isSelected = selectedCell &&
						selectedCell.rowIndex === rowIndex &&
						selectedCell.colIndex === colIndex &&
						sectionSelected === section;

					if ( this.isRangeSelected() ) {
						const {fromCell, toCell} = rangeSelected;
						if ( attributes[sectionSelected][fromCell.rowIdx] && attributes[sectionSelected][toCell.rowIdx]) {
							const fCell = attributes[sectionSelected][fromCell.rowIdx].cells[fromCell.colIdx];
							const tCell = attributes[sectionSelected][toCell.rowIdx].cells[toCell.colIdx];
							const fcSpan = 'undefined' === typeof fCell.colSpan ? 0 : parseInt( fCell.colSpan ) - 1;
							const frSpan = 'undefined' === typeof fCell.rowSpan ? 0 : parseInt( fCell.rowSpan ) - 1;
							const tcSpan = 'undefined' === typeof tCell.colSpan ? 0 : parseInt( tCell.colSpan ) - 1;
							const trSpan = 'undefined' === typeof tCell.rowSpan ? 0 : parseInt( tCell.rowSpan ) - 1;

							isSelected = rowIndex >= Math.min( fromCell.rowIdx, toCell.rowIdx ) &&
								rowIndex <= Math.max( fromCell.rowIdx + frSpan, toCell.rowIdx + trSpan ) &&
								cI >= Math.min( fromCell.RCI, toCell.RCI ) &&
								cI <= Math.max( fromCell.RCI + fcSpan, toCell.RCI + tcSpan ) &&
								section === sectionSelected;
						}
					}

					if ( this.isMultiSelected() ) {
						isSelected = -1 < multiSelected.findIndex( ( c ) => c.rowIndex === rowIndex && c.colIndex === colIndex ) &&
							multiSelected[0].section === section;
					}


					const cellClassName = [
						isSelected && 'cell-selected'
					].filter( Boolean ).join( ' ' );

					styles = utbTable.parseStyles( styles );

					return (
						<td key={colIndex}
							className={cellClassName}
							style={styles}
							colSpan={colSpan}
							rowSpan={rowSpan}
							onClick={( e ) => {
								if ( e.shiftKey ) {
									if ( ! rangeSelected ) {
										return;
									}
									if ( ! rangeSelected.fromCell ) {
										return;
									}

									const {fromCell} = rangeSelected;
									if ( section !== fromCell.section ) {
										alert( 'セクションの違うセルを複数選択する事は出来ません。' );
										return;
									}
									const toCell = {
										rowIdx: rowIndex,
										colIdx: colIndex,
										RCI: cI,
										section: section
									};

									this.setState({
										rangeSelected: {fromCell, toCell},
										multiSelected: null
									});
								} else if ( e.ctrlKey || e.metaKey ) {
									const multiCells = multiSelected ? multiSelected : [];
									const existCell = multiCells.findIndex( ( cel ) => cel.rowIndex === rowIndex && cel.colIndex === colIndex );

									if ( multiCells.length && section !== multiCells[0].section ) {
										alert( 'セクションの違うセルを複数選択する事は出来ません。' );
										return;
									}

									if ( -1 === existCell ) {
										multiCells.push( cell );
									} else {
										multiCells.splice( existCell, 1 );
									}

									this.setState({
										multiSelected: multiCells,
										rangeSelected: null
									});
								} else {
									this.setState({
										rangeSelected: {
											fromCell: {
												rowIdx: rowIndex,
												colIdx: colIndex,
												RCI: cI,
												section: section
											}
										},
										multiSelected: [ cell ]
									});
								}
							}}
						>
							<RichText
								value={content}
								onChange={( value ) => {
									if ( willSetContent ) {
										clearTimeout( willSetContent );
									}
									lastValue = value;
									willSetContent = setTimeout( () => this.updateCellContent( value, selectedCell ), 1000 );
								}}
								unstableOnFocus={() => {
									if ( willSetContent ) {
										this.updateCellContent( lastValue, selectedCell );
										clearTimeout( willSetContent );
										willSetContent = null;
									}
									this.setState({
										selectedCell: cell,
										sectionSelected: section
									});
								}}
							/>
						</td>
					);
				})}
			</tr>
		) );
	}

	render() {
		const {attributes, setAttributes, className} = this.props;

		const {
			head,
			body,
			foot,
			firstColumnWidth,
			hasFixedLayout,
			isStackedOnMobile,
			isScrollOnMobile,
			tableWidth,
			fontSize,
			lineHeight,
			padding,
			borderColor,
			borderWidth
		} = attributes;

		const {initRow, initCol, selectedCell} = this.state;

		const tableWidthVal = !! tableWidth ? tableWidth : undefined;
		const fontSizeVal = !! fontSize ? fontSize + 'em' : undefined;
		const lineHeightVal = !! lineHeight ? lineHeight : undefined;
		const borderColorVal = !! borderColor ? borderColor : undefined;

		const currentCell = selectedCell ? body[selectedCell.rowIndex].cells[selectedCell.colIndex] : null;

		const classNames = classnames(
			className,
			{
				'has-fixed-layout': hasFixedLayout,
				'is-stacked-on-mobile': isStackedOnMobile,
				'is-scroll-on-mobile': isScrollOnMobile
			}
		);

		if ( ! body.length ) {
			return (
				<Placeholder
					label={ 'Ultimate Table' }
					icon={ <BlockIcon icon={ blockTable } showColors /> }
					instructions={ '複数のセルを選択する場合は、Ctrlキーを押したままにしてください。セルを範囲選択する場合は、Shiftキーを押したままにしてください。' }
				>
					<div className="blocks-table__placeholder-form">
						<TextControl
							type="number"
							label={'列数'}
							value={initCol}
							onChange={( value ) => this.setState({initCol: value})}
							min="1"
							className="blocks-table__placeholder-input"
						/>
						<TextControl
							type="number"
							label={'行数'}
							value={initRow}
							onChange={( value ) => this.setState({initRow: value})}
							min="1"
							className="blocks-table__placeholder-input"
						/>
						<Button isPrimary
							onClick={() => this.createTable()}>{'表の作成'}
						</Button>
					</div>
				</Placeholder>
			);
		}

		const TABLE_CONTROLS = [
			{
				icon: tableRowBefore,
				title: '上に行を追加',
				isDisabled: ! selectedCell || this.isRangeSelected() || this.isMultiSelected(),
				onClick: () => this.insertRow( 0 )
			},
			{
				icon: tableRowAfter,
				title: '下に行を追加',
				isDisabled: ! selectedCell || this.isRangeSelected() || this.isMultiSelected(),
				onClick: () => this.insertRow( 1 )
			},
			{
				icon: tableRowDelete,
				title: '行の削除',
				isDisabled: ! selectedCell || this.isRangeSelected() || this.isMultiSelected(),
				onClick: () => this.deleteRow()
			},
			{
				icon: tableColumnBefore,
				title: '左に列を追加',
				isDisabled: ! selectedCell || this.isRangeSelected() || this.isMultiSelected(),
				onClick: () => this.insertColumn( 0 )
			},
			{
				icon: tableColumnAfter,
				title: '右に列を追加',
				isDisabled: ! selectedCell || this.isRangeSelected() || this.isMultiSelected(),
				onClick: () => this.insertColumn( 1 )
			},
			{
				icon: tableColumnDelete,
				title: '列の削除',
				isDisabled: ! selectedCell || this.isRangeSelected() || this.isMultiSelected(),
				onClick: () => this.deleteColumn()
			},
			{
				icon: splitCells,
				title: 'セルを分割',
				isDisabled: ! selectedCell ||
					( currentCell && ! currentCell.rowSpan && ! currentCell.colSpan ) ||
					this.isRangeSelected() ||
					this.isMultiSelected(),
				onClick: () => this.splitMergedCells()
			},
			{
				icon: mergeCells,
				title: 'セルを結合',
				isDisabled: ! this.isRangeSelected(),
				onClick: () => this.mergeCells()
			}
		];

		const HORZ_ALIGNMENT_CONTROLS = [
			{
				icon: alignLeft,
				title: '左寄せ',
				align: 'left'
			},
			{
				icon: alignCenter,
				title: '中央寄せ',
				align: 'center'
			},
			{
				icon: alignRight,
				title: '右寄せ',
				align: 'right'
			}
		];

		const VERT_ALIGNMENT_CONTROLS = [
			{
				icon: alignTop,
				title: '上揃え',
				align: 'top'
			},
			{
				icon: alignMiddle,
				title: '中央揃え',
				align: 'middle'
			},
			{
				icon: alignBottom,
				title: '下揃え',
				align: 'bottom'
			}
		];

		return (
			<Fragment>
				<BlockControls>
					<Toolbar>
						<DropdownMenu
							hasArrowIndicator
							icon={table}
							label={'表の編集'}
							controls={TABLE_CONTROLS}
						/>
						<IconButton
							icon={update}
							label={'表の更新'}
							onClick={() => this.calculateRealColIndex()}
						/>
					</Toolbar>
				</BlockControls>
				<InspectorControls>
					<PanelBody title={'表の設定'}>
					<ToggleControl
							label={'表の列幅を固定'}
							checked={hasFixedLayout}
							onChange={() => setAttributes({hasFixedLayout: ! hasFixedLayout})}
						/>
						<ToggleControl
							label={'ヘッダーを表示'}
							checked={head && head.length}
							onChange={() => {
								this.toggleSection( 'head' );
								this.setState({updated: true});
							}}
						/>
						<ToggleControl
							label={'フッターを表示'}
							checked={foot && foot.length}
							onChange={() => {
								this.toggleSection( 'foot' );
								this.setState({updated: true});
							}}
						/>
						<ToggleControl
							label={'モバイルではセルを縦に並べる'}
							checked={isStackedOnMobile}
							onChange={() => setAttributes({isStackedOnMobile: ! isStackedOnMobile})}
						/>
						<ToggleControl
							label={'モバイルでは横にスクロールする'}
							checked={isScrollOnMobile}
							onChange={() => setAttributes({isScrollOnMobile: ! isScrollOnMobile})}
						/>
						<RangeControl
							label={'表の幅 (px)'}
							min={0}
							max={1200}
							value={tableWidth}
							onChange={( value ) => setAttributes({tableWidth: value})}
							initialPosition="0"
							allowReset
						/>
						<RangeControl
							label={'一列目の幅 (%)'}
							min={0}
							max={100}
							value={firstColumnWidth}
							onChange={ ( value ) => this.updateFirstColumnWidth( value )}
							initialPosition="0"
							allowReset
						/>
						<RangeControl
							label={'文字サイズ (em)'}
							min={0.1}
							max={2}
							step={0.1}
							value={fontSize}
							onChange={( value ) => setAttributes({fontSize: value})}
							initialPosition="1"
							allowReset
						/>
						<RangeControl
							label={'行の高さ '}
							min={1}
							max={3}
							step={0.1}
							value={lineHeight}
							onChange={( value ) => setAttributes({lineHeight: value})}
							initialPosition="1.5"
							allowReset
						/>
						<RangeControl
							label={'セルの余白 (em)'}
							min={0}
							max={2}
							step={0.1}
							value={padding}
							onChange={( value ) => {
								setAttributes({padding: value});
								this.setState({updated: true});
							}}
							initialPosition="0.5"
							allowReset
						/>
						<RangeControl
							label={'ボーダー幅 （px)'}
							min={1}
							max={10}
							value={borderWidth}
							onChange={( value ) => {
								setAttributes({borderWidth: value});
								this.setState({updated: true});
							}}
							initialPosition="1"
							allowReset
						/>
						<BaseControl id="border-color" label={'ボーダー色'}>
							<ColorPalette
								value={borderColor}
								onChange={( value ) => setAttributes({borderColor: value})}
							/>
						</BaseControl>
					</PanelBody>
					<PanelBody title={'セルの設定'}>
						<PanelColorSettings
							title={'色設定'}
							initialOpen={false}
							colorSettings={[
								{
									label: '背景色',
									value: this.getCellStyles( 'backgroundColor' ),
									onChange: ( value ) => this.updateCellsStyles({backgroundColor: value})
								},
								{
									label: 'テキスト色',
									value: this.getCellStyles( 'color' ),
									onChange: ( value ) => this.updateCellsStyles({color: value})
								}
							]}
						/>
						<PanelBody title={'テキストの配置'} initialOpen={false}>
							<BaseControl label={'水平配置'}>
								<Toolbar
									controls={HORZ_ALIGNMENT_CONTROLS.map( ( control ) => {
										const isActive = ( this.getCellStyles( 'textAlign' ) === control.align );

										return {
											...control,
											isActive,
											onClick: () => this.updateCellsStyles({textAlign: isActive ? undefined : control.align})
										};
									})}
								/>
							</BaseControl>
							<BaseControl label={'垂直配置'}>
								<Toolbar
									controls={VERT_ALIGNMENT_CONTROLS.map( ( control ) => {
										const isActive = ( this.getCellStyles( 'verticalAlign' ) === control.align );

										return {
											...control,
											isActive,
											onClick: () => this.updateCellsStyles({verticalAlign: isActive ? undefined : control.align})
										};
									})}
								/>
							</BaseControl>
						</PanelBody>
					</PanelBody>
				</InspectorControls>
				<div className={ classNames  } >
					<div
						className="wp-block-ultimate-table-block-table__wrap"
						style={{
							width: tableWidthVal
						}}
					>
						<table
							style={{
								borderColor: borderColorVal,
								fontSize: fontSizeVal,
								lineHeight: lineHeightVal
							}}
						>
							{!! head.length && (
								<thead>{this.renderSection( 'head' )}</thead>
							)}
							<tbody>{this.renderSection( 'body' )}</tbody>
							{!! foot.length && (
								<tfoot>{this.renderSection( 'foot' )}</tfoot>
							)}
						</table>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default utbTable;
