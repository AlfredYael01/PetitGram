import {Dimensions, FlatList, Image} from 'react-native';
import 'react-native-gesture-handler';


const ImageCompenent = ({ ImagesArray }) => (
        <Image source={ImagesArray} style={{ borderColor: 'black', borderWidth:0.5, width: Dimensions.get("window").width*0.35, height: Dimensions.get("window").height*0.1667}} />

);

export default ImageCompenent;


