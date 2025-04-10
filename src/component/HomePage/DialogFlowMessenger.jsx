import React, { useEffect, useRef } from 'react';

const DialogflowMessenger = () => {
  const messengerRef = useRef(null);

  useEffect(() => {
    // Load the Dialogflow Messenger script dynamically
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
    script.async = true;
    document.body.appendChild(script);

    // Create the df-messenger element
    const dfMessenger = document.createElement('df-messenger');
    dfMessenger.setAttribute('intent', 'WELCOME');
    dfMessenger.setAttribute('chat-title', 'Trusty');
    dfMessenger.setAttribute('agent-id', '2910d4b7-1d06-431c-8517-a88cc6e54cc4');
    dfMessenger.setAttribute('language-code', 'en');

    // Append the df-messenger element to the ref
    if (messengerRef.current) {
      messengerRef.current.appendChild(dfMessenger);
    }

    return () => {
      // Cleanup on unmount
      if (messengerRef.current) {
        messengerRef.current.innerHTML = ''; // Remove the df-messenger element
      }
      document.body.removeChild(script); // Remove the script
    };
  }, []);

  return <div ref={messengerRef} />;
};

export default DialogflowMessenger;