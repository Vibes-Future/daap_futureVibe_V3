# Notification System Documentation

## Overview

The VIBES DApp Admin includes a professional toast notification system that provides users with real-time feedback on their actions, transactions, and system events.

## Features

- 🎨 **Multiple Notification Types**: Success, Error, Warning, Info, and Transaction
- 🔗 **Transaction Links**: Direct links to Solana Explorer for transaction notifications
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices
- ⏱️ **Auto-dismiss**: Configurable duration or persistent notifications
- 🎯 **Smart Stacking**: Maximum of 5 notifications displayed at once
- 🎭 **Beautiful Animations**: Smooth slide-in and slide-out transitions
- 🎨 **VIBES Design System**: Integrated with the app's color scheme and branding

## Usage

### Basic Notifications

```javascript
// Success notification
notifications.success('Operation completed successfully!');

// Error notification
notifications.error('Something went wrong!');

// Warning notification
notifications.warning('Please check your wallet balance');

// Info notification
notifications.info('Loading data from blockchain...');
```

### Advanced Options

```javascript
// Custom duration (in milliseconds)
notifications.success('Message', { duration: 10000 }); // 10 seconds

// Persistent notification (doesn't auto-dismiss)
notifications.error('Critical error', { duration: 0 });

// Custom title
notifications.success('Data saved!', { 
    title: '✅ Success' 
});

// With action button
notifications.info('New version available', {
    title: 'Update Available',
    action: 'Update Now',
    onAction: () => {
        window.location.reload();
    }
});
```

### Transaction Notifications

Transaction notifications are special notifications that include a link to view the transaction on Solana Explorer:

```javascript
// After a successful transaction
const signature = await contractClient.buyWithSol(amount);

notifications.transaction(
    `Successfully purchased VIBES with ${amount} SOL!`,
    signature,
    { title: '🎉 Purchase Successful' }
);
```

This automatically creates a notification with a "View on Explorer" button that opens the transaction in a new tab.

## Implementation Details

### Files

- **`src/js/notifications.js`**: Main notification system class
- **`index.html`**: CSS styles (lines 2331-2545)
- **`src/js/app-new.js`**: Integration with app methods

### Integration with showMessage()

The app's `showMessage()` method has been updated to use the new notification system automatically:

```javascript
// This will use the new notification system
this.showMessage('Transaction complete!', 'success');
```

### Notification Types

1. **Success** (Green border)
   - Used for: Successful transactions, completed operations
   - Icon: Checkmark in circle
   - Color: `#10b981`

2. **Error** (Red border)
   - Used for: Failed operations, validation errors
   - Icon: Alert circle
   - Color: `#ef4444`
   - Default duration: 7 seconds (longer than others)

3. **Warning** (Orange border)
   - Used for: Warnings, important notices
   - Icon: Warning triangle
   - Color: `#f59e0b`

4. **Info** (Blue border)
   - Used for: Information, loading states
   - Icon: Info circle
   - Color: `#3b82f6`

5. **Transaction** (VIBES Yellow border)
   - Used for: Blockchain transactions
   - Icon: Clock
   - Color: `var(--vibes-yellow)`
   - Includes "View on Explorer" button
   - Persistent by default (duration: 0)

## Customization

### Changing Default Duration

Edit `src/js/notifications.js`:

```javascript
constructor() {
    // ...
    this.defaultDuration = 5000; // Change to desired milliseconds
    // ...
}
```

### Changing Maximum Notifications

Edit `src/js/notifications.js`:

```javascript
constructor() {
    // ...
    this.maxNotifications = 5; // Change to desired number
    // ...
}
```

### Custom Styling

The notification styles are in `index.html` starting at line 2331. All styles use CSS variables from the VIBES design system:

```css
.notification {
    background: rgba(56, 73, 37, 0.98);
    border: 1px solid rgba(199, 248, 1, 0.2);
    /* ... */
}
```

## Mobile Responsiveness

On mobile devices (screen width < 768px):
- Notifications span the full width (minus 12px margins)
- Positioned at top: 80px (below mobile header)
- Animation changes from horizontal slide to vertical slide
- Touch-optimized close button

## Examples in the App

### Purchase with SOL
```javascript
// Processing
this.showMessage(`Processing purchase of ${amount} SOL...`, 'info');

// Success
notifications.transaction(
    `Successfully purchased VIBES with ${amount} SOL!`,
    signature,
    { title: '🎉 Purchase Successful' }
);

// Error
this.showMessage(`Purchase failed: ${error.message}`, 'error');
```

### Staking Tokens
```javascript
// Processing
this.showMessage('Preparing staking transaction...', 'info');

// Success
notifications.transaction(
    `Successfully staked ${amount} VIBES tokens!`,
    signature,
    { title: '🏦 Staking Successful' }
);
```

### Wallet Connection
```javascript
// Connecting
this.showMessage('Connecting to wallet...', 'info');

// Connected
this.showMessage(`Wallet connected: ${address}`, 'success');

// Disconnected
this.showMessage('Wallet disconnected', 'info');
```

## Best Practices

1. **Use appropriate types**: Match the notification type to the action result
2. **Keep messages concise**: Users should understand the message at a glance
3. **Use transaction notifications for blockchain operations**: Always include the signature
4. **Don't spam**: Avoid showing too many notifications at once
5. **Provide context**: Include relevant details (amounts, addresses, etc.)
6. **Handle errors gracefully**: Show user-friendly error messages, not technical jargon

## Browser Support

The notification system works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Notifications are keyboard accessible
- Close button has proper ARIA label
- Colors meet WCAG contrast requirements
- Animations respect reduced motion preferences (future enhancement)

## Future Enhancements

Potential improvements:
- Sound notifications (optional)
- Notification history/log
- Grouped notifications
- Progress indicators
- Custom notification templates
- Keyboard shortcuts to dismiss
- Respect `prefers-reduced-motion` media query

