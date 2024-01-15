const YOUR_OPENAI_API_KEY = "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";
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';

/*
curl https://api.openai.com/v1/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "davinci-002",
    "prompt": "Say this is a test",
    "max_tokens": 7,
    "temperature": 0
  }'
*/

const ChatBot = () => {
    const [messages, setMessages] = useState([]);   
    useEffect(() => {
        setMessages([
        {
            _id: 1,
            text: "Hello, I'm your virtual assistant. How can I help you?",
            createdAt: new Date(),
            user: {
            _id: 2,
            name: "Virtual Assistant",
            avatar: "https://placeimg.com/140/140/any",
            },
        },
        ]);
    }, []);
    
    const onSend = async (newMessages = []) => {
        console.log("newMessages: ", newMessages);
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, newMessages)
        );
        let prompt =
            "Prompt for Davinci-002 Model: PetitGram User Guide " +
            "PetitGram users often seek guidance on various aspects of the platform. Help them understand key functionalities with clear and concise responses. " +
            "Human: How do I create a post on PetitGram? \nAI: " +
            "1. Navigate to the main feed. \n" +
            "2. Click on the 'Add' button. \n" +
            "3. Select images for the post. \n" +
            "4. Tap the 'Next' button. \n" +
            "5. Provide a description for the post. \n" +
            "6. Validate and publish the post. \n" +
            "Human: How can I search for someone on PetitGram? \nAI: " +
            "1. Navigate to the main feed. \n" +
            "2. Click on the search button. \n" +
            "3. Type the username in the search bar. \n" +
            "4. View search results. \n" +
            "5. Access the user's profile. \n" +
            "Human: Is there a way to see posts only from my followers? \nAI: " +
            "1. Navigate to the main feed. \n" +
            "2. Go to the toggle filter. \n" +
            "3. Click on the filter button again to switch to default mode. \n" +
            "Human: Why was my post/comment deleted on PetitGram? \nAI: " +
            "Possible Reasons: \n" +
            "Inappropriate Content. \n" +
            "Lack of Respect Towards Others. \n" +
            "Engagement in Spam Activities. \n" +
            "Human: Can I recover my account if I or the administrator deleted it? \nAI: " +
            "1. Attempt Account Recovery. \n" +
            "2. Evaluate the Deletion. \n" +
            "3. Contact Support. \n" +
            "4. Compose an Email explaining the situation. \n" +
            "5. Wait for a Response from the support team. \n" +
            "Human: What happens to my data when I delete my PetitGram account? \nAI: " +
            "Your data is promptly removed from the database, complying with privacy regulations and platform policies. \n" +
            "Human: How do I report a problem on PetitGram? \nAI: " +
            "1. Navigate to help page in the profile drawer. \n" +
            "2. Click on the 'Contact Us' button. \n" +
            "3. Fill the form with the required details. \n" +
            "4. Submit the form. \n" +
            "Human: How do I change my password on PetitGram? \nAI: " +
            "Until now, there is no way to change your password on PetitGram. \n" +
            "ChatHistory: ";
        for (let i = 0; i < newMessages.length; i++) {
            prompt += i % 2 === 0 ? "\nHuman: " : "\nAI: ";
            prompt += newMessages[i].text;
        }
        const response = await fetch("https://api.openai.com/v1/completions", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${YOUR_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
            model: "gpt-3.5-turbo-instruct",
            prompt: prompt + "\nAI:",
            max_tokens: 150,
            temperature: 0,
            }),
        });
        const completion = await response.json();
        console.log("completion: ", completion);
        setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [
            {
            _id: Math.random(),
            text: completion.choices[0].text,
            createdAt: new Date(),
            user: {
                _id: 2,
                name: "Virtual Assistant",
                avatar: "https://placeimg.com/140/140/any",
            },
            },
        ])
        );

    }

    return (
        <View style={styles.container}>
        <GiftedChat
            messages={messages}
            onSend={(newMessages) => onSend(newMessages)}
            user={{
            _id: 1,
            }}
        />
        </View>
    );

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});

export default ChatBot;
