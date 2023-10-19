import React from 'react';
import { Dimensions, Image, TouchableOpacity } from 'react-native';

const ImageCompenent = ({ image, navigation }) => {

    return (
        <TouchableOpacity onPress={() => navigation.navigate('ViewPost')}>
            <Image
                source={image}
                style={{
                    borderColor: 'black',
                    borderWidth: 0.5,
                    width: Dimensions.get('window').width * 0.35,
                    height: Dimensions.get('window').height * 0.1667,
                }}
            />
        </TouchableOpacity>
    );
};

export default ImageCompenent;
