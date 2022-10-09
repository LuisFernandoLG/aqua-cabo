import { View } from "react-native";

export const FloatContainer = ({
  position,
  top,
  right,
  bottom,
  left,
  children,
  width,
}) => {
  const floatStyles = styles({ position, top, right, bottom, left, width });
  return <View style={floatStyles}>{children}</View>;
};

const styles = ({ position, top, right, bottom, left, width }) => ({
  position: position && "absolute",

  top: top ? top : "auto",
  right: right ? right : "auto",
  bottom: bottom ? bottom : "auto",
  left: left ? left : "auto",
  width: width ? width : "auto",
});
