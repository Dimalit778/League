import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

const TextInputC = ({ ...props }) => {
  return (
    <View style={styles.container}>
      <TextInput style={styles.input} {...props} />
    </View>
  );
};

export default TextInputC;

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    fontSize: 15,
  },
  border: {
    width: "100%",
    backgroundColor: "gray",
    height: 1,
    alignSelf: "center",
  },
});
