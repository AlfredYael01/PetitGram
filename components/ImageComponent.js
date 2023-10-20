import React from 'react';
import { Dimensions, Image, TouchableOpacity } from 'react-native';

const ImageCompenent = ({ image, navigation }) => {
    return (
        <TouchableOpacity onPress={() => navigation.navigate('ViewPost', { selectedImage: image })}>
            <Image
                source={{uri: String(image)}}
                style={{
                    borderColor: 'black',
                    borderWidth: 0.5,
                    width: Dimensions.get('window').width / 3 ,
                    height: (((Dimensions.get('window').height /10)*6)/3.31)
                }}
            />
        </TouchableOpacity>
    );
};

export default ImageCompenent;
