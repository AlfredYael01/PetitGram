import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View, Image } from 'react-native';

const UserProfileScreen = () => {

    return(
    <View style={styles.container}>
      <StatusBar/>
      <View style={styles.upScreen}>

        <View style={styles.upScreenTop}>
          <View style={styles.upScreenTopLeft}>
            <Image source={require('../../assets/Yo.jpg')} style={styles.image}></Image>
            <Text style={styles.name}>Luis Argüelles</Text>
          </View>

          <View style={styles.upScreenTopRight}>
            <View style={styles.section1}>
              <Text style={styles.numberSection}>4</Text>
              <Text style={styles.textSection}>Publications</Text>
            </View>

            <View style={styles.section2}>
              <Text style={styles.numberSection}>275</Text>
              <Text style={styles.textSection}>Followers</Text>
            </View>

            <View style={styles.section3}>
              <Text style={styles.numberSection}>509</Text>
              <Text style={styles.textSection}>Followed</Text>
            </View>
          </View>
        </View>

        <View style={styles.upScreenMiddle}>
          <Text style={styles.description}>Un vato rifado que siempre anda en todo y que nunca se raja</Text>
        </View>

      </View>

    </View>
    )

}

const styles = StyleSheet.create({

container: {
    flex: 1,
    backgroundColor: '#fff',  
    },

    upScreen: {
    flex: 0.5,
    //backgroundColor: 'green'
    },

    upScreenTop: {
    flexDirection: 'row',
    //backgroundColor: 'black',
    flex: 0.45
    },

    upScreenTopLeft: {
    //backgroundColor: 'purple',
    flex: 0.35,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
    },
    upScreenTopRight: {
    flex: 0.65,
    //backgroundColor: 'yellow',
    flexDirection: 'row'
    },

    textSection: {
    fontSize: 12
    },

    numberSection: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: Dimensions.get('window').height * 0.05
    },

    section1: {
    flex: 1/3,
    //backgroundColor: '#effabe',
    alignItems: 'center',
    justifyContent: 'center'
    },
    section2: {
    flex: 1/3,
    //backgroundColor: '#e6fa8c',
    alignItems: 'center',
    justifyContent: 'center'

    },
    section3: {
    flex: 1/3,
    //backgroundColor: '#d7f745',
    alignItems: 'center',
    justifyContent: 'center'

    },





    upScreenMiddle: {
    flex: 0.2,
    //backgroundColor: 'gray'
    },
    
    name: {
    marginTop: Dimensions.get('window').height * 0.01,
    //color: 'white'
    color: 'black',
    fontWeight: 'bold'
    },

    description: {
    marginTop: Dimensions.get('window').height * 0.001,
    marginLeft: Dimensions.get('window').height * 0.025,
    marginRight: Dimensions.get('window').height * 0.0,
    //color: 'white',
    color: 'black'
    },

    image: {
    width: 80,
    height: 80,
    borderRadius: 80/2,
    marginTop: Dimensions.get('window').height * 0.08
}
})

export default UserProfileScreen