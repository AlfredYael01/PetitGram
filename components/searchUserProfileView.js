import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";

const SearchUserProfileView = ({ user, navigation }) => {
  return (
    <View style-={styles.container}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("searchUserProfileScreen", { user: user })
        }
      >
        <View style={styles.element}>
          <View style={styles.containerImage}>
            <Image
              source={{ uri: String(user.photo) }}
              height={60}
              width={60}
              style={styles.elementImage}
            />
          </View>

          <View style={styles.containerText}>
            <Text style={styles.elementPseudo}>{user.pseudo}</Text>
            <Text style={styles.elementName}>{user.name}</Text>
            <Text style={styles.elementDescription}>{user.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "purple",
  },

  element: {
    flex: 0.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    //backgroundColor: 'yellow',
    borderWidth: 0.5,
    borderColor: "white",
    height: Dimensions.get("window").height * 0.1,
  },

  containerImage: {
    flex: 0.25,
    //backgroundColor: 'pink'
  },

  containerText: {
    flex: 0.65,
    //backgroundColor: '#c934eb',
    justifyContent: "space-between",
  },

  elementImage: {
    borderRadius: 30,
    marginLeft: Dimensions.get("window").width * 0.05,
  },

  elementPseudo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
  },

  elementName: {
    fontSize: 13,
    color: "gray",
  },

  elementDescription: {
    fontSize: 13,
    color: "gray",
  },
});

export default SearchUserProfileView;
