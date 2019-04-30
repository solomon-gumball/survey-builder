import React, { Component } from 'react'
import './App.css'
// import test from './test'
import test from './test-subscription'
import DataType from './DataType'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {}

    this.loadFromJSON(test, true)
  }

  loadFromJSON(json, silent) {
    this.state = {
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

  render() {
    let { dataTypes, data_type_id_list, _json, data_type_map, title } = this.state

    return (
      <div>
        <div>
          <input placeholder="json here" ref={(t) => {this.inputEl = t}}></input>
          <button onClick={() => this.loadFromJSON(JSON.parse(this.inputEl.value), false)}>yep</button>
          <button onClick={() => {
            const obsTargetList = {
              ..._json.data[0]["organization_observation_target_lists"],
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
    delete children[index]

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
