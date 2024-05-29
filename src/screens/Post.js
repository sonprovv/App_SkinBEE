import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, TextInput, ScrollView, Button, Alert } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import firestore from '@react-native-firebase/firestore'
import { launchImageLibrary as _launchImageLibrary, launchCamera as _launchCamera } from 'react-native-image-picker';
import { useNavigation } from "@react-navigation/native";
// import { getStorage } from "firebase/storage";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

let launchImageLibrary = _launchImageLibrary;
let launchCamera = _launchCamera;
const wS = Dimensions.get('screen').width / 100;

const Post = ({ route }) => {

    const navigation = useNavigation()

    console.log("Post" + route.params)

    const { key } = route.params;

    const openImagePicker = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };
        launchImageLibrary(options, handleResponse);
        console.log('img');
    };

    const handleCameraLaunch = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        launchCamera(options, handleResponse);
        console.log('cam');
    };

    const handleResponse = (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.error) {
            console.log('Image picker error: ', response.error);
        } else {
            let imageUri = response.uri || response.assets?.[0]?.uri;
            setUri(imageUri);
        }
    };

    const data = [
        { key: '0', value: 'Select' },
        { key: '1', value: 'DHA' },
        { key: '2', value: 'Serum' },
        { key: '3', value: 'Moisturizer' },
        { key: '4', value: 'Sunscreen' },
        { key: '5', value: 'Make-up remove' }
    ]
    const [select, setSelect] = useState(0)

    const [brand, setBrand] = useState(key)
    // const [brand, setBrand] = useState('Sondepzai')

    const [uri, setUri] = useState(null)
    const [name, setName] = useState(null)
    const [type, setType] = useState(data[0].value)
    const [price, setPrice] = useState(null)
    const [des, setDes] = useState(null)
    const [discount, setDiscount] = useState(0)



    const createProduct = async () => {
        try {
            const storage = getStorage();
            const timestamp = Date.now();
            const fileName = `products/${timestamp}.jpg`;
            
            // Create a storage reference
            const storageRef = ref(storage, fileName);
    
            // Create metadata with the correct MIME type
            const metadata = {
                contentType: 'image/jpeg', // Change to 'image/png' if needed
            };
    
            // Convert uri to Blob or File object if it's not already
            const response = await fetch(uri);
            const blob = await response.blob();
    
            // Upload the file with metadata
            const snapshot = await uploadBytes(storageRef, blob, metadata);
            console.log('Uploaded a blob or file!', snapshot);
            
            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef);
            console.log("Download URL: " + downloadURL);
            
            // Add the product details to Firestore
            const doc = await firestore().collection('product').doc();
            const UId = doc.id;
            console.log("ok: " + UId)
            await doc.set({
                _id: UId,
                brandId: brand,
                name: name,
                uri: downloadURL,
                // uri: uri,
                type: type,
                price: price,
                discount: discount,
                description: des,
            });
    
            // Clear the input fields and provide feedback
            setUri(null);
            setName(null);
            setType(data[0].value);
            setPrice(null);
            setDes(null);
            Alert.alert("Success");
            navigation.navigate("Product");
        } catch (error) {
            console.error('Error creating product: ', error);
            Alert.alert("Failed to create product");
        }
    };
    

    // const update = async () => {
    //     const product = doc(db, 'product', id)
    //     await updateDoc(product, {
    //         uri: uri,
    //         name: name,
    //         gender: gender,
    //         dob: dob,
    //         nationality: nation,
    //         phone: phone,
    //         email: email
    //     })
    //     navigation.navigate("User")
    // }

    return (
        <View style={styles.alignCenter}>

            <View style={[styles.header, styles.justifyCenter, styles.alignCenter, styles.flexBox, styles.spaceBetween]}>
                <Text style={styles.title}>New Product</Text>

                <TouchableOpacity
                    style={[styles.send, styles.alignCenter, styles.justifyCenter]}
                    onPress={createProduct}
                >
                    <Image
                        source={require('../img/iconSend.png')}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>

            <View style={[styles.frame, styles.flexBox]}>
                {uri == null ?
                    <View style={[styles.image, styles.alignCenter, styles.justifyCenter]}>
                    </View>
                    :
                    <View style={[styles.image, styles.alignCenter, styles.justifyCenter]}>
                        <Image
                            source={{ uri: uri }}
                            style={styles.imgProduct}
                        />
                    </View>
                }
                <View style={[styles.justifyCenter]}>
                    <Button title="Choose from Device" onPress={openImagePicker} />
                    <View style={{ marginVertical: 8 }}></View>
                    <Button title="Open Camera" onPress={handleCameraLaunch} />
                </View>
            </View>

            <View style={{ ...styles.frame, ...styles.alignCenter, padding: wS * 5 }}>
                <Text style={styles.title2}>Product Infomation:</Text>
                <View style={{ ...styles.flexBox, ...styles.alignCenter, marginTop: wS * 4 }}>
                    <Text style={styles.content}>
                        Name:
                    </Text>
                    <TextInput
                        placeholder="Enter name of product"
                        style={styles.txtInfo}
                        onChangeText={(name) => setName(name)}
                        value={name}
                    />
                </View>
                <View style={{ ...styles.flexBox, ...styles.alignCenter, marginTop: wS * 4 }}>
                    <Text style={styles.content}>
                        Type:
                    </Text>
                    <SelectList
                        data={data}
                        setSelected={(select) => {
                            setSelect(select)
                            setType(data[select].value)
                        }}
                        placeholder="Select"
                        maxHeight={wS * 20}
                        boxStyles={{
                            width: wS * 66,
                            height: wS * 12,
                            color: 'red',
                        }}
                        dropdownStyles={{
                            width: wS * 66,
                            position: 'absolute',
                            marginTop: wS * 10,
                            zIndex: 9999,
                            backgroundColor: 'aqua',
                            color: 'yellow'
                        }}
                    />
                </View>
                <View style={{ ...styles.flexBox, ...styles.alignCenter, marginTop: wS * 4 }}>
                    <Text style={styles.content}>
                        Price:
                    </Text>
                    <View style={{ ...styles.flexBox, ...styles.flexBox, ...styles.alignCenter, flex: 1 }}>
                        <TextInput
                            style={{ ...styles.txtInfo, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                            placeholder="Enter price of product"
                            onChangeText={(price) => setPrice(price)}
                            value={price}
                        />
                        <Text style={styles.dollar}>$</Text>
                    </View>
                </View>
            </View>
            <View style={{ ...styles.frame, ...styles.alignCenter, padding: wS * 5, maxHeight: wS * 50 }}>
                <Text style={styles.title2}>Description:</Text>
                <TextInput
                    style={{ ...styles.des, position: 'absolute', marginTop: wS * 16, borderWidth: 0, zIndex: 999 }}
                    value={des}
                    onChangeText={(text) => {
                        setDes(text)
                    }}
                />
                <Text style={[styles.des, styles.txtDes]}>{des}</Text> 
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    alignCenter: {
        alignItems: 'center',
    },
    justifyCenter: {
        justifyContent: 'center',
    },
    header: {
        width: wS * 100,
        paddingHorizontal: wS * 8,
    },
    title: {
        fontSize: 25,
        marginVertical: wS * 8,
        color: '#000',
    },
    flexBox: {
        display: 'flex',
        flexDirection: 'row',
    },
    frame: {
        width: wS * 90,
        backgroundColor: '#ffffff',
        elevation: 1,
        shadowColor: '#cccccc',
        borderRadius: wS * 2,
        marginBottom: wS * 3,
        padding: wS * 2,
    },
    image: {
        width: wS * 34,
        height: wS * 34,
        marginRight: wS * 2,
        borderWidth: wS,
        borderStyle: 'dotted',
        borderColor: '#cccccc',
    },
    imgProduct: {
        width: '100%',
        height: '100%',
    },
    input: {
        width: wS * 46,
        height: wS * 8,
        marginHorizontal: wS * 2,
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 0,
        paddingLeft: wS * 4,
        borderRadius: wS,
    },
    btn: {
        backgroundColor: 'aqua',
        width: wS * 18,
        height: wS * 8,
        borderRadius: wS,
        marginVertical: wS * 2,
    },
    txtBtn: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    title2: {
        fontSize: 18,
        color: '#000',
    },
    content: {
        fontSize: 16,
        fontWeight: 'bold',
        fontStyle: 'italic',
        width: wS * 14,
        // backgroundColor: 'red',
        marginRight: wS * 2,
        color: '#000',
    },
    txtInfo: {
        color: '#000',
        flex: 1,
        borderWidth: 1,
        borderColor: '#cccccc',
        height: wS * 10,
        padding: 0,
        paddingLeft: wS * 5,
        borderRadius: wS,
    },
    dollar: {
        fontSize: 16,
        color: '#000',
        height: wS * 10,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: '#cccccc',
        paddingHorizontal: wS * 3,
        paddingVertical: wS * 2,
        borderTopRightRadius: wS,
        borderBottomRightRadius: wS,
    },
    des: {
        color: '#000',
        width: wS * 80,
        minHeight: wS * 30,
        borderWidth: 1,
        marginTop: wS * 5,
        borderColor: '#cccccc',
    },
    txtDes: {
        fontSize: 15,
        paddingVertical: wS * 2,
        paddingHorizontal: wS * 4,
        textAlign: 'justify',
        maxHeight: wS * 30,
    },
    send: {
        borderWidth: 1,
        width: wS * 10,
        height: wS * 8,
        borderRadius: wS * 4,
        marginLeft: wS * 32,
    },
    icon: {
        width: wS * 5,
        height: wS * 5,
        objectFit: 'contain',
    },
})

export default Post;


