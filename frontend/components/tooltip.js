export default function Tooltip(props) {
  return (
    <span className='tooltip'>
      &#128712; <span>{props.question}</span>
      <p className='tooltiptext'>{props.answer}</p>
    </span>
  )
}