const ThermalPrinter = require('../node-thermal-printer').printer;
const Types = require('../node-thermal-printer').types;

// Example 1: Connect by IP Address (most common)
async function connectByIP() {
    console.log('🔗 Method 1: Connecting by IP Address');
    console.log('=====================================');

    const printer = new ThermalPrinter({
        type: Types.EPSON,
        interface: 'tcp://192.168.0.201:9100',  // Direct IP address
        options: {
            timeout: 10000,
            debug: true,
        },
    });

    try {
        const isConnected = await printer.isPrinterConnected();
        if (isConnected) {
            console.log('✅ Connected by IP successfully!');

            // Test print
            printer.println('=== IP CONNECTION TEST ===');
            printer.println('Connected via: IP Address');
            printer.println('IP: 192.168.1.87');
            printer.println(`Time: ${new Date().toLocaleString()}`);
            printer.cut();

            await printer.execute();
            console.log('✅ Test print completed!');
        } else {
            console.log('❌ Connection failed');
        }
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

// Example 2: Connect by Hostname (if printer has a hostname)
async function connectByHostname() {
    console.log('\n🔗 Method 2: Connecting by Hostname');
    console.log('====================================');

    const printer = new ThermalPrinter({
        type: Types.EPSON,
        interface: 'tcp://thermal-printer.local:9100',  // Hostname
        options: {
            timeout: 10000,
            debug: true,
        },
    });

    try {
        const isConnected = await printer.isPrinterConnected();
        if (isConnected) {
            console.log('✅ Connected by hostname successfully!');

            printer.println('=== HOSTNAME CONNECTION TEST ===');
            printer.println('Connected via: Hostname');
            printer.println('Hostname: thermal-printer.local');
            printer.println(`Time: ${new Date().toLocaleString()}`);
            printer.cut();

            await printer.execute();
            console.log('✅ Test print completed!');
        } else {
            console.log('❌ Connection failed');
        }
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

// Example 3: Connect using different network ranges
async function connectByNetworkRange() {
    console.log('\n🔗 Method 3: Connecting by Network Range');
    console.log('========================================');

    // Common network ranges for printers
    const networkRanges = [
        '192.168.1.87',    // Your current IP
        '192.168.1.100',   // Common printer IP
        '192.168.1.200',   // Alternative printer IP
        '192.168.0.100',   // Different subnet
        '10.0.0.100',      // Class A network
    ];

    for (const ip of networkRanges) {
        console.log(`\nTrying ${ip}...`);

        const printer = new ThermalPrinter({
            type: Types.EPSON,
            interface: `tcp://${ip}:9100`,
            options: {
                timeout: 5000,  // Shorter timeout for scanning
                debug: false,   // Disable debug for cleaner output
            },
        });

        try {
            const isConnected = await printer.isPrinterConnected();
            if (isConnected) {
                console.log(`✅ Found printer at ${ip}!`);

                // Test print
                printer.println('=== NETWORK SCAN TEST ===');
                printer.println('Connected via: Network Scan');
                printer.println(`IP: ${ip}`);
                printer.println(`Time: ${new Date().toLocaleString()}`);
                printer.cut();

                await printer.execute();
                console.log('✅ Test print completed!');
                return; // Found a printer, stop scanning
            }
        } catch (error) {
            // Continue to next IP
        }
    }

    console.log('❌ No printers found in common ranges');
}

// Example 4: Dynamic connection with fallback
async function connectWithFallback() {
    console.log('\n🔗 Method 4: Dynamic Connection with Fallback');
    console.log('=============================================');

    const connectionMethods = [
        {
            name: 'Primary IP',
            interface: 'tcp://192.168.1.87:9100',
            timeout: 10000
        },
        {
            name: 'Alternative IP',
            interface: 'tcp://192.168.1.100:9100',
            timeout: 10000
        },
        {
            name: 'Hostname',
            interface: 'tcp://thermal-printer.local:9100',
            timeout: 10000
        }
    ];

    for (const method of connectionMethods) {
        console.log(`\nTrying ${method.name}...`);

        const printer = new ThermalPrinter({
            type: Types.EPSON,
            interface: method.interface,
            options: {
                timeout: method.timeout,
                debug: true,
            },
        });

        try {
            const isConnected = await printer.isPrinterConnected();
            if (isConnected) {
                console.log(`✅ Connected via ${method.name}!`);

                printer.println('=== FALLBACK CONNECTION TEST ===');
                printer.println(`Connected via: ${method.name}`);
                printer.println(`Interface: ${method.interface}`);
                printer.println(`Time: ${new Date().toLocaleString()}`);
                printer.cut();

                await printer.execute();
                console.log('✅ Test print completed!');
                return; // Success, stop trying
            }
        } catch (error) {
            console.log(`❌ ${method.name} failed: ${error.message}`);
        }
    }

    console.log('❌ All connection methods failed');
}

// Example 5: Connect using environment variables
async function connectByEnvironment() {
    console.log('\n🔗 Method 5: Connecting by Environment Variables');
    console.log('================================================');

    // You can set these environment variables:
    // export PRINTER_IP=192.168.1.87
    // export PRINTER_HOSTNAME=thermal-printer.local
    // export PRINTER_PORT=9100

    const printerIP = process.env.PRINTER_IP || '192.168.1.87';
    const printerHostname = process.env.PRINTER_HOSTNAME;
    const printerPort = process.env.PRINTER_PORT || '9100';

    // Try hostname first if available, then IP
    const interface = printerHostname
        ? `tcp://${printerHostname}:${printerPort}`
        : `tcp://${printerIP}:${printerPort}`;

    console.log(`Using interface: ${interface}`);

    const printer = new ThermalPrinter({
        type: Types.EPSON,
        interface: interface,
        options: {
            timeout: 10000,
            debug: true,
        },
    });

    try {
        const isConnected = await printer.isPrinterConnected();
        if (isConnected) {
            console.log('✅ Connected via environment variables!');

            printer.println('=== ENVIRONMENT CONNECTION TEST ===');
            printer.println('Connected via: Environment Variables');
            printer.println(`Interface: ${interface}`);
            printer.println(`Time: ${new Date().toLocaleString()}`);
            printer.cut();

            await printer.execute();
            console.log('✅ Test print completed!');
        } else {
            console.log('❌ Connection failed');
        }
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

// Main function to run all examples
async function runAllExamples() {
    console.log('🔌 Thermal Printer Ethernet Connection Examples');
    console.log('==============================================');
    console.log('');
    console.log('This script demonstrates different ways to connect');
    console.log('to your thermal printer using various Ethernet identifiers.');
    console.log('');

    // Run examples
    await connectByIP();
    await connectByHostname();
    await connectByNetworkRange();
    await connectWithFallback();
    await connectByEnvironment();

    console.log('\n📋 Summary of Connection Methods:');
    console.log('================================');
    console.log('1. IP Address: tcp://192.168.1.87:9100');
    console.log('2. Hostname: tcp://thermal-printer.local:9100');
    console.log('3. Network Scan: Automatically find printers');
    console.log('4. Fallback: Try multiple methods');
    console.log('5. Environment: Use environment variables');
    console.log('');
    console.log('💡 Tips:');
    console.log('- Use IP address for most reliable connection');
    console.log('- Hostname works if printer supports mDNS/Bonjour');
    console.log('- Network scan is useful for discovery');
    console.log('- Fallback method is good for production use');
    console.log('- Environment variables are good for configuration');
}

// Run if this script is executed directly
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Run all examples
        runAllExamples();
    } else {
        // Run specific example
        const method = args[0];
        switch (method) {
            case 'ip':
                connectByIP();
                break;
            case 'hostname':
                connectByHostname();
                break;
            case 'scan':
                connectByNetworkRange();
                break;
            case 'fallback':
                connectWithFallback();
                break;
            case 'env':
                connectByEnvironment();
                break;
            default:
                console.log('Usage:');
                console.log('  node connect-by-ethernet.js          # Run all examples');
                console.log('  node connect-by-ethernet.js ip       # Connect by IP');
                console.log('  node connect-by-ethernet.js hostname # Connect by hostname');
                console.log('  node connect-by-ethernet.js scan     # Network scan');
                console.log('  node connect-by-ethernet.js fallback # Fallback method');
                console.log('  node connect-by-ethernet.js env      # Environment variables');
        }
    }
}

module.exports = {
    connectByIP,
    connectByHostname,
    connectByNetworkRange,
    connectWithFallback,
    connectByEnvironment
}; 