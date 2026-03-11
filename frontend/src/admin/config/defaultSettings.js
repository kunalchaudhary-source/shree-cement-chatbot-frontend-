const defaultSettings = {
  appearance: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    headerTextColor: '#ffffff',
    botBubbleColor: '#EFEFEF',
    botTextColor: '#333333',
    botAvatarColor: '#012A89',  // SS avatar square color
    userBubbleColor: '#0032A1',
    userTextColor: '#ffffff',
    iconType: 'ask',            // 'ask' | 'mascot' | 'custom'
    customIconUrl: '',           // base64 or URL when iconType === 'custom'
    avatarIconType: 'default',   // icon shown in header next to assistant name
    avatarCustomIconUrl: '',     // base64 or URL for custom header avatar
    statusText: 'Online',
    position: 'bottom-right',  // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    mobilePosition: 'top-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    askButtonBreathing: true,  // breathing animation on the Ask button
    dynamicChoiceSize:  true,  // auto-size choice buttons to text width
    choiceActiveColor:  '#0032A1', // selected choice fill + default border/text
    choiceDimColor:     '#B6B6B6', // unselected choices after one is picked
    headerNameColor:    '#000000', // "I'm ..." name + tagline text color
    typingDotsColor:    '#012A89', // colour of the three typing dots
    chatBgAccentColor:  '#ACC5FF', // chat messages area background accent corners
    helloGradientStart:  '#8724FF', // "Hello!!" text gradient from
    helloGradientEnd:    '#155CFF', // "Hello!!" text gradient to
    accentGradientStart: '#012C8F', // SS bubble + close button from
    accentGradientEnd:   '#001F63', // SS bubble + close button to
    splashGradientStart: '#BD67FF', // splash screen background from
    splashGradientEnd:   '#2E4FDF', // splash screen background to
    splashMascotUrl:     '',        // custom splash mascot image (base64 or URL)
  },
  content: {
    assistantName: 'Chat Assistant',
    tagline: 'Your go-to help for all queries.',
    greetingMessage: 'Hello! How can I help you today?',
    errorMessage: "Sorry, I'm having trouble connecting. Please try again later.",
    inputPlaceholder: 'Type your message...',
  },
  behavior: {
    widgetVisible: true,
    autoOpen: false,
    showTimestamps: true,
    typingIndicatorEnabled: true,
    splashEnabled: true,   // show splash animation on widget open
    inputEnabled:  true,   // show the text input bar
    closeButtonVisible: true, // show the red X close button on the trigger icon
    typingDuration: 1500, // minimum ms to show typing dots (0 = instant)
  },
  workflow: {
    apiBaseUrl:     '',
    typebotId:      '',
    bearerToken:    '',
    allowedOrigins: [],
  },
};

export default defaultSettings;
