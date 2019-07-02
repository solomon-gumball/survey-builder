import React, { Component} from 'react'
import './App.css'
import { Environments } from './constants'

export default class LoginForm extends Component {
  emailInput;
  passwordInput;
  envInput;

  render() {
    return (

      <div className="login-container" style={{ position: 'relative' }}>
        <table style={{ width: 800 }}>
          <tr>
            <td>Env</td>
            <td><select ref={(t) => {this.envInput = t}}>
              {Environments.map(env => (
                  <option
                    value={env.name}
                    selected={env === this.props.env}
                  >
                    {env.name}
                  </option>
              ))}
            </select></td>
          </tr>
          <tr>
            <td>Email</td>
            <td><input style={{ width: 300 }} placeholder="email" ref={(t) => {this.emailInput = t}}></input></td>
          </tr>
          <tr>
            <td>Password</td>
            <td><input style={{ width: 300 }} placeholder="password" ref={(t) => {this.passwordInput = t}}></input></td>
          </tr>
        </table>
        <button
          class="login-button"
          style={{ marginBottom: 10, position: 'absolute', bottom: 5, right: 15, width: 70 }}
          onClick={() =>
            this.props.loginAction(
              this.emailInput.value,
              this.passwordInput.value,
              Environments.withName(this.envInput.value)
            )
          }>
            login
        </button>
      </div>
    )
  }
}
