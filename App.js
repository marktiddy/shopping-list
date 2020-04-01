import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Button
} from "react-native";
const firebase = require("firebase");
require("firebase/firestore");
global.crypto = require("@firebase/firestore");

import API_KEY from "./keys";

//Fix the crypto error
import { decode, encode } from "base-64";

export default function App() {
  const [lists, setLists] = useState([]);
  const [uid, setUid] = useState(0);
  const [loggedInText, setLoggedInText] = useState(
    "Please wait, you are getting logged in"
  );

  //Set up firebase
  global.crypto.getRandomValues = byteArray => {
    for (let i = 0; i < byteArray.length; i++) {
      byteArray[i] = Math.floor(256 * Math.random());
    }
  };

  if (!global.btoa) {
    global.btoa = encode;
  }

  if (!global.atob) {
    global.atob = decode;
  }

  //Configure firebase
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: API_KEY,
      authDomain: "test-db-4aba1.firebaseapp.com",
      databaseURL: "https://test-db-4aba1.firebaseio.com",
      projectId: "test-db-4aba1",
      storageBucket: "test-db-4aba1.appspot.com",
      messagingSenderId: "565765743262",
      appId: "1:565765743262:web:6184cfc5b8b20fa830118f",
      measurementId: "G-CGD5WBCCE0"
    });
  }

  //Create a reference to our collection to find a user's items
  var referenceShoppingLists;

  //create a reference which lets us add to a list
  const referenceAllShoppingLists = firebase
    .firestore()
    .collection("shoppinglists");

  //Helper function to process our data
  const onCollectionUpdate = snapshot => {
    const lists = [];
    snapshot.forEach(doc => {
      var data = doc.data();
      lists.push({
        name: data.name,
        items: data.items.toString()
      });
    });
    //And set the state
    setLists(lists);
  };

  const addNewItems = () => {
    referenceAllShoppingLists.add({
      name: "test list",
      items: ["juice", "pizza", "pepperoni"],
      uid: uid
    });
  };

  const genKey = () => {
    return Math.floor(Math.random() * 10000000).toString();
  };

  //Get our initial information
  useEffect(() => {
    //See if user exists or not
    const authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //Update the user state
      setUid(user.uid);
      setLoggedInText("Hello There");
    });

    //Reference the user shopping list

    referenceShoppingLists = firebase
      .firestore()
      .collection("shoppinglists")
      .where("uid", "==", uid);
    //Reference our shopping list
    const unsubscribe = referenceShoppingLists.onSnapshot(snap => {
      onCollectionUpdate(snap);
    });
    //unsubscribe at end
    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Here are your items</Text>
      <FlatList
        data={lists}
        keyExtractor={list => genKey()}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.name}:{item.items}
          </Text>
        )}
      />
      <Text>{uid}</Text>
      <TouchableOpacity onPress={() => addNewItems()}>
        <Text style={styles.button}>Add Something</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  item: {
    fontSize: 20
  },
  title: {
    padding: 20
  },
  button: {
    marginBottom: 150,
    backgroundColor: "red",
    color: "white",
    padding: 20
  }
});
