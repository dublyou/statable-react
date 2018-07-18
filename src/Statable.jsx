import React from 'react';
import Button from './components/Button';
import Progress from './components/Progress';
import Switch from './components/SwitchButton';
import TablePaginate from './components/TablePaginate';
import FilterBox from './FilterBox';
import DataTable from './DataTable';
import theme from './theme';
import axios from 'axios';

const styles = {
    root: {
        width: '100%',
        marginTop: theme.spacing.unit,
        overflowX: 'auto',
        paddingBottom: 20,
    },
    groupContainer: {
        margin: ".2rem",
        width: "100%"
    },
    groupHeader: {
        minHeight: 20,
        padding: 5,
        margin: "auto",
        width: "95%"
    },
    groupTitle: {
        fontSize: "1rem",
        color: theme.palette.grey[400]
    },
    tableContainer: {
        display: "flex",
        flexWrap: "wrap",
        width: "100%"
    },
    button: {
        color: "#0066ff",
        fontSize: 11,
        padding: 2,
        textAlign: "left",
        justifyContent: "initial",
        minHeight: 16,
        position: "static",
        "&:hover": {
            color: theme.palette.primary.main,
        }
    },
    buttonLabel: {
        textTransform: 'capitalize',
    },
    container: {
        maxHeight: 500,
        overflow: "auto",
        display: "inline-block",
    },
    condenseBtn: {
        position: "absolute",
        right: 0,
    },
    progressRoot: {
        textAlign: "center",
        height: "400px"
    },
    progress: {
        margin: "5rem",
    }
};

const getGroupCombos = (group_by, groups, combos=[], count=0) => {
    let labels = group_by;
    if (labels.length === count) {
        return combos;
    }
    let newCombos = [];
    let label = labels[count];
    if (combos.length === 0) {
        newCombos = groups[label].map(value => {
            let obj = {};
            obj[label] = value;
            return obj;
        });
    } else {
        for (let value of groups[label]) {
            for (let combo of combos) {
                combo[label] = value;
                newCombos.push(combo);
            }
        }
    }
    return getGroupCombos(labels, groups, newCombos, count + 1);
}

function toTitleCase(str) {
    str = str.toString();
    return str.replace(/_/g, " ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function toCurrency(value) {
    var numbers = value.toString().split("."),
        whole_number = numbers[0],
        decimal_number = numbers[1],
        currency = "$",
        comma_remainder = whole_number.length % 3,
        commas;
    if (comma_remainder > 0) {
        commas = Math.floor(whole_number.length/3);
        currency += whole_number.substr(0, comma_remainder);
    } else {
        commas = (whole_number.length/3) - 1;
        currency += whole_number.substr(0, 3);
    }
    for (var i = 0; i < commas; i++) {
        currency += "," + whole_number.substr(comma_remainder + i * 3, 3);
    }
    if (numbers.length > 1) {
        currency += "." + decimal_number;
    }
    return currency;
}

function compare(column, dir, calc) {
    if (calc !== null) {
        return function(a, b) {
            a = calc(a[column], a);
            b = calc(b[column], b);
            if (a < b)
                return dir;
            if (a > b)
                return -dir;
            return 0;
        };
    }
    return function(a, b) {
        a = a[column];
        b = b[column];
        if (a < b)
            return dir;
        if (a > b)
            return -dir;
        return 0;
    };
}

class Statable extends React.Component {
    state = {
        ordering: [],
        references: {},
        data: [],
        group_by: [],
        groupValues: {},
        columns: {},
        condense: false,
    };
    constructor(props) {
        super(props);
        this.getStyles();
    }
    componentWillMount() {
        this.getData();
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
        this.classes = default_classes;
    };

    getData = (filterValues) => {
        let { data, url, groups, filters } = this.props;
        let state_data = this.state.data;
        if (filters !== undefined && filterValues === undefined) {
            filterValues = {};
            for (let f in filters) {
                filterValues[f] = filters[f].default || "";
            }
            this.setState({filterValues})
        }
        filterValues = filterValues || {};
        for (let f in filterValues) {
            if (filters[f].type === "url") {
                url = url.replace("[=" + f + "=]", filterValues[f]);
            }
        }
        if (url !== undefined) {
            axios.get(url).then(res => {
                return res.data;
            }).catch(error => {
                return (state_data.length > 0) ? state_data : data;
            }).then(data => {
                this.setData(data);
            });
        } else {
            data = (state_data.length > 0) ? state_data : data;
            this.setData(data);
            
        }
    };

    setData = (data) => {
        let { groups, ordering, sortColumn, sortDir, toggleGroups } = this.props;
        let groupValues = {};
        ordering = ordering || Object.keys(data[0]);
        sortColumn = sortColumn || ordering[0];
        sortDir = sortDir || -1;
        this.setState({
            ordering,
        });
        this.getColumns(ordering);
        this.sortData(data, sortDir, sortColumn);
        if (groups !== undefined) {
            if (toggleGroups !== undefined) {
                this.setState({group_by: [groups[0]]})
            }
            for (let group of groups) {
                groupValues[group] = this.getGroup(group, data);
            }
            this.setState({groupValues});
        }
    };

    sortData = (data, sortDir, sortColumn) => {
        let { columns } = this.state;
        let calc = null;
        let data_ref = this.getDataReference(sortColumn);
        if (columns[data_ref] !== undefined) {
            if (columns[data_ref].hasOwnProperty("calc")) {
                calc = columns[data_ref].calc;
            }
        }
        this.setState({
            data: data.sort(compare(data_ref, sortDir, calc)),
            sortDir,
            sortColumn,
        });
    };

	handleSort = (value) => {
        let { sortColumn, sortDir, data } = this.state;
        sortDir = ((sortColumn === value) ? -sortDir : 1);
        this.sortData(data, sortDir, value);
        this.setState({page: 0});
  	};

    toggleCondense = () => {
        this.setState({condense: !this.state.condense});
    };

    changeGroupBy = (group) => () => {
        if (group === null) {
            this.setState({group_by: []});
        } else {
            this.setState({group_by: [group]});
        }
        
    };

    filterChange = (id, value) => {
        const { filters } = this.props;
        let { filterValues } = this.state;
        filterValues[id] = value;
        this.setState({
            filterValues: filterValues,
        });
        if (filters[id].type === "url") {
            this.getData(filterValues);
        }
    };

    getFilters = (filterValues) => {
        const { filters } = this.props;
        if (filters !== undefined) {
            return <FilterBox filters={filters} filterValues={filterValues} filterChange={this.filterChange}/>;
        }
        return null;
    };

    filterData = (data, filterValues) => {
        const { filters } = this.props;
        const filterRow = (row, id, operand, value) => {
            let data = row[id];
            switch (operand) {
                case ">":
                    return data > value;
                case "<":
                    return data < value;
                case "=":
                    return data === value;
                case ">=":
                    return data >= value;
                case "<=":
                    return data <= value;
                default:
                    return false;
            }
        };
        return data.filter((row) => {
            for (let key in filterValues) {
                let params = key.split("__");
                let value = filterValues[key];
                let id = params[0];
                let operand = "=";
                if (filters[id].type !== "url" && value !== null) {
                    if (params.length === 2) {
                        operand = params[1];
                    }
                    if (!filterRow(row, id, operand, value)) {
                        return false;
                    }
                }
            }
            return true;
        });
    };

    getColumns = (ordering) => {
        let { columns, renders, calculations, columnLabels } = this.props;
        let { references } = this.state;
        columns = columns || {};
        renders = renders || {};
        calculations = calculations || {};
        columnLabels = columnLabels || {};
        for (let value of ordering) {
            if (!columns.hasOwnProperty(value)) {
                columns[value] = {};
            }
            columns[value].label = columnLabels[value] || value
            let render = columns[value].render || null;
            if (renders.hasOwnProperty(value)) {
                render = renders[value];
                if (render.hasOwnProperty("reference")) {
                    references[value] = render["reference"];
                }
            }
            if (render !== null) {
                columns[value].render = this.createRender(render);
            }
            let calc = columns[value].calc|| null;
            if (calculations.hasOwnProperty(value)) {
                calc = calculations[value];
            }
            if (calc !== null) {
                columns[value].calc = this.createCalc(calc);
            }
            if (columns[value].hasOwnProperty("createdCell")) {
                columns[value].createdCell = function (td, cellData, rowData, row, col) {
                     return td;
                };
            }
        }
        this.setState({
            columns,
            references,
        });
    };

    createCalc = params => {
        let { calc, column } = params;
        let func;
        function compare_values(a, b) {
            if (a < b)
                return 1;
            if (a > b)
                return -1;
            return 0;
        };
        switch (calc) {
            case "ratio":
                let { num, dom } = params;
                func = (value, row, data) => (row[dom] > 0) ? row[num]/row[dom] : null;
                break;
            case "rank":
                let { dir } = params;
                func = (value, row, data) => {
                    value = value || row[column];
                    let column_data = data.map(r => r[column]).sort(compare_values);
                    if (dir == -1) {
                        column_data = column_data.reverse()
                    }
                    for (let rank = 1; rank <= column_data.length; rank++) {
                        if (value === column_data[rank - 1]) {
                            return rank;
                        }
                    }
                    return column_data.length;
                };
                break;
            case "forcediff":
                func = (value, row, data) => {
                    let column_data = data.map(r => r[column]).sort(compare_values);
                    return value - column_data[0];
                };
                break;
            default:
                func = (value, row, data) => {return value;};
        }
        return func;
    };

    createRender = params => {
        const { classes } = this;
        let { type, decimal_places } = params;
        var func;
        decimal_places = decimal_places || 0;
        var parse_vars = function (string, data, type, row) {
            let regex = /{{\s*(?:data|type|row)(?:.(\w+))?\s*}}/g,
                matches = string.match(regex),
                return_string = string;
            if (matches) {
                for (var i = 0; i < matches.length; i++) {
                    var capture =  matches[i].match(/^{{\s*(data|type|row)(?:.(\w+))?\s*}}$/)
                    switch (capture[1]) {
                        case "data":
                            return_string = return_string.replace(matches[i], data);
                            break;
                        case "row":
                            return_string = return_string.replace(matches[i], row[capture[2]]);
                            break;
                        case "type":
                            return_string = return_string.replace(matches[i], type);
                            break;
                    }
                }
            }
            return return_string;
        };
        switch(type) {
            case "html":
                func = function ( data, type, row ) {
                    const { element, text, before, after, attrs } = params;
                    let props = {};
                    for (let attr in attrs) {
                        props[attr] = parse_vars(attrs[attr], data, type, row);
                    }
                    let texts = [before, text, after];
                    for (let i = 0; i < texts.length; i++) {
                        if (texts[i]) {
                            texts[i] = parse_vars(texts[i], data, type, row);
                        }
                    }
                    switch(element) {
                        case "a":
                            if (texts[1] === "null") {
                                return null;
                            }
                            return <Button {...props} classes={{root: classes.button, label: classes.buttonLabel}} size="small" component="a">{texts[1].replace(/ /g, "\u00a0")}</Button>;
                        default:
                            return <div>{texts[0]}<span {...props}>{texts[1]}</span>{texts[2]}</div>;
                    }
                };
                break;
            case "percent":
                func = (data, type, row) => (typeof data !== undefined && data !== null && data !== "N/A") ? Number.parseFloat(data*100).toFixed(decimal_places) + "%" : "";
                break;
            case "currency":
                func = (data, type, row) => (typeof data !== undefined && data !== null && data !== "N/A") ? "$" + Number.parseFloat(data).toFixed(decimal_places) : "";
                break;
            case "number":
                func = (data, type, row) => (typeof data !== undefined && data !== null && data !== "N/A") ? Number.parseFloat(data).toFixed(decimal_places) : "";
                break;
            default:
                func = (data, type, row) => {return data;};
        }
        return func;
    };

    getDataReference = (id) => {
        let { references } = this.state;
        if (references.hasOwnProperty(id)) {
            return references[id];
        }
        return id;
    };

    getGroupBtns = (group_by) => {
        const { toggle_groups } = this.props;
        let { groupValues } = this.state;
        if (Object.keys(groupValues).length > 0 && toggle_groups === undefined) {
            const groupBtn = (label, group) => <Button onClick={this.changeGroupBy(group)}>{toTitleCase(label)}</Button>;
            const btns = [groupBtn("All", null)];
            for (let group in groupValues) {
                btns.push(groupBtn(group, group));
            }
            return btns;
        }
    };

    getGroup = (group, data) => {
        let items = [];
        let addItem = true;
        for (let row of data) {
            addItem = true;
            for (let item of items) {
                if (item === row[group]) {
                    addItem = false;
                }
            }
            if (addItem) {
                items.push(row[group]);
            }
        }
        return items;
    };

    getControls = (filterValues, condense, classes) => {
        const { condensed } = this.props;
        return (
            <div className={classes.groupHeader}>
                {this.getFilters(filterValues)}
                {<div>{this.getGroupBtns()}</div>}
                {(condensed !== undefined) ? <Switch color="primary" onChange={this.toggleCondense} checked={!condense} label="Show All"/> : null}
            </div>
        );
    };

	render() {
        const { classes } = this;
		const { paginate, perPage, totalColumns, tableSections, condensedColumns, ...other } = this.props;
        let { splitColumns } = this.props;
        let { columns, data, filterValues, group_by, groupValues, ordering, sortColumn, condense } = this.state;
        if (Object.keys(columns).length === 0) {
            return <div className={classes.progressRoot}><Progress className={classes.progress}/></div>;
        }
        data = this.filterData(data, filterValues); /* filter the data */
        /* if condensedColumns is defined and condense is true then change ordering to the value of condensedColumns */
        if (condensedColumns !== undefined && condense) {
            ordering = condensedColumns;
        }
        /* if groups are passed as argument then create a table for each value in the column specified in groups */
        if (group_by.length > 0 && Object.keys(groupValues).length > 0) {
            console.log("works");
            let combinations = getGroupCombos(group_by, groupValues);
            let groupedTables = combinations.map((c, i) => {
                let groupData = data.filter(row => {
                    for (let group of group_by) {
                        if (row[group] !== c[group]) {
                            return false;
                        }
                    }
                    return true;
                });
                return (
                    <div key={Object.values(c).join("-")} className={classes.groupContainer}>
                        <div className={classes.groupHeader}>
                            <h3 className={classes.groupTitle}>{c[group_by[0]]}</h3>
                        </div>
                        <DataTable columns={columns} data={groupData} ordering={ordering} sortColumn={sortColumn} handleSort={this.handleSort}/>
                    </div>
                );
            });
            return (
                <div className={classes.root}>
                    {this.getControls(filterValues, condense, classes)}
                    <div className={classes.tableContainer}>
                        {groupedTables}
                    </div>
                </div>
            );
        }
        /* if ordering is not an Array then create as many tables as there are Object properties*/
        if (!(ordering instanceof Array) && (ordering instanceof Object)) {
            let splitOrdering = [];
            let splitLabels = [];
            for (let label of Object.keys(ordering)) {
                splitOrdering.push(ordering[label]);
                splitLabels.push(label);
            }
            let splitTables = splitOrdering.map((value, i) => {
                let groupHeader = null;
                if (splitLabels !== null) {
                    groupHeader = (
                        <div className={classes.groupHeader}>
                            <h3 className={classes.groupTitle}>{splitLabels[value]}</h3>
                        </div>
                    );
                }
                return (
                    <div key={i} className={classes.groupContainer}>
                        {groupHeader}
                        <DataTable columns={columns} data={data} ordering={value} sortColumn={sortColumn} handleSort={this.handleSort}/>
                    </div>
                );
            });
            return (
                <div className={classes.root}>
                    {this.getControls(filterValues, condense, classes)}
                    {splitTables}
                </div>
            );
        }
		return (
		    <div className={classes.root}>
                {this.getControls(filterValues, condense, classes)}
                <DataTable columns={columns} data={data} ordering={ordering} sortColumn={sortColumn} handleSort={this.handleSort}/>
		    </div>
		);
	}
}

export default Statable;
