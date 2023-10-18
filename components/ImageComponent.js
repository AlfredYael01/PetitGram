import {Dimensions, FlatList, Image} from 'react-native';

const ImageCompenent = ({ ImagesArray }) => (
    <Image source={ImagesArray} style={{ width: Dimensions.get("window").width*0.35, height: Dimensions.get("window").height*0.1667}} />
);

export default ImageCompenent;


