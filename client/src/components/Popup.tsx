import "./Popup.css"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { faXmark } from "@fortawesome/free-solid-svg-icons"

interface ButtonSpec {
  text: string;
  onClick: () => void;
}

function buttonFromSpec(spec: ButtonSpec, className: string | undefined = undefined) {
  return <button onClick={spec.onClick} className={className}>{spec.text}</button>
}

function Popup(props: {
  title: string;
  bodyText?: string;
  buttonSpecDismiss: ButtonSpec;
  buttonSpecConfirm?: ButtonSpec;
}) {
  const { title, bodyText, buttonSpecDismiss, buttonSpecConfirm } = props

  const body = bodyText ? <p>{bodyText}</p> : null

  const buttonDismiss = buttonFromSpec(buttonSpecDismiss, "popup-button-dismiss")
  const buttonConfirm = buttonSpecConfirm ? buttonFromSpec(buttonSpecConfirm) : null

  return (
    <div className="popup-shade" onClick={buttonSpecDismiss.onClick}>
      <div className="popup opaque">
        <header className="popup-header">
          <h2>{title}</h2>
        </header>
        <div>
          {body}
          <div className="popup-buttons-array">
            {buttonDismiss}
            {buttonConfirm}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Popup
