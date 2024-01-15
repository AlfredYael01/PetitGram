import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions } from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import * as Icon from 'react-native-feather';

const EditComment = ({ route }) => {

    const { comment } = route.params;
    const { post } = route.params;
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [commentText, setComment] = useState(comment.comment);

    const dispatch = useDispatch();

    const handleComment = async () => {
            
            if(buttonDisabled) return;
    
            setButtonDisabled(true);
    
            if (commentText === '') {
                return alert('Please enter a comment');
            }
            dispatch(updateComment({ post, comment }));    
        }



    return(
        <View style={styles.container}>
            <Text style={styles.text}>Edit Comment</Text>
            <TextInput
                style={styles.input}
                value={commentText}
                onChangeText={(text) => setComment(text)}
                textAlignVertical="top"
                onSubmitEditing={() => handleComment()}
                multiline
            />
            <TouchableOpacity style={styles.postButton} onPress={ async () => handleComment()} disabled={buttonDisabled}>
                <Icon.Send style={styles.postText} width={24} height={24} color={'#fff'} />
            </TouchableOpacity>
        </View>
    
    )

};


const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },


    input: {
        height: Dimensions.get('window').height * 0.1,
        width: Dimensions.get('window').width * 0.8,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 10,
        marginLeft: Dimensions.get('window').width * 0.1,
        paddingLeft: Dimensions.get('window').width * 0.05,
        paddingTop: Dimensions.get('window').height * 0.01,
    }
});


export default EditComment;