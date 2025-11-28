const ThermalPrinter = require('../node-thermal-printer').printer;
const Types = require('../node-thermal-printer').types;

async function simpleTest() {
    const printer = new ThermalPrinter({
        type: Types.EPSON,
        interface: 'tcp://192.168.8.95',
        options: {
            timeout: 10000,
            debug: true,
        },
    });

    try {
        console.log('🔍 Simple Network Printer Test');
        console.log('==============================');
        console.log('Target: 192.168.8.95:9100');
        console.log('');

        // Test basic connectivity first
        console.log('Step 1: Testing printer connectivity...');
        const isConnected = await printer.isPrinterConnected();

        if (!isConnected) {
            console.error('❌ Printer is not reachable!');
            console.error('Please check your network connection and printer settings.');
            return;
        }

        console.log('✅ Printer is reachable!');

        // Create a simple test receipt
        console.log('\nStep 2: Creating test receipt...');
        printer.alignCenter();
        printer.println('=== TEST RECEIPT ===');
        printer.println('');
        printer.println('Network Printer Test');
        printer.println(`Date: ${new Date().toLocaleString()}`);
        printer.println('');
        printer.alignLeft();
        printer.println('This is a test print to verify');
        printer.println('network connectivity with your');
        printer.println('thermal printer.');
        printer.println('');
        printer.println('If you can see this, your');
        printer.println('printer is working correctly!');
        printer.println('');
        printer.alignCenter();
        printer.println('==================');
        printer.cut();

        // Send to printer
        console.log('Step 3: Sending to printer...');
        await printer.execute();

        console.log('✅ Test print completed successfully!');
        console.log('Check your printer for the test receipt.');

    } catch (e) {
        console.error('❌ Test failed:', e.message);

        if (e.code === 'ECONNREFUSED') {
            console.error('\n🔧 Connection refused. Check:');
            console.error('   - Printer is powered on');
            console.error('   - IP address is correct');
            console.error('   - Port 9100 is not blocked');
        } else if (e.code === 'ETIMEDOUT') {
            console.error('\n🔧 Connection timeout. Check:');
            console.error('   - Network connectivity');
            console.error('   - Printer is not busy');
            console.error('   - Try increasing timeout');
        } else {
            console.error('\n🔧 General error. Check:');
            console.error('   - Printer settings');
            console.error('   - Network configuration');
        }
    }
}

simpleTest(); 