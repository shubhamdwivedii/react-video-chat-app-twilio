import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import VideoComponent from './components/VideoComponent';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      name: '', 
      greeting: '',
      nameSubmitted: false
    }

    this.handleChange = this.handleChange.bind(this); 
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleChange(event){
    this.setState({ name: event.target.value });
  }

  handleSubmit(event){
    event.preventDefault(); 
    fetch(`/api/greeting?name=${encodeURIComponent(this.state.name)}`)
      .then(response => response.json())
      .then(state => this.setState({...state, nameSubmitted: true }));
  }

  render() { 
    return (
      <div className="App">
      <header className="App-header">
        <form onSubmit={this.handleSubmit}>
          <input 
            id="name"
            type="text"
            value={this.state.name}
            onChange={this.handleChange}
            />
          <button type="submit">Submit</button>
        </form>
        <p>{this.state.greeting}</p>
        {this.state.nameSubmitted ? <VideoComponent name={this.state.name} /> : null }
      </header>
    </div>
      );
  }
}
 
export default App;
