import React from 'react';

export default function Conditional({ data_type_id, children, data_type_map }) {
  if (!data_type_id) {
    return <div/>
  }
  return (
    <div></div>
  )
}
