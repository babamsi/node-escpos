const ThermalPrinter = require('../node-thermal-printer').printer;
const Types = require('../node-thermal-printer').types;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Function to discover network devices
async function discoverNetworkDevices() {
    console.log('🔍 Discovering network devices...');

    try {
        // Use arp-scan to discover devices (Linux/Mac)
        const { stdout } = await execAsync('arp-scan --localnet');
        const lines = stdout.split('\n');
        const devices = [];

        for (const line of lines) {
            // Parse arp-scan output: IP\tMAC\tVendor
            const match = line.match(/^(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F:]+)\s+(.+)$/);
            if (match) {
                devices.push({
                    ip: match[1],
                    mac: match[2],
                    vendor: match[3].trim()
                });
            }
        }

        return devices;
    } catch (error) {
        console.log('arp-scan not available, trying alternative methods...');
        return [];
    }
}

// Function to ping a range of IPs to find printers
async function pingRange(baseIP, start = 1, end = 254) {
    console.log(`🔍 Pinging range ${baseIP}.${start}-${end}...`);
    const reachable = [];

    for (let i = start; i <= end; i++) {
        const ip = `${baseIP}.${i}`;
        try {
            await execAsync(`ping -c 1 -W 1 ${ip}`);
            reachable.push(ip);
            console.log(`✅ Found device at ${ip}`);
        } catch (error) {
            // Device not reachable
        }
    }

    return reachable;
}

// Function to test if a device is a thermal printer
async function testThermalPrinter(ip, port = 9100) {
    return new Promise((resolve) => {
        const net = require('net');
        const socket = new net.Socket();

        socket.setTimeout(3000);

        socket.on('connect', () => {
            console.log(`✅ Found thermal printer at ${ip}:${port}`);
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, ip);
    });
}

// Function to connect using MAC address (requires ARP table)
async function connectByMAC(macAddress) {
    try {
        // Get IP from MAC using arp
        const { stdout } = await execAsync('arp -a');
        const lines = stdout.split('\n');

        for (const line of lines) {
            const match = line.match(/\((\d+\.\d+\.\d+\.\d+)\) at ([0-9a-fA-F:]+)/);
            if (match && match[2].toLowerCase() === macAddress.toLowerCase()) {
                return match[1];
            }
        }

        throw new Error('MAC address not found in ARP table');
    } catch (error) {
        throw new Error(`Could not resolve MAC address: ${error.message}`);
    }
}

// Function to connect using hostname
async function connectByHostname(hostname) {
    try {
        const { stdout } = await execAsync(`nslookup ${hostname}`);
        const match = stdout.match(/Address:\s*(\d+\.\d+\.\d+\.\d+)/);
        if (match) {
            return match[1];
        }
        throw new Error('Hostname not found');
    } catch (error) {
        throw new Error(`Could not resolve hostname: ${error.message}`);
    }
}

// Main function to discover and test printers
async function discoverAndTest() {
    console.log('🔍 Thermal Printer Network Discovery');
    console.log('====================================');

    // Method 1: Scan common printer IPs
    console.log('\nMethod 1: Scanning common printer IPs...');
    const commonIPs = [
        '192.168.1.87',  // Your current IP
        '192.168.1.100',
        '192.168.1.101',
        '192.168.1.200',
        '192.168.1.201',
        '192.168.0.100',
        '192.168.0.101',
        '10.0.0.100',
        '10.0.0.101'
    ];

    const foundPrinters = [];

    for (const ip of commonIPs) {
        if (await testThermalPrinter(ip)) {
            foundPrinters.push({ ip, method: 'common IP' });
        }
    }

    // Method 2: Scan local network range
    console.log('\nMethod 2: Scanning local network range...');
    const localIPs = await pingRange('192.168.1', 80, 120);

    for (const ip of localIPs) {
        if (await testThermalPrinter(ip)) {
            foundPrinters.push({ ip, method: 'network scan' });
        }
    }

    // Method 3: Discover network devices
    console.log('\nMethod 3: Discovering network devices...');
    const devices = await discoverNetworkDevices();

    for (const device of devices) {
        if (await testThermalPrinter(device.ip)) {
            foundPrinters.push({
                ip: device.ip,
                mac: device.mac,
                vendor: device.vendor,
                method: 'device discovery'
            });
        }
    }

    // Display results
    console.log('\n📋 Discovery Results:');
    console.log('=====================');

    if (foundPrinters.length === 0) {
        console.log('❌ No thermal printers found on the network');
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Check if printer is powered on');
        console.log('   - Verify printer is connected to network');
        console.log('   - Try manual IP configuration');
        console.log('   - Check printer documentation for default IP');
        return;
    }

    foundPrinters.forEach((printer, index) => {
        console.log(`\n${index + 1}. Printer found via ${printer.method}:`);
        console.log(`   IP: ${printer.ip}`);
        if (printer.mac) console.log(`   MAC: ${printer.mac}`);
        if (printer.vendor) console.log(`   Vendor: ${printer.vendor}`);
    });

    // Test connection to first found printer
    if (foundPrinters.length > 0) {
        const firstPrinter = foundPrinters[0];
        console.log(`\n🧪 Testing connection to ${firstPrinter.ip}...`);

        try {
            const printer = new ThermalPrinter({
                type: Types.EPSON,
                interface: `tcp://${firstPrinter.ip}:9100`,
                options: {
                    timeout: 10000,
                    debug: true,
                },
            });

            const isConnected = await printer.isPrinterConnected();
            if (isConnected) {
                console.log('✅ Connection successful!');
                console.log('\n📝 Example connection code:');
                console.log(`const printer = new ThermalPrinter({`);
                console.log(`  type: Types.EPSON,`);
                console.log(`  interface: 'tcp://${firstPrinter.ip}:9100',`);
                console.log(`  options: { timeout: 10000, debug: true },`);
                console.log(`});`);
            } else {
                console.log('❌ Connection failed');
            }
        } catch (error) {
            console.log(`❌ Connection failed: ${error.message}`);
        }
    }
}

// Function to connect using specific identifier
async function connectByIdentifier(identifier, type = 'ip') {
    console.log(`🔗 Connecting using ${type}: ${identifier}`);

    let ip;

    try {
        switch (type) {
            case 'mac':
                ip = await connectByMAC(identifier);
                break;
            case 'hostname':
                ip = await connectByHostname(identifier);
                break;
            case 'ip':
                ip = identifier;
                break;
            default:
                throw new Error(`Unknown identifier type: ${type}`);
        }

        console.log(`Resolved IP: ${ip}`);

        const printer = new ThermalPrinter({
            type: Types.EPSON,
            interface: `tcp://${ip}:9100`,
            options: {
                timeout: 10000,
                debug: true,
            },
        });

        const isConnected = await printer.isPrinterConnected();
        if (isConnected) {
            console.log('✅ Connection successful!');

            // Test print
            printer.println('=== ETHERNET TEST ===');
            printer.println(`Connected via: ${type}`);
            printer.println(`Identifier: ${identifier}`);
            printer.println(`IP: ${ip}`);
            printer.println(`Time: ${new Date().toLocaleString()}`);
            printer.cut();

            await printer.execute();
            console.log('✅ Test print completed!');
        } else {
            console.log('❌ Connection failed');
        }

    } catch (error) {
        console.error(`❌ Connection failed: ${error.message}`);
    }
}

// Export functions for use in other scripts
module.exports = {
    discoverAndTest,
    connectByIdentifier,
    testThermalPrinter
};

// Run discovery if this script is executed directly
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // No arguments - run discovery
        discoverAndTest();
    } else if (args.length >= 2) {
        // Arguments provided - connect by identifier
        const [identifier, type = 'ip'] = args;
        connectByIdentifier(identifier, type);
    } else {
        console.log('Usage:');
        console.log('  node ethernet-discovery.js                    # Discover printers');
        console.log('  node ethernet-discovery.js 192.168.1.87      # Connect by IP');
        console.log('  node ethernet-discovery.js 00:11:22:33:44:55 mac  # Connect by MAC');
        console.log('  node ethernet-discovery.js printer-hostname hostname  # Connect by hostname');
    }
} 