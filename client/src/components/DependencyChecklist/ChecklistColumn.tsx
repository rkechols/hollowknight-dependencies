import { ProgressionItem } from "../../models";

function ChecklistItems(props: { items: ProgressionItem[] }) {
  if (props.items.length === 0) {
    return <p>(None)</p>;
  }
  return (
    <ul>
      {props.items.map((item, index) => (
        <li key={index}>{item.display_name}</li>
      ))}
    </ul>
  );
}

function ChecklistColumn(props: {
  title: string;
  checklistItems: ProgressionItem[];
}) {
  return (
    <>
      <h2>{props.title}</h2>
      <ChecklistItems items={props.checklistItems} />
    </>
  );
}

export default ChecklistColumn;
