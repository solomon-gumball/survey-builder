import React, { Component } from 'react';

const EmptySingleCondition = () => ({
    "$eq": [
        "$data_item_value",
        "SOME VALUE HERE"
    ]
})

export default class DataType extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.lastUpdatedIndices && nextProps.lastUpdatedIndices.length) {
      return nextProps.lastUpdatedIndices[0] === nextProps.index
    }
    return true
  }

  render() {
    const props = this.props
    let { data: { $cond, data_type_id, children }, data_type_map, actions, data_type_id_list, isLastChild, isFirstChild } = props

    if ($cond) {
      let { $or, $eq, $ne, $and } = $cond[0]
      if ($eq || $ne) {
          let condition = ($eq || $ne)
          return (
            <div className="conditional-container">
              <div className="item-wrapper">
                <SwapIcons
                  allowNext={!isLastChild}
                  allowPrevious={!isFirstChild}
                  onSwap={actions.onSwap}
                />
              </div>
              <ActionBar {...actions}/>
              <SingleCondition
                condition={condition}
                data={props.data}
                actions={actions}
                remove={(e) => { e.preventDefault() }}
              />
              <p style={{ height: 20 }}></p>
              {$cond[1].map((dataType, i) => renderChild(i, dataType, props, i === $cond[1].length - 1))}
            </div>
          )
      } else if ($or || $and) {
        let presentKey = Object.keys($cond[0])[0]

        return (
            <div className="conditional-container">
              <div className="item-wrapper">
                <SwapIcons
                  allowNext={!isLastChild}
                  allowPrevious={!isFirstChild}
                  onSwap={actions.onSwap}
                />
              </div>
              <ActionBar {...actions} />
              <p>
                <span>IF </span>
                <select value={Object.keys($cond[0])[0]} onChange={(e) => {
                  $cond[0][e.target.value] = $cond[0][presentKey]
                  delete $cond[0][presentKey]
                  actions.onUpdate([], props.data)
                }}>
                  <option value={"$or"} label={"ANY"}/>
                  <option value={"$and"} label={"ALL"}/>
                </select>
                <span> any of the following are true: </span>
              </p>
              <ul>{($or || $and).map((condition, i) => (
                <SingleCondition
                  key={i}
                  condition={condition["$eq"] || condition["$ne"]}
                  data={props.data}
                  actions={actions}
                  add={(e) => {
                    e.preventDefault();
                    ($or || $and).splice(i + 1, 0, EmptySingleCondition());
                    actions.onUpdate([], props.data)
                  }}
                  remove={(($or || $and).length > 1) && ((e) => {
                    e.preventDefault();
                    ($or || $and).splice(i, 1);
                    actions.onUpdate([], props.data)
                  })}
                />
              ))}
              </ul>
              {$cond[1].map((dataType, i) => renderChild(i, dataType, props, i === $cond[1].length - 1))}
            </div>
        )
      }
      return <div style={{ background: 'yellow', marginLeft: 30 }}>I DONT KNOW</div>
    }
    let mapValues = data_type_map[data_type_id]

    return (
      <div>
          <div className="basic-container">
            <div className="item-wrapper">
              <SwapIcons
                allowNext={!isLastChild}
                allowPrevious={!isFirstChild}
                onSwap={actions.onSwap}
              />
            </div>

            <ActionBar {...actions} isQuestion={true}/>
            <select value={data_type_id} onChange={(event) => {
              props.data.data_type_id = parseInt(event.target.value);
              actions.onUpdate([], props.data);
            }}>
              {data_type_id_list.map((id, i) => (
                <option
                  key={i}
                  value={id}
                  label={data_type_map[id].description}
                />
              ))}
            </select>
            <hr/>
            <p>{mapValues.questions.question_text}</p>
          </div>
          {(children || []).map((dataType, i) => renderChild(i, dataType, props, i === children.length - 1))}
        </div>
    )
  }
}

function ActionBar({ onDelete, onAddCondition, onAddQuestion, isQuestion }) {
  return (
    <ul className="actions" style={{ marginTop: 0, position: 'absolute', right: '15px' }}>
      <li style={{ display: 'inline-block', paddingRight: 8 }}><a href="#" onClick={(e) => { e.preventDefault(); onDelete([]) }}>delete</a></li>
      {isQuestion && <li style={{ display: 'inline-block', paddingRight: 8 }}><a href="#" onClick={(e) => { e.preventDefault(); onAddCondition([]) }}>+ condition</a></li>}
      {!isQuestion && <li style={{ display: 'inline-block', paddingRight: 8 }}><a href="#" onClick={(e) => { e.preventDefault(); onAddQuestion([]) }}>+ question</a></li>}
    </ul>
  )
}

function SwapIcons({ allowNext, allowPrevious, onSwap }) {
  return (
    <div className="swap-container">
      <ul>
        {allowPrevious && <li><a onClick={() => onSwap([], false)}>&uarr;</a></li>}
        {allowNext && <li><a onClick={() => onSwap([], true)}>&darr;</a></li>}
      </ul>
    </div>
  )
}

function ConditionSelect({ value, onUpdate }) {
  return (
    <select value={value} onChange={onUpdate}>
      <option label="equals" value={"$eq"}></option>
      <option label="does not equal" value={"$ne"}></option>
      <option label="greater than" value={"$gt"}></option>
      <option label="greater than or equal to" value={"$gte"}></option>
      <option label="less than" value={"$lt"}></option>
      <option label="less than or equal to" value={"$lte"}></option>
    </select>
  )
}

function SingleCondition({ condition, data, actions, remove, add }) {
  return (
    <p className="single-condition">
      {"IF answer "}
      <ConditionSelect
        value={condition[0]}
        onUpdate={(e) => {
          condition[0] = e.target.value
          actions.onUpdate([], data, true)
        }}
      />
      <input
        onChange={(e) => {
          condition[1] = e.target.value
          actions.onUpdate([], data, true)
        }}
        value={condition[1]}
        style={{ width: 300 }}
      />
      <a
        className="remove-single-condition"
        href="#"
        onClick={add}
        >
        add sibling
      </a>
      {remove && (<a
        className="remove-single-condition"
        href="#"
        onClick={remove}
        >
        remove
      </a>)}
    </p>
  )
}

function renderChild(i, dataType, props, isLastChild) {
  return (
    <DataType
      data_type_map={props.data_type_map}
      data_type_id_list={props.data_type_id_list}
      index={i}
      lastUpdatedIndices={props.lastUpdatedIndices && props.lastUpdatedIndices.slice(1)}
      data={dataType}
      key={i}
      isLastChild={isLastChild}
      isFirstChild={i === 0}
      actions={{
        onSwap: (x, direction) => props.actions.onSwap([i, ...x], direction),
        onUpdate: (x, data, silent) => props.actions.onUpdate([i, ...x], data, silent),
        onDelete: (x) => props.actions.onDelete([i, ...x]),
        onAddCondition: (x) => props.actions.onAddCondition([i, ...x]),
        onAddQuestion: (x) => props.actions.onAddQuestion([i, ...x])
      }}
    />
  )
}
