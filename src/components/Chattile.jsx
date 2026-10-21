import React from 'react'

const Chattile = ({val}) => {
  return (
    <>
        <div >
            <h2>{val.name}</h2>
            <p>{val.message}</p>
        </div>
    </>
  )
}

export default Chattile