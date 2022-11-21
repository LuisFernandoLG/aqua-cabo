import { View } from "react-native";

export const FloatContainer = ({
  position,
  top,
  right,
  bottom,
  left,
  children,
  width,
  zIndex,
}) => {
  const floatStyles = styles({
    position,
    top,
    right,
    bottom,
    left,
    width,
    zIndex,
  });
  return <View style={floatStyles}>{children}</View>;
};

const styles = ({ position, top, right, bottom, left, width, zIndex }) => ({
  position: "absolute",

  top: top ? top : "auto",
  right: right ? right : "auto",
  bottom: bottom ? bottom : "auto",
  left: left ? left : "auto",
  width: width ? width : "auto",
  zIndex: zIndex | 1,
  background:"transparent"
});
