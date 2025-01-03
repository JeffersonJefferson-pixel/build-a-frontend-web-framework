export function extractPropsAndEvents(vdom) {
  const { on: events = {}, ...props } = vdom.props;
  // delete key attribute from props.
  delete props.key;

  return { props, events };
}