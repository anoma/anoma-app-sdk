import {
  createUserKeyringFromIkm,
  fromHex,
  getPayAddressFromKeyring,
  initSdk,
  stringToBytes,
} from "@anomaorg/anoma-app-sdk";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { isHex } from "viem";

const seed = "anoma-pay-example-seed-do-not-use-with-real-funds";

export default function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    initSdk()
      .then(() => {
        const keyring = createUserKeyringFromIkm(
          isHex(seed) ? fromHex(seed) : stringToBytes(seed),
          "anoma-pay:keyring-seed"
        );
        setMessage(getPayAddressFromKeyring(keyring));
      })
      .catch(e => {
        setMessage(String(e));
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anoma App SDK</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  message: {
    maxWidth: "100%",
  },
});
