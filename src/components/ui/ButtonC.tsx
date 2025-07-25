import React, { FC } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: object;
}

const ButtonC: FC<Props> = ({ title, onPress, loading = false, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default ButtonC;

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff0036",
    borderRadius: 30,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontFamily: "Redressed-Regular",
  },
});
