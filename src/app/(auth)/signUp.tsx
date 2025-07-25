import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signUpTestFn = () => {
    console.log("signUpTestFn");
  };

  return (
    <View className="flex-1 items-center justify-center bg-red-500">
      <Text className="text-white">Sign Up</Text>
    </View>
    // <View style={styles.container}>
    //   <ImageBackground
    //     source={require("../../../assets/images/backGround.jpg")}
    //     style={styles.imageBackground}
    //   >
    //     {/* <Image source={require("../assets/food/food.png")} style={styles.foodImage} /> */}

    //     <Text style={styles.title}>Fatmore</Text>

    //     <View style={styles.inputsContainer}>
    //       {/* value, onChangeText */}
    //       <TextInputC
    //         value={email}
    //         onChangeText={(text: string) => setEmail(text)}
    //         placeholder="Enter E-mail or User Name"
    //       />
    //       <TextInputC
    //         value={password}
    //         onChangeText={(text: string) => setPassword(text)}
    //         placeholder="Password"
    //         secureTextEntry
    //       />
    //       <TextInputC
    //         value={confirmPassword}
    //         onChangeText={(text: string) => setConfirmPassword(text)}
    //         placeholder="Confirm Password"
    //         secureTextEntry
    //       />

    //       <ButtonC onPress={signUpTestFn} title={"Sign Up"} />

    //       <Text style={styles.orText}>OR</Text>

    //       {/* <SocialMedia /> */}
    //     </View>
    //   </ImageBackground>
    // </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    height: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  foodImage: {
    height: 50,
    width: 90,
    resizeMode: "stretch",
    position: "absolute",
    right: 20,
    top: Platform.OS == "android" ? 20 : 50,
  },
  title: {
    fontSize: 40,
    color: "white",
    marginTop: Platform.OS == "android" ? 60 : 110,
    fontFamily: "Audiowide-Regular",
  },
  inputsContainer: {
    height: 450,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  textDontHave: {
    alignSelf: "flex-end",
    marginRight: 10,
    color: "black",
    marginBottom: 15,
    fontFamily: "NovaFlat-Regular",
  },
  orText: {
    fontSize: 20,
    color: "gray",
    marginTop: 20,
    fontFamily: "Audiowide-Regular",
  },
});
