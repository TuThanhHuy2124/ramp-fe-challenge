import classNames from "classnames"
import { useContext, useRef } from "react"
import { InputCheckboxComponent } from "./types"
import { CheckboxChangedContext } from "src/App"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)
  const setChanged = useContext(CheckboxChangedContext)

  console.log(id, checked)
  return (
    <div className="RampInputCheckbox--container" 
      data-testid={inputId}
      onClick={() => {onChange(!checked); setChanged(true)}}>
      <label
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
      />
      <input
        id={inputId}
        type="checkbox"
        className="RampInputCheckbox--input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {console.log(e)}}
      />
    </div>
  )
}
