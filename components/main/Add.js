import React, { useState, useEffect } from 'react';
import { View, Image, FlatList, Button, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { navigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function AddScreen( {navigation} ) {
    const [type, setType] = useState(CameraType.back);
    const [galleryImages, setGalleryImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [lastSelectedImage, setLastSelectedImage] = useState(null);
    const [postButtonDisabled, setPostButtonDisabled] = useState(false);

    function toggleCameraType() {
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }

    const pickImage = async () => {
        if (selectedImages.length < 10) {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImages([...selectedImages, result.assets[0].uri]);
                setLastSelectedImage(result.assets[0].uri);
            }
        } else {
            // Handle when the user tries to select more than 10 images
            alert('You can select a maximum of 10 images.');
        }
    }

    useEffect(() => {
        // Load gallery images on component mount
        (async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
                const assets = await MediaLibrary.getAssetsAsync({ mediaType: 'photo' });
                setGalleryImages(assets);
            }
        })();
    }, []);

    const toggleImageSelection = (imageUri) => {
        if (selectedImages.includes(imageUri)) {
            setSelectedImages(selectedImages.filter(uri => uri !== imageUri));
        } else {
            if (selectedImages.length < 10) {
                setSelectedImages([...selectedImages, imageUri]);
                setLastSelectedImage(imageUri);
            } else {
                // Handle when the user tries to select more than 10 images
                alert('You can select a maximum of 10 images.');
            }
        }
    }

    const removeSelectedImage = (imageUri) => {
        setSelectedImages(selectedImages.filter(uri => uri !== imageUri));
    }

    const handlePost = async () => {
        // Disable the touchable opacity button
        setPostButtonDisabled(true);
        if (selectedImages.length === 0) {
            alert('Please select at least one image to post.');
            // Enable the touchable opacity button
            setPostButtonDisabled(false);
            return;
        }

        // Define post info
        const auth = getAuth();
        const user = auth.currentUser.uid;
        const postId = Math.random().toString(36).substring(7);
        const date = new Date();
        const timestamp = date.getTime();
        const imageUrls = [];

        const storage = getStorage();
        try {
            const uploadPromises = selectedImages.map(async (base64Image, i) => {
                // folder name is the user id
                const imageFileName = `${user}/${postId}/${i}.jpg`;
                const imageRef = ref(storage, imageFileName);
                const response = await fetch(base64Image);
                const blob = await response.blob();
                await uploadBytes(imageRef, blob);
                const imageUrl = await getDownloadURL(imageRef);
                imageUrls.push(imageUrl);
            });
            await Promise.all(uploadPromises);
        } catch (error) {
            console.log(error);
            alert('An error occurred when uploading the images.');
            // Enable the touchable opacity button
            setPostButtonDisabled(false);
            return;
        }

        // Upload data to Firestore
        const db = getFirestore();
        const docRef = await addDoc(collection(db, "posts"), {
            _id: postId,
            userId: user,
            images: imageUrls,
            timestamp: timestamp,
            date: date,
        });

        console.log("Document written with ID: ", docRef.id);

        // Clear selected images
        setSelectedImages([]);
        setLastSelectedImage(null);

        // Enable the touchable opacity button
        setPostButtonDisabled(false);

        // navigate to the profile screen
        navigation.navigate('Profile');
    };
    
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>New Post</Text>
                <TouchableOpacity style={styles.nextButton}  onPress={() => handlePost()} testID ="nextButton" disabled={postButtonDisabled}>
                    <Text style={styles.nextButtonText}>Post</Text>
                </TouchableOpacity>
            </View>

            {/* Selected Images */}
            <View style={styles.selectedImagesContainer}>
                {selectedImages.map((imageUri, index) => (
                    <View key={index} style={styles.selectedImageItem}>
                        <Image source={{ uri: imageUri }} style={styles.selectedImageThumbnail}testID="publication-image" />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => removeSelectedImage(imageUri)}>
                            <Text style={styles.removeImageText}>X</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Image Preview */}
            <View style={styles.imagePreview}>
                {lastSelectedImage && (
                    <Image source={{ uri: lastSelectedImage }} style={styles.selectedImageThumbnailBig} testID='previewImage' />
                )}
            </View>

            {/* Image Picker and Camera */}
            <View style={styles.imagePickerCamera}>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} testID='galleryButton'>
                    <Text style={styles.buttonText}>Pick Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraType}>
                    <Text style={styles.buttonText}>Switch Camera</Text>
                </TouchableOpacity>
            </View>

            {/* Gallery */}
            <View style={styles.galleryContainer}>
                <FlatList
                    data={galleryImages.assets}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => toggleImageSelection(item.uri)}>
                            <Image
                                source={{ uri: item.uri }}
                                style={[
                                    styles.galleryImage,
                                    selectedImages.includes(item.uri) && styles.selectedGalleryImage,
                                ]}
                            />
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    numColumns={width < 768 ? 4 : 6}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#333', // Dark background color for the header
    },
    title: {
        fontSize: 24,
        color: 'white',
    },
    nextButton: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 5,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
    },
    selectedImagesContainer: {
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'center',
        backgroundColor: '#444', // A darker background for the selected images container
    },
    selectedImageItem: {
        marginRight: 10,
        position: 'relative',
    },
    removeImageButton: {
        position: 'absolute',
        top: 0,
        right: 5,
        backgroundColor: 'red',
        borderRadius: 50,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: 'white',
    },
    selectedImageThumbnail: {
        width: 80,
        height: 80,
        maxWidth: '90%',
        maxHeight: '90%',
    },
    selectedImageThumbnailBig: {
        width: 300,
        height: 300,
        maxWidth: '90%',
        maxHeight: '90%',
    },
    imagePreview: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePickerCamera: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#444', // A darker background for the image picker and camera section
    },
    imagePickerButton: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 5,
    },
    cameraButton: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    galleryContainer: {
        flex: 4,
        backgroundColor: '#444', // A darker background for the gallery section
        padding: 5,
    },
    galleryImage: {
        width: width < 768 ? (width / 4) - 8 : (width / 6) - 8,
        height: width < 768 ? (width / 4) - 8 : (width / 6) - 8,
        margin: 3,
    },
    selectedGalleryImage: {
        opacity: 0.7,
        borderColor: 'blue',
        borderWidth: 2,
    },
});
