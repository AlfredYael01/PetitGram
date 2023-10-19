import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';

const ViewPost = ({ route }) => {
    const { selectedImage } = route.params;

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    return (
        <View style={styles.container}>
            <Image source={selectedImage} style={{ width: screenWidth, height: screenHeight / 2 }} />
        </View>
    );
}

export default ViewPost;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop : Dimensions.get('window').height*0.05
    }
});
