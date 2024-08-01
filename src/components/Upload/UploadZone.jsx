import React, { useState, useRef } from "react";
import { IconPaperclip, IconCircleArrowUp, IconX } from '@tabler/icons-react';
import { Textarea, Flex, rem, ActionIcon, FileInput, Modal, Image, Paper, ScrollArea, Text, Highlight } from '@mantine/core';
import { uploadFile } from "../../api/upload"; // Import the upload function
import { uploadText } from "../../api/uploadText"; // Import the uploadText function
import { showNotification, notifications } from '@mantine/notifications';



export default function Uploadcv() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(""); // To store URL of the file if it's an image
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal visibility
  const [text, setText] = useState(""); // State to manage text input
  const [isTextareaDisabled, setIsTextareaDisabled] = useState(false); // State to manage Textarea disabled
  const [messages, setMessages] = useState([]); // State to manage chat messages
  const fileInputRef = useRef(null); // Reference for FileInput component

  const handleFileChange = (file) => {
    if (file) {
      setFile(file);

      if (file.type.startsWith('image/')) {
        // Create a URL for the image and update the state
        const url = URL.createObjectURL(file);
        setFileUrl(url);
      } else {
        // For PDF and DOCX, store the file name
        setFileUrl(file.name);
      }

      // Disable Textarea when a file is selected
      setIsTextareaDisabled(true);
      setText(""); // Clear the text
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation(); // Prevent event bubbling to the Textarea click handler

    // Revoke the URL created for the image to free memory
    if (fileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(fileUrl);
    }

    // Reset the image and file state
    setFile(null);
    setFileUrl("");
    setIsTextareaDisabled(false); // Re-enable Textarea
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleSend = async () => {
    const notificationId = 'loading-notification'; // Use a fixed ID for the notification
  
    try {
      // Show initial notification indicating that the response is being generated
      showNotification({
        id: notificationId, // Use a fixed ID for the notification
        title: 'Generating Response...',
        message: 'Please wait while we process your request.',
        loading: true,
        autoClose: false,
      });
  
      let response;
      if (file) {
        // Upload the file
        response = await uploadFile(file);
        console.log("File Upload API Response:", response);
  
        // Add user message
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            type: 'input', 
            content: file.type.startsWith('image/') ? (
              <img src={fileUrl} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }} />
            ) : text || file.name 
          },
        ]);
      } else if (text.trim()) {
        // Call the uploadText API
        response = await uploadText(text);
        console.log("Text API Response:", response);
  
        // Add user message
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'input', content: text },
        ]);
      }
  
      if (response) {
        const apiResponse = response.data || [];
        let successMessage = response.message || "Questions answered successfully";

        // Clear noti queue when success
        notifications.clean()
  
        // Process each section in the response data
        const questionsAndAnswers = apiResponse.reduce((acc, section) => {
          const sectionContent = section['section content'];
          if (Array.isArray(sectionContent)) {
            sectionContent.forEach((qa) => acc.push(qa));
          } else if (sectionContent && typeof sectionContent === 'object') {
            acc.push(sectionContent);
          } else {
            console.warn("Expected an array or an object for section content, but got:", sectionContent);
          }
          return acc;
        }, []);
  
        // Add success message and API response message to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'output', content: (
            <>
              <ul style={{ paddingInlineStart: "0", listStyleType: "none", margin: "0", padding: "0" }}>
                {questionsAndAnswers.map((qa, index) => (
                  <li key={index} style={{ marginBottom: "1rem" }}>
                    <Text size="lg" weight={500} style={{ whiteSpace: "pre-line" }}>{qa.question}</Text>
                    <div style={{ whiteSpace: "pre-line", marginTop: "0.5rem" }}>
                      <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Answer:</span>
                      <span> </span>
                      <Highlight style={{ display: 'inline' }} highlight={qa.answer}>
                        {qa.answer}
                      </Highlight>
                    </div>
                    <div style={{ whiteSpace: "pre-line", marginTop: "0.5rem" }}>
                      <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Explanation:</span>
                      <span> </span>
                      <Text style={{ display: 'inline' }}>{qa.explanation}</Text>
                    </div>
                    <div style={{ whiteSpace: "pre-line", marginTop: "0.5rem" }}>
                      <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Knowledge:</span>
                      <span> </span>
                      <Text style={{ display: 'inline' }}>{qa.knowledge}</Text>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )},
        ]);
  
        // Clear file and text state
        setFile(null);
        setFileUrl("");
        setText("");
        setIsTextareaDisabled(false); // Re-enable Textarea
  
        // Update notification to success message
        showNotification({
          id: notificationId, // Use the same ID to update the notification
          title: 'Response Generated',
          message: successMessage,
          color: 'green',
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
  
      // Update notification to error message
      showNotification({
        id: notificationId, // Use the same ID to update the notification
        title: 'Error',
        message: 'An error occurred while processing your request.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };
  
  
  
  
  
  
  
  
  return (
    <Flex
      direction="column"
      justify="flex-end"
      align="center"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 200, // Size of the left menu
        right: 0,
        padding: '10px',
        boxSizing: 'border-box',
      }}
    >
      <Flex direction="column" align="center" style={{ width: '70%' }}>
        {/* Chat Display Area */}
        <ScrollArea style={{ width: '100%', height: '70vh', marginBottom: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
            {messages.map((message, index) => (
              <Flex
                key={index}
                direction={message.type === 'input' ? 'row-reverse' : 'row'}
                align="flex-start"
                style={{ marginBottom: '10px' }}
              >
                <Paper
                  padding="md"
                  radius="md"
                  style={{
                    maxWidth: '60%',
                    backgroundColor: message.type === 'input' ? '#e1ffc7' : '#f1f1f1',
                  }}
                >
                  {message.content}
                </Paper>
              </Flex>
            ))}
          </div>
        </ScrollArea>

        <Flex
          direction="row"
          align="center"
          style={{ width: '100%', position: 'relative' }}
        >
          <Textarea
            size="xl"
            radius="xl"
            placeholder="Message here..."
            value={text} // Use text state for input value
            onChange={(e) => setText(e.currentTarget.value)} // Update text state
            style={{
              flexGrow: 1, // Take up the remaining width
              position: 'relative',
              padding: file ? '80px 10px 10px 10px' : '10px', // Adjust padding for file input
              overflow: 'auto', // Ensure text can be scrolled if needed
            }}
            leftSection={
              <ActionIcon
                variant="white"
                color="gray"
                aria-label="Attach"
                component="label"
                htmlFor="file-input"
              >
                <IconPaperclip style={{ width: rem(18), height: rem(20) }} />
              </ActionIcon>
            }
            rightSection={
              <ActionIcon
                variant="white"
                color="gray"
                aria-label="Send"
                onClick={handleSend} // Call handleSend on click
                disabled={isTextareaDisabled && !file} // Disable if textarea is disabled and no file
              >
                <IconCircleArrowUp style={{ width: rem(30), height: rem(30) }} />
              </ActionIcon>
            }
            autosize
            disabled={isTextareaDisabled && !file} // Disable Textarea based on the state
          />
          {/* Image preview within the Textarea */}
          {file && file.type.startsWith('image/') && (
            <div
              style={{
                position: 'absolute',
                top: '10px', // Adjust this value to ensure the image fits well
                left: '10px',
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#f0f0f0',
                cursor: 'pointer',
                zIndex: 10,
              }}
              onClick={openModal}
            >
              <img
                src={fileUrl}
                alt="Uploaded preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Remove button for the image */}
              <ActionIcon
                variant="light"
                color="red"
                onClick={handleRemoveFile}
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                }}
              >
                <IconX style={{ width: rem(18), height: rem(18) }} />
              </ActionIcon>
            </div>
          )}
          {/* File name display for PDF and DOCX */}
          {file && !file.type.startsWith('image/') && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                display: 'flex',
                alignItems: 'center',
                background: '#f0f0f0',
                borderRadius: '8px',
                padding: '5px',
              }}
            >
              <Text size="sm" style={{ marginRight: '5px' }}>{file.name}</Text>
              <ActionIcon
                variant="light"
                color="red"
                onClick={handleRemoveFile}
              >
                <IconX style={{ width: rem(18), height: rem(18) }} />
              </ActionIcon>
            </div>
          )}
        </Flex>
      </Flex>

      {/* Modal for image preview */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        size="auto"
        title="Image Preview"
      >
        <Image src={fileUrl} alt="Image Preview" />
      </Modal>

      {/* File Input */}
      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files[0])} // Handle file change
      />
    </Flex>
  );
}
