import { StyleSheet, View } from "react-native";

export const FlexContainer = ({
  children,
  flex_direction_r,
  flex_jc_c,
  flex_jc_fs,
  flex_jc_fe,
  flex_jc_sa,
  flex_jc_sb,
  flex_jc_se,
  flex_ai_c,
  flex_ai_fs,
  flex_ai_fe,
  flex_ai_bl,
  flex_ai_s,
  pd,
  pdTop,
  pdBottom,
  pdHorizontal,
  mVertical,
  mHorizontal,
  flex,
  flexGrow,
  style = {},
  ...rest
}) => {
  const containerStyle = [
    flex_direction_r && styles.flex_direction_r,
    flex && { flex: flex },
    pdHorizontal && { paddingHorizontal: pdHorizontal },
    mVertical && { marginVertical: mVertical },
    mHorizontal && { marginHorizontal: mHorizontal },
    flexGrow && { flexGrow: flexGrow },
    pdTop && { paddingTop: pdTop },
    pdBottom && { paddingBottom: pdBottom },
    flex_jc_c && styles.flex_jc_c,
    flex_jc_fs && styles.flex_jc_fs,
    flex_jc_fe && styles.flex_jc_fe,
    flex_jc_sa && styles.flex_jc_sa,
    flex_jc_sb && styles.flex_jc_sb,
    flex_jc_se && styles.flex_jc_se,

    flex_ai_c && styles.flex_ai_c,
    flex_ai_fs && styles.flex_ai_fs,
    flex_ai_fe && styles.flex_ai_fe,
    flex_ai_bl && styles.flex_ai_bl,
    flex_ai_s && styles.flex_ai_s,

    pd && { padding: pd },

    style,
  ];
  return (
    <View style={containerStyle} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flex_direction_r: {
    flexDirection: "row",
  },
  flex_jc_c: {
    justifyContent: "center",
  },
  flex_jc_fs: {
    justifyContent: "flex-start",
  },
  flex_jc_fe: {
    justifyContent: "flex-end",
  },
  flex_jc_sa: {
    justifyContent: "space-around",
  },
  flex_jc_sb: {
    justifyContent: "space-between",
  },
  flex_jc_se: {
    justifyContent: "space-evenly",
  },

  flex_ai_c: {
    alignItems: "center",
  },
  flex_ai_fs: {
    alignItems: "flex-start",
  },
  flex_ai_fe: {
    alignItems: "flex-end",
  },
  flex_ai_bl: {
    alignItems: "baseline",
  },
  flex_ai_s: {
    alignItems: "stretch",
  },
  flex_ai_c: {
    alignItems: "center",
  },
});
