import React from 'react';
import TablePaginate from './components/TablePaginate';
import theme from './theme';

const styles = {
    root: {
        width: '100%',
        marginTop: theme.spacing.unit,
        overflowX: 'auto',
        paddingBottom: 20,
    },
    table: {
        width: "auto",
        margin: "auto"
    },
    tableHeadRow: {
        height: 30,
        transform: "none",

    },
    tableHead: {
        transform: "none",
    },
    tableRow: {
        height: 30,
        '&:nth-of-type(even) td': {
            backgroundColor: theme.palette.grey[100],
        },
        '&:nth-of-type(odd) td': {
          backgroundColor: theme.palette.grey[300],
        },
        '&:hover td': {
            backgroundColor: theme.palette.grey[400],
            cursor: "pointer",
        }
    },
    tableCell: {
        padding: 10,
        textAlign: "left",
        backgroundColor: theme.palette.background.default,
        position: "relative",
        "&:hover": {
            cursor: "pointer",
            backgroundColor: theme.palette.grey[900],
            color: theme.palette.primary.main,
        }
    },
    tableBodyCell: {
        color: theme.palette.grey[600],
        paddingLeft: 10,
        paddingRight: 10,
        borderBottom: "1px solid #fff",
        textAlign: "left",
    },
    sectionRow: {
        height: 30,
        backgroundColor: theme.palette.grey[500],
        '&:hover': {
            backgroundColor: theme.palette.grey[600],
            cursor: "pointer",
        }
    },
    tableContainer: {
        display: "flex",
        flexWrap: "wrap",
        width: "100%"
    },
    widthContainer: {
        width: "95%",
        margin: "auto",
        overflow: "auto",
    },
};

function toTitleCase(str) {
    str = "" + str;
    return str.replace(/_/g, " ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function get_sign(txt) {
    var return_val = "";
    if (txt.substr(0, 1) === "g") {
        return_val += ">";
    } else if (txt.substr(0, 1) === "l") {
        return_val += "<";
    }
    if (txt.slice(-1) === "e") {
        return_val += "=";
    }
    return return_val;
}

function toCurrency(x) {
    var dec_split = x.toString().split("."),
        currency = "$",
        len_b4_dec = dec_split[0].length,
        remainder = len_b4_dec % 3,
        num_commas;
    if (remainder > 0) {
        num_commas = Math.floor(len_b4_dec/3);
        currency += dec_split[0].substr(0, remainder);
    } else {
        num_commas = (len_b4_dec/3) - 1;
        currency += dec_split[0].substr(0, 3);
    }
    for (var i = 0; i < num_commas; i++) {
        currency += "," + dec_split[0].substr(remainder + i * 3, 3);
    }
    if (dec_split.length > 1) {
        currency += "." + dec_split[1];
    }
    return currency;
}

class DataTable extends React.Component {
    state = {
        perPage: 10,
        page: 0,
    };
    constructor(props) {
        super(props);
        this.heightContainer = React.createRef();
        this.widthContainer = React.createRef();
        this.fixedHeader = React.createRef();
    }

    componentWillMount() {
        let { perPage } = this.props;
        this.setState({
            perPage: perPage || 10,
        });
    };

    getStyles = () => {
        let { classes } = this.props;
        let default_classes = Object.assign({}, styles);
        if (classes !== undefined) {
            for (let prop of classes) {
                if (default_classes.hasOwnProperty(prop)) {
                    default_classes[prop] = Object.assign(default_classes[prop], classes[prop])
                }
            }
        }
        return default_classes;
    };

    handleSort = (value) => () => {
        const { handleSort } = this.props;
        if (handleSort !== undefined) {
            handleSort(value);
        }
    };

    handleChangePage = (page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ perPage: event.target.value });
    };

    handleYScroll = () => {
        const { freeze } = this.props;
        let heightContainer = this.heightContainer.current;
        let widthContainer = this.widthContainer.current;
        let translate = "translate(" + widthContainer.scrollLeft + "px, " + heightContainer.scrollTop + "px)";
        let translateY = "translateY(" + heightContainer.scrollTop + "px)";
        let ths = heightContainer.querySelectorAll("th");
        for (let i = 0; i < ths.length; i++) {
            if (freeze !== undefined && i < freeze.length) {
                ths[i].style.transform = translate;
            } else {
                ths[i].style.transform = translateY;
            }
        }
    };

    handleXScroll =  () => {
        const { freeze, data } = this.props;
        let heightContainer = this.heightContainer.current;
        let widthContainer = this.widthContainer.current;
        let translate = "translate(" + widthContainer.scrollLeft + "px, " + heightContainer.scrollTop + "px)";
        let translateX = "translateX(" + widthContainer.scrollLeft + "px)";
        for (let c of (freeze || [])) {
            let el = widthContainer.querySelector(`#${c}-0`);
            if (el !== null) {
                el.style.transform = translate;
            }
            for (let i = 1; i <= data.length + 1; i++) {
                let el = widthContainer.querySelector(`#${c}-${i}`);
                if (el !== null) {
                    el.style.transform = translateX;
                }
            }
        }
    };

    getTotal = (data, columns) => {
        let totals = {};
        let value;
        for (let c of columns) {
            value = 0;
            for (let row of data) {
                if (!isNaN(row[c])) {
                    value += Number(row[c]);
                }
            }
            totals[c] = value;
        }
        return totals;
    };

    getTableRows = (classes, data) => {
        const { columns, ordering, sections } = this.props;
        if (sections !== undefined) {
            let { column, values, collapse } = sections;
            let section_rows = [];
            for (let value of values) {
                section_rows.push(<tr className={classes.sectionRow}><th colSpan={ordering.length}>{toTitleCase(value)}</th></tr>);
                section_rows = section_rows.concat(data.map((row, index) => {
                    return (row[column] === value) ? this.getRow(row, index, ordering, columns) : null;
                }));
            }
            return section_rows;
        }
        return data.map((row, index) => this.getRow(classes, row, index));
    };

    getRow = (classes, row, index, totals=false) => {
        const { columns, freeze, ordering } = this.props;
        return (
          <tr className={classes.tableRow} key={index}>
            {ordering.map((value, index2) => {
                let column = columns[value];
                let data = row[value];
                let styles = {};
                data = (column.hasOwnProperty("calc")) ? column.calc(data, row) : data;
                data = column.hasOwnProperty("render") ? column.render(data, "", row) : data;
                data = (!totals || row.hasOwnProperty(value)) ? data : (index2 === 0) ? "Totals" : null;
                if (freeze !== undefined && index2 + 1 === freeze.length) {
                    styles = {
                        boxShadow: "grey 5px 0 5px -5px inset",
                        height: "100%",
                        top: 0,
                        right: "-5px",
                        position: "absolute",
                        width: "5px",
                    }
                }

                return <td id={`${value}-${index + 1}`} className={classes.tableBodyCell} key={`${value}-${index}`} numeric>{data}<div style={styles}></div></td>;
            })}
          </tr>
        );
    };
    getPageControls = (page, perPage) => {
        const { data } = this.props;
        return (
            <tfoot>
              <tr>
                <TablePaginate
                  colSpan={3}
                  count={data.length}
                  rowsPerPage={perPage}
                  page={page}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
              </tr>
            </tfoot>
        );
    };

	render() {
		const { columns, paginate, sortColumn } = this.props;
        let { data, freezeColumns, headProps, ordering, totalColumns } = this.props;
        const { page, perPage } = this.state;
        const classes = this.getStyles();
        headProps = headProps || {};
        freezeColumns = (freezeColumns !== undefined) ? freezeColumns : Object.keys(columns).filter(value => columns[value].freeze);
        totalColumns = (totalColumns !== undefined) ? totalColumns : Object.keys(columns).filter(value => columns[value].total);
        const totalData = (totalColumns.length > 0) ? this.getTotal(data, totalColumns) : null;
        const compare = (a, b) => {
            a = columns[a].order;
            b = columns[b].order;
            if ((b !== undefined && a === undefined) || (a !== undefined && b !== undefined && a < b))
                return 1;
            if ((a !== undefined && b === undefined) || (a !== undefined && b !== undefined && b < a))
                return -1;
            return 0;
        };
        ordering = (ordering === undefined) ? Object.keys(columns).sort(compare) : ordering;
        data = (paginate) ? data.slice(page * perPage, page * perPage + perPage) : data;
        return (
            <div className={classes.widthContainer} ref={this.widthContainer} onScroll={this.handleXScroll}>
                <div className={classes.container} ref={this.heightContainer} onScroll={this.handleYScroll}>
                    <table className={classes.table}>
                        <thead className={classes.tableHead} ref={this.fixedHeader}>
                            <tr className={classes.tableHeadRow}>
                                {ordering.map((value, index) => {
                                    let thProps = headProps[value] || {};
                                    let styles = {"zIndex": 1};
                                    if (value === sortColumn) {
                                        styles["backgroundColor"] = theme.palette.grey[900];
                                        styles["color"] = theme.palette.primary.main;
                                        styles["fontWeight"] = "bolder";
                                    }
                                    if (freezeColumns.length > index) {
                                        styles["zIndex"] = 2;
                                    }
                                    return <th id={`${value}-0`} style={styles} className={classes.tableCell} onClick={this.handleSort(value)} key={value} {...thProps} numeric>{columns[value].label}</th>;
                                })}
                            </tr>
                        </thead>
                        <tbody>
                           {this.getTableRows(classes, data)}
                           {(totalData === null) ? null : this.getRow(classes, totalData, data.length, true)}
                        </tbody>
                        {(paginate) ? this.getPageControls(page, perPage) : null}
                    </table>
                </div>
            </div>
        );
	}
}

export default DataTable;
