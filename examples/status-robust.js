const ThermalPrinter = require('../node-thermal-printer').printer;
const Types = require('../node-thermal-printer').types;
const net = require('net');

// Network diagnostic function
async function testNetworkConnectivity(host, port, timeout = 5000) {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        socket.setTimeout(timeout);

        socket.on('connect', () => {
            console.log(`✅ Network connection to ${host}:${port} successful`);
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            console.log(`⏰ Network connection to ${host}:${port} timed out`);
            socket.destroy();
            resolve(false);
        });

        socket.on('error', (error) => {
            console.log(`❌ Network connection to ${host}:${port} failed: ${error.message}`);
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, host);
    });
}

async function testConnection() {
    const printerIP = '192.168.0.105';
    const printerPort = 9100;

    console.log('🔍 Network Thermal Printer Status Checker');
    console.log('==========================================');
    console.log(`Target: ${printerIP}:${printerPort}`);
    console.log('');

    // Step 1: Basic network connectivity test
    console.log('Step 1: Testing basic network connectivity...');
    const networkOk = await testNetworkConnectivity(printerIP, printerPort, 5000);

    if (!networkOk) {
        console.error('\n❌ Basic network connectivity failed!');
        console.error('Please check:');
        console.error('   - Printer IP address is correct');
        console.error('   - Printer is powered on and connected to network');
        console.error('   - No firewall blocking port 9100');
        console.error('   - Network cables are properly connected');
        console.error('   - Try pinging the printer IP from your computer');
        return;
    }

    // Step 2: Create printer instance with extended timeout
    console.log('\nStep 2: Initializing printer connection...');
    const printer = new ThermalPrinter({
        type: Types.EPSON,
        interface: `tcp://${printerIP}:${printerPort}`,
        options: {
            timeout: 15000, // 15 seconds timeout
            debug: true,    // Enable debug mode
        },
    });

    try {
        // Step 3: Test printer-specific connection
        console.log('Step 3: Testing printer-specific connection...');
        const isConnected = await printer.isPrinterConnected();

        if (!isConnected) {
            console.error('❌ Printer connection test failed!');
            console.error('Network is reachable but printer is not responding properly.');
            console.error('This could mean:');
            console.error('   - Printer is offline or in error state');
            console.error('   - Printer firmware issue');
            console.error('   - Wrong printer type selected');
            console.error('   - Printer is busy processing another job');
            return;
        }

        console.log('✅ Printer connection test successful!');

        // Step 4: Get printer status
        console.log('\nStep 4: Requesting printer status...');
        printer.getStatus();

        const status = await printer.execute({ waitForResponse: true });

        console.log('✅ Printer status received successfully!');
        console.log('Raw status data:', status);
        console.log('Status as hex:', status.toString('hex'));

        // Step 5: Interpret status (basic interpretation for Epson printers)
        console.log('\nStep 5: Interpreting status...');
        if (status.length > 0) {
            const statusByte = status[0];
            console.log('Status byte:', statusByte.toString(2).padStart(8, '0'));

            // Basic Epson status interpretation
            const statusBits = {
                'Paper Status': (statusByte & 0x04) ? 'Paper Near End' : 'Paper OK',
                'Drawer Status': (statusByte & 0x08) ? 'Drawer Open' : 'Drawer Closed',
                'Online Status': (statusByte & 0x10) ? 'Offline' : 'Online',
                'Error Status': (statusByte & 0x20) ? 'Error' : 'No Error',
                'Paper Feed': (statusByte & 0x40) ? 'Paper Feeding' : 'Not Feeding',
                'Ready': (statusByte & 0x80) ? 'Not Ready' : 'Ready'
            };

            console.log('Status interpretation:');
            Object.entries(statusBits).forEach(([key, value]) => {
                const icon = value.includes('OK') || value.includes('Online') || value.includes('Ready') ? '✅' : '⚠️';
                console.log(`   ${icon} ${key}: ${value}`);
            });
        }

    } catch (e) {
        console.error('\n❌ Printer operation failed:', e.message);

        // Enhanced error handling
        switch (e.code) {
            case 'ECONNREFUSED':
                console.error('\n🔧 Connection Refused - Troubleshooting:');
                console.error('   - Printer is not accepting connections on port 9100');
                console.error('   - Check printer network settings');
                console.error('   - Verify printer is not in sleep mode');
                console.error('   - Try restarting the printer');
                break;

            case 'ETIMEDOUT':
                console.error('\n🔧 Connection Timeout - Troubleshooting:');
                console.error('   - Network is slow or congested');
                console.error('   - Printer is busy or processing');
                console.error('   - Try increasing timeout value');
                console.error('   - Check for network interference');
                break;

            case 'ENOTFOUND':
                console.error('\n🔧 Host Not Found - Troubleshooting:');
                console.error('   - DNS resolution failed');
                console.error('   - Check IP address spelling');
                console.error('   - Verify network configuration');
                break;

            default:
                if (e.message === 'Socket timeout') {
                    console.error('\n🔧 Socket Timeout - Troubleshooting:');
                    console.error('   - Printer not responding to commands');
                    console.error('   - Check if printer supports status commands');
                    console.error('   - Verify printer type (EPSON) is correct');
                    console.error('   - Try a simple print test instead');
                } else {
                    console.error('\n🔧 General Error - Troubleshooting:');
                    console.error('   - Check printer documentation');
                    console.error('   - Verify network configuration');
                    console.error('   - Try restarting both printer and computer');
                }
        }
    }
}

// Run the test
testConnection().catch(console.error); 