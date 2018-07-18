import React, { Component } from 'react';
import './App.css';
import normal_args from './sample_data/standings';
import condensed_args from './sample_data/standings';
import split_args from './sample_data/standings';
import group_args from './sample_data/standings';
import filter_args from './sample_data/standings';
import freeze_args from './sample_data/standings';
import Statable from './Statable';

class App extends Component {
  state = {
    args: normal_args,
  }
  sample_args = {
    "normal": normal_args,
    "condensed": condensed_args,
    "split tables": split_args,
    "group tables": group_args,
    "filters": filter_args,
    "freeze columns": freeze_args
  }
  handleChange = (event) => {
    let value = event.target.value;
    this.setState({args: this.sample_args[value]})
  }

  render() {
    let { args } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Statable React Data Table</h1>
          <select>
            {Object.keys(this.sample_args).map((value, i) => <option key={i} value={value}>{value}</option>)}
          </select>
        </header>
        <Statable {...args}/>
      </div>
    );
  }
}

export default App;
