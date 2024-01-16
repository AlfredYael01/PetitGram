import React, { useState, useRef } from 'react';
import { Button, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

export default function App( {navigation} ) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [capturedImages, setCapturedImages] = useState([]);
  const cameraRef = useRef(null);
  const [showNextButton, setShowNextButton] = useState(false);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.009 });;
      console.log('Photo taken:', photo);

      // Mettre à jour la liste des images capturées
      setCapturedImages(prevImages => [...prevImages, photo]);
      // Afficher le bouton "Next"
      setShowNextButton(true);
    }
  };

  const deletePicture = index => {
    const updatedImages = [...capturedImages];
    updatedImages.splice(index, 1);
    setCapturedImages(updatedImages);

    // Cacher le bouton "Next" si aucune image n'est sélectionnée
    if (updatedImages.length === 0) {
      setShowNextButton(false);
    }
  };

  const handleNext = () => {
    // Extraire les URI de l'objet capturedImages
    const uriArray = capturedImages.map(image => image.uri);
    console.log('Next button pressed. URIs:', uriArray);
  
    // Utiliser la navigation pour passer à l'écran suivant et transmettre les images capturées
    navigation.navigate("Add Description", { selectedImages: uriArray });
  };
  

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef} ratio="1:1">
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Picture</Text>
          </TouchableOpacity>
        </View>
      </Camera>
      <FlatList
        data={capturedImages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.uri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePicture(index)}
            >
              <Text style={styles.text}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        horizontal
        inverted
      />
      {showNextButton && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.text}>Add Description</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 2,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  captureButton: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    height: 0,
  },
  previewImage: {
    width: 100,
    height: 100,
    margin: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  nextButton: {
    position: 'absolute',
    bottom: 5,
    right: 17,
    backgroundColor: 'green',
    padding: 6,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
