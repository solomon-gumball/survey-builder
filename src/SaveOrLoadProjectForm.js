import React, { Component} from 'react'
import './App.css'

export default class SaveOrLoadProjectForm extends Component {
  render() {
    return (
      <div className="login-container" style={{ backgroundColor: 'lightgreen'}}>
        {`You are logged in to ${this.props.env.name} viewing project with ID: ${this.props.projectID}`}
        <button
          className="login-button"
          onClick={() => this.props.onSave()}
        >
          save
        </button>
        <button
          className="login-button"
          onClick={() => this.props.onLogout()}
        >
          logout
        </button>
      </div>
    )
  }
}
