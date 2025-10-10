# 🧪 Tests Directory

This directory contains test files and scripts for development and debugging purposes.

## Structure

```
tests/
├── html/          # HTML test files for UI components
└── scripts/       # Batch scripts for running tests (Windows)
```

## HTML Test Files

Located in `html/` directory:

### 1. test-mobile-navbar.html
- **Purpose**: Test mobile navigation menu
- **Usage**: Open in browser to test responsive navbar behavior
- **Tests**: Hamburger menu, mobile layout, navigation links

### 2. test-notifications.html
- **Purpose**: Test notification system
- **Usage**: Open in browser to test toast notifications
- **Tests**: Success, error, warning, info notifications

### 3. test-total-raised.html
- **Purpose**: Test total raised calculation and display
- **Usage**: Open in browser to verify dashboard stats
- **Tests**: Presale total raised, formatting, real-time updates

### 4. test-wallet-connection.html
- **Purpose**: Test wallet connection functionality
- **Usage**: Open in browser with Solana wallet installed
- **Tests**: Connect, disconnect, account changes

### 5. test-wallet-dropdown-simple.html
- **Purpose**: Test wallet dropdown menu
- **Usage**: Open in browser to test wallet selector
- **Tests**: Wallet list, selection, styling

## Test Scripts

Located in `scripts/` directory (Windows batch files):

### 1. open-test.bat
- **Purpose**: Quick launcher for test HTML files
- **Usage**: Double-click to run or `./open-test.bat`
- **Action**: Opens default test file in browser

### 2. test-dropdown.bat
- **Purpose**: Launch wallet dropdown test
- **Usage**: Double-click to run
- **Action**: Opens test-wallet-dropdown-simple.html

### 3. test-notifications.bat
- **Purpose**: Launch notification system test
- **Usage**: Double-click to run
- **Action**: Opens test-notifications.html

## Running Tests

### Manual Testing
1. Navigate to `tests/html/`
2. Open any HTML file in a browser
3. Follow on-screen instructions

### Using Batch Scripts (Windows)
```bash
cd tests/scripts
./test-notifications.bat
```

### Using HTTP Server
For better testing with CORS and modules:
```bash
# From project root
npx http-server -p 8080
# Then open http://localhost:8080/tests/html/test-notifications.html
```

## Notes

- ⚠️ Test files are for **development only** - not for production
- 🔧 Some tests require a Solana wallet extension installed
- 📱 Mobile tests should be viewed on different screen sizes
- 🌐 Some features may require a local server (not file://)

## Adding New Tests

To add a new test file:

1. Create HTML file in `tests/html/`
2. Follow naming convention: `test-[feature-name].html`
3. Include necessary dependencies
4. Add documentation here

## Cleanup

Test files can be safely deleted if no longer needed. They don't affect the main application.

---

**Last Updated**: October 10, 2025

