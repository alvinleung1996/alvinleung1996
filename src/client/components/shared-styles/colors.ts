import { buildStyle, root, selector, namespace, component, option, property, value, addCustomStyle } from "../../utils/style-util";

const styles = buildStyle(root({
  html: selector({
    al: namespace({
      color: component({
        accent: option(value('#01579B'))
      })
    })
  })
}));

export const colors = styles.html.al.color;

addCustomStyle(styles, document.head, 'colors');
