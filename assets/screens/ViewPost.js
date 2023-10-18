import { StyleSheet, Text, View, Image} from 'react-native';

const ViewPost = () => {
    return(
        <View>
           <Image source={require('../screens/GenreationImage/ImageArt.jpeg')} style={{width: 200, height: 200}}/>
        </View>
    );
}
export default ViewPost;

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
} );