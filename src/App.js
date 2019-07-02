import React, { Component } from 'react'
import './App.css'
import test from './test-subscription'
import DataType from './DataType'
import axios from 'axios'
import Gigwalk from 'gigwalk'
import LoginForm from './LoginForm'
import { Environments } from './constants'
import SaveOrLoadProjectForm from './SaveOrLoadProjectForm'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showJSONInput: !getUrlVars()["subscription"],
      auth: this.getCookie('Authorization'),
      env: this.getCookie('env')
        ? Environments.find(env => env.name === this.getCookie('env'))
        : Environments[0],
      dataTypes: []
    }

    if (this.state.auth && this.state.env) {
      this.handleLoggedIn(this.state.auth, this.state.env)
    } else {
      this.logoutAction()
    }

    // this.loadFromJSON(test, true)
  }

  client;

  getCookie(name)
  {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
  }

  handleLoggedIn(token, env) {
    this.client = new Gigwalk({ hostname: env.hostname })
    this.client.authenticate({ token })
    // this.client.client.defaults.headers.common = {
    //     ...this.client.client.defaults.headers.common,
    //     "Content-Type": 'application/json'
    // }

    let projectID = parseInt(getUrlVars()["subscription"])
    if (projectID) {
      this.loadProject(projectID)
    }
  }

  loadFromJSON(json, silent) {
    this.state = {
      ...this.state,
      dataTypes: json.data[0]["organization_observation_target_lists"].reduce(
        (acc, list) => {
          acc.push.apply(acc, list.data_types)
          return acc
        },
        []
      ),
      data_type_map: json._metadata.data_types,
      title: json.data[0].title,
      lastUpdatedIndices: [],
      _json: json,
      data_type_id_list: Object.keys(json._metadata.data_types).map(x => parseInt(x))
    }

    if (!silent) {
      this.setState({ ...this.state })
    }
  }

  logoutAction() {
    document.cookie = `Authorization=;`
    document.cookie = `env=;`

    this.setState({
      env: Environments[0],
      auth: null
    })
  }

  loadProject(projectID) {
    this.client.subscriptions.get({ organization_subscription_id: projectID })
    .then(res => {
      this.loadFromJSON(res.data)
    })
    .catch(res => {
      window.alert(res.message)
    })
  }

  onSave() {
    this.client.subscriptions.update({
      organization_subscription_id: this.state._json.data[0].id,
      subscription: {
        organization_observation_target_lists: [
          { data_types: this.state.dataTypes }
        ]
      }
    })
    .then(res => {
      console.log(res)
      window.alert(res.message)
    })
    .catch(res => {
      console.log(res)
      window.alert("Error saving project: " + res)
    })
  }

  loginAction(email, password, env) {
    axios.post(`https://${env.hostname}/v1/auth`, null, { headers: { Authorization: `Basic ${btoa(`${email}:${password}`)}`} })
    .then(res => {
      let auth = res.data.data[0].auth_token
      this.handleLoggedIn(auth, env)
      document.cookie = `Authorization=${auth};`
      document.cookie = `env=${env.name};`
      this.setState({ auth, env })
    })
  }

  render() {
    let { dataTypes, data_type_id_list, _json, data_type_map, title } = this.state

    return (
      <div>
        {
          this.state.auth
          ? (
              <SaveOrLoadProjectForm
                projectID={this.state._json ? this.state._json.data[0].id : null}
                env={this.state.env}
                onSave={this.onSave.bind(this)}
                onLogout={this.logoutAction.bind(this)}
              />
            )
          : (<LoginForm env={this.state.env} loginAction={this.loginAction.bind(this)}/>)
        }
        {this.state.showJSONInput &&
          (
            <div className="login-container" style={{ backgroundColor: "pink" }}>
              OR paste json: <input placeholder="json" ref={(t) => {this.inputEl = t}}></input>
              <button
                onClick={() => this.loadFromJSON(JSON.parse(this.inputEl.value), false)}
                className="login-button"
              >
                parse json
              </button>
              <button
                className="login-button"
                onClick={() => {
                const obsTargetList = {
                  data_types: this.state.dataTypes
                }

                copyToClipboard(JSON.stringify({
                  ..._json,
                  data: [{
                    ..._json.data[0],
                    organization_observation_target_lists: [
                      obsTargetList
                    ]
                  }]
                }, null, 4))
              }}>
                export to clipboard
              </button>
            </div>
          )
        }
        <div style={{ marginLeft: 30 }}>
          <h1>{title}</h1>
          {dataTypes.map((dataType, i) => (
            <DataType
              key={i}
              data={dataType}
              index={i}
              lastUpdatedIndices={this.state.lastUpdatedIndices}
              data_type_map={data_type_map}
              data_type_id_list={data_type_id_list}
              isLastChild={i === dataTypes.length - 1}
              isFirstChild={i === 0}
              actions={{
                onSwap: (x, direction) => this.onSwap([i, ...x], direction),
                onUpdate: (x, data, silent) => this.onUpdate([i, ...x], data, silent),
                onDelete: (x) => this.onDelete([i, ...x]),
                onAddCondition: (x) => this.onAddCondition([i, ...x]),
                onAddQuestion: (x) => this.onAddQuestion([i, ...x]),
                onChangeQuestionId: (x, id) => this.onChangeQuestionId([i, ...x], id)
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  getChildArray(node) {
    if (node["$cond"]) {
      return node["$cond"][1]
    } else {
      if (!node["children"]) {
        node["children"] = []
      }
      return node["children"]
    }
  }

  getSiblingArray(indices) {
    if (indices.length === 1) {
      return [this.state.dataTypes, indices[0]];
    } else {
      var current = this.state.dataTypes[indices[0]]
      for (let i = 1; i < indices.length; i++) {
        let nextIndex = indices[i]
        let children = this.getChildArray(current)

        if (i === indices.length - 1) {
          return [children, nextIndex];
        } else {
          current = children[nextIndex]
        }
      }
    }
    return null
  }

  onSwap(indices, direction) {
    const firstIndex = indices[indices.length - 1]
    const secondIndex = firstIndex + (direction ? 1 : -1)
    const [children] = this.getSiblingArray(indices);

    [children[firstIndex], children[secondIndex]] = [children[secondIndex], children[firstIndex]]

    // Update starting at parent
    indices.pop()

    this.setState({
      dataTypes: this.state.dataTypes.slice(),
      lastUpdatedIndices: indices
    })
  }

  onUpdate(indices, data, silent) {
    const [children, index] = this.getSiblingArray(indices);
    children[index] = data

    this.setState({
      lastUpdatedIndices: indices,
      dataTypes: this.state.dataTypes.slice()
    })
  }

  onAddQuestion(indices) {
    const [children, index] = this.getSiblingArray(indices);
    const newChild = {
        "data_type_id": this.state.dataTypes[0]["data_type_id"]
    }

    this.getChildArray(children[index]).splice(0, 0, newChild)

    this.setState({
      dataTypes: this.state.dataTypes.slice(),
      lastUpdatedIndices: indices
    })
  }

  onAddCondition(indices) {
    const newChild = { "$cond": [{ "$and": [{ "$eq": ["$data_item_value", ""]}] }, []] }
    const [children, index] = this.getSiblingArray(indices);

    this.getChildArray(children[index]).splice(0, 0, newChild)

    this.setState({
      dataTypes: this.state.dataTypes.slice(),
      lastUpdatedIndices: indices
    })
  }

  onDelete(indices) {
    const [children, index] = this.getSiblingArray(indices);
    children.splice(index, 1)

    // Update starting at parent
    indices.pop()

    this.setState({
      lastUpdatedIndices: indices,
      dataTypes: this.state.dataTypes.slice()
    })
  }
}

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

export default App
