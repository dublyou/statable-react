import React from 'react';
import Button from './components/Button';
import PopUp from './components/PopUp';

const styles = theme => ({
    root: {
        display: "flex"
    },
    formControl: {
    	minWidth: 60
    }
});

function toTitleCase(str) {
    str = "" + str;
    return str.replace(/_/g, " ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

class FilterBox extends React.Component {
    state = {
        open: false,
        selected: null,
    };

    handleChange = (id) => (event) => {
        const { filterChange } = this.props;
        let value = event.target.value;
        filterChange(id, value);
        /*this.setState({
            open: true,
            selected: value,
        })*/
    };

    addFilter = (id) => (event) => {
      const { filterChange } = this.props;
      const { selected } = this.state;
      let value = document.getElementById("filterValue").value;
      let direction = document.getElementById("filterDirection").value;
      filterChange(`${selected}__${direction}`, value);
      this.setState({
          open: false,
          selected: null,
      });
    };

    removeFilter = (id) => () => {
      const { filterChange } = this.props;
      filterChange(id, null);
    };

    handleFilterSelect = (event) => {
        let value = event.target.value;
        if (value) {
          this.setState({
            open: true,
            selected: value,
        });
        }
    };

    handleClose = () => {
        this.setState({
            open: false,
            selected: null,
        });
    };

    render() {
        const { classes, filters, filterValues } = this.props;
        let filter_ids = Object.keys(filters);
        let data_filter_ids = filter_ids.filter((id) => filters[id].type !== "url");
        let filterSelect = null;
        if (data_filter_ids.length > 0) {
          filterSelect = (
              <span>
                  <label for="filterSelect">Filters</label>
                  <select onChange={this.handleFilterSelect} name='filterSelect' id='filterSelect'>
                      <option value="" selected={this.state.selected === null}>Choose a filter</option>
                      {data_filter_ids.map((value) => <option value={value} selected={this.state.selected === value}>{filters[value] || toTitleCase(value)}</option>)}
                  </select>
                  <PopUp open={this.state.open}>
                    <h3>New Filter</h3>
                    <div>
                      <span>{filters[this.state.selected]}</span>
                      <select onChange={this.handleFilterSelect} id='filterDirection'>
                          {[">", "<", ">=", "<=", "="].map((value) => <option value={value}>{value}</option>)}
                      </select>
                      <input id='filterValue'/>
                    </div>
                    <div>
                        <Button onClick={this.handleClose} color="primary">
                          Cancel
                        </Button>
                        <Button onClick={this.addFilter} color="primary">
                          Add Filter
                        </Button>
                    </div>
                </PopUp>
              </span>
          );
        }
        return (
            <div className={classes.root}>
                {filter_ids.map((value, i) => {
                  if (filters[value].type == "url") {
                    return (
                        <span key={i} className={classes.formControl}>
                            <label htmlFor={value}>{toTitleCase(value)}</label>
                            <select
                            onChange={this.handleChange(value)}
                            inputProps={{
                              name: value,
                              value: filterValues[value],
                            }}
                            >
                                {filters[value].options.map((option) => <option value={option || option.value}>{option.label || toTitleCase(option)}</option>)}
                            </select>
                        </span>
                    );
                  }
                })}
                {filterSelect}
                <div>{data_filter_ids.map((id, i) => <span key={id}><span>{toTitleCase(id)}  {filterValues[id]}</span><Button onClick={this.removeFilter(id)}>X</Button></span>)}</div>
            </div>
        );
    }
}

export default FilterBox;