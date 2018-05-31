import { buildStyle, root, selector, namespace, component, option, property, value, addCustomStyle, cssVar } from "../../utils/style-util";
import { colors } from './colors';

const styles = buildStyle(root({
  html: selector({
    al: namespace({
      background: component({
        accent: option({
          color: property(value(cssVar(colors.accent)))
        })
      })
    })
  })
}));

export const background = styles.html.al.background;

addCustomStyle(styles, document.head, 'background');
