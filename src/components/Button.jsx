import React, { useState } from 'react'

function Button() {
    const   [text,setText] = useState("Like")
    function changvale(){
        setText(function(prev){
          if (prev == "Like") {
            return "Unliked";
          } else {
            return "Like"
          }
        
        })
    }
  return (
    <div className="bg-blue-200 p-2 w-fit rounded-md m-2" onClick={changvale}>
      {text}
    </div>
  )
}

export default Button